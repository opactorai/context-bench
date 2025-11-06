# Oneshot Mode Result

**Scenario**: openai-agents:realtime-agent
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:30:51.104Z

---

## Query

Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed).

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "openai-agents",
  "semantic_queries": [
    "Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed)."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: openai-agents (py_pi)
**Queries:**
- Using the OpenAI Agents Python SDK with Realtime API support, start a voice concierge that listens and replies in real time. Use the Realtime model with server-side VAD; just log audio events to stdout (no audio device needed).

**Version:** 0.4.2

**Found 1 relevant code sections**

## Result 1
**File:** `docs/ja/realtime/quickstart.md`
**SHA256:** `ab07865ff0cf6b3957a0bcbc427e2b3b5da76850b7a123bfbc87a4910cb8c606`
**Lines:** 1-114
**Language:** Markdown
```
---
search:
  exclude: true
---
# クイックスタート

リアルタイム エージェントは、OpenAI の Realtime API を使用して AI エージェントとの音声会話を可能にします。このガイドでは、最初のリアルタイム音声エージェントの作成手順を説明します。

!!! warning "ベータ機能"
リアルタイム エージェントはベータ版です。実装を改善する過程で破壊的変更が入る可能性があります。

## 前提条件

-   Python 3.9 以上
-   OpenAI API キー
-   OpenAI Agents SDK の基本的な知識

## インストール

まだの場合は、OpenAI Agents SDK をインストールします:

```bash
pip install openai-agents
```

## 最初のリアルタイム エージェントの作成

### 1. 必要なコンポーネントのインポート

```python
import asyncio
from agents.realtime import RealtimeAgent, RealtimeRunner
```

### 2. リアルタイム エージェントの作成

```python
agent = RealtimeAgent(
    name="Assistant",
    instructions="You are a helpful voice assistant. Keep your responses conversational and friendly.",
)
```

### 3. ランナーのセットアップ

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

### 4. セッションの開始

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

## 完全な例

以下は動作する完全な例です:
```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
