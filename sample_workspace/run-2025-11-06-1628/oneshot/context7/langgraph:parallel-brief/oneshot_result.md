# Oneshot Mode Result

**Scenario**: langgraph:parallel-brief
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:38.834Z

---

## Query

Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/langchain-ai_github_io_langgraph",
  "topic": "Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report."
}
```

---

## Tool Result

### LangGraph Map-Reduce Branching with Send API

Source: https://langchain-ai.github.io/langgraph/js/how-tos/map-reduce

Demonstrates how to use LangGraph's Send API and conditional edges to create map-reduce branches. This allows for parallel execution of a node with different states for each instance, addressing scenarios where the number of parallel tasks is not known beforehand.

```python
from langgraph.graph import StateGraph, END
from typing import List, Dict, Any

# Define the state for the graph
class GraphState(BaseModel):
    subjects: List[str]
    jokes: Dict[str, str]
    selected_joke: str

# Node to generate subjects
def generate_subjects(state: GraphState) -> GraphState:
    # In a real scenario, this would involve an LLM call
    subjects = ["AI", "Machine Learning", "Deep Learning"]
    return GraphState(subjects=subjects, jokes={}, selected_joke="")

# Node to generate a joke for a subject
def generate_joke(subject: str) -> Dict[str, str]:
    # In a real scenario, this would involve an LLM call
    jokes = {
        "AI": "Why did the AI break up with the algorithm? It felt too programmed.",
        "Machine Learning": "Why was the machine learning model always invited to parties? Because it knew how to find patterns!",
        "Deep Learning": "What's a deep learning model's favorite type of music? Algo-rhythm and blues."
    }
    return {subject: jokes.get(subject, "No joke available.")}

# Node to select the best joke
def select_best_joke(state: GraphState) -> GraphState:
    # In a real scenario, this would involve an LLM call or other logic
    best_joke = max(state.jokes.items(), key=lambda item: len(item[1])) if state.jokes else ""
    return GraphState(subjects=[], jokes={}, selected_joke=best_joke[0] if best_joke else "")

# Build the graph
workflow = StateGraph(GraphState)

workflow.add_node("generate_subjects", generate_subjects)
workflow.add_node("generate_joke_parallel", lambda state: {
    "jokes": {subject: generate_joke(subject)[subject] for subject in state['subjects']}
})
workflow.add_node("select_best_joke", select_best_joke)

workflow.set_entry_point("generate_subjects")

# Conditional edge to handle parallel joke generation
# This is a conceptual representation; actual implementation might use Send API more directly
workflow.add_edge("generate_subjects", "generate_joke_parallel")
workflow.add_edge("generate_joke_parallel", "select_best_joke")
workflow.add_edge("select_best_joke", END)

# To implement the dynamic branching with Send API, you would typically:
# 1. Have a node that produces a list of items (e.g., subjects).
# 2. Use a conditional edge with a mapping function that uses `send` to dispatch each item
#    to a parallel instance of the joke generation node.
# 3. Collect the results from these parallel branches.

# Example of how Send might be conceptually used (requires specific LangGraph features):
# from langgraph.graph.message import add_messages
# workflow.add_node("generate_joke_node", generate_joke_node_function)
# workflow.add_edge(
#     "generate_subjects",
#     lambda state: [(subject, subject) for subject in state['subjects']], # Map subjects to states
#     to="generate_joke_node",
#     # This part is conceptual and depends on how Send is integrated
#     # with conditional edges for parallel dispatch.
# )

# app = workflow.compile()

# Example usage (conceptual):
# initial_state = GraphState(subjects=[], jokes={}, selected_joke="")
# result = app.invoke(initial_state)
# print(result)

```

--------------------------------

### Visualize Graph with Mermaid (JavaScript)

Source: https://langchain-ai.github.io/langgraph/js/how-tos/branching

This snippet visualizes the compiled LangGraph using Mermaid. It retrieves the graph representation, draws it as a PNG image, and then displays the image using `tslab.display.png`. This requires the `tslab` library.

```javascript
import * as tslab from "tslab";

const representation2 = graph2.getGraph();
const image2 = await representation2.drawMermaidPng();
const arrayBuffer2 = await image2.arrayBuffer();

await tslab.display.png(new Uint8Array(arrayBuffer2));

```

--------------------------------

### Create Parallel Branches with Fan-out and Fan-in in LangGraph.js

Source: https://langchain-ai.github.io/langgraph/js/how-tos/branching

Demonstrates creating a LangGraph with parallel execution paths (fan-out) and merging them back (fan-in). It defines nodes (a, b, c, d) and uses a StateGraph with an Annotation for state aggregation, allowing parallel processing and combining results.

```javascript
import{END,START,StateGraph,Annotation}from"@langchain/langgraph";

constStateAnnotation=Annotation.Root({
aggregate:Annotation<string[]>({
reducer:(x,y)=>x.concat(y),
})
});

// Create the graph
constnodeA=(state:typeofStateAnnotation.State)=>{
console.log(`Adding I'm A to ${state.aggregate}`);
return{aggregate:[`I'm A`]};
};
constnodeB=(state:typeofStateAnnotation.State)=>{
console.log(`Adding I'm B to ${state.aggregate}`);
return{aggregate:[`I'm B`]};
};
constnodeC=(state:typeofStateAnnotation.State)=>{
console.log(`Adding I'm C to ${state.aggregate}`);
return{aggregate:[`I'm C`]};
};
constnodeD=(state:typeofStateAnnotation.State)=>{
console.log(`Adding I'm D to ${state.aggregate}`);
return{aggregate:[`I'm D`]};
};

constbuilder=newStateGraph(StateAnnotation)
.addNode("a",nodeA)
.addEdge(START,"a")
.addNode("b",nodeB)
.addNode("c",nodeC)
.addNode("d",nodeD)
.addEdge("a","b")
.addEdge("a","c")
.addEdge("b","d")
.addEdge("c","d")
.addEdge("d",END);

constgraph=builder.compile();

```

--------------------------------

### Parallel Node Execution with State Reducers in LangGraph

Source: https://langchain-ai.github.io/langgraph/how-tos/branching

This Python code defines a LangGraph with nodes that execute in parallel. It uses the `operator.add` reducer to accumulate values in the 'aggregate' state field, demonstrating how parallel branches combine their outputs. The graph structure fans out from 'a' to 'b' and 'c', then fans in to 'd'.

```Python
import operator
from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    # The operator.add reducer fn makes this append-only
    aggregate: Annotated[list, operator.add]

def a(state: State):
    print(f'Adding "A" to {state["aggregate"]}')
    return {"aggregate": ["A"]}

def b(state: State):
    print(f'Adding "B" to {state["aggregate"]}')
    return {"aggregate": ["B"]}

def c(state: State):
    print(f'Adding "C" to {state["aggregate"]}')
    return {"aggregate": ["C"]}

def d(state: State):
    print(f'Adding "D" to {state["aggregate"]}')
    return {"aggregate": ["D"]}

builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)
builder.add_node(c)
builder.add_node(d)
builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)
graph = builder.compile()
```

--------------------------------

### Parallel Node Execution with State Reducers in LangGraph

Source: https://langchain-ai.github.io/langgraph/how-tos/map-reduce

This Python code defines a LangGraph with nodes that execute in parallel. It uses the `operator.add` reducer to accumulate values in the 'aggregate' state field, demonstrating how parallel branches combine their outputs. The graph structure fans out from 'a' to 'b' and 'c', then fans in to 'd'.

```Python
import operator
from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    # The operator.add reducer fn makes this append-only
    aggregate: Annotated[list, operator.add]

def a(state: State):
    print(f'Adding "A" to {state["aggregate"]}')
    return {"aggregate": ["A"]}

def b(state: State):
    print(f'Adding "B" to {state["aggregate"]}')
    return {"aggregate": ["B"]}

def c(state: State):
    print(f'Adding "C" to {state["aggregate"]}')
    return {"aggregate": ["C"]}

def d(state: State):
    print(f'Adding "D" to {state["aggregate"]}')
    return {"aggregate": ["D"]}

builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)
builder.add_node(c)
builder.add_node(d)
builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)
graph = builder.compile()
```

--------------------------------

### LangGraph Parallel Workflow with Graph API

Source: https://langchain-ai.github.io/langgraph/js/tutorials/workflows

Demonstrates building a parallel workflow using LangGraph's Graph API in TypeScript. It defines a state with annotations for topic and generated content (joke, story, poem), creates nodes for LLM calls and aggregation, and sets up edges for parallel execution and final aggregation. The example invokes the workflow with a 'cats' topic and logs the combined output.

```typescript
import{StateGraph,Annotation}from"@langchain/langgraph";

// Graph state
constStateAnnotation=Annotation.Root({
topic:Annotation<string>,
joke:Annotation<string>,
story:Annotation<string>,
poem:Annotation<string>,
combinedOutput:Annotation<string>,
});

// Nodes
// First LLM call to generate initial joke
asyncfunctioncallLlm1(state:typeofStateAnnotation.State){
constmsg=awaitllm.invoke(`Write a joke about ${state.topic}`);
return{joke:msg.content};
}

// Second LLM call to generate story
asyncfunctioncallLlm2(state:typeofStateAnnotation.State){
constmsg=awaitllm.invoke(`Write a story about ${state.topic}`);
return{story:msg.content};
}

// Third LLM call to generate poem
asyncfunctioncallLlm3(state:typeofStateAnnotation.State){
constmsg=awaitllm.invoke(`Write a poem about ${state.topic}`);
return{poem:msg.content};
}

// Combine the joke, story and poem into a single output
asyncfunctionaggregator(state:typeofStateAnnotation.State){
constcombined=`Here's a story, joke, and poem about ${state.topic}!\n\n`+
`STORY:\n${state.story}\n\n`+
`JOKE:\n${state.joke}\n\n`+
`POEM:\n${state.poem}`;
return{combinedOutput:combined};
}

// Build workflow
constparallelWorkflow=newStateGraph(StateAnnotation)
.addNode("callLlm1",callLlm1)
.addNode("callLlm2",callLlm2)
.addNode("callLlm3",callLlm3)
.addNode("aggregator",aggregator)
.addEdge("__start__","callLlm1")
.addEdge("__start__","callLlm2")
.addEdge("__start__","callLlm3")
.addEdge("callLlm1","aggregator")
.addEdge("callLlm2","aggregator")
.addEdge("callLlm3","aggregator")
.addEdge("aggregator","__end__")
.compile();

// Invoke
constresult=awaitparallelWorkflow.invoke({topic:"cats"});
console.log(result.combinedOutput);

```

--------------------------------

### Parallel Node Execution with State Reducers in LangGraph

Source: https://langchain-ai.github.io/langgraph/how-tos/recursion-limit

This Python code defines a LangGraph with nodes that execute in parallel. It uses the `operator.add` reducer to accumulate values in the 'aggregate' state field, demonstrating how parallel branches combine their outputs. The graph structure fans out from 'a' to 'b' and 'c', then fans in to 'd'.

```Python
import operator
from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

class State(TypedDict):
    # The operator.add reducer fn makes this append-only
    aggregate: Annotated[list, operator.add]

def a(state: State):
    print(f'Adding "A" to {state["aggregate"]}')
    return {"aggregate": ["A"]}

def b(state: State):
    print(f'Adding "B" to {state["aggregate"]}')
    return {"aggregate": ["B"]}

def c(state: State):
    print(f'Adding "C" to {state["aggregate"]}')
    return {"aggregate": ["C"]}

def d(state: State):
    print(f'Adding "D" to {state["aggregate"]}')
    return {"aggregate": ["D"]}

builder = StateGraph(State)
builder.add_node(a)
builder.add_node(b)
builder.add_node(c)
builder.add_node(d)
builder.add_edge(START, "a")
builder.add_edge("a", "b")
builder.add_edge("a", "c")
builder.add_edge("b", "d")
builder.add_edge("c", "d")
builder.add_edge("d", END)
graph = builder.compile()
```

--------------------------------

### Visualize and Run LangGraph.js Graph

Source: https://langchain-ai.github.io/langgraph/js/how-tos/map-reduce

Visualizes the compiled LangGraph.js graph as a Mermaid PNG image and streams the execution of the graph with a given topic ('animals'). The output of each step in the graph execution is logged to the console.

```javascript
import * as tslab from "tslab";

const representation = app.getGraph();
const image = await representation.drawMermaidPng();
const arrayBuffer = await image.arrayBuffer();

tslab.display.png(new Uint8Array(arrayBuffer));

// Call the graph: here we call it to generate a list of jokes
for await (const s of app.stream({ topic: "animals" })) {
  console.log(s);
}
```

--------------------------------

### Stream Graph Execution with LangGraph

Source: https://langchain-ai.github.io/langgraph/reference/graphs

Demonstrates how to stream graph execution steps using the `stream()` method in LangGraph. This method allows for various configurations to control the output and behavior during execution, including different streaming modes and interruption points.

```python
stream(
    input: InputT | Command | None,
    config: RunnableConfig | None = None,
    *, 
    context: ContextT | None = None,
    stream_mode: (
        StreamMode | Sequence[StreamMode] | None
    ) = None,
    print_mode: StreamMode | Sequence[StreamMode] = (),
    output_keys: str | Sequence[str] | None = None,
    interrupt_before: All | Sequence[str] | None = None,
    interrupt_after: All | Sequence[str] | None = None,
    durability: Durability | None = None,
    subgraphs: bool = False,
    debug: bool | None = None,
    **kwargs: Unpack[DeprecatedKwargs]
) -> Iterator[dict[str, Any] | Any]:
    """Stream graph steps for a single input.

    Parameters:
    ----------
    input : InputT | Command | None
        The input to the graph.
    config : RunnableConfig | None, optional
        The configuration to use for the run., by default None
    context : ContextT | None, optional
        The static context to use for the run. Added in version 0.6.0., by default None
    stream_mode : StreamMode | Sequence[StreamMode] | None, optional
        The mode to stream output, defaults to `self.stream_mode`. Options are:
          * "values": Emit all values in the state after each step, including interrupts. When used with functional API, values are emitted once at the end of the workflow.
          * "updates": Emit only the node or task names and updates returned by the nodes or tasks after each step. If multiple updates are made in the same step (e.g. multiple nodes are run) then those updates are emitted separately.
          * "custom": Emit custom data from inside nodes or tasks using `StreamWriter`.
          * "messages": Emit LLM messages token-by-token together with metadata for any LLM invocations inside nodes or tasks. Will be emitted as 2-tuples `(LLM token, metadata)`.
          * "checkpoints": Emit an event when a checkpoint is created, in the same format as returned by get_state().
          * "tasks": Emit events when tasks start and finish, including their results and errors.

        You can pass a list as the `stream_mode` parameter to stream multiple modes at once. The streamed outputs will be tuples of `(mode, data)`. See LangGraph streaming guide for more details., by default None
    print_mode : StreamMode | Sequence[StreamMode], optional
        Accepts the same values as `stream_mode`, but only prints the output to the console, for debugging purposes. Does not affect the output of the graph in any way., by default ()
    output_keys : str | Sequence[str] | None, optional
        The keys to stream, defaults to all non-context channels., by default None
    interrupt_before : All | Sequence[str] | None, optional
        Nodes to interrupt before, defaults to all nodes in the graph., by default None
    interrupt_after : All | Sequence[str] | None, optional
        Nodes to interrupt after, defaults to all nodes in the graph., by default None
    durability : Durability | None, optional
        The durability mode for the graph execution, defaults to "async". Options are:
          - "sync": Changes are persisted synchronously before the next step starts.
          - "async": Changes are persisted asynchronously while the next step executes.
          - "exit": Changes are persisted only when the graph exits., by default None
    subgraphs : bool, optional
        Whether to stream events from inside subgraphs, defaults to False. If True, the events will be emitted as tuples `(namespace, data)`, or `(namespace, mode, data)` if `stream_mode` is a list, where `namespace` is a tuple with the path to the node where a subgraph is invoked, e.g. `("parent_node:<task_id>", "child_node:<task_id>")`. See LangGraph streaming guide for more details., by default False
    debug : bool | None, optional
        , by default None

    Yields:
    -------
    Iterator[dict[str, Any] | Any]
        The output of each step in the graph. The output shape depends on the stream_mode.
    """
    pass
```

--------------------------------

### Stream LangGraph Execution

Source: https://langchain-ai.github.io/langgraph/how-tos/map-reduce

Demonstrates how to stream the execution of a LangGraph, printing each step. This is useful for debugging and understanding the flow of the graph.

```Python
# Call the graph: here we call it to generate a list of jokes
for step in graph.stream({"topic": "animals"}):
    print(step)

```

--------------------------------

### Visualize LangGraph.js Graph with Mermaid

Source: https://langchain-ai.github.io/langgraph/js/how-tos/branching

Generates and displays a visual representation of the LangGraph.js graph using Mermaid. It retrieves the graph's structure, converts it to a Mermaid PNG, and displays it using tslab.

```javascript
import*astslabfrom"tslab";

constrepresentation=graph.getGraph();
constimage=awaitrepresentation.drawMermaidPng();
constarrayBuffer=awaitimage.arrayBuffer();

awaittslab.display.png(newUint8Array(arrayBuffer));

```

--------------------------------

### Stream LangGraph Execution

Source: https://langchain-ai.github.io/langgraph/how-tos/branching

Demonstrates how to stream the execution of a LangGraph, printing each step. This is useful for debugging and understanding the flow of the graph.

```Python
# Call the graph: here we call it to generate a list of jokes
for step in graph.stream({"topic": "animals"}):
    print(step)

```

--------------------------------

### Stream Work to the Research Graph

Source: https://langchain-ai.github.io/langgraph/tutorials/multi_agent/hierarchical_agent_teams

Streams a user query to the compiled research graph and prints the output from each step of the execution. This demonstrates how the team processes the request, showing the supervisor's decisions and the results from the search and web scraper nodes.

```python
for s in research_graph.stream(
    {"messages": [("user", "when is Taylor Swift's next tour?")]},
    {"recursion_limit": 100},
):
    print(s)
    print("---")

```

--------------------------------

### LangGraph Parallel Workflow with Functional API

Source: https://langchain-ai.github.io/langgraph/js/tutorials/workflows

Illustrates parallel execution using LangGraph's Functional API in JavaScript. It defines tasks for generating a joke, story, and poem, and an aggregator task to combine the outputs. The workflow is built using an entrypoint that concurrently invokes the generation tasks and then the aggregator. The example streams the workflow execution for a 'cats' topic.

```javascript
import{task,entrypoint}from"@langchain/langgraph";

// Tasks

// First LLM call to generate initial joke
constcallLlm1=task("generateJoke",async(topic:string)=>{
constmsg=awaitllm.invoke(`Write a joke about ${topic}`);
returnmsg.content;
});

// Second LLM call to generate story
constcallLlm2=task("generateStory",async(topic:string)=>{
constmsg=awaitllm.invoke(`Write a story about ${topic}`);
returnmsg.content;
});

// Third LLM call to generate poem
constcallLlm3=task("generatePoem",async(topic:string)=>{
constmsg=awaitllm.invoke(`Write a poem about ${topic}`);
returnmsg.content;
});

// Combine outputs
constaggregator=task("aggregator",async(params:{
topic:string;
joke:string;
story:string;
poem:string;
})=>{
const{topic,joke,story,poem}=params;
return`Here's a story, joke, and poem about ${topic}!\n\n`+
`STORY:\n${story}\n\n`+
`JOKE:\n${joke}\n\n`+
`POEM:\n${poem}`;
});

// Build workflow
constworkflow=entrypoint(
"parallelWorkflow",
async(topic:string)=>{
const[joke,story,poem]=awaitPromise.all([
callLlm1(topic),
callLlm2(topic),
callLlm3(topic),
]);

returnaggregator({topic,joke,story,poem});
}
);

// Invoke
conststream=awaitworkflow.stream("cats",{
streamMode:"updates",
});

forawait(conststepofstream){
console.log(step);
}

```
