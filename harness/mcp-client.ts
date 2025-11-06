/**
 * Simple MCP Client for connecting to MCP servers
 *
 * Usage:
 *   const client = new SimpleMCPClient(serverConfig);
 *   await client.connect();
 *   const result = await client.callTool('tool_name', { param: 'value' });
 *   await client.disconnect();
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { MCPServerConfig } from './types.js';

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPToolResult {
  content: any;
  isError?: boolean;
}

/**
 * Simple MCP Client wrapper
 */
export class SimpleMCPClient {
  private client: Client;
  private transport: StdioClientTransport | null = null;
  private config: MCPServerConfig;
  private connected: boolean = false;

  constructor(config: MCPServerConfig) {
    this.config = config;

    // Create MCP client
    this.client = new Client(
      {
        name: 'context-bench-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    // Resolve environment variables in config
    const resolvedEnv: Record<string, string> = {};
    if (this.config.env) {
      for (const [key, value] of Object.entries(this.config.env)) {
        resolvedEnv[key] = this.resolveEnvVar(value);
      }
    }

    // Create stdio transport
    this.transport = new StdioClientTransport({
      command: this.config.command,
      args: this.config.args,
      env: {
        ...process.env as Record<string, string>,
        ...resolvedEnv,
      } as Record<string, string>,
    });

    // Connect client to transport
    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    if (this.transport) {
      await this.client.close();
      this.connected = false;
      this.transport = null;
    }
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any[]> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    const response = await this.client.listTools();
    return response.tools || [];
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args: Record<string, any>): Promise<MCPToolResult> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      const response = await this.client.callTool({
        name,
        arguments: args,
      });

      return {
        content: response.content,
        isError: response.isError === true,
      };
    } catch (error: any) {
      return {
        content: error.message,
        isError: true,
      };
    }
  }

  /**
   * List available resources (if supported by server)
   */
  async listResources(): Promise<any[]> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      const response = await this.client.listResources();
      return response.resources || [];
    } catch (error: any) {
      // Server may not support resources
      if (error.message?.includes('Method not found')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    const response = await this.client.readResource({ uri });
    return response.contents;
  }

  /**
   * List available prompts (if supported by server)
   */
  async listPrompts(): Promise<any[]> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    try {
      const response = await this.client.listPrompts();
      return response.prompts || [];
    } catch (error: any) {
      // Server may not support prompts
      if (error.message?.includes('Method not found')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args?: Record<string, string>): Promise<any> {
    if (!this.connected) {
      throw new Error('Client not connected. Call connect() first.');
    }

    const response = await this.client.getPrompt({
      name,
      arguments: args,
    });

    return response.messages;
  }

  /**
   * Resolve environment variable template
   */
  private resolveEnvVar(value: string): string {
    // Match ${VAR_NAME} pattern
    const match = value.match(/^\$\{(.+)\}$/);
    if (match) {
      const envVar = match[1];
      return process.env[envVar] || '';
    }
    return value;
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Helper function to create and connect to an MCP server
 */
export async function connectToMCPServer(config: MCPServerConfig): Promise<SimpleMCPClient> {
  const client = new SimpleMCPClient(config);
  await client.connect();
  return client;
}

/**
 * MCP Client Manager
 * Manages multiple MCP server connections from a config
 */
export class MCPClientManager {
  private clients: Map<string, SimpleMCPClient> = new Map();
  private connected: boolean = false;

  constructor(private mcpServers: Record<string, MCPServerConfig>) {}

  /**
   * Connect to all MCP servers
   */
  async connectAll(): Promise<Map<string, { success: boolean; error?: string }>> {
    if (this.connected) {
      return new Map();
    }

    const results = new Map<string, { success: boolean; error?: string }>();

    const connectionPromises = Object.entries(this.mcpServers).map(
      async ([serverName, serverConfig]) => {
        try {
          const client = new SimpleMCPClient(serverConfig);
          await client.connect();
          this.clients.set(serverName, client);
          results.set(serverName, { success: true });
          return { serverName, success: true };
        } catch (error: any) {
          const errorMsg = error.message || String(error);
          console.error(`Failed to connect to MCP server '${serverName}': ${errorMsg}`);
          results.set(serverName, { success: false, error: errorMsg });
          return { serverName, success: false, error: errorMsg };
        }
      }
    );

    await Promise.all(connectionPromises);
    this.connected = true;
    return results;
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnectAll(): Promise<void> {
    if (!this.connected) {
      return;
    }

    const disconnectionPromises = Array.from(this.clients.values()).map(
      client => client.disconnect()
    );

    await Promise.all(disconnectionPromises);
    this.clients.clear();
    this.connected = false;
  }

  /**
   * Get a specific MCP client by server name
   */
  getClient(serverName: string): SimpleMCPClient | undefined {
    return this.clients.get(serverName);
  }

  /**
   * Get all connected server names
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Check if a specific server is connected
   */
  isServerConnected(serverName: string): boolean {
    const client = this.clients.get(serverName);
    return client?.isConnected() ?? false;
  }

  /**
   * Call a tool on a specific MCP server
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, any>
  ): Promise<MCPToolResult> {
    const client = this.clients.get(serverName);

    if (!client) {
      return {
        content: `MCP server '${serverName}' not found or not connected`,
        isError: true,
      };
    }

    return client.callTool(toolName, args);
  }

  /**
   * List all available tools from all connected servers
   */
  async listAllTools(): Promise<Record<string, any[]>> {
    const toolsMap: Record<string, any[]> = {};

    for (const [serverName, client] of this.clients.entries()) {
      try {
        const tools = await client.listTools();
        toolsMap[serverName] = tools;
      } catch (error: any) {
        console.error(`Failed to list tools for '${serverName}': ${error.message}`);
        toolsMap[serverName] = [];
      }
    }

    return toolsMap;
  }

  /**
   * Check if manager is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Load MCP clients from a config file
 * @param configName - Name of the config file (without .json extension)
 * @returns MCPClientManager instance
 */
export async function loadMCPClientsFromConfig(
  configName: string
): Promise<MCPClientManager> {
  // Import config loader dynamically to avoid circular dependencies
  const { loadConfig } = await import('./config-loader.js');
  const { resolveMcpConfig, validateMcpEnv } = await import('./mcp-resolver.js');

  // Load config
  const config = loadConfig(configName);

  // Validate environment variables
  const validation = validateMcpEnv(config);
  if (!validation.valid) {
    throw new Error(
      `Missing required environment variables for MCP config '${configName}': ${validation.missing.join(', ')}`
    );
  }

  // Resolve environment variable templates
  const resolvedConfig = resolveMcpConfig(config);

  // Create manager
  const manager = new MCPClientManager(resolvedConfig.mcp_servers);

  return manager;
}

/**
 * Load and connect to MCP clients from a config file
 * @param configName - Name of the config file (without .json extension)
 * @returns Connected MCPClientManager instance
 */
export async function connectMCPClientsFromConfig(
  configName: string
): Promise<MCPClientManager> {
  const manager = await loadMCPClientsFromConfig(configName);
  await manager.connectAll();
  return manager;
}
