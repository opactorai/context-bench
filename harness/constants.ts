/**
 * Constants and log markers for the benchmark harness
 * Following SWE-bench pattern of centralized constants
 */

export const LOG_MARKERS = {
  // Workspace
  WORKSPACE_INIT_START: '>>>>> Initializing Workspace',
  WORKSPACE_INIT_SUCCESS: '>>>>> Workspace Ready',
  WORKSPACE_INIT_FAIL: '>>>>> Workspace Init Failed',

  // MCP Configuration
  MCP_CONFIG_START: '>>>>> Applying MCP Configuration',
  MCP_CONFIG_SUCCESS: '>>>>> MCP Configuration Applied',
  MCP_CONFIG_FAIL: '>>>>> MCP Configuration Failed',

  // Agent
  AGENT_START: '>>>>> Invoking Agent',
  AGENT_THINKING: '>>>>> Agent Thinking',
  AGENT_TOOL_USE: '>>>>> Agent Tool Use',
  AGENT_SUCCESS: '>>>>> Agent Completed',
  AGENT_FAIL: '>>>>> Agent Failed',
  AGENT_TIMEOUT: '>>>>> Agent Timed Out',

  // Build
  BUILD_START: '>>>>> Building Service',
  BUILD_SUCCESS: '>>>>> Build Complete',
  BUILD_FAIL: '>>>>> Build Failed',

  // Service
  SERVICE_START: '>>>>> Starting Service',
  SERVICE_READY: '>>>>> Service Ready',
  SERVICE_FAIL: '>>>>> Service Failed to Start',

  // Tests
  TESTS_START: '>>>>> Running Tests',
  TEST_CASE: '>>>>> Test Case',
  TEST_PASS: '>>>>> Test PASS',
  TEST_FAIL: '>>>>> Test FAIL',
  TESTS_COMPLETE: '>>>>> All Tests Complete',
  TESTS_ERROR: '>>>>> Tests Errored',

  // Validation
  VALIDATION_START: '>>>>> Validating Output',
  VALIDATION_PASS: '>>>>> Validation PASS',
  VALIDATION_FAIL: '>>>>> Validation FAIL',

  // Cleanup
  CLEANUP_START: '>>>>> Cleaning Up',
  CLEANUP_SUCCESS: '>>>>> Cleanup Complete',

  // Report
  REPORT_START: '>>>>> Generating Report',
  REPORT_SUCCESS: '>>>>> Report Saved',
} as const;

export const EXIT_CODES = {
  SUCCESS: 0,
  FAILURE: 1,
  CONFIG_ERROR: 2,
  RUNTIME_ERROR: 3,
} as const;

export const DEFAULTS = {
  TIMEOUT_SEC: 120,
  MAX_WORKERS: 1,
  MEMORY_MB: 1024,
  SERVICE_PORT: 3000,
  SERVICE_STARTUP_TIMEOUT_MS: 10000,
  TEST_TIMEOUT_MS: 120000, // 2 minutes for API calls (was 30s)
} as const;

export const PATHS = {
  SCENARIOS_DIR: 'scenarios',
  CONFIGS_DIR: 'configs',
  SCAFFOLD_TEMPLATE_DIR: 'scaffold-template',
  REPORTS_DIR: 'reports',
  LOGS_DIR: 'logs',
  WORKSPACE_DIR: 'workspace',
} as const;
