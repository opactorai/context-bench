# uc3_two_agent_subgraphs.py
from typing import Optional, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# Shared state across parent + subgraphs
class DocState(TypedDict):
    topic: str
    outline: Optional[str]
    draft: Optional[str]
    final: Optional[str]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# ----- Writer subgraph -----
def plan_outline(state: DocState):
    msg = llm.invoke([
        SystemMessage(content="You are a technical content planner."),
        HumanMessage(content=f"Create a 3–4 point outline for: {state['topic']}.")
    ])
    return {"outline": msg.content.strip()}

def write_draft(state: DocState):
    msg = llm.invoke([
        SystemMessage(content="You are a clear technical writer."),
        HumanMessage(content=f"Write a ~400-word post using this outline:\n{state['outline']}\nTopic: {state['topic']}")
    ])
    return {"draft": msg.content.strip()}

writer_builder = StateGraph(DocState)
writer_builder.add_node("plan_outline", plan_outline)
writer_builder.add_node("write_draft", write_draft)
writer_builder.add_edge(START, "plan_outline")
writer_builder.add_edge("plan_outline", "write_draft")
writer_subgraph = writer_builder.compile()

# ----- Editor subgraph -----
def edit_pass(state: DocState):
    msg = llm.invoke([
        SystemMessage(content="You are a meticulous editor (improve clarity, flow; keep facts)."),
        HumanMessage(content=f"Improve the following draft without changing meaning:\n{state['draft']}")
    ])
    return {"final": msg.content.strip()}

editor_builder = StateGraph(DocState)
editor_builder.add_node("edit_pass", edit_pass)
editor_builder.add_edge(START, "edit_pass")
editor_subgraph = editor_builder.compile()

# ----- Parent orchestration -----
def route(state: DocState):
    if not state.get("draft"):
        return "writer"
    if not state.get("final"):
        return "editor"
    return END  # done

parent = StateGraph(DocState)
parent.add_node("writer", writer_subgraph)  # subgraph as a node
parent.add_node("editor", editor_subgraph)  # subgraph as a node
parent.add_conditional_edges(START, route, {"writer": "writer", "editor": "editor", END: END})
parent.add_conditional_edges("writer", route, {"writer": "writer", "editor": "editor", END: END})
parent.add_conditional_edges("editor", route, {"writer": "writer", "editor": "editor", END: END})

graph = parent.compile(checkpointer=InMemorySaver())

if __name__ == "__main__":
    cfg = {"configurable": {"thread_id": "two-agent-demo"}}
    out = graph.invoke({"topic": "edge AI on factory floors", "outline": None, "draft": None, "final": None}, cfg)
    print("\n=== FINAL POST ===\n")
    print(out["final"])
