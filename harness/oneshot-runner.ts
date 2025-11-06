/**
 * Oneshot runner - Single MCP tool call execution
 * Maps MCP servers to specific tools with predefined parameters
 */

import { MCPConfig, ScenarioSpec } from './types.js';
import { Logger } from './logger.js';
import { MCPClientManager } from './mcp-client.js';
import { resolveMcpConfig, validateMcpEnv } from './mcp-resolver.js';
import { parseScenarioId, loadPackage } from './scenario-loader.js';
import path from 'path';
import fs from 'fs-extra';

export interface OneshotStats {
  tool_calls: number;
  elapsed_ms: number;
  result_md: string;
  mcp_tool_used?: string;
  mcp_server_used?: string;
}

/**
 * MCP Server tool mappings and parameter builders
 */
interface MCPToolMapping {
  serverName: string;
  toolName: string;
  fallbackToolName?: string;  // For NIA fallback
  buildParams: (scenario: ScenarioSpec, packageId: string, registry?: string, context7Id?: string, deepconId?: string) => Record<string, any>;
  buildFallbackParams?: (scenario: ScenarioSpec, packageId: string) => Record<string, any>;  // For fallback with different params
}

/**
 * Package-specific documentation fallback mappings for NIA
 * Maps package IDs to their documentation sources (UUID or URL)
 */
const NIA_DOC_FALLBACK_MAP: Record<string, string> = {
  'autogen': '5cc05f18-2f15-4046-885d-4dd9cb4c5f59',  // Autogen documentation UUID
  'openrouter-sdk': 'https://openrouter.ai/docs',      // OpenRouter documentation URL
};

const MCP_MAPPINGS: Record<string, MCPToolMapping> = {
  'nia': {
    serverName: 'nia',
    toolName: 'nia_package_search_hybrid',
    fallbackToolName: 'search_documentation',
    buildParams: (scenario, packageId, registry, context7Id, deepconId) => ({
      registry: registry || 'npm',
      package_name: packageId,
      semantic_queries: [scenario.agent_prompt],
    }),
    buildFallbackParams: (scenario, packageId) => {
      const docSource = NIA_DOC_FALLBACK_MAP[packageId];
      if (!docSource) {
        throw new Error(`No documentation fallback mapping found for package: ${packageId}`);
      }
      return {
        query: scenario.agent_prompt,
        sources: [docSource],
      };
    },
  },
  'deepcon': {
    serverName: 'deepcon',
    toolName: 'search_documentation',
    buildParams: (scenario, packageId, registry, context7Id, deepconId) => ({
      name: deepconId || packageId,  // Prefer deepcon-id if available
      language: scenario.runtime?.language || 'typescript',
      query: scenario.agent_prompt,
    }),
  },
  'exa': {
    serverName: 'exa',
    toolName: 'get_code_context_exa',
    buildParams: (scenario, packageId, registry, context7Id, deepconId) => ({
      query: scenario.agent_prompt,
    }),
  },
  'context7': {
    serverName: 'context7',
    toolName: 'get-library-docs',
    buildParams: (scenario, packageId, registry, context7Id, deepconId) => ({
      context7CompatibleLibraryID: context7Id || packageId,
      topic: scenario.agent_prompt,
    }),
  },
};

/**
 * Run oneshot mode: Single MCP tool call based on MCP server type
 */
export async function runOneshot(
  scenario: ScenarioSpec,
  config: MCPConfig,
  workspaceDir: string,
  logger: Logger,
  timeout: number,
  sharedMcpManager?: MCPClientManager
): Promise<OneshotStats> {
  logger.marker('>>>>> Oneshot Mode: Single Tool Call');
  logger.info(`Scenario: ${scenario.id}`);
  logger.info(`Query: ${scenario.agent_prompt.substring(0, 100)}...`);
  logger.info(`MCP Config: ${config.config_name}`);

  const startTime = Date.now();

  // Validate MCP environment
  const mcpValidation = validateMcpEnv(config);
  if (!mcpValidation.valid) {
    logger.error(`Missing MCP environment variables: ${mcpValidation.missing.join(', ')}`);
    throw new Error(`Missing required MCP environment variables: ${mcpValidation.missing.join(', ')}`);
  }

  // Resolve MCP config
  const resolvedConfig = resolveMcpConfig(config);
  logger.info(`MCP config resolved successfully`);

  // Parse scenario ID to get package info
  const parsed = parseScenarioId(scenario.id);
  if (!parsed) {
    throw new Error(`Invalid scenario ID format: ${scenario.id}`);
  }

  // Load package spec for additional metadata
  let packageSpec;
  let registry: string | undefined;
  let context7Id: string | undefined;
  let deepconId: string | undefined;

  try {
    packageSpec = loadPackage(parsed.packageId);
    registry = (packageSpec as any).registry;
    context7Id = (packageSpec as any)['context7-id'];
    deepconId = (packageSpec as any)['deepcon-id'];
    logger.info(`Package loaded: ${parsed.packageId} (registry: ${registry || 'N/A'})`);
  } catch (error: any) {
    logger.warn(`Could not load package spec: ${error.message}`);
  }

  // Determine which MCP server to use based on config name
  let mcpMapping: MCPToolMapping | undefined;

  // Match config name to MCP server (nia, deepcon, exa, context7)
  for (const [key, mapping] of Object.entries(MCP_MAPPINGS)) {
    if (config.config_name.toLowerCase().includes(key)) {
      mcpMapping = mapping;
      break;
    }
  }

  if (!mcpMapping) {
    throw new Error(`No MCP mapping found for config: ${config.config_name}. Expected one of: nia, deepcon, exa, context7`);
  }

  logger.info(`Using MCP mapping: ${mcpMapping.serverName}`);

  // Connect to MCP servers (use shared manager if provided for parallel execution)
  let mcpManager: MCPClientManager;
  let shouldDisconnect = false;

  if (sharedMcpManager) {
    // Reuse shared MCP manager (parallel execution)
    mcpManager = sharedMcpManager;
    logger.info('Using shared MCP client manager');
  } else {
    // Create new MCP manager (sequential execution)
    mcpManager = new MCPClientManager(resolvedConfig.mcp_servers);
    shouldDisconnect = true;

    logger.info('Connecting to MCP servers...');
    const connectionResults = await mcpManager.connectAll();
    const connectedServers = mcpManager.getConnectedServers();
    logger.info(`Connected to ${connectedServers.length} MCP servers: ${connectedServers.join(', ')}`);

    // Log connection failures
    for (const [serverName, result] of connectionResults.entries()) {
      if (!result.success) {
        logger.warn(`MCP server '${serverName}' failed to connect: ${result.error}`);
      }
    }
  }

  try {
    // Check if the required server is connected
    if (!mcpManager.isServerConnected(mcpMapping.serverName)) {
      const connectedServers = mcpManager.getConnectedServers();
      throw new Error(`Required MCP server '${mcpMapping.serverName}' is not connected. Available: ${connectedServers.join(', ')}`);
    }

    // Build parameters for the tool call
    const toolParams = mcpMapping.buildParams(scenario, parsed.packageId, registry, context7Id, deepconId);

    logger.marker(`>>>>> Calling MCP Tool: ${mcpMapping.toolName} on ${mcpMapping.serverName}`);
    logger.info(`Tool parameters: ${JSON.stringify(toolParams, null, 2)}`);

    // Call the MCP tool
    let toolResult = await mcpManager.callTool(mcpMapping.serverName, mcpMapping.toolName, toolParams);

    // Check if content contains error message (some MCP servers don't set isError flag)
    const hasErrorInContent = (result: any): boolean => {
      if (typeof result.content === 'string') {
        return result.content.includes('❌ Error') || result.content.includes('Server error');
      }
      if (Array.isArray(result.content)) {
        return result.content.some(block =>
          block.type === 'text' && block.text &&
          (block.text.includes('❌ Error') || block.text.includes('Server error'))
        );
      }
      return false;
    };

    const shouldFallback = toolResult.isError || hasErrorInContent(toolResult);

    // For NIA: If primary tool fails, try fallback with documentation search
    if (mcpMapping.serverName === 'nia' && shouldFallback && mcpMapping.fallbackToolName) {
      logger.warn(`Primary tool '${mcpMapping.toolName}' failed: ${typeof toolResult.content === 'string' ? toolResult.content : JSON.stringify(toolResult.content)}`);

      if (mcpMapping.buildFallbackParams) {
        try {
          const fallbackParams = mcpMapping.buildFallbackParams(scenario, parsed.packageId);
          logger.info(`Trying fallback: ${mcpMapping.fallbackToolName} with documentation source: ${fallbackParams.sources?.[0]}`);
          toolResult = await mcpManager.callTool(mcpMapping.serverName, mcpMapping.fallbackToolName, fallbackParams);
        } catch (fallbackError: any) {
          logger.error(`Fallback parameter building failed: ${fallbackError.message}`);
          // Keep the original error result
        }
      } else {
        logger.warn(`No fallback parameter builder available, using original params`);
        toolResult = await mcpManager.callTool(mcpMapping.serverName, mcpMapping.fallbackToolName, toolParams);
      }
    }

    logger.info(`Tool call completed (error: ${toolResult.isError || false})`);

    // Format result as markdown
    let resultMd = `# Oneshot Mode Result\n\n`;
    resultMd += `**Scenario**: ${scenario.id}\n`;
    resultMd += `**Package**: ${parsed.packageId}\n`;
    if (registry) resultMd += `**Registry**: ${registry}\n`;
    if (context7Id) resultMd += `**Context7 ID**: ${context7Id}\n`;
    resultMd += `**MCP Server**: ${mcpMapping.serverName}\n`;
    resultMd += `**Tool Called**: ${mcpMapping.toolName}\n`;
    resultMd += `**Timestamp**: ${new Date().toISOString()}\n\n`;
    resultMd += `---\n\n`;
    resultMd += `## Query\n\n${scenario.agent_prompt}\n\n`;
    resultMd += `---\n\n`;
    resultMd += `## Tool Input\n\n\`\`\`json\n${JSON.stringify(toolParams, null, 2)}\n\`\`\`\n\n`;
    resultMd += `---\n\n`;
    resultMd += `## Tool Result\n\n`;

    if (toolResult.isError) {
      resultMd += `**Error**: ${toolResult.content}\n`;
    } else {
      // Extract text from content
      let contentText = '';
      if (Array.isArray(toolResult.content)) {
        for (const block of toolResult.content) {
          if (block.type === 'text' && block.text) {
            contentText += block.text + '\n\n';
          }
        }
      } else if (typeof toolResult.content === 'string') {
        contentText = toolResult.content;
      } else {
        contentText = JSON.stringify(toolResult.content, null, 2);
      }
      resultMd += contentText.trim() + '\n';
    }

    // Save result to workspace
    const resultPath = path.join(workspaceDir, 'oneshot_result.md');
    await fs.writeFile(resultPath, resultMd);
    logger.info(`Oneshot result saved to ${resultPath}`);

    const elapsed = Date.now() - startTime;

    logger.marker('>>>>> Oneshot Completed');
    logger.info(`Tool called: ${mcpMapping.toolName}`);
    logger.info(`Duration: ${(elapsed / 1000).toFixed(1)}s`);

    return {
      tool_calls: 1,
      elapsed_ms: elapsed,
      result_md: resultMd,
      mcp_tool_used: mcpMapping.toolName,
      mcp_server_used: mcpMapping.serverName,
    };

  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    logger.marker('>>>>> Oneshot Failed');
    logger.error(`Error: ${error.message}`);
    logger.error(error.stack || '');
    throw error;
  } finally {
    // Disconnect only if we created a new manager (not shared)
    if (shouldDisconnect) {
      logger.info('Disconnecting from MCP servers...');
      await mcpManager.disconnectAll();
      logger.info('Disconnected');
    }
  }
}
