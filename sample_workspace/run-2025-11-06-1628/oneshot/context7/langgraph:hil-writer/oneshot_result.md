# Oneshot Mode Result

**Scenario**: langgraph:hil-writer
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:38.921Z

---

## Query

Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/langchain-ai_github_io_langgraph",
  "topic": "Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint."
}
```

---

## Tool Result

### Implement Human Approval for Tool Calls with LangGraph

Source: https://langchain-ai.github.io/langgraph/js/agents/human-in-the-loop

This Python code demonstrates how to integrate human-in-the-loop functionality into an agent using LangGraph. It defines a `bookHotel` tool that pauses execution using `interrupt()` for human review or edits, and then resumes based on the human's response. The example also shows how to set up the agent with a checkpointer and an LLM, and how to stream agent output.

```python
import{MemorySaver}from"@langchain/langgraph-checkpoint";
import{interrupt}from"@langchain/langgraph";
import{createReactAgent}from"@langchain/langgraph/prebuilt";
import{initChatModel}from"langchain/chat_models/universal";
import{tool}from"@langchain/core/tools";
import{z}from"zod";

// An example of a sensitive tool that requires human review / approval
constbookHotel=tool(
async(input:{hotelName:string;})=>{
lethotelName=input.hotelName;
constresponse=interrupt(
`Trying to call `book_hotel` with args {'hotel_name': ${hotelName}}. `+
`Please approve or suggest edits.`
)
if(response.type==="accept"){
// proceed to execute the tool logic
}
elseif(response.type==="edit"){
hotelName=response.args["hotel_name"]
}
else{
thrownewError(`Unknown response type: ${response.type}`)
}
return`Successfully booked a stay at ${hotelName}.`;
},
{
name:"bookHotel",
schema:z.object({
hotelName:z.string().describe("Hotel to book"),
}),
description:"Book a hotel.",
}
);

constcheckpointer=newMemorySaver();

constllm=awaitinitChatModel("anthropic:claude-3-7-sonnet-latest");
constagent=createReactAgent({
llm,
tools:[bookHotel],
checkpointer
});

```

--------------------------------

### Integrate Wrapped Tool with React Agent

Source: https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop

This Python code demonstrates how to use the `add_human_in_the_loop` wrapper with LangGraph's `create_react_agent`. It sets up an agent with a tool that requires human review, initializes a checkpointer, and then streams messages to the agent. The agent execution pauses at the interrupt point, waiting for human input.

```Python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.prebuilt import create_react_agent

# Assuming add_human_in_the_loop is defined as above

def book_hotel(hotel_name: str):
    """Book a hotel"""
    return f"Successfully booked a stay at {hotel_name}."


checkpointer = InMemorySaver()

agent = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[
        add_human_in_the_loop(book_hotel),
    ],
    checkpointer=checkpointer,
)

config = {"configurable": {"thread_id": "1"}}

# Run the agent
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "book a stay at McKittrick hotel"}]},
    config
):
    print(chunk)
    print("\n")
```

--------------------------------

### Add Memory to LangGraph Agent

Source: https://langchain-ai.github.io/langgraph/agents/agents

Enables multi-turn conversations by providing a checkpointer and `thread_id` for persistence. The agent automatically includes message history from previous turns when invoked with the same `thread_id`.

```Python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import InMemorySaver

checkpointer = InMemorySaver()

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_weather],
    checkpointer=checkpointer  
)

# Run the agent
config = {"configurable": {"thread_id": "1"}}
sf_response = agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]},
    config  
)
ny_response = agent.invoke(
    {"messages": [{"role": "user", "content": "what about new york?"}]},
    config
)

```

--------------------------------

### LangGraph Human-in-the-loop: Waiting for User Input

Source: https://langchain-ai.github.io/langgraph/js/how-tos

This guide shows how to implement human-in-the-loop workflows in LangGraph by waiting for user input using the `interrupt` function. This allows the agent to pause and await external confirmation or data.

```python
from langgraph.graph import StateGraph, END

# Define a state that includes a flag to indicate waiting for input
class HumanInLoopState:
    value: str
    waiting_for_input: bool = False

# Node that might need human input
def decision_node(state: HumanInLoopState):
    # Logic to decide if human input is needed
    if "needs_approval" in state.value:
        return {"value": state.value, "waiting_for_input": True}
    else:
        return {"value": state.value, "waiting_for_input": False}

# Node that handles user input (or continues if no input needed)
def process_input_node(state: HumanInLoopState):
    if state.waiting_for_input:
        # This node would typically be reached after human input is provided
        # For demonstration, let's assume input is already in state.value
        return {"value": f"Processed: {state.value}", "waiting_for_input": False}
    else:
        return {"value": state.value, "waiting_for_input": False}

# Conceptual graph setup:
# workflow = StateGraph(HumanInLoopState)
# workflow.add_node("decision", decision_node)
# workflow.add_node("process_input", process_input_node)

# workflow.add_edge("previous_node", "decision")

# Use conditional edges with the interrupt mechanism
# The 'interrupt' function is implicitly handled by the graph runner when waiting_for_input is True
# You need to configure the graph to know how to proceed after interruption.

# Conceptual conditional edge:
# workflow.add_conditional_edges(
#     "decision",
#     lambda state: "process_input" if not state.waiting_for_input else END # Or a specific input node
# )

# The actual mechanism involves compiling with an interrupt handler or using specific return values.
# A common pattern is to return a specific signal that the runner interprets.

# Example using a specific return value (conceptual):
# def decision_node_with_interrupt(state: HumanInLoopState):
#     if "needs_approval" in state.value:
#         return {"action": "wait"} # Signal to wait
#     else:
#         return {"action": "continue", "value": state.value}

# workflow.add_node("decision", decision_node_with_interrupt)
# workflow.add_conditional_edges(
#     "decision",
#     lambda state: "process_input" if state["action"] == "continue" else "decision" # Re-enter decision or wait
# )
# The runner needs to be configured to handle the 'wait' action, potentially by pausing execution
# and waiting for external input to be provided to the next step.
```

--------------------------------

### Python: Pause and Resume Graph with Interrupt

Source: https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop

Demonstrates how to use the `interrupt` function to pause a LangGraph execution and resume it with new input. This is useful for human-in-the-loop workflows where external input is required. It requires a checkpointer to save state and the `Command` primitive for resuming.

```python
fromlanggraph.typesimport interrupt, Command

defhuman_node(state: State):
    value = interrupt( 
        {
            "text_to_revise": state["some_text"]
        }
    )
    return {
        "some_text": value 
    }


graph = graph_builder.compile(checkpointer=checkpointer)

# Run the graph until the interrupt is hit.
config = {"configurable": {"thread_id": "some_id"}}
result = graph.invoke({"some_text": "original text"}, config=config) 
print(result['__interrupt__'])
# > [
# >    Interrupt(
# >       value={'text_to_revise': 'original text'},
# >       resumable=True,
# >       ns=['human_node:6ce9e64f-edef-fe5d-f7dc-511fa9526960']
# >    )
# > ]

print(graph.invoke(Command(resume="Edited text"), config=config)) 
# > {'some_text': 'Edited text'}
```

--------------------------------

### Create and Handle HumanInterrupt Request in Python

Source: https://langchain-ai.github.io/langgraph/reference/prebuilt

Demonstrates how to create a HumanInterrupt object to request human intervention, specifying the action, arguments, configuration options (like allowing ignore, respond, edit, accept), and an optional description. It also shows how to send this interrupt request to the interrupt function and process the response.

```Python
from typing import Optional, Literal, Union
from typing_extensions import TypedDict

# Assuming ActionRequest and HumanInterruptConfig are defined elsewhere
# For demonstration purposes, let's define them here:
class ActionRequest("TypedDict", total=False):
    action: str
    args: dict

class HumanInterruptConfig("TypedDict", total=False):
    allow_ignore: bool
    allow_respond: bool
    allow_edit: bool
    allow_accept: bool

class HumanInterrupt(TypedDict):
    action_request: ActionRequest
    config: HumanInterruptConfig
    description: Optional[str]

class HumanResponse(TypedDict):
    type: Literal['accept', 'ignore', 'response', 'edit']
    args: Union[None, str, ActionRequest]

# Placeholder for the interrupt function
def interrupt(requests: list) -> list:
    # In a real scenario, this would interact with a human or an external system
    # and return the responses.
    # For this example, we'll simulate a response.
    print("Simulating interrupt...")
    # Example response: assuming the first request is accepted
    return [{'type': 'accept', 'args': None}]

# Extract a tool call from the state and create an interrupt request
request = HumanInterrupt(
    action_request=ActionRequest(
        action="run_command",  # The action being requested
        args={"command": "ls", "args": ["-l"]}
    ),
    config=HumanInterruptConfig(
        allow_ignore=True,    # Allow skipping this step
        allow_respond=True,   # Allow text feedback
        allow_edit=False,     # Don't allow editing
        allow_accept=True     # Allow direct acceptance
    ),
    description="Please review the command before execution"
)
# Send the interrupt request and get the response
response = interrupt([request])[0]

print(f"Received response: {response}")

```

--------------------------------

### Python: Multi-turn conversation node with interrupt

Source: https://langchain-ai.github.io/langgraph/how-tos/multi_agent

Defines a node for collecting user input in a multi-turn conversation. It uses an interrupt to pause execution and wait for user input, then updates the state with the input and routes to the active agent.

```Python
from typing import Literal
from langgraph.types import Command, interrupt

def human(state) -> Command[Literal["agent", "another_agent"]]:
    """A node for collecting user input."""
    user_input = interrupt(value="Ready for user input.")

    # Determine the active agent.
    active_agent = ...

    ...
    return Command(
        update={
            "messages": [{
                "role": "human",
                "content": user_input,
            }]
        },
        goto=active_agent
    )
```

--------------------------------

### Python: Create Thread and Run Graph with Interrupt

Source: https://langchain-ai.github.io/langgraph/js/cloud/how-tos/human_in_the_loop_edit_state

This Python code snippet shows how to create a thread and run a LangGraph assistant ('agent'). It captures the result when an interrupt occurs and then resumes the graph execution with updated input.

```python
from langgraph_sdk import get_client
client = get_client(url=<DEPLOYMENT_URL>)

# Using the graph deployed with the name "agent"
assistant_id = "agent"

# create a thread
thread = await client.threads.create()
thread_id = thread["thread_id"]

# Run the graph until the interrupt is hit.
result = await client.runs.wait(
    thread_id,
    assistant_id,
    input={"some_text": "original text"}   
)

# Resume the graph
await client.runs.wait(
    thread_id,
    assistant_id,
    input={"resume": "Edited text"}   
)
```

--------------------------------

### Python: Dynamic Interrupts with LangGraph SDK

Source: https://langchain-ai.github.io/langgraph/cloud/how-tos/add-human-in-the-loop

This Python code demonstrates how to use the LangGraph SDK to interact with a deployed agent, triggering and resuming dynamic interrupts. It shows how to create a thread, run the graph until an interrupt occurs, inspect the interrupt payload, and then resume the graph with new input.

```Python
from langgraph_sdk import get_client
from langgraph_sdk.schema import Command
client = get_client(url=<DEPLOYMENT_URL>)
# Using the graph deployed with the name "agent"
assistant_id = "agent"
# create a thread
thread = await client.threads.create()
thread_id = thread["thread_id"]
# Run the graph until the interrupt is hit.
result = await client.runs.wait(
    thread_id,
    assistant_id,
    input={"some_text": "original text"}   # (1)!
)
print(result['__interrupt__']) # (2)!
# > [
# >     {
# >         'value': {'text_to_revise': 'original text'},
# >         'resumable': True,
# >         'ns': ['human_node:fc722478-2f21-0578-c572-d9fc4dd07c3b'],
# >         'when': 'during'
# >     }
# > ]
# Resume the graph
print(await client.runs.wait(
    thread_id,
    assistant_id,
    command=Command(resume="Edited text")   # (3)!
))
```

--------------------------------

### LangGraph Human-in-the-loop: Reviewing Tool Calls

Source: https://langchain-ai.github.io/langgraph/js/how-tos

Implement human-in-the-loop for reviewing tool calls before execution. This allows a human to approve, edit, or reject tool requests generated by the agent.

```python
from langgraph.graph import StateGraph, END

# Assume state includes tool_calls and a decision field
class AgentState:
    thought: str
    tool_calls: list
    decision: str = "continue" # 'continue', 'review', 'reject'

# Node that generates tool calls
def generate_tool_calls(state: AgentState):
    # ... logic to generate tool calls ...
    return {"thought": "Thinking about tools...", "tool_calls": [{"name": "search", "args": {"query": "LangGraph"}}], "decision": "review"} # Example: decide to review

# Node that handles review
def review_tool_calls(state: AgentState):
    # In a real scenario, this would involve human interaction
    # For simulation, we might pre-define the decision
    if state.decision == "review":
        # Simulate human review: approve the first tool call
        return {"thought": "Reviewing tool calls.", "tool_calls": state.tool_calls, "decision": "approved"}
    return state

# Node that executes tool calls
def execute_tool_calls(state: AgentState):
    # ... logic to execute tool calls ...
    return {"thought": "Executing tool calls.", "tool_calls": [], "decision": "continue"}

# Conceptual graph setup:
# workflow = StateGraph(AgentState)
# workflow.add_node("generate_tools", generate_tool_calls)
# workflow.add_node("review_tools", review_tool_calls)
# workflow.add_node("execute_tools", execute_tool_calls)

# workflow.add_edge("previous_node", "generate_tools")

# Conditional edges based on the decision
# workflow.add_conditional_edges(
#     "generate_tools",
#     lambda state: "review_tools" if state.decision == "review" else "execute_tools"
# )
# workflow.add_conditional_edges(
#     "review_tools",
#     lambda state: "execute_tools" if state.decision == "approved" else "generate_tools" # Or END if rejected
# )
# workflow.add_edge("execute_tools", "next_node")

```

--------------------------------

### Wait for User Input in LangGraph (Human-in-the-Loop)

Source: https://langchain-ai.github.io/langgraph/js/llms

Demonstrates how to implement a human-in-the-loop workflow in LangGraph by pausing execution and waiting for user input. This is achieved using the `interrupt` functionality, allowing human intervention at specific points in the graph.

```python
from langgraph.graph import StateGraph, END
from typing import List, Dict, Any
from langchain_core.messages import BaseMessage, HumanMessage

class HumanInputState:
    messages: List[BaseMessage]
    user_input_received: bool = False

def user_input_node(state: HumanInputState) -> Dict[str, Any]:
    # This node waits for external input to proceed
    # In a real application, this would involve a mechanism to signal readiness
    print("Waiting for user input...")
    # For demonstration, we'll assume input is provided externally
    return {"user_input_received": True}

def process_input_node(state: HumanInputState) -> Dict[str, Any]:
    # Process the user input after it's received
    print("Processing user input...")
    # ...
    return {"messages": state["messages"] + [HumanMessage(content="User provided input")]}

workflow = StateGraph(HumanInputState)
workflow.add_node("wait_for_input", user_input_node)
workflow.add_node("process_input", process_input_node)

workflow.set_entry_point("wait_for_input")
workflow.add_edge("wait_for_input", "process_input")
workflow.add_edge("process_input", END)

app = workflow.compile()

# To trigger the 'process_input' node, you would need to signal
# that user input has been received, likely by updating the state
# externally or through a specific API call.
# Example: app.invoke(..., config={'recursion_limit': 50})

```

--------------------------------

### Build and Invoke a LangGraph with Interrupt

Source: https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop

This snippet demonstrates how to build a LangGraph, compile it with a checkpointer, and invoke it with configuration. It shows how to handle the `__interrupt__` key in the result and how to resume execution using the `Command` primitive.

```Python
fromtypingimport TypedDict
importuuid
fromlangchain_core.runnablesimport RunnableConfig
fromlanggraph.checkpoint.memoryimport InMemorySaver
fromlanggraph.constantsimport START
fromlanggraph.graphimport StateGraph
fromlanggraph.typesimport interrupt, Command


classState(TypedDict):
    some_text: str

defhuman_node(state: State):
    value = interrupt({"text_to_revise": state["some_text"]})
    return {"some_text": value}

graph_builder = StateGraph(State)
graph_builder.add_node("human_node", human_node)
graph_builder.add_edge(START, "human_node")

checkpointer = InMemorySaver()
graph = graph_builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": uuid.uuid4()}}
result = graph.invoke({"some_text": "original text"}, config=config)

print(result['__interrupt__'])
print(result["__interrupt__"])

print(graph.invoke(Command(resume="Edited text"), config=config))
```

--------------------------------

### Resume Agent Execution with Command

Source: https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop

This Python code shows how to resume an agent that has been paused by a human-in-the-loop interrupt. It uses LangGraph's `Command` type to send instructions, such as accepting the tool call or editing its arguments, back to the agent. The example demonstrates resuming with an 'accept' command.

```Python
from langgraph.types import Command

# Assuming agent and config are defined as above

for chunk in agent.stream(
    Command(resume=[{"type": "accept"}]),
    # Command(resume=[{"type": "edit", "args": {"args": {"hotel_name": "McKittrick Hotel"}}}]),
    config
):
    print(chunk)
    print("\n")
```

--------------------------------

### Approve Sensitive Tool Calls with Interrupt

Source: https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop

Illustrates how to integrate human approval for sensitive tool calls within a LangGraph agent. It uses `interrupt()` to pause execution before a tool like `book_hotel` is called, allowing a user to approve or edit the arguments. The agent is then resumed with a `Command`.

```Python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt
from langgraph.prebuilt import create_react_agent

# An example of a sensitive tool that requires human review / approval
def book_hotel(hotel_name: str):
    """Book a hotel"""
    response = interrupt(  
        f"Trying to call `book_hotel` with args {{'hotel_name': {hotel_name}}}. "
        "Please approve or suggest edits."
    )
    if response["type"] == "accept":
        pass
    elif response["type"] == "edit":
        hotel_name = response["args"]["hotel_name"]
    else:
        raise ValueError(f"Unknown response type: {response['type']}")
    return f"Successfully booked a stay at {hotel_name}."

checkpointer = InMemorySaver()

agent = create_react_agent(
    model="anthropic:claude-3-5-sonnet-latest",
    tools=[book_hotel],
    checkpointer=checkpointer, 
)

config = {
   "configurable": {
      "thread_id": "1"
   }
}

for chunk in agent.stream(
    {"messages": [{"role": "user", "content": "book a stay at McKittrick hotel"}]},
    config
):
    print(chunk)
    print("\n")

from langgraph.types import Command

for chunk in agent.stream(
    Command(resume={"type": "accept"}),  
    # Command(resume={"type": "edit", "args": {"hotel_name": "McKittrick Hotel"}}),
    config
):
    print(chunk)
    print("\n")
```

--------------------------------

### Build LangGraph with Chatbot and Tools

Source: https://langchain-ai.github.io/langgraph/tutorials/get-started/4-human-in-the-loop

Constructs a LangGraph with a chatbot node that uses an LLM bound to tools (TavilySearch, human_assistance). It includes a ToolNode for executing tools and conditional edges based on tool calls. The graph uses InMemorySaver for checkpointing.

```python
from typing import Annotated

from langchain_tavily import TavilySearch
from langchain_core.tools import tool
from typing_extensions import TypedDict

from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt

classState(TypedDict):
    messages: Annotated[list, add_messages]

graph_builder = StateGraph(State)

@tool
defhuman_assistance(query: str) -> str:
    """Request assistance from a human."""
    human_response = interrupt({"query": query})
    return human_response["data"]

tool = TavilySearch(max_results=2)
tools = [tool, human_assistance]
llm_with_tools = llm.bind_tools(tools)

defchatbot(state: State):
    message = llm_with_tools.invoke(state["messages"])
    assert(len(message.tool_calls) <= 1)
    return {"messages": [message]}

graph_builder.add_node("chatbot", chatbot)

tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)

graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

memory = InMemorySaver()
graph = graph_builder.compile(checkpointer=memory)
```
