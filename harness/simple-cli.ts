#!/usr/bin/env node

/**
 * Simple CLI for quick testing
 *
 * Usage:
 *   npm run test <package> [scenario] [mode] [config] [options]
 *
 * Examples:
 *   npm run test xai-grok                            # All scenarios in package, agent mode, baseline
 *   npm run test xai-grok latest-ai                  # Specific scenario, agent mode, baseline
 *   npm run test xai-grok latest-ai oneshot          # Specific scenario, oneshot mode, baseline
 *   npm run test xai-grok latest-ai agent context7   # Specific scenario, agent mode, context7
 *   npm run test all                                 # All packages, agent mode, baseline
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get arguments (skip node and script name)
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║             Context Bench - Simple CLI                        ║
╚════════════════════════════════════════════════════════════════╝

Usage: npm run test <package> [scenario] [mode] [config] [options]

Arguments:
  <package>       Package name or "all" for all packages
  [scenario]      Scenario ID (without package prefix)
  [mode]          Execution mode: "oneshot" or "agent" (default: agent)
  [config]        MCP config: baseline, context7, nia, deepcon, exa, firecrawl (default: baseline)

Examples:
  npm run test xai-grok                            # All xai-grok scenarios, agent, baseline
  npm run test xai-grok latest-ai                  # Single scenario, agent, baseline
  npm run test xai-grok latest-ai oneshot          # Single scenario, oneshot, baseline
  npm run test xai-grok latest-ai agent context7   # Single scenario, agent, context7
  npm run test all agent baseline                  # All packages, agent, baseline

Options:
  verbose         - Enable verbose logging
  workers=<n>     - Max workers (e.g., workers=4)
  timeout=<sec>   - Timeout (e.g., timeout=180)

Package Names:
  xai-grok, deepseek, perplexity, exa, firecrawl, tavily, openai, luma, e2b, runway

Other Commands:
  npm run list              - List all packages
  npm run list:scenarios    - List all scenarios
  npm run bench             - Full CLI with all options
`);
  process.exit(0);
}

// Parse arguments
const packageName = args[0];
let scenarioId: string | undefined;
let mode = 'agent';
let config = 'baseline';
const options: string[] = [];

// Determine if second arg is scenario or mode
let argIndex = 1;

if (args[argIndex] && !['oneshot', 'agent', 'baseline', 'context7', 'nia', 'deepcon', 'exa', 'firecrawl', 'all'].includes(args[argIndex]) && !args[argIndex].includes('=')) {
  scenarioId = args[argIndex];
  argIndex++;
}

// Parse mode
if (args[argIndex] && ['oneshot', 'agent'].includes(args[argIndex])) {
  mode = args[argIndex];
  argIndex++;
}

// Parse config
if (args[argIndex] && ['baseline', 'context7', 'nia', 'deepcon', 'exa', 'firecrawl', 'all'].includes(args[argIndex])) {
  config = args[argIndex];
  argIndex++;
}

// Parse remaining options
for (let i = argIndex; i < args.length; i++) {
  const opt = args[i];
  const normalized = opt.toLowerCase();

  if (normalized === 'verbose') {
    options.push('--verbose');
  } else if (normalized.startsWith('workers=')) {
    const workers = opt.split('=')[1];
    options.push('--max-workers', workers);
  } else if (normalized.startsWith('timeout=')) {
    const timeout = opt.split('=')[1];
    options.push('--timeout', timeout);
  }
}

// Build CLI arguments
const cliArgs: string[] = [];

// Add package or scenario
if (packageName === 'all') {
  cliArgs.push('--all-packages');
} else if (scenarioId) {
  // Format: package:scenario
  cliArgs.push('--scenario', `${packageName}:${scenarioId}`);
} else {
  // Just package, run all scenarios in it
  cliArgs.push('--package', packageName);
}

// Add mode
cliArgs.push('--mode', mode);

// Add config
if (config === 'all') {
  cliArgs.push('--all-configs');
} else {
  cliArgs.push('--config', config);
}

// Add options
cliArgs.push(...options);

// Execute CLI
const cliPath = join(__dirname, 'cli.ts');
console.log(`\n🚀 Running: package=${packageName}${scenarioId ? `:${scenarioId}` : ''} mode=${mode} config=${config}\n`);

const child = spawn('tsx', [cliPath, ...cliArgs], {
  stdio: 'inherit',
  shell: false
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
