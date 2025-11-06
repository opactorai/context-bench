# uc1_streaming_tools.py
import asyncio
from datetime import datetime
from agents import Agent, Runner, function_tool
import zoneinfo

@function_tool
def calc(expr: str) -> str:
    """Evaluate a simple arithmetic expression like '2*(3+4)'."""
    return str(eval(expr, {"__builtins__": {}}, {}))

@function_tool
def now_in_timezone(tz: str) -> str:
    """Return current date/time in the given IANA timezone, e.g., 'Asia/Seoul'."""
    return datetime.now(zoneinfo.ZoneInfo(tz)).isoformat(timespec="seconds")

async def main():
    agent = Agent(
        name="Planner",
        instructions=(
            "Use tools when needed. First get the current time for the user's timezone; "
            "then compute the requested arithmetic exactly; answer concisely."
        ),
        tools=[now_in_timezone, calc],
    )

    # Stream both raw token deltas and high-level run events.
    result = Runner.run_streamed(
        agent,
        input="Tell me the current time in America/Los_Angeles and then compute 137*42."
    )

    async for event in result.stream_events():
        if event.type == "raw_response_event":
            # Token deltas (see 'Streaming' docs)
            data = getattr(event, "data", None)
            delta = getattr(data, "delta", None)
            if delta:
                print(delta, end="", flush=True)
        elif event.type == "run_item_stream_event":
            if event.item.type == "tool_call_item":
                print("\n[tool_call] model decided to call a tool")
            elif event.item.type == "tool_call_output_item":
                print(f"\n[tool_output] {event.item.output}")
    print("\n--- done ---")

if __name__ == "__main__":
    asyncio.run(main())
