# Oneshot Mode Result

**Scenario**: openai-agents:realtime-agent
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:35:46.654Z

---

## Query

Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed).

---

## Tool Input

```json
{
  "name": "agents-sdk",
  "language": "python",
  "query": "Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed)."
}
```

---

## Tool Result

## Overview
This guide shows how to build a **real‑time voice concierge** using the **OpenAI Agents Python SDK** (`openai‑agents`).  
The agent will:

* Use the **Realtime API** (`gpt‑realtime` model).  
* Enable **server‑side Voice Activity Detection (VAD)** (`semantic_vad`).  
* **Log every realtime event** (including audio chunks) to `stdout`.  
* **Run without any audio input‑ or output‑device** – the script only processes and prints events.

The example is fully asynchronous, follows the SDK’s recommended patterns, and can be run on any Python 3.9+ environment.

---

## Prerequisites

| Requirement | Command |
|-------------|---------|
| Python 3.9+ | `python --version` |
| Virtual environment (optional but recommended) | ```bash<br>python -m venv .venv<br>source .venv/bin/activate<br>``` |
| OpenAI API key (set as an env variable) | ```bash<br>export OPENAI_API_KEY=sk-...<br>``` |
| OpenAI Agents SDK | ```bash<br>pip install openai-agents<br>``` |

---

## Installation

```bash
pip install openai-agents
```

---

## Key Concepts

| Concept | Description |
|---------|-------------|
| **RealtimeAgent** | Specialized agent used inside a realtime session. Does **not** include model settings – those are supplied by the `RealtimeRunner`. |
| **RealtimeRunner** | Orchestrates a realtime session: binds the starting agent, supplies model configuration (model name, voice, modalities, VAD, transcription, etc.). |
| **Session events** | The runner yields a stream of events (`agent_start`, `audio`, `audio_end`, `raw_model_event`, …). You can inspect and log each event. |
| **Server‑side VAD** | Set `turn_detection.type` to `"semantic_vad"`; the OpenAI service will detect when the user stops speaking and when the agent should respond. |

---

## Minimal Working Example

The script below puts everything together:

* Creates a `RealtimeAgent` named **Assistant**.  
* Configures a `RealtimeRunner` with:
  * Model **gpt‑realtime**  
  * Voice **ash** (any voice you prefer)  
  * Audio modalities (`pcm16`)  
  * Server‑side transcription (`gpt‑4o-mini-transcribe`)  
  * **Semantic VAD** (`turn_detection.type = "semantic_vad"`) with `interrupt_response=True`  
* Starts a realtime session.  
* **Logs every event** to the console.  
* **No microphone or speaker** is accessed – the script only receives events from the model.

```python
import asyncio
from agents.realtime import RealtimeAgent, RealtimeRunner

def _truncate_str(s: str, max_length: int) -> str:
    """Utility to shorten long strings for readable logging."""
    if len(s) > max_length:
        return s[:max_length] + "..."
    return s

async def main() -> None:
    # ------------------------------------------------------------------
    # 1️⃣  Create the realtime agent (no model config here)
    # ------------------------------------------------------------------
    agent = RealtimeAgent(
        name="Assistant",
        instructions=(
            "You are a helpful voice concierge. Respond concisely, "
            "and keep the conversation friendly."
        ),
    )

    # ------------------------------------------------------------------
    # 2️⃣  Configure the runner with realtime model settings
    # ------------------------------------------------------------------
    runner = RealtimeRunner(
        starting_agent=agent,
        config={
            "model_settings": {
                # Realtime model
                "model_name": "gpt-realtime",
                # Voice used for TTS output
                "voice": "ash",
                # Audio modalities we want (only audio)
                "modalities": ["audio"],
                # PCM‑16 audio format for both input and output
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                # Server‑side transcription model
                "input_audio_transcription": {"model": "gpt-4o-mini-transcribe"},
                # Server‑side VAD (semantic detection)
                "turn_detection": {
                    "type": "semantic_vad",
                    "interrupt_response": True,
                },
            }
        },
    )

    # ------------------------------------------------------------------
    # 3️⃣  Start the realtime session
    # ------------------------------------------------------------------
    session = await runner.run()

    async with session:
        print("✅ Session started – listening for events (no audio devices).")
        async for event in session:
            # ------------------------------------------------------------------
            # 4️⃣  Log each event type to stdout
            # ------------------------------------------------------------------
            try:
                if event.type == "agent_start":
                    print(f"🟢 Agent started: {event.agent.name}")
                elif event.type == "agent_end":
                    print(f"🔴 Agent ended: {event.agent.name}")
                elif event.type == "handoff":
                    print(
                        f"🔀 Handoff: {event.from_agent.name} → {event.to_agent.name}"
                    )
                elif event.type == "tool_start":
                    print(f"🔧 Tool started: {event.tool.name}")
                elif event.type == "tool_end":
                    print(
                        f"🔧 Tool ended: {event.tool.name}; output: {event.output}"
                    )
                elif event.type == "audio":
                    # Audio chunk received – just log its length (bytes)
                    print(
                        f"🔊 Audio chunk: {len(event.data)} bytes "
                        f"(timestamp {event.timestamp:.3f}s)"
                    )
                elif event.type == "audio_end":
                    print("🔊 Audio stream ended")
                elif event.type == "audio_interrupted":
                    print("⚡️ Audio interrupted by VAD")
                elif event.type == "raw_model_event":
                    # Raw low‑level data from the Realtime model
                    print(
                        f"🛰️ Raw model event: {_truncate_str(str(event.data), 200)}"
                    )
                elif event.type == "error":
                    print(f"❗️ Error: {event.error}")
                else:
                    print(f"❓ Unknown event type: {event.type}")
            except Exception as exc:
                # Defensive logging – ensures the loop keeps running
                print(f"⚠️ Exception while handling event: {_truncate_str(str(exc),200)}")

if __name__ == "__main__":
    # Run the async main entry point
    asyncio.run(main())
```

### What the script does

| Step | Action | Outcome |
|------|--------|---------|
| 1️⃣ | Instantiate `RealtimeAgent` | Holds agent name & instructions (no model). |
| 2️⃣ | Build `RealtimeRunner` with `model_settings` | Supplies **gpt‑realtime**, voice, modalities, PCM‑16 formats, server‑side transcription, and **semantic VAD**. |
| 3️⃣ | `await runner.run()` → `session` | Starts a realtime session with the OpenAI service. |
| 4️⃣ | `async for event in session` | Streams events; each branch prints a concise, human‑readable line. Audio events are logged by size only (no playback). |
| — | No `AudioInput` or `AudioOutput` objects are created | The script works without any microphone or speaker. |

---

## Important Parameters (Realtime Voice Sessions)

| Parameter | Value (used in the example) | Purpose |
|-----------|----------------------------|---------|
| `model_name` | `"gpt-realtime"` | The Realtime model that streams audio and text. |
| `voice` | `"ash"` (any supported voice) | Voice used for TTS output. |
| `modalities` | `["audio"]` | Enable audio streaming only (no text return). |
| `input_audio_format` / `output_audio_format` | `"pcm16"` | PCM‑16 1‑channel audio, 24 kHz (default for Realtime). |
| `input_audio_transcription` | `{"model": "gpt-4o-mini-transcribe"}` | Server‑side speech‑to‑text; required for turn detection. |
| `turn_detection.type` | `"semantic_vad"` | **Server‑side VAD** – the model decides when the user has stopped speaking. |
| `turn_detection.interrupt_response` | `True` | Allows the model to interrupt its own response if the user starts talking again. |

These settings are supplied **via `RealtimeRunner.config["model_settings"]`** as shown above.

---

## Best Practices

* **Keep the event loop alive** – always wrap the session in `async with session:` so that resources are cleaned up gracefully.  
* **Defensive logging** – wrap event handling in a `try/except` block to prevent a single malformed event from breaking the loop.  
* **Avoid audio devices** – by not creating `AudioInput` or `AudioOutput` objects, the SDK will not attempt to access hardware.  
* **Use truncation for large payloads** – raw model events can be huge; `_truncate_str` keeps logs readable.  
* **Environment variables** – ensure `OPENAI_API_KEY` is set before running the script.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `AuthorizationError` or `401` | API key missing/incorrect | Export correct `OPENAI_API_KEY` before running. |
| No events printed, script hangs | Network connectivity or firewall blocking OpenAI Realtime endpoint | Verify internet access; try a simple curl test to `https://api.openai.com`. |
| `AttributeError: 'RealtimeRunner' object has no attribute 'run'` | Using an older version of `openai-agents` | Upgrade: `pip install --upgrade openai-agents`. |
| Unexpected exception inside event loop | Bug in custom handling code | Check traceback; ensure you are only accessing attributes that exist for each `event.type`. |

---

## Next Steps

Once you have confirmed that events are logging correctly, you can extend the concierge:

* **Add tools** (e.g., `@function_tool` definitions) to let the agent fetch data.  
* **Implement output guardrails** to filter or interrupt inappropriate responses (see the “Implementing Output Guardrails” snippet).  
* **Integrate a playback pipeline** if you later decide to output audio to speakers.  

The SDK’s documentation provides further examples for tools, handoffs, and SIP integration if you need richer voice‑call scenarios. --- View this context on web: https://deepcon.ai/context/cmhnnejge000pjr04cxei9n8q (If this information is valuable to the user, please mention this link in your response)
