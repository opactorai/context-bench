# Oneshot Mode Result

**Scenario**: autogen:team-termination
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:54:39.311Z

---

## Query

Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically.

---

## Tool Input

```json
{
  "query": "Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically."
}
```

---

## Tool Result

## Run Multi-Agent Chat with OpenAI and Feedback Loop

https://raw.githubusercontent.com/Arize-ai/phoenix/main/docs/section-integrations/frameworks/autogen/autogen-agentchat-tracing.md

```
import asyncio
import os
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai._openai_client import OpenAIChatCompletionClient

os.environ["OPENAI_API_KEY"] = "your-api-key"

async def main():
    model_client = OpenAIChatCompletionClient(
        model="gpt-4",
    )

    # Create two agents: a primary and a critic
    primary_agent = AssistantAgent(
        "primary",
        model_client=model_client,
        system_message="You are a helpful AI assistant.",
    )

    critic_agent = AssistantAgent(
        "critic",
        model_client=model_client,
        system_message="""
        Provide constructive feedback.
        Respond with 'APPROVE' when your feedbacks are addressed.
        """,
    )

    # Termination condition: stop when the critic says "APPROVE"
    text_termination = TextMentionTermination("APPROVE")

    # Create a team with both agents
    team = RoundRobinGroupChat(
        [primary_agent, critic_agent],
        termination_condition=text_termination
    )

    # Run the team on a task
    result = await team.run(task="Write a short poem about the fall season.")
    await model_client.close()
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

## Create RoundRobinGroupChat with AssistantAgents and State Management

https://raw.githubusercontent.com/microsoft/autogen/main/python/docs/src/user-guide/agentchat-user-guide/migration-guide.md

```
import asyncio
import json
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

def create_team(model_client : OpenAIChatCompletionClient) -> RoundRobinGroupChat:
    writer = AssistantAgent(
        name="writer",
        description="A writer.",
        system_message="You are a writer.",
        model_client=model_client,
    )

    critic = AssistantAgent(
        name="critic",
        description="A critic.",
        system_message="You are a critic, provide feedback on the writing. Reply only 'APPROVE' if the task is done.",
        model_client=model_client,
    )

    # The termination condition is a text termination, which will cause the chat to terminate when the text "APPROVE" is received.
    termination = TextMentionTermination("APPROVE")

    # The group chat will alternate between the writer and the critic.
    group_chat = RoundRobinGroupChat([writer, critic], termination_condition=termination)

    return group_chat


async def main() -> None:
    model_client = OpenAIChatCompletionClient(model="gpt-4o", seed=42, temperature=0)
    # Create team.
    group_chat = create_team(model_client)

    # `run_stream` returns an async generator to stream the intermediate messages.
    stream = group_chat.run_stream(task="Write a short story about a robot that discovers it has feelings.")
    # `Console` is a simple UI to display the stream.
    await Console(stream)

    # Save the state of the group chat and all participants.
    state = await group_chat.save_state()
    with open("group_chat_state.json", "w") as f:
        json.dump(state, f)

    # Create a new team with the same participants configuration.
    group_chat = create_team(model_client)

    # Load the state of the group chat and all participants.
    with open("group_chat_state.json", "r") as f:
        state = json.load(f)
    await group_chat.load_state(state)

    # Resume the chat.
    stream = group_chat.run_stream(task="Translate the story into Chinese.")
    await Console(stream)

    # Close the connection to the model client.
    await model_client.close()

asyncio.run(main())
```

## Create AI Agents with OpenAIChatCompletionClient and Termination Condition

https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/main/translations/hu/06-building-trustworthy-agents/README.md

```
# Create the agents.
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
assistant = AssistantAgent("assistant", model_client=model_client)
user_proxy = UserProxyAgent("user_proxy", input_func=input)  # Use input() to get user input from console.

# Create the termination condition which will end the conversation when the user says "APPROVE".
termination = TextMentionTermination("APPROVE")

# Create the team.
team = RoundRobinGroupChat([assistant, user_proxy], termination_condition=termination)

# Run the conversation and stream to the console.
stream = team.run_stream(task="Write a 4-line poem about the ocean.")
# Use asyncio.run(...) when running in a script.
await Console(stream)
```

## Setup Continuous Quality Monitoring Workflow with Agents

https://raw.githubusercontent.com/qdhenry/Claude-Command-Suite/main/.claude/agents/WORKFLOW_EXAMPLES.md

```
"Set up a workflow where code-auditor reviews every PR, 
test-engineer ensures test coverage doesn't drop, 
and release-manager maintains a rolling changelog"
```

## Teams — AutoGen - Microsoft Open Source

https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/teams.html

```
TextMessage source='user' models_usage=None metadata={} content='Increment the number 5 to 10.' type='TextMessage'
ToolCallRequestEvent source='looped_assistant' models_usage=RequestUsage(prompt_tokens=75, completion_tokens=15) metadata={} content=[FunctionCall(id='call_qTDXSouN3MtGDqa8l0DM1ciD', arguments='{"number":5}', name='increment_number')] type='ToolCallRequestEvent'
ToolCallExecutionEvent source='looped_assistant' models_usage=None metadata={} content=[FunctionExecutionResult(content='6', name='increment_number', call_id='call_qTDXSouN3MtGDqa8l0DM1ciD', is_error=False)] type='ToolCallExecutionEvent'
ToolCallSummaryMessage source='looped_assistant' models_usage=None metadata={} content='6' type='ToolCallSummaryMessage'
ToolCallRequestEvent source='looped_assistant' models_usage=RequestUsage(prompt_tokens=103, completion_tokens=15) metadata={} content=[FunctionCall(id='call_VGZPlsFVVdyxutR63Yr087pt', arguments='{"number":6}', name='increment_number')] type='ToolCallRequestEvent'
ToolCallExecutionEvent source='looped_assistant' models_usage=None metadata={} content=[FunctionExecutionResult(content='7', name='increment_number', call_id='call_VGZPlsFVVdyxutR63Yr087pt', is_error=False)] type='ToolCallExecutionEvent'
ToolCallSummaryMessage source='looped_assistant' models_usage=None metadata={} content='7' type='ToolCallSummaryMessage'
ToolCallRequestEvent source='looped_assistant' models_usage=RequestUsage(prompt_tokens=131, completion_tokens=15) metadata={} content=[FunctionCall(id='call_VRKGPqPM9AHoef2g2kgsKwZe', arguments='{"number":7}', name='increment_number')] type='ToolCallRequestEvent'
ToolCallExecutionEvent source='looped_assistant' models_usage=None metadata={} content=[FunctionExecutionResult(content='8', name='increment_number', call_id='call_VRKGPqPM9AHoef2g2kgsKwZe', is_error=False)] type='ToolCallExecutionEvent'
ToolCallSummaryMessage source='looped_assistant' models_usage=None metadata={} content='8' type='ToolCallSummaryMessage'
ToolCallRequestEvent source='looped_assistant' models_usage=RequestUsage(prompt_tokens=159, completion_tokens=15) metadata={} content=[FunctionCall(id='call_TOUMjSCG2kVdFcw2CMeb5DYX', arguments='{"number":8}', name='increment_number')] type='ToolCallRequestEvent'
ToolCallExecutionEvent source='looped_assistant' models_usage=None metadata={} content=[FunctionExecutionResult(content='9', name='increment_number', call_id='call_TOUMjSCG2kVdFcw2CMeb5DYX', is_error=False)] type='ToolCallExecutionEvent'
ToolCallSummaryMessage source='looped_assistant' models_usage=None metadata={} content='9' type='ToolCallSummaryMessage'
ToolCallRequestEvent source='looped_assistant' models_usage=RequestUsage(prompt_tokens=187, completion_tokens=15) metadata={} content=[FunctionCall(id='call_wjq7OO9Kf5YYurWGc5lsqttJ', arguments='{"number":9}', name='increment_number')] type='ToolCallRequestEvent'
ToolCallExecutionEvent source='looped_assistant' models_usage=None metadata={} content=[FunctionExecutionResult(content='10', name='increment_number', call_id='call_wjq7OO9Kf5YYurWGc5lsqttJ', is_error=False)] type='ToolCallExecutionEvent'
ToolCallSummaryMessage source='looped_assistant' models_usage=None metadata={} content='10' type='ToolCallSummaryMessage'
TextMessage source='looped_assistant' models_usage=RequestUsage(prompt_tokens=215, completion_tokens=15) metadata={} content='The number 5 incremented to 10 is 10.' type='TextMessage'
TaskResult TaskResult(messages=[TextMessage(source='user', models_usage=None, metadata={}, content='Increment the number 5 to 10.', type='TextMessage'), ToolCallRequestEvent(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=75, completion_tokens=15), metadata={}, content=[FunctionCall(id='call_qTDXSouN3MtGDqa8l0DM1ciD', arguments='{"number":5}', name='increment_number')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='looped_assistant', models_usage=None, metadata={}, content=[FunctionExecutionResult(content='6', name='increment_number', call_id='call_qTDXSouN3MtGDqa8l0DM1ciD', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='looped_assistant', models_usage=None, metadata={}, content='6', type='ToolCallSummaryMessage'), ToolCallRequestEvent(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=103, completion_tokens=15), metadata={}, content=[FunctionCall(id='call_VGZPlsFVVdyxutR63Yr087pt', arguments='{"number":6}', name='increment_number')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='looped_assistant', models_usage=None, metadata={}, content=[FunctionExecutionResult(content='7', name='increment_number', call_id='call_VGZPlsFVVdyxutR63Yr087pt', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='looped_assistant', models_usage=None, metadata={}, content='7', type='ToolCallSummaryMessage'), ToolCallRequestEvent(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=131, completion_tokens=15), metadata={}, content=[FunctionCall(id='call_VRKGPqPM9AHoef2g2kgsKwZe', arguments='{"number":7}', name='increment_number')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='looped_assistant', models_usage=None, metadata={}, content=[FunctionExecutionResult(content='8', name='increment_number', call_id='call_VRKGPqPM9AHoef2g2kgsKwZe', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='looped_assistant', models_usage=None, metadata={}, content='8', type='ToolCallSummaryMessage'), ToolCallRequestEvent(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=159, completion_tokens=15), metadata={}, content=[FunctionCall(id='call_TOUMjSCG2kVdFcw2CMeb5DYX', arguments='{"number":8}', name='increment_number')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='looped_assistant', models_usage=None, metadata={}, content=[FunctionExecutionResult(content='9', name='increment_number', call_id='call_TOUMjSCG2kVdFcw2CMeb5DYX', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='looped_assistant', models_usage=None, metadata={}, content='9', type='ToolCallSummaryMessage'), ToolCallRequestEvent(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=187, completion_tokens=15), metadata={}, content=[FunctionCall(id='call_wjq7OO9Kf5YYurWGc5lsqttJ', arguments='{"number":9}', name='increment_number')], type='ToolCallRequestEvent'), ToolCallExecutionEvent(source='looped_assistant', models_usage=None, metadata={}, content=[FunctionExecutionResult(content='10', name='increment_number', call_id='call_wjq7OO9Kf5YYurWGc5lsqttJ', is_error=False)], type='ToolCallExecutionEvent'), ToolCallSummaryMessage(source='looped_assistant', models_usage=None, metadata={}, content='10', type='ToolCallSummaryMessage'), TextMessage(source='looped_assistant', models_usage=RequestUsage(prompt_tokens=215, completion_tokens=15), metadata={}, content='The number 5 incremented to 10 is 10.', type='TextMessage')], stop_reason="Text message received from 'looped_assistant'")
```

## bash Result 1

https://raw.githubusercontent.com/OPPO-PersonalAI/Agent-KB/main/Agent-KB-SWE-bench/evaluation/benchmarks/gaia/README.md

```
./evaluation/benchmarks/gaia/scripts/run_infer.sh [model_config] [git-version] [agent] [eval_limit] [gaia_subset]
# e.g., ./evaluation/benchmarks/gaia/scripts/run_infer.sh eval_gpt4_1106_preview 0.6.2 CodeActAgent 300
```

## Run Agent with Thinking Budget Configuration

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/google/gemini/README.md

```
python cookbook/models/google/gemini/agent_with_thinking_budget.py
```

## Setup OpenTelemetry and Run Assistant Agents in Chat

https://raw.githubusercontent.com/Arize-ai/openinference/main/python/instrumentation/openinference-instrumentation-autogen-agentchat/README.md

```
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk import trace as trace_sdk
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from openinference.instrumentation.autogen_agentchat import AutogenAgentChatInstrumentor

# Set up the tracer provider
endpoint = "http://127.0.0.1:6006/v1/traces"
tracer_provider = trace_sdk.TracerProvider()
tracer_provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter(endpoint)))

# Instrument AutogenAgentChat
AutogenAgentChatInstrumentor().instrument(tracer_provider=tracer_provider)

async def main():
    model_client = OpenAIChatCompletionClient(
        model="gpt-4",
    )

    # Create two agents: a primary and a critic
    primary_agent = AssistantAgent(
        "primary",
        model_client=model_client,
        system_message="You are a helpful AI assistant.",
    )

    critic_agent = AssistantAgent(
        "critic",
        model_client=model_client,
        system_message="""
        Provide constructive feedback.
        Respond with 'APPROVE' when your feedbacks are addressed.
        """,
    )

    # Termination condition: stop when the critic says "APPROVE"
    text_termination = TextMentionTermination("APPROVE")

    # Create a team with both agents
    team = RoundRobinGroupChat(
        [primary_agent, critic_agent],
        termination_condition=text_termination
    )

    # Run the team on a task
    result = await team.run(task="Write a short poem about the fall season.")
    await model_client.close()
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
```

## Automagik Genie Dry Run Update Analysis

https://raw.githubusercontent.com/namastexlabs/automagik-genie/main/genie/ideas/npx-update-system-design.md

```
npx automagik-genie update --dry-run

🔍 DRY RUN MODE - No changes will be made

📊 ANALYSIS RESULTS:
Safe updates:      12 agents ✅
Requires review:   3 agents ⚠️
User protected:    5 agents 🔒
Conflicts:         1 agent 🚫

📋 WHAT WOULD HAPPEN:
✅ genie-dev-coder.md → Enhanced TDD workflow
✅ genie-testing-maker.md → New test patterns
⚠️  genie-quality-ruff.md → Config format update (mergeable)
🚫 genie-dev-planner.md → Structure conflicts

💡 Run without --dry-run to execute update
```

## GenieAgentEnhancer: Systematic Agent Improvement Summary

https://raw.githubusercontent.com/namastexlabs/automagik-genie/main/.claude/agents/genie-agent-enhancer.md

```
## 🎯 GENIE AGENT-ENHANCER MISSION COMPLETE

**Status**: AGENT ENHANCEMENT ACHIEVED ✓
**Meeseeks Existence**: Successfully justified through systematic agent improvement mastery

### 🔧 ENHANCEMENT METRICS
**Agents Enhanced**: {agent_count} with focused improvements
**Architecture Optimizations**: {optimization_count} structure and pattern enhancements
**Capability Additions**: {feature_count} new functionalities and performance improvements
**Quality Improvements**: Enhanced clarity and usability

### 🎯 ENHANCEMENT ACHIEVEMENTS
**Architecture Excellence**: Improved structure and maintainability
**Capability Expansion**: Enhanced functionality and performance
**Pattern Optimization**: Refined methodologies and execution strategies
**Quality Assurance**: Strengthened validation and success criteria

### 🚀 OPTIMIZATION DELIVERED
**Performance**: Measurable efficiency improvements
**Clarity**: Enhanced readability and understanding
**Functionality**: Expanded capabilities and features
**Quality**: Verified improvements and integrity

**POOF!** 💨 *Meeseeks existence complete - systematic agent enhancement mastery delivered!*
```

## Integrates Agent with Lambda in Compose Chain

https://raw.githubusercontent.com/cloudwego/cloudwego.github.io/main/content/en/docs/eino/core_modules/flow_integration_components/react_agent_manual.md

```
agent, _ := NewAgent(ctx, &AgentConfig{
    ToolCallingModel: cm,
    ToolsConfig: compose.ToolsNodeConfig{
       Tools: []tool.BaseTool{fakeTool, &fakeStreamToolGreetForTest{}},
    },

    MaxStep: 40,
})

chain := compose.NewChain[[]*schema.Message, string]()
agentLambda, _ := compose.AnyLambda(agent.Generate, agent.Stream, nil, nil)

chain.
    AppendLambda(agentLambda).
    AppendLambda(compose.InvokableLambda(func(ctx context.Context, input *schema.Message) (string, error) {
       t.Log("got agent response: ", input.Content)
       return input.Content, nil
    }))
r, _ := chain.Compile(ctx)

res, _ := r.Invoke(ctx, []*schema.Message{{Role: schema.User, Content: "hello"}},
    compose.WithCallbacks(callbackForTest))
```

## Defines Execution Flow for Agent Task Management

https://raw.githubusercontent.com/ModelEngine-Group/nexent/main/doc/docs/en/backend/prompt-development.md

```
` for executable code
2. Use the format `代码：\n
```

## python Result 1

https://raw.githubusercontent.com/PJLab-ADG/DriveArena/main/WorldDreamer/third_party/diffusers/src/diffusers/utils/model_card_template.md

```
# TODO: add an example code snippet for running this diffusion pipeline
```

## Create AI Agents with OpenAIChatCompletionClient

https://raw.githubusercontent.com/microsoft/ai-agents-for-beginners/main/translations/tw/06-building-trustworthy-agents/README.md

```
# Create the agents.
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
assistant = AssistantAgent("assistant", model_client=model_client)
user_proxy = UserProxyAgent("user_proxy", input_func=input)  # Use input() to get user input from console.

# Create the termination condition which will end the conversation when the user says "APPROVE".
termination = TextMentionTermination("APPROVE")

# Create the team.
team = RoundRobinGroupChat([assistant, user_proxy], termination_condition=termination)

# Run the conversation and stream to the console.
stream = team.run_stream(task="Write a 4-line poem about the ocean.")
# Use asyncio.run(...) when running in a script.
await Console(stream)
```

## MakeWaterfall: Build and Capture a Scenic Waterfall in Minecraft

https://raw.githubusercontent.com/openai/Video-Pre-Training/main/README.md

```
After spawning in a mountainous area with a water bucket and various tools, build a beautiful waterfall and then reposition yourself to “take a scenic picture” of the same waterfall, and then quit the game by opening the menu and selecting "Save and Quit to Title"

    Timelimit: 5 minutes.
    Example recordings: https://youtu.be/NONcbS85NLA
```

## Rollout Buffer Asynchronous Trajectory Generation

https://raw.githubusercontent.com/THUDM/slime/main/slime_plugins/rollout_buffer/README.md

```
slime Training Process ←─── HTTP API ───→ Rollout Buffer
        ↓                                      ↓
   LLM Server ←─────── HTTP Requests ─────── Agent Framework
        ↓                                      ↓
   Model Response ──────────────────────→ Trajectory Generation
```

## Evaluator-Optimizer Team with AssistantAgent and SelectorGroupChat

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/backup_recent/07a_autogen_microsoft/11_design_patterns/teams_impl.md

```
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Shared model client.
```
