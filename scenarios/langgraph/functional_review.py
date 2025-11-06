# uc4_functional_review.py
import uuid
from typing import Dict
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task
from langgraph.types import interrupt, Command
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
checkpointer = InMemorySaver()

@task
def compose_from_bullets(bullets: str) -> str:
    msg = llm.invoke([
        SystemMessage(content="You are a concise technical writer."),
        HumanMessage(content=f"Write ~200 words summarizing:\n{bullets}")
    ])
    return msg.content

@task
def apply_edits(draft: str, edits: str) -> str:
    msg = llm.invoke([
        SystemMessage(content="You are an assistant that applies edits faithfully."),
        HumanMessage(content=f"Revise the draft with these edits:\n{edits}\n\nDraft:\n{draft}")
    ])
    return msg.content

@entrypoint(checkpointer=checkpointer)
def workflow(inputs: Dict[str, str]) -> Dict[str, str]:
    """Compose, then interrupt for review; finalize with optional edits."""
    draft = compose_from_bullets(inputs["bullets"]).result()
    approved_or_edits = interrupt({
        "action": "approve_or_edit",
        "prompt": "Approve the draft? If not, include change requests text.",
        "draft": draft[:1200]
    })
    if approved_or_edits is True:
        return {"final": draft, "approved": True}
    elif approved_or_edits is False:
        return {"final": draft, "approved": False, "note": "No edits provided"}
    else:
        # Treat any non-bool value as edit text
        final = apply_edits(draft, str(approved_or_edits)).result()
        return {"final": final, "approved": True}

if __name__ == "__main__":
    thread_id = f"doc-{uuid.uuid4()}"
    cfg = {"configurable": {"thread_id": thread_id}}

    # 1) First run: compose + interrupt
    for item in workflow.stream({"bullets": "- scope A\n- scope B\n- benefits\n"}, cfg):
        print(item)  # will include "__interrupt__" per Functional API docs

    # 2) Resume with your decision (True/False or edit text)
    # for item in workflow.stream(Command(resume=True), cfg):           # approve
    # for item in workflow.stream(Command(resume="Tighten the intro"), cfg):  # provide edits
