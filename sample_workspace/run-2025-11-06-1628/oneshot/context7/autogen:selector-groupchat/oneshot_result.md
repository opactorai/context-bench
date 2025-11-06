# Oneshot Mode Result

**Scenario**: autogen:selector-groupchat
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.721Z

---

## Query

Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/microsoft/autogen",
  "topic": "Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'."
}
```

---

## Tool Result

### Reset and Run AutoGen SelectorGroupChat Team in Python

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/selector-group-chat.ipynb

This Python code snippet illustrates how to reset an existing AutoGen team, reinitialize it as a `SelectorGroupChat` with a list of agents (planning, web search, data analyst), a model client, a termination condition, and a candidate function. Finally, it executes a specified task and streams the output to the console. This setup is crucial for managing conversational flows with dynamic agent selection.

```python
await team.reset()
team = SelectorGroupChat(
    [planning_agent, web_search_agent, data_analyst_agent],
    model_client=model_client,
    termination_condition=termination,
    candidate_func=candidate_func,
)

await Console(team.run_stream(task=task))
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

### Define Python Tools for Web Search and Percentage Calculation

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/selector-group-chat.ipynb

These Python functions simulate a web search and calculate percentage change. The `search_web_tool` function returns predefined string responses based on the query, acting as a mock API for historical sports data. The `percentage_change_tool` calculates the percentage difference between two float values. They serve as simple, standalone tools for AutoGen agents.

```python
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
```

--------------------------------

### Initiate AutoGen Group Chat with User Message (Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/core-user-guide/design-patterns/group-chat.ipynb

This Python code snippet demonstrates how to start an AutoGen runtime, create a unique session ID, and publish an initial `GroupChatMessage`. The message contains a `UserMessage` requesting a story and illustrations, targeting a specific topic type. It then waits for the chat to complete and closes the model client.

```python
runtime.start()
session_id = str(uuid.uuid4())
await runtime.publish_message(
    GroupChatMessage(
        body=UserMessage(
            content="Please write a short story about the gingerbread man with up to 3 photo-realistic illustrations.",
            source="User",
        )
    ),
    TopicId(type=group_chat_topic_type, source=session_id),
)
await runtime.stop_when_idle()
await model_client.close()
```

--------------------------------

### Run AutoGen Selector Group Chat with Task Stream

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/custom-agents.ipynb

This snippet demonstrates how to initiate a selector group chat in AutoGen. It defines a task as a list of `BaseChatMessage` objects and then executes the `run_stream` method on a `selector_group_chat` instance, awaiting the console output.

```python
task: List[BaseChatMessage] = [
    TextMessage(content="Apply the operations to turn the given number into 25.", source="user"),
    TextMessage(content="10", source="user"),
]
stream = selector_group_chat.run_stream(task=task)
await Console(stream)
```

--------------------------------

### Create AutoGen v0.2 Group Chat with Manager

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/migration-guide.md

This Python snippet demonstrates how to set up a basic group chat in AutoGen v0.2 using `GroupChat` and `GroupChatManager`. It defines two `AssistantAgent`s (writer and critic), configures LLM settings, and orchestrates their interaction in a round-robin fashion until a termination message is received.

```python
from autogen.agentchat import AssistantAgent, GroupChat, GroupChatManager

llm_config = {
    "config_list": [{"model": "gpt-4o", "api_key": "sk-xxx"}],
    "seed": 42,
    "temperature": 0,
}

writer = AssistantAgent(
    name="writer",
    description="A writer.",
    system_message="You are a writer.",
    llm_config=llm_config,
    is_termination_msg=lambda x: x.get("content", "").rstrip().endswith("APPROVE"),
)

critic = AssistantAgent(
    name="critic",
    description="A critic.",
    system_message="You are a critic, provide feedback on the writing. Reply only 'APPROVE' if the task is done.",
    llm_config=llm_config,
)

# Create a group chat with the writer and critic.
groupchat = GroupChat(agents=[writer, critic], messages=[], max_round=12)

# Create a group chat manager to manage the group chat, use round-robin selection method.
manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config, speaker_selection_method="round_robin")

# Initiate the chat with the editor, intermediate messages are printed to the console directly.
result = editor.initiate_chat(
    manager,
    message="Write a short story about a robot that discovers it has feelings.",
)
print(result.summary)
```

--------------------------------

### Python AutoGen Multi-Agent Team Setup with Mock Tools

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/migration-guide.md

This Python function configures and returns an AutoGen SelectorGroupChat team. It defines three Assistant Agents: a PlanningAgent to break down tasks, a WebSearchAgent equipped with the 'search_web_tool', and a DataAnalystAgent with the 'percentage_change_tool'. The team uses a custom selector function to ensure the Planning Agent regains control after other agents speak, along with text and message count termination conditions.

```python
def create_team(model_client : OpenAIChatCompletionClient) -> SelectorGroupChat:
    planning_agent = AssistantAgent(
        "PlanningAgent",
        description="An agent for planning tasks, this agent should be the first to engage when given a new task.",
        model_client=model_client,
        system_message="""
        You are a planning agent.
        Your job is to break down complex tasks into smaller, manageable subtasks.
        Your team members are:
            Web search agent: Searches for information
            Data analyst: Performs calculations

        You only plan and delegate tasks - you do not execute them yourself.

        When assigning tasks, use this format:
        1. <agent> : <task>

        After all tasks are complete, summarize the findings and end with "TERMINATE".
        """,
    )

    web_search_agent = AssistantAgent(
        "WebSearchAgent",
        description="A web search agent.",
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
        description="A data analyst agent. Useful for performing calculations.",
        model_client=model_client,
        tools=[percentage_change_tool],
        system_message="""
        You are a data analyst.
        Given the tasks you have been assigned, you should analyze the data and provide results using the tools provided.
        """,
    )

    # The termination condition is a combination of text mention termination and max message termination.
    text_mention_termination = TextMentionTermination("TERMINATE")
    max_messages_termination = MaxMessageTermination(max_messages=25)
    termination = text_mention_termination | max_messages_termination

    # The selector function is a function that takes the current message thread of the group chat
    # and returns the next speaker's name. If None is returned, the LLM-based selection method will be used.
    def selector_func(messages: Sequence[BaseAgentEvent | BaseChatMessage]) -> str | None:
        if messages[-1].source != planning_agent.name:
            return planning_agent.name # Always return to the planning agent after the other agents have spoken.
        return None

    team = SelectorGroupChat(
        [planning_agent, web_search_agent, data_analyst_agent],
        model_client=OpenAIChatCompletionClient(model="gpt-4o-mini"), # Use a smaller model for the selector.
        termination_condition=termination,
        selector_func=selector_func,
    )
    return team
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

### Execute Group Chat with Max Message Termination (AutoGen Python)

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tutorial/termination.ipynb

Sets up a conversation between agents in AutoGen with a `MaxMessageTermination` condition, limiting the chat to a specified number of messages. It then runs this group chat as a stream with an initial task, demonstrating automatic termination.

```python
max_msg_termination = MaxMessageTermination(max_messages=3)
round_robin_team = RoundRobinGroupChat([primary_agent, critic_agent], termination_condition=max_msg_termination)

# Use asyncio.run(...) if you are running this script as a standalone script.
await Console(round_robin_team.run_stream(task="Write a unique, Haiku about the weather in Paris"))
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

### Run Individual Autogen Distributed Chat Components

Source: https://github.com/microsoft/autogen/blob/main/python/samples/core_distributed-group-chat/README.md

Provides commands to start each component of the distributed group chat (host, Chainlit UI, editor agent, writer agent, and group chat manager) in separate terminal processes. This approach offers granular control and observation of individual services, requiring the Python virtual environment to be active in each terminal.

```bash
python run_host.py
```

```bash
chainlit run run_ui.py  --port 8001
```

```bash
python run_editor_agent.py
```

```bash
python run_writer_agent.py
```

```bash
python run_group_chat_manager.py
```

--------------------------------

### Configure and Run AutoGen SelectorGroupChat Agents

Source: https://github.com/microsoft/autogen/blob/main/python/docs/src/user-guide/agentchat-user-guide/tracing.ipynb

This Python code snippet configures and executes an AutoGen `SelectorGroupChat`. It initializes a runtime with telemetry disabled, defines a team of agents including a planning agent, web search agent, and data analyst agent, then processes a task by streaming the output to the console. Resources are properly managed by stopping the runtime and closing the model client.

```python
            tracer_provider=trace.NoOpTracerProvider(),  # Disable telemetry for runtime.
        )
        runtime.start()

        team = SelectorGroupChat(
            [planning_agent, web_search_agent, data_analyst_agent],
            model_client=model_client,
            termination_condition=termination,
            selector_prompt=selector_prompt,
            allow_repeated_speaker=True,
            runtime=runtime,
        )
        await Console(team.run_stream(task=task))

        await runtime.stop()

    await model_client.close()
```
