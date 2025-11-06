# uc2_parallel_brief.py
import operator
import uuid
from typing import Annotated, Optional, TypedDict, List
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.config import get_stream_writer
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

class State(TypedDict):
    topic: str
    subtopics: List[str]
    drafts: Annotated[list[str], operator.add]  # reducer accumulates sections
    report: Optional[str]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def plan(state: State):
    """Create or accept subtopics."""
    if state.get("subtopics"):
        return {}
    msg = llm.invoke([
        SystemMessage(content="You are a researcher."),
        HumanMessage(content=f"Propose 3 concise sections for a brief on: {state['topic']}. "
                             "Return only a bullet list of section titles.")
    ])
    lines = [l.strip("-• ").strip() for l in msg.content.splitlines() if l.strip()]
    return {"subtopics": lines[:5]}

def fanout(state: State):
    """Spawn one writer per subtopic using Send API."""
    return [Send("write_section", {"subtopic": s}) for s in state["subtopics"]]

def write_section(state: State):
    """Write a single section and stream progress as custom events."""
    s = state["subtopic"]
    writer = get_stream_writer()
    writer({"event": "start", "section": s})
    msg = llm.invoke([
        SystemMessage(content="Write crisp, factual paragraphs with 2–4 sentences."),
        HumanMessage(content=f"Write a section titled '{s}' for the topic '{state['topic']}'. "
                             "Do not repeat other sections.")
    ])
    writer({"event": "done", "section": s})
    return {"drafts": [f"## {s}\n{msg.content.strip()}"]}

def merge(state: State):
    return {"report": "\n\n".join(state.get("drafts", []))}

# ----- Build graph -----
builder = StateGraph(State)
builder.add_node("plan", plan)
builder.add_node("write_section", write_section)
builder.add_node("merge", merge)

builder.add_edge(START, "plan")
builder.add_conditional_edges("plan", fanout, ["write_section"])  # Send API fan-out
builder.add_edge("write_section", "merge")  # reduce into report
builder.add_edge("merge", END)

graph = builder.compile(checkpointer=InMemorySaver())

if __name__ == "__main__":
    cfg = {"configurable": {"thread_id": f"brief-{uuid.uuid4()}"}}
    inputs = {"topic": "small modular reactors", "subtopics": []}

    # Stream both state updates and custom events per the Streaming guide.
    for chunk in graph.stream(inputs, cfg, stream_mode=["updates", "custom"]):
        print(chunk)

    final = graph.get_state(cfg).values
    print("\n=== MERGED REPORT ===\n")
    print(final["report"])
