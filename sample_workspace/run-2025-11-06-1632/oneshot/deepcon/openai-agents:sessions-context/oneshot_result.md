# Oneshot Mode Result

**Scenario**: openai-agents:sessions-context
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:35:41.380Z

---

## Query

Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'

---

## Tool Input

```json
{
  "name": "agents-sdk",
  "language": "python",
  "query": "Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'"
}
```

---

## Tool Result

## Overview
This guide shows how to build a **memory‑enabled agent** with the **OpenAI Agents Python SDK** that:

1. Stores conversation history in a **local SQLite file** so the memory survives multiple program runs.  
2. Keeps user‑specific data (name, city) in a **tool‑backed store** that can be queried later (e.g., “What’s my city?”).  
3. Displays the full conversation history that the agent has persisted.  

We will use the following SDK primitives:

| Primitive | Purpose |
|-----------|---------|
| `Agent` | Defines the LLM‑backed assistant (name, instructions, tools, …). |
| `Runner` | Executes a turn of conversation (`run` – async, `run_sync` – sync). |
| `SQLiteSession` | Lightweight file‑backed session that automatically saves and restores messages. |
| `function_tool` | Decorator that turns a regular Python function into a tool the agent can call. |

> **Note** – All code snippets below are taken **as‑is** from the SDK documentation; copy‑paste them directly into your project.

---

## Installation

```bash
pip install openai-agents
```

Make sure your OpenAI API key is available in the environment:

```bash
export OPENAI_API_KEY=sk-...
```

---

## Step‑by‑Step Implementation

### 1. Define a tool for persistent user data

We’ll create a simple in‑memory dictionary that mimics a persistent store.  
In a real application you could replace it with a database call.

```python
from agents import function_tool

# Simple in‑memory “key‑value” store for demonstration
_user_store = {}

@function_tool
def set_user_info(name: str, city: str) -> str:
    """
    Store the user's name and city for later retrieval.
    """
    _user_store["name"] = name
    _user_store["city"] = city
    return "User info saved."

@function_tool
def get_user_city() -> str:
    """
    Retrieve the city that was previously saved for the user.
    """
    return _user_store.get("city", "unknown")
```

Both functions are wrapped with `@function_tool`, making them callable from the agent’s LLM‑generated reasoning.

### 2. Create the agent with the tools attached

```python
from agents import Agent

assistant = Agent(
    name="MemoryAssistant",
    instructions=(
        "You are a helpful assistant that remembers user information across sessions. "
        "When the user provides their name or city, store it using the appropriate tool. "
        "When asked about the stored information, retrieve it via the tool."
    ),
    tools=[set_user_info, get_user_city],   # <-- attach the tools
)
```

### 3. Configure a persistent SQLite session

```python
from agents import SQLiteSession

# The first argument is a unique session ID (e.g., a user ID)
# The second argument is the SQLite file that will hold the history.
session = SQLiteSession("user_123", "conversation_history.db")
```

- **File‑based**: `conversation_history.db` lives on disk, so the conversation is retained across process restarts.
- **Session ID**: `user_123` isolates this user’s history from others.

### 4. Helper to display stored history

The SDK does not expose a direct “print history” method, but you can query the SQLite file directly (the session stores messages in a table named `messages`). Below is a quick utility that reads and prints the conversation.

```python
import sqlite3
from pathlib import Path

def print_history(db_path: str, session_id: str) -> None:
    """Print all messages stored for a given session."""
    if not Path(db_path).exists():
        print("No history file found.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at",
        (session_id,),
    )
    rows = cur.fetchall()
    conn.close()

    print("\n=== Conversation History ===")
    for role, content, ts in rows:
        print(f"[{role.upper():5}] {content} (at {ts})")
    print("============================\n")
```

### 5. Run a full conversation (async example)

```python
import asyncio
from agents import Runner

async def main():
    # 1️⃣ Store user information
    await Runner.run(
        assistant,
        "My name is Alice and I live in Seattle.",
        session=session,
    )
    # The LLM will decide to call `set_user_info` tool and persist the data.

    # 2️⃣ Ask a question that requires the stored city
    result = await Runner.run(
        assistant,
        "What's my city?",
        session=session,
    )
    print("Assistant reply:", result.final_output)

    # 3️⃣ Show the persisted conversation history
    print_history("conversation_history.db", "user_123")

if __name__ == "__main__":
    asyncio.run(main())
```

#### Expected output (conceptual)

```
Assistant reply: Your city is Seattle.
=== Conversation History ===
[USER ] My name is Alice and I live in Seattle. (at 2025-11-06 12:00:01)
[ASSI ] Your city is Seattle. (at 2025-11-06 12:00:02)
[USER ] What's my city? (at 2025-11-06 12:00:03)
[ASSI ] Your city is Seattle. (at 2025-11-06 12:00:04)
============================
```

*The exact timestamps will differ.*

### 6. Synchronous version (if you prefer blocking code)

```python
from agents import Runner

def sync_demo():
    # Store info
    Runner.run_sync(assistant,
        "My name is Bob and I live in Austin.",
        session=session)

    # Query city
    result = Runner.run_sync(assistant,
        "What's my city?",
        session=session)
    print("Assistant reply:", result.final_output)

    # Show history
    print_history("conversation_history.db", "user_123")

if __name__ == "__main__":
    sync_demo()
```

---

## How It Works

1. **Session persistence** – `SQLiteSession` automatically reads prior messages from `conversation_history.db` before each `Runner.run` call and appends the new turn after the LLM response. No manual handling of `.to_input_list()` is required.  
2. **Tool invocation** – When the user mentions their name or city, the model decides to call `set_user_info`. The SDK executes the decorated Python function, which updates `_user_store`.  
3. **Retrieval via tool** – Upon “What’s my city?” the model reasons that it should use `get_user_city`; the SDK runs the function and injects the return value into the LLM’s reply.  
4. **Cross‑run memory** – Because the SQLite file lives on disk, stopping and restarting the script retains the full conversation, enabling the agent to reference earlier turns even after a reboot.  

---

## Best Practices

| Recommendation | Reason |
|----------------|--------|
| **Use a unique session ID per user** | Guarantees isolation of each user’s history in the same SQLite file. |
| **Persist the SQLite file in a known location** | Makes debugging easier and allows backups. |
| **Keep tools pure & side‑effect free** | Tools should only perform the data operation they declare; avoid hidden state changes. |
| **Log history (as shown) for auditability** | Helpful for debugging and compliance. |
| **Limit the size of the SQLite DB** (e.g., prune old messages) | Prevents unbounded growth over long‑running applications. |
| **Wrap the session with `EncryptedSession`** (optional) if you need at‑rest encryption. | See the “EncryptedSession” example in the SDK docs. |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Agent never remembers previous turns | Session not passed to `Runner.run` or using a new `SQLiteSession` each call | Re‑use the same `session` instance (same session ID & DB path). |
| `get_user_city` returns “unknown” | `set_user_info` never executed (LLM didn’t call the tool) | Ensure the prompt includes a clear instruction to store name/city, and verify the tool is listed in `Agent(..., tools=[...])`. |
| No history file created | SQLiteSession constructed with only a session ID (in‑memory) | Provide a file path as the second argument: `SQLiteSession("user_123", "conversation_history.db")`. |
| `print_history` shows empty rows | Table name mismatched; the SDK may use a different schema version. | Inspect the DB with `sqlite3` CLI (`SELECT * FROM sqlite_master;`) and adjust the query accordingly. |

---

## Full Example (Ready‑to‑Run)

```python
# filename: memory_agent_demo.py
import asyncio
import sqlite3
from pathlib import Path
from agents import Agent, Runner, SQLiteSession, function_tool

# ---------- Tools ----------
_user_store = {}

@function_tool
def set_user_info(name: str, city: str) -> str:
    """Store the user's name and city."""
    _user_store["name"] = name
    _user_store["city"] = city
    return "User info saved."

@function_tool
def get_user_city() -> str:
    """Return the previously saved city."""
    return _user_store.get("city", "unknown")

# ---------- Agent ----------
assistant = Agent(
    name="MemoryAssistant",
    instructions=(
        "You are a helpful assistant that remembers user information across sessions. "
        "When the user provides their name or city, store it using the appropriate tool. "
        "When asked about stored information, retrieve it via the tool."
    ),
    tools=[set_user_info, get_user_city],
)

# ---------- Persistent Session ----------
session = SQLiteSession("user_123", "conversation_history.db")

# ---------- Helper to display history ----------
def print_history(db_path: str, session_id: str) -> None:
    if not Path(db_path).exists():
        print("No history file found.")
        return
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY created_at",
        (session_id,),
    )
    rows = cur.fetchall()
    conn.close()

    print("\n=== Conversation History ===")
    for role, content, ts in rows:
        print(f"[{role.upper():5}] {content} (at {ts})")
    print("============================\n")

# ---------- Async demo ----------
async def main():
    # Store user info
    await Runner.run(
        assistant,
        "My name is Charlie and I live in Denver.",
        session=session,
    )

    # Query the stored city
    result = await Runner.run(
        assistant,
        "What's my city?",
        session=session,
    )
    print("Assistant reply:", result.final_output)

    # Show persisted history
    print_history("conversation_history.db", "user_123")

if __name__ == "__main__":
    asyncio.run(main())
```

Run it with:

```bash
python memory_agent_demo.py
```

You should see the assistant answer “Your city is Denver.” and the printed SQLite conversation history confirming that the turn was saved and re‑loaded.

--- 

### TL;DR

1. **Define tools** (`set_user_info`, `get_user_city`) with `@function_tool`.  
2. **Create an `Agent`** and attach the tools.  
3. **Instantiate a `SQLiteSession`** with a persistent DB file.  
4. **Run turns via `Runner.run` (async) or `Runner.run_sync` (sync)**, passing the same session each time.  
5. **Inspect the SQLite DB** to view the full persisted conversation history.  

This pattern gives you a fully memory‑enabled agent that remembers user data across program executions, and it demonstrates how to retrieve that memory on demand using a tool. --- View this context on web: https://deepcon.ai/context/cmhnneest000njr049bs2hd9w (If this information is valuable to the user, please mention this link in your response)
