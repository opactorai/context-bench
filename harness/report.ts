/**
 * Report generation and aggregation
 */

import fs from 'fs-extra';
import path from 'path';
import { ScenarioReport, SummaryReport, ConfigSummary, ScenarioSummary, TestResult } from './types.js';
import { PATHS } from './constants.js';

/**
 * Save scenario report to disk
 */
export function saveScenarioReport(report: ScenarioReport, outputDir?: string): string {
  const reportsDir = outputDir || PATHS.REPORTS_DIR;
  const configDir = path.join(reportsDir, report.config);
  fs.ensureDirSync(configDir);

  const reportPath = path.join(configDir, `${report.scenario_id}.json`);
  fs.writeJsonSync(reportPath, report, { spaces: 2 });

  return reportPath;
}

/**
 * Load scenario report from disk
 */
export function loadScenarioReport(config: string, scenarioId: string, outputDir?: string): ScenarioReport | null {
  const reportsDir = outputDir || PATHS.REPORTS_DIR;
  const reportPath = path.join(reportsDir, config, `${scenarioId}.json`);

  if (!fs.existsSync(reportPath)) {
    return null;
  }

  return fs.readJsonSync(reportPath) as ScenarioReport;
}

/**
 * Generate summary report from all scenario reports
 */
export function generateSummaryReport(
  runId: string,
  configs: string[],
  scenarioIds: string[],
  outputDir?: string
): SummaryReport {
  const reportsDir = outputDir || PATHS.REPORTS_DIR;

  const summary: SummaryReport = {
    run_id: runId,
    timestamp: new Date().toISOString(),
    total_scenarios: scenarioIds.length,
    configs: {},
    scenarios: [],
  };

  // Aggregate by config
  for (const config of configs) {
    const configSummary: ConfigSummary = {
      passed_scenarios: 0,
      total_scenarios: 0,
      pass_rate: 0,
      total_test_cases: 0,
      passed_test_cases: 0,
    };

    for (const scenarioId of scenarioIds) {
      const report = loadScenarioReport(config, scenarioId, outputDir);
      if (report) {
        configSummary.total_scenarios++;
        configSummary.total_test_cases += report.total;
        configSummary.passed_test_cases += report.passed;

        if (report.pass_rate === 1.0) {
          configSummary.passed_scenarios++;
        }
      }
    }

    if (configSummary.total_scenarios > 0) {
      configSummary.pass_rate = configSummary.passed_scenarios / configSummary.total_scenarios;
    }

    summary.configs[config] = configSummary;
  }

  // Aggregate by scenario
  for (const scenarioId of scenarioIds) {
    const scenarioSummary: ScenarioSummary = {
      scenario_id: scenarioId,
    };

    for (const config of configs) {
      const report = loadScenarioReport(config, scenarioId, outputDir);
      if (report) {
        scenarioSummary[config] = {
          passed: report.passed,
          total: report.total,
        };
      }
    }

    summary.scenarios.push(scenarioSummary);
  }

  return summary;
}

/**
 * Save summary report to disk
 */
export function saveSummaryReport(summary: SummaryReport, outputDir?: string): string {
  const reportsDir = outputDir || PATHS.REPORTS_DIR;
  fs.ensureDirSync(reportsDir);

  const reportPath = path.join(reportsDir, 'summary.json');
  fs.writeJsonSync(reportPath, summary, { spaces: 2 });

  return reportPath;
}

/**
 * Print scenario report to console
 */
export function printScenarioReport(report: ScenarioReport) {
  console.log('\n━'.repeat(80));
  console.log(`Results: ${report.passed}/${report.total} passed (${(report.pass_rate * 100).toFixed(1)}%)`);
  console.log(`Report: reports/${report.config}/${report.scenario_id}.json`);
  console.log(`Elapsed: ${(report.total_elapsed_ms / 1000).toFixed(1)}s`);
  console.log('━'.repeat(80) + '\n');
}

/**
 * Print summary report to console
 */
export function printSummaryReport(summary: SummaryReport) {
  console.log('\n' + '━'.repeat(80));
  console.log('SUMMARY REPORT');
  console.log('━'.repeat(80) + '\n');

  console.log(`Run ID: ${summary.run_id}`);
  console.log(`Timestamp: ${summary.timestamp}`);
  console.log(`Total Scenarios: ${summary.total_scenarios}\n`);

  console.log('Config Performance:');
  for (const [config, stats] of Object.entries(summary.configs)) {
    console.log(`  ${config}: ${stats.passed_scenarios}/${stats.total_scenarios} scenarios (${(stats.pass_rate * 100).toFixed(1)}%)`);
    console.log(`    Test cases: ${stats.passed_test_cases}/${stats.total_test_cases}`);
  }

  // Scenario-by-scenario breakdown
  if (summary.scenarios && summary.scenarios.length > 0) {
    console.log('\nScenario Results:');

    for (const scenarioSum of summary.scenarios) {
      const scenarioId = scenarioSum.scenario_id;

      // Check pass/fail for each config
      let statusLine = `  ${scenarioId}: `;
      const configResults: string[] = [];

      for (const [config, stats] of Object.entries(summary.configs)) {
        const scenarioData = scenarioSum[config];
        if (scenarioData && typeof scenarioData === 'object' && 'passed' in scenarioData && 'total' in scenarioData) {
          const isPassed = scenarioData.passed === scenarioData.total && scenarioData.total > 0;
          const icon = isPassed ? '✅' : '❌';
          configResults.push(`${config}:${icon}`);
        }
      }

      console.log(statusLine + configResults.join(' '));
    }
  }

  console.log('\n' + '━'.repeat(80) + '\n');
}

/**
 * Generate markdown report for test results
 */
function generateTestResultMarkdown(report: ScenarioReport): string {
  const lines: string[] = [];

  // Header
  lines.push('# API Test Results');
  lines.push('');
  lines.push(`**Scenario**: ${report.scenario_id}`);
  lines.push(`**Config**: ${report.config}`);
  lines.push(`**Run ID**: ${report.run_id}`);
  lines.push(`**Timestamp**: ${report.timestamp}`);
  lines.push('');

  // Summary - API Tests Only
  lines.push('## Summary');
  lines.push('');

  // Calculate API-only pass rate
  const apiPassed = report.test_results.filter(r => r.validation.pass).length;
  const apiTotal = report.test_results.length;
  const apiPassRate = apiTotal > 0 ? apiPassed / apiTotal : 0;
  const apiStatus = apiPassRate === 1.0 ? '✅ PASSED' : '❌ FAILED';

  lines.push(`**Status**: ${apiStatus}`);
  lines.push(`**Pass Rate**: ${(apiPassRate * 100).toFixed(1)}% (${apiPassed}/${apiTotal})`);
  lines.push(`**Total Elapsed**: ${(report.total_elapsed_ms / 1000).toFixed(1)}s`);
  if (report.build_time_ms) {
    lines.push(`**Build Time**: ${(report.build_time_ms / 1000).toFixed(1)}s`);
  }
  lines.push('');

  // Agent stats
  if (report.agent_stats) {
    lines.push('## Agent Statistics');
    lines.push('');
    lines.push(`- **Turns**: ${report.agent_stats.turns}`);
    lines.push(`- **Tool Calls**: ${report.agent_stats.tool_calls}`);
    lines.push(`- **Agent Elapsed**: ${(report.agent_stats.elapsed_ms / 1000).toFixed(1)}s`);
    lines.push('');
  }

  // Test results
  lines.push('## Test Cases');
  lines.push('');

  report.test_results.forEach((test, index) => {
    const testNum = index + 1;
    // Test passes if API validation passes
    const testPass = test.validation.pass;
    const testStatus = testPass ? '✅ PASS' : '❌ FAIL';

    lines.push(`### Test Case ${testNum} ${testStatus}`);
    lines.push('');

    // Input
    lines.push('**Input:**');
    lines.push('```json');
    lines.push(JSON.stringify(test.input, null, 2));
    lines.push('```');
    lines.push('');

    // Output
    if (test.output) {
      lines.push('**Output:**');
      lines.push('```json');
      lines.push(JSON.stringify(test.output, null, 2));
      lines.push('```');
      lines.push('');
    }

    // Error
    if (test.error) {
      lines.push('**Error:**');
      lines.push('```');
      lines.push(test.error);
      lines.push('```');
      lines.push('');

      // Error details (response status and data)
      if (test.error_details) {
        lines.push('**Error Details:**');
        if (test.error_details.status) {
          lines.push(`- **Status Code**: ${test.error_details.status}`);
        }
        if (test.error_details.data) {
          lines.push('- **Response Data**:');
          lines.push('```json');
          lines.push(JSON.stringify(test.error_details.data, null, 2));
          lines.push('```');
        }
        lines.push('');
      }
    }

    // Validation
    lines.push('**API Validation:**');
    if (test.validation.pass) {
      lines.push('- Status: ✅ Passed');
    } else {
      lines.push('- Status: ❌ Failed');
      if (test.validation.errors && test.validation.errors.length > 0) {
        lines.push('- Errors:');
        test.validation.errors.forEach(err => {
          lines.push(`  - ${JSON.stringify(err)}`);
        });
      }
    }
    lines.push('');

    // Timing
    if (test.elapsed_ms) {
      lines.push(`**Elapsed**: ${test.elapsed_ms}ms`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`Generated at: ${new Date().toISOString()}`);

  return lines.join('\n');
}

/**
 * Save test results as markdown in workspace directory
 */
export function saveTestResultMarkdown(report: ScenarioReport, workspaceDir: string): string {
  const markdown = generateTestResultMarkdown(report);
  const markdownPath = path.join(workspaceDir, 'api_test_result.md');

  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  return markdownPath;
}

/**
 * Generate comprehensive final result markdown with all details
 */
function generateFinalResultMarkdown(report: ScenarioReport): string {
  const lines: string[] = [];

  // Title
  lines.push('# 🎯 Final Evaluation Result');
  lines.push('');
  lines.push('---');
  lines.push('');

  // Overall Status
  const overallStatus = report.pass_rate === 1.0 ? '✅ **PASSED**' : '❌ **FAILED**';
  lines.push(`## 📊 Overall Status: ${overallStatus}`);
  lines.push('');

  // Scenario Information
  lines.push('## 📝 Scenario Information');
  lines.push('');
  lines.push(`- **Scenario ID**: ${report.scenario_id}`);
  lines.push(`- **Configuration**: ${report.config}`);
  lines.push(`- **Run ID**: ${report.run_id}`);
  lines.push(`- **Timestamp**: ${report.timestamp}`);
  lines.push('');

  // Performance Metrics
  lines.push('## ⚡ Performance Metrics');
  lines.push('');
  lines.push(`- **Total Elapsed Time**: ${(report.total_elapsed_ms / 1000).toFixed(2)}s`);
  if (report.build_time_ms) {
    lines.push(`- **Build Time**: ${(report.build_time_ms / 1000).toFixed(2)}s`);
  }
  if (report.agent_stats) {
    lines.push(`- **Agent Execution Time**: ${(report.agent_stats.elapsed_ms / 1000).toFixed(2)}s`);
    lines.push(`- **Agent Turns**: ${report.agent_stats.turns}`);
    lines.push(`- **Agent Tool Calls**: ${report.agent_stats.tool_calls}`);
  }
  if (report.mcp_stats) {
    lines.push(`- **MCP Total Calls**: ${report.mcp_stats.total_calls}`);
    lines.push(`- **MCP Total Time**: ${(report.mcp_stats.total_elapsed_ms / 1000).toFixed(2)}s`);
    lines.push(`- **MCP Total Input Tokens**: ${report.mcp_stats.total_input_tokens}`);
    lines.push(`- **MCP Total Output Tokens**: ${report.mcp_stats.total_output_tokens}`);
  }
  lines.push('');

  // Test Results Summary
  lines.push('## 📋 Test Results Summary');
  lines.push('');

  // For oneshot mode with evaluation
  if (report.mode === 'oneshot') {
    if (report.evaluation_error) {
      lines.push(`- **Evaluation**: ❌ **ERROR**`);
      lines.push(`- **Error Message**: ${report.evaluation_error.message}`);
      lines.push(`- **Overall Result**: FAILED ❌`);
    } else if (report.evaluation) {
      const evalPass = report.evaluation.aggregated?.pass ?? false;
      const evalScore = report.evaluation.aggregated?.final_score ?? 0;
      lines.push(`- **Evaluation Score**: ${evalScore}/5`);
      lines.push(`- **Evaluation Status**: ${evalPass ? 'Passed ✅' : 'Failed ❌'}`);
      lines.push(`- **Overall Result**: ${evalPass ? 'PASSED ✅' : 'FAILED ❌'}`);
    } else {
      lines.push(`- **Evaluation**: Not available`);
      lines.push(`- **Overall Result**: FAILED ❌`);
    }
  } else {
    // Agent mode - existing logic
    // Calculate API-only results
    const apiPassed = report.test_results.filter(r => r.validation.pass).length;
    const apiTotal = report.test_results.length;
    const apiPassRate = apiTotal > 0 ? apiPassed / apiTotal : 0;

    lines.push(`- **API Tests**: ${apiPassed}/${apiTotal} passed (${(apiPassRate * 100).toFixed(1)}%)`);

    // Spec Validation Summary
    if (report.spec_validation_skipped) {
      lines.push(`- **Spec Validation**: Skipped (API tests failed)`);
    } else if (report.spec_validation) {
      const specStatus = report.spec_validation.pass ? 'Passed ✅' : 'Failed ❌';
      lines.push(`- **Spec Validation**: ${specStatus}`);
    }

    lines.push(`- **Overall Result**: ${report.pass_rate === 1.0 ? 'PASSED ✅' : 'FAILED ❌'}`);
  }
  lines.push('');

  // Specification Compliance Validation (if available)
  if (report.spec_validation && !report.spec_validation_skipped) {
    lines.push('---');
    lines.push('');
    lines.push('## 🎯 Specification Compliance Validation');
    lines.push('');

    const specStatus = report.spec_validation.pass ? '✅ **PASSED**' : '❌ **FAILED**';
    lines.push(`**Status**: ${specStatus}`);
    lines.push('');

    lines.push('**Reasoning:**');
    lines.push('');
    lines.push(report.spec_validation.reasoning);
    lines.push('');

    if (report.spec_validation.violations.length > 0) {
      lines.push('**Violations Found:**');
      lines.push('');
      report.spec_validation.violations.forEach(violation => {
        lines.push(`- ❌ ${violation}`);
      });
      lines.push('');
    } else if (report.spec_validation.pass) {
      lines.push('**Result:**');
      lines.push('');
      lines.push('- ✅ Implementation correctly follows all scenario requirements');
      lines.push('- ✅ All required APIs and features are properly used');
      lines.push('- ✅ Output fields are sourced from actual API responses');
      lines.push('- ✅ No hardcoded or fake data detected');
      lines.push('');
    }
  }

  // Evaluation Error Details (oneshot mode only)
  if (report.mode === 'oneshot' && report.evaluation_error) {
    lines.push('---');
    lines.push('');
    lines.push('## ⚠️ Evaluation Error');
    lines.push('');
    lines.push('**Error Message:**');
    lines.push('```');
    lines.push(report.evaluation_error.message);
    lines.push('```');
    lines.push('');
    if (report.evaluation_error.stack) {
      lines.push('**Stack Trace:**');
      lines.push('```');
      lines.push(report.evaluation_error.stack);
      lines.push('```');
      lines.push('');
    }
  }

  // Detailed Test Results (skip for oneshot mode with no test results)
  if (report.test_results && report.test_results.length > 0) {
    lines.push('---');
    lines.push('');
    lines.push('## 🔬 Detailed Test Results');
    lines.push('');
  }

  report.test_results.forEach((test, index) => {
    const testNum = index + 1;
    const apiPass = test.validation.pass;

    lines.push(`### Test Case ${testNum}: ${apiPass ? '✅ PASS' : '❌ FAIL'}`);
    lines.push('');

    // Test Input
    lines.push('#### 📥 Input');
    lines.push('```json');
    lines.push(JSON.stringify(test.input, null, 2));
    lines.push('```');
    lines.push('');

    // Test Output
    if (test.output) {
      lines.push('#### 📤 Output');
      lines.push('```json');
      lines.push(JSON.stringify(test.output, null, 2));
      lines.push('```');
      lines.push('');
    }

    // Error Information
    if (test.error) {
      lines.push('#### ⚠️ Error');
      lines.push('```');
      lines.push(test.error);
      lines.push('```');
      lines.push('');

      if (test.error_details) {
        lines.push('**Error Details:**');
        if (test.error_details.status) {
          lines.push(`- HTTP Status: ${test.error_details.status}`);
        }
        if (test.error_details.data) {
          lines.push('- Response Data:');
          lines.push('```json');
          lines.push(JSON.stringify(test.error_details.data, null, 2));
          lines.push('```');
        }
        lines.push('');
      }
    }

    // API Schema Validation
    lines.push('#### 🔍 API Schema Validation');
    lines.push('');
    if (apiPass) {
      lines.push('**Status**: ✅ **PASSED**');
      lines.push('');
      lines.push('- Output conforms to API schema specification');
      lines.push('- All required fields are present');
      lines.push('- Field types match schema definition');
    } else {
      lines.push('**Status**: ❌ **FAILED**');
      lines.push('');
      if (test.validation.errors && test.validation.errors.length > 0) {
        lines.push('**Validation Errors:**');
        test.validation.errors.forEach(err => {
          lines.push(`- ${JSON.stringify(err)}`);
        });
      }
    }
    lines.push('');

    // Execution Time
    if (test.elapsed_ms !== undefined) {
      lines.push('#### ⏱️ Execution Time');
      lines.push('');
      lines.push(`${test.elapsed_ms}ms (${(test.elapsed_ms / 1000).toFixed(2)}s)`);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  });

  // Final Summary Section
  lines.push('---');
  lines.push('');
  lines.push('## 🏁 Final Verdict');
  lines.push('');

  // Determine overall pass status
  const apiTestsPassed = report.test_results.filter(r => r.validation.pass).length === report.total;
  const specPassed = report.spec_validation?.pass ?? true;
  const overallPass = apiTestsPassed && (report.spec_validation_skipped || specPassed);

  if (overallPass) {
    lines.push('### ✅ All Tests Passed!');
    lines.push('');
    lines.push('**Congratulations!** Your implementation:');
    lines.push('- ✅ Successfully handles all test inputs');
    lines.push('- ✅ Produces outputs conforming to the API schema');
    if (!report.spec_validation_skipped && report.spec_validation?.pass) {
      lines.push('- ✅ Correctly implements all scenario requirements');
      lines.push('- ✅ Uses the required APIs and features as specified');
      lines.push('- ✅ Returns genuine API responses without hardcoding');
    }
  } else {
    lines.push('### ❌ Some Tests Failed');
    lines.push('');
    lines.push('**Issues Found:**');
    if (!apiTestsPassed) {
      const apiPassed = report.test_results.filter(r => r.validation.pass).length;
      lines.push(`- API Tests: ${apiPassed}/${report.total} passed`);
      lines.push('- Please review the detailed test results above');
    }
    if (!report.spec_validation_skipped && !specPassed) {
      lines.push('- Spec Compliance: Failed');
      lines.push('- Please review the Specification Compliance Validation section above');
    }
  }
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`📅 Generated at: ${new Date().toISOString()}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Save comprehensive final result as markdown in workspace directory
 */
export function saveFinalResultMarkdown(report: ScenarioReport, workspaceDir: string): string {
  const markdown = generateFinalResultMarkdown(report);
  const markdownPath = path.join(workspaceDir, 'final_result.md');

  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  return markdownPath;
}

/**
 * Generate benchmark summary markdown for all configs
 */
export function generateBenchmarkSummaryMarkdown(
  summary: SummaryReport,
  outputDir?: string
): string {
  const lines: string[] = [];
  const reportsDir = outputDir || PATHS.REPORTS_DIR;

  // Header
  lines.push('# 🎯 Benchmark Results');
  lines.push('');
  lines.push(`**Run ID**: ${summary.run_id} | **Date**: ${new Date(summary.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  const configNames = Object.keys(summary.configs);

  // Overall Statistics Table
  lines.push('## 📊 Overall Statistics');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Scenarios | ${summary.total_scenarios} |`);
  lines.push(`| Configurations Tested | ${configNames.length} |`);

  const totalRuns = summary.total_scenarios * configNames.length;
  let totalPassed = 0;
  let totalTestCases = 0;
  let passedTestCases = 0;

  for (const config of configNames) {
    const stats = summary.configs[config];
    totalPassed += stats.passed_scenarios;
    totalTestCases += stats.total_test_cases;
    passedTestCases += stats.passed_test_cases;
  }

  const overallPassRate = totalRuns > 0 ? (totalPassed / totalRuns) * 100 : 0;
  lines.push(`| Total Scenario Runs | ${totalPassed}/${totalRuns} (${overallPassRate.toFixed(1)}%) |`);
  lines.push(`| Total Test Cases | ${passedTestCases}/${totalTestCases} (${totalTestCases > 0 ? ((passedTestCases / totalTestCases) * 100).toFixed(1) : '0'}%) |`);
  lines.push('');

  // Config Performance Comparison Table
  lines.push('## 🔧 Configuration Performance');
  lines.push('');
  lines.push('| Config | Scenarios | Pass Rate | Test Cases | Agent Avg Time | MCP Avg Calls | MCP Avg Time | MCP Avg In | MCP Avg Out |');
  lines.push('|--------|-----------|-----------|------------|----------------|---------------|--------------|------------|-------------|');

  for (const config of configNames) {
    const stats = summary.configs[config];
    const passRate = (stats.pass_rate * 100).toFixed(1);
    const testCaseRate = stats.total_test_cases > 0
      ? ((stats.passed_test_cases / stats.total_test_cases) * 100).toFixed(1)
      : '0';

    // Calculate average agent time and MCP stats
    let totalAgentTime = 0;
    let totalMcpCalls = 0;
    let totalMcpTime = 0;
    let totalMcpInputTokens = 0;
    let totalMcpOutputTokens = 0;
    let scenarioCount = 0;
    let mcpScenarioCount = 0;

    for (const scenarioSum of summary.scenarios) {
      const report = loadScenarioReport(config, scenarioSum.scenario_id, outputDir);
      if (report?.agent_stats) {
        totalAgentTime += report.agent_stats.elapsed_ms;
        scenarioCount++;
      }
      if (report?.mcp_stats) {
        totalMcpCalls += report.mcp_stats.total_calls;
        totalMcpTime += report.mcp_stats.total_elapsed_ms;
        totalMcpInputTokens += report.mcp_stats.total_input_tokens;
        totalMcpOutputTokens += report.mcp_stats.total_output_tokens;
        mcpScenarioCount++;
      }
    }

    const avgTime = scenarioCount > 0 ? (totalAgentTime / scenarioCount / 1000).toFixed(1) : '-';
    const avgMcpCalls = mcpScenarioCount > 0 ? (totalMcpCalls / mcpScenarioCount).toFixed(1) : '0';
    const avgMcpTime = mcpScenarioCount > 0 ? (totalMcpTime / mcpScenarioCount / 1000).toFixed(1) : '0';
    const avgMcpInputTokens = mcpScenarioCount > 0 ? Math.round(totalMcpInputTokens / mcpScenarioCount).toString() : '0';
    const avgMcpOutputTokens = mcpScenarioCount > 0 ? Math.round(totalMcpOutputTokens / mcpScenarioCount).toString() : '0';

    const statusIcon = stats.pass_rate >= 0.8 ? '✅' : stats.pass_rate >= 0.5 ? '⚠️' : '❌';
    lines.push(`| ${statusIcon} **${config}** | ${stats.passed_scenarios}/${stats.total_scenarios} | ${passRate}% | ${stats.passed_test_cases}/${stats.total_test_cases} (${testCaseRate}%) | ${avgTime}s | ${avgMcpCalls} | ${avgMcpTime}s | ${avgMcpInputTokens} | ${avgMcpOutputTokens} |`);
  }
  lines.push('');

  // Scenario Results Matrix
  lines.push('## 📋 Results by Scenario');
  lines.push('');
  lines.push('| Scenario | ' + configNames.map(c => c).join(' | ') + ' |');
  lines.push('|----------|' + configNames.map(() => '------').join('|') + '|');

  for (const scenarioSum of summary.scenarios) {
    const scenarioId = scenarioSum.scenario_id;
    const results = configNames.map(config => {
      const data = scenarioSum[config];
      if (data && typeof data === 'object' && 'passed' in data && 'total' in data) {
        const isPassed = data.passed === data.total && data.total > 0;
        return isPassed ? `✅ ${data.passed}/${data.total}` : `❌ ${data.passed}/${data.total}`;
      }
      return '➖';
    });

    lines.push(`| ${scenarioId} | ${results.join(' | ')} |`);
  }
  lines.push('');

  // Failure Summary - Only show failed scenarios
  const hasFailures = totalPassed < totalRuns;
  if (hasFailures) {
    lines.push('## ❌ Failure Summary');
    lines.push('');
    lines.push('| Scenario | Config | Status | Error Summary |');
    lines.push('|----------|--------|--------|---------------|');

    for (const scenarioSum of summary.scenarios) {
      const scenarioId = scenarioSum.scenario_id;
      for (const config of configNames) {
        const data = scenarioSum[config];
        if (data && typeof data === 'object' && 'passed' in data && 'total' in data) {
          const isPassed = data.passed === data.total && data.total > 0;
          if (!isPassed) {
            const report = loadScenarioReport(config, scenarioId, outputDir);
            let errorSummary = `${data.passed}/${data.total} tests passed`;

            if (report) {
              const failedTests = report.test_results.filter(t => !t.validation.pass);
              if (failedTests.length > 0) {
                const firstError = failedTests[0];
                if (firstError.error) {
                  errorSummary = firstError.error.split('\n')[0].substring(0, 60) + '...';
                } else if (firstError.validation.errors && firstError.validation.errors.length > 0) {
                  const errMsg = firstError.validation.errors[0];
                  errorSummary = (typeof errMsg === 'string' ? errMsg : errMsg.message || JSON.stringify(errMsg)).substring(0, 60);
                }
              } else if (!report.spec_validation_skipped && report.spec_validation && !report.spec_validation.pass) {
                errorSummary = 'Spec validation failed';
              }
            }

            lines.push(`| ${scenarioId} | ${config} | ❌ FAIL | ${errorSummary} |`);
          }
        }
      }
    }
    lines.push('');
  }

  // Performance Insights
  lines.push('## ⚡ Performance Insights');
  lines.push('');
  lines.push('| Config | Fastest Scenario | Slowest Scenario | Avg Agent Turns |');
  lines.push('|--------|------------------|------------------|-----------------|');

  for (const config of configNames) {
    let fastest = { id: '-', time: Infinity };
    let slowest = { id: '-', time: 0 };
    let totalTurns = 0;
    let turnCount = 0;

    for (const scenarioSum of summary.scenarios) {
      const report = loadScenarioReport(config, scenarioSum.scenario_id, outputDir);
      if (report?.agent_stats) {
        const time = report.agent_stats.elapsed_ms / 1000;
        if (time < fastest.time) {
          fastest = { id: scenarioSum.scenario_id, time };
        }
        if (time > slowest.time) {
          slowest = { id: scenarioSum.scenario_id, time };
        }
        totalTurns += report.agent_stats.turns;
        turnCount++;
      }
    }

    const avgTurns = turnCount > 0 ? (totalTurns / turnCount).toFixed(1) : '-';
    const fastestStr = fastest.time !== Infinity ? `${fastest.id} (${fastest.time.toFixed(1)}s)` : '-';
    const slowestStr = slowest.time > 0 ? `${slowest.id} (${slowest.time.toFixed(1)}s)` : '-';

    lines.push(`| ${config} | ${fastestStr} | ${slowestStr} | ${avgTurns} |`);
  }
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('**📁 Detailed Reports**: `reports/{config}/{scenario}.json` | `workspace/${summary.run_id}/{config}/{scenario}/final_result.md`');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate config-specific summary markdown
 */
export function generateConfigSummaryMarkdown(
  summary: SummaryReport,
  configName: string,
  outputDir?: string
): string {
  const lines: string[] = [];
  const reportsDir = outputDir || PATHS.REPORTS_DIR;

  const configStats = summary.configs[configName];
  if (!configStats) {
    throw new Error(`Config ${configName} not found in summary report`);
  }

  // Header
  lines.push(`# 🎯 ${configName.toUpperCase()} Results`);
  lines.push('');
  lines.push(`**Run ID**: ${summary.run_id} | **Date**: ${new Date(summary.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Overall Statistics Table
  const passRate = (configStats.pass_rate * 100).toFixed(1);
  const testCaseRate = configStats.total_test_cases > 0
    ? ((configStats.passed_test_cases / configStats.total_test_cases) * 100).toFixed(1)
    : '0';
  const overallStatus = configStats.pass_rate === 1.0 ? '✅ ALL PASSED' : configStats.pass_rate >= 0.5 ? '⚠️ PARTIALLY PASSED' : '❌ MOSTLY FAILED';

  lines.push('## 📊 Summary');
  lines.push('');
  lines.push('| Metric | Result |');
  lines.push('|--------|--------|');
  lines.push(`| **Status** | ${overallStatus} |`);
  lines.push(`| Scenarios Passed | ${configStats.passed_scenarios}/${configStats.total_scenarios} (${passRate}%) |`);
  lines.push(`| Test Cases Passed | ${configStats.passed_test_cases}/${configStats.total_test_cases} (${testCaseRate}%) |`);
  lines.push('');

  // Scenario Results Table
  lines.push('## 📋 Scenario Results');
  lines.push('');
  lines.push('| Scenario | Status | API Tests | Spec | Agent | MCP | Total Time |');
  lines.push('|----------|--------|-----------|------|-------|-----|------------|');

  for (const scenarioSum of summary.scenarios) {
    const scenarioId = scenarioSum.scenario_id;
    const data = scenarioSum[configName];

    if (data && typeof data === 'object' && 'passed' in data && 'total' in data) {
      const isPassed = data.passed === data.total && data.total > 0;
      const statusIcon = isPassed ? '✅' : '❌';

      const report = loadScenarioReport(configName, scenarioId, outputDir);
      if (report) {
        const apiTestsPassed = report.test_results.filter(t => t.validation.pass).length;
        const apiStr = `${apiTestsPassed}/${report.total}`;

        let specStr = '➖';
        if (report.spec_validation_skipped) {
          specStr = '➖ Skip';
        } else if (report.spec_validation) {
          specStr = report.spec_validation.pass ? '✅ Pass' : '❌ Fail';
        }

        const agentStr = report.agent_stats
          ? `${report.agent_stats.turns}t / ${(report.agent_stats.elapsed_ms / 1000).toFixed(0)}s`
          : '-';

        const mcpStr = report.mcp_stats
          ? `${report.mcp_stats.total_calls}c / ${(report.mcp_stats.total_elapsed_ms / 1000).toFixed(1)}s / ${report.mcp_stats.total_input_tokens}→${report.mcp_stats.total_output_tokens}t`
          : '0';

        const totalTimeStr = `${(report.total_elapsed_ms / 1000).toFixed(0)}s`;

        lines.push(`| ${scenarioId} | ${statusIcon} | ${apiStr} | ${specStr} | ${agentStr} | ${mcpStr} | ${totalTimeStr} |`);
      }
    }
  }
  lines.push('');

  // Failures Section - Only show if there are failures
  const failedScenarios = summary.scenarios.filter(s => {
    const data = s[configName];
    if (data && typeof data === 'object' && 'passed' in data && 'total' in data) {
      return !(data.passed === data.total && data.total > 0);
    }
    return false;
  });

  if (failedScenarios.length > 0) {
    lines.push('## ❌ Failure Details');
    lines.push('');
    lines.push('| Scenario | Test | Error Type | Error Message |');
    lines.push('|----------|------|------------|---------------|');

    for (const scenarioSum of failedScenarios) {
      const scenarioId = scenarioSum.scenario_id;
      const report = loadScenarioReport(configName, scenarioId, outputDir);

      if (report) {
        const failedTests = report.test_results.filter(t => !t.validation.pass);

        if (failedTests.length > 0) {
          failedTests.forEach((test, idx) => {
            const testNum = report.test_results.indexOf(test) + 1;
            let errorType = 'API Schema';
            let errorMsg = 'Unknown error';

            if (test.error) {
              errorType = 'Runtime Error';
              errorMsg = test.error.split('\n')[0].substring(0, 80);
            } else if (test.validation.errors && test.validation.errors.length > 0) {
              const err = test.validation.errors[0];
              if (typeof err === 'object' && err.message) {
                errorMsg = err.message.substring(0, 80);
              } else if (typeof err === 'string') {
                errorMsg = err.substring(0, 80);
              } else {
                errorMsg = JSON.stringify(err).substring(0, 80);
              }
            }

            lines.push(`| ${scenarioId} | #${testNum} | ${errorType} | ${errorMsg} |`);
          });
        } else if (!report.spec_validation_skipped && report.spec_validation && !report.spec_validation.pass) {
          const reasoning = report.spec_validation.reasoning.substring(0, 80);
          lines.push(`| ${scenarioId} | All | Spec Compliance | ${reasoning} |`);
        }
      }
    }
    lines.push('');

    // Detailed Error Messages
    lines.push('### 📝 Detailed Error Messages');
    lines.push('');

    for (const scenarioSum of failedScenarios) {
      const scenarioId = scenarioSum.scenario_id;
      const report = loadScenarioReport(configName, scenarioId, outputDir);

      if (report) {
        lines.push(`#### ${scenarioId}`);
        lines.push('');

        const failedTests = report.test_results.filter(t => !t.validation.pass);
        if (failedTests.length > 0) {
          failedTests.forEach((test, idx) => {
            const testNum = report.test_results.indexOf(test) + 1;
            lines.push(`**Test ${testNum}:**`);
            lines.push('```');
            if (test.error) {
              lines.push(test.error.split('\n').slice(0, 10).join('\n'));
            } else if (test.validation.errors && test.validation.errors.length > 0) {
              lines.push(JSON.stringify(test.validation.errors, null, 2));
            }
            lines.push('```');
            lines.push('');
          });
        }

        if (!report.spec_validation_skipped && report.spec_validation && !report.spec_validation.pass) {
          lines.push('**Spec Compliance:**');
          lines.push('```');
          lines.push(report.spec_validation.reasoning);
          if (report.spec_validation.violations.length > 0) {
            lines.push('');
            lines.push('Violations:');
            report.spec_validation.violations.forEach(v => {
              lines.push(`- ${v}`);
            });
          }
          lines.push('```');
          lines.push('');
        }

        lines.push('---');
        lines.push('');
      }
    }
  }

  // Footer
  lines.push('**📁 Detailed Reports**: `reports/${configName}/` | `workspace/${summary.run_id}/${configName}/`');
  lines.push('');

  return lines.join('\n');
}

/**
 * Save benchmark summary markdown to workspace
 */
export function saveBenchmarkSummaryMarkdown(
  summary: SummaryReport,
  runId: string,
  outputDir?: string
): string {
  const markdown = generateBenchmarkSummaryMarkdown(summary, outputDir);
  const workspaceRunDir = path.join('workspace', runId);
  fs.ensureDirSync(workspaceRunDir);

  const markdownPath = path.join(workspaceRunDir, 'bench_result.md');
  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  return markdownPath;
}

/**
 * Save config-specific summary markdown to workspace
 */
export function saveConfigSummaryMarkdown(
  summary: SummaryReport,
  configName: string,
  runId: string,
  outputDir?: string
): string {
  const markdown = generateConfigSummaryMarkdown(summary, configName, outputDir);
  const configWorkspaceDir = path.join('workspace', runId, configName);
  fs.ensureDirSync(configWorkspaceDir);

  const markdownPath = path.join(configWorkspaceDir, `${configName}_result.md`);
  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  return markdownPath;
}
