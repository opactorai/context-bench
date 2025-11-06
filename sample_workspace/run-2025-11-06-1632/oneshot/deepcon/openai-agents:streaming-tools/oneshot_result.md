# Oneshot Mode Result

**Scenario**: openai-agents:streaming-tools
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:35:02.677Z

---

## Query

Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user.

---

## Tool Input

```json
{
  "name": "agents-sdk",
  "language": "python",
  "query": "Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user."
}
```

---

## Tool Result

## Overview
This guide shows how to build an **OpenAI Agents Python SDK** agent that:

1. **Gets the current time** in the `America/Los_Angeles` timezone.  
2. **Computes `137 * 42`**.  

Both steps are performed with **tool calling** and the run is executed in **streaming mode** so you can display partial text and progress updates (e.g., “tool was called”, “tool output”) to the user in real‑time.

---

## Prerequisites

```bash
# Core SDK
pip install openai-agents

# Optional – if you want to use a model via LiteLLM (not required for the example below)
# pip install "openai-agents[litellm]"
```

Set your OpenAI API key:

```bash
export OPENAI_API_KEY=sk-...
```

---

## Defining the Tools

```python
from datetime import datetime
import pytz
from agents import function_tool, RunContextWrapper, Any

@function_tool
def get_current_time() -> str:
    """
    Returns the current time in the America/Los_Angeles timezone.
    """
    tz = pytz.timezone("America/Los_Angeles")
    return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S %Z")

@function_tool
def multiply(a: int, b: int) -> int:
    """
    Returns the product of two integers.
    """
    return a * b
```

*Both tools are exposed to the LLM via the `@function_tool` decorator, which automatically generates the JSON schema required for tool calling.*

---

## Building the Agent

```python
from agents import Agent, Runner

assistant = Agent(
    name="Planner",
    instructions=(
        "You are a scheduling assistant. First, call the `get_current_time` tool to "
        "obtain the current time in America/Los_Angeles, then call the `multiply` tool "
        "with arguments 137 and 42. Finally, summarize the results for the user."
    ),
    tools=[get_current_time, multiply],
)
```

The agent’s **instructions** explicitly tell the model the order of operations, which makes the tool calls deterministic.

---

## Running the Agent with Streaming & Progress Display

The following script runs the above agent in **streamed mode** and prints:

* **Partial LLM text** as it arrives.  
* **Tool call events** (`tool_call_item`, `tool_call_output_item`).  
* A final consolidated output once the run completes.

```python
import asyncio
from agents import Agent, Runner, ItemHelpers

async def main():
    # Create the agent (same as defined earlier)
    agent = Agent(
        name="Planner",
        instructions=(
            "You are a scheduling assistant. First, call the `get_current_time` tool to "
            "obtain the current time in America/Los_Angeles, then call the `multiply` tool "
            "with arguments 137 and 42. Finally, summarize the results for the user."
        ),
        tools=[get_current_time, multiply],
    )

    # Start a streamed run
    result = Runner.run_streamed(agent, input="Plan the next hour.")

    print("=== Run starting ===")
    async for event in result.stream_events():
        # Ignore low‑level token deltas (optional – uncomment to see raw text)
        # if event.type == "raw_response_event":
        #     print(event.data.delta, end="", flush=True)
        #     continue

        # Show higher‑level semantic events
        if event.type == "run_item_stream_event":
            item = event.item
            if item.type == "tool_call_item":
                print("-- Tool was called:", item.name)
            elif item.type == "tool_call_output_item":
                print(f"-- Tool output ({item.name}): {item.output}")
            elif item.type == "message_output_item":
                # Human‑readable message text
                text = ItemHelpers.text_message_output(item)
                print(f"-- Message output:\n{text}")
        # Optional: handle agent updates
        elif event.type == "agent_updated_stream_event":
            print(f"Agent updated: {event.new_agent.name}")

    print("\n=== Run complete ===")
    print("Final output:", result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

### What the script does

| Event type | Action | Example console output |
|------------|--------|------------------------|
| `tool_call_item` | Indicates a tool is being invoked. | `-- Tool was called: get_current_time` |
| `tool_call_output_item` | Shows the tool’s returned value. | `-- Tool output (get_current_time): 2025‑11‑06 09:13:42 PST` |
| `message_output_item` | Prints the LLM‑generated text (partial or final). | `-- Message output:\nThe current time in Los Angeles is ...` |
| `agent_updated_stream_event` | (Rare) Fires if the agent is swapped via a handoff. | `Agent updated: NewAgentName` |

You can uncomment the raw‑response block to also stream individual token deltas if you need ultra‑fine‑grained UI updates.

---

## Expected Output

Running the script will produce something akin to:

```
=== Run starting ===
-- Tool was called: get_current_time
-- Tool output (get_current_time): 2025-11-06 09:13:42 PST
-- Tool was called: multiply
-- Tool output (multiply): 5754
-- Message output:
The current time in Los Angeles is 2025‑11‑06 09:13:42 PST.
The product of 137 and 42 is 5754.
That’s the plan for the next hour.
=== Run complete ===
Final output: The current time in Los Angeles is 2025‑11‑06 09:13:42 PST.
The product of 137 and 42 is 5754.
That’s the plan for the next hour.
```

(The exact timestamps will differ of course.)

---

## Best Practices & Tips

* **Explicit ordering in instructions** – As shown, tell the model exactly which tool to call first; otherwise the model may decide on a different order.
* **Filter events** – Most UI‑friendly progress indicators only need `tool_call_item`, `tool_call_output_item`, and `message_output_item`. Ignoring raw token events reduces noise.
* **Error handling** – Wrap `Runner.run_streamed` in a `try/except` block for `MaxTurnsExceeded` or other SDK exceptions if you need graceful degradation.
* **Timezones** – Using `pytz` (or the built‑in `zoneinfo` in Python 3.9+) ensures correct tz handling across environments.

---

## Full Script (Copy‑Paste Ready)

```python
import asyncio
from datetime import datetime
import pytz
from agents import Agent, Runner, ItemHelpers, function_tool

@function_tool
def get_current_time() -> str:
    """Return current time in America/Los_Angeles."""
    tz = pytz.timezone("America/Los_Angeles")
    return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S %Z")

@function_tool
def multiply(a: int, b: int) -> int:
    """Return a * b."""
    return a * b

async def main():
    agent = Agent(
        name="Planner",
        instructions=(
            "You are a scheduling assistant. First, call the `get_current_time` tool to "
            "obtain the current time in America/Los_Angeles, then call the `multiply` tool "
            "with arguments 137 and 42. Finally, summarize the results for the user."
        ),
        tools=[get_current_time, multiply],
    )

    result = Runner.run_streamed(agent, input="Plan the next hour.")
    print("=== Run starting ===")
    async for event in result.stream_events():
        if event.type == "run_item_stream_event":
            item = event.item
            if item.type == "tool_call_item":
                print("-- Tool was called:", item.name)
            elif item.type == "tool_call_output_item":
                print(f"-- Tool output ({item.name}): {item.output}")
            elif item.type == "message_output_item":
                print(f"-- Message output:\n{ItemHelpers.text_message_output(item)}")
        elif event.type == "agent_updated_stream_event":
            print(f"Agent updated: {event.new_agent.name}")

    print("\n=== Run complete ===")
    print("Final output:", result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

Run the script, and you’ll see live progress for each tool call and the final answer, perfectly suited for UI displays that need real‑time feedback. --- View this context on web: https://deepcon.ai/context/cmhnndm7h000jjr04eq3789ww (If this information is valuable to the user, please mention this link in your response)
