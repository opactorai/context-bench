/**
 * Type definitions for the benchmark harness
 */

/**
 * Execution mode: oneshot or agent
 */
export type ExecutionMode = 'oneshot' | 'agent';

/**
 * Package specification (new YAML structure)
 */
export interface PackageSpec {
  'package-id': string;
  language: string;
  scenarios: ScenarioItem[];
  runtime: {
    version: string;
  };
  env_vars: Record<string, string>;
}

/**
 * Individual scenario item within a package
 */
export interface ScenarioItem {
  id: string;
  query: string;
  oracle: string;
  sources: string[];
}

/**
 * Legacy scenario specification (for backward compatibility)
 */
export interface ScenarioSpec {
  id: string;
  name: string;
  description?: string;
  runtime?: {
    language: string;
    version: string;
  };
  api: {
    endpoint: string;
    input_schema?: object;
    output_schema: object;
  };
  agent_prompt: string;
  validation_criteria?: string;
  validation?: {
    oracle?: string;
    validation_criteria?: string[];
  };
  test_inputs: any[];
  env_vars?: Record<string, string>;
  constraints?: {
    timeout_sec?: number;
    memory_mb?: number;
    editable_paths?: string[];
  };
}

/**
 * Full scenario identifier: package-id:scenario-id
 */
export interface ScenarioIdentifier {
  packageId: string;
  scenarioId: string;
  fullId: string; // "package-id:scenario-id"
}

export interface MCPConfig {
  config_name: string;
  description: string;
  mcp_servers: Record<string, MCPServerConfig>;
}

export interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface ValidationResult {
  pass: boolean;
  errors: any[];
}

export interface SpecValidationResult {
  pass: boolean;
  reasoning: string;
  violations: string[];
}

export interface TestResult {
  input: any;
  output?: any;
  validation: ValidationResult;
  spec_validation?: SpecValidationResult;
  elapsed_ms?: number;
  error?: string;
  error_details?: {
    status?: number;
    data?: any;
  };
}

export interface ScenarioReport {
  scenario_id: string;
  config: string;
  run_id: string;
  timestamp: string;
  mode?: ExecutionMode;  // oneshot or agent
  passed: number;
  total: number;
  pass_rate: number;
  test_results: TestResult[];
  spec_validation?: SpecValidationResult;  // Scenario-level validation, not per-test
  spec_validation_skipped?: boolean;  // True if spec validation was skipped
  agent_stats?: {
    turns: number;
    tool_calls: number;
    elapsed_ms: number;
  };
  oneshot_stats?: {
    tool_calls: number;
    elapsed_ms: number;
    mcp_tool_used?: string;
    mcp_server_used?: string;
  };
  evaluation?: {
    mode: ExecutionMode;
    score: number;  // 0-100
    evaluation: {
      completeness: number;
      accuracy: number;
      relevance: number;
    };
    feedback: string;
    oracle_match: boolean;
  };
  evaluation_error?: {
    message: string;
    stack?: string;
  };
  mcp_stats?: {
    total_calls: number;
    total_elapsed_ms: number;
    total_input_tokens: number;
    total_output_tokens: number;
  };
  build_time_ms?: number;
  total_elapsed_ms: number;
}

export interface SummaryReport {
  run_id: string;
  timestamp: string;
  total_scenarios: number;
  configs: Record<string, ConfigSummary>;
  scenarios: ScenarioSummary[];
}

export interface ConfigSummary {
  passed_scenarios: number;
  total_scenarios: number;
  pass_rate: number;
  total_test_cases: number;
  passed_test_cases: number;
}

export interface ScenarioSummary {
  scenario_id: string;
  [config: string]: { passed: number; total: number } | string;
}

export interface CLIOptions {
  package?: string;
  scenario?: string;
  scenarios?: string;
  mode?: ExecutionMode;
  config?: string;
  allConfigs?: boolean;
  allPackages?: boolean;
  runId: string;
  maxWorkers?: number;
  timeout?: number;
  keepWorkspace?: boolean;
  verbose?: boolean;
  outputDir?: string;
  listPackages?: boolean;
  listScenarios?: boolean;
  listConfigs?: boolean;
  showScenario?: string;
  showPackage?: string;
}

export interface RunContext {
  scenario: ScenarioSpec;
  config: MCPConfig;
  mode: ExecutionMode;
  runId: string;
  workspaceDir: string;
  logDir: string;
  timeout: number;
  verbose: boolean;
  keepWorkspace: boolean;
  isParallel?: boolean;
  sharedMcpManager?: any;  // Shared MCP client manager for parallel execution
}

/**
 * Extended scenario report with mode information
 */
export interface ExtendedScenarioReport extends ScenarioReport {
  mode: ExecutionMode;
  package_id: string;
}
