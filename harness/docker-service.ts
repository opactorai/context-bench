/**
 * Docker service wrapper for running and testing scenarios
 */

import Dockerode from 'dockerode';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Logger } from './logger.js';
import { DEFAULTS } from './constants.js';
import { PortManager } from './port-manager.js';

const execAsync = promisify(exec);

const docker = new Dockerode();
const portManager = PortManager.getInstance();

export interface ServiceHandle {
  containerId: string;
  port: number;
}

/**
 * Build Docker image for workspace
 */
export async function buildImage(
  workspaceDir: string,
  imageName: string,
  logger: Logger
): Promise<void> {
  logger.marker('>>>>> Building Service');
  logger.info(`Building Docker image: ${imageName}`);

  // Ensure Dockerfile exists
  const dockerfilePath = path.join(workspaceDir, 'Dockerfile');
  if (!fs.existsSync(dockerfilePath)) {
    throw new Error(`Dockerfile not found: ${dockerfilePath}`);
  }

  // Build image using docker build command
  const buildCmd = `docker build -t ${imageName} ${workspaceDir}`;
  logger.info(`Running: ${buildCmd}`);

  try {
    const { stdout, stderr } = await execAsync(buildCmd);
    logger.info('Build output:');
    logger.info(stdout);
    if (stderr) {
      logger.info('Build stderr:');
      logger.info(stderr);
    }
    logger.marker('>>>>> Build Complete');
  } catch (error: any) {
    logger.marker('>>>>> Build Failed');
    logger.error(`Build failed: ${error.message}`);
    logger.error(error.stdout || '');
    logger.error(error.stderr || '');
    throw error;
  }
}

/**
 * Start service container
 */
export async function startService(
  imageName: string,
  logger: Logger,
  envVars?: Record<string, string>
): Promise<ServiceHandle> {
  logger.marker('>>>>> Starting Service');
  logger.info(`Starting container from image: ${imageName}`);

  let containerId: string | undefined;
  let assignedPort: number | undefined;
  let tempId: string | undefined;

  try {
    // Check port pool status
    const portStatus = portManager.getStatus();
    logger.info(`Port pool status: ${portStatus.allocated}/${portStatus.total} allocated, ${portStatus.available} available`);

    // Allocate port from pool (3010-3090) with temporary ID
    tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    assignedPort = await portManager.allocatePort(tempId);
    logger.info(`Allocated port ${assignedPort} from pool (verified system availability)`);

    // Prepare environment variables for container
    const containerEnv: string[] = [];
    if (envVars) {
      for (const [key, value] of Object.entries(envVars)) {
        containerEnv.push(`${key}=${value}`);
        // Log env var (mask sensitive values)
        const displayValue = key.includes('TOKEN') || key.includes('KEY')
          ? value.substring(0, 8) + '...'
          : value;
        logger.info(`  ${key}=${displayValue}`);
      }
      logger.info(`Injecting ${containerEnv.length} environment variables`);
    }

    // Create container with allocated port
    const container = await docker.createContainer({
      Image: imageName,
      ExposedPorts: {
        '3000/tcp': {},
      },
      Env: containerEnv,
      HostConfig: {
        PortBindings: {
          '3000/tcp': [{ HostPort: assignedPort.toString() }],
        },
        AutoRemove: false, // Manual cleanup to ensure port release
      },
    });

    containerId = container.id;

    // Update port allocation with actual container ID
    await portManager.reassignPort(tempId, containerId);
    tempId = undefined; // Clear temp ID after successful re-allocation
    logger.info(`Container created: ${containerId.substring(0, 12)} on port ${assignedPort}`);

    // Start container
    await container.start();
    logger.info(`Container started successfully`);

    // Wait for service to be ready
    await waitForService(assignedPort, DEFAULTS.SERVICE_STARTUP_TIMEOUT_MS, logger);

    logger.marker('>>>>> Service Ready');

    return {
      containerId,
      port: assignedPort,
    };
  } catch (error: any) {
    // Cleanup on error
    logger.error(`Failed to start service: ${error.message}`);

    if (containerId) {
      // Container was created, clean it up and release port
      await portManager.releasePort(containerId);

      try {
        await docker.getContainer(containerId).remove({ force: true });
        logger.info('Removed failed container');
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    } else if (tempId) {
      // Port was allocated but container creation failed
      await portManager.releasePort(tempId);
      logger.info(`Released port ${assignedPort} (allocation failed)`);
    }

    logger.marker('>>>>> Service Start Failed');
    throw error;
  }
}

/**
 * Wait for service to respond
 */
async function waitForService(
  port: number,
  timeoutMs: number,
  logger: Logger
): Promise<void> {
  const startTime = Date.now();
  const url = `http://localhost:${port}/health`;

  logger.info(`Waiting for service health check at ${url}`);

  let lastError: any = null;
  let healthEndpointExists = false;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url);
      healthEndpointExists = true;

      if (response.ok) {
        logger.info('Service health check passed');
        return;
      }

      // Got a response but not OK - log status
      lastError = new Error(`Health check returned status ${response.status}`);
    } catch (error: any) {
      // Service not ready yet or health endpoint doesn't exist
      lastError = error;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Timeout reached
  if (!healthEndpointExists) {
    // Health endpoint never responded - maybe it doesn't exist
    logger.warn('Health endpoint never responded, assuming service is ready');
    logger.info('Waiting 2s for service startup...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    // Health endpoint exists but never returned OK
    const elapsed = Date.now() - startTime;
    logger.error(`Service health check failed after ${elapsed}ms`);
    if (lastError) {
      logger.error(`Last error: ${lastError.message}`);
    }
    throw new Error(`Service failed to become healthy within ${timeoutMs}ms`);
  }
}

/**
 * Stop service container and release port
 */
export async function stopService(
  handle: ServiceHandle,
  logger: Logger
): Promise<void> {
  logger.info(`Stopping container: ${handle.containerId.substring(0, 12)}`);

  try {
    const container = docker.getContainer(handle.containerId);
    await container.stop();
    await container.remove();
    logger.info('Container stopped and removed');
  } catch (error: any) {
    logger.error(`Failed to stop container: ${error.message}`);
  } finally {
    // Always release port, even if stop/remove failed
    await portManager.releasePort(handle.containerId);
    logger.info(`Released port ${handle.port} back to pool`);
  }
}

/**
 * Clean up Docker resources
 */
export async function cleanupDocker(imageName: string, logger: Logger): Promise<void> {
  logger.info(`Cleaning up Docker image: ${imageName}`);

  try {
    const image = docker.getImage(imageName);
    await image.remove({ force: true });
    logger.info('Image removed');
  } catch (error: any) {
    logger.error(`Failed to remove image: ${error.message}`);
  }
}
