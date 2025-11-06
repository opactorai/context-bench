/**
 * MCP configuration loader
 */

import fs from 'fs-extra';
import path from 'path';
import { MCPConfig } from './types.js';
import { PATHS } from './constants.js';

/**
 * Load MCP configuration from JSON file
 */
export function loadConfig(configName: string): MCPConfig {
  const configPath = path.join(PATHS.CONFIGS_DIR, `${configName}.json`);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Config not found: ${configPath}`);
  }

  const content = fs.readFileSync(configPath, 'utf-8');
  const config = JSON.parse(content) as MCPConfig;

  // Validate required fields
  if (!config.config_name || !config.description || !config.mcp_servers) {
    throw new Error(`Invalid config: ${configName} - missing required fields`);
  }

  return config;
}

/**
 * List all available configurations
 */
export function listConfigs(): MCPConfig[] {
  const configsDir = PATHS.CONFIGS_DIR;

  if (!fs.existsSync(configsDir)) {
    return [];
  }

  const files = fs.readdirSync(configsDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const configName = path.basename(f, '.json');
    return loadConfig(configName);
  });
}

/**
 * Get config names from configs directory
 */
export function getConfigNames(): string[] {
  const configs = listConfigs();
  return configs.map(c => c.config_name);
}
