/**
 * MCP configuration resolver
 * Resolves environment variable templates in MCP server configs
 */

import { MCPConfig, MCPServerConfig } from './types.js';

/**
 * Resolve environment variable templates in a string
 */
function resolveEnvTemplate(template: string): string {
  // Match ${VAR_NAME} patterns
  return template.replace(/\$\{(\w+)\}/g, (match, varName) => {
    const value = process.env[varName];
    if (!value) {
      throw new Error(`Environment variable ${varName} is not set (required for MCP config)`);
    }
    return value;
  });
}

/**
 * Resolve environment variables in MCP server config
 */
function resolveMcpServerConfig(config: MCPServerConfig): MCPServerConfig {
  const resolved = { ...config };

  // Resolve env variables in headers (for HTTP/SSE)
  if ('headers' in resolved && resolved.headers) {
    const resolvedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolved.headers)) {
      resolvedHeaders[key] = resolveEnvTemplate(value);
    }
    resolved.headers = resolvedHeaders;
  }

  // Resolve env variables in env object (for stdio)
  if ('env' in resolved && resolved.env) {
    const resolvedEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(resolved.env)) {
      resolvedEnv[key] = resolveEnvTemplate(value);
    }
    resolved.env = resolvedEnv;
  }

  // Resolve URL template (for HTTP/SSE)
  if ('url' in resolved && resolved.url && typeof resolved.url === 'string') {
    resolved.url = resolveEnvTemplate(resolved.url);
  }

  return resolved;
}

/**
 * Resolve all environment variable templates in MCP config
 */
export function resolveMcpConfig(config: MCPConfig): MCPConfig {
  const resolved: MCPConfig = {
    ...config,
    mcp_servers: {}
  };

  for (const [serverName, serverConfig] of Object.entries(config.mcp_servers)) {
    try {
      resolved.mcp_servers[serverName] = resolveMcpServerConfig(serverConfig);
    } catch (error: any) {
      throw new Error(`Failed to resolve MCP server '${serverName}': ${error.message}`);
    }
  }

  return resolved;
}

/**
 * Validate that all required environment variables for MCP config are set
 */
export function validateMcpEnv(config: MCPConfig): {
  valid: boolean;
  missing: string[];
} {
  const missing = new Set<string>();

  for (const [serverName, serverConfig] of Object.entries(config.mcp_servers)) {
    // Check headers
    if ('headers' in serverConfig && serverConfig.headers) {
      for (const value of Object.values(serverConfig.headers)) {
        if (typeof value === 'string') {
          const matches = value.matchAll(/\$\{(\w+)\}/g);
          for (const match of matches) {
            const varName = match[1];
            if (!process.env[varName]) {
              missing.add(varName);
            }
          }
        }
      }
    }

    // Check env
    if ('env' in serverConfig && serverConfig.env) {
      for (const value of Object.values(serverConfig.env)) {
        if (typeof value === 'string') {
          const matches = value.matchAll(/\$\{(\w+)\}/g);
          for (const match of matches) {
            const varName = match[1];
            if (!process.env[varName]) {
              missing.add(varName);
            }
          }
        }
      }
    }

    // Check URL
    if ('url' in serverConfig && serverConfig.url && typeof serverConfig.url === 'string') {
      const matches = serverConfig.url.matchAll(/\$\{(\w+)\}/g);
      for (const match of matches) {
        const varName = match[1];
        if (!process.env[varName]) {
          missing.add(varName);
        }
      }
    }
  }

  return {
    valid: missing.size === 0,
    missing: Array.from(missing)
  };
}
