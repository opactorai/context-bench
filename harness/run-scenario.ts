/**
 * Single scenario runner
 * Main orchestration logic for running one scenario with one config
 */

import path from 'path';
import fs from 'fs-extra';
import { RunContext, ScenarioReport, SpecValidationResult } from './types.js';
import { LOG_MARKERS, DEFAULTS } from './constants.js';
import { createScenarioLogger } from './logger.js';
import { validateScenarioEnv } from './env-validator.js';
import { initWorkspace, cleanWorkspace } from './workspace.js';
import { runAgent } from './agent-runner.js';
import { runOneshot } from './oneshot-runner.js';
import { evaluateResult } from './evaluator.js';
import { buildImage, startService, stopService, cleanupDocker } from './docker-service.js';
import { runTests } from './test-runner.js';
import { saveScenarioReport, saveTestResultMarkdown, saveFinalResultMarkdown } from './report.js';
import { resolveEnvVars } from './validator.js';
import { validateScenarioImplementation } from './scenario-validator.js';

/**
 * Run a single scenario with a given configuration
 */
export async function runScenario(context: RunContext): Promise<ScenarioReport> {
  const { scenario, config, runId, workspaceDir, logDir, timeout, verbose, keepWorkspace } = context;

  // Create logger
  const logger = createScenarioLogger(
    runId,
    config.config_name,
    scenario.id,
    'run_instance.log',
    verbose
  );

  const startTime = Date.now();

  logger.info('━'.repeat(80));
  logger.info(`Run ID: ${runId}`);
  logger.info(`Scenario: ${scenario.id} - ${scenario.name}`);
  logger.info(`Config: ${config.config_name} - ${config.description}`);
  logger.info('━'.repeat(80));

  let serviceHandle: any = null;
  const imageName = `context-bench-${scenario.id}-${runId}`;

  // Helper to show progress in console (non-verbose, non-parallel mode only)
  const showProgress = (step: string) => {
    // Call progress callback for parallel mode
    if (context.isParallel && (context as any).onProgress) {
      (context as any).onProgress(step);
    }

    // Show inline progress for sequential mode
    if (!verbose && !context.isParallel) {
      // Clear line with spaces (80 chars) then write progress
      const message = `    ${step}...`;
      const padding = ' '.repeat(Math.max(0, 80 - message.length));
      process.stdout.write(`\r${message}${padding}`);
    }
  };

  try {
    // Step 1: Load scenario (already done)
    showProgress('[1/8] Loading');
    logger.info('[1/8] Loading scenario specification... ✓');

    // Step 2: Validate environment variables
    showProgress('[2/8] Validating env');
    logger.info('[2/8] Validating environment variables...');
    if (!validateScenarioEnv(scenario)) {
      throw new Error('Missing required environment variables');
    }
    logger.info('[2/8] Validating environment variables... ✓');

    // Step 3: Initialize workspace
    showProgress('[3/8] Initializing workspace');
    logger.info('[3/8] Initializing workspace...');
    logger.marker(LOG_MARKERS.WORKSPACE_INIT_START);

    if (context.mode === 'oneshot') {
      // Oneshot mode: Just create empty workspace directory
      fs.ensureDirSync(workspaceDir);
      logger.info('Created empty workspace for oneshot mode');
    } else {
      // Agent mode: Initialize full workspace with scaffold template
      await initWorkspace(scenario, workspaceDir, logger);
    }

    logger.marker(LOG_MARKERS.WORKSPACE_INIT_SUCCESS);
    logger.info('[3/8] Initializing workspace... ✓');

    // Step 4: Apply MCP configuration
    showProgress('[4/8] Applying MCP config');
    logger.info('[4/8] Applying MCP configuration...');
    logger.marker(LOG_MARKERS.MCP_CONFIG_START);
    logger.info(`MCP servers: ${Object.keys(config.mcp_servers).join(', ') || 'none'}`);
    logger.marker(LOG_MARKERS.MCP_CONFIG_SUCCESS);
    logger.info('[4/8] Applying MCP configuration... ✓');

    // Step 5: Invoke runner based on mode
    let agentStats: any;
    let oneshotStats: any;

    if (context.mode === 'oneshot') {
      showProgress('[5/8] Running oneshot');
      logger.info('[5/8] Running oneshot mode (single MCP tool call)...');
      oneshotStats = await runOneshot(scenario, config, workspaceDir, logger, timeout, context.sharedMcpManager);
      logger.info(`Oneshot: ${oneshotStats.mcp_tool_used} on ${oneshotStats.mcp_server_used}`);
      logger.info('[5/8] Running oneshot... ✓');
    } else {
      showProgress('[5/8] Invoking agent');
      logger.info('[5/8] Invoking agent (this may take a while)...');
      agentStats = await runAgent(scenario, config, workspaceDir, logger, timeout);
      logger.info(`Agent turns: ${agentStats.turns}, tool calls: ${agentStats.tool_calls}`);
      logger.info('[5/8] Invoking agent... ✓');
    }

    // Step 6-7: Build service and run tests (skip for oneshot mode)
    let buildTime = 0;
    let testResults: any[] = [];
    let scenarioSpecValidation: SpecValidationResult | undefined;
    let specValidationSkipped = false;

    if (context.mode === 'oneshot') {
      // Oneshot mode: Skip Docker build and tests
      logger.info('[6/8] Skipping Docker build (oneshot mode)');
      logger.info('[7/8] Skipping tests (oneshot mode)');
      logger.info('[7.5/8] Skipping spec validation (oneshot mode)');
      specValidationSkipped = true;
    } else {
      // Agent mode: Build and test
      showProgress('[6/8] Building Docker image');
      logger.info('[6/8] Building service...');
      const buildStart = Date.now();
      await buildImage(workspaceDir, imageName, logger);
      buildTime = Date.now() - buildStart;
      logger.info(`Build time: ${(buildTime / 1000).toFixed(1)}s`);
      logger.info('[6/8] Building service... ✓');

      showProgress('[7/8] Running tests');
      logger.info('[7/8] Running test cases...');
      const resolvedEnvVars = scenario.env_vars ? resolveEnvVars(scenario.env_vars) : undefined;
      serviceHandle = await startService(imageName, logger, resolvedEnvVars);
      testResults = await runTests(scenario, serviceHandle.port, logger);
      logger.info('[7/8] Running test cases... ✓');

      // Create temporary report for spec validation (agent mode only)
      const tempReport: ScenarioReport = {
        scenario_id: scenario.id,
        config: config.config_name,
        run_id: runId,
        timestamp: new Date().toISOString(),
        passed: testResults.filter(r => r.validation.pass).length,
        total: testResults.length,
        pass_rate: 0, // Will be updated later
        test_results: testResults,
        agent_stats: agentStats ? {
          turns: agentStats.turns,
          tool_calls: agentStats.tool_calls,
          elapsed_ms: agentStats.elapsed_ms,
        } : undefined,
        mcp_stats: agentStats?.mcp_stats,
        build_time_ms: buildTime,
        total_elapsed_ms: Date.now() - startTime,
      };

      // Save temporary API test results markdown for spec validation
      const apiResultPath = saveTestResultMarkdown(tempReport, workspaceDir);

      // Step 7.5: Validate implementation against spec (if tests passed)
      const apiTestsPassed = testResults.filter(r => r.validation.pass).length === testResults.length;

      if (apiTestsPassed) {
        logger.info('[7.5/8] Validating implementation against scenario spec...');
        scenarioSpecValidation = await validateScenarioImplementation(
          scenario,
          workspaceDir,
          apiResultPath,
          logger
        );
        logger.info('[7.5/8] Spec validation complete');
      } else {
        logger.info('[7.5/8] Skipping spec validation (API tests failed)');
        specValidationSkipped = true;
      }
    }

    // Step 7.6: Evaluate result against oracle (for both modes)
    let evaluationResult: any;
    let evaluationError: { message: string; stack?: string } | undefined;
    try {
      showProgress('[7.6/8] Evaluating result');
      logger.info('[7.6/8] Evaluating result against oracle...');
      evaluationResult = await evaluateResult(scenario, context.mode, workspaceDir, logger);
      logger.info(`Evaluation score: ${evaluationResult.aggregated.final_score}/5 (pass: ${evaluationResult.aggregated.pass})`);
      logger.info('[7.6/8] Evaluation complete ✓');
    } catch (error: any) {
      logger.warn(`Evaluation failed: ${error.message}`);
      logger.error(error.stack || '');
      evaluationResult = undefined;
      evaluationError = {
        message: error.message,
        stack: error.stack
      };
    }

    // Step 8: Generate report
    showProgress('[8/8] Generating report');
    logger.info('[8/8] Generating report...');
    logger.marker(LOG_MARKERS.REPORT_START);

    // Calculate pass rate (for agent mode) or use evaluation score (for oneshot mode)
    let passed = 0;
    let total = 0;
    let passRate = 0;

    if (context.mode === 'agent') {
      // Agent mode: use test results
      const apiPassedCount = testResults.filter(r => r.validation.pass).length;
      const specPassed = scenarioSpecValidation?.pass ?? true;

      // If all API tests passed but spec validation failed, scenario fails
      passed = apiPassedCount;
      if (apiPassedCount === testResults.length && !specValidationSkipped && !specPassed) {
        passed = 0; // Spec validation failed, so scenario fails
      }

      total = testResults.length;
      passRate = total > 0 ? passed / total : 0;
    } else {
      // Oneshot mode: use evaluation pass/fail
      if (evaluationResult) {
        total = 1;
        passed = evaluationResult.aggregated.pass ? 1 : 0;
        passRate = passed / total;
      }
    }

    const report: ScenarioReport = {
      scenario_id: scenario.id,
      config: config.config_name,
      run_id: runId,
      timestamp: new Date().toISOString(),
      mode: context.mode,
      passed,
      total,
      pass_rate: passRate,
      test_results: testResults,
      spec_validation: scenarioSpecValidation,
      spec_validation_skipped: specValidationSkipped,
      agent_stats: agentStats ? {
        turns: agentStats.turns,
        tool_calls: agentStats.tool_calls,
        elapsed_ms: agentStats.elapsed_ms,
      } : undefined,
      oneshot_stats: oneshotStats ? {
        tool_calls: oneshotStats.tool_calls,
        elapsed_ms: oneshotStats.elapsed_ms,
        mcp_tool_used: oneshotStats.mcp_tool_used,
        mcp_server_used: oneshotStats.mcp_server_used,
      } : undefined,
      evaluation: evaluationResult,
      evaluation_error: evaluationError,
      mcp_stats: agentStats?.mcp_stats,
      build_time_ms: buildTime,
      total_elapsed_ms: Date.now() - startTime,
    };

    const reportPath = saveScenarioReport(report);

    // Update API test results markdown with final report (agent mode only)
    if (context.mode === 'agent') {
      const apiResultPath = saveTestResultMarkdown(report, workspaceDir);
      logger.info(`API test results saved: ${apiResultPath}`);
    }

    // Save comprehensive final result in workspace
    const finalResultPath = saveFinalResultMarkdown(report, workspaceDir);
    logger.info(`✅ Final result saved: ${finalResultPath}`);

    logger.marker(LOG_MARKERS.REPORT_SUCCESS);
    logger.info(`Report saved: ${reportPath}`);
    logger.info('[8/8] Generating report... ✓');

    logger.info('━'.repeat(80));
    logger.info(`Results: ${passed}/${total} passed (${(passRate * 100).toFixed(1)}%)`);
    logger.info(`Elapsed: ${(report.total_elapsed_ms / 1000).toFixed(1)}s`);
    logger.info('━'.repeat(80));

    return report;
  } catch (error: any) {
    logger.error('━'.repeat(80));
    logger.error(`ERROR: ${error.message}`);
    logger.error('━'.repeat(80));
    logger.error(error.stack || '');

    // Return failure report
    const report: ScenarioReport = {
      scenario_id: scenario.id,
      config: config.config_name,
      run_id: runId,
      timestamp: new Date().toISOString(),
      passed: 0,
      total: scenario.test_inputs.length,
      pass_rate: 0,
      test_results: [],
      total_elapsed_ms: Date.now() - startTime,
    };

    saveScenarioReport(report);
    throw error;
  } finally {
    // Cleanup
    logger.marker(LOG_MARKERS.CLEANUP_START);

    if (serviceHandle) {
      await stopService(serviceHandle, logger);
    }

    // Cleanup Docker image only in agent mode (oneshot mode doesn't use Docker)
    if (context.mode === 'agent') {
      await cleanupDocker(imageName, logger);
    }

    // Workspace cleanup depends on keepWorkspace option
    if (!keepWorkspace) {
      cleanWorkspace(workspaceDir, logger);
    } else {
      logger.info(`Workspace preserved: ${workspaceDir}`);
    }

    logger.marker(LOG_MARKERS.CLEANUP_SUCCESS);
  }
}
