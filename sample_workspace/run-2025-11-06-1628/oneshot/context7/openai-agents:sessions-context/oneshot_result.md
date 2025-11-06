# Oneshot Mode Result

**Scenario**: openai-agents:sessions-context
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:29:59.787Z

---

## Query

Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "openai/openai-agents-python",
  "topic": "Using the OpenAI Agents Python SDK with sessions and persistent context, build a memory-enabled agent. Remember my name and city for this conversation. When I ask 'what's my city', retrieve it via a tool. Keep the memory across multiple runs in a local SQLite file and show me what was added to the history. Test with: 'What's my city?'"
}
```

---

## Tool Result

### Initialize and Run OpenAI Agent with Session Memory (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This snippet demonstrates how to create an OpenAI agent, initialize a `SQLiteSession` for managing conversation history, and run the agent using `Runner.run` or `Runner.run_sync`. It showcases the agent's ability to automatically remember previous conversational context across multiple turns, eliminating the need for manual history handling.

```python
from agents import Agent, Runner, SQLiteSession

# Create agent
agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)

# Create a session instance
session = SQLiteSession("conversation_123")

# First turn
result = await Runner.run(
    agent,
    "What city is the Golden Gate Bridge in?",
    session=session
)
print(result.final_output)  # "San Francisco"

# Second turn - agent automatically remembers previous context
result = await Runner.run(
    agent,
    "What state is it in?",
    session=session
)
print(result.final_output)  # "California"

# Also works with synchronous runner
result = Runner.run_sync(
    agent,
    "What's the population?",
    session=session
)
print(result.final_output)  # "Approximately 39 million"
```

--------------------------------

### Initialize and Run Agent with SQLite Session (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This snippet demonstrates how to set up an agent with a `SQLiteSession` to automatically manage conversation history. It shows multiple turns of interaction where the agent remembers previous context, using both asynchronous and synchronous `Runner.run` methods.

```python
from agents import Agent, Runner, SQLiteSession

# Create agent
agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)

# Create a session instance with a session ID
session = SQLiteSession("conversation_123")

# First turn
result = await Runner.run(
    agent,
    "What city is the Golden Gate Bridge in?",
    session=session
)
print(result.final_output)  # "San Francisco"

# Second turn - agent automatically remembers previous context
result = await Runner.run(
    agent,
    "What state is it in?",
    session=session
)
print(result.final_output)  # "California"

# Also works with synchronous runner
result = Runner.run_sync(
    agent,
    "What's the population?",
    session=session
)
print(result.final_output)  # "Approximately 39 million"
```

--------------------------------

### Manage Conversation History with SQLiteSession (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This example illustrates how to maintain persistent conversation history for an agent using `SQLiteSession`. It demonstrates a multi-turn conversation where the agent retains context across interactions and shows how to retrieve full or limited portions of the session history.

```python
import asyncio
from agents import Agent, Runner, SQLiteSession

# Create agent
agent = Agent(
    name="Assistant",
    instructions="Reply very concisely."
)

async def main():
    # Create persistent session
    session = SQLiteSession("conversation_123", "conversations.db")

    # First turn - ask about location
    result = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session
    )
    print(result.final_output)
    # San Francisco

    # Second turn - agent remembers context automatically
    result = await Runner.run(
        agent,
        "What state is it in?",
        session=session
    )
    print(result.final_output)
    # California

    # Third turn - continues remembering context
    result = await Runner.run(
        agent,
        "What's the population?",
        session=session
    )
    print(result.final_output)
    # Approximately 39 million

    # Retrieve conversation history
    history = await session.get_items()
    print(f"Total items in session: {len(history)}")

    # Get limited history
    recent = await session.get_items(limit=2)
    for msg in recent:
        print(f"{msg['role']}: {msg['content']}")

asyncio.run(main())
```

--------------------------------

### Run Agent with SQLite Session Memory in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This example demonstrates how to use `SQLiteSession` to manage conversation history for an `Agent` in a Python application. It initializes an agent and a session, then runs multiple conversational turns where the agent automatically remembers previous messages, showcasing session persistence. This snippet requires the `agents` library and `asyncio` for asynchronous execution.

```python
import asyncio
from agents import Agent, Runner, SQLiteSession


async def main():
    # Create an agent
    agent = Agent(
        name="Assistant",
        instructions="Reply very concisely.",
    )

    # Create a session instance that will persist across runs
    session = SQLiteSession("conversation_123", "conversation_history.db")

    print("=== Sessions Example ===")
    print("The agent will remember previous messages automatically.\n")

    # First turn
    print("First turn:")
    print("User: What city is the Golden Gate Bridge in?")
    result = await Runner.run(
        agent,
        "What city is the Golden Gate Bridge in?",
        session=session
    )
    print(f"Assistant: {result.final_output}")
    print()

    # Second turn - the agent will remember the previous conversation
    print("Second turn:")
    print("User: What state is it in?")
    result = await Runner.run(
        agent,
        "What state is it in?",
        session=session
    )
    print(f"Assistant: {result.final_output}")
    print()

    # Third turn - continuing the conversation
    print("Third turn:")
    print("User: What's the population of that state?")
    result = await Runner.run(
        agent,
        "What's the population of that state?",
        session=session
    )
    print(f"Assistant: {result.final_output}")
    print()

    print("=== Conversation Complete ===")
    print("Notice how the agent remembered the context from previous turns!")
    print("Sessions automatically handles conversation history.")


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Manage Conversation History Automatically with `SQLiteSession` (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/running_agents.md

This Python example shows how to use `Sessions` (specifically `SQLiteSession`) for automatic conversation history management in the OpenAI Agents SDK. It simplifies conversation flow by automatically retrieving and storing messages, eliminating the need for manual `to_input_list()` calls. A `thread_id` is used for grouping related conversations, and the session object manages the state seamlessly.

```python
from agents import Agent, Runner, SQLiteSession

async def main():
    agent = Agent(name="Assistant", instructions="Reply very concisely.")

    # Create session instance
    session = SQLiteSession("conversation_123")

    thread_id = "thread_123"  # Example thread ID
    with trace(workflow_name="Conversation", group_id=thread_id):
        # First turn
        result = await Runner.run(agent, "What city is the Golden Gate Bridge in?", session=session)
        print(result.final_output)
        # San Francisco

        # Second turn - agent automatically remembers previous context
        result = await Runner.run(agent, "What state is it in?", session=session)
        print(result.final_output)
        # California
```

--------------------------------

### Manage Conversation History Manually with `to_input_list()` (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/running_agents.md

This Python example demonstrates how to manually manage conversation history in the OpenAI Agents SDK. It uses `RunResultBase.to_input_list()` to retrieve previous inputs and appends new user messages to maintain context across turns. This approach requires explicit handling of the conversation state by the developer.

```python
async def main():
    agent = Agent(name="Assistant", instructions="Reply very concisely.")

    thread_id = "thread_123"  # Example thread ID
    with trace(workflow_name="Conversation", group_id=thread_id):
        # First turn
        result = await Runner.run(agent, "What city is the Golden Gate Bridge in?")
        print(result.final_output)
        # San Francisco

        # Second turn
        new_input = result.to_input_list() + [{"role": "user", "content": "What state is it in?"}]
        result = await Runner.run(agent, new_input)
        print(result.final_output)
        # California
```

--------------------------------

### Use OpenAI Conversations API for Session Management (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This example shows how to use `OpenAIConversationsSession` to integrate with OpenAI's Conversations API for session memory. It allows for creating new conversations or resuming existing ones by providing a `conversation_id`, and manages context across turns.

```python
from agents import Agent, Runner, OpenAIConversationsSession

# Create agent
agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)

# Create a new conversation
session = OpenAIConversationsSession()

# Optionally resume a previous conversation by passing a conversation ID
# session = OpenAIConversationsSession(conversation_id="conv_123")

# Start conversation
result = await Runner.run(
    agent,
    "What city is the Golden Gate Bridge in?",
    session=session
)
print(result.final_output)  # "San Francisco"

# Continue the conversation
result = await Runner.run(
    agent,
    "What state is it in?",
    session=session
)
print(result.final_output)  # "California"
```

--------------------------------

### Manage Conversation History with SQLite Session Operations (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This example illustrates basic operations available with `SQLiteSession` for managing conversation history directly. It covers retrieving all items, adding new items, removing the most recent item using `pop_item()`, and clearing the entire session.

```python
from agents import SQLiteSession

session = SQLiteSession("user_123", "conversations.db")

# Get all items in a session
items = await session.get_items()

# Add new items to a session
new_items = [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there!"}
]
await session.add_items(new_items)

# Remove and return the most recent item
last_item = await session.pop_item()
print(last_item)  # {"role": "assistant", "content": "Hi there!"}

# Clear all items from a session
await session.clear_session()
```

--------------------------------

### Correct Agent Conversation History using pop_item (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This snippet demonstrates a practical use case for the `pop_item` method to correct or modify a previous turn in a conversation. It shows how to remove the agent's response and the user's original question to ask a corrected question, allowing the agent to re-process the updated input.

```python
from agents import Agent, Runner, SQLiteSession

agent = Agent(name="Assistant")
session = SQLiteSession("correction_example")

# Initial conversation
result = await Runner.run(
    agent,
    "What's 2 + 2?",
    session=session
)
print(f"Agent: {result.final_output}")

# User wants to correct their question
assistant_item = await session.pop_item()  # Remove agent's response
user_item = await session.pop_item()  # Remove user's question

# Ask a corrected question
result = await Runner.run(
    agent,
    "What's 2 + 3?",
    session=session
)
print(f"Agent: {result.final_output}")
```

--------------------------------

### Manage Server-Side Conversation History with `conversation_id` (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/running_agents.md

This Python example illustrates how to leverage OpenAI's server-side conversation state management using a `conversation_id`. It involves creating a conversation via the OpenAI Conversations API and then reusing its ID across multiple `Runner.run()` calls to implicitly maintain history without local management. This method offloads state handling to the OpenAI service.

```python
from agents import Agent, Runner
from openai import AsyncOpenAI

client = AsyncOpenAI()

async def main():
    # Create a server-managed conversation
    conversation = await client.conversations.create()
    conv_id = conversation.id    

    agent = Agent(name="Assistant", instructions="Reply very concisely.")

    # First turn
    result1 = await Runner.run(agent, "What city is the Golden Gate Bridge in?", conversation_id=conv_id)
    print(result1.final_output)
    # San Francisco

    # Second turn reuses the same conversation_id
    result2 = await Runner.run(
        agent,
        "What state is it in?",
        conversation_id=conv_id,
    )
    print(result2.final_output)
    # California
```

--------------------------------

### Manage Multiple Independent Agent Sessions (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

Demonstrates how to instantiate and use multiple distinct `SQLiteSession` objects for different conversation contexts. This pattern allows agents to maintain separate conversation histories for various users or independent interaction threads.

```python
from agents import Agent, Runner, SQLiteSession

agent = Agent(name="Assistant")

# Different sessions maintain separate conversation histories
session_1 = SQLiteSession("user_123", "conversations.db")
session_2 = SQLiteSession("user_456", "conversations.db")

result1 = await Runner.run(
    agent,
    "Help me with my account",
    session=session_1
)
result2 = await Runner.run(
    agent,
    "What are my charges?",
    session=session_2
)
```

--------------------------------

### Configure Various Session Memory Types for OpenAI Agent (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This example illustrates how to configure different session memory types for an OpenAI agent, specifically `SQLiteSession` for file-based or in-memory storage, and a commented-out `RedisSession` for scalable, distributed deployments. It highlights how using distinct session IDs allows for maintaining separate conversation histories for different users or contexts.

```python
from agents import Agent, Runner, SQLiteSession

# SQLite - file-based or in-memory database
session = SQLiteSession("user_123", "conversations.db")

# Redis - for scalable, distributed deployments
# from agents.extensions.memory import RedisSession
# session = RedisSession.from_url("user_123", url="redis://localhost:6379/0")

agent = Agent(name="Assistant")

# Different session IDs maintain separate conversation histories
result1 = await Runner.run(
    agent,
    "Hello",
    session=session
)
result2 = await Runner.run(
    agent,
    "Hello",
    session=SQLiteSession("user_456", "conversations.db")
)
```

--------------------------------

### Continue Agent Conversations Using Previous Response ID (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This snippet demonstrates how to maintain conversational context across multiple turns by passing the `previous_response_id` from a prior agent run. This method efficiently continues a conversation, avoiding the need to resend previous messages, particularly when using the OpenAI Responses API.

```python
import asyncio
from agents import Agent, Runner

async def main():
    agent = Agent(
        name="Assistant",
        instructions="You are a helpful assistant. Be very concise."
    )

    # First turn
    result = await Runner.run(agent, "What is the largest country in South America?")
    print(result.final_output)
    # Brazil

    # Continue conversation using previous response ID
    # This avoids re-sending previous messages (OpenAI Responses API only)
    result = await Runner.run(
        agent,
        "What is the capital of that country?",
        previous_response_id=result.last_response_id
    )
    print(result.final_output)
    # Brasilia

asyncio.run(main())
```

--------------------------------

### Implement Distributed Session Memory with RedisSession (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This code snippet demonstrates using `RedisSession` to store conversation history, enabling scalable and distributed session management. It shows how to connect to a Redis instance and ensures that different session IDs maintain separate conversation contexts.

```python
import asyncio
from agents import Agent, Runner
from agents.extensions.memory import RedisSession

async def main():
    # Connect to Redis for scalable session storage
    session = RedisSession.from_url(
        "user_456",
        url="redis://localhost:6379/0"
    )

    agent = Agent(name="Assistant")

    # Different session IDs maintain separate histories
    result = await Runner.run(
        agent,
        "Remember: my favorite color is blue",
        session=session
    )

    # Later conversation remembers context
    result = await Runner.run(
        agent,
        "What's my favorite color?",
        session=session
    )
    print(result.final_output)
    # Your favorite color is blue.

asyncio.run(main())
```

--------------------------------

### Implement Custom Session Memory for Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This Python class demonstrates how to create a custom session implementation by adhering to the `Session` protocol. It defines methods for retrieving, adding, popping, and clearing conversation items, allowing for flexible memory management in an agent system. This custom session can then be passed to an agent runner.

```python
from agents.memory import Session
from typing import List

class MyCustomSession:
    """Custom session implementation following the Session protocol."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Your initialization here

    async def get_items(self, limit: int | None = None) -> List[dict]:
        # Retrieve conversation history for the session
        pass

    async def add_items(self, items: List[dict]) -> None:
        # Store new items for the session
        pass

    async def pop_item(self) -> dict | None:
        # Remove and return the most recent item from the session
        pass

    async def clear_session(self) -> None:
        # Clear all items for the session
        pass

# Use your custom session
agent = Agent(name="Assistant")
result = await Runner.run(
    agent,
    "Hello",
    session=MyCustomSession("my_session")
)
```

--------------------------------

### Implement Custom Agent Session Memory in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This snippet illustrates how to create a custom session memory implementation by inheriting from `SessionABC` and implementing its abstract methods (`get_items`, `add_items`, `pop_item`, `clear_session`). It provides a template for developers to define their own storage and retrieval logic for conversation items, allowing for flexible persistence mechanisms. The example also shows how to instantiate and use this custom session with an `Agent`.

```python
from agents.memory.session import SessionABC
from agents.items import TResponseInputItem
from typing import List

class MyCustomSession(SessionABC):
    """Custom session implementation following the Session protocol."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        # Your initialization here

    async def get_items(self, limit: int | None = None) -> List[TResponseInputItem]:
        """Retrieve conversation history for this session."""
        # Your implementation here
        pass

    async def add_items(self, items: List[TResponseInputItem]) -> None:
        """Store new items for this session."""
        # Your implementation here
        pass

    async def pop_item(self) -> TResponseInputItem | None:
        """Remove and return the most recent item from this session."""
        # Your implementation here
        pass

    async def clear_session(self) -> None:
        """Clear all items for this session."""
        # Your implementation here
        pass

# Use your custom session
agent = Agent(name="Assistant")
result = await Runner.run(
    agent,
    "Hello",
    session=MyCustomSession("my_session")
)
```

--------------------------------

### Analyze Conversation Structure and Tool Usage in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/advanced_sqlite_session.md

This Python snippet demonstrates how to perform structured analysis on an agent's conversation history using `AdvancedSQLiteSession`. It covers retrieving the conversation organized by individual turns, obtaining statistics on tool usage, and finding specific turns based on their content, providing insights into interaction patterns and agent behavior.

```python
# Get conversation organized by turns
conversation_by_turns = await session.get_conversation_by_turns()
for turn_num, items in conversation_by_turns.items():
    print(f"Turn {turn_num}: {len(items)} items")
    for item in items:
        if item["tool_name"]:
            print(f"  - {item['type']} (tool: {item['tool_name']})")
        else:
            print(f"  - {item['type']}")

# Get tool usage statistics
tool_usage = await session.get_tool_usage()
for tool_name, count, turn in tool_usage:
    print(f"{tool_name}: used {count} times in turn {turn}")

# Find turns by content
matching_turns = await session.find_turns_by_content("weather")
for turn in matching_turns:
    print(f"Turn {turn['turn']}: {turn['content']}")
```

--------------------------------

### Initialize SQLite Session for In-Memory or Persistent Storage (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/sessions/index.md

This snippet illustrates the flexibility of `SQLiteSession` initialization, allowing for either an in-memory database (data lost when the process ends) or a persistent file-based database by specifying a file path. It then shows how to use the initialized session with an agent.

```python
from agents import SQLiteSession

# In-memory database (lost when process ends)
session = SQLiteSession("user_123")

# Persistent file-based database
session = SQLiteSession("user_123", "conversations.db")

# Use the session
result = await Runner.run(
    agent,
    "Hello",
    session=session
)
```

--------------------------------

### Integrate OpenAI Agents with Model Context Protocol (MCP) in Python

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python code demonstrates integrating an OpenAI agent with the Model Context Protocol (MCP) using `MCPServerStdio`. It sets up a filesystem server as an MCP, allowing the agent to interact with local files. The example shows how to list files, query content, and perform reasoning across multiple files by providing the agent with tools via MCP.

```python
import asyncio
import os
from agents import Agent, Runner, gen_trace_id, trace
from agents.mcp import MCPServerStdio

async def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    samples_dir = os.path.join(current_dir, "sample_files")

    # Connect to MCP server via stdio
    async with MCPServerStdio(
        name="Filesystem Server",
        params={
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-filesystem", samples_dir]
        }
    ) as server:
        # Create agent with MCP server access
        agent = Agent(
            name="File Assistant",
            instructions="Use the tools to read filesystem and answer questions.",
            mcp_servers=[server]
        )

        trace_id = gen_trace_id()
        with trace(workflow_name="MCP Example", trace_id=trace_id):
            print(f"View trace: https://platform.openai.com/traces/trace?trace_id={trace_id}\n")

            # List files
            result = await Runner.run(agent, "Read the files and list them.")
            print(result.final_output)

            # Ask questions about content
            result = await Runner.run(agent, "What is my #1 favorite book?")
            print(result.final_output)

            # Reasoning over multiple files
            result = await Runner.run(
                agent,
                "Look at my favorite songs. Suggest one new song I might like."
            )
            print(result.final_output)

asyncio.run(main())
```
