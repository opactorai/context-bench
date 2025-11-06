# uc4_realtime_agent.py
import asyncio
from agents.realtime import RealtimeAgent, RealtimeRunner

async def main():
    agent = RealtimeAgent(
        name="Concierge",
        instructions="Be friendly and brief. Acknowledge user speech and respond conversationally."
    )

    runner = RealtimeRunner(
        starting_agent=agent,
        config={
            "model_settings": {
                "model_name": "gpt-realtime",
                "voice": "ash",
                "modalities": ["audio"],
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "turn_detection": {"type": "semantic_vad", "interrupt_response": True},
            }
        },
    )

    session = await runner.run()
    async with session:
        print("Realtime session started.")
        async for event in session:
            if event.type in ("agent_start", "agent_end", "audio_end", "audio_interrupted"):
                print(f"[{event.type}]")
            elif event.type == "raw_model_event":
                # Useful for debugging model-side streaming messages
                print("[raw_model_event] ...")
            elif event.type == "error":
                print(f"[error] {event.error}")

if __name__ == "__main__":
    asyncio.run(main())
