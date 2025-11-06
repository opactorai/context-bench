# Oneshot Mode Result

**Scenario**: openai-agents:realtime-agent
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:30:01.699Z

---

## Query

Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed).

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "openai/openai-agents-python",
  "topic": "Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed)."
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

### Initialize and Run Realtime Agent Session in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/quickstart.md

This asynchronous Python script demonstrates how to set up and run a `RealtimeAgent` using the `RealtimeRunner` from the `agents.realtime` library. It initializes an agent with specific instructions and model configurations, including audio modalities and turn detection, then processes various session events like agent start/end, tool usage, and audio events. The script requires `asyncio` for execution and the OpenAI Python Agents SDK.

```python
import asyncio
from agents.realtime import RealtimeAgent, RealtimeRunner

async def main():
    # Create the agent
    agent = RealtimeAgent(
        name="Assistant",
        instructions="You are a helpful voice assistant. Keep responses brief and conversational.",
    )
    # Set up the runner with configuration
    runner = RealtimeRunner(
        starting_agent=agent,
        config={
            "model_settings": {
                "model_name": "gpt-realtime",
                "voice": "ash",
                "modalities": ["audio"],
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "input_audio_transcription": {"model": "gpt-4o-mini-transcribe"},
                "turn_detection": {"type": "semantic_vad", "interrupt_response": True},
            }
        },
    )
    # Start the session
    session = await runner.run()

    async with session:
        print("Session started! The agent will stream audio responses in real-time.")
        # Process events
        async for event in session:
            try:
                if event.type == "agent_start":
                    print(f"Agent started: {event.agent.name}")
                elif event.type == "agent_end":
                    print(f"Agent ended: {event.agent.name}")
                elif event.type == "handoff":
                    print(f"Handoff from {event.from_agent.name} to {event.to_agent.name}")
                elif event.type == "tool_start":
                    print(f"Tool started: {event.tool.name}")
                elif event.type == "tool_end":
                    print(f"Tool ended: {event.tool.name}; output: {event.output}")
                elif event.type == "audio_end":
                    print("Audio ended")
                elif event.type == "audio":
                    # Enqueue audio for callback-based playback with metadata
                    # Non-blocking put; queue is unbounded, so drops won’t occur.
                    pass
                elif event.type == "audio_interrupted":
                    print("Audio interrupted")
                    # Begin graceful fade + flush in the audio callback and rebuild jitter buffer.
                elif event.type == "error":
                    print(f"Error: {event.error}")
                elif event.type == "history_updated":
                    pass  # Skip these frequent events
                elif event.type == "history_added":
                    pass  # Skip these frequent events
                elif event.type == "raw_model_event":
                    print(f"Raw model event: {_truncate_str(str(event.data), 200)}")
                else:
                    print(f"Unknown event type: {event.type}")
            except Exception as e:
                print(f"Error processing event: {_truncate_str(str(e), 200)}")

def _truncate_str(s: str, max_length: int) -> str:
    if len(s) > max_length:
        return s[:max_length] + "..."
    return s

if __name__ == "__main__":
    # Run the session
    asyncio.run(main())
```

--------------------------------

### Add a Custom Listener to Realtime Agent Model (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/guide.md

This Python snippet shows how to add a custom listener to the underlying `RealtimeModel` of a session. This allows for advanced control and custom processing of model events, providing lower-level access beyond the standard event handling mechanisms.

```python
# Add a custom listener to the model
session.model.add_listener(my_custom_listener)
```

--------------------------------

### Run OpenAI Voice Pipeline and Stream Audio Output (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/voice/quickstart.md

This asynchronous Python code demonstrates how to execute the `VoicePipeline` with simulated audio input. It then streams the audio output and plays it back using the `sounddevice` library, showcasing the end-to-end voice processing.

```python
import numpy as np
import sounddevice as sd
from agents.voice import AudioInput

# For simplicity, we'll just create 3 seconds of silence
# In reality, you'd get microphone data
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
```

--------------------------------

### Start Python Server for Realtime Twilio Integration

Source: https://github.com/openai/openai-agents-python/blob/main/examples/realtime/twilio/README.md

This command starts the Python server that handles incoming Twilio phone calls and manages the audio streaming between Twilio and the OpenAI Realtime API. By default, the server listens on port 8000 for connections.

```bash
uv run server.py
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

### Configure RealtimeRunner for the agent in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/quickstart.md

This Python code initializes a `RealtimeRunner` instance, linking it to the previously created agent and providing detailed configuration for the underlying OpenAI model. It specifies model settings like `model_name`, `voice`, audio formats, transcription model, and turn detection parameters for real-time interaction.

```python
runner = RealtimeRunner(
    starting_agent=agent,
    config={
        "model_settings": {
            "model_name": "gpt-realtime",
            "voice": "ash",
            "modalities": ["audio"],
            "input_audio_format": "pcm16",
            "output_audio_format": "pcm16",
            "input_audio_transcription": {"model": "gpt-4o-mini-transcribe"},
            "turn_detection": {"type": "semantic_vad", "interrupt_response": True},
        }
    }
)
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

### Implement a Voice Pipeline Workflow in Python

Source: https://context7.com/openai/openai-agents-python/llms.txt

This code demonstrates how to create a custom workflow class for a VoicePipeline to handle streamed audio input. It shows how to define the workflow's initialization, implement the asynchronous run method, and process events from the pipeline, including transcription and audio output.

```python
# Define a workflow class
class MyWorkflow:
    def __init__(self, secret_word: str, on_start=None):
        self.secret_word = secret_word
        self.on_start = on_start

    async def run(self, audio_input):
        # Process audio and transcription
        # This is a simplified example
        pass

async def main():
    # Create audio input stream
    audio_input = StreamedAudioInput()

    # Create voice pipeline with workflow
    pipeline = VoicePipeline(
        workflow=MyWorkflow(secret_word="hello", on_start=lambda t: print(f"Transcription: {t}"))
    )

    # Run pipeline and stream audio events
    result = await pipeline.run(audio_input)

    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            # Handle audio output (play to speaker, etc.)
            audio_data = event.data
            print(f"Received audio: {len(audio_data)} bytes")
        elif event.type == "voice_stream_event_lifecycle":
            print(f"Lifecycle event: {event.event}")

asyncio.run(main())
```

--------------------------------

### Start RealtimeRunner session and handle events in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/quickstart.md

This asynchronous Python code starts a session with the `RealtimeRunner` and then iterates through incoming events from the agent. It demonstrates how to process various event types, such as `agent_start`, `agent_end`, `tool_start`, `audio`, and `error`, providing real-time feedback on the agent's activity and handling potential issues.

```python
# Start the session
session = await runner.run()

async with session:
    print("Session started! The agent will stream audio responses in real-time.")
    # Process events
    async for event in session:
        try:
            if event.type == "agent_start":
                print(f"Agent started: {event.agent.name}")
            elif event.type == "agent_end":
                print(f"Agent ended: {event.agent.name}")
            elif event.type == "handoff":
                print(f"Handoff from {event.from_agent.name} to {event.to_agent.name}")
            elif event.type == "tool_start":
                print(f"Tool started: {event.tool.name}")
            elif event.type == "tool_end":
                print(f"Tool ended: {event.tool.name}; output: {event.output}")
            elif event.type == "audio_end":
                print("Audio ended")
            elif event.type == "audio":
                # Enqueue audio for callback-based playback with metadata
                # Non-blocking put; queue is unbounded, so drops won’t occur.
                pass
            elif event.type == "audio_interrupted":
                print("Audio interrupted")
                # Begin graceful fade + flush in the audio callback and rebuild jitter buffer.
            elif event.type == "error":
                print(f"Error: {event.error}")
            elif event.type == "history_updated":
                pass  # Skip these frequent events
            elif event.type == "history_added":
                pass  # Skip these frequent events
            elif event.type == "raw_model_event":
                print(f"Raw model event: {_truncate_str(str(event.data), 200)}")
            else:
                print(f"Unknown event type: {event.type}")
        except Exception as e:
            print(f"Error processing event: {_truncate_str(str(e), 200)}")

def _truncate_str(s: str, max_length: int) -> str:
    if len(s) > max_length:
        return s[:max_length] + "..."
    return s
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

### Initialize OpenAI Voice Pipeline with Single Agent Workflow (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/voice/quickstart.md

This Python code initializes a `VoicePipeline` by wrapping a `SingleAgentVoiceWorkflow` around a previously defined `Agent`. This sets up the core component for processing audio input through an agentic workflow.

```python
from agents.voice import SingleAgentVoiceWorkflow, VoicePipeline
pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))
```

--------------------------------

### Configure OpenAI Agents for Tracing with Non-OpenAI Models (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/tracing.md

This Python snippet demonstrates how to enable free tracing for non-OpenAI models within the OpenAI Traces dashboard using the OpenAI Agents SDK. It involves setting the tracing export API key from an environment variable and then initializing an Agent with a `LitellmModel` configured for a specific model and API key. This setup allows tracing data to be sent to the OpenAI backend without requiring the use of OpenAI's own models for the agent's operations.

```python
import os
from agents import set_tracing_export_api_key, Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel

tracing_api_key = os.environ["OPENAI_API_KEY"]
set_tracing_export_api_key(tracing_api_key)

model = LitellmModel(
    model="your-model-name",
    api_key="your-api-key",
)

agent = Agent(
    name="Assistant",
    model=model,
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

### Enable Verbose Stdout Logging in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/config.md

This Python code demonstrates how to enable verbose logging output to `stdout` for the SDK using `enable_verbose_stdout_logging()`. By default, only warnings and errors are logged, but this function allows for more detailed debugging information.

```python
from agents import enable_verbose_stdout_logging

enable_verbose_stdout_logging()
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

### Enable and Disable Tracing for OpenAI Agent Debugging

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python example illustrates how to use the `trace` context manager to monitor OpenAI Agent executions, grouping traces by a conversation ID for easier debugging in the OpenAI dashboard. It also shows how to globally disable tracing when it's not needed. Requires the `agents` library.

```python
import asyncio
import uuid
from agents import Agent, Runner, trace

async def main():
    # Create conversation ID for grouping traces
    conversation_id = str(uuid.uuid4().hex[:16])

    agent = Agent(
        name="Assistant",
        instructions="You are helpful."
    )

    # Wrap execution in trace for monitoring
    with trace("Customer Support Flow", group_id=conversation_id):
        result = await Runner.run(agent, "Help me with my order.")
        print(result.final_output)

    # View trace in OpenAI dashboard
    # https://platform.openai.com/traces

    # Disable tracing if needed
    from agents import set_tracing_disabled
    set_tracing_disabled(disabled=True)

    result = await Runner.run(agent, "Another request.")
    print(result.final_output)

asyncio.run(main())
```
