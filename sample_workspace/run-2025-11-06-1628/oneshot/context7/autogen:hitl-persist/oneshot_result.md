# Oneshot Mode Result

**Scenario**: autogen:hitl-persist
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.676Z

---

## Query

Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/microsoft/autogen",
  "topic": "Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback."
}
```

---

## Tool Result

### Use UserProxyAgent for Human Feedback in AutoGen RoundRobinGroupChat

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This example demonstrates how to integrate a `UserProxyAgent` into an AutoGen `RoundRobinGroupChat` to enable human feedback during a conversation. It sets up an `AssistantAgent` and a `UserProxyAgent` that uses the `input()` function for console interaction, allowing the user to provide feedback which can trigger a termination condition. This approach blocks the team's execution until feedback is received.

```python
from autogen_agentchat.agents import AssistantAgent, UserProxyAgent
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

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
```

--------------------------------

### Initialize and Interact with Autogen Agent

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/cookbook/openai-assistant-agent.ipynb

This Python code demonstrates how to programmatically interact with an Autogen agent. It starts the runtime, sends a `TextMessage` containing a query to an `agent` instance, and then waits for the runtime to become idle before proceeding. This pattern is used for initiating conversations or tasks with an autonomous agent.

```python
runtime.start()
await runtime.send_message(TextMessage(content="What are the top-10 salaries?", source="user"), agent)
await runtime.stop_when_idle()
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

### Run AutoGen Team with Initial Task and Stream Output

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This Python code initiates a `RoundRobinGroupChat` team with a specified task. It uses `Console` to stream the execution output to the console and displays performance statistics, illustrating the initial interaction where the lazy agent hands off to the user due to its configuration.

```python
task = "What is the weather in New York?"
await Console(lazy_agent_team.run_stream(task=task), output_stats=True)
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

### Query Autogen Assistant with Document-Based Question in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/cookbook/openai-assistant-agent.ipynb

This Python code demonstrates how to interact with an Autogen agent by sending a question related to an uploaded document. It first resets the agent's memory using `Reset()` for a fresh conversation. Then, a `TextMessage` containing the query about the 'Treaty of Rawalpindi' is sent, explicitly asking the agent to use the provided document for its answer.

```python
runtime.start()
await runtime.send_message(Reset(), agent)
await runtime.send_message(
    TextMessage(
        content="When and where was the treaty of Rawalpindi signed? Answer using the document provided.", source="user"
    ),
    agent,
)
await runtime.stop_when_idle()
```

--------------------------------

### Run AutoGen Agent with Model Context and Interact (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/components/model-context.ipynb

This example demonstrates how to set up and interact with the `SimpleAgentWithContext` using `OpenAIChatCompletionClient` and `SingleThreadedAgentRuntime`. It registers the agent, starts the runtime, and then sends two consecutive messages. The second message ('What was the first thing you mentioned?') relies on the `BufferedChatCompletionContext` to retrieve the conversation history, showcasing its ability to maintain context for follow-up questions.

```python
model_client = OpenAIChatCompletionClient(
    model="gpt-4o-mini",
    # api_key="sk-...", # Optional if you have an OPENAI_API_KEY set in the environment.
)

runtime = SingleThreadedAgentRuntime()
await SimpleAgentWithContext.register(
    runtime,
    "simple_agent_context",
    lambda: SimpleAgentWithContext(model_client=model_client),
)
# Start the runtime processing messages.
runtime.start()
agent_id = AgentId("simple_agent_context", "default")

# First question.
message = Message("Hello, what are some fun things to do in Seattle?")
print(f"Question: {message.content}")
response = await runtime.send_message(message, agent_id)
print(f"Response: {response.content}")
print("-----")

# Second question.
message = Message("What was the first thing you mentioned?")
print(f"Question: {message.content}")
response = await runtime.send_message(message, agent_id)
print(f"Response: {response.content}")
```

--------------------------------

### Build a Directed Graph Flow with AutoGen Agents in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/graph-flow.ipynb

This snippet uses `DiGraphBuilder` to define the structure of the agent interaction flow. It adds the individual agents as nodes and establishes directed edges to specify the communication pathways, forming a sequential pipeline.

```python
builder = DiGraphBuilder()
builder.add_node(researcher).add_node(filtered_analyst).add_node(filtered_presenter)
builder.add_edge(researcher, filtered_analyst).add_edge(filtered_analyst, filtered_presenter)
```

--------------------------------

### Continue AutoGen Team After User Input

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This Python snippet demonstrates how to resume a previously halted `RoundRobinGroupChat` team by providing a new task, which simulates user input. The agent then processes this information and terminates, showcasing the team's ability to continue a conversation flow based on the defined termination conditions.

```python
await Console(lazy_agent_team.run_stream(task="The weather in New York is sunny."))
```

--------------------------------

### Define and Execute an AutoGen AgentChat Assistant with Tools

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/quickstart.ipynb

This Python script initializes an `AssistantAgent` using `OpenAIChatCompletionClient` and a mock `get_weather` tool. The agent is configured with a system message and reflection, then asynchronously runs a task, processing the query and streaming the response to the console. It demonstrates fundamental agent setup, tool registration, and interaction flow within AgentChat.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

# Define a model client. You can use other model client that implements
# the `ChatCompletionClient` interface.
model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key="YOUR_API_KEY",
)


# Define a simple function tool that the agent can use.
# For this example, we use a fake weather tool for demonstration purposes.
async def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    return f"The weather in {city} is 73 degrees and Sunny."


# Define an AssistantAgent with the model, tool, system message, and reflection enabled.
# The system message instructs the agent via natural language.
agent = AssistantAgent(
    name="weather_agent",
    model_client=model_client,
    tools=[get_weather],
    system_message="You are a helpful assistant.",
    reflect_on_tool_use=True,
    model_client_stream=True,  # Enable streaming tokens from the model client.
)


# Run the agent and stream the messages to the console.
async def main() -> None:
    await Console(agent.run_stream(task="What is the weather in New York?"))
    # Close the connection to the model client.
    await model_client.close()


# NOTE: if running this inside a Python script you'll need to use asyncio.run(main()).
await main()
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

### Initialize and Use Autogen AssistantAgent in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/state.ipynb

This code demonstrates how to initialize an Autogen AssistantAgent, configure it with an OpenAI chat completion client, and send an initial message. It showcases the basic setup for an intelligent agent capable of generating responses based on prompts.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.messages import TextMessage
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.ui import Console
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o-2024-08-06")

assistant_agent = AssistantAgent(
    name="assistant_agent",
    system_message="You are a helpful assistant",
    model_client=model_client,
)

# Use asyncio.run(...) when running in a script.
response = await assistant_agent.on_messages(
    [TextMessage(content="Write a 3 line poem on lake tangayika", source="user")], CancellationToken()
)
print(response.chat_message)
await model_client.close()
```

--------------------------------

### Configuring and Using an AutoGen v0.4 Assistant Agent with Tools

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/migration-guide.md

Illustrates the setup of an `AssistantAgent` in AutoGen v0.4 that can utilize a defined tool function (`get_weather`). It includes initializing an `OpenAIChatCompletionClient`, configuring the agent with a system message and tools, and running an asynchronous chat loop to interact with the agent.

```python
import asyncio
from autogen_core import CancellationToken
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage

def get_weather(city: str) -> str: # Async tool is possible too.
    return f"The weather in {city} is 72 degree and sunny."

async def main() -> None:
    model_client = OpenAIChatCompletionClient(model="gpt-4o", seed=42, temperature=0)
    assistant = AssistantAgent(
        name="assistant",
        system_message="You are a helpful assistant. You can call tools to help user.",
        model_client=model_client,
        tools=[get_weather],
        reflect_on_tool_use=True, # Set to True to have the model reflect on the tool use, set to False to return the tool call result directly.
    )
    while True:
        user_input = input("User: ")
        if user_input == "exit":
            break
        response = await assistant.on_messages([TextMessage(content=user_input, source="user")], CancellationToken())
        print("Assistant:", response.chat_message.to_text())
    await model_client.close()

asyncio.run(main())
```

--------------------------------

### Define AutoGen Assistant Agents for Search, Stock Analysis, and Reporting in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/company-research.ipynb

This Python code initializes three `AssistantAgent` instances using AutoGen. A `Google_Search_Agent` utilizes a Google search tool, a `Stock_Analysis_Agent` uses a stock analysis tool, and a `Report_Agent` synthesizes information, each with specific system messages and roles for collaborative task execution.

```python
model_client = OpenAIChatCompletionClient(model="gpt-4o")

search_agent = AssistantAgent(
    name="Google_Search_Agent",
    model_client=model_client,
    tools=[google_search_tool],
    description="Search Google for information, returns top 2 results with a snippet and body content",
    system_message="You are a helpful AI assistant. Solve tasks using your tools.",
)

stock_analysis_agent = AssistantAgent(
    name="Stock_Analysis_Agent",
    model_client=model_client,
    tools=[stock_analysis_tool],
    description="Analyze stock data and generate a plot",
    system_message="Perform data analysis.",
)

report_agent = AssistantAgent(
    name="Report_Agent",
    model_client=model_client,
    description="Generate a report based the search and results of stock analysis",
    system_message="You are a helpful assistant that can generate a comprehensive report on a given topic based on search and stock analysis. When you done with generating the report, reply with TERMINATE.",
)
```

--------------------------------

### Create AutoGen Agent Team with Tracing and Custom Tools (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tracing.ipynb

This Python code demonstrates how to construct an AutoGen agent team using `AssistantAgent` instances for planning, web searching, and data analysis. It integrates custom tools (`search_web_tool`, `percentage_change_tool`) and uses OpenTelemetry's `tracer` to monitor the execution flow within the `SingleThreadedAgentRuntime`. The example sets up termination conditions and a selector prompt for orchestrating agent interactions to solve a complex task.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.ui import Console
from autogen_core import SingleThreadedAgentRuntime
from autogen_ext.models.openai import OpenAIChatCompletionClient


def search_web_tool(query: str) -> str:
    if "2006-2007" in query:
        return """Here are the total points scored by Miami Heat players in the 2006-2007 season:
        Udonis Haslem: 844 points
        Dwayne Wade: 1397 points
        James Posey: 550 points
        ...
        """
    elif "2007-2008" in query:
        return "The number of total rebounds for Dwayne Wade in the Miami Heat season 2007-2008 is 214."
    elif "2008-2009" in query:
        return "The number of total rebounds for Dwayne Wade in the Miami Heat season 2008-2009 is 398."
    return "No data found."


def percentage_change_tool(start: float, end: float) -> float:
    return ((end - start) / start) * 100


async def main() -> None:
    model_client = OpenAIChatCompletionClient(model="gpt-4o")

    # Get a tracer with the default tracer provider.
    tracer = trace.get_tracer("tracing-autogen-agentchat")

    # Use the tracer to create a span for the main function.
    with tracer.start_as_current_span("run_team"):
        planning_agent = AssistantAgent(
            "PlanningAgent",
            description="An agent for planning tasks, this agent should be the first to engage when given a new task.",
            model_client=model_client,
            system_message="""
            You are a planning agent.
            Your job is to break down complex tasks into smaller, manageable subtasks.
            Your team members are:
                WebSearchAgent: Searches for information
                DataAnalystAgent: Performs calculations

            You only plan and delegate tasks - you do not execute them yourself.

            When assigning tasks, use this format:
            1. <agent> : <task>

            After all tasks are complete, summarize the findings and end with "TERMINATE".
            """,
        )

        web_search_agent = AssistantAgent(
            "WebSearchAgent",
            description="An agent for searching information on the web.",
            tools=[search_web_tool],
            model_client=model_client,
            system_message="""
            You are a web search agent.
            Your only tool is search_tool - use it to find information.
            You make only one search call at a time.
            Once you have the results, you never do calculations based on them.
            """,
        )

        data_analyst_agent = AssistantAgent(
            "DataAnalystAgent",
            description="An agent for performing calculations.",
            model_client=model_client,
            tools=[percentage_change_tool],
            system_message="""
            You are a data analyst.
            Given the tasks you have been assigned, you should analyze the data and provide results using the tools provided.
            If you have not seen the data, ask for it.
            """,
        )

        text_mention_termination = TextMentionTermination("TERMINATE")
        max_messages_termination = MaxMessageTermination(max_messages=25)
        termination = text_mention_termination | max_messages_termination

        selector_prompt = """Select an agent to perform task.

        {roles}

        Current conversation context:
        {history}

        Read the above conversation, then select an agent from {participants} to perform the next task.
        Make sure the planner agent has assigned tasks before other agents start working.
        Only select one agent.
        """

        task = "Who was the Miami Heat player with the highest points in the 2006-2007 season, and what was the percentage change in his total rebounds between the 2007-2008 and 2008-2009 seasons?"

        runtime = SingleThreadedAgentRuntime(
```

--------------------------------

### Configure Max Turns in AutoGen RoundRobinGroupChat (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/human-in-the-loop.ipynb

This snippet demonstrates how to initialize an AutoGen `RoundRobinGroupChat` team and set the `max_turns` parameter to control the number of agent responses before pausing. Setting `max_turns=1` will pause the team after the first agent responds, facilitating scenarios requiring immediate user intervention.

```python
team = RoundRobinGroupChat([...], max_turns=1)
```
