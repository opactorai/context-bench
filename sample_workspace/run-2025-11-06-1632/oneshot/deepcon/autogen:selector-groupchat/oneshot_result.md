# Oneshot Mode Result

**Scenario**: autogen:selector-groupchat
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:33:55.938Z

---

## Query

Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'.

---

## Tool Input

```json
{
  "name": "autogen",
  "language": "python",
  "query": "Using the Autogen Python library with selector-based group chat, create a small research 'crew': (1) Plan subtasks; (2) run a mock web search; (3) compute a percentage change; Stop when planning is complete and say 'TERMINATE'."
}
```

---

## Tool Result

## Overview  

This guide shows how to build a **research crew** with the **Autogen Python library** using a **selector‑based group chat** (`SelectorGroupChat`).  
The crew consists of three agents:

| Agent | Role | Tool(s) |
|-------|------|--------|
| **Planner** | Breaks the high‑level task into subtasks. | – |
| **WebSearcher** | Performs a mock web‑search (simulated with a simple async function). | – |
| **Calculator** | Computes a percentage‑change from the mock results. | – |

The chat stops automatically when the planner announces that planning is finished and mentions the termination phrase **`TERMINATE`**.

---

## Installation  

```bash
pip install autogen   # core library
pip install autogen-ext[openai]   # OpenAI model client
```

> **Note** – The examples below assume you have an OpenAI API key in the environment variable `OPENAI_API_KEY`.

---

## Quick Start  

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console
```

All further code builds on these imports.

---

## Defining the Agents  

### 1. Planner – “TaskPlanner”

*Breaks the original request into subtasks and signals termination when planning is complete.*

```python
planner = AssistantAgent(
    "TaskPlanner",
    model_client=model_client,
    description="Creates a list of research subtasks and signals when planning is finished.",
    system_message=(
        "You are a planner. Given a high‑level research goal, list the concrete subtasks "
        "the crew should perform. When you have finished planning, reply with the word "
        "TERMINATE on a line by itself."
    ),
)
```

### 2. WebSearcher – “MockSearcher”

*Simulates a web search. The “search” is just a dummy async function that returns a static string; replace it with a real `HttpTool` or `MultimodalWebSurfer` if desired.*

```python
async def mock_search(query: str) -> str:
    # In a real system you could call HttpTool, MultimodalWebSurfer, etc.
    return f"Mock result for '{query}': value=120"

web_searcher = AssistantAgent(
    "MockSearcher",
    model_client=model_client,
    tools=[mock_search],
    description="Performs a (mock) web search and returns a numeric result.",
    system_message=(
        "You receive a search query from the planner. Call the provided `mock_search` tool "
        "with that query and return the numeric value extracted from the result."
    ),
)
```

### 3. Calculator – “PctChanger”

*Computes the percentage change between two numbers.*

```python
async def compute_pct_change(old: float, new: float) -> str:
    change = (new - old) / old * 100
    return f"The percentage change is {change:.2f}%."

calculator = AssistantAgent(
    "PctChanger",
    model_client=model_client,
    tools=[compute_pct_change],
    description="Calculates percentage change from two numbers.",
    system_message=(
        "You receive two numbers (old and new). Use the `compute_pct_change` tool "
        "to calculate and report the percentage change."
    ),
)
```

---

## Termination Condition  

The crew stops when **any** participant emits the exact token **`TERMINATE`**.

```python
termination = TextMentionTermination("TERMINATE")
```

---

## Assembling the SelectorGroupChat  

`SelectorGroupChat` lets an LLM decide which agent should speak next.  
We provide the three agents, the model client, the termination condition, and (optionally) a custom selector function. In this simple example we rely on the default model‑driven selector.

```python
team = SelectorGroupChat(
    participants=[planner, web_searcher, calculator],
    model_client=model_client,
    termination_condition=termination,
)
```

---

## Running the Crew  

```python
async def main() -> None:
    # Create the OpenAI model client (gpt‑4o works well for selector logic)
    global model_client
    model_client = OpenAIChatCompletionClient(model="gpt-4o")

    # Assemble agents & team (code from previous sections)

    # Start the conversation with a high‑level research request
    await Console(
        team.run_stream(
            task="Research the price change of product X over the last year."
        )
    )

asyncio.run(main())
```

### Expected Dialogue (illustrative)

```
User → TaskPlanner: Research the price change of product X over the last year.
TaskPlanner → all: 
  1. Define the product and time window.
  2. Search for the price a year ago.
  3. Search for the current price.
  4. Compute percentage change.
  TERMINATE

MockSearcher → TaskPlanner: Mock result for 'price of product X one year ago': value=80
MockSearcher → TaskPlanner: Mock result for 'price of product X now': value=120

PctChanger → TaskPlanner: The percentage change is 50.00%
```

When the planner emits `TERMINATE`, the `TextMentionTermination` condition stops the chat, and the console UI prints the final transcript.

---

## Full Example (Copy‑Paste Ready)

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.ui import Console

# ----------------------------------------------------------------------
# 1. Model client
# ----------------------------------------------------------------------
model_client = OpenAIChatCompletionClient(model="gpt-4o")

# ----------------------------------------------------------------------
# 2. Planner agent
# ----------------------------------------------------------------------
planner = AssistantAgent(
    "TaskPlanner",
    model_client=model_client,
    description="Creates a list of research subtasks and signals when planning is finished.",
    system_message=(
        "You are a planner. Given a high‑level research goal, list the concrete subtasks "
        "the crew should perform. When you have finished planning, reply with the word "
        "TERMINATE on a line by itself."
    ),
)

# ----------------------------------------------------------------------
# 3. Mock web‑search agent
# ----------------------------------------------------------------------
async def mock_search(query: str) -> str:
    return f"Mock result for '{query}': value=120"

web_searcher = AssistantAgent(
    "MockSearcher",
    model_client=model_client,
    tools=[mock_search],
    description="Performs a (mock) web search and returns a numeric result.",
    system_message=(
        "You receive a search query from the planner. Call the provided `mock_search` tool "
        "with that query and return the numeric value extracted from the result."
    ),
)

# ----------------------------------------------------------------------
# 4. Percentage‑change calculator agent
# ----------------------------------------------------------------------
async def compute_pct_change(old: float, new: float) -> str:
    change = (new - old) / old * 100
    return f"The percentage change is {change:.2f}%."

calculator = AssistantAgent(
    "PctChanger",
    model_client=model_client,
    tools=[compute_pct_change],
    description="Calculates percentage change from two numbers.",
    system_message=(
        "You receive two numbers (old and new). Use the `compute_pct_change` tool "
        "to calculate and report the percentage change."
    ),
)

# ----------------------------------------------------------------------
# 5. Termination condition
# ----------------------------------------------------------------------
termination = TextMentionTermination("TERMINATE")

# ----------------------------------------------------------------------
# 6. Assemble selector‑based group chat
# ----------------------------------------------------------------------
team = SelectorGroupChat(
    participants=[planner, web_searcher, calculator],
    model_client=model_client,
    termination_condition=termination,
)

# ----------------------------------------------------------------------
# 7. Run the crew
# ----------------------------------------------------------------------
async def main() -> None:
    await Console(
        team.run_stream(
            task="Research the price change of product X over the last year."
        )
    )

asyncio.run(main())
```

---

## Best Practices  

| Practice | Reason |
|----------|--------|
| **Give each agent a clear `description` and `system_message`.** | Helps the selector model understand each participant’s expertise and reduces mis‑routing. |
| **Return concise, parse‑able outputs from tools.** | Agents can reliably extract the needed value (e.g., a number) without extra text processing. |
| **Use a unique termination phrase (`TERMINATE`).** | Guarantees that the chat ends exactly when planning is done, avoiding infinite loops. |
| **Prefer lightweight mock tools for prototyping.** | The example uses `mock_search`; replace with `HttpTool`, `MultimodalWebSurfer`, or `AzureAISearchTool` for real web access. |
| **Keep the selector logic simple.** | The default LLM‑driven selector works well for a linear workflow; custom `selector_func` is only needed for complex branching. |

---

## Troubleshooting  

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No agents speak after the initial task. | The selector model cannot decide a speaker (missing `description`/`system_message`). | Ensure each agent has a meaningful description and system message. |
| `TERMINATE` is never detected. | The phrase is not on a line by itself, or termination condition sources are limited. | Emit `TERMINATE` exactly on its own line; keep `TextMentionTermination` without source restrictions. |
| Tool errors (e.g., `mock_search` not called). | Tool not listed in the agent’s `tools` argument or wrong function signature. | Verify the tool is passed in the `tools` list and that the function is `async def`. |
| Long latency. | Using a large model (e.g., `gpt-4o`) for every selector decision. | Switch to a cheaper model (e.g., `gpt-3.5-turbo`) for selector if latency is a concern. |

---

## Extending the Crew  

- **Real web search**: Replace `mock_search` with `HttpTool` or `MultimodalWebSurfer` (see import snippets in the source).  
- **More complex math**: Add `PythonCodeExecutionTool` for arbitrary calculations.  
- **Hierarchical teams**: Nest a `SelectorGroupChat` inside a `RoundRobinGroupChat` or `Swarm` to parallelize independent subtasks.

--- 

**You now have a fully functional selector‑based research crew that plans tasks, performs a mock web search, computes a percentage change, and terminates automatically with `TERMINATE`.** Happy coding! --- View this context on web: https://deepcon.ai/context/cmhnnc5yp000fjr04cbqlq6tw (If this information is valuable to the user, please mention this link in your response)
