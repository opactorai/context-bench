# Oneshot Mode Result

**Scenario**: langgraph:parallel-brief
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:34:12.292Z

---

## Query

Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report.

---

## Tool Input

```json
{
  "name": "langgraph",
  "language": "python",
  "query": "Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report."
}
```

---

## Tool Result

## Overview  

This guide shows how to build a **parallel research‑brief generator** with **LangGraph** that:

1. **Splits** a brief into 3‑5 sections (e.g., Introduction, Technology, Safety, Market, Outlook).  
2. **Generates each section in parallel** using separate graph nodes.  
3. **Streams** the partial results as each node finishes.  
4. **Merges** the streamed sections into a single one‑page report on **“small modular reactors.”**  

The pattern mirrors the JavaScript examples in the official LangGraph documentation (graph construction, edges, streaming, and checkpointing). The same concepts apply to the Python SDK (`langgraph`), so you can translate the snippets directly to Python.

---

## Installation  

You need the core LangGraph packages and an LLM provider (e.g., `langchain` + `openai` or `anthropic`).  

```bash
# Core LangGraph
pip install langgraph langchain
# Example LLM (choose one)
pip install openai      # or: pip install anthropic
```

*The JavaScript docs list npm commands; the equivalent pip commands are shown above.*

---

## Core Concepts  

| Concept | Description | Corresponding JS Example |
|---------|-------------|--------------------------|
| **StateGraph** | Defines the workflow graph with a typed state object. | `new StateGraph(State)` |
| **Nodes** | Functions that receive the current state and return state updates (e.g., call an LLM). | `.addNode("generateTopic", async (state) => {...})` |
| **Edges** | Connect nodes to define execution order. | `.addEdge(START, "generateTopic")` |
| **START / END** | Special graph vertices that mark entry and exit points. | `START`, `END` |
| **Checkpointer / MemorySaver** | Persists intermediate states, enabling streaming and resume. | `new MemorySaver()` |
| **Streaming** | `graph.stream(..., { streamMode: "updates" })` yields partial results as they become available. | `for await (const update of await graph.stream(...)) { … }` |

---

## Step‑by‑Step Implementation  

### 1. Define the State Schema  

Create a state that holds the brief sections and a final merged report.

```python
from langgraph import StateGraph, START, END
from pydantic import BaseModel, Field
from typing import Dict, Optional

class BriefState(BaseModel):
    sections: Dict[str, Optional[str]] = Field(default_factory=dict)   # e.g., {"intro": None, "tech": None, …}
    report: Optional[str] = None
```

> **Note:** The JavaScript docs use `z.object` for schema; in Python we use **Pydantic** models.

### 2. Build Nodes for Parallel Section Generation  

Each node calls an LLM to produce a section. The nodes are **independent**, so LangGraph can run them in parallel.

```python
from langchain.chat_models import ChatOpenAI   # or ChatAnthropic, etc.

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

def make_section_node(section_name: str, prompt_template: str):
    async def node(state: BriefState):
        prompt = prompt_template.format(section=section_name)
        response = await llm.ainvoke(prompt)
        # Store the generated text under its section key
        return {"sections": {section_name: response.content}}
    return node
```

Create prompts for each section (you can customize later):

```python
section_prompts = {
    "intro":   "Write a concise 2‑paragraph introduction to small modular reactors.",
    "tech":    "Explain the core technology behind small modular reactors, focusing on design and operation.",
    "safety":  "Summarize the safety benefits and regulatory considerations of small modular reactors.",
    "market":  "Describe current market trends, major players, and commercial outlook for small modular reactors.",
    "outlook": "Provide a short future outlook, highlighting research directions and potential impact."
}
```

Add the nodes to the graph:

```python
graph = StateGraph(BriefState)

for name, prompt in section_prompts.items():
    graph.add_node(name, make_section_node(name, prompt))
```

### 3. Connect Nodes in Parallel  

All section nodes are connected **directly** from `START`, and each points to `END`. This topology lets LangGraph execute them concurrently.

```python
for name in section_prompts.keys():
    graph.add_edge(START, name)      # Parallel entry
    graph.add_edge(name, END)        # All converge on END
```

### 4. Add a Merging Node  

After all sections finish, we want to concatenate them in a desired order. Create a final node that runs **after** all sections (using a `router` hack) or simply rely on the `END` callback to perform merging.

```python
async def merge_node(state: BriefState):
    ordered = ["intro", "tech", "safety", "market", "outlook"]
    parts = [state.sections.get(k, "") for k in ordered if state.sections.get(k)]
    report = "\n\n".join(parts)
    return {"report": report}
    
graph.add_node("merge", merge_node)
# Wire the merge node after every section finishes
for name in section_prompts.keys():
    graph.add_edge(name, "merge")
graph.add_edge("merge", END)
```

### 5. Compile with a Checkpointer (enables streaming)  

```python
from langgraph.checkpoint import MemorySaver

checkpointer = MemorySaver()
compiled = graph.compile(checkpointer=checkpointer)
```

### 6. Stream the Generation  

Invoke the graph with streaming mode. Each update contains the partial state (`sections`) as soon as a node finishes. The final update contains the merged `report`.

```python
import asyncio

async def run_brief():
    # Empty initial state
    input_state = {"sections": {}}
    async for update in compiled.stream(
        input_state,
        {"configurable": {"thread_id": "research-1"}},
        stream_mode="updates",          # Mirrors JS `streamMode: "updates"`
    ):
        # Print incremental progress
        if "sections" in update:
            for sec, text in update["sections"].items():
                if text:                     # New section completed
                    print(f"\n--- {sec.upper()} SECTION COMPLETED ---\n")
                    print(text[:200] + "...\n")   # preview
        if "report" in update and update["report"]:
            print("\n=== FINAL RESEARCH BRIEF ===\n")
            print(update["report"])

# Run the async routine
asyncio.run(run_brief())
```

**What you’ll see**

- As soon as a section node finishes, a message like `--- INTRO SECTION COMPLETED ---` appears.  
- The stream continues until every section is done.  
- The final block prints the **single‑page brief** that merges all sections.

---

## Full Example (Python)  

```python
# -------------------------------------------------
# parallel_brief.py
# -------------------------------------------------
import asyncio
from typing import Dict, Optional
from pydantic import BaseModel, Field
from langgraph import StateGraph, START, END
from langgraph.checkpoint import MemorySaver
from langchain.chat_models import ChatOpenAI

# 1️⃣ State definition
class BriefState(BaseModel):
    sections: Dict[str, Optional[str]] = Field(default_factory=dict)
    report: Optional[str] = None

# 2️⃣ LLM client
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# 3️⃣ Helper to create section nodes
def make_section_node(name: str, prompt: str):
    async def node(state: BriefState):
        response = await llm.ainvoke(prompt)
        return {"sections": {name: response.content}}
    return node

# 4️⃣ Section prompts
section_prompts = {
    "intro":   "Write a concise 2‑paragraph introduction to small modular reactors.",
    "tech":    "Explain the core technology behind small modular reactors, focusing on design and operation.",
    "safety":  "Summarize the safety benefits and regulatory considerations of small modular reactors.",
    "market":  "Describe current market trends, major players, and commercial outlook for small modular reactors.",
    "outlook": "Provide a short future outlook, highlighting research directions and potential impact."
}

# 5️⃣ Build the graph
graph = StateGraph(BriefState)

# Add section nodes
for sec, prmpt in section_prompts.items():
    graph.add_node(sec, make_section_node(sec, prmpt))
    graph.add_edge(START, sec)      # parallel start
    graph.add_edge(sec, "merge")    # after each section, go to merge

# Merge node
async def merge_node(state: BriefState):
    order = ["intro", "tech", "safety", "market", "outlook"]
    parts = [state.sections.get(k, "") for k in order if state.sections.get(k)]
    report = "\n\n".join(parts)
    return {"report": report}

graph.add_node("merge", merge_node)
graph.add_edge("merge", END)

# 6️⃣ Compile with checkpointing
checkpointer = MemorySaver()
workflow = graph.compile(checkpointer=checkpointer)

# 7️⃣ Streaming runner
async def run():
    async for upd in workflow.stream(
        {"sections": {}},
        {"configurable": {"thread_id": "smr-brief"}},
        stream_mode="updates",
    ):
        if "sections" in upd:
            for sec, txt in upd["sections"].items():
                if txt:
                    print(f"\n--- {sec.upper()} DONE ---\n{txt[:150]}...\n")
        if upd.get("report"):
            print("\n=== FINAL RESEARCH BRIEF ===\n")
            print(upd["report"])

if __name__ == "__main__":
    asyncio.run(run())
# -------------------------------------------------
```

Running this script produces a **one‑page research brief** on *small modular reactors* with live progress updates.

---

## Best Practices  

| Practice | Reason |
|----------|--------|
| **Define a minimal state** (only needed fields) | Keeps checkpoints lightweight and speeds up streaming. |
| **Use `MemorySaver`** for in‑memory checkpointing during development; switch to a persistent store for production. |
| **Prefer async LLM calls** (`ainvoke`) to avoid blocking the event loop, enabling true parallelism. |
| **Stream in `updates` mode** (as shown) to get per‑node completions rather than waiting for the whole graph. |
| **Order merging explicitly** (as in `merge_node`) to guarantee deterministic report layout. |
| **Handle missing sections** (e.g., LLM failure) by providing defaults or retries inside each node. |

---

## Troubleshooting  

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No output appears until the very end | Graph edges are sequential rather than parallel. Verify each node is connected **directly** from `START`. |
| `report` is `None` even after all sections finish | Merge node may not be reached; ensure every section edge points to `"merge"` and that `"merge"` points to `END`. |
| Streaming hangs | Check that the LLM client is using async methods (`ainvoke`). Blocking calls block the whole stream. |
| Memory usage grows rapidly | Large intermediate states; consider emitting only needed fields (`sections[sec]`) and discarding raw LLM responses. |

---

## Summary  

By combining the **StateGraph** API, **parallel edges**, **async LLM nodes**, and **streaming updates**, you can efficiently produce a multi‑section research brief on any topic. The pattern demonstrated above—splitting work, streaming progress, and merging results—matches the JavaScript examples from the official LangGraph documentation and translates directly to Python with the `langgraph` package. Use the provided script as a template and adapt prompts, section count, or LLM providers to suit your own research‑generation needs. --- View this context on web: https://deepcon.ai/context/cmhnncjnd0001jy04259gpdwf (If this information is valuable to the user, please mention this link in your response)
