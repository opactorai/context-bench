/**
 * Workspace initialization and management
 */

import fs from 'fs-extra';
import path from 'path';
import { ScenarioSpec } from './types.js';
import { PATHS } from './constants.js';
import { resolveEnvVars } from './validator.js';
import { Logger } from './logger.js';

/**
 * Initialize workspace from scaffold template
 */
export async function initWorkspace(
  scenario: ScenarioSpec,
  workspaceDir: string,
  logger: Logger
): Promise<void> {
  logger.info('Copying scaffold-template to workspace/');

  // Clean workspace
  if (fs.existsSync(workspaceDir)) {
    fs.removeSync(workspaceDir);
  }

  // Copy scaffold template
  fs.copySync(PATHS.SCAFFOLD_TEMPLATE_DIR, workspaceDir);

  // Set file permissions (logic.ts writable, others read-only if needed)
  const logicPath = path.join(workspaceDir, 'app', 'logic.ts');
  if (fs.existsSync(logicPath)) {
    fs.chmodSync(logicPath, 0o644);
  }

  // Inject environment variables
  if (scenario.env_vars) {
    const envVars = resolveEnvVars(scenario.env_vars);
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const envPath = path.join(workspaceDir, '.env');
    fs.writeFileSync(envPath, envContent);
    logger.info(`Environment variables written to ${envPath}`);
  }

  logger.info('Setting file permissions');
  logger.info('Workspace initialization complete');
}

/**
 * Clean workspace directory
 */
export function cleanWorkspace(workspaceDir: string, logger: Logger): void {
  if (fs.existsSync(workspaceDir)) {
    fs.removeSync(workspaceDir);
    logger.info(`Removed workspace: ${workspaceDir}`);
  }
}

/**
 * Get editable paths for the scenario
 */
export function getEditablePaths(scenario: ScenarioSpec): string[] {
  return scenario.constraints?.editable_paths || ['app/logic.ts', 'package.json'];
}
