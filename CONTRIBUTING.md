# Contributing to Context Bench

Thank you for your interest in contributing! This guide will help you add scenarios, MCP configurations, and improvements to the benchmark.

## Quick Start

Context Bench is designed for easy contribution - **most additions require no code changes**. You can add scenarios and MCP configurations by adding YAML files and oracle implementations.

## Adding Scenarios

### 1. Choose a Framework Package

Context Bench organizes scenarios by AI framework packages. Choose an existing package or create a new one:

**Existing packages:**
- `autogen` - Microsoft Autogen
- `langgraph` - LangGraph by LangChain
- `openai-agents` - OpenAI Agents SDK
- `agno` - Agno framework
- `openrouter-sdk` - OpenRouter SDK

### 2. Add Scenario to Package YAML

Edit `scenarios/{package}.yaml` or create a new one:

```yaml
package-id: my-framework
name: My AI Framework
registry: py_pi                    # or npm for TypeScript packages
context7-id: /org/my-framework     # Context7 library identifier
deepcon-id: my-framework           # Deepcon package name (optional)

scenarios:
  - id: streaming-agent
    query: |
      Using the My Framework library, build an agent with streaming
      capabilities. The agent should respond to user queries in real-time
      and handle tool calling for external APIs.
    oracle: scenarios/my-framework/streaming_agent.py
    sources:
      - https://docs.my-framework.io/quickstart
      - https://docs.my-framework.io/streaming

  - id: multi-agent-team
    query: |
      Create a multi-agent team with task delegation. Build a research
      crew that can plan subtasks, execute them in parallel, and
      aggregate results.
    oracle: scenarios/my-framework/multi_agent_team.py
    sources:
      - https://docs.my-framework.io/teams

runtime:
  language: python
  version: "python3.11"

env_vars:
  OPENAI_API_KEY: "${OPENAI_API_KEY}"
```

### 3. Create Oracle Implementation

Create `scenarios/{package}/{scenario_id}.py` (or `.ts` for TypeScript):

```python
"""
Oracle implementation for streaming-agent scenario.

This file demonstrates the EXPECTED implementation that MCP context
should enable. Evaluators compare MCP documentation against this
reference to determine if sufficient context was provided.
"""

from my_framework import Agent, StreamingModel

def main():
    # Initialize agent with streaming
    agent = Agent(
        model=StreamingModel(id="gpt-4"),
        streaming=True
    )

    # Run agent with query
    response = agent.run(
        query="What's the weather like?",
        stream=True
    )

    # Handle streaming response
    for chunk in response:
        print(chunk, end="", flush=True)

if __name__ == "__main__":
    main()
```

**Oracle Best Practices:**
- ✅ Use realistic, complete implementations
- ✅ Include imports and setup
- ✅ Demonstrate key APIs and parameters
- ✅ Show usage patterns clearly
- ✅ Include error handling if critical
- ✅ Keep code concise but complete

### 4. Scenario Query Best Practices

Every scenario `query` should:

✅ **Specify the framework** - "Using the {Framework} library..."
✅ **Define the task clearly** - What needs to be implemented
✅ **Include key requirements** - Tool calling, streaming, team orchestration, etc.
✅ **Be implementation-focused** - What to build, not how to build it
✅ **Test MCP differentiation** - Complex enough to differentiate between MCP servers

**Good Query Example:**
```
Using the Autogen Python library with selector-based group chat,
create a small research 'crew': (1) Plan subtasks; (2) run a mock
web search; (3) compute a percentage change; Stop when planning is
complete and say 'TERMINATE'.
```

**Bad Query Example:**
```
Make an agent that does stuff with Autogen.
```

### 5. Test Your Scenario

```bash
# Test with single MCP server
npx tsx harness/cli.ts \
  --scenario my-framework:streaming-agent \
  --mode oneshot \
  --config nia \
  --verbose

# Test with all MCP servers
npx tsx harness/cli.ts \
  --scenario my-framework:streaming-agent \
  --mode oneshot \
  --all-configs

# Check evaluation results
cat workspace/run-*/oneshot/nia/my-framework:streaming-agent/evaluation_oneshot.json
```

### 6. Required Fields Checklist

For package YAML:
- [ ] `package-id` - Unique identifier (kebab-case)
- [ ] `name` - Human-readable framework name
- [ ] `registry` - Package registry (py_pi, npm)
- [ ] `scenarios` - List of scenarios with id, query, oracle, sources
- [ ] `runtime` - Language and version
- [ ] `env_vars` - Environment variables needed

For each scenario:
- [ ] `id` - Unique scenario identifier (kebab-case)
- [ ] `query` - Clear task description
- [ ] `oracle` - Path to reference implementation
- [ ] `sources` - Official documentation URLs

### 7. Scenario Complexity Guidelines

**Simple scenarios** (1-2 API patterns):
- Basic agent initialization
- Single tool calling
- Simple streaming

**Complex scenarios** (3+ API patterns):
- Multi-agent teams
- Parallel execution
- State management
- Human-in-the-loop
- Complex orchestration

**Prefer complex scenarios** for better MCP server differentiation.

### 8. Submit Pull Request

```bash
git checkout -b add-scenario-{name}
git add scenarios/{package}.yaml scenarios/{package}/{scenario}.py
git commit -m "Add {framework}:{scenario} scenario"
git push origin add-scenario-{name}
```

Open PR with:
- Description of the framework and scenario
- Example MCP context expectations
- Evaluation results across MCP servers

## Adding MCP Configurations

### 1. Create Config TypeScript File

Create `mcp-configs/{config-name}.ts`:

```typescript
import { MCPConfig } from '../harness/types.js';

export const myMcpConfig: MCPConfig = {
  config_name: 'my-mcp',
  description: 'My MCP Documentation Server',
  mcp_servers: {
    'my-server': {
      command: 'npx',
      args: ['-y', '@my-org/mcp-server'],
      env: {
        MY_API_KEY: process.env.MY_API_KEY!,
      },
    },
  },
  env_requirements: ['MY_API_KEY'],
};
```

### 2. Export Config

Add to `mcp-configs/index.ts`:

```typescript
export { myMcpConfig } from './my-mcp.js';
```

Add to `harness/config-loader.ts`:

```typescript
import { myMcpConfig } from '../mcp-configs/index.js';

const MCP_CONFIGS: Record<string, MCPConfig> = {
  baseline: baselineConfig,
  nia: niaConfig,
  context7: context7Config,
  deepcon: deepconConfig,
  exa: exaConfig,
  'my-mcp': myMcpConfig,  // Add this line
};
```

### 3. Test Configuration

```bash
# Test with single scenario
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --config my-mcp

# Compare with other MCP servers
npx tsx harness/cli.ts \
  --scenario autogen:streaming-tools \
  --mode oneshot \
  --all-configs
```

### 4. Document Requirements

Add to your PR description:
- MCP server name and purpose
- Installation requirements
- API key setup instructions
- Expected documentation characteristics

## Code Contributions

### Understanding the Architecture

Key modules:
- `harness/cli.ts` - CLI interface
- `harness/run-scenario.ts` - Main orchestration
- `harness/oneshot-runner.ts` - MCP tool call execution
- `harness/evaluator.ts` - Multi-model evaluation
- `harness/mcp-client.ts` - MCP server connection
- `harness/scenario-loader.ts` - YAML parsing

### Improving the Harness

1. **Read existing code**
   - Understand oneshot mode execution
   - Review multi-model evaluation logic
   - Study MCP client management

2. **Follow existing patterns**
   - Specification-driven execution (YAML configs)
   - Clear separation of concerns
   - Comprehensive logging

3. **Testing your changes:**
   ```bash
   # Test with verbose logging
   npx tsx harness/cli.ts \
     --scenario autogen:streaming-tools \
     --mode oneshot \
     --config nia \
     --verbose
   ```

4. **Code style:**
   - TypeScript with strict mode
   - JSDoc comments for public APIs
   - ES modules (not CommonJS)
   - Consistent error handling

## Evaluation System

### Multi-Model Evaluation

Context Bench uses 3 LLMs for consensus-based evaluation:
- GPT-5 (OpenAI)
- Grok-4 (xAI)
- Deepseek-v3.2 (Deepseek)

Each model evaluates:
- **Completeness** (Boolean): Can all requirements be inferred from MCP context?
- **Relevance** (Boolean): Does MCP context address the task?
- **Overall Score** (1-5): Quality assessment
- **Confidence** (high/medium/low): Evaluator certainty

**Pass Criteria:** 2/3 models must agree on both completeness AND relevance.

## Documentation

### Files to Update

- **README.md** - Main documentation
- **CONTRIBUTING.md** - This file
- **SETUP.md** - Installation guide (if needed)

### Adding Examples

We welcome:
- Scenario walkthroughs
- MCP server comparison analyses
- Framework integration guides
- Evaluation result interpretations

## Testing Guidelines

### Before Submitting PR

1. **Test your scenario with all MCP servers**
   ```bash
   npx tsx harness/cli.ts \
     --scenario {package}:{scenario} \
     --mode oneshot \
     --all-configs
   ```

2. **Verify evaluation results**
   ```bash
   # Check pass/fail for each MCP server
   find workspace -name "evaluation_oneshot.json" | \
     xargs jq '{scenario, pass: .aggregated.pass}'
   ```

3. **Count tokens**
   ```bash
   npx tsx scripts/count-tokens.ts workspace/run-{timestamp}
   ```

4. **Review evaluation reasoning**
   ```bash
   # Check why scenarios passed or failed
   jq '.models[].reasoning' workspace/.../evaluation_oneshot.json
   ```

## Issue Reporting

### Bug Reports

Include:
1. **Environment**
   - OS and version
   - Node.js version
   - MCP server versions

2. **Command used**
   ```bash
   npx tsx harness/cli.ts --scenario X --config Y --verbose
   ```

3. **Logs**
   - Attach relevant log output
   - Include error stack traces

4. **Expected vs Actual**
   - What you expected
   - What actually happened
   - Evaluation results if applicable

### Feature Requests

Describe:
1. **Use case** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Impact** - Who benefits?

## Design Principles

When contributing, follow these principles:

1. **Specification-driven**
   - Prefer YAML/JSON over code
   - Keep harness generic and reusable

2. **Zero code changes for scenarios**
   - Adding scenarios shouldn't require harness modifications
   - Use YAML + oracle files only

3. **Fair evaluation**
   - Multi-model consensus reduces bias
   - Clear evaluation criteria
   - Transparent reasoning

4. **Research quality**
   - Controlled experiments (fixed evaluators)
   - Clear independent/dependent variables
   - Reproducible results

## Community

- **Questions?** Open a GitHub Discussion
- **Bugs?** Open a GitHub Issue
- **Ideas?** Start a Discussion or RFC

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Every contribution helps make Context Bench better. Whether you're adding a scenario, improving documentation, or adding MCP server support - thank you for your help!
