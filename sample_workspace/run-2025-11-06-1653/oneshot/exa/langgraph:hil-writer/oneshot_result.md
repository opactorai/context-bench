# Oneshot Mode Result

**Scenario**: langgraph:hil-writer
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:54:56.978Z

---

## Query

Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint.

---

## Tool Input

```json
{
  "query": "Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint."
}
```

---

## Tool Result

## Interrupts - Docs by LangChain

https://langchain-ai.github.io/langgraph/agents/human-in-the-loop/

```
graph = builder.compile(
 interrupt_before=["node_a"], 
 interrupt_after=["node_b", "node_c"], 
 checkpointer=checkpointer,
)

# Pass a thread ID to the graph
config = {
 "configurable": {
 "thread_id": "some_thread"
 }
}

# Run the graph until the breakpoint
graph.invoke(inputs, config=config) 

# Resume the graph
graph.invoke(None, config=config)
```

## LangGraph Workflow with Human Feedback and Memory Saving

https://raw.githubusercontent.com/LangChain-OpenTutorial/LangChain-OpenTutorial/main/docs/17-LangGraph/03-Use-Cases/15-LangGraph-Functional-API.md

```
from uuid import uuid4
from langgraph.func import entrypoint, task
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver


@task()
def step_1(input_query):
    """Append bar."""
    return f"{input_query} bar"


@task()
def human_feedback(input_query):
    """Append user input."""
    feedback = interrupt(f"Please provide feedback: {input_query}")
    return f"{input_query} {feedback}"


@task()
def step_3(input_query):
    """Append qux."""
    return f"{input_query} qux"

checkpointer = MemorySaver()

@entrypoint(checkpointer=checkpointer)
def graph(input_query):
    result_1 = step_1(input_query).result()
    feedback = interrupt(f"Please provide feedback: {result_1}")

    result_2 = f"{input_query} {feedback}"
    result_3 = step_3(result_2).result()

    return result_3

config = {"configurable": {"thread_id": str(uuid4())}}
for event in graph.stream("foo", config):
    print(event)
    print("\n")
```

## 4. Add human-in-the-loop

https://langchain-ai.github.io/langgraph/tutorials/get-started/4-human-in-the-loop/

```
# Step 1: Define tools and model
from langchain.tools import tool
from langchain.chat_models import init_chat_model
model=init_chat_model(
"claude-sonnet-4-5-20250929",
temperature=0
)
# Define tools
@tool
def multiply(a:int,b:int ) -> int:
"""Multiply `a` and `b`.
Args:
a: First int
b: Second int
"""
return a*b
@tool
def add(a:int,b:int ) -> int:
"""Adds `a` and `b`.
Args:
a: First int
b: Second int
"""
return a+b
@tool
def divide(a:int,b:int ) -> float:
"""Divide `a` and `b`.
Args:
a: First int
b: Second int
"""
return a/b
# Augment the LLM with tools
tools=[add, multiply, divide]
tools_by_name={tool.name: tool for tool in tools}
model_with_tools=model.bind_tools(tools)
# Step 2: Define state
from langchain.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
import operator
class MessagesState(TypedDict ):
messages: Annotated[list[AnyMessage], operator.add]
llm_calls: int
# Step 3: Define model node
from langchain.messages import SystemMessage
def llm_call(state:dict ):
"""LLM decides whether to call a tool or not"""
return{
"messages" : [
model_with_tools.invoke(
[
SystemMessage(
content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
)
]
+state[ "messages"]
)
],
"llm_calls" : state.get( 'llm_calls',0)+1
}
# Step 4: Define tool node
from langchain.messages import ToolMessage
def tool_node(state:dict ):
"""Performs the tool call"""
result=[]
for tool_call in state[ "messages" ][-1 ].tool_calls:
tool=tools_by_name[tool_call[ "name" ]]
observation=tool.invoke(tool_call[ "args" ])
result.append(ToolMessage( content=observation, tool_call_id=tool_call[ "id" ]))
return{"messages" : result}
# Step 5: Define logic to determine whether to end
from typing import Literal
from langgraph.graph import StateGraph, START,END
# Conditional edge function to route to the tool node or end based upon whether the LLM made a tool call
def should_continue(state : MessagesState) -> Literal[ "tool_node",END ]:
"""Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""
messages=state[ "messages"]
last_message=messages[-1]
# If the LLM makes a tool call, then perform an action
if last_message.tool_calls:
return "tool_node"
# Otherwise, we stop (reply to the user)
return END
# Step 6: Build agent
# Build workflow
agent_builder=StateGraph(MessagesState)
# Add nodes
agent_builder.add_node( "llm_call" , llm_call)
agent_builder.add_node( "tool_node" , tool_node)
# Add edges to connect nodes
agent_builder.add_edge( START,"llm_call")
agent_builder.add_conditional_edges(
"llm_call",
should_continue,
["tool_node",END]
)
agent_builder.add_edge( "tool_node","llm_call")
# Compile the agent
agent=agent_builder.compile()
from IPython.display import Image, display
# Show the agent
display(Image(agent.get_graph( xray=True ).draw_mermaid_png()))
# Invoke
from langchain.messages import HumanMessage
messages=[HumanMessage( content="Add 3 and 4." )]
messages=agent.invoke({ "messages" : messages})
for m in messages[ "messages" ]:
m.pretty_print()
```

## How to Build a Feedback-Driven AI Agent Using LangGraph (Step-by-Step Tutorial)

https://medium.com/@jaslearns/how-to-build-a-feedback-driven-ai-agent-using-langgraph-step-by-step-tutorial-e5ed2c01d544

```
Your feedback (or type 'approve' to finish): approve
```

## Interrupts and Commands in LangGraph: Building Human ...

https://dev.to/jamesbmour/interrupts-and-commands-in-langgraph-building-human-in-the-loop-workflows-4ngl

```
# --- Run 2: Reject the task ---
print
(
'
\n
'
+
'
=
'
*
50
+
'
\n
🚀 STARTING RUN 2: REJECTION
\n
'
+
'
=
'
*
50
)
# Use a new thread_id for the second, independent run.
thread2
=
{
'
configurable
'
:
{
'
thread_id
'
:
'
run-2
'
}}
# Start the second run.
for
event
in
graph
.
stream
(
initial_task
,
thread2
,
stream_mode
=
'
values
'
,
debug
=
True
):
print
(
f
'
\n
[STREAM EVENT]:
\n
{
event
}
\n
'
)
# Resume the second run, but this time with a 'reject' decision.
print
(
"
\n
... Resuming Run 2 with
'
reject
'
...
\n
"
)
for
event
in
graph
.
stream
(
Command
(
resume
=
'
reject
'
),
thread2
,
stream_mode
=
'
values
'
,
debug
=
True
):
print
(
f
'
\n
[STREAM EVENT]:
\n
{
event
}
\n
'
)
```

## Implement Human-in-the-Loop with MemorySaver Checkpointer

https://raw.githubusercontent.com/The-Pocket/PocketFlow-Tutorial-Codebase-Knowledge/main/docs/LangGraph/06_checkpointer___basecheckpointsaver__.md

```
# (Simplified HITL example from Chapter 4)
from langgraph.types import interrupt, Command
# ... (State, Nodes: create_plan, request_approval, execute_plan) ...

# Compile WITH checkpointer (REQUIRED for interrupt)
memory_saver_hitl = MemorySaver()
app_hitl = workflow.compile(checkpointer=memory_saver_hitl)

# Run, get interrupted
config_hitl = {"configurable": {"thread_id": str(uuid.uuid4())}}
for chunk in app_hitl.stream({"plan": ""}, config=config_hitl):
    # ... (detect interrupt) ...
    print("Graph interrupted!")
    break

# Resume after human decision
human_decision = "Approved"
for chunk in app_hitl.stream(Command(resume=human_decision), config=config_hitl):
     # ... (process remaining steps) ...
     print("Graph resumed and finished!")
```

## Run Streamlit App with streamlit_app.py

https://raw.githubusercontent.com/JoshuaC215/agent-service-toolkit/main/README.md

```
streamlit run src/streamlit_app.py
```

## shell Result 1

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/providers/openai/README.md

```
python cookbook/providers/openai/agent_stream.py
```

## Enhances CLI for Agent Loop with User Input Handling

https://raw.githubusercontent.com/ai-that-works/ai-that-works/main/2025-05-17-workshop-sf-twelve-factor-agents/agents-workshop/05-human-tools/README.md

```
src/cli.ts
 // cli.ts lets you invoke the agent loop from the command line
 
-import { agentLoop, Thread, Event } from "./agent";
+import { agentLoop, Thread, Event } from "../src/agent";
 
+
+
 export async function cli() {
     // Get command line arguments, skipping the first two (node and script name)
     // Run the agent loop with the thread
     const result = await agentLoop(thread);
-    console.log(result);
+    let lastEvent = result.events.slice(-1)[0];
+
+    while (lastEvent.data.intent === "request_more_information") {
+        const message = await askHuman(lastEvent.data.message);
+        thread.events.push({ type: "human_response", data: message });
+        const result = await agentLoop(thread);
+        lastEvent = result.events.slice(-1)[0];
+    }
+
+    // print the final result
+    // optional - you could loop here too
+    console.log(lastEvent.data.message);
+    process.exit(0);
 }
+
+async function askHuman(message: string) {
+    const readline = require('readline').createInterface({
+        input: process.stdin,
+        output: process.stdout
+    });
+
+    return new Promise((resolve) => {
+        readline.question(`${message}\n> `, (answer: string) => {
+            resolve(answer);
+        });
+    });
+}
```

## POST /chat API for Creating Agents with LangGraph

https://raw.githubusercontent.com/runagent-dev/runagent/main/examples/Vibe_Agent_Builder_gpt_5/README.md

```
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a weather agent using LangGraph",
    "session_id": "optional-session-id"
  }'
```

## langgraph/concepts/human_in_the_loop/ #2290

https://github.com/langchain-ai/langgraph/discussions/2290

```
value = interrupt({ "feedback": "验证你是否是真人，请输入1+1的答案"} )
```

## Agent Class and Loop for LLM Interaction

https://raw.githubusercontent.com/humanlayer/12-factor-agents/main/workshops/2025-05/sections/01-cli-and-agent/README.md

```
// ./walkthrough/01-agent.ts
import { b } from "../baml_client";

// tool call or a respond to human tool
type AgentResponse = Awaited<ReturnType<typeof b.DetermineNextStep>>;

export interface Event {
    type: string
    data: any;
}

export class Thread {
    events: Event[] = [];

    constructor(events: Event[]) {
        this.events = events;
    }

    serializeForLLM() {
        // can change this to whatever custom serialization you want to do, XML, etc
        // e.g. https://github.com/got-agents/agents/blob/59ebbfa236fc376618f16ee08eb0f3bf7b698892/linear-assistant-ts/src/agent.ts#L66-L105
        return JSON.stringify(this.events);
    }
}

// right now this just runs one turn with the LLM, but
// we'll update this function to handle all the agent logic
export async function agentLoop(thread: Thread): Promise<AgentResponse> {
    const nextStep = await b.DetermineNextStep(thread.serializeForLLM());
    return nextStep;
}
```

## Initialize Agenta and Instrument Langchain for Observability

https://raw.githubusercontent.com/Agenta-AI/agenta/main/docs/docs/tutorials/cookbooks/02-observability_langchain.mdx

```
import agenta as ag
from opentelemetry.instrumentation.langchain import LangchainInstrumentor

ag.init()

LangchainInstrumentor().instrument()
```

## Clone langgraph-mcp-agents Repository for Setup

https://raw.githubusercontent.com/teddynote-lab/langgraph-mcp-agents/main/README_KOR.md

```
git clone https://github.com/teddynote-lab/langgraph-mcp-agents.git
cd langgraph-mcp-agents
```

## Manage Graph Execution with langgraph_sdk in Python

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/cloud/how-tos/add-human-in-the-loop.md

```
from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>)

    # Using the graph deployed with the name "agent"
    assistant_id = "agent"

    # create a thread
    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    # Run the graph until the breakpoint
    result = await client.runs.wait(
        thread_id,
        assistant_id,
        input=inputs   # (1)!
    )

    # Resume the graph
    await client.runs.wait(
        thread_id,
        assistant_id,
        input=None   # (2)!
    )
```

## Setup and Launch Robo Blogger with LangGraph CLI

https://raw.githubusercontent.com/langchain-ai/robo-blogger/main/README.md

```
curl -LsSf https://astral.sh/uv/install.sh | sh
git clone https://github.com/langchain-ai/robo-blogger.git
cd robo-blogger
uvx --refresh --from "langgraph-cli[inmem]" --with-editable . --python 3.11 langgraph dev
```

## GraphBuilder Adds Human Node with Interrupt Handling

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/how-tos/human_in_the_loop/add-human-in-the-loop.md

```
// highlight-next-line
import { interrupt, Command } from "@langchain/langgraph";

const graph = graphBuilder
  .addNode("humanNode", (state) => {
    // highlight-next-line
    const value = interrupt(
      // (1)!
      {
        textToRevise: state.someText, // (2)!
      }
    );
    return {
      someText: value, // (3)!
    };
  })
  .addEdge(START, "humanNode")
  .compile({ checkpointer }); // (4)!

// Run the graph until the interrupt is hit.
const config = { configurable: { thread_id: "some_id" } };
const result = await graph.invoke({ someText: "original text" }, config); // (5)!
console.log(result.__interrupt__); // (6)!
// > [
// >   {
// >     value: { textToRevise: 'original text' },
// >     resumable: true,
// >     ns: ['humanNode:6ce9e64f-edef-fe5d-f7dc-511fa9526960'],
// >     when: 'during'
// >   }
// > ]

// highlight-next-line
console.log(await graph.invoke(new Command({ resume: "Edited text" }), config)); // (7)!
// > { someText: 'Edited text' }
```

## LangGraph 201: Adding Human Oversight to Your Deep Research Agent

https://towardsdatascience.com/langgraph-201-adding-human-oversight-to-your-deep-research-agent/

```
human_edit = {
 "follow_up_queries": [
 result["__interrupt__"][0].value["suggested"][0],
 'fault-tolerant quantum computing demonstrations IBM Google IonQ PsiQuantum 2024 2025'
 ]
}

result = graph.invoke(Command(resume=human_edit), config=config)
```

## langgraph/how-tos/human_in_the_loop/wait-user-input/ #925

https://github.com/langchain-ai/langgraph/discussions/925

```
Exception in thread Thread-1 (tracing_control_thread_func):
Traceback (most recent call last):
 File "C:\Users\xxx\AppData\Local\Programs\Python\Python312\Lib\threading.py", line 1073, in _bootstrap_inner
 self.run()
 File "C:\Users\xxx\AppData\Local\Programs\Python\Python312\Lib\threading.py", line 1010, in run
 self._target(*self._args, **self._kwargs)
 File "C:\Users\xxx\venv\Lib\site-packages\langsmith\_internal\_background_thread.py", line 298, in tracing_control_thread_func
 ).start()
 ^^^^^^^
 File "C:\Users\xxx\AppData\Local\Programs\Python\Python312\Lib\threading.py", line 992, in start
 _start_new_thread(self._bootstrap, ())
RuntimeError: can't create new thread at interpreter shutdown
```

## Defines my_agent_function with @task decorator for TruGraph

https://raw.githubusercontent.com/truera/trulens/main/docs/component_guides/instrumentation/langgraph.md

```
from langgraph.func import task

    @task  # This is automatically detected and instrumented by TruGraph
    def my_agent_function(state, config):
        # Your agent logic here
        return updated_state
```

## myGraphFunction Handles Human Interrupts in LangChain

https://raw.githubusercontent.com/langchain-ai/agent-inbox/main/README.md

```
import { interrupt } from "@langchain/langgraph";
import { HumanInterrupt, HumanResponse } from "@langchain/langgraph/prebuilt";

function myGraphFunction(state: MyGraphState) {
  // Extract the last tool call from the `messages` field in the state
  const toolCall = state.messages[state.messages.length - 1].tool_calls[0];
  // Create an interrupt
  const request: HumanInterrupt = {
    action_request: {
      action: toolCall.name,
      args: toolCall.args
    },
    config: {
      allow_ignore: true,
      allow_respond: true,
      allow_edit: false,
      allow_accept: false
    },
    description: _generateEmailMarkdown(state) // Generate a detailed markdown description.
  };
  // Send the interrupt request, and extract the first response.
  // The Agent Inbox will always respond with an array of `HumanResponse` objects, although
  // at this time only a single object will be returned.
  const response = interrupt<HumanInterrupt, HumanResponse[]>(request)[0];
  if (response.type === "response") {
    // Do something with the response
  }
  // ...rest of function
};
```

## Implement Human-in-the-Loop with `interrupt` Function

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/tutorials/get-started/4-human-in-the-loop.md

```
:::

:::js
```

## Making it easier to build human-in-the-loop agents with interrupt

https://blog.langchain.dev/making-it-easier-to-build-human-in-the-loop-agents-with-interrupt/

```
graph.invoke(Command(resume="Your response here"), thread)
```

## Multi-Agent State Management with LangGraph and ChatOpenAI

https://raw.githubusercontent.com/LangChain-OpenTutorial/LangChain-OpenTutorial/main/docs/17-LangGraph/02-Structures/08-LangGraph-Multi-Agent-Structures-01.md

```
from langgraph.graph import MessagesState

model = ChatOpenAI(
    model="gpt-4o-mini",
)

def agent_1(state: MessagesState) -> Command[Literal["agent_2", "agent_3", END]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # to determine which agent to call next. a common pattern is to call the model
    # with a structured output (e.g. force it to return an output with a "next_agent" field)
    response = model.invoke(...)
    # route to one of the agents or exit based on the LLM's decision
    # if the LLM returns "__end__", the graph will finish execution
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]},
    )

def agent_2(state: MessagesState) -> Command[Literal["agent_1", "agent_3", END]]:
    response = model.invoke(...)
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]},
    )

def agent_3(state: MessagesState) -> Command[Literal["agent_1", "agent_2", END]]:
    ...
    return Command(
        goto=response["next_agent"],
        update={"messages": [response["content"]]},
    )

builder = StateGraph(MessagesState)
builder.add_node(agent_1)
builder.add_node(agent_2)
builder.add_node(agent_3)

builder.add_edge(START, "agent_1")
network = builder.compile()
```

## Defines LangGraph Nodes for Task Management in Python

https://raw.githubusercontent.com/jurnea/LangGraph-Chinese/main/QuickStart.md

```
[{'url': 'https://medium.com/@cplog/introduction-to-langgraph-a-beginners-guide-14f9be027141',
  'content': 'Nodes: Nodes are the building blocks of your LangGraph. Each node represents a function or a computation step. You define nodes to perform specific tasks, such as processing input, making ...'},
 {'url': 'https://saksheepatil05.medium.com/demystifying-langgraph-a-beginner-friendly-dive-into-langgraph-concepts-5ffe890ddac0',
  'content': 'Nodes (Tasks): Nodes are like the workstations on the assembly line. Each node performs a specific task on the product. In LangGraph, nodes are Python functions that take the current state, do some work, and return an updated state. Next, we define the nodes, each representing a task in our sandwich-making process.'}]
```

## Initialize ToolManager and Create React Agent in LangGraph

https://raw.githubusercontent.com/ArcadeAI/arcade-ai/main/contrib/langchain/README.md

```
import os

from langchain_arcade import ToolManager
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agen
```
