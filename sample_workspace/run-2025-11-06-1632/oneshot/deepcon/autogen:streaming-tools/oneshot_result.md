# Oneshot Mode Result

**Scenario**: autogen:streaming-tools
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:32:48.459Z

---

## Query

Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable.

---

## Tool Input

```json
{
  "name": "autogen",
  "language": "python",
  "query": "Using the Autogen Python library, build an agent with tool calling and streaming capabilities. Plan a 30-second 'market brief' for EUR→KRW travelers. Call a weather tool for Seoul and a simple FX tool for USD/KRW, then summarize key takeaways in 4 bullets. Stream your answer as you work; if the tool output is terse, reflect to make it readable."
}
```

---

## Tool Result

## Overview
This guide shows how to create an **Autogen** `AssistantAgent` that  

1. **Streams** its response token‑by‑token.  
2. **Calls external tools** (a weather lookup and a simple FX lookup).  
3. **Reflects** on terse tool outputs to turn them into readable text.  
4. Produces a 30‑second “market brief” for travelers moving from **EUR → KRW**, ending with **four bullet‑point take‑aways**.

The solution is built entirely from the Autogen examples you provided, stitching together:

| Feature | Source Example |
|---|---|
| Basic `AssistantAgent` setup | *Basic AssistantAgent Example* |
| Streaming responses (`model_client_stream=True`) | *AssistantAgent Streaming Example* |
| Tool calling (single & multiple tools) | *AssistantAgent with a Simple Tool* & *AssistantAgent with Multiple Tool Iterations* |
| Reflection on tool use (`reflect_on_tool_use=True`) | *AssistantAgent with Multiple Tool Iterations* |
| Max tool iterations | *AssistantAgent with Multiple Tool Iterations* |

---

## Installation

```bash
pip install "autogen-ext[openai]"
```

> The OpenAI extra provides `OpenAIChatCompletionClient`, which supports both **function calling** and **streaming**.

---

## Step‑by‑Step Implementation

### 1. Define the two tools

```python
# Weather tool – returns a short string.
async def get_seoul_weather(location: str = "Seoul") -> str:
    # In a real deployment this would call a weather API.
    return f"The weather in {location} is sunny, 22 °C with light breezes."

# Simple FX tool – returns a terse rate string.
async def get_usd_krw_rate() -> str:
    # In a real deployment this would query an FX API.
    return "USD/KRW = 1,340.50"
```

*Both functions are **async** so they can be awaited by the Autogen runtime.*  

### 2. Create the streaming `AssistantAgent`

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console

# ----------------------------------------------------------------------
# 1️⃣  Model client – gpt‑4o (supports function calling & streaming)
# ----------------------------------------------------------------------
model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key = "your_openai_api_key"   # ← uncomment & set if needed
)

# ----------------------------------------------------------------------
# 2️⃣  Agent configuration
# ----------------------------------------------------------------------
assistant = AssistantAgent(
    name="market_brief_agent",
    model_client=model_client,
    # Enable token streaming
    model_client_stream=True,
    # Register the two tools
    tools=[get_seoul_weather, get_usd_krw_rate],
    # Allow up to 3 tool calls (weather + FX + optional reflection)
    max_tool_iterations=3,
    # After the tool calls finish, ask the model to *reflect* and format the result.
    reflect_on_tool_use=True,
    # Optional system instruction to keep the output short (≈30 s)
    system_message=(
        "You are a concise travel‑assistant. "
        "Create a 30‑second market brief for EUR→KRW travelers, "
        "including the current Seoul weather and the latest USD/KRW rate. "
        "End with exactly four bullet‑point take‑aways."
    ),
)

# ----------------------------------------------------------------------
# 3️⃣  Run the agent with streaming UI
# ----------------------------------------------------------------------
async def run_brief() -> None:
    # The user task that triggers the workflow.
    task = "Prepare a 30‑second market brief for EUR→KRW travelers."

    # `run_stream` yields ModelClientStreamingChunkEvent objects.
    stream = assistant.run_stream(task=task)

    # The Console UI prints each chunk as it arrives.
    await Console(stream)

asyncio.run(run_brief())
```

#### What the code does

| Step | Explanation |
|---|---|
| **Model client** | Instantiates `OpenAIChatCompletionClient` with `gpt‑4o`. |
| **`model_client_stream=True`** | Enables token‑level streaming. |
| **`tools=[...]`** | Registers the two async functions; Autogen automatically wraps them as `FunctionTool`s. |
| **`max_tool_iterations=3`** | Allows the agent to call each tool once and then perform a final reflective call. |
| **`reflect_on_tool_use=True`** | After the tool calls, the LLM receives a “reflection” request, which is where we turn terse tool outputs (e.g., `"USD/KRW = 1,340.50"`) into human‑readable prose. |
| **`system_message`** | Guides the model to keep the brief short and to output exactly four bullets. |
| **`Console(stream)`** | Streams the assistant’s answer to the terminal in real time. |

---

## Expected Streaming Interaction (Illustrative)

Below is a **simulated** transcript of what you’ll see while the agent runs. The actual token stream will appear chunk‑by‑chunk, but the logical flow is:

1. **Model** asks to invoke the weather tool.  
2. **Tool** returns *“The weather in Seoul is sunny, 22 °C with light breezes.”*  
3. **Model** asks to invoke the FX tool.  
4. **Tool** returns *“USD/KRW = 1,340.50”* (terse).  
5. **Reflection** step expands the FX output to a readable sentence.  
6. **Model** assembles the final brief and prints the four bullet points.

```
[Assistant] Preparing a 30‑second market brief for EUR→KRW travelers...
[Assistant] → calling tool: get_seoul_weather()
[Tool] The weather in Seoul is sunny, 22 °C with light breezes.
[Assistant] → calling tool: get_usd_krw_rate()
[Tool] USD/KRW = 1,340.50
[Assistant] (reflecting on tool use...)
[Assistant] The current USD/KRW exchange rate stands at 1,340.50 KRW per USD.
[Assistant] Final brief:
- Seoul enjoys sunny weather at 22 °C, making outdoor activities pleasant.
- The KRW is trading around 1,340.5 per USD, indicating a modestly strong won.
- EUR → KRW conversions: 1 EUR ≈ 1,430 KRW (approx., based on latest FX).
- Travelers should lock in rates now and carry a light jacket for cooler evenings.
```

> **Note:** The exact numbers will depend on the live APIs you hook up to the placeholder tools.

---

## Best Practices

| Topic | Recommendation |
|---|---|
| **Tool Design** | Keep each tool *focused* (single responsibility). Return a **plain string**; the reflection step will expand it if needed. |
| **Streaming UI** | Use `autogen_agentchat.ui.Console` for quick experiments. For custom front‑ends, iterate over `run_stream` and process `ModelClientStreamingChunkEvent` objects. |
| **Reflection** | Set `reflect_on_tool_use=True` whenever a tool may produce terse or raw data. The LLM produces a natural‑language reinterpretation before the final answer. |
| **Iteration Limits** | `max_tool_iterations` should be at least the number of expected tool calls + 1 (for reflection). |
| **Prompt Engineering** | Use a concise `system_message` to bound the response length and bullet‑point count. |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| No tool calls are made | `tools` list empty or functions not async | Ensure `tools=[get_seoul_weather, get_usd_krw_rate]` and both are defined with `async def`. |
| Streaming stalls | `model_client_stream=False` or using `run` instead of `run_stream` | Set `model_client_stream=True` and call `assistant.run_stream(...)`. |
| Output is a single raw string (e.g., `"USD/KRW = 1,340.50"` only) | `reflect_on_tool_use=False` | Enable `reflect_on_tool_use=True` so the model rewrites terse results. |
| Too many bullets or overly long brief | System prompt not restrictive | Tighten `system_message` wording to explicitly require “exactly four bullet points”. |

---

## Complete Example (Copy‑Paste)

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.ui import Console

# ----------------------------------------------------------------------
# Tools
# ----------------------------------------------------------------------
async def get_seoul_weather(location: str = "Seoul") -> str:
    # Replace with a real API call if desired.
    return f"The weather in {location} is sunny, 22 °C with light breezes."

async def get_usd_krw_rate() -> str:
    # Replace with a real FX API call if desired.
    return "USD/KRW = 1,340.50"

# ----------------------------------------------------------------------
# Model & Agent
# ----------------------------------------------------------------------
model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key = "YOUR_OPENAI_API_KEY"
)

assistant = AssistantAgent(
    name="market_brief_agent",
    model_client=model_client,
    model_client_stream=True,
    tools=[get_seoul_weather, get_usd_krw_rate],
    max_tool_iterations=3,
    reflect_on_tool_use=True,
    system_message=(
        "You are a concise travel‑assistant. "
        "Create a 30‑second market brief for EUR→KRW travelers, "
        "including the current Seoul weather and the latest USD/KRW rate. "
        "End with exactly four bullet‑point take‑aways."
    ),
)

# ----------------------------------------------------------------------
# Run with streaming output
# ----------------------------------------------------------------------
async def main() -> None:
    task = "Prepare a 30‑second market brief for EUR→KRW travelers."
    stream = assistant.run_stream(task=task)
    await Console(stream)

asyncio.run(main())
```

Run the script, and you’ll see a **live‑streaming** market brief that calls the two tools, reflects on terse outputs, and finishes with four clear bullet‑point take‑aways—exactly what you asked for. --- View this context on web: https://deepcon.ai/context/cmhnnap410005jr04kcuna6mv (If this information is valuable to the user, please mention this link in your response)
