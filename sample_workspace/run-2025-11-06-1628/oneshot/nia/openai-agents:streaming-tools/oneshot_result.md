# Oneshot Mode Result

**Scenario**: openai-agents:streaming-tools
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:30:41.192Z

---

## Query

Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "openai-agents",
  "semantic_queries": [
    "Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: openai-agents (py_pi)
**Queries:**
- Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user.

**Version:** 0.4.2

**Found 5 relevant code sections**

## Result 1
**File:** `docs/ref/realtime/openai_realtime.md`
**SHA256:** `4736d23c458fbd544bdcd11933ff454d2c1487427fcc2165801fc6151877b2bf`
**Lines:** 1-3
**Language:** Markdown
```
# `Openai Realtime`

::: agents.realtime.openai_realtime

```

## Result 2
**File:** `examples/realtime/twilio/twilio_handler.py`
**SHA256:** `3e9fb3d162223d7dc3b04fa70350ea02dc30910bb9289148f914c017f3b525bc`
**Lines:** 1-39
**Language:** Python
```
from __future__ import annotations

import asyncio
import base64
import json
import os
import time
from datetime import datetime
from typing import Any

from fastapi import WebSocket

from agents import function_tool
from agents.realtime import (
    RealtimeAgent,
    RealtimePlaybackTracker,
    RealtimeRunner,
    RealtimeSession,
    RealtimeSessionEvent,
)


@function_tool
def get_weather(city: str) -> str:
    """Get the weather in a city."""
    return f"The weather in {city} is sunny."


@function_tool
def get_current_time() -> str:
    """Get the current time."""
    return f"The current time is {datetime.now().strftime('%H:%M:%S')}"


agent = RealtimeAgent(
    name="Twilio Assistant",
    instructions="You are a helpful assistant that starts every conversation with a creative greeting. Keep responses concise and friendly since this is a phone conversation.",
    tools=[get_weather, get_current_time],
)
```

## Result 3
**File:** `docs/ref/memory/openai_conversations_session.md`
**SHA256:** `72a2d1fb6c05e701bc12b6e45c7c35ed34dae50fee1b8cf727682d77e15b34f8`
**Lines:** 1-3
**Language:** Markdown
```
# `Openai Conversations Session`

::: agents.memory.openai_conversations_session

```

## Result 4
**File:** `mkdocs.yml`
**SHA256:** `98d0f806abc9af24e6a7c545d3d77e8f9ad57643e27211d7a7b896113e420ed2`
**Lines:** 1-121
**Language:** YAML
```
site_name: OpenAI Agents SDK
theme:
  name: material
  features:
    # Allows copying code blocks
    - content.code.copy
    # Allows selecting code blocks
    - content.code.select
    # Shows the current path in the sidebar
    - navigation.path
    # Shows sections in the sidebar
    - navigation.sections
    # Shows sections expanded by default
    - navigation.expand
    # Enables annotations in code blocks
    - content.code.annotate
  palette:
    primary: black
  logo: assets/logo.svg
  favicon: images/favicon-platform.svg

repo_name: openai-agents-python
repo_url: https://github.com/openai/openai-agents-python

plugins:
  - search
  - mkdocstrings:
      handlers:
        python:
          paths: ["src/agents"]
          selection:
            docstring_style: google
          options:
            # Shows links to other members in signatures
            signature_crossrefs: true
            # Orders members by source order, rather than alphabetical
            members_order: source
            # Puts the signature on a separate line from the member name
            separate_signature: true
            # Shows type annotations in signatures
            show_signature_annotations: true
            # Makes the font sizes nicer
            heading_level: 3
            # Show inherited members
            inherited_members: true
  - i18n:
      docs_structure: folder
      languages:
        - locale: en
          default: true
          name: English
          build: true
          nav:
            - Intro: index.md
            - Quickstart: quickstart.md
            - Examples: examples.md
            - Documentation:
                - agents.md
                - running_agents.md
                - Sessions:
                    - sessions/index.md
                    - sessions/sqlalchemy_session.md
                    - sessions/advanced_sqlite_session.md
                    - sessions/encrypted_session.md
                - results.md
                - streaming.md
                - repl.md
                - tools.md
                - mcp.md
                - handoffs.md
                - tracing.md
                - context.md
                - guardrails.md
                - multi_agent.md
                - usage.md
                - Models:
                    - models/index.md
                    - models/litellm.md
                - config.md
                - visualization.md
                - release.md
                - Voice agents:
                    - voice/quickstart.md
                    - voice/pipeline.md
                    - voice/tracing.md
                - Realtime agents:
                    - realtime/quickstart.md
                    - realtime/guide.md
            - API Reference:
                - Agents:
                    - ref/index.md
                    - ref/agent.md
                    - ref/run.md
                    - ref/memory.md
                    - ref/repl.md
                    - ref/tool.md
                    - ref/tool_context.md
                    - ref/result.md
                    - ref/stream_events.md
                    - ref/handoffs.md
                    - ref/lifecycle.md
                    - ref/items.md
                    - ref/run_context.md
                    - ref/tool_context.md
                    - ref/usage.md
                    - ref/exceptions.md
                    - ref/guardrail.md
                    - ref/model_settings.md
                    - ref/agent_output.md
                    - ref/function_schema.md
                    - ref/models/interface.md
                    - ref/models/openai_chatcompletions.md
                    - ref/models/openai_responses.md
                    - ref/mcp/server.md
                    - ref/mcp/util.md
                - Tracing:
                    - ref/tracing/index.md
                    - ref/tracing/create.md
                    - ref/tracing/traces.md
                    - ref/tracing/spans.md
                    - ref/tracing/processor_interface.md

```

## Result 5
**File:** `.github/ISSUE_TEMPLATE/question.md`
**SHA256:** `9fba10a9fc5e1302774ec9dbbc8e8517954450b6fe6ba5af6724a410d9b9d9e6`
**Lines:** 1-16
**Language:** Markdown
```
---
name: Question
about: Questions about the SDK
title: ''
labels: question
assignees: ''

---

### Please read this first

- **Have you read the docs?**[Agents SDK docs](https://openai.github.io/openai-agents-python/)
- **Have you searched for related issues?** Others may have had similar requests

### Question
Describe your question. Provide details if available.

```


💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
