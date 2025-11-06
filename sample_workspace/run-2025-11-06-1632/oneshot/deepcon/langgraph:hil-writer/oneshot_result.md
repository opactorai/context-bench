# Oneshot Mode Result

**Scenario**: langgraph:hil-writer
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:34:01.440Z

---

## Query

Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint.

---

## Tool Input

```json
{
  "name": "langgraph",
  "language": "python",
  "query": "Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint."
}
```

---

## Tool Result

## LangGraph‑Powered Agents  
*Human‑in‑the‑Loop workflows with interrupts, persistence, checkpoints, approvals, revisions, and rewind*

---  

### Overview
LangGraph lets you compose **stateful, resumable graphs** of LLM calls and tool invocations.  
Key features for a human‑in‑the‑loop (HITL) writer:

| Feature | What it gives you | How LangGraph supports it |
|---------|-------------------|---------------------------|
| **Interrupts / Approval steps** | Pause execution, let a human review or edit before continuing. | Define a node that returns a special interrupt signal (e.g., `{"approval_needed": True}`) and let the UI or API surface it. |
| **Persistence** | Store the full execution state so you can resume later or across processes. | Compile the graph with a **checkpointer** (e.g., `MemorySaver`). |
| **Checkpoints** | Snapshots of state at each node – useful for “time‑travel” debugging. | The checkpointer automatically saves a checkpoint after each node. |
| **Revisions** | After a human edits the output, feed the revised text back into the graph. | Use the stored checkpoint, replace the relevant field, and invoke the remaining nodes. |
| **Rewind / Fork** | Jump back to any earlier checkpoint and explore alternative branches. | Retrieve a checkpoint via `graph.get_state(thread_id=…)`, modify the state, and resume execution. |

---  

## Installation  

```bash
# Python >= 3.11 required
pip install --upgrade "langgraph-cli[inmem]"
```

*Optional*: Install additional LangChain packages (e.g., `langchain`, `langchain-openai`) if you need a specific LLM or tools.

---  

## Quick Start: Human‑in‑the‑Loop Writer  

Below is a minimal, **Python‑only** example that demonstrates:

1. **Generating a draft** (LLM node)  
2. **Interrupting for human approval** (approval node)  
3. **Persisting state** (memory saver)  
4. **Rewinding / revising**  

```python title="writer.py"
import os
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint import MemorySaver
from langchain.schema import StrOutputParser
from langchain_openai import ChatOpenAI
import zod  # placeholder for schema, actual use can be pydantic or zod via langgraph

# ---------- 1. Define the state schema ----------
State = {
    "draft": str | None,
    "approved": bool,
    "final": str | None,
}

# ---------- 2. LLM that writes a draft ----------
def write_draft(state):
    model = ChatOpenAI(model="gpt-4o", temperature=0.7)
    prompt = "Write a short README for a Python package called `awesome-lib`."
    response = model.invoke(prompt)
    return {"draft": response.content, "approved": False}

# ---------- 3. Human‑approval interrupt ----------
def wait_for_approval(state):
    # In a real UI you would surface `state["draft"]` and wait for a user action.
    # Here we simulate an interrupt by returning a special key.
    return {"approval_needed": True}

# ---------- 4. Apply human revision ----------
def apply_revision(state, revision: str):
    # The human supplies a revised version of the draft.
    return {"draft": revision, "approved": True}

# ---------- 5. Finalize (e.g., add a TL;DR) ----------
def finalize(state):
    model = ChatOpenAI(model="gpt-4o")
    prompt = f"Take the following draft and add a TL;DR section:\n\n{state['draft']}"
    response = model.invoke(prompt)
    return {"final": response.content}

# ---------- 6. Build the graph ----------
workflow = StateGraph(State) \
    .add_node("write_draft", write_draft) \
    .add_node("approval", wait_for_approval) \
    .add_node("finalize", finalize) \
    .add_edge(START, "write_draft") \
    .add_edge("write_draft", "approval") \
    .add_edge("approval", END)   # Execution stops here awaiting human input

# ---------- 7. Compile with persistence ----------
checkpointer = MemorySaver()          # in‑memory checkpoint store
graph = workflow.compile(checkpointer=checkpointer)

# ---------- 8. Run the workflow ----------
thread_id = "writer-1"
config = {"configurable": {"thread_id": thread_id}}

# First run: generate draft and hit the approval interrupt
for update in graph.stream({"draft": None, "approved": False, "final": None},
                          config):
    print(update)   # will include `approval_needed=True`

# ----- Human step (outside of graph) -----
# Retrieve the latest checkpoint, edit the draft, then resume.
state = graph.get_state(thread_id=thread_id).values
print("\n--- Draft before human edit ---")
print(state["draft"])

# Simulate human editing
human_revision = state["draft"] + "\n\n*Added a short description by the author.*"

# Apply the revision and continue from the approval node
graph.update_state(thread_id, {"draft": human_revision, "approved": True})
for update in graph.stream({"draft": human_revision, "approved": True, "final": None},
                          config, start_at="finalize"):
    print(update)   # final README appears
```

**What the script does**

1. **Compiles** a graph with a `MemorySaver` checkpointer → every node’s output is stored.
2. **Executes** up to the `approval` node, then pauses (interrupt). The UI or CLI can display `state["draft"]` for review.
3. **Human revises** the draft, updates the stored state, and resumes execution at the `finalize` node.
4. **Rewind / Fork** – you can call `graph.get_state(thread_id)` at any time, modify the state, and start from any node, enabling “what‑if” explorations.

---  

## Building a Full HITL Writer with Rewind UI  

LangGraph’s **Studio** and **Agent Chat UI** provide ready‑made front‑ends for the pattern above.

1. **Start a local server**  

```bash
langgraph dev
```

2. **Open Studio** (http://localhost:5173) – you’ll see:

* **State inspection** – view the checkpoint after each node.  
* **Time‑travel debugging** – click any checkpoint to fork a new thread.  
* **Human‑in‑the‑loop panel** – approve or edit the draft directly in the UI.  

3. **Connect a custom UI** (optional)  

If you prefer a bespoke front‑end, invoke the graph with a `thread_id` and `user_id` (for per‑user memory namespaces) as shown in the JavaScript snippets of the docs. The same pattern works in Python via `graph.stream` and passing a `configurable` dict.

---  

## Best Practices  

| Topic | Recommendation |
|-------|----------------|
| **Schema definition** | Use a strict schema (pydantic, zod, or plain dict) for the graph state to avoid missing fields. |
| **Interrupt design** | Return a clearly‑named flag (`approval_needed`, `interrupt`) so UI can detect when to pause. |
| **Persistence backend** | `MemorySaver` is fine for prototyping. For production, swap in a durable store (e.g., Redis, Postgres) via LangGraph’s `BaseStore` interface. |
| **Thread & user scoping** | Include both `thread_id` (conversation) and `user_id` (identity) in the `configurable` dict to isolate memory per user. |
| **Versioning** | Keep the graph definition immutable; when you change the workflow, bump a version identifier and store it alongside checkpoints. |
| **Testing** | Use `graph.compile(...).invoke` for unit tests and `graph.stream` for integration tests that simulate interrupts. |

---  

## Common Patterns  

1. **Approval Loop** – Node returns `{ "approval_needed": True }`. UI captures it, lets the user edit, then calls `graph.update_state` and resumes.  
2. **Branching Revision** – After approval, you may branch to a “rewrite” node that calls the LLM again with the human edits.  
3. **Fork & Compare** – Retrieve an earlier checkpoint, modify a parameter (e.g., temperature), and run a parallel thread to compare outputs.  

---  

## Troubleshooting  

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No checkpoint saved after a node | Checkpointer not passed to `compile`. | Ensure `graph = workflow.compile(checkpointer=MemorySaver())`. |
| UI never shows approval step | Node returns a flag that UI doesn’t recognize. | Return a consistent key like `"approval_needed": True` and confirm UI looks for it. |
| Rewind fails with `KeyError` | Wrong `thread_id` or missing checkpoint. | Verify you’re using the same `thread_id` used when the checkpoint was created; list checkpoints via `graph.list_states(thread_id)`. |
| State fields missing after resume | State schema mismatch between runs. | Keep the schema definition unchanged across revisions or provide default values. |

---  

### Next Steps  

* **Persist to a durable store** – replace `MemorySaver` with `SqliteStore` or a custom `BaseStore`.  
* **Add tool integrations** – e.g., a `publish_github` tool that runs after final approval.  
* **Deploy** – run `langgraph serve` behind a FastAPI/Starlette endpoint and connect the Agent Chat UI for remote users.  

---  

## References (from LangGraph docs)

* **Workflow example with jokes** – shows graph building, edges, and checkpointing.  
* **Studio UI** – demonstrates state inspection, time‑travel debugging, and HITL support.  
* **Agent Chat UI** – pre‑built UI for real‑time HITL interactions.  
* **CLI (`langgraph dev`)** – quick way to spin up a local server and open Studio.  

---  

*This README provides a concise, runnable foundation for a human‑in‑the‑loop writer built with LangGraph. Adjust the LLM model, prompts, and storage layer to fit your production needs.* --- View this context on web: https://deepcon.ai/context/cmhnncabr000hjr049nese1h9 (If this information is valuable to the user, please mention this link in your response)
