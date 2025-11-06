#!/usr/bin/env node
/**
 * CLI entry point for context-bench
 */

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { CLIOptions, RunContext, ExecutionMode } from './types.js';
import { EXIT_CODES, DEFAULTS } from './constants.js';
import { loadScenario, listScenarios, getScenarioIds, listPackages, loadPackage, getPackageIds, getPackageScenarios } from './scenario-loader.js';
import { loadConfig, listConfigs, getConfigNames } from './config-loader.js';
import { runScenario } from './run-scenario.js';
import { generateSummaryReport, saveSummaryReport, printSummaryReport, saveBenchmarkSummaryMarkdown, saveConfigSummaryMarkdown } from './report.js';
import { runParallel, createRunContexts, printParallelSummary } from './parallel-runner.js';
import Dockerode from 'dockerode';
import { PortManager } from './port-manager.js';

// Load environment variables
dotenv.config();

// Initialize Docker client
const docker = new Dockerode();
const portManager = PortManager.getInstance();

const program = new Command();

program
  .name('context-bench')
  .description('MCP Agent Integration Benchmark')
  .version('1.0.0');

program
  .option('--package <name>', 'Run all scenarios in a package')
  .option('--scenario <id>', 'Single scenario ID to run (format: package:scenario)')
  .option('--scenarios <ids>', 'Comma-separated scenario IDs to run')
  .option('--mode <type>', 'Execution mode: oneshot or agent (default: agent)', 'agent')
  .option('--config <name>', 'Configuration to use (baseline, context7, nia, deepcon)')
  .option('--all-configs', 'Run with all available configurations')
  .option('--all-packages', 'Run all packages')
  .option('--run-id <id>', 'Unique identifier for this run (required)', generateRunId())
  .option('--max-workers <n>', 'Parallel execution limit', '1')
  .option('--timeout <seconds>', 'Timeout per scenario in seconds', DEFAULTS.TIMEOUT_SEC.toString())
  .option('--verbose', 'Detailed logging to stdout')
  .option('--output-dir <dir>', 'Custom reports directory', 'reports')
  .option('--list-packages', 'List all available packages and exit')
  .option('--list-scenarios', 'List all available scenarios and exit')
  .option('--list-configs', 'List all available configs and exit')
  .option('--show-package <name>', 'Show package details and exit')
  .option('--show-scenario <id>', 'Show scenario details and exit');

program.parse();

const options = program.opts() as CLIOptions;

async function main() {
  console.log(chalk.bold('\nContext Bench v1.0.0\n'));

  // Handle list commands
  if (options.listPackages) {
    listPackagesCommand();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (options.listScenarios) {
    listScenariosCommand();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (options.listConfigs) {
    listConfigsCommand();
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (options.showPackage) {
    showPackageCommand(options.showPackage);
    process.exit(EXIT_CODES.SUCCESS);
  }

  if (options.showScenario) {
    showScenarioCommand(options.showScenario);
    process.exit(EXIT_CODES.SUCCESS);
  }

  // Validate required options
  if (!options.config && !options.allConfigs) {
    console.error(chalk.red('Error: Either --config or --all-configs must be specified\n'));
    program.help();
    process.exit(EXIT_CODES.CONFIG_ERROR);
  }

  // Validate mode
  const mode: ExecutionMode = (options.mode as ExecutionMode) || 'agent';
  if (mode !== 'oneshot' && mode !== 'agent') {
    console.error(chalk.red(`Error: Invalid mode "${mode}". Must be "oneshot" or "agent"\n`));
    process.exit(EXIT_CODES.CONFIG_ERROR);
  }

  // Determine scenarios to run
  const scenarioIds = getScenarioIdsToRun(options);
  if (scenarioIds.length === 0) {
    console.error(chalk.red('Error: No scenarios to run\n'));
    process.exit(EXIT_CODES.CONFIG_ERROR);
  }

  // Determine configs to run
  const configNames = getConfigNamesToRun(options);
  if (configNames.length === 0) {
    console.error(chalk.red('Error: No configs to run\n'));
    process.exit(EXIT_CODES.CONFIG_ERROR);
  }

  // Run benchmark
  console.log(chalk.blue('━'.repeat(80)));
  console.log(`Run ID: ${options.runId}`);
  console.log(`Mode: ${chalk.cyan(mode)}`);
  console.log(`Scenarios: ${scenarioIds.join(', ')}`);
  console.log(`Configs: ${configNames.join(', ')}`);

  const maxWorkers = parseInt(options.maxWorkers?.toString() || '1');
  const useParallel = maxWorkers > 1 && (scenarioIds.length * configNames.length) > 1;

  if (useParallel) {
    console.log(chalk.cyan(`Workers: ${maxWorkers} (parallel mode)`));
  }

  console.log(chalk.blue('━'.repeat(80)) + '\n');

  let hasFailures = false;

  // Decide between parallel and sequential execution
  if (useParallel) {
    // Parallel execution
    const contexts = createRunContexts(
      scenarioIds,
      configNames,
      options.runId,
      mode,
      parseInt(options.timeout?.toString() || DEFAULTS.TIMEOUT_SEC.toString()),
      options.verbose || false,
      true, // Always keep workspace
      loadScenario,
      loadConfig
    );

    const results = await runParallel(contexts, {
      maxWorkers,
      verbose: options.verbose || false,
    });

    hasFailures = results.some(r => !r.success);

    printParallelSummary(results);
  } else {
    // Sequential execution
    for (const configName of configNames) {
      console.log(chalk.cyan(`\n▶ Running config: ${configName}\n`));

      const config = loadConfig(configName);

      for (const scenarioId of scenarioIds) {
        console.log(chalk.yellow(`  ▶ Scenario: ${scenarioId}`));

        try {
          const scenario = loadScenario(scenarioId);
          const workspaceDir = path.join('workspace', options.runId, mode, configName, scenarioId);
          const logDir = path.join('logs', 'run_evaluation', options.runId, mode, configName, scenarioId);

          const context: RunContext = {
            scenario,
            config,
            mode,
            runId: options.runId,
            workspaceDir,
            logDir,
            timeout: parseInt(options.timeout?.toString() || DEFAULTS.TIMEOUT_SEC.toString()),
            verbose: options.verbose || false,
            keepWorkspace: true, // Always keep workspace
          };

          // Show progress steps even without verbose
          if (!options.verbose) {
            process.stdout.write(chalk.gray('    [1/8] Loading... '));
          }

          const report = await runScenario(context);

          if (!options.verbose) {
            // Clear the progress line completely with spaces
            process.stdout.write('\r' + ' '.repeat(80) + '\r');
          }

          if (report.pass_rate < 1.0) {
            hasFailures = true;
            console.log(chalk.red(`    ✗ FAIL: ${report.passed}/${report.total} passed\n`));
          } else {
            console.log(chalk.green(`    ✓ PASS: ${report.passed}/${report.total} passed\n`));
          }
        } catch (error: any) {
          hasFailures = true;
          console.log(chalk.red(`    ✗ ERROR: ${error.message}\n`));
        }
      }
    }
  }

  // Generate summary report if multiple scenarios/configs
  if (scenarioIds.length > 1 || configNames.length > 1) {
    console.log(chalk.cyan('\n▶ Generating summary report\n'));

    const summary = generateSummaryReport(
      options.runId,
      configNames,
      scenarioIds,
      options.outputDir
    );

    saveSummaryReport(summary, options.outputDir);
    printSummaryReport(summary);

    // Generate markdown reports in workspace directory (always)
    // Full benchmark report (if multiple configs)
    if (configNames.length > 1) {
      const benchReportPath = saveBenchmarkSummaryMarkdown(summary, options.runId, options.outputDir);
      console.log(chalk.gray(`Benchmark summary: ${benchReportPath}`));
    }

    // Config-specific reports
    for (const configName of configNames) {
      const configReportPath = saveConfigSummaryMarkdown(summary, configName, options.runId, options.outputDir);
      console.log(chalk.gray(`${configName} summary: ${configReportPath}`));
    }
  }

  process.exit(hasFailures ? EXIT_CODES.FAILURE : EXIT_CODES.SUCCESS);
}

/**
 * List all available packages
 */
function listPackagesCommand() {
  const packages = listPackages();

  console.log(chalk.bold('Available Packages:\n'));

  if (packages.length === 0) {
    console.log(chalk.yellow('No packages found in scenarios/ directory\n'));
    return;
  }

  for (const pkg of packages) {
    console.log(chalk.cyan(`  ${pkg['package-id']}`));
    console.log(`    Language: ${pkg.language}`);
    console.log(`    Scenarios: ${pkg.scenarios.length}`);
    console.log();
  }
}

/**
 * List all available scenarios
 */
function listScenariosCommand() {
  const scenarios = listScenarios();

  console.log(chalk.bold('Available Scenarios:\n'));

  if (scenarios.length === 0) {
    console.log(chalk.yellow('No scenarios found in scenarios/ directory\n'));
    return;
  }

  // Group by package
  const byPackage: Record<string, typeof scenarios> = {};
  for (const item of scenarios) {
    if (!byPackage[item.packageId]) {
      byPackage[item.packageId] = [];
    }
    byPackage[item.packageId].push(item);
  }

  for (const [packageId, items] of Object.entries(byPackage)) {
    console.log(chalk.cyan(`  ${packageId}`));
    for (const item of items) {
      console.log(`    ${chalk.yellow(item.fullId)}`);
      console.log(chalk.gray(`      ${item.scenario.query.substring(0, 80)}...`));
    }
    console.log();
  }
}

/**
 * List all available configs
 */
function listConfigsCommand() {
  const configs = listConfigs();

  console.log(chalk.bold('Available Configurations:\n'));

  if (configs.length === 0) {
    console.log(chalk.yellow('No configs found in configs/ directory\n'));
    return;
  }

  for (const config of configs) {
    console.log(chalk.cyan(`  ${config.config_name}`));
    console.log(`    ${config.description}`);
    console.log(`    MCP servers: ${Object.keys(config.mcp_servers).join(', ') || 'none'}`);
    console.log();
  }
}

/**
 * Show package details
 */
function showPackageCommand(packageId: string) {
  try {
    const pkg = loadPackage(packageId);

    console.log(chalk.bold(`Package: ${pkg['package-id']}\n`));
    console.log(`Language: ${pkg.language}`);
    console.log(`Runtime: ${pkg.runtime.version}`);
    console.log(`Environment Variables: ${Object.keys(pkg.env_vars || {}).join(', ') || 'none'}`);
    console.log(`\nScenarios (${pkg.scenarios.length}):\n`);

    for (const scenario of pkg.scenarios) {
      console.log(chalk.cyan(`  ${scenario.id}`));
      console.log(chalk.gray(`    Query: ${scenario.query.substring(0, 100)}...`));
      console.log(chalk.gray(`    Oracle: ${scenario.oracle}`));
      console.log(chalk.gray(`    Sources: ${scenario.sources.length}`));
      console.log();
    }
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}\n`));
  }
}

/**
 * Show scenario details
 */
function showScenarioCommand(scenarioId: string) {
  try {
    const scenario = loadScenario(scenarioId);

    console.log(chalk.bold(`Scenario: ${scenario.id}\n`));
    console.log(`Name: ${scenario.name}`);
    if (scenario.description) {
      console.log(`Description: ${scenario.description}`);
    }
    console.log(`\nAgent Prompt:\n${scenario.agent_prompt}`);
    console.log(`\nTest Cases: ${scenario.test_inputs.length}`);
    console.log(`Environment Variables: ${Object.keys(scenario.env_vars || {}).join(', ') || 'none'}\n`);
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}\n`));
  }
}

/**
 * Get scenario IDs to run based on CLI options
 */
function getScenarioIdsToRun(options: CLIOptions): string[] {
  // If --package is specified, run all scenarios in that package
  if (options.package) {
    return getPackageScenarios(options.package);
  }

  // If --all-packages is specified, run all scenarios
  if (options.allPackages) {
    return getScenarioIds();
  }

  // If --scenario is specified, run single scenario
  if (options.scenario) {
    return [options.scenario];
  }

  // If --scenarios is specified, run multiple scenarios
  if (options.scenarios) {
    return options.scenarios.split(',').map(s => s.trim());
  }

  // Default: run all scenarios
  return getScenarioIds();
}

/**
 * Get config names to run based on CLI options
 */
function getConfigNamesToRun(options: CLIOptions): string[] {
  if (options.config) {
    return [options.config];
  }

  if (options.allConfigs) {
    return getConfigNames();
  }

  return [];
}

/**
 * Generate a unique run ID
 */
function generateRunId(): string {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toISOString().split('T')[1].substring(0, 5).replace(':', '');
  return `run-${date}-${time}`;
}

/**
 * Clean up orphan containers from previous runs
 */
async function cleanupOrphanContainers(): Promise<void> {
  try {
    const containers = await docker.listContainers({ all: true });
    const orphans = containers.filter(c => c.Names.some(name => name.includes('context-bench')));

    if (orphans.length > 0) {
      console.log(chalk.yellow(`Found ${orphans.length} orphan container(s) from previous runs, cleaning up...`));

      for (const containerInfo of orphans) {
        try {
          const container = docker.getContainer(containerInfo.Id);
          await container.remove({ force: true });
          console.log(chalk.gray(`  Removed: ${containerInfo.Id.substring(0, 12)}`));
        } catch (err) {
          // Ignore errors during cleanup
        }
      }

      // Reset port manager to clear stale allocations
      await portManager.reset();
      console.log(chalk.green('Orphan cleanup complete\n'));
    }
  } catch (error) {
    // Ignore errors during orphan cleanup
  }
}

/**
 * Global cleanup on exit
 */
async function globalCleanup(): Promise<void> {
  console.log(chalk.yellow('\n\nCleaning up...'));

  try {
    // Stop all running context-bench containers
    const containers = await docker.listContainers();
    const benchContainers = containers.filter(c =>
      c.Names.some(name => name.includes('context-bench')) ||
      c.Image.includes('context-bench')
    );

    for (const containerInfo of benchContainers) {
      try {
        const container = docker.getContainer(containerInfo.Id);
        await container.stop({ t: 5 });
        await container.remove();
        console.log(chalk.gray(`  Stopped container: ${containerInfo.Id.substring(0, 12)}`));
      } catch (err) {
        // Ignore errors
      }
    }

    // Reset port manager and clear file state
    await portManager.reset();

    console.log(chalk.green('Cleanup complete'));
  } catch (error) {
    console.error(chalk.red('Cleanup failed:'), error);
  }
}

// Handle graceful shutdown on SIGINT (Ctrl+C) and SIGTERM
let isExiting = false;
process.on('SIGINT', async () => {
  if (isExiting) return;
  isExiting = true;

  console.log(chalk.yellow('\n\nReceived SIGINT (Ctrl+C), cleaning up...'));
  await globalCleanup();
  process.exit(130); // Standard exit code for SIGINT
});

process.on('SIGTERM', async () => {
  if (isExiting) return;
  isExiting = true;

  console.log(chalk.yellow('\n\nReceived SIGTERM, cleaning up...'));
  await globalCleanup();
  process.exit(143); // Standard exit code for SIGTERM
});

// Clean up orphan containers from previous runs before starting
await cleanupOrphanContainers();

// Run main
main().catch(error => {
  console.error(chalk.red(`\nFatal error: ${error.message}\n`));
  process.exit(EXIT_CODES.RUNTIME_ERROR);
});
