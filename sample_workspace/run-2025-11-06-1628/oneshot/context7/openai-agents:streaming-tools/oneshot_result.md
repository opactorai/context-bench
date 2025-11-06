# Oneshot Mode Result

**Scenario**: openai-agents:streaming-tools
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:29:56.843Z

---

## Query

Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "openai/openai-agents-python",
  "topic": "Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user."
}
```

---

## Tool Result

### Create a Realtime Voice Agent with Function Tools in Python

Source: https://context7.com/openai/openai-agents-python/llms.txt

This example illustrates how to build a real-time voice-enabled agent using the OpenAI Agents SDK, incorporating a custom function tool. It shows the setup of a `RealtimeAgent` with instructions and tools, and how to process real-time voice events from a `RealtimeSession` to stream agent responses.

```python
import asyncio
from agents import function_tool
from agents.realtime import (
    RealtimeAgent,
    RealtimeRunner,
    RealtimeSession
)

@function_tool
def get_weather(city: str) -> str:
    """Get the weather in a city."""
    return f"The weather in {city} is sunny."

# Create voice-enabled agent
agent = RealtimeAgent(
    name="Voice Assistant",
    instructions="You are a friendly voice assistant.",
    tools=[get_weather]
)

async def main():
    # Create realtime session for voice interaction
    async with RealtimeSession() as session:
        runner = RealtimeRunner(session)

        # Handle voice events
        async for event in runner.run(agent):
            if event.type == "response.audio.delta":
                # Stream audio to output device
                pass
            elif event.type == "response.text.done":
                print(f"Agent: {event.text}")

asyncio.run(main())
```

--------------------------------

### Stream Agent Responses in Real-time (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This example illustrates how to stream an agent's responses in real-time using `Runner.run_streamed()`. It demonstrates iterating through stream events and processing `ResponseTextDeltaEvent`s to display text output incrementally.

```python
import asyncio
from openai.types.responses import ResponseTextDeltaEvent
from agents import Agent, Runner, RawResponsesStreamEvent

async def main():
    agent = Agent(
        name="Storyteller",
        instructions="You are a creative storyteller."
    )

    # Stream text output in real-time
    result = Runner.run_streamed(agent, "Tell me 3 short jokes.")

    async for event in result.stream_events():
        # Check for text delta events
        if event.type == "raw_response_event":
            if isinstance(event.data, ResponseTextDeltaEvent):
                print(event.data.delta, end="", flush=True)

    print("\n\n--- Final Output ---")
    print(result.final_output)

asyncio.run(main())
```

--------------------------------

### Implement Voice Pipeline for Streamed Audio with OpenAI Agents

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python snippet introduces the `VoicePipeline` and `StreamedAudioInput` components for building voice-enabled agents. It includes a basic `function_tool` for weather information, hinting at how voice inputs can interact with agent tools. This is a partial example, focusing on setup.

```python
import asyncio
from agents import function_tool
from agents.voice import VoicePipeline, StreamedAudioInput

@function_tool
def get_weather(city: str) -> str:
    """Get the weather in a city."""
    return f"The weather in {city} is sunny."
```

--------------------------------

### Integrate Function Tools with a Python Agent

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This Python example showcases how to integrate custom Python functions as tools for an agent, allowing it to perform specific actions or retrieve information. The agent uses the `@function_tool` decorator to make the `get_weather` function available, demonstrating dynamic tool utilization based on user input.

```python
import asyncio

from agents import Agent, Runner, function_tool


@function_tool
def get_weather(city: str) -> str:
    return f"The weather in {city} is sunny."


agent = Agent(
    name="Hello world",
    instructions="You are a helpful agent.",
    tools=[get_weather],
)


async def main():
    result = await Runner.run(agent, input="What's the weather in Tokyo?")
    print(result.final_output)
    # The weather in Tokyo is sunny.


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Configure Agent to Stop on First Tool Call Output (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/agents.md

This example demonstrates configuring an `Agent` to use the `stop_on_first_tool` behavior. When a tool is called, its output is immediately considered the final response without further processing by the LLM. It defines a `get_weather` tool and assigns it to the agent.

```python
from agents import Agent, Runner, function_tool, ModelSettings

@function_tool
def get_weather(city: str) -> str:
    """Returns weather info for the specified city."""
    return f"The weather in {city} is sunny"

agent = Agent(
    name="Weather Agent",
    instructions="Retrieve weather details.",
    tools=[get_weather],
    tool_use_behavior="stop_on_first_tool"
)
```

--------------------------------

### Define and Add Function Tools to a RealtimeAgent (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/guide.md

This Python example demonstrates how to define function tools using the `@function_tool` decorator and then add them to a `RealtimeAgent` instance. These tools allow the agent to perform specific actions like fetching weather or booking appointments during a conversation. The agent is initialized with a name, instructions, and a list of these defined tools, extending its capabilities beyond basic conversation.

```python
from agents import function_tool

@function_tool
def get_weather(city: str) -> str:
    """Get current weather for a city."""
    # Your weather API logic here
    return f"The weather in {city} is sunny, 72°F"

@function_tool
def book_appointment(date: str, time: str, service: str) -> str:
    """Book an appointment."""
    # Your booking logic here
    return f"Appointment booked for {service} on {date} at {time}"

agent = RealtimeAgent(
    name="Assistant",
    instructions="You can help with weather and appointments.",
    tools=[get_weather, book_appointment],
)
```

--------------------------------

### Stream Higher-Level Agent and Run Item Events in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/streaming.md

This code snippet illustrates how to stream higher-level events from an agent run, focusing on `RunItemStreamEvent` and `AgentUpdatedStreamEvent`. It allows for progress updates at a more conceptual level (e.g., 'tool ran', 'message generated') rather than raw tokens. The example demonstrates handling tool calls, tool output, and message output, while explicitly ignoring raw response deltas.

```python
import asyncio
import random
from agents import Agent, ItemHelpers, Runner, function_tool

@function_tool
def how_many_jokes() -> int:
    return random.randint(1, 10)


async def main():
    agent = Agent(
        name="Joker",
        instructions="First call the `how_many_jokes` tool, then tell that many jokes.",
        tools=[how_many_jokes],
    )

    result = Runner.run_streamed(
        agent,
        input="Hello",
    )
    print("=== Run starting ===")

    async for event in result.stream_events():
        # We'll ignore the raw responses event deltas
        if event.type == "raw_response_event":
            continue
        # When the agent updates, print that
        elif event.type == "agent_updated_stream_event":
            print(f"Agent updated: {event.new_agent.name}")
            continue
        # When items are generated, print them
        elif event.type == "run_item_stream_event":
            if event.item.type == "tool_call_item":
                print("-- Tool was called")
            elif event.item.type == "tool_call_output_item":
                print(f"-- Tool output: {event.item.output}")
            elif event.item.type == "message_output_item":
                print(f"-- Message output:\n {ItemHelpers.text_message_output(event.item)}")
            else:
                pass  # Ignore other event types

    print("=== Run complete ===")


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Define and Use Function Tools with Agents (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This example illustrates how to define a custom function tool using a Pydantic model for structured output and the `@function_tool` decorator. The agent is then configured with this tool, allowing it to interpret and execute the function based on user queries, providing a structured response.

```python
import asyncio
from typing import Annotated
from pydantic import BaseModel, Field
from agents import Agent, Runner, function_tool

# Define structured output type
class Weather(BaseModel):
    city: str = Field(description="The city name")
    temperature_range: str = Field(description="Temperature in Celsius")
    conditions: str = Field(description="Weather conditions")

# Create a function tool with decorator
@function_tool
def get_weather(city: Annotated[str, "The city to get weather for"]) -> Weather:
    """Get current weather information for a specified city."""
    # In production, this would call a real weather API
    return Weather(
        city=city,
        temperature_range="14-20C",
        conditions="Sunny with wind."
    )

# Create agent with tools
agent = Agent(
    name="Weather Assistant",
    instructions="You are a helpful weather assistant.",
    tools=[get_weather]
)

async def main():
    result = await Runner.run(agent, "What's the weather in Tokyo?")
    print(result.final_output)
    # The weather in Tokyo is sunny with wind, temperatures between 14-20C.

asyncio.run(main())
```

--------------------------------

### Configure Agent to Stop on Specific Tool Call Output (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/agents.md

This example shows how to use `StopAtTools` to halt agent execution and use the output of a specified tool as the final response. It defines multiple tools but configures the agent to stop only when `get_weather` is called, ignoring `sum_numbers` for the stopping condition.

```python
from agents import Agent, Runner, function_tool
from agents.agent import StopAtTools

@function_tool
def get_weather(city: str) -> str:
    """Returns weather info for the specified city."""
    return f"The weather in {city} is sunny"

@function_tool
def sum_numbers(a: int, b: int) -> int:
    """Adds two numbers."""
    return a + b

agent = Agent(
    name="Stop At Stock Agent",
    instructions="Get weather or sum numbers.",
    tools=[get_weather, sum_numbers],
    tool_use_behavior=StopAtTools(stop_at_tool_names=["get_weather"])
)
```

--------------------------------

### Track Agent Usage Statistics in OpenAI Agents

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python code demonstrates how to access and display usage statistics after an OpenAI Agent's execution. It defines a custom Pydantic model for tool output and a `function_tool` to simulate a weather lookup, then prints the number of requests, input/output tokens, and total tokens consumed by the agent.

```python
import asyncio
from pydantic import BaseModel
from agents import Agent, Runner, Usage, function_tool

class Weather(BaseModel):
    city: str
    temperature_range: str
    conditions: str

@function_tool
def get_weather(city: str) -> Weather:
    """Get weather information."""
    return Weather(
        city=city,
        temperature_range="14-20C",
        conditions="Sunny"
    )

async def main():
    agent = Agent(
        name="Usage Demo",
        instructions="You are a concise assistant.",
        tools=[get_weather]
    )

    result = await Runner.run(agent, "What's the weather in Tokyo?")
    print(result.final_output)

    # Access usage statistics
    usage: Usage = result.context_wrapper.usage
    print(f"\n=== Usage Statistics ===")
    print(f"Requests: {usage.requests}")
    print(f"Input tokens: {usage.input_tokens}")
    print(f"Output tokens: {usage.output_tokens}")
    print(f"Total tokens: {usage.total_tokens}")
    # Output:
    # === Usage Statistics ===
    # Requests: 2
    # Input tokens: 1247
    # Output tokens: 89
    # Total tokens: 1336

asyncio.run(main())
```

--------------------------------

### Stream Results from Hosted MCP Tool with Python Agent

Source: https://github.com/openai/openai-agents-python/blob/main/docs/mcp.md

This Python example shows how to stream incremental results from a `HostedMCPTool` using `Runner.run_streamed` in the OpenAI Python SDK. It processes events as they arrive, allowing the application to consume and display output while the model is still generating a response.

```python
result = Runner.run_streamed(agent, "Summarise this repository's top languages")
async for event in result.stream_events():
    if event.type == "run_item_stream_event":
        print(f"Received: {event.item}")
print(result.final_output)
```

--------------------------------

### Implement Custom Agent Tool Logic in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/tools.md

This Python code snippet shows an advanced method for embedding an agent within a tool, allowing for fine-grained control over its execution. Instead of using the `agent.as_tool` convenience method, it directly calls `Runner.run` within a custom tool implementation, enabling specific configurations like `max_turns` or `run_config` for the embedded agent.

```python
@function_tool
async def run_my_agent() -> str:
    """A tool that runs the agent with custom configs"""

    agent = Agent(name="My agent", instructions="...")

    result = await Runner.run(
        agent,
        input="...",
        max_turns=5,
        run_config=...
    )

    return str(result.final_output)
```

--------------------------------

### Force Specific Tool Use for OpenAI Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/agents.md

This Python code illustrates how to mandate an OpenAI agent to use a particular tool by setting the model_settings.tool_choice property. It defines a get_weather function tool and configures an agent to always use this tool when responding.

```python
from agents import Agent, Runner, function_tool, ModelSettings

@function_tool
def get_weather(city: str) -> str:
    """Returns weather info for the specified city."""
    return f"The weather in {city} is sunny"

agent = Agent(
    name="Weather Agent",
    instructions="Retrieve weather details.",
    tools=[get_weather],
    model_settings=ModelSettings(tool_choice="get_weather")
)
```

--------------------------------

### Create and Execute Basic Agent (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This snippet demonstrates how to initialize a simple agent with instructions and execute a task both synchronously and asynchronously using the `Runner` utility. It shows how to access the final output and individual conversation items from the execution result.

```python
import asyncio
from agents import Agent, Runner

# Create a simple agent with instructions
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant that responds in haikus."
)

# Synchronous execution
result = Runner.run_sync(agent, "Tell me about recursion in programming.")
print(result.final_output)
# Output: Function calls itself, / Looping in smaller pieces, / Infinite loop's dance.

# Asynchronous execution
async def main():
    result = await Runner.run(agent, "Explain machine learning.")
    print(result.final_output)
    # Access conversation items
    for item in result.new_items:
        print(item)

asyncio.run(main())
```

--------------------------------

### Implement Voice Agent with Function Tool and Handoff in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/voice/quickstart.md

This Python code defines an AI agent capable of handling voice interactions. It includes a `get_weather` function tool for retrieving weather information and configures a handoff mechanism to a 'Spanish' agent for multi-language support. The main function sets up a `VoicePipeline` to process audio input and stream audio output in real-time using `sounddevice`.

```python
import asyncio
import random

import numpy as np
import sounddevice as sd

from agents import (
    Agent,
    function_tool,
    set_tracing_disabled,
)
from agents.voice import (
    AudioInput,
    SingleAgentVoiceWorkflow,
    VoicePipeline,
)
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions


@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    print(f"[debug] get_weather called with city: {city}")
    choices = ["sunny", "cloudy", "rainy", "snowy"]
    return f"The weather in {city} is {random.choice(choices)}."


spanish_agent = Agent(
    name="Spanish",
    handoff_description="A spanish speaking agent.",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. Speak in Spanish.",
    ),
    model="gpt-4.1",
)

agent = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. If the user speaks in Spanish, handoff to the spanish agent.",
    ),
    model="gpt-4.1",
    handoffs=[spanish_agent],
    tools=[get_weather],
)


async def main():
    pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
    buffer = np.zeros(24000 * 3, dtype=np.int16)
    audio_input = AudioInput(buffer=buffer)

    result = await pipeline.run(audio_input)

    # Create an audio player using `sounddevice`
    player = sd.OutputStream(samplerate=24000, channels=1, dtype=np.int16)
    player.start()

    # Play the audio stream as it comes in
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            player.write(event.data)


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Utilize Built-in WebSearchTool in OpenAI Agents

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python code illustrates how to equip an OpenAI Agent with a built-in `WebSearchTool`. The agent is configured as a 'Research Assistant' and can perform web searches, optionally with a specified user location. The `trace` context manager is used for monitoring the agent's execution.

```python
import asyncio
from agents import Agent, Runner, WebSearchTool, trace

async def main():
    # Web search tool
    agent = Agent(
        name="Research Assistant",
        instructions="You are a helpful research assistant.",
        tools=[
            WebSearchTool(
                user_location={"type": "approximate", "city": "New York"}
            )
        ]
    )

    with trace("Web search example"):
        result = await Runner.run(
            agent,
            "Search the web for 'local sports news' and give me 1 interesting update."
        )
        print(result.final_output)
        # The New York Yankees are pursuing a new pitcher...

asyncio.run(main())
```

--------------------------------

### Manage Local Context in OpenAI Agents with RunContextWrapper

Source: https://github.com/openai/openai-agents-python/blob/main/docs/context.md

This Python example demonstrates how to define and use a custom local context object (a dataclass `UserInfo`) with `RunContextWrapper` in OpenAI Agents. It shows how to pass contextual data (like user information) to tool functions and agents for processing, ensuring the agent and its tools operate within a shared context.

```python
import asyncio
from dataclasses import dataclass

from agents import Agent, RunContextWrapper, Runner, function_tool

@dataclass
class UserInfo:  # (1)!
    name: str
    uid: int

@function_tool
async def fetch_user_age(wrapper: RunContextWrapper[UserInfo]) -> str:  # (2)!
    """Fetch the age of the user. Call this function to get user's age information."""
    return f"The user {wrapper.context.name} is 47 years old"

async def main():
    user_info = UserInfo(name="John", uid=123)

    agent = Agent[UserInfo](  # (3)!
        name="Assistant",
        tools=[fetch_user_age],
    )

    result = await Runner.run(  # (4)!
        starting_agent=agent,
        input="What is the age of the user?",
        context=user_info,
    )

    print(result.final_output)  # (5)!
    # The user John is 47 years old.

if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Configure RealtimeAgent Handoffs for Specialized Support (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/guide.md

This Python example illustrates how to create specialized `RealtimeAgent` instances for different tasks (e.g., billing, technical support). It then shows how to configure a main agent with `realtime_handoff` objects, enabling it to transfer conversations to these specialized agents based on user intent. Each handoff includes a `tool_description` to guide the agent's decision-making and ensure smooth transitions between support contexts.

```python
from agents.realtime import realtime_handoff

# Specialized agents
billing_agent = RealtimeAgent(
    name="Billing Support",
    instructions="You specialize in billing and payment issues.",
)

technical_agent = RealtimeAgent(
    name="Technical Support",
    instructions="You handle technical troubleshooting.",
)

# Main agent with handoffs
main_agent = RealtimeAgent(
    name="Customer Service",
    instructions="You are the main customer service agent. Hand off to specialists when needed.",
    handoffs=[
        realtime_handoff(billing_agent, tool_description="Transfer to billing support"),
        realtime_handoff(technical_agent, tool_description="Transfer to technical support"),
    ]
)
```
