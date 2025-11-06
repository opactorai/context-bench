/**
 * Parallel execution runner with worker pool
 * Based on SWE-bench ThreadPoolExecutor pattern
 */

import { RunContext, ScenarioReport } from './types.js';
import { runScenario } from './run-scenario.js';
import { MCPClientManager } from './mcp-client.js';
import { resolveMcpConfig } from './mcp-resolver.js';
import chalk from 'chalk';

export interface ParallelRunnerOptions {
  maxWorkers: number;
  verbose: boolean;
}

export interface TaskResult {
  scenarioId: string;
  config: string;
  success: boolean;
  report?: ScenarioReport;
  error?: string;
}

interface WorkerState {
  workerId: number;
  scenarioId: string;
  config: string;
  stage: string;
  startTime: number;
}

/**
 * Run multiple scenarios in parallel with a worker pool
 */
export async function runParallel(
  contexts: RunContext[],
  options: ParallelRunnerOptions
): Promise<TaskResult[]> {
  const { maxWorkers, verbose } = options;

  const results: TaskResult[] = [];
  const queue = [...contexts];
  const active = new Map<number, Promise<TaskResult>>();
  const workerStates = new Map<number, WorkerState>();

  let completed = 0;
  const total = contexts.length;
  let progressInterval: NodeJS.Timeout | null = null;

  // Create shared MCP client manager for oneshot mode (if any oneshot contexts exist)
  let sharedMcpManager: MCPClientManager | undefined;
  const oneshotContexts = contexts.filter(c => c.mode === 'oneshot');

  if (oneshotContexts.length > 0) {
    // Get config from first oneshot context
    const firstConfig = oneshotContexts[0].config;
    const resolvedConfig = resolveMcpConfig(firstConfig);

    console.log(chalk.cyan(`Creating shared MCP client for ${oneshotContexts.length} oneshot scenario(s)...`));
    sharedMcpManager = new MCPClientManager(resolvedConfig.mcp_servers);

    try {
      const connectionResults = await sharedMcpManager.connectAll();
      const connectedServers = sharedMcpManager.getConnectedServers();
      console.log(chalk.green(`✓ Connected to ${connectedServers.length} MCP servers: ${connectedServers.join(', ')}`));

      // Log connection failures
      for (const [serverName, result] of connectionResults.entries()) {
        if (!result.success) {
          console.log(chalk.yellow(`⚠ MCP server '${serverName}' failed to connect: ${result.error}`));
        }
      }
    } catch (error: any) {
      console.log(chalk.red(`✗ Failed to connect to MCP servers: ${error.message}`));
      sharedMcpManager = undefined;
    }

    // Inject shared manager into all oneshot contexts
    for (const ctx of oneshotContexts) {
      ctx.sharedMcpManager = sharedMcpManager;
    }
  }

  // Display progress function
  const displayProgress = () => {
    if (verbose) return; // Don't show progress bar in verbose mode

    const states = Array.from(workerStates.values());
    if (states.length === 0) return;

    // Clear previous lines (workers + 3 header lines)
    const linesToClear = states.length + 3;
    for (let i = 0; i < linesToClear; i++) {
      process.stdout.write('\x1b[1A\x1b[2K'); // Move up and clear line
    }

    // Print header
    console.log(chalk.cyan('\n┌─ Running Workers ─────────────────────────────────────────┐'));

    // Print each worker state
    for (const state of states) {
      const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
      const elapsedStr = `${elapsed}s`.padEnd(5);
      const scenarioStr = state.scenarioId.padEnd(20);
      const stageStr = state.stage.padEnd(15);

      console.log(
        chalk.gray(`│ [Worker ${state.workerId}] `) +
        chalk.white(scenarioStr) +
        chalk.yellow(stageStr) +
        chalk.gray(` ${elapsedStr}`)
      );
    }

    console.log(chalk.cyan(`└─ Completed: ${completed}/${total} ──────────────────────────────────────┘`));
  };

  // Start progress display timer (update every 2 seconds)
  if (!verbose) {
    // Print initial placeholder
    console.log('\n\n\n'); // Reserve space
    progressInterval = setInterval(displayProgress, 2000);
  }

  // Worker function with progress tracking
  const runWorker = async (workerId: number, context: RunContext): Promise<TaskResult> => {
    const { scenario, config } = context;

    // Initialize worker state
    workerStates.set(workerId, {
      workerId,
      scenarioId: scenario.id,
      config: config.config_name,
      stage: 'Starting',
      startTime: Date.now(),
    });

    // Progress callback to update stage
    const updateStage = (stage: string) => {
      const state = workerStates.get(workerId);
      if (state) {
        state.stage = stage;
      }
    };

    // Add progress callback to context
    (context as any).onProgress = updateStage;

    if (verbose) {
      console.log(
        chalk.gray(`[Worker ${workerId}] Starting: ${scenario.id} (${config.config_name})`)
      );
    }

    try {
      const report = await runScenario(context);

      // Remove from active workers
      workerStates.delete(workerId);

      completed++;

      // Clear progress display before printing result
      if (!verbose && progressInterval) {
        const states = Array.from(workerStates.values());
        const linesToClear = states.length + 4; // +4 for header and result line
        for (let i = 0; i < linesToClear; i++) {
          process.stdout.write('\x1b[1A\x1b[2K');
        }
      }

      const isPassed = report.pass_rate === 1.0;
      const statusIcon = isPassed ? '✅' : '❌';
      const statusLabel = isPassed ? 'PASSED' : 'FAILED';
      const statusColor = isPassed ? chalk.green : chalk.red;

      console.log(
        statusColor(
          `[${completed}/${total}] ${statusIcon} ${scenario.id} (${config.config_name}): ${report.passed}/${report.total} passed (${statusLabel})`
        )
      );

      // Re-display progress
      if (!verbose) displayProgress();

      return {
        scenarioId: scenario.id,
        config: config.config_name,
        success: isPassed,
        report,
      };
    } catch (error: any) {
      workerStates.delete(workerId);
      completed++;

      // Clear progress display before printing error
      if (!verbose && progressInterval) {
        const states = Array.from(workerStates.values());
        const linesToClear = states.length + 4;
        for (let i = 0; i < linesToClear; i++) {
          process.stdout.write('\x1b[1A\x1b[2K');
        }
      }

      console.log(
        chalk.red(
          `[${completed}/${total}] ✗ ${scenario.id} (${config.config_name}): ERROR - ${error.message}`
        )
      );

      // Re-display progress
      if (!verbose) displayProgress();

      return {
        scenarioId: scenario.id,
        config: config.config_name,
        success: false,
        error: error.message,
      };
    }
  };

  // Start initial workers
  let workerId = 0;
  while (active.size < maxWorkers && queue.length > 0) {
    const context = queue.shift()!;
    const promise = runWorker(workerId++, context);
    active.set(workerId, promise);
  }

  // Process queue
  while (active.size > 0) {
    // Wait for any worker to complete
    // Create a map of promises with their IDs for tracking
    const promiseToId = new Map<Promise<TaskResult>, number>();
    for (const [id, promise] of active.entries()) {
      promiseToId.set(promise, id);
    }

    // Race all active promises
    const completedPromise = await Promise.race(
      Array.from(active.entries()).map(([id, promise]) =>
        promise.then(result => ({ id, result }))
      )
    );

    results.push(completedPromise.result);
    active.delete(completedPromise.id);

    // Start new worker if queue not empty
    if (queue.length > 0) {
      const context = queue.shift()!;
      const promise = runWorker(workerId++, context);
      active.set(workerId, promise);
    }
  }

  // Stop progress display
  if (progressInterval) {
    clearInterval(progressInterval);

    // Clear final progress display
    const linesToClear = maxWorkers + 3;
    for (let i = 0; i < linesToClear; i++) {
      process.stdout.write('\x1b[1A\x1b[2K');
    }
  }

  // Cleanup shared MCP client
  if (sharedMcpManager) {
    console.log(chalk.cyan('\nDisconnecting shared MCP client...'));
    try {
      await sharedMcpManager.disconnectAll();
      console.log(chalk.green('✓ Shared MCP client disconnected'));
    } catch (error: any) {
      console.log(chalk.yellow(`⚠ Failed to disconnect MCP client: ${error.message}`));
    }
  }

  return results;
}

/**
 * Create run contexts for all scenario×config combinations
 */
export function createRunContexts(
  scenarioIds: string[],
  configNames: string[],
  runId: string,
  mode: 'oneshot' | 'agent',
  timeout: number,
  verbose: boolean,
  keepWorkspace: boolean,
  loadScenario: (id: string) => any,
  loadConfig: (name: string) => any
): RunContext[] {
  const contexts: RunContext[] = [];

  for (const configName of configNames) {
    const config = loadConfig(configName);

    for (const scenarioId of scenarioIds) {
      const scenario = loadScenario(scenarioId);

      const context: RunContext = {
        scenario,
        config,
        mode,
        runId,
        workspaceDir: `workspace/${runId}/${mode}/${configName}/${scenarioId}`,
        logDir: `logs/run_evaluation/${runId}/${mode}/${configName}/${scenarioId}`,
        timeout,
        verbose,
        keepWorkspace,
        isParallel: true,
      };

      contexts.push(context);
    }
  }

  return contexts;
}

/**
 * Print parallel execution summary
 */
export function printParallelSummary(results: TaskResult[]) {
  console.log('\n' + chalk.blue('━'.repeat(80)));
  console.log(chalk.bold('PARALLEL EXECUTION SUMMARY'));
  console.log(chalk.blue('━'.repeat(80)) + '\n');

  const totalScenarios = results.length;
  const successfulScenarios = results.filter(r => r.success).length;
  const failedScenarios = totalScenarios - successfulScenarios;

  console.log(`Total scenarios: ${totalScenarios}`);
  console.log(chalk.green(`Successful: ${successfulScenarios}`));

  if (failedScenarios > 0) {
    console.log(chalk.red(`Failed: ${failedScenarios}`));

    console.log('\n' + chalk.red('Failed scenarios:'));
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(chalk.red(`  • ${r.scenarioId} (${r.config}): ${r.error || 'Test failures'}`));
      });
  }

  console.log('\n' + chalk.blue('━'.repeat(80)) + '\n');
}
