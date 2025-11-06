# Oneshot Mode Result

**Scenario**: openai-agents:sessions-context
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:30:52.398Z

---

## Query

Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "openai-agents",
  "semantic_queries": [
    "Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'"
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: openai-agents (py_pi)
**Queries:**
- Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'

**Version:** 0.4.2

**Found 2 relevant code sections**

## Result 1
**File:** `examples/memory/sqlalchemy_session_example.py`
**SHA256:** `0d8cef62d4c73a17dd9438d357512dfb4b6f27770b57681d377b6d8a0d85063e`
**Lines:** 1-78
**Language:** Python
```
import asyncio

from agents import Agent, Runner
from agents.extensions.memory.sqlalchemy_session import SQLAlchemySession


async def main():
    # Create an agent
    agent = Agent(
        name="Assistant",
        instructions="Reply very concisely.",
    )

    # Create a session instance with a session ID.
    # This example uses an in-memory SQLite database.
    # The `create_tables=True` flag is useful for development and testing.
    session = SQLAlchemySession.from_url(
        "conversation_123",
        url="sqlite+aiosqlite:///:memory:",
        create_tables=True,
    )

    print("=== Session Example ===")
    print("The agent will remember previous messages automatically.\n")

    # First turn
    print("First turn:")
    print("User: What city is the Golden Gate Bridge in?")
    result = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session,
    )
    print(f"Assistant: {result.final_output}")
    print()

    # Second turn - the agent will remember the previous conversation
    print("Second turn:")
    print("User: What state is it in?")
    result = await Runner.run(agent, "What state is it in?", session=session)
    print(f"Assistant: {result.final_output}")
    print()

    # Third turn - continuing the conversation
    print("Third turn:")
    print("User: What's the population of that state?")
    result = await Runner.run(
        agent,
        "What's the population of that state?",
        session=session,
    )
    print(f"Assistant: {result.final_output}")
    print()

    print("=== Conversation Complete ===")
    print("Notice how the agent remembered the context from previous turns!")
    print("Sessions automatically handles conversation history.")

    # Demonstrate the limit parameter - get only the latest 2 items
    print("\n=== Latest Items Demo ===")
    latest_items = await session.get_items(limit=2)
    print("Latest 2 items:")
    for i, msg in enumerate(latest_items, 1):
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        print(f"  {i}. {role}: {content}")

    print(f"\nFetched {len(latest_items)} out of total conversation history.")

    # Get all items to show the difference
    all_items = await session.get_items()
    print(f"Total items in session: {len(all_items)}")


if __name__ == "__main__":
    # To run this example, you need to install the sqlalchemy extras:
    # pip install "agents[sqlalchemy]"
    asyncio.run(main())

```

## Result 2
**File:** `examples/memory/sqlite_session_example.py`
**SHA256:** `382fc1259ff915c10e97507c1c2abbd778de254f993e4fa1c3df16826043d613`
**Lines:** 1-77
**Language:** Python
```
"""
Example demonstrating session memory functionality.

This example shows how to use session memory to maintain conversation history
across multiple agent runs without manually handling .to_input_list().
"""

import asyncio

from agents import Agent, Runner, SQLiteSession


async def main():
    # Create an agent
    agent = Agent(
        name="Assistant",
        instructions="Reply very concisely.",
    )

    # Create a session instance that will persist across runs
    session_id = "conversation_123"
    session = SQLiteSession(session_id)

    print("=== Session Example ===")
    print("The agent will remember previous messages automatically.\n")

    # First turn
    print("First turn:")
    print("User: What city is the Golden Gate Bridge in?")
    result = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session,
    )
    print(f"Assistant: {result.final_output}")
    print()

    # Second turn - the agent will remember the previous conversation
    print("Second turn:")
    print("User: What state is it in?")
    result = await Runner.run(agent, "What state is it in?", session=session)
    print(f"Assistant: {result.final_output}")
    print()

    # Third turn - continuing the conversation
    print("Third turn:")
    print("User: What's the population of that state?")
    result = await Runner.run(
        agent,
        "What's the population of that state?",
        session=session,
    )
    print(f"Assistant: {result.final_output}")
    print()

    print("=== Conversation Complete ===")
    print("Notice how the agent remembered the context from previous turns!")
    print("Sessions automatically handles conversation history.")

    # Demonstrate the limit parameter - get only the latest 2 items
    print("\n=== Latest Items Demo ===")
    latest_items = await session.get_items(limit=2)
    print("Latest 2 items:")
    for i, msg in enumerate(latest_items, 1):
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        print(f"  {i}. {role}: {content}")

    print(f"\nFetched {len(latest_items)} out of total conversation history.")

    # Get all items to show the difference
    all_items = await session.get_items()
    print(f"Total items in session: {len(all_items)}")


if __name__ == "__main__":
    asyncio.run(main())

```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
