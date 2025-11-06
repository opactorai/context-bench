/**
 * Claude Code SDK agent runner
 * Real implementation using @anthropic-ai/claude-agent-sdk
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { get_encoding } from 'tiktoken';
import { MCPConfig, ScenarioSpec } from './types.js';
import { Logger, appendJsonl } from './logger.js';
import { resolveMcpConfig, validateMcpEnv } from './mcp-resolver.js';
import { PATHS } from './constants.js';
import path from 'path';
import fs from 'fs-extra';
import { readFile } from 'fs/promises';

export interface AgentStats {
  turns: number;
  tool_calls: number;
  elapsed_ms: number;
  mcp_stats?: {
    total_calls: number;
    total_elapsed_ms: number;
    total_input_tokens: number;
    total_output_tokens: number;
  };
}

/**
 * Invoke Claude Code agent to implement the scenario
 */
export async function runAgent(
  scenario: ScenarioSpec,
  config: MCPConfig,
  workspaceDir: string,
  logger: Logger,
  timeout: number
): Promise<AgentStats> {
  logger.marker('>>>>> Invoking Agent');
  logger.info(`Agent prompt: ${scenario.agent_prompt.length} chars`);
  logger.info(`Working directory: ${workspaceDir}`);
  logger.info(`MCP servers: ${Object.keys(config.mcp_servers).join(', ') || 'none'}`);

  const startTime = Date.now();

  // Verify API key
  if (!process.env.CLAUDE_CODE_OAUTH_TOKEN) {
    throw new Error('CLAUDE_CODE_OAUTH_TOKEN environment variable not set');
  }

  // Track MCP calls if MCP servers are configured
  const mcpCalls: Array<{
    timestamp: string;
    tool: string;
    tool_use_id: string;
    input: any;
    output?: any;
    error?: string;
    duration_ms?: number;
  }> = [];
  const hasMcpServers = Object.keys(config.mcp_servers).length > 0;

  // Validate and resolve MCP configuration
  const mcpValidation = validateMcpEnv(config);
  if (!mcpValidation.valid) {
    logger.error(`Missing MCP environment variables: ${mcpValidation.missing.join(', ')}`);
    logger.info('Tip: Add these to your .env file or export them in your shell');
    throw new Error(`Missing required MCP environment variables: ${mcpValidation.missing.join(', ')}`);
  }

  // Resolve environment variable templates in MCP config
  const resolvedConfig = resolveMcpConfig(config);
  logger.info(`MCP config resolved successfully`);

  // Get editable paths
  const editablePaths = scenario.constraints?.editable_paths || ['app/logic.ts', 'package.json'];
  logger.info(`Editable paths: ${editablePaths.join(', ')}`);

  // Track statistics
  let turnCount = 0;
  let toolCallCount = 0;

  try {
    // Build MCP-specific instructions if MCP servers are configured
    const mcpServerNames = Object.keys(resolvedConfig.mcp_servers);
    let mcpInstructions = '';

    if (mcpServerNames.length > 0) {
      // Create "use Context7", "use DeepCon", etc. format
      const useStatements = mcpServerNames
        .map(name => {
          // Capitalize first letter of each word
          const capitalized = name
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
          return `use ${capitalized}`;
        })
        .join(', ');

      mcpInstructions = `\n\nREQUIRED: ${useStatements.toUpperCase()} to gather comprehensive information:
- Search official documentation thoroughly
- Find ALL relevant API endpoint examples
- Confirm authentication methods and required credentials
- Retrieve multiple code samples and usage patterns
- Verify API versions, schemas, and data formats
- Explore related APIs and features

CRITICAL INFORMATION GATHERING WORKFLOW:
1. FIRST: Use MCP tools extensively to search and collect information
2. EXPLORE: Check multiple documentation sources, examples, and API references
3. VERIFY: Confirm every detail through documentation (parameters, endpoints, field names, etc.)
4. DOCUMENT: Keep track of what information you've gathered
5. IMPLEMENT: Only after thorough information collection, begin implementation

DO NOT rely on your own knowledge or make assumptions:
- ALWAYS search the official documentation using MCP tools FIRST and EXTENSIVELY
- Call MCP tools MULTIPLE TIMES to explore different aspects of the API
- Gather information about edge cases, error handling, and best practices
- The more information you collect via MCP, the better your implementation will be`;
    }

    // Build project environment context
    let projectContext = `\n\n# Project Environment\n\n`;
    projectContext += `**Package Type**: ES Module (package.json has "type": "module")\n`;
    projectContext += `**Module System**: You MUST use ES Module syntax:\n`;
    projectContext += `  - Use \`import\` statements (NOT \`require()\`)\n`;
    projectContext += `  - Use \`export\` statements (NOT \`module.exports\`)\n`;
    projectContext += `  - All imports must be at the TOP of the file\n`;
    projectContext += `\n**TypeScript**: ES2022 target, strict mode enabled\n`;
    projectContext += `**Build**: Run \`npm run build\` (uses tsc) to compile TypeScript\n`;

    // Read scaffold files to show Agent the initial state
    const fs = await import('fs-extra');
    const scaffoldDir = await import('./constants.js').then(m => m.PATHS.SCAFFOLD_TEMPLATE_DIR);

    projectContext += `\n\n## Initial File Contents\n\n`;

    // Show package.json
    try {
      const packageJson = await readFile(`${scaffoldDir}/package.json`, 'utf-8');
      projectContext += `### package.json (initial)\n\`\`\`json\n${packageJson}\n\`\`\`\n\n`;
    } catch (e) {
      // File doesn't exist, skip
    }

    // Show app/logic.ts
    try {
      const logicTs = await readFile(`${scaffoldDir}/app/logic.ts`, 'utf-8');
      projectContext += `### app/logic.ts (template - implement the execute function)\n\`\`\`typescript\n${logicTs}\n\`\`\`\n\n`;
    } catch (e) {
      // File doesn't exist, skip
    }

    // Show app/main.ts (read-only, for reference)
    try {
      const mainTs = await readFile(`${scaffoldDir}/app/main.ts`, 'utf-8');
      projectContext += `### app/main.ts (DO NOT EDIT - for reference only)\n\`\`\`typescript\n${mainTs}\n\`\`\`\n\n`;
    } catch (e) {
      // File doesn't exist, skip
    }

    // Read the full scenario YAML file
    // scenario.id format: "package-id:scenario-id"
    // YAML file format: "scenarios/package-id.yaml"
    const packageId = scenario.id.split(':')[0];
    const scenarioFilePath = path.join(PATHS.SCENARIOS_DIR, `${packageId}.yaml`);
    const scenarioYamlContent = await readFile(scenarioFilePath, 'utf-8');

    // Build scenario specification context with full YAML
    let scenarioContext = `\n\n# Scenario Specification\n\n`;
    scenarioContext += `Please implement the following scenario based on the complete specification below.\n\n`;
    scenarioContext += `\`\`\`yaml\n${scenarioYamlContent}\n\`\`\`\n\n`;
    scenarioContext += `**Important**: Follow ALL requirements in the \`agent_prompt\` section and ensure your implementation meets the \`validation_criteria\`.\n`;

    // Combine all contexts
    const fullPrompt = `${projectContext}${scenarioContext}`;

    // Create agent query with MCP servers and configuration
    const result = query({
      prompt: fullPrompt,
      options: {
        cwd: workspaceDir,
        mcpServers: resolvedConfig.mcp_servers,
        allowedTools: [
          'Read',
          'Write',
          'Edit',
          'Glob',
          'Glep',
          'TodoWrite',
        ],
        disallowedTools: [
          'WebSearch',
          'WebFetch',
          'Skill',
          'Bash(curl :*)',
          'Bash(wget :*)',
          'Bash(fetch :*)',
          'Bash(http :*)',
          'Bash(https :*)',
          'Bash(http-get :*)',
          'Bash(http-post :*)',
          'Bash(http-put :*)',
          'Bash(http-delete :*)',
          'Bash(ls -la ../*)',
          'SlashCommand',
          'Task'
        ],
        permissionMode: 'bypassPermissions', // Auto-approve for benchmark
        systemPrompt: {
          type: 'preset',
          preset: 'claude_code',
          append: `\n\nIMPORTANT CONSTRAINTS:\n- You may ONLY edit these files: ${editablePaths.join(', ')}\n- Work in directory: ${workspaceDir}\n- ALL implementation must be in the execute() function in app/logic.ts\n- Use ES Module syntax: import/export (NOT require/module.exports)\n- All imports must be at the top of the file, NOT inside functions\n- After making changes, run 'npm install' if you added packages\n- The output must match the exact schema specified in the prompt\n- DO NOT generate fake, placeholder, or hardcoded data for output fields. All data must come directly from actual API responses or reflect actual parameters used\n\nBASH TOOL RESTRICTIONS:\n- You can ONLY use these Bash commands: 'npm run build', 'npm install', 'npm test', 'ls', 'rm'\n- Network requests are NOT allowed (no curl, wget, http requests, or any network operations)\n- DO NOT attempt to use curl, wget, fetch, or any other network tools\n- All API calls must be made in your TypeScript code, not via command line tools\n\nBUILD VERIFICATION:\n- ALWAYS run 'npm run build' after implementing your code to verify it compiles without errors\n- Fix any TypeScript compilation errors that occur during the build\n- CRITICAL: While fixing build errors, you MUST maintain all scenario requirements and functionality\n- DO NOT remove or simplify code logic just to fix build errors - fix the actual type issues instead${mcpInstructions}`
        },
        maxTurns: 50,
        includePartialMessages: false,
      }
    });

    // Process messages as they stream
    logger.info('Agent conversation started...');

    for await (const message of result) {
      // Log different message types
      switch (message.type) {
        case 'system':
          if (message.subtype === 'init') {
            logger.info(`Session ID: ${message.session_id}`);
            logger.info(`Model: ${message.model}`);
            logger.info(`Tools available: ${message.tools.length}`);
          }
          break;

        case 'user':
          turnCount++;
          logger.marker('>>>>> Agent Thinking');

          // Check for tool results in user messages
          if (hasMcpServers && message.message?.content) {
            for (const block of message.message.content) {
              // Type guard for tool_result blocks
              if (typeof block !== 'string' && 'type' in block && block.type === 'tool_result') {
                const mcpCall = mcpCalls.find(call =>
                  'tool_use_id' in block && call.tool_use_id === block.tool_use_id
                );
                if (mcpCall && !mcpCall.output && !mcpCall.error) {
                  const isError = 'is_error' in block && block.is_error;
                  const content = 'content' in block ? block.content : undefined;

                  if (isError) {
                    mcpCall.error = typeof content === 'string'
                      ? content
                      : JSON.stringify(content);
                  } else {
                    mcpCall.output = content;
                  }
                  const callStart = new Date(mcpCall.timestamp).getTime();
                  mcpCall.duration_ms = Date.now() - callStart;
                }
              }
            }
          }
          break;

        case 'assistant':
          // Process all content blocks in this message
          if (message.message.content) {
            for (const block of message.message.content) {
              if (block.type === 'tool_use') {
                toolCallCount++;
                logger.marker(`>>>>> Agent Tool Use: ${block.name}`);

                // Track MCP tool calls
                if (hasMcpServers && block.name.startsWith('mcp__')) {
                  mcpCalls.push({
                    timestamp: new Date().toISOString(),
                    tool: block.name,
                    tool_use_id: block.id,
                    input: block.input,
                  });
                }

                // Log tool use with more context
                if (block.name === 'Write' || block.name === 'Edit') {
                  const filePath = block.input.file_path || '';
                  logger.info(`✏️  ${block.name}: ${filePath}`);
                } else if (block.name === 'Bash') {
                  logger.info(`⚙️  Bash: ${block.input.command?.substring(0, 60)}...`);
                } else {
                  logger.info(`🔧 Tool: ${block.name}`);
                }

                // Log to JSONL for detailed analysis
                appendJsonl(
                  path.dirname(logger['logFile']),
                  'agent_tools.jsonl',
                  {
                    tool: block.name,
                    tool_use_id: block.id,
                    input: block.input
                  }
                );
              }
            }
          }
          break;

        case 'result':
          const elapsed = Date.now() - startTime;

          if (message.subtype === 'success') {
            logger.marker('>>>>> Agent Completed');
            logger.info(`Result: ${message.result}`);
            logger.info(`Total turns: ${message.num_turns}`);
            logger.info(`Duration: ${(message.duration_ms / 1000).toFixed(1)}s`);
            logger.info(`API duration: ${(message.duration_api_ms / 1000).toFixed(1)}s`);
            logger.info(`Cost: $${message.total_cost_usd.toFixed(4)}`);
            logger.info(`Input tokens: ${message.usage.input_tokens}`);
            logger.info(`Output tokens: ${message.usage.output_tokens}`);

            if (message.usage.cache_read_input_tokens) {
              logger.info(`Cache read tokens: ${message.usage.cache_read_input_tokens}`);
            }

            // Calculate MCP statistics and save results if MCP was used
            let mcpStats = undefined;
            if (hasMcpServers && mcpCalls.length > 0) {
              mcpStats = calculateMcpStats(mcpCalls, logger);
              await saveMcpResults(workspaceDir, mcpCalls, config, logger);
            }

            return {
              turns: message.num_turns,
              tool_calls: toolCallCount,
              elapsed_ms: elapsed,
              mcp_stats: mcpStats,
            };
          } else {
            logger.marker('>>>>> Agent Failed');
            logger.error(`Error: ${message.subtype}`);
            logger.error(`Total turns: ${message.num_turns}`);

            throw new Error(`Agent failed: ${message.subtype}`);
          }
          break;
      }
    }

    // If we get here without a result, something went wrong
    throw new Error('Agent query completed without result message');

  } catch (error: any) {
    const elapsed = Date.now() - startTime;

    logger.marker('>>>>> Agent Failed');
    logger.error(`Error: ${error.message}`);
    logger.error(error.stack || '');

    throw error;
  }
}

/**
 * Count tokens in MCP data using tiktoken
 */
function countMcpTokens(
  data: any,
  logger: Logger
): number {
  try {
    // Extract text content from MCP data
    let textContent = '';

    if (Array.isArray(data)) {
      // MCP returns array of content blocks
      for (const block of data) {
        if (block.type === 'text' && block.text) {
          textContent += block.text;
        }
      }
    } else if (typeof data === 'string') {
      textContent = data;
    } else if (data && typeof data === 'object') {
      textContent = JSON.stringify(data);
    }

    if (!textContent) {
      return 0;
    }

    // Use tiktoken with cl100k_base encoding (used by GPT-4 and Claude)
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(textContent);
    const tokenCount = tokens.length;
    encoding.free(); // Free memory

    return tokenCount;
  } catch (error: any) {
    logger.warn(`Failed to count MCP tokens: ${error.message}`);
    return 0;
  }
}

/**
 * Calculate MCP statistics from MCP calls
 */
function calculateMcpStats(
  mcpCalls: Array<{
    timestamp: string;
    tool: string;
    tool_use_id: string;
    input: any;
    output?: any;
    error?: string;
    duration_ms?: number;
  }>,
  logger: Logger
): { total_calls: number; total_elapsed_ms: number; total_input_tokens: number; total_output_tokens: number } {
  const total_calls = mcpCalls.length;
  const total_elapsed_ms = mcpCalls.reduce((sum, call) => sum + (call.duration_ms || 0), 0);

  // Count tokens for all MCP inputs and outputs
  let total_input_tokens = 0;
  let total_output_tokens = 0;

  for (const call of mcpCalls) {
    // Count input tokens
    if (call.input) {
      const inputTokens = countMcpTokens(call.input, logger);
      total_input_tokens += inputTokens;
    }

    // Count output tokens
    if (call.output) {
      const outputTokens = countMcpTokens(call.output, logger);
      total_output_tokens += outputTokens;
    }
  }

  logger.info(`MCP Stats: ${total_calls} calls, ${total_elapsed_ms}ms total, ${total_input_tokens} input tokens, ${total_output_tokens} output tokens`);

  return {
    total_calls,
    total_elapsed_ms,
    total_input_tokens,
    total_output_tokens
  };
}

/**
 * Save MCP call results to workspace
 */
async function saveMcpResults(
  workspaceDir: string,
  mcpCalls: Array<{
    timestamp: string;
    tool: string;
    tool_use_id: string;
    input: any;
    output?: any;
    error?: string;
    duration_ms?: number;
  }>,
  config: MCPConfig,
  logger: Logger
): Promise<void> {
  const mcpDir = path.join(workspaceDir, 'mcp_results');
  await fs.ensureDir(mcpDir);

  // Create summary markdown
  let summary = `# MCP Tool Calls Summary\n\n`;
  summary += `**Configuration**: ${config.config_name}\n`;
  summary += `**MCP Servers**: ${Object.keys(config.mcp_servers).join(', ')}\n`;
  summary += `**Total Calls**: ${mcpCalls.length}\n`;
  summary += `**Generated**: ${new Date().toISOString()}\n\n`;

  summary += `---\n\n`;

  // Group calls by tool
  const callsByTool = mcpCalls.reduce((acc, call) => {
    if (!acc[call.tool]) acc[call.tool] = [];
    acc[call.tool].push(call);
    return acc;
  }, {} as Record<string, typeof mcpCalls>);

  // Write summary
  summary += `## Calls by Tool\n\n`;
  for (const [tool, calls] of Object.entries(callsByTool)) {
    summary += `### ${tool} (${calls.length} calls)\n\n`;

    calls.forEach((call, idx) => {
      summary += `#### Call ${idx + 1}\n\n`;
      summary += `**Timestamp**: ${call.timestamp}\n`;
      if (call.duration_ms) {
        summary += `**Duration**: ${call.duration_ms}ms\n`;
      }
      summary += `\n**Input**:\n\`\`\`json\n${JSON.stringify(call.input, null, 2)}\n\`\`\`\n\n`;

      if (call.error) {
        summary += `**Error**:\n\`\`\`\n${call.error}\n\`\`\`\n\n`;
      } else if (call.output) {
        const outputStr = typeof call.output === 'string'
          ? call.output
          : JSON.stringify(call.output, null, 2);
        summary += `**Output**:\n\`\`\`\n${outputStr}\n\`\`\`\n\n`;
      } else {
        summary += `**Output**: _(No response captured)_\n\n`;
      }

      summary += `---\n\n`;
    });
  }

  // Write summary file
  const summaryPath = path.join(mcpDir, 'summary.md');
  await fs.writeFile(summaryPath, summary);
  logger.info(`MCP results saved to ${mcpDir}/summary.md`);

  // Write JSON for programmatic analysis
  const jsonPath = path.join(mcpDir, 'calls.json');
  await fs.writeJson(jsonPath, {
    config: config.config_name,
    servers: Object.keys(config.mcp_servers),
    total_calls: mcpCalls.length,
    calls: mcpCalls,
    generated_at: new Date().toISOString()
  }, { spaces: 2 });
  logger.info(`MCP calls JSON saved to ${mcpDir}/calls.json`);

  // Write individual markdown files for each call
  for (let i = 0; i < mcpCalls.length; i++) {
    const call = mcpCalls[i];
    const callNum = i + 1;
    const callFilePath = path.join(mcpDir, `call_${callNum}.md`);

    let callMd = `# MCP Call ${callNum}\n\n`;
    callMd += `**Tool**: ${call.tool}\n`;
    callMd += `**Timestamp**: ${call.timestamp}\n`;
    callMd += `**Tool Use ID**: ${call.tool_use_id}\n`;
    if (call.duration_ms) {
      callMd += `**Duration**: ${call.duration_ms}ms\n`;
    }
    callMd += `\n---\n\n`;

    callMd += `## Input\n\n\`\`\`json\n${JSON.stringify(call.input, null, 2)}\n\`\`\`\n\n`;

    callMd += `## Output\n\n`;

    if (call.error) {
      callMd += `**Error occurred:**\n\n\`\`\`\n${call.error}\n\`\`\`\n`;
    } else if (call.output) {
      // Extract text from output if it's an array with text blocks
      let outputText = '';

      if (Array.isArray(call.output)) {
        // Output is an array of blocks with type and text
        for (const block of call.output) {
          if (block.type === 'text' && block.text) {
            outputText += block.text + '\n\n';
          }
        }
      } else if (typeof call.output === 'string') {
        outputText = call.output;
      } else if (typeof call.output === 'object' && call.output.text) {
        outputText = call.output.text;
      } else {
        // Fallback: stringify the whole output
        outputText = JSON.stringify(call.output, null, 2);
      }

      callMd += outputText.trim() + '\n';
    } else {
      callMd += `_(No response captured)_\n`;
    }

    await fs.writeFile(callFilePath, callMd);
    logger.info(`MCP call ${callNum} saved to ${mcpDir}/call_${callNum}.md`);
  }
}
