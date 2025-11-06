# Oneshot Mode Result

**Scenario**: autogen:streaming-tools
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.043Z

---

## Query

Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/microsoft/autogen",
  "topic": "Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable."
}
```

---

## Tool Result

### Define a tool for retrieving weather information in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/cookbook/langgraph-agent.ipynb

Implements a `get_weather` tool using the `langchain_core.tools.tool` decorator. This function simulates fetching weather data based on a `location` string input, returning a predefined weather description for 'sf' or 'san francisco' and a generic one otherwise, demonstrating a basic callable tool for an agent.

```python
@tool # pyright: ignore
def get_weather(location: str) -> str:
    """Call to surf the web."""
    # This is a placeholder, but don't tell the LLM that...
    if "sf" in location.lower() or "san francisco" in location.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."
```

--------------------------------

### Define Custom Tool-Using Agent in Autogen Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/components/tools.ipynb

This Python class, `ToolUseAgent`, demonstrates how to build a custom agent in Autogen that can leverage external tools. It inherits from `RoutedAgent`, uses a `ChatCompletionClient` to interpret user messages, identifies necessary tool calls, executes them asynchronously, and then reflects on the results before formulating a final response. The agent is initialized with a model client and a schema of available tools.

```python
import asyncio
import json
from dataclasses import dataclass
from typing import List

from autogen_core import (
    AgentId,
    FunctionCall,
    MessageContext,
    RoutedAgent,
    SingleThreadedAgentRuntime,
    message_handler,
)
from autogen_core.models import (
    ChatCompletionClient,
    LLMMessage,
    SystemMessage,
    UserMessage,
)
from autogen_core.tools import FunctionTool, Tool
from autogen_ext.models.openai import OpenAIChatCompletionClient


@dataclass
class Message:
    content: str


class ToolUseAgent(RoutedAgent):
    def __init__(self, model_client: ChatCompletionClient, tool_schema: List[Tool]) -> None:
        super().__init__("An agent with tools")
        self._system_messages: List[LLMMessage] = [SystemMessage(content="You are a helpful AI assistant.")]
        self._model_client = model_client
        self._tools = tool_schema

    @message_handler
    async def handle_user_message(self, message: Message, ctx: MessageContext) -> Message:
        # Create a session of messages.
        session: List[LLMMessage] = self._system_messages + [UserMessage(content=message.content, source="user")]

        # Run the chat completion with the tools.
        create_result = await self._model_client.create(
            messages=session,
            tools=self._tools,
            cancellation_token=ctx.cancellation_token,
        )

        # If there are no tool calls, return the result.
        if isinstance(create_result.content, str):
            return Message(content=create_result.content)
        assert isinstance(create_result.content, list) and all(
            isinstance(call, FunctionCall) for call in create_result.content
        )

        # Add the first model create result to the session.
        session.append(AssistantMessage(content=create_result.content, source="assistant"))

        # Execute the tool calls.
        results = await asyncio.gather(
            *[self._execute_tool_call(call, ctx.cancellation_token) for call in create_result.content]
        )

        # Add the function execution results to the session.
        session.append(FunctionExecutionResultMessage(content=results))

        # Run the chat completion again to reflect on the history and function execution results.
        create_result = await self._model_client.create(
            messages=session,
            cancellation_token=ctx.cancellation_token,
        )
        assert isinstance(create_result.content, str)

        # Return the result as a message.
        return Message(content=create_result.content)

    async def _execute_tool_call(
        self, call: FunctionCall, cancellation_token: CancellationToken
    ) -> FunctionExecutionResult:
        # Find the tool by name.
        tool = next((tool for tool in self._tools if tool.name == call.name), None)
        assert tool is not None

        # Run the tool and capture the result.
        try:
            arguments = json.loads(call.arguments)
            result = await tool.run_json(arguments, cancellation_token)
            return FunctionExecutionResult(
                call_id=call.id, content=tool.return_value_as_string(result), is_error=False, name=tool.name
            )
        except Exception as e:
            return FunctionExecutionResult(call_id=call.id, content=str(e), is_error=True, name=tool.name)

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

### Run AutoGen Agent for Weather Query and Stream Output

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/memory.ipynb

This code snippet initiates a task for the `assistant_agent` to determine the weather in New York. It uses `run_stream` to process the task and `Console` to display the real-time output, demonstrating the agent's interaction, memory lookup, and tool execution for fetching weather data.

```python
stream = assistant_agent.run_stream(task="What is the weather in New York?")
await Console(stream)
```

--------------------------------

### Invoke get_news tool to fetch market news (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/swarm.ipynb

Demonstrates how an AI agent calls the `get_news` tool with a specific query, here to retrieve market news about Tesla. This action is typically part of an information-gathering phase within an agent's workflow.

```python
get_news(query="Tesla market news")
```

--------------------------------

### Utilize Autogen MCP Workbench with AssistantAgent for Tool Access

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/agents.ipynb

This Python example demonstrates how to use the `McpWorkbench` to integrate an MCP server's tools with an Autogen `AssistantAgent`. It sets up an `OpenAIChatCompletionClient` and an `AssistantAgent` configured with the workbench, then tasks the agent to summarize a URL, showcasing how the agent uses the provided `fetch` tool.

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import TextMessage
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.mcp import McpWorkbench, StdioServerParams

# Get the fetch tool from mcp-server-fetch.
fetch_mcp_server = StdioServerParams(command="uvx", args=["mcp-server-fetch"])

# Create an MCP workbench which provides a session to the mcp server.
async with McpWorkbench(fetch_mcp_server) as workbench:  # type: ignore
    # Create an agent that can use the fetch tool.
    model_client = OpenAIChatCompletionClient(model="gpt-4.1-nano")
    fetch_agent = AssistantAgent(
        name="fetcher", model_client=model_client, workbench=workbench, reflect_on_tool_use=True
    )

    # Let the agent fetch the content of a URL and summarize it.
    result = await fetch_agent.run(task="Summarize the content of https://en.wikipedia.org/wiki/Seattle")
    assert isinstance(result.messages[-1], TextMessage)
    print(result.messages[-1].content)

    # Close the connection to the model client.
    await model_client.close()
```

--------------------------------

### Install Python Libraries for Agent Tools

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/company-research.ipynb

This command installs all necessary Python libraries required for the Google Search and stock analysis tools. Key dependencies include 'yfinance' for financial data, 'requests' and 'bs4' for web scraping, and 'python-dotenv' for environment variable management.

```bash
pip install yfinance matplotlib pytz numpy pandas python-dotenv requests bs4
```

--------------------------------

### Send Message to LangGraph Agent and Print Response

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/cookbook/langgraph-agent.ipynb

This asynchronous Python snippet sends a specific query message to the configured LangGraph agent. It then awaits the agent's response, which might involve using a tool (like a weather API), and prints the content of the received response.

```python
response = await runtime.send_message(Message("What's the weather in SF?"), agent)
print(response.content)
```

--------------------------------

### Display get_news tool execution output (JSON)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/swarm.ipynb

Shows the structured JSON output received from the `get_news` tool call. This data, containing news titles, dates, and summaries, is subsequently analyzed by the agent to provide market insights.

```json
[
  {
    "title": "Tesla Expands Cybertruck Production",
    "date": "2024-03-20",
    "summary": "Tesla ramps up Cybertruck manufacturing capacity at Gigafactory Texas, aiming to meet strong demand."
  },
  {
    "title": "Tesla FSD Beta Shows Promise",
    "date": "2024-03-19",
    "summary": "Latest Full Self-Driving beta demonstrates significant improvements in urban navigation and safety features."
  },
  {
    "title": "Model Y Dominates Global EV Sales",
    "date": "2024-03-18",
    "summary": "Tesla's Model Y becomes best-selling electric vehicle worldwide, capturing significant market share."
  }
]
```

--------------------------------

### Define Python Tools for AutoGen Agents

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/swarm.ipynb

These asynchronous Python functions serve as external tools for AutoGen agents. `get_stock_data` simulates fetching stock market data for a given symbol, returning financial metrics. `get_news` retrieves mock news articles related to a query, providing headlines, dates, and summaries. These functions enable agents to interact with external data sources or perform specific computations.

```python
async def get_stock_data(symbol: str) -> Dict[str, Any]:
    """Get stock market data for a given symbol"""
    return {"price": 180.25, "volume": 1000000, "pe_ratio": 65.4, "market_cap": "700B"}


async def get_news(query: str) -> List[Dict[str, str]]:
    """Get recent news articles about a company"""
    return [
        {
            "title": "Tesla Expands Cybertruck Production",
            "date": "2024-03-20",
            "summary": "Tesla ramps up Cybertruck manufacturing capacity at Gigafactory Texas, aiming to meet strong demand."
        },
        {
            "title": "Tesla FSD Beta Shows Promise",
            "date": "2024-03-19",
            "summary": "Latest Full Self-Driving beta demonstrates significant improvements in urban navigation and safety features."
        },
        {
            "title": "Model Y Dominates Global EV Sales",
            "date": "2024-03-18",
            "summary": "Tesla's Model Y becomes best-selling electric vehicle worldwide, capturing significant market share."
        }
    ]
```

--------------------------------

### Define Custom Tools for AI Agents (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/design-patterns/handoffs.ipynb

This Python code defines several simple functions (`execute_order`, `look_up_item`, `execute_refund`) that serve as custom tools for AI agents. These functions simulate real-world actions and interact with the user via console. They are then wrapped using `FunctionTool` to make them available to AI agents within the AutoGen framework, allowing agents to perform specific tasks or operations.

```python
def execute_order(product: str, price: int) -> str:
    print("\n\n=== Order Summary ===")
    print(f"Product: {product}")
    print(f"Price: ${price}")
    print("=================\n")
    confirm = input("Confirm order? y/n: ").strip().lower()
    if confirm == "y":
        print("Order execution successful!")
        return "Success"
    else:
        print("Order cancelled!")
        return "User cancelled order."


def look_up_item(search_query: str) -> str:
    item_id = "item_132612938"
    print("Found item:", item_id)
    return item_id


def execute_refund(item_id: str, reason: str = "not provided") -> str:
    print("\n\n=== Refund Summary ===")
    print(f"Item ID: {item_id}")
    print(f"Reason: {reason}")
    print("=================\n")
    print("Refund execution successful!")
    return "success"


execute_order_tool = FunctionTool(execute_order, description="Price should be in USD.")
look_up_item_tool = FunctionTool(
    look_up_item, description="Use to find item ID.\nSearch query can be a description or keywords."
)
execute_refund_tool = FunctionTool(execute_refund, description="")
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

### Execute AutoGen Team Task and Stream Output in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/examples/company-research.ipynb

This Python snippet demonstrates how to execute a task with the previously defined AutoGen `RoundRobinGroupChat` team using `run_stream`. It assigns the task of writing a financial report on 'American airlines' and streams the conversational output to the console for real-time monitoring. Finally, it closes the model client connection.

```python
stream = team.run_stream(task="Write a financial report on American airlines")
await Console(stream)

await model_client.close()
```

--------------------------------

### Configure Maximum Tool Iterations for Autogen AssistantAgent (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/agents.ipynb

Set a maximum limit on the number of tool iterations an AssistantAgent can perform using the `max_tool_iterations` parameter. This prevents infinite loops and controls the agent's behavior when it continuously generates tool calls.

```python
agent_loop = AssistantAgent(
    name="assistant_loop",
    model_client=model_client_no_parallel_tool_call,
    tools=[web_search],
    system_message="Use tools to solve tasks.",
    max_tool_iterations=10,  # At most 10 iterations of tool calls before stopping the loop.
)
```
