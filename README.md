# Context Bench

![Context Bench](./assets/context-bench.png)

> **Benchmark measuring how accurately MCP servers provide context to coding agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

Context Bench measures how effectively different MCP servers help AI agents understand and implement complex AI framework workflows. It focuses on **oneshot scenario** where a single MCP tool call provides documentation context for coding agents.

---

## What This Benchmarks

**Question**: *Which MCP server provides the most effective context when implementing modern AI frameworks?*

- **Task**: AI framework integration (Autogen, LangGraph, OpenAI Agents, Agno, OpenRouter)
- **MCP Servers Tested**:
  - **NIA**: Hybrid package search with documentation fallback
  - **Context7**: Library-specific documentation retrieval
  - **Deepcon**: Deep context understanding across codebases
  - **Exa**: Semantic web search and code discovery

---

## How the Benchmark Works

### Overview

Context Bench evaluates whether MCP servers provide **sufficient context** for implementing complex AI framework workflows. Unlike traditional benchmarks that test code execution, this benchmark measures **documentation completeness** - the quality and sufficiency of context provided by MCP servers.

### Scenario Design

Each scenario is carefully designed to be **realistic and challenging**

- **Complex Queries**: Scenarios require information scattered across multiple documentation pages, simulating real-world development tasks where developers need to synthesize knowledge from various sources (e.g., combining streaming, tool calling, and error handling in a single implementation).

- **Oracle Code Creation**: For each scenario query, we create oracle implementation code based on the official documentation referenced in the scenario's `sources` field. This oracle code represents a **typical, working example** of how to implement the requested functionality using the framework's recommended patterns and best practices.

- **Realistic Requirements**: Queries specify concrete tasks (e.g., "build a multi-agent system with team termination conditions") rather than simple API lookups, testing whether MCP servers can provide comprehensive context for multi-faceted implementations.

The goal is to test whether MCP servers can retrieve and present documentation that enables developers to implement complex, multi-component features - not just look up individual API signatures.

### Benchmark Process

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Query MCP Server (Oneshot Mode)                        │
│ • Send scenario query to MCP server                            │
│ • MCP server returns documentation/code examples               │
│ • Single tool call per scenario                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Multi-Model Evaluation                                 │
│ • 3 LLMs evaluate in parallel:                                 │
│   - GPT-5 (OpenAI)                                             │
│   - Grok-4 (xAI)                                               │
│   - Deepseek-v3.2 (Deepseek)                                   │
│ • Each model compares MCP context against oracle code          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Scoring Criteria                                       │
│ • Completeness (Boolean): Can all requirements be inferred?    │
│   - API names, parameter types, return values                  │
│   - Usage patterns, error handling                             │
│ • Relevance (Boolean): Does context address the task?          │
│ • Overall Score (1-5): Quality assessment                      │
│ • Confidence (high/medium/low): Evaluator certainty            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Majority Vote Decision                                 │
│ • Completeness: 2/3 models must agree = PASS                   │
│ • Relevance: 2/3 models must agree = PASS                      │
│ • Final Verdict: BOTH must pass for scenario to pass           │
└─────────────────────────────────────────────────────────────────┘
```

### Evaluation Philosophy

**What We Evaluate:**
- ✅ Does the MCP context contain enough information to implement the oracle code?
- ✅ Can API signatures, parameters, and return types be inferred from examples?
- ✅ Are usage patterns demonstrated clearly?
- ✅ Does documentation cover all user requirements?

**What We Don't Evaluate:**
- ❌ Whether implementation matches oracle exactly (functional equivalence is OK)
- ❌ Code quality or style
- ❌ Performance or efficiency

---

## Benchmark Results

### Accuracy by MCP Server

Multi-model evaluation (GPT-5, Grok-4, Deepseek-v3.2) across 20 AI framework integration scenarios

| MCP Server | Scenarios Passed |
|------------|------------------|
| **Deepcon** | 18 |
| **Context7** | 13 |
| **NIA** | 11 |
| **Exa** | 5 |
| **Baseline (Claude Sonnet 4.5)** | 0 |

**Key Finding**: Deepcon provides the most effective documentation context for AI framework integration tasks, with 90% success rate.

**Note**: The baseline test used Claude Sonnet 4.5 without any tools. Without external tools, the model was unable to successfully implement any of the 20 AI framework integration scenarios (because of the knowledge cutoff).

### Token Usage by MCP Server

Based on recent benchmark runs across 20 scenarios:

| MCP Server | Avg Tokens/Scenario | Total Tokens |
|------------|---------------------|--------------|
| **Context7** | 5,626 | **112,515** |
| **Exa** | 4,753 | **95,065** |
| **Deepcon** | 2,365 | **47,290** |
| **NIA** | 1,873 | **37,457** |

**Key Finding**: More tokens doesn't guarantee better accuracy. Deepcon achieves 90% success with only 2,365 avg tokens, while Context7 provides 5,626 tokens but achieves 65% success.

### View Full Results

Complete benchmark results including detailed evaluations, MCP responses, and per-scenario breakdowns are available in [`sample_workspace/`](sample_workspace/). Each run directory contains:
- Individual scenario results with full MCP context
- Multi-model evaluation scores and reasoning
- Token usage statistics per scenario
- Aggregated reports by MCP server

**Example**: Browse [`sample_workspace/run-2025-11-06-1653/`](sample_workspace/run-2025-11-06-1653/) to see a complete benchmark run with all 20 scenarios across 4 MCP servers.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MCP Server API Keys** (see [Configuration](#configuration))

### Installation

```bash
git clone https://github.com/your-org/context-bench.git
cd context-bench
npm install
```

### Setup

```bash
# Create environment file
cp .env.example .env

# Add your API keys
nano .env
```

**Required environment variables**:
```bash
# MCP Server Credentials
NIA_API_KEY=your_nia_api_key
CONTEXT7_API_KEY=your_context7_api_key
DEEPCON_API_KEY=your_deepcon_api_key

# Evaluation
OPENROUTER_API_KEY=your_openrouter_api_key  # For multi-model evaluation
```

### Run Your First Benchmark

#### Single Scenario

```bash
# Test with NIA server
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --config nia

# Test with Context7 server
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --config context7

# Test with Deepcon server
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --config deepcon
```

#### Multiple Scenarios

```bash
# Run all autogen scenarios with NIA
npx tsx harness/cli.ts \
  --package autogen \
  --mode oneshot \
  --config nia

# Run specific scenarios
npx tsx harness/cli.ts \
  --scenarios autogen:streaming-tools,langgraph:parallel-brief \
  --mode oneshot \
  --config context7
```

#### Compare All MCP Servers

```bash
# Run single scenario across all MCP configs
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --all-configs

# Run all scenarios with all configs (parallel execution)
npx tsx harness/cli.ts \
  --all-packages \
  --mode oneshot \
  --all-configs \
  --max-workers 4
```

**Expected output**:
```
Context Bench v1.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run ID: run-2025-11-07-0900
Mode: oneshot
Scenarios: autogen:streaming-tools
Configs: nia
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ Running config: nia

  ▶ Scenario: autogen:streaming-tools
    [1/8] Loading scenario specification... ✓
    [2/8] Validating environment variables... ✓
    [3/8] Initializing workspace... ✓
    [4/8] Applying MCP configuration... ✓
    [5/8] Running oneshot mode (single MCP tool call)... ✓
    [7.6/8] Evaluating result against oracle... ✓
    [8/8] Generating report... ✓

    ✓ PASS: 1/1 passed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results: 1/1 scenarios passed (100%)
Elapsed: 45.2s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Benchmark Structure

### Packages and Scenarios

The benchmark includes **5 AI framework packages** with **20 scenarios**:

```
scenarios/
├── autogen.yaml                  # Package definition
├── autogen/                      # Oracle implementations
│   ├── streaming_tools.py
│   ├── selector_groupchat.py
│   ├── team_termination.py
│   └── hitl_persist.py
├── langgraph.yaml
├── langgraph/
│   ├── parallel_brief.py
│   ├── hil_writer.py
│   ├── functional_review.py
│   └── two_agent_subgraphs.py
├── openai-agents.yaml
├── openai-agents/
│   ├── streaming_tools.py
│   ├── handoffs_guardrails.py
│   ├── sessions_context.py
│   └── realtime_agent.py
├── agno.yaml
├── agno/
│   ├── trend_scout.py
│   ├── content_team.py
│   ├── visual_explainer.py
│   └── copy_workflow.py
├── openrouter-sdk.yaml
└── openrouter-sdk/               # TypeScript implementations
    ├── usage_and_keys.ts
    ├── models_and_providers.ts
    ├── structured_tools.ts
    └── auto_router_stream.ts
```

### Package Definition Format

Each package is defined in `<package-name>.yaml` at the `scenarios/` root:

```yaml
package-id: autogen
language: python                   # Runtime language
registry: py_pi                    # Package registry (py_pi, npm, for Nia)
context7-id: /microsoft/autogen    # Context7 library identifier
deepcon-id: autogen                # Deepcon package name (optional)

scenarios:
  - id: streaming-tools
    query: "Using the Autogen Python library, build an agent with tool
            calling and streaming capabilities. Plan a 30-second 'market
            brief' for EUR→KRW travelers..."
    oracle: scenarios/autogen/streaming_tools.py
    sources:
      - https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/quickstart.html
      - https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/tutorial/agents.html

  - id: selector-groupchat
    query: "Using the Autogen Python library with selector-based group
            chat, create a small research 'crew': (1) Plan subtasks;
            (2) run a mock web search; (3) compute a percentage change..."
    oracle: scenarios/autogen/selector_groupchat.py
    sources:
      - https://microsoft.github.io/autogen/dev/user-guide/agentchat-user-guide/tutorial/selector-group-chat.html

runtime:
  version: "python3.11"

env_vars:
  OPENAI_API_KEY: "${OPENAI_API_KEY}"
```

### Oracle Files

Each scenario has an oracle implementation file (Python `.py` or TypeScript `.ts`) that contains reference implementation code. These oracle implementations are used by the multi-model evaluation system to assess whether the MCP-provided documentation contains sufficient information to implement the required functionality.

**Note**: Most packages use Python, but `openrouter-sdk` uses TypeScript since it's an npm package.

---

## Understanding Results

### Directory Structure

```
workspace/
└── run-2025-11-07-0900/
    ├── oneshot/                          # Oneshot execution results
    │   ├── nia/                          # NIA MCP server results
    │   │   ├── autogen:streaming-tools/
    │   │   │   ├── oneshot_result.md    # Raw MCP response
    │   │   │   ├── final_result.md      # Full report with evaluation
    │   │   │   └── evaluation_oneshot.json
    │   │   └── autogen:selector-groupchat/
    │   ├── context7/                     # Context7 results
    │   └── deepcon/                      # Deepcon results
    ├── nia/
    │   └── nia_result.md                 # Config summary + token stats
    ├── context7/
    │   └── context7_result.md
    └── deepcon/
        └── deepcon_result.md
```

---

## CLI Reference

### Main CLI Options

```bash
npx tsx harness/cli.ts [options]

Options:
  --package <name>         Run all scenarios in a package
  --scenario <pkg:id>      Run specific scenario (format: package:scenario)
  --scenarios <ids>        Comma-separated scenario IDs
  --mode <type>            Execution mode: oneshot or agent (default: agent)
  --config <name>          MCP configuration (nia, context7, deepcon)
  --all-configs            Run with all MCP configurations
  --all-packages           Run all packages
  --max-workers <n>        Parallel execution limit (default: 1)
  --timeout <seconds>      Timeout per scenario (default: 120)
  --verbose                Detailed logging to stdout
  --list-packages          List all available packages
  --list-scenarios         List all available scenarios
  --list-configs           List all available MCP configs
  --show-package <name>    Show package details
  --show-scenario <id>     Show scenario details
```

### List Commands

```bash
# List all packages
npx tsx harness/cli.ts --list-packages

# List all scenarios
npx tsx harness/cli.ts --list-scenarios

# List all MCP configs
npx tsx harness/cli.ts --list-configs

# Show package details
npx tsx harness/cli.ts --show-package autogen

# Show scenario details
npx tsx harness/cli.ts --show-scenario autogen:streaming-tools
```

---

## Token Counting

Count tokens in oneshot results:

```bash
# Count tokens for specific config and run
npx tsx scripts/count-tokens.ts workspace/run-2025-11-07-0900 nia

# Count tokens for all configs in a run
npx tsx scripts/count-tokens.ts workspace/run-2025-11-07-0900

# Output
============================================================
Processing config: nia
============================================================
Counting tokens for nia/autogen:streaming-tools...
Counting tokens for nia/autogen:selector-groupchat...
...
✅ Token statistics appended to workspace/run-2025-11-07-0900/nia/nia_result.md
   Total scenarios: 20
   Total tokens: 37,457
   Average tokens: 1,873
```

Token statistics are automatically appended to config summary markdown files.

---

## Adding New Scenarios

### 1. Create Package Directory

```bash
mkdir -p scenarios/new-framework
```

### 2. Define Package

Create `scenarios/new-framework.yaml` in the `scenarios/` root directory:

```yaml
package-id: new-framework
language: python
registry: py_pi
context7-id: /company/new-framework
deepcon-id: new-framework

scenarios:
  - id: basic-agent
    query: "Using the New Framework, create a basic agent that can respond
            to user queries with streaming output."
    oracle: scenarios/new-framework/basic_agent.py
    sources:
      - https://docs.new-framework.ai/quickstart
      - https://docs.new-framework.ai/streaming

  - id: multi-agent-team
    query: "Build a multi-agent team with task delegation and result
            aggregation."
    oracle: scenarios/new-framework/multi_agent_team.py
    sources:
      - https://docs.new-framework.ai/multi-agent

runtime:
  version: "python3.11"

env_vars:
  OPENAI_API_KEY: "${OPENAI_API_KEY}"
```

### 3. Create Oracle Files

Create `scenarios/new-framework/basic_agent.py`:

```python
"""
Oracle implementation for basic-agent scenario.
This is the reference implementation used for evaluation.
"""
from new_framework import Agent

def main():
    # Initialize agent with streaming
    agent = Agent(
        model="gpt-4",
        streaming=True
    )

    # Handle user query
    for chunk in agent.stream("Tell me about AI"):
        print(chunk, end="", flush=True)

if __name__ == "__main__":
    main()
```

### 4. Test

```bash
# Test with single MCP server
npx tsx harness/cli.ts \
  --scenario new-framework:basic-agent \
  --mode oneshot \
  --config nia

# Test with all servers
npx tsx harness/cli.ts \
  --scenario new-framework:basic-agent \
  --mode oneshot \
  --all-configs
```

### 5. Add NIA Fallback (if needed)

If package is not in PyPI/npm registry, add fallback mapping in `harness/oneshot-runner.ts`:

```typescript
const NIA_DOC_FALLBACK_MAP: Record<string, string> = {
  'autogen': '5cc05f18-2f15-4046-885d-4dd9cb4c5f59',
  'openrouter-sdk': 'https://openrouter.ai/docs',
  'new-framework': 'https://docs.new-framework.ai',  // Add this
};
```

### 6. Deepcon ID Override (Optional)

If the Deepcon MCP server requires a different package name than `package-id`, add `deepcon-id` to your YAML:

```yaml
package-id: openai-agents
deepcon-id: agents-sdk    # Deepcon uses "agents-sdk" instead of "openai-agents"
```

When `deepcon-id` is specified, it will be used as the `name` parameter when calling Deepcon's `search_documentation` tool. Otherwise, `package-id` is used by default.

---

## 🛠️ Configuration

### MCP Server Configurations

MCP server definitions in `mcp-configs/`:

```typescript
// mcp-configs/nia.ts
export const niaConfig: MCPConfig = {
  config_name: 'nia',
  description: 'Claude Code + NIA MCP (stdio)',
  mcp_servers: {
    nia: {
      command: 'uvx',
      args: ['nia-mcp-server'],
      env: {
        NIA_API_KEY: process.env.NIA_API_KEY!,
      },
    },
  },
  env_requirements: ['NIA_API_KEY'],
};
```

### Environment Variables

Create `.env` file:

```bash
# MCP Server API Keys
NIA_API_KEY=your_nia_api_key_here
CONTEXT7_API_KEY=your_context7_api_key_here
DEEPCON_API_KEY=your_deepcon_api_key_here

# Evaluation
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Specific evaluation models
EVALUATOR_MODELS=openai/gpt-5,x-ai/grok-4,deepseek/deepseek-v3.2-exp
```

---

## Contributing

Contributions welcome! Please:

1. Add new scenarios following the package structure
2. Include comprehensive oracle files
3. Test with all MCP configurations
4. Update token statistics after adding scenarios

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Links

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [NIA MCP Server](https://github.com/trynia/nia-mcp-server)
- [Context7 Documentation](https://context7.com)
- [Deepcon MCP](https://deepcon.ai)

---

**Built for AI framework documentation research**
