# Oneshot Mode Result

**Scenario**: autogen:team-termination
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.103Z

---

## Query

Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/microsoft/autogen",
  "topic": "Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically."
}
```

---

## Tool Result

### Configure Multi-Agent Team with Round-Robin Chat (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/literature-review.ipynb

This snippet demonstrates how to create a multi-agent team using `RoundRobinGroupChat` in Python. It defines a `termination_condition` based on a text mention and lists the participating agents, setting up the collaborative environment for task execution.

```python
termination = TextMentionTermination("TERMINATE")
team = RoundRobinGroupChat(
    participants=[google_search_agent, arxiv_search_agent, report_agent], termination_condition=termination
)
```

--------------------------------

### Configure and Run AutoGen Team with Gemini Critic Agent (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/custom-agents.ipynb

This Python code snippet demonstrates how to set up an AutoGen conversational team. It initializes a `GeminiAssistantAgent` as a critic, defines a termination condition based on the critic's 'APPROVE' mention or a maximum message count, and orchestrates a `RoundRobinGroupChat` to execute a task, showcasing custom agent integration and conversation flow management.

```python
gemini_critic_agent = GeminiAssistantAgent(
    "gemini_critic",
    system_message="Provide constructive feedback. Respond with 'APPROVE' to when your feedbacks are addressed.",
)


# Define a termination condition that stops the task if the critic approves or after 10 messages.
termination = TextMentionTermination("APPROVE") | MaxMessageTermination(10)

# Create a team with the primary and critic agents.
team = RoundRobinGroupChat([primary_agent, gemini_critic_agent], termination_condition=termination)

await Console(team.run_stream(task="Write a Haiku poem with 4 lines about the fall season."))
await model_client.close()
```

--------------------------------

### Define a Multi-Agent Team for AutoGen AgentChat (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/packages/autogen-studio/notebooks/tutorial.ipynb

This Python example illustrates the definition of a multi-agent team using AutoGen's `AssistantAgent` and `RoundRobinGroupChat`. It sets up several specialized agents (planner, local, language, summary) with distinct roles and integrates them into a group chat with a termination condition.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat, SelectorGroupChat
from autogen_ext.models.openai import OpenAIChatCompletionClient

planner_agent = AssistantAgent(
    "planner_agent",
    model_client=OpenAIChatCompletionClient(model="gpt-4"),
    description="A helpful assistant that can plan trips.",
    system_message="You are a helpful assistant that can suggest a travel plan for a user based on their request. Respond with a single sentence",
)

local_agent = AssistantAgent(
    "local_agent",
    model_client=OpenAIChatCompletionClient(model="gpt-4"),
    description="A local assistant that can suggest local activities or places to visit.",
    system_message="You are a helpful assistant that can suggest authentic and interesting local activities or places to visit for a user and can utilize any context information provided. Respond with a single sentence",
)

language_agent = AssistantAgent(
    "language_agent",
    model_client=OpenAIChatCompletionClient(model="gpt-4"),
    description="A helpful assistant that can provide language tips for a given destination.",
    system_message="You are a helpful assistant that can review travel plans, providing feedback on important/critical tips about how best to address language or communication challenges for the given destination. If the plan already includes language tips, you can mention that the plan is satisfactory, with rationale.Respond with a single sentence",
)

travel_summary_agent = AssistantAgent(
    "travel_summary_agent",
    model_client=OpenAIChatCompletionClient(model="gpt-4"),
    description="A helpful assistant that can summarize the travel plan.",
    system_message="You are a helpful assistant that can take in all of the suggestions and advice from the other agents and provide a detailed tfinal travel plan. You must ensure th b at the final plan is integrated and complete. YOUR FINAL RESPONSE MUST BE THE COMPLETE PLAN. When the plan is complete and all perspectives are integrated, you can respond with TERMINATE.Respond with a single sentence",
)

termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)
group_chat = RoundRobinGroupChat(
    [planner_agent, local_agent, language_agent, travel_summary_agent], termination_condition=termination
)
```

--------------------------------

### Run Multi-Agent Team Sample with Chainlit

Source: https://github.com/microsoft/autogen/blob/main/python/samples/agentchat_chainlit/README.md

Executes the `app_team.py` script with Chainlit, starting a chat interface for a team of agents. This team operates in a RoundRobinGroupChat, with agents responding in turn until an 'APPROVE' message is mentioned by a critic agent, as demonstrated by asking "Write a poem about winter.".

```shell
chainlit run app_team.py -h
```

--------------------------------

### Create and Run an AutoGen RoundRobinGroupChat Team in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/teams.ipynb

This Python snippet demonstrates how to define and execute a multi-agent team using AutoGen's `RoundRobinGroupChat`. It configures two `AssistantAgent` instances (a primary agent and a critic agent) with an `OpenAIChatCompletionClient` for model interaction, sets a `TextMentionTermination` condition to control the team's execution based on agent responses, and then runs the team with an initial message. The team executes in a round-robin fashion until the termination condition is met, implementing a reflection pattern.

```python
import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.base import TaskResult
from autogen_agentchat.conditions import ExternalTermination, TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Create an OpenAI model client.
model_client = OpenAIChatCompletionClient(
    model="gpt-4o-2024-08-06",
    # api_key="sk-...", # Optional if you have an OPENAI_API_KEY env variable set.
)

# Create the primary agent.
primary_agent = AssistantAgent(
    "primary",
    model_client=model_client,
    system_message="You are a helpful AI assistant.",
)

# Create the critic agent.
critic_agent = AssistantAgent(
    "critic",
    model_client=model_client,
    system_message="Provide constructive feedback. Respond with 'APPROVE' to when your feedbacks are addressed.",
)

# Define a termination condition that stops the task if the critic approves.
text_termination = TextMentionTermination("APPROVE")

# Create a team with the primary and critic agents.
team = RoundRobinGroupChat([primary_agent, critic_agent], termination_condition=text_termination)

# Let's call the `run` method to start the team with a task.
async def run_team():
    await team.run("Write a short poem about a cat.")

if __name__ == "__main__":
    asyncio.run(run_team())
```

--------------------------------

### Perform arXiv Search for Multi-Agent AI Systems Papers

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/literature-review.ipynb

This Python snippet demonstrates how to initiate a search on the arXiv pre-print repository for academic papers. It specifies a query for relevant topics and limits the number of results, typically used by AI agents to gather research information.

```python
[FunctionCall(id='call_ZdmwQGTO03X23GeRn6fwDN8q', arguments='{"query":"no code tools for building multi agent AI systems","max_results":5}', name='arxiv_search')]
```

--------------------------------

### Import AutoGen Modules for Agent-Based Research (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/company-research.ipynb

This code snippet imports essential modules from the `autogen_agentchat` and `autogen_core` libraries. These modules are necessary to define assistant agents, set termination conditions, create group chats, enable console output, utilize function tools, and connect to OpenAI models for building a multi-agent system focused on company research.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_core.tools import FunctionTool
from autogen_ext.models.openai import OpenAIChatCompletionClient
```

--------------------------------

### Execute Multi-Agent Task and Stream Output (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/literature-review.ipynb

This code block shows how to initiate a task with the configured multi-agent team and stream its output to the console. It includes an example task for writing a literature review and ensures the model client is closed gracefully after completion.

```python
await Console(
    team.run_stream(
        task="Write a literature review on no code tools for building multi agent ai systems",
    )
)

await model_client.close()
```

--------------------------------

### Define Critic Agent with System Message (AutoGen Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/termination.ipynb

Initializes an `AssistantAgent` named 'critic' within the AutoGen framework. This agent is configured with a specific system message to provide constructive feedback on messages and approve once feedback is addressed.

```python
critic_agent = AssistantAgent(
    "critic",
    model_client=model_client,
    system_message="Provide constructive feedback for every message. Respond with 'APPROVE' to when your feedbacks are addressed."
)
```

--------------------------------

### Initiate AutoGen Task for Literature Review Generation

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/literature-review.ipynb

This Python snippet illustrates how to start a task within the AutoGen framework. It takes a detailed task description, such as writing a literature review on a specific topic, enabling an AI agent to orchestrate the necessary steps to fulfill the request.

```python
run( task="Write a literature review on no code tools for building multi agent ai systems", )
```

--------------------------------

### AutoGen GroupChat with Max Turns for Iterative Task (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This comprehensive example illustrates setting up an AutoGen `RoundRobinGroupChat` with `max_turns=1` for a poetry generation task. It demonstrates an iterative process where the team responds once, pauses for user feedback, and then resumes, resetting the turn count but preserving conversation history. This pattern is suitable for continuous user engagement scenarios like chatbots.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Create the agents.
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
assistant = AssistantAgent("assistant", model_client=model_client)

# Create the team setting a maximum number of turns to 1.
team = RoundRobinGroupChat([assistant], max_turns=1)

task = "Write a 4-line poem about the ocean."
while True:
    # Run the conversation and stream to the console.
    stream = team.run_stream(task=task)
    # Use asyncio.run(...) when running in a script.
    await Console(stream)
    # Get the user response.
    task = input("Enter your feedback (type 'exit' to leave): ")
    if task.lower().strip() == "exit":
        break
await model_client.close()
```

--------------------------------

### Implement Autogen Agent Chat with Conditional Loop and Filtered Summary

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/graph-flow.ipynb

This Python code sets up an Autogen Agent Chat system featuring a generator, a reviewer with a feedback loop, and a filtered summarizer. It uses `AssistantAgent`, `MessageFilterAgent`, `DiGraphBuilder`, `GraphFlow`, and `MaxMessageTermination` to create a conversational flow where the reviewer's input dictates whether the loop continues or a summary is generated based on specific messages.

```python
from autogen_agentchat.agents import AssistantAgent, MessageFilterAgent, MessageFilterConfig, PerSourceFilter
from autogen_agentchat.teams import (
    DiGraphBuilder,
    GraphFlow,
)
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

# Agents
generator = AssistantAgent("generator", model_client=model_client, system_message="Generate a list of creative ideas.")
reviewer = AssistantAgent(
    "reviewer",
    model_client=model_client,
    system_message="Review ideas and provide feedbacks, or just 'APPROVE' for final approval.",
)
summarizer_core = AssistantAgent(
    "summary", model_client=model_client, system_message="Summarize the user request and the final feedback."
)

# Filtered summarizer
filtered_summarizer = MessageFilterAgent(
    name="summary",
    wrapped_agent=summarizer_core,
    filter=MessageFilterConfig(
        per_source=[
            PerSourceFilter(source="user", position="first", count=1),
            PerSourceFilter(source="reviewer", position="last", count=1),
        ]
    ),
)

# Build graph with conditional loop
builder = DiGraphBuilder()
builder.add_node(generator).add_node(reviewer).add_node(filtered_summarizer)
builder.add_edge(generator, reviewer)
builder.add_edge(reviewer, filtered_summarizer, condition=lambda msg: "APPROVE" in msg.to_model_text())
builder.add_edge(reviewer, generator, condition=lambda msg: "APPROVE" not in msg.to_model_text())
builder.set_entry_point(generator)  # Set entry point to generator. Required if there are no source nodes.
graph = builder.build()

termination_condition = MaxMessageTermination(10)

# Create the flow
flow = GraphFlow(
    participants=builder.get_participants(),
    graph=graph,
    termination_condition=termination_condition
)
```

--------------------------------

### Execute Google Search for No-Code Multi-Agent AI Literature

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/literature-review.ipynb

This Python snippet demonstrates how to programmatically perform a Google search using a dedicated function. It takes a query string and the desired number of results as input, returning relevant search result links and snippets.

```python
google_search({"query":"no code tools for building multi agent AI systems literature review","num_results":3})
```

--------------------------------

### Configure Autogen Single Agent Team for Looping Operations (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/teams.ipynb

This example illustrates setting up an Autogen `AssistantAgent` within a `RoundRobinGroupChat` to enable a single agent to perform iterative tasks. It shows how to define and register a tool, and how to use a `TextMessageTermination` condition to control the looping behavior, allowing the agent to continue operations until a specific message is generated.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import TextMessageTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key="sk-...", # Optional if you have an OPENAI_API_KEY env variable set.
    # Disable parallel tool calls for this example.
    parallel_tool_calls=False,  # type: ignore
)


# Create a tool for incrementing a number.
def increment_number(number: int) -> int:
    """Increment a number by 1."""
    return number + 1


# Create a tool agent that uses the increment_number function.
looped_assistant = AssistantAgent(
    "looped_assistant",
    model_client=model_client,
    tools=[increment_number],  # Register the tool.
    system_message="You are a helpful AI assistant, use the tool to increment the number.",
)

# Termination condition that stops the task if the agent responds with a text message.
termination_condition = TextMessageTermination("looped_assistant")

# Create a team with the looped assistant agent and the termination condition.
team = RoundRobinGroupChat(
    [looped_assistant],
    termination_condition=termination_condition,
)
```

--------------------------------

### Stop an AutoGen Team Using External Termination Condition (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/teams.ipynb

This example illustrates how to programmatically stop an AutoGen team from outside using `ExternalTermination`. It shows how to create an `ExternalTermination` condition, combine it with other termination conditions using the bitwise OR operator, run the team as a background asynchronous task, and then use `external_termination.set()` to trigger the team's termination after a short delay. The team allows the current agent to finish its turn before stopping, maintaining state consistency.

```python
external_termination = ExternalTermination()
team = RoundRobinGroupChat(
    [primary_agent, critic_agent],
    termination_condition=external_termination | text_termination  # Use the bitwise OR operator to combine conditions.
)

# Run the team in a background task.
run = asyncio.create_task(Console(team.run_stream(task="Write a short poem about the fall season.")))

# Wait for some time.
await asyncio.sleep(0.1)

# Stop the team.
external_termination.set()

# Wait for the team to finish.
await run
```

--------------------------------

### Create Sequential GraphFlow for Writer and Reviewer Agents (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/graph-flow.ipynb

This code demonstrates how to build a simple sequential workflow using `DiGraphBuilder` and `GraphFlow` in AutoGen. It initializes two `AssistantAgent` instances (a writer and a reviewer) with an OpenAI model client, defines their interaction path, and constructs the graph for a basic writing and reviewing task.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import DiGraphBuilder, GraphFlow
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Create an OpenAI model client
client = OpenAIChatCompletionClient(model="gpt-4.1-nano")

# Create the writer agent
writer = AssistantAgent("writer", model_client=client, system_message="Draft a short paragraph on climate change.")

# Create the reviewer agent
reviewer = AssistantAgent("reviewer", model_client=client, system_message="Review the draft and suggest improvements.")

# Build the graph
builder = DiGraphBuilder()
builder.add_node(writer).add_node(reviewer)
builder.add_edge(writer, reviewer)

# Build and validate the graph
graph = builder.build()

# Create the flow
flow = GraphFlow([writer, reviewer], graph=graph)
```

--------------------------------

### Orchestrate Multi-Agent Workflow with Autogen AgentTool (Python)

Source: https://github.com/microsoft/autogen/blob/main/README.md

This Python snippet demonstrates how to set up a basic multi-agent orchestration using Autogen's `AgentTool`. It initializes specialized agents (math, chemistry) and a general assistant agent, then registers the expert agents as tools for the assistant to use. The assistant can then delegate tasks to the appropriate expert.

```python
import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.tools import AgentTool
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient


async def main() -> None:
    model_client = OpenAIChatCompletionClient(model="gpt-4.1")

    math_agent = AssistantAgent(
        "math_expert",
        model_client=model_client,
        system_message="You are a math expert.",
        description="A math expert assistant.",
        model_client_stream=True,
    )
    math_agent_tool = AgentTool(math_agent, return_value_as_last_message=True)

    chemistry_agent = AssistantAgent(
        "chemistry_expert",
        model_client=model_client,
        system_message="You are a chemistry expert.",
        description="A chemistry expert assistant.",
        model_client_stream=True,
    )
    chemistry_agent_tool = AgentTool(chemistry_agent, return_value_as_last_message=True)

    agent = AssistantAgent(
        "assistant",
        system_message="You are a general assistant. Use expert tools when needed.",
        model_client=model_client,
        model_client_stream=True,
        tools=[math_agent_tool, chemistry_agent_tool],
        max_tool_iterations=10,
    )
    await Console(agent.run_stream(task="What is the integral of x^2?"))
    await Console(agent.run_stream(task="What is the molecular weight of water?"))


asyncio.run(main())
```

--------------------------------

### Configure and Run AutoGen Multi-Agent System in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/design-patterns/mixture-of-agents.ipynb

This Python code sets up an AutoGen `SingleThreadedAgentRuntime`, registers both `WorkerAgent` and `OrchestratorAgent` instances, configuring them to use `gpt-4o-mini`. It then dispatches the defined `task` to the orchestrator, waits for the multi-agent system to process it, and finally prints the computed result to the console, while also ensuring proper shutdown of resources.

```python
runtime = SingleThreadedAgentRuntime()
model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
await WorkerAgent.register(runtime, "worker", lambda: WorkerAgent(model_client=model_client))
await OrchestratorAgent.register(
    runtime,
    "orchestrator",
    lambda: OrchestratorAgent(model_client=model_client, worker_agent_types=["worker"] * 3, num_layers=3),
)

runtime.start()
result = await runtime.send_message(UserTask(task=task), AgentId("orchestrator", "default"))

await runtime.stop_when_idle()
await model_client.close()

print(f"{'-'*80}\nFinal result:\n{result.result}")
```

--------------------------------

### Initialize AutoGen Agents with Custom Tool (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/termination.ipynb

This Python code initializes a primary `AssistantAgent` and a `critic` agent using `OpenAIChatCompletionClient`. The `critic` agent is configured with the `approve` function as a tool, enabling it to trigger specific actions or termination conditions within the AutoGen framework.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    temperature=1,
    # api_key="sk-...", # Optional if you have an OPENAI_API_KEY env variable set.
)

# Create the primary agent.
primary_agent = AssistantAgent(
    "primary",
    model_client=model_client,
    system_message="You are a helpful AI assistant.",
)

# Create the critic agent with the approve function as a tool.
critic_agent = AssistantAgent(
    "critic",
    model_client=model_client,
    tools=[approve],  # Register the approve function as a tool.
    system_message="Provide constructive feedback. Use the approve tool to approve when all feedbacks are addressed.",
)
```

--------------------------------

### Continue AutoGen Team After User Input

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This Python snippet demonstrates how to resume a previously halted `RoundRobinGroupChat` team by providing a new task, which simulates user input. The agent then processes this information and terminates, showcasing the team's ability to continue a conversation flow based on the defined termination conditions.

```python
await Console(lazy_agent_team.run_stream(task="The weather in New York is sunny."))
```
