# Oneshot Mode Result

**Scenario**: langgraph:two-agent-subgraphs
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:29:44.155Z

---

## Query

Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/langchain-ai_github_io_langgraph",
  "topic": "Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs."
}
```

---

## Tool Result

### Build Multi-Agent Supervisor System with LangGraph

Source: https://langchain-ai.github.io/langgraph/llms

Guides on creating a multi-agent supervisor system with specialized agents for research and math tasks. Covers environment setup, worker agent creation, and orchestrating agent interactions for complex queries.

```Python
from langgraph.graph import StateGraph, END

class AgentState:
    # Define your agent state here
    pass

def research_agent(state: AgentState):
    # Define research agent logic
    pass

def math_agent(state: AgentState):
    # Define math agent logic
    pass

def supervisor_node(state: AgentState):
    # Define supervisor logic to route tasks
    pass

workflow = StateGraph(AgentState)
workflow.add_node("research", research_agent)
workflow.add_node("math", math_agent)
workflow.add_node("supervisor", supervisor_node)

workflow.add_edge("research", "supervisor")
workflow.add_edge("math", "supervisor")
workflow.add_conditional_edges("supervisor", lambda state: state['next_agent'], {"research": "research", "math": "math", "END": END})

app = workflow.compile()

```

--------------------------------

### LangGraph Supervisor Agent System

Source: https://langchain-ai.github.io/langgraph/js/agents/prebuilt

Build supervisor multi-agent systems using LangGraph. This library extends LangGraph's capabilities for managing complex agent interactions.

```bash
npm install @langchain/langgraph-supervisor
```

--------------------------------

### Build Multi-Agent System with Handoffs

Source: https://langchain-ai.github.io/langgraph/how-tos/multi_agent

Demonstrates building a multi-agent system for travel booking using LangGraph's `create_react_agent` and handoff tools. It shows how to define agents, create handoff tools for different assistants, and set up the state graph for inter-agent communication.

```Python
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, START, MessagesState

def create_handoff_tool(*, agent_name: str, description: str | None = None):
    # same implementation as above
    ...
    return Command(...)

# Handoffs
transfer_to_hotel_assistant = create_handoff_tool(agent_name="hotel_assistant")
transfer_to_flight_assistant = create_handoff_tool(agent_name="flight_assistant")

# Define agents
flight_assistant = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[..., transfer_to_hotel_assistant],
    name="flight_assistant"
)
hotel_assistant = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[..., transfer_to_flight_assistant],
    name="hotel_assistant"
)

# Define multi-agent graph
multi_agent_graph = (
    StateGraph(MessagesState)
    .add_node(flight_assistant)
    .add_node(hotel_assistant)
    .add_edge(START, "flight_assistant")
    .compile()
)

```

--------------------------------

### Python: Multi-agent system setup with LangGraph

Source: https://langchain-ai.github.io/langgraph/how-tos/multi_agent

Sets up a multi-agent system for travel recommendations using LangGraph. It defines two agents, 'travel_advisor' and 'hotel_advisor', each with specific tools and prompts, and configures the graph to handle interactions and handoffs between them.

```Python
from typing import Literal
from langchain_anthropic import ChatAnthropic
from langgraph.graph import MessagesState, StateGraph, START
from langgraph.prebuilt import create_react_agent, InjectedState
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import InMemorySaver


model = ChatAnthropic(model="claude-3-5-sonnet-latest")

class MultiAgentState(MessagesState):
    last_active_agent: str


# Define travel advisor tools and ReAct agent
travel_advisor_tools = [
    get_travel_recommendations,
    make_handoff_tool(agent_name="hotel_advisor"),
]
travel_advisor = create_react_agent(
    model,
    travel_advisor_tools,
    prompt=(
        "You are a general travel expert that can recommend travel destinations (e.g. countries, cities, etc). "
        "If you need hotel recommendations, ask 'hotel_advisor' for help. "
        "You MUST include human-readable response before transferring to another agent."
    ),
)


def call_travel_advisor(
    state: MultiAgentState,
) -> Command[Literal["hotel_advisor", "human"]]:
    # You can also add additional logic like changing the input to the agent / output from the agent, etc.
    # NOTE: we're invoking the ReAct agent with the full history of messages in the state
    response = travel_advisor.invoke(state)
    update = {**response, "last_active_agent": "travel_advisor"}
    return Command(update=update, goto="human")


# Define hotel advisor tools and ReAct agent
hotel_advisor_tools = [
    get_hotel_recommendations,
    make_handoff_tool(agent_name="travel_advisor"),
]
hotel_advisor = create_react_agent(
    model,
    hotel_advisor_tools,
    prompt=(
        "You are a hotel expert that can provide hotel recommendations for a given destination. "
        "If you need help picking travel destinations, ask 'travel_advisor' for help."
        "You MUST include human-readable response before transferring to another agent."
    ),
)


def call_hotel_advisor(
    state: MultiAgentState,
) -> Command[Literal["travel_advisor", "human"]]:
    response = hotel_advisor.invoke(state)
    update = {**response, "last_active_agent": "hotel_advisor"}
    return Command(update=update, goto="human")


def human_node(
    state: MultiAgentState, config
) -> Command[Literal["hotel_advisor", "travel_advisor", "human"]]:
    """A node for collecting user input."""

    user_input = interrupt(value="Ready for user input.")
    active_agent = state["last_active_agent"]

    return Command(
        update={
            "messages": [
                {
                    "role": "human",
                    "content": user_input,
                }
            ]
        },
        goto=active_agent,
    )


builder = StateGraph(MultiAgentState)
builder.add_node("travel_advisor", call_travel_advisor)
builder.add_node("hotel_advisor", call_hotel_advisor)

# This adds a node to collect human input, which will route
# back to the active agent.
builder.add_node("human", human_node)

```

--------------------------------

### LangGraph Multi-Agent Systems

Source: https://langchain-ai.github.io/langgraph/llms

Build multi-agent systems using LangGraph, focusing on agent communication and handoffs. Implement various architectures like network, supervisor, and hierarchical models, managing state and control flow between independent agents.

```Python
from typing import List, Dict, Any
from langgraph.graph import StateGraph, END

# Define state for each agent
class AgentState:
    input: str
    output: str
    intermediate_steps: List

# Define individual agent functions (simplified)
def agent1(state: AgentState):
    # Agent 1 logic: processes input and decides next step
    if "process" in state["input"]:
        return {"output": "Agent 1 processed", "intermediate_steps": [state["input"]]}
    else:
        return {"output": "Agent 1 waiting", "intermediate_steps": []}

def agent2(state: AgentState):
    # Agent 2 logic: receives output from agent 1 and acts
    if "Agent 1 processed" in state["output"]:
        return {"output": "Agent 2 completed", "intermediate_steps": [state["output"]]}
    else:
        return {"output": "Agent 2 waiting", "intermediate_steps": []}

# Define the supervisor logic (simplified)
def supervisor(state: AgentState):
    # Supervisor decides which agent goes next based on state
    if state["output"] == "Agent 1 processed":
        return {"next_agent": "agent2"}
    elif state["output"] == "Agent 2 completed":
        return {"next_agent": END}
    else:
        return {"next_agent": "agent1"}

# --- Graph Definition ---
workflow = StateGraph(AgentState)

# Add nodes for each agent
workflow.add_node("agent1", agent1)
workflow.add_node("agent2", agent2)

# Add the supervisor node
workflow.add_node("supervisor", supervisor)

# Set the entry point
workflow.set_entry_point("supervisor")

# Define the routing logic from the supervisor
workflow.add_edge("supervisor", "agent1") # Default entry
workflow.add_conditional_edges(
    "agent1",
    lambda state: state["output"],
    {
        "Agent 1 processed": "agent2",
        END: END
    }
)
workflow.add_conditional_edges(
    "agent2",
    lambda state: state["output"],
    {
        "Agent 2 completed": END,
        END: END
    }
)

# Compile the graph
# app = workflow.compile()

# Example usage (conceptual):
# initial_state = AgentState(input="Start processing", output="", intermediate_steps=[])
# result = app.invoke(initial_state)
```

--------------------------------

### Create Multi-Agent Graph

Source: https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor

Demonstrates the assembly of a multi-agent system by creating a graph that includes the supervisor agent and individual agents as subgraph nodes. This sets up the overall structure for agent interaction.

```python
fromlanggraph.graphimport END
```

--------------------------------

### Define Agents and Multi-Agent Graph

Source: https://langchain-ai.github.io/langgraph/how-tos/multi_agent

Defines two agents, `flight_assistant` and `hotel_assistant`, using `create_react_agent`. It configures their models, tools (including handoff tools), and prompts. A `StateGraph` is then constructed to manage the flow between these agents, starting with the `flight_assistant`.

```Python
# Handoffs
transfer_to_hotel_assistant = create_handoff_tool(
    agent_name="hotel_assistant",
    description="Transfer user to the hotel-booking assistant.",
)
transfer_to_flight_assistant = create_handoff_tool(
    agent_name="flight_assistant",
    description="Transfer user to the flight-booking assistant.",
)

# Simple agent tools
def book_hotel(hotel_name: str):
"""Book a hotel"""
    return f"Successfully booked a stay at {hotel_name}."

def book_flight(from_airport: str, to_airport: str):
"""Book a flight"""
    return f"Successfully booked a flight from {from_airport} to {to_airport}."

# Define agents
flight_assistant = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[book_flight, transfer_to_hotel_assistant],
    prompt="You are a flight booking assistant",
    name="flight_assistant"
)
hotel_assistant = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[book_hotel, transfer_to_flight_assistant],
    prompt="You are a hotel booking assistant",
    name="hotel_assistant"
)

# Define multi-agent graph
multi_agent_graph = (
    StateGraph(MessagesState)
    .add_node(flight_assistant)
    .add_node(hotel_assistant)
    .add_edge(START, "flight_assistant")
    .compile()
)
```

--------------------------------

### Network Architecture with Multiple Agents (Python)

Source: https://langchain-ai.github.io/langgraph/js/concepts/multi_agent

Sets up a LangGraph network architecture with multiple agents (agent1, agent2, agent3) that can communicate in a many-to-many fashion. Each agent uses a `Command` object to update messages and specify the next agent.

```python
import{StateGraph,
Annotation,
MessagesAnnotation,
Command
}from"@langchain/langgraph";
import{ChatOpenAI}from"@langchain/openai";

constmodel=newChatOpenAI({
model:"gpt-4o-mini",
});

constagent1=async(state:typeofMessagesAnnotation.State)=>{
// you can pass relevant parts of the state to the LLM (e.g., state.messages)
// to determine which agent to call next. a common pattern is to call the model
// with a structured output (e.g. force it to return an output with a "next_agent" field)
constresponse=awaitmodel.withStructuredOutput(...).invoke(...);
returnnewCommand({
update:{
messages:[response.content],
},
goto:response.next_agent,
});
};

constagent2=async(state:typeofMessagesAnnotation.State)=>{
constresponse=awaitmodel.withStructuredOutput(...).invoke(...);
returnnewCommand({
update:{
messages:[response.content],
},
goto:response.next_agent,
});
};

constagent3=async(state:typeofMessagesAnnotation.State)=>{
...// Assume agent3 implementation is similar
returnnewCommand({
update:{
messages:[response.content],
},
goto:response.next_agent,
});
};

constgraph=newStateGraph(MessagesAnnotation)
.addNode("agent1",agent1,{
ends:["agent2","agent3""__end__"],
})
.addNode("agent2",agent2,{
ends:["agent1","agent3","__end__"],
})
.addNode("agent3",agent3,{
ends:["agent1","agent2","__end__"],
})
.addEdge("__start__","agent1")
.compile();
```

--------------------------------

### LangGraph Multi-Agent Network (Functional API)

Source: https://langchain-ai.github.io/langgraph/js/how-tos

How to build a multi-agent network using the Functional API in LangGraph, enabling complex interactions between multiple autonomous agents.

```Python
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from typing import List, Dict, Any

# Define tools (example)
@tool
def search(query: str) -> str:
    """Search the web."""
    return f"Results for {query}"

# Define agent creation function
def create_agent(name: str, llm: ChatOpenAI, tools: List, prompt: str) -> AgentExecutor:
    agent = create_react_agent(llm, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, verbose=True)

# Define graph state
class State:
    agent1_output: str
    agent2_output: str
    final_output: str

# Initialize LLM and prompt
llm = ChatOpenAI(model="gpt-4o")
prompt = hub.pull("hwchase17/react")

# Create agents
agent1 = create_agent("Agent1", llm, [search], prompt)
agent2 = create_agent("Agent2", llm, [search], prompt)

# Build the graph
workflow = StateGraph(State)
workflow.add_node("agent1", agent1)
workflow.add_node("agent2", agent2)

workflow.add_edge("agent1", "agent2")
workflow.add_edge("agent2", END)

workflow.set_entry_point("agent1")

graph = workflow.compile()

# Example usage
result = graph.invoke({"agent1_input": "What is the capital of France?"})
print(result)
```

--------------------------------

### Subgraph with Independent Memory

Source: https://langchain-ai.github.io/langgraph/how-tos/cross-thread-persistence

Shows how to configure a subgraph to use its own independent memory by compiling it with a checkpointer. This is useful for multi-agent systems where agents need separate state tracking.

```Python
subgraph_builder = StateGraph(...)
subgraph = subgraph_builder.compile(checkpointer=True)
```

--------------------------------

### LangGraph Supervisor Multi-agent System

Source: https://langchain-ai.github.io/langgraph/agents/multi-agent

Demonstrates how to set up and run a multi-agent system using the Supervisor architecture in LangGraph. This involves defining individual agents (e.g., flight and hotel booking assistants) and a supervisor agent that coordinates their tasks. The code utilizes `langgraph-supervisor` and `langchain-openai` libraries.

```Python
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langgraph_supervisor import create_supervisor

def book_hotel(hotel_name: str):
    """Book a hotel"""
    return f"Successfully booked a stay at {hotel_name}."

def book_flight(from_airport: str, to_airport: str):
    """Book a flight"""
    return f"Successfully booked a flight from {from_airport} to {to_airport}."

flight_assistant = create_react_agent(
    model="openai:gpt-4o",
    tools=[book_flight],
    prompt="You are a flight booking assistant",
    name="flight_assistant"
)

hotel_assistant = create_react_agent(
    model="openai:gpt-4o",
    tools=[book_hotel],
    prompt="You are a hotel booking assistant",
    name="hotel_assistant"
)

supervisor = create_supervisor(
    agents=[flight_assistant, hotel_assistant],
    model=ChatOpenAI(model="gpt-4o"),
    prompt=(
        "You manage a hotel booking assistant and a"
        "flight booking assistant. Assign work to them."
    )
).compile()

for chunk in supervisor.stream(
    {
        "messages": [
            {
                "role": "user",
                "content": "book a flight from BOS to JFK and a stay at McKittrick Hotel"
            }
        ]
    }
):
    print(chunk)
    print("\n")

```

--------------------------------

### Subgraph with Independent Memory

Source: https://langchain-ai.github.io/langgraph/how-tos/memory/add-memory

Shows how to configure a subgraph to use its own independent memory by compiling it with a checkpointer. This is useful for multi-agent systems where agents need separate state tracking.

```Python
subgraph_builder = StateGraph(...)
subgraph = subgraph_builder.compile(checkpointer=True)
```

--------------------------------

### Wrapping Subgraph Calls for Visualization

Source: https://langchain-ai.github.io/langgraph/concepts/multi_agent

Explains the necessary wrapper function when using `Command(graph=Command.PARENT)` for subgraphs to ensure proper visualization. Instead of directly adding a subgraph, a function that invokes the subgraph with `Command` annotation is added.

```python
from typing import Literal
from langgraph.graph import Command

def call_alice(state) -> Command[Literal["bob"]]:
    return alice.invoke(state)

builder.add_node("alice", call_alice)
```

--------------------------------

### Define Explicit Control Flow in LangGraph

Source: https://langchain-ai.github.io/langgraph/concepts/multi_agent

This Python code demonstrates how to set up a multi-agent workflow using LangGraph with explicit control flow. It defines two agents, 'agent_1' and 'agent_2', and explicitly sets the sequence of their execution using add_edge, starting from START and proceeding to agent_1, then to agent_2. It utilizes ChatOpenAI for the model and MessagesState for managing conversation history.

```Python
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START

model = ChatOpenAI()

defagent_1(state: MessagesState):
    response = model.invoke(...)
    return {"messages": [response]}

defagent_2(state: MessagesState):
    response = model.invoke(...)
    return {"messages": [response]}

builder = StateGraph(MessagesState)
builder.add_node(agent_1)
builder.add_node(agent_2)
# define the flow explicitly
builder.add_edge(START, "agent_1")
builder.add_edge("agent_1", "agent_2")

```

--------------------------------

### Build Team 1 Supervisor and Agents (Python)

Source: https://langchain-ai.github.io/langgraph/concepts/multi_agent

Sets up the first team's supervisor and agents. It defines the state for Team 1, the supervisor logic to route to agents or the supervisor itself, and individual agent logic that returns commands to the supervisor. The graph is then compiled.

```python
fromtypingimport Literal
fromlanggraph.graphimport StateGraph, MessagesState, START, END
fromlanggraph.typesimport Command

# Assuming 'model' is an initialized ChatOpenAI instance
# model = ChatOpenAI()

# Define Team 1 state (simplified for example)
classTeam1State(MessagesState):
    next: Literal["team_1_agent_1", "team_1_agent_2", END]

defteam_1_supervisor(state: MessagesState) -> Command[Literal["team_1_agent_1", "team_1_agent_2", END]]:
    # ... supervisor logic to determine next agent ...
    response = model.invoke(...)
    return Command(goto=response["next_agent"])

defteam_1_agent_1(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    # ... agent 1 logic ...
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

defteam_1_agent_2(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    # ... agent 2 logic ...
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

team_1_builder = StateGraph(Team1State)
team_1_builder.add_node("team_1_supervisor", team_1_supervisor)
team_1_builder.add_node("team_1_agent_1", team_1_agent_1)
team_1_builder.add_node("team_1_agent_2", team_1_agent_2)
team_1_builder.add_edge(START, "team_1_supervisor")
# Add edges from agents back to supervisor if needed, e.g.:
# team_1_builder.add_edge("team_1_agent_1", "team_1_supervisor")
# team_1_builder.add_edge("team_1_agent_2", "team_1_supervisor")
team_1_graph = team_1_builder.compile()

```

--------------------------------

### Build Team 2 Supervisor and Agents (Python)

Source: https://langchain-ai.github.io/langgraph/concepts/multi_agent

Sets up the second team's supervisor and agents, similar to Team 1. It defines a custom state for Team 2, the supervisor's routing logic, and the agents' actions. The graph structure is defined and then compiled.

```python
fromtypingimport Literal
fromlanggraph.graphimport StateGraph, MessagesState, START, END
fromlanggraph.typesimport Command

# Assuming 'model' is an initialized ChatOpenAI instance
# model = ChatOpenAI()

# Define Team 2 state
classTeam2State(MessagesState):
    next: Literal["team_2_agent_1", "team_2_agent_2", "__end__"]

defteam_2_supervisor(state: Team2State):
    # ... supervisor logic for team 2 ...
    pass

defteam_2_agent_1(state: Team2State):
    # ... agent 1 logic for team 2 ...
    pass

defteam_2_agent_2(state: Team2State):
    # ... agent 2 logic for team 2 ...
    pass

team_2_builder = StateGraph(Team2State)
# Add nodes and edges for team 2
# team_2_builder.add_node("team_2_supervisor", team_2_supervisor)
# team_2_builder.add_node("team_2_agent_1", team_2_agent_1)
# team_2_builder.add_node("team_2_agent_2", team_2_agent_2)
# team_2_builder.add_edge(START, "team_2_supervisor")
# ... other edges ...
team_2_graph = team_2_builder.compile()

```

--------------------------------

### Subgraph Independent Memory

Source: https://langchain-ai.github.io/langgraph/how-tos/persistence

Shows how to configure a subgraph to have its own independent memory by compiling it with a checkpointer, useful for multi-agent systems.

```Python
subgraph_builder = StateGraph(...)
subgraph = subgraph_builder.compile(checkpointer=True)
```
