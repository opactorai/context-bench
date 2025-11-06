# Oneshot Mode Result

**Scenario**: autogen:team-termination
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:33:39.119Z

---

## Query

Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically.

---

## Tool Input

```json
{
  "name": "autogen",
  "language": "python",
  "query": "Using the Autogen Python library with teams and termination conditions, build a multi-agent system. Draft a 6-line product tagline for a sustainable water bottle. A critic must review and APPROVE; otherwise iterate. If we exceed a small turn budget, stop automatically."
}
```

---

## Tool Result

## Overview
This guide shows how to use **Autogen Python** to create a **multi‑agent system** that:

1. **Generates** a 6‑line product tagline for a sustainable water bottle.  
2. **Routes** the draft to a **Critic** agent for review.  
3. **Repeats** the generate‑review cycle until the critic **APPROVES** the tagline.  
4. **Stops automatically** when a **turn‑budget** (maximum number of messages) is exceeded.

The pattern is built with:

| Component | Role |
|-----------|------|
| `AssistantAgent` (Writer) | Writes the tagline. |
| `AssistantAgent` (Critic) | Reviews the draft and either **APPROVE**s or asks for revisions. |
| `RoundRobinGroupChat` | Orchestrates turn‑taking between Writer and Critic. |
| `MaxMessageTermination` | Enforces a small turn budget (e.g., 8 messages). |
| `Console` UI | Streams the conversation in the terminal (optional). |

---

## Installation
> **Prerequisite:** Python 3.9‑3.12 and an OpenAI API key (or another supported model).

```bash
pip install autogen-agentchat autogen-ext
```

---

## Core Concepts

### Teams & Round‑Robin Group Chat
`RoundRobinGroupChat` lets a list of agents speak in a fixed order until a termination condition becomes true.

```python
from autogen_agentchat.teams import RoundRobinGroupChat
```

### Termination Conditions
* **`MaxMessageTermination`** – stops after a given number of messages (used as a turn‑budget).  
* **`TextMentionTermination`** – can also be used for explicit “TERMINATE” cues.

```python
from autogen_agentchat.conditions import MaxMessageTermination
```

### Critic‑Approval Pattern
The Critic agent checks the Writer’s output for the keyword **`APPROVE`**. If the keyword is missing, the Critic asks for a rewrite, causing the loop to continue.

---

## Quick‑Start Example

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import MaxMessageTermination
from autogen_agentchat.ui import Console

async def main() -> None:
    # ------------------------------------------------------------------
    # 1️⃣ Model client (shared by all agents)
    # ------------------------------------------------------------------
    model_client = OpenAIChatCompletionClient(model="gpt-4o")

    # ------------------------------------------------------------------
    # 2️⃣ Writer – creates a 6‑line tagline
    # ------------------------------------------------------------------
    writer = AssistantAgent(
        name="writer",
        model_client=model_client,
        system_message=(
            "You are a creative copywriter. Write a **six‑line** product tagline "
            "for a sustainable water bottle. End the draft with the word "
            "`APPROVE` **only if the tagline meets all requirements**."
        ),
        model_client_stream=True,
    )

    # ------------------------------------------------------------------
    # 3️⃣ Critic – reviews the draft and decides whether to approve
    # ------------------------------------------------------------------
    critic = AssistantAgent(
        name="critic",
        model_client=model_client,
        system_message=(
            "You are a critical reviewer. Read the writer's six‑line tagline. "
            "If it satisfies the brief, respond with the single word `APPROVE`. "
            "Otherwise, give constructive feedback and ask the writer to try again."
        ),
        model_client_stream=True,
    )

    # ------------------------------------------------------------------
    # 4️⃣ Termination – stop after a small turn budget (e.g., 8 messages)
    # ------------------------------------------------------------------
    termination = MaxMessageTermination(max_messages=8)

    # ------------------------------------------------------------------
    # 5️⃣ Team – round‑robin between writer and critic
    # ------------------------------------------------------------------
    team = RoundRobinGroupChat(
        agents=[writer, critic],
        termination_condition=termination,
    )

    # ------------------------------------------------------------------
    # 6️⃣ Run the conversation (Console UI streams output)
    # ------------------------------------------------------------------
    await Console(team.run_stream(task="Generate the tagline."))

if __name__ == "__main__":
    asyncio.run(main())
```

### How It Works
| Step | Action |
|------|--------|
| **1** | The `writer` receives the task and outputs a six‑line draft **ending with `APPROVE`** only when it believes the tagline is final. |
| **2** | The `critic` reads the draft. If it finds `APPROVE`, it replies with `APPROVE` → the termination condition is satisfied and the loop ends. |
| **3** | If the critic does **not** see `APPROVE`, it returns feedback; the writer receives that feedback on the next turn and rewrites. |
| **4** | `MaxMessageTermination` aborts the whole process after the configured number of messages (here 8) to avoid endless loops. |

---

## Full Tagline Example (Result)

When the above script runs, a possible successful conversation looks like:

```
Writer: 1️⃣ Purely recycled, 100 % ocean‑friendly.  
Writer: 2️⃣ Zero‑plastic, zero‑waste – sip sustainably.  
Writer: 3️⃣ Designed for the trail, built for the tide.  
Writer: 4️⃣ Keeps your drink pure, your conscience clearer.  
Writer: 5️⃣ Refillable forever, a bottle you can trust.  
Writer: 6️⃣ Join the wave of change – APPROVE
Critic: APPROVE
```

The six lines constitute the **product tagline**, and the critic’s `APPROVE` ends the loop.

---

## Best Practices

| Practice | Reason |
|----------|--------|
| **Share a single `model_client`** among agents when possible – reduces token‑usage and latency. |
| **Keep the system messages concise** – they guide each role without overwhelming the model. |
| **Set a modest `max_messages`** (e.g., 8‑12) to guarantee termination even if the critic never approves. |
| **Use `model_client_stream=True`** for a responsive UI and lower memory footprint. |
| **Explicit termination cue (`APPROVE`)** makes the critic’s decision deterministic and easy to detect. |

---

## Common Patterns & Extensions

* **Nested Teams** – you can embed the writer‑critic pair inside a larger `RoundRobinGroupChat` that also includes a `UserProxyAgent` for human‑in‑the‑loop control (see the “Nested team with a user proxy” example in the source).  
* **Tool Integration** – wrap the writer‑critic pair in a `TeamTool` to let a higher‑level agent invoke the whole workflow as a single tool call.  
* **Alternative Terminations** – replace `MaxMessageTermination` with `TokenUsageTermination` or `StopMessageTermination` if you prefer token‑budget or explicit stop‑message triggers.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **No `APPROVE` ever appears** | Verify that the writer’s system message explicitly instructs it to end with `APPROVE`. |
| **Conversation exceeds turn budget** | Increase `max_messages` or add a second termination condition (e.g., `TokenUsageTermination`). |
| **Critic replies with extra text** | Tighten the critic’s system prompt to require a **single word** response (`APPROVE` or feedback). |
| **Agents get stuck in a loop** | Add a fallback termination like `TextMentionTermination("TERMINATE")` and let the critic emit `TERMINATE` after a certain number of retries. |

---

## Summary
By combining **`AssistantAgent`**, **`RoundRobinGroupChat`**, and **`MaxMessageTermination`**, you can implement a robust generate‑review‑approve workflow for tagline creation (or any iterative content task). The pattern guarantees that:

* The writer produces a **six‑line** tagline.  
* The critic **approves** or requests revisions.  
* The loop iterates automatically **until approval** or the **turn‑budget** is reached.  

This example can be adapted to other domains (marketing copy, code reviews, design specs) by simply swapping system messages and adjusting the termination budget. --- View this context on web: https://deepcon.ai/context/cmhnnbug1000bjr04f6ty9nbp (If this information is valuable to the user, please mention this link in your response)
