# Oneshot Mode Result

**Scenario**: openai-agents:realtime-agent
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:57:02.699Z

---

## Query

Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed).

---

## Tool Input

```json
{
  "query": "Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed)."
}
```

---

## Tool Result

## How to use OpenAI’s “Realtime API” with Python

https://medium.com/@sebasfernandezgar/how-to-use-openais-realtime-api-with-python-code-896ea5c23583

```
import asyncioimport websocketsimport jsonimport pyaudioimport base64import loggingimport osimport sslimport threadingimport timefrom dotenv import load_dotenvload_dotenv()logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')logger = logging.getLogger(__name__)TOPIC = "Tema del que quieres hablar con el asistente"INSTRUCTIONS = f"""Eres Patricia, una mujer española madrileña amable y simpática. Eres una asistente en ventas y debes tratar de convencer al cliente que compre el producto {TOPIC}"""KEYBOARD_COMMANDS = """q: Quitt: Send text messagea: Send audio message"""class AudioHandler: """ Handles audio input and output using PyAudio. """ def __init__(self): self.p = pyaudio.PyAudio() self.stream = None self.audio_buffer = b'' self.chunk_size = 1024 # Number of audio frames per buffer self.format = pyaudio.paInt16 # Audio format (16-bit PCM) self.channels = 1 # Mono audio self.rate = 24000 # Sampling rate in Hz self.is_recording = False # List audio input devices logger.debug("Available audio input devices:") for i in range(self.p.get_device_count()): device_info = self.p.get_device_info_by_index(i) if device_info['maxInputChannels'] > 0: logger.debug(f"Input Device ID {i} - {device_info['name']}") def start_audio_stream(self, input_device_index=None): """ Start the audio input stream. """ try: self.stream = self.p.open( format=self.format, channels=self.channels, rate=self.rate, input=True, frames_per_buffer=self.chunk_size, input_device_index=input_device_index ) logger.debug("Audio input stream started") except Exception as e: logger.error(f"Failed to open audio input stream: {e}") self.stream = None def stop_audio_stream(self): """ Stop the audio input stream. """ if self.stream: self.stream.stop_stream() self.stream.close() logger.debug("Audio input stream stopped") self.stream = None def cleanup(self): """ Clean up resources by stopping the stream and terminating PyAudio. """ if self.stream: self.stop_audio_stream() self.p.terminate() logger.debug("PyAudio terminated") def start_recording(self): """Start continuous recording""" self.is_recording = True self.audio_buffer = b'' self.start_audio_stream() def stop_recording(self): """Stop recording and return the recorded audio""" self.is_recording = False self.stop_audio_stream() return self.audio_buffer def record_chunk(self): """Record a single chunk of audio""" if self.stream and self.is_recording: try: data = self.stream.read( self.chunk_size, exception_on_overflow=False # Okay to exceed buffer ) self.audio_buffer += data return data except Exception as e: logger.error(f"Error reading audio chunk: {e}") return None else: logger.debug("Stream is not active or recording has stopped") return None def play_audio(self, audio_data): """ Play audio data. :param audio_data: Received audio data (AI response) """ def play(): try: stream = self.p.open( format=self.format, channels=self.channels, rate=self.rate, output=True ) stream.write(audio_data) stream.stop_stream() stream.close() except Exception as e: logger.error(f"Error playing audio: {e}") logger.debug("Playing audio") # Use a separate thread for playback to avoid blocking playback_thread = threading.Thread(target=play) playback_thread.start()class RealtimeClient: """ Client for interacting with the OpenAI Realtime API via WebSocket. Possible events: https://platform.openai.com/docs/api-reference/realtime-client-events """ def __init__(self, instructions, voice="alloy"): # WebSocket Configuration self.url = "wss://api.openai.com/v1/realtime" # WebSocket URL self.model = "gpt-4o-realtime-preview-2024-10-01" self.api_key = os.getenv("OPENAI_API_KEY") self.ws = None self.audio_handler = AudioHandler() # SSL Configuration (skipping certificate verification) self.ssl_context = ssl.create_default_context() self.ssl_context.check_hostname = False self.ssl_context.verify_mode = ssl.CERT_NONE self.audio_buffer = b'' # Buffer for streaming audio responses self.instructions = instructions self.voice = voice # VAD mode (set to None to disable server-side VAD) self.session_config = { "modalities": ["audio", "text"], "instructions": self.instructions, "voice": self.voice, "input_audio_format": "pcm16", "output_audio_format": "pcm16", "turn_detection": None, "input_audio_transcription": { "model": "whisper-1" }, "temperature": 0.6 } async def connect(self): """ Connect to the WebSocket server. """ logger.info(f"Connecting to WebSocket: {self.url}") headers = { "Authorization": f"Bearer {self.api_key}", "OpenAI-Beta": "realtime=v1" } # NEEDS websockets version < 14.0 self.ws = await websockets.connect( f"{self.url}?model={self.model}", extra_headers=headers, ssl=self.ssl_context ) logger.info("Successfully connected to OpenAI Realtime API") # Configure session await self.send_event( { "type": "session.update", "session": self.session_config } ) logger.info("Session set up") # Send a response.create event to initiate the conversation await self.send_event({"type": "response.create"}) logger.debug("Sent response.create to initiate conversation") async def send_event(self, event): """ Send an event to the WebSocket server. :param event: Event data to send (from the user) """ await self.ws.send(json.dumps(event)) logger.debug(f"Event sent - type: {event['type']}") async def receive_events(self): """ Continuously receive events from the WebSocket server. """ try: async for message in self.ws: event = json.loads(message) await self.handle_event(event) except websockets.ConnectionClosed as e: logger.error(f"WebSocket connection closed: {e}") except Exception as e: logger.error(f"An unexpected error occurred: {e}") async def handle_event(self, event): """ Handle incoming events from the WebSocket server. Possible events: https://platform.openai.com/docs/api-reference/realtime-server-events :param event: Event data received (from the server). """ event_type = event.get("type") logger.debug(f"Received event type: {event_type}") if event_type == "error": logger.error(f"Error event received: {event['error']['message']}") elif event_type == "response.text.delta": # Print text response incrementally print(event["delta"], end="", flush=True) elif event_type == "response.audio.delta": # Append audio data to buffer audio_data = base64.b64decode(event["delta"]) self.audio_buffer += audio_data logger.debug("Audio data appended to buffer") elif event_type == "response.audio.done": # Play the complete audio response if self.audio_buffer: self.audio_handler.play_audio(self.audio_buffer) logger.info("Done playing audio response") self.audio_buffer = b'' else: logger.warning("No audio data to play") elif event_type == "response.done": logger.debug("Response generation completed") elif event_type == "conversation.item.created": logger.debug(f"Conversation item created: {event.get('item')}") elif event_type == "input_audio_buffer.speech_started": logger.debug("Speech started detected by server VAD") elif event_type == "input_audio_buffer.speech_stopped": logger.debug("Speech stopped detected by server VAD") else: logger.debug(f"Unhandled event type: {event_type}") async def send_text(self, text): """ Send a text message to the WebSocket server. :param text: Text message to send. """ logger.info(f"Sending text message: {text}") event = { "type": "conversation.item.create", "item": { "type": "message", "role": "user", "content": [{ "type": "input_text", "text": text }] } } await self.send_event(event) await self.send_event({"type": "response.create"}) logger.debug(f"Sent text: {text}") async def send_audio(self): """ Record and send audio using manual turn detection. """ logger.info("Starting audio recording. Press Enter to stop recording.") self.audio_handler.start_recording() stop_recording = False async def wait_for_enter(): nonlocal stop_recording await asyncio.get_event_loop().run_in_executor(None, input) stop_recording = True try: # Start the input listener enter_task = asyncio.create_task(wait_for_enter()) while not stop_recording: chunk = self.audio_handler.record_chunk() if chunk: # Encode and send audio chunk base64_chunk = base64.b64encode(chunk).decode('utf-8') await self.send_event({ "type": "input_audio_buffer.append", "audio": base64_chunk }) await asyncio.sleep(0.01) else: break # Wait for enter_task to complete await enter_task except Exception as e: logger.error(f"Error during audio recording: {e}") self.audio_handler.stop_recording() logger.debug("Audio recording stopped") finally: # Stop recording even if an exception occurs self.audio_handler.stop_recording() logger.debug("Audio recording stopped") # Commit the audio buffer and send response.create # Must commit the buffer manually when not using server-side VAD await self.send_event({"type": "input_audio_buffer.commit"}) logger.debug("Audio buffer committed") await self.send_event({"type": "response.create"}) logger.debug("Sent response.create after committing audio buffer") async def run(self): """ Main loop to handle user input and interact with the WebSocket server. """ await self.connect() # Continuously listen to events in the background receive_task = asyncio.create_task(self.receive_events()) try: while True: # Get user command input command = await asyncio.get_event_loop().run_in_executor( None, input, KEYBOARD_COMMANDS ) if command == 'q': logger.info("Quit command received") break elif command == 't': # Get text input from user text = await asyncio.get_event_loop().run_in_executor( None, input, "Enter TEXT message: " ) await self.send_text(text) elif command == 'a': # Record and send audio await self.send_audio() await asyncio.sleep(0.1) except Exception as e: logger.error(f"An error occurred: {e}") finally: receive_task.cancel() await self.cleanup() async def cleanup(self): """ Clean up resources by closing the WebSocket and audio handler. """ self.audio_handler.cleanup() if self.ws: await self.ws.close()async def main(): client = RealtimeClient( instructions=INSTRUCTIONS, voice="ash" ) try: await client.run() except Exception as e: logger.error(f"An error occurred in main: {e}") finally: logger.info("Main done")if __name__ == "__main__": asyncio.run(main())
```

## Setup RealtimeRunner with GPT-4o and Alloy Voice

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/realtime/quickstart.md

```
runner = RealtimeRunner(
    starting_agent=agent,
    config={
        "model_settings": {
            "model_name": "gpt-4o-realtime-preview",
            "voice": "alloy",
            "modalities": ["text", "audio"],
        }
    }
)
```

## Stream Voice Events with Pipeline.run() in Async Context

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/voice/pipeline.md

```
result = await pipeline.run(input)

async for event in result.stream():
    if event.type == "voice_stream_event_audio":
        # play audio
    elif event.type == "voice_stream_event_lifecycle":
        # lifecycle
    elif event.type == "voice_stream_event_error"
        # error
    ...
```

## Async EntryPoint for LiveKit Voice AI Agent

https://raw.githubusercontent.com/livekit/agents/main/livekit-agents/README.md

```
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import openai

load_dotenv()

async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    session = AgentSession(
        llm=openai.realtime.RealtimeModel(
            voice="coral"
        )
    )

    await session.start(
        room=ctx.room,
        agent=Agent(instructions="You are a helpful voice AI assistant.")
    )

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
```

## bash Result 1

https://raw.githubusercontent.com/mbailey/voicemode/main/docs/integrations/vscode/README.md

```
# Required
export OPENAI_API_KEY="your-key"

# Optional - Custom STT/TTS endpoints (comma-separated lists)
export VOICEMODE_TTS_BASE_URLS="http://127.0.0.1:8880/v1,https://api.openai.com/v1"
export VOICEMODE_STT_BASE_URLS="http://127.0.0.1:2022/v1,https://api.openai.com/v1"

# Optional - Voice preferences (comma-separated lists)
export VOICEMODE_TTS_VOICES="af_sky,nova,alloy"
export VOICEMODE_TTS_MODELS="gpt-4o-mini-tts,tts-1-hd,tts-1"
```

## OpenAIRealtimeWebSocket Implementation for GPT-4 Streaming

https://raw.githubusercontent.com/openai/openai-node/main/README.md

```
import { OpenAIRealtimeWebSocket } from 'openai/beta/realtime/websocket';

const rt = new OpenAIRealtimeWebSocket({ model: 'gpt-4o-realtime-preview-2024-12-17' });

rt.on('response.text.delta', (event) => process.stdout.write(event.delta));
```

## Quickstart - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/realtime/quickstart/

```
session=await runner.run(model_config={"api_key":"your-api-key" })
```

## Stream Speech Synthesis with OpenAI TTS

https://raw.githubusercontent.com/haydenbleasel/orate/main/website/content/docs/providers/openai.mdx

```
const speech = await speak({
  model: new OpenAI().tts(),
  prompt: 'Hello, world!',
  stream: true,
});
```

## start_session function initializes GeminiRealtime model

https://raw.githubusercontent.com/videosdk-live/agents/main/README.md

```
from videosdk.plugins.google import GeminiRealtime, GeminiLiveConfig
from videosdk.agents import RealTimePipeline, JobContext

async def start_session(context: JobContext):
    # Initialize the AI model
    model = GeminiRealtime(
        model="gemini-2.0-flash-live-001",
        # When GOOGLE_API_KEY is set in .env - DON'T pass api_key parameter
        api_key="AKZSXXXXXXXXXXXXXXXXXXXX",
        config=GeminiLiveConfig(
            voice="Leda", # Puck, Charon, Kore, Fenrir, Aoede, Leda, Orus, and Zephyr.
            response_modalities=["AUDIO"]
        )
    )

    pipeline = RealTimePipeline(model=model)

    # Continue to the next steps...
```

## GitHub - jhakulin/realtime-ai: Experimental Python SDK for OpenAI's Realtime API

https://github.com/jhakulin/realtime-ai

```
pip install azure-cognitiveservices-speech
```

## Setup Voice Activity Detection with ONNX and VAD in JavaScript

https://raw.githubusercontent.com/gradio-app/gradio/main/guides/07_streaming/06_automatic-voice-detection.md

```
async function main() {
  const script1 = document.createElement("script");
  script1.src = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.js";
  document.head.appendChild(script1)
  const script2 = document.createElement("script");
  script2.onload = async () =>  {
    console.log("vad loaded");
    var record = document.querySelector('.record-button');
    record.textContent = "Just Start Talking!"
    
    const myvad = await vad.MicVAD.new({
      onSpeechStart: () => {
        var record = document.querySelector('.record-button');
        var player = document.querySelector('#streaming-out')
        if (record != null && (player == null || player.paused)) {
          record.click();
        }
      },
      onSpeechEnd: (audio) => {
        var stop = document.querySelector('.stop-button');
        if (stop != null) {
          stop.click();
        }
      }
    })
    myvad.start()
  }
  script2.src = "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js";
}
```

## Building an AI Phone Agent with Twilio and OpenAI’s Realtime API(Python)

https://medium.com/@alozie_igbokwe/building-an-ai-phone-agent-with-twilio-and-openais-realtime-api-python-bc2f9a8df065

```
response_start_timestamp_twilio is not None
```

## python Result 1

https://raw.githubusercontent.com/basetenlabs/truss-examples/main/ultravox/README.md

```
from openai import OpenAI

client = OpenAI(
    api_key="YOUR-API-KEY",
    base_url="https://bridge.baseten.co/MODEL-ID/v1"
)

response = client.chat.completions.create(
    model="fixie-ai/ultravox-v0.2",
    messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": "Summarize the following: <|audio|>"},
                {"type": "image_url", "image_url": {"url": f"data:audio/wav;base64,{base64_wav}"}}
            ]
        }]
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta)
```

## MyVoiceAgent Class with OpenAI Integration for Real-Time Interaction

https://raw.githubusercontent.com/videosdk-live/agents/main/videosdk-agents/README.md

```
import asyncio
from videosdk.agents import Agent, AgentSession, RealTimePipeline, function_tool, WorkerJob, RoomOptions, JobContext
from videosdk.plugins.openai import OpenAIRealtime, OpenAIRealtimeConfig
from openai.types.beta.realtime.session import InputAudioTranscription, TurnDetection


class MyVoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are a helpful voice assistant that can answer questions and help with tasks.",
        )

    async def on_enter(self) -> None:
        await self.session.say("How can i assist you today?")

async def entrypoint(ctx: JobContext):
    print("Starting connection test...")
    print(f"Job context: {jobctx}")
    
    model = OpenAIRealtime(
        model="gpt-4o-realtime-preview",
        config=OpenAIRealtimeConfig( modalities=["text", "audio"] )
    )
    pipeline = RealTimePipeline(model=model)
    session = AgentSession(
        agent=MyVoiceAgent(), 
        pipeline=pipeline,
        context=jobctx
    )

    try:
        await ctx.connect()
        await session.start()
        print("Connection established. Press Ctrl+C to exit.")
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        print("\nShutting down gracefully...")
    finally:
        await session.close()
        await ctx.shutdown()


def make_context() -> JobContext:
    room_options = RoomOptions(room_id="<meeting_id>", name="Sandbox Agent", playground=True)
    
    return JobContext(
        room_options=room_options
        )


if __name__ == "__main__":
    job = WorkerJob(job_func=entryPoint, jobctx=make_context)
    job.start()
```

## Run Rasa Voice Interface with npm script

https://raw.githubusercontent.com/RasaHQ/rasa-voice-interface/main/README.md

```
npm run serve
```

## OpenAI Realtime API Quickstart guide | Agora Docs

https://docs.agora.io/en/open-ai-integration/get-started/quickstart

```
_5
 curl 'http://localhost:8080/stop_agent' \
 _5
 -H 'Content-Type: application/json' \
 _5
 --data-raw '{
 _5
 "channel_name": "test"
 _5
 }'
```

## bash Result 1

https://raw.githubusercontent.com/mbailey/voicemode/main/docs/migration-guide.md

```
# Required
export OPENAI_API_KEY="your-openai-key"

# Optional - Debug and audio saving
export VOICEMODE_DEBUG=true
export VOICEMODE_SAVE_AUDIO=true

# Optional - Audio format (defaults to pcm)
export VOICEMODE_AUDIO_FORMAT=pcm
export VOICEMODE_OPUS_BITRATE=32000

# Optional - Provider preferences
export VOICEMODE_PREFER_LOCAL=true
export VOICEMODE_AUTO_START_KOKORO=true

# Optional - Emotional TTS
export VOICEMODE_ALLOW_EMOTIONS=true
```

## Building Voice Agents With OpenAI Agent SDK

https://neurlcreators.substack.com/p/building-voice-agents-with-openai

```
Press 'K' to start/stop recording, 'Q' to quit.
```

## Load ONNX ASR Model and Recognize Audio with VAD

https://raw.githubusercontent.com/istupakov/onnx-asr/main/README.md

```
onnx-asr -h
```

## Integrates Realtime API with OpenAI GPT-4 Model

https://raw.githubusercontent.com/steipete/Tachikoma/main/docs/openai-harmony.md

```
// Existing API continues unchanged
let response = try await generateText(model: .openai(.gpt4o), messages: messages)

// New Realtime API alongside
let conversation = try await startRealtimeConversation(model: .openai(.gpt4oRealtime))
```
