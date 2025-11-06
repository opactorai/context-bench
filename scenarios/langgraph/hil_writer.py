# uc1_hil_writer.py
import uuid
from typing import Optional, TypedDict
from typing_extensions import NotRequired
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import Command, interrupt
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

# ----- State schema -----
class State(TypedDict):
    topic: str
    requirements: str
    draft: NotRequired[str]
    approved: NotRequired[bool]
    feedback: NotRequired[str]
    path: NotRequired[str]

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

def draft_node(state: State):
    msg = llm.invoke([
        SystemMessage(content="You write concise, production-ready Markdown."),
        HumanMessage(content=(
            f"Write an 8–12 sentence README about: {state['topic']}.\n"
            f"Must follow: {state['requirements']}"
        )),
    ])
    return {"draft": msg.content}

def approval_node(state: State):
    # Pause and surface the draft for human review.
    decision = interrupt({
        "action": "review_draft",
        "prompt": "Approve the draft? If not, provide change requests.",
        "draft_preview": (state.get("draft") or "")[:1200],
    })
    # Accept either a bool or a dict {"approve": bool, "feedback": "..."}
    if isinstance(decision, bool):
        return {"approved": decision}
    return {
        "approved": bool(decision.get("approve")),
        "feedback": decision.get("feedback", ""),
    }

def rewrite_node(state: State):
    msg = llm.invoke([
        SystemMessage(content="You are a careful technical editor."),
        HumanMessage(content=(
            "Revise the markdown to address the request.\n\n"
            f"Feedback:\n{state.get('feedback','')}\n\n"
            f"Draft:\n{state.get('draft','')}"
        )),
    ])
    return {"draft": msg.content, "feedback": ""}

def save_node(state: State):
    path = "output.md"
    with open(path, "w", encoding="utf-8") as f:
        f.write(state.get("draft", ""))
    return {"path": path}

# ----- Build graph -----
builder = StateGraph(State)
builder.add_node("draft", draft_node)
builder.add_node("approval", approval_node)
builder.add_node("rewrite", rewrite_node)
builder.add_node("save", save_node)

builder.add_edge(START, "draft")
builder.add_edge("draft", "approval")

def route_after_approval(state: State):
    return "save" if state.get("approved") else "rewrite"

builder.add_conditional_edges("approval", route_after_approval, {"save": "save", "rewrite": "rewrite"})
builder.add_edge("rewrite", "approval")
builder.add_edge("save", END)

graph = builder.compile(checkpointer=InMemorySaver())

if __name__ == "__main__":
    thread_id = f"readme-{uuid.uuid4()}"
    config = {"configurable": {"thread_id": thread_id}}

    # 1) First call: draft + interrupt surface
    first = graph.invoke(
        {"topic": "LangGraph-powered agents", "requirements": "Include setup, features, and a runnable example."},
        config
    )
    print("INTERRUPT PAYLOAD:", first["__interrupt__"])

    # 2) Later, resume with either:
    # graph.invoke(Command(resume=True), config)  # approve
    # graph.invoke(Command(resume={"approve": False, "feedback": "Add a security section."}), config)

    # 3) Optional: time-travel example
    # history = list(graph.get_state_history(config))  # inspect checkpoints
    # new_cfg = graph.update_state(history[1].config, values={"requirements": "Emphasize security & testing."})
    # graph.invoke(None, new_cfg)  # resume from prior checkpoint
