/**
 * MCP Helper - Utility for easily using all MCP servers
 */

import { SimpleMCPClient } from './mcp-client.js';
import { MCPServerConfig } from './types.js';

/**
 * Supported MCP server types
 */
export type MCPServerType = 'nia' | 'exa' | 'context7' | 'firecrawl' | 'deepcon';

/**
 * All MCP server configurations
 */
export const MCP_SERVER_CONFIGS: Record<MCPServerType, MCPServerConfig> = {
  nia: {
    command: 'pipx',
    args: ['run', '--no-cache', 'nia-mcp-server'],
    env: {
      NIA_API_KEY: '${NIA_API_KEY}',
      NIA_API_URL: 'https://apigcp.trynia.ai/',
    },
  },
  exa: {
    command: 'npx',
    args: ['-y', 'exa-mcp-server'],
    env: {
      EXA_API_KEY: '${EXA_API_KEY}',
    },
  },
  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    env: {
      CONTEXT7_API_KEY: '${CONTEXT7_API_KEY}',
    },
  },
  firecrawl: {
    command: 'npx',
    args: ['-y', 'firecrawl-mcp'],
    env: {
      FIRECRAWL_API_KEY: '${FIRECRAWL_API_KEY}',
    },
  },
  deepcon: {
    command: 'npx',
    args: ['-y', 'deepcon-mcp'],
    env: {
      DEEPCON_API_KEY: '${DEEPCON_API_KEY}',
    },
  },
};

/**
 * Helper function to connect to an MCP server
 *
 * @param serverType Server type ('nia', 'exa', 'context7', 'firecrawl', 'deepcon')
 * @returns Connected SimpleMCPClient
 *
 * @example
 * ```typescript
 * // Connect to NIA
 * const nia = await connectMCP('nia');
 * const result = await nia.callTool('search_documentation', {
 *   query: 'React hooks',
 *   sources: ['uuid']
 * });
 * await nia.disconnect();
 * ```
 */
export async function connectMCP(serverType: MCPServerType): Promise<SimpleMCPClient> {
  const config = MCP_SERVER_CONFIGS[serverType];
  const client = new SimpleMCPClient(config);
  await client.connect();
  return client;
}

/**
 * Helper function to connect to multiple MCP servers simultaneously
 *
 * @param serverTypes Array of server types
 * @returns Map of connected clients
 *
 * @example
 * ```typescript
 * // Connect to 3 servers simultaneously
 * const clients = await connectMultipleMCP(['nia', 'exa', 'context7']);
 *
 * // Usage
 * const niaResult = await clients.nia.callTool('...');
 * const exaResult = await clients.exa.callTool('...');
 *
 * // Disconnect all
 * await disconnectAll(clients);
 * ```
 */
export async function connectMultipleMCP(
  serverTypes: MCPServerType[]
): Promise<Record<MCPServerType, SimpleMCPClient>> {
  const clients: Partial<Record<MCPServerType, SimpleMCPClient>> = {};

  await Promise.all(
    serverTypes.map(async (type) => {
      clients[type] = await connectMCP(type);
    })
  );

  return clients as Record<MCPServerType, SimpleMCPClient>;
}

/**
 * Helper function to disconnect all clients
 *
 * @param clients Client map or array
 */
export async function disconnectAll(
  clients: Record<string, SimpleMCPClient> | SimpleMCPClient[]
): Promise<void> {
  const clientArray = Array.isArray(clients) ? clients : Object.values(clients);

  await Promise.all(
    clientArray.map(async (client) => {
      try {
        await client.disconnect();
      } catch (error) {
        // Ignore disconnect errors
      }
    })
  );
}

/**
 * Get MCP server configuration
 *
 * @param serverType Server type
 * @returns Server configuration
 */
export function getMCPConfig(serverType: MCPServerType): MCPServerConfig {
  return MCP_SERVER_CONFIGS[serverType];
}

/**
 * List all available MCP servers
 */
export function listMCPServers(): MCPServerType[] {
  return Object.keys(MCP_SERVER_CONFIGS) as MCPServerType[];
}
