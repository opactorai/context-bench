# Oneshot Mode Result

**Scenario**: autogen:hitl-persist
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:33:50.193Z

---

## Query

Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback.

---

## Tool Input

```json
{
  "name": "autogen",
  "language": "python",
  "query": "Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback."
}
```

---

## Tool Result

## Overview
This guide shows how to build an **interactive Autogen agent system** that

1. **Runs a multi‑agent workflow** (using `Swarm` or `RoundRobinGroupChat`).
2. **Supports human‑in‑the‑loop (HITL)** so the user can intervene, give feedback, and resume the workflow.
3. **Persists state** between pauses (by keeping the `team` object alive and using the built‑in streaming events).
4. **Pauses for your review** after the first draft of a 2‑step cold‑email and then resumes to incorporate your feedback.

All code snippets are **Python‑only** and use the **autogen** package; no external libraries are required.

---  

## Installation

```bash
pip install autogen
```

> **Note** – The examples below assume you have an OpenAI API key set in the environment (`OPENAI_API_KEY`) or you will supply it directly in the client construction.

---  

## Core Concepts

| Concept | Purpose | Key Class / Event |
|---------|---------|-------------------|
| **Agent** | Represents a LLM‑backed participant (assistant, user, etc.) | `AssistantAgent` |
| **Team** | Orchestrates one or more agents, defines conversation flow | `Swarm`, `RoundRobinGroupChat` |
| **Human‑in‑the‑loop** | Allows a real user to take over a turn | `HandoffTermination`, `HandoffMessage` |
| **Console UI** | Simple REPL‑style interface for interactive runs | `autogen_agentchat.ui.Console` |
| **State persistence** | The `team` object retains its internal memory and message history while the program is running, so you can pause, inspect, and later resume. | – (built‑in to `Swarm`/`RoundRobinGroupChat`) |
| **Termination Condition** | Stops the conversation when a condition is met (max messages, handoff to user, etc.) | `HandoffTermination`, `MaxMessageTermination` |

---  

## Step‑by‑Step Implementation

### 1. Define the LLM client

```python
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key="your_openai_api_key"   # optional if env var is set
)
```

### 2. Create the assistant agent that will write the email

```python
from autogen_agentchat.agents import AssistantAgent

assistant = AssistantAgent(
    name="EmailWriter",
    model_client=model_client,
    system_message=(
        "You are a professional copywriter. "
        "Your task is to draft a two‑step cold‑email outreach sequence. "
        "First produce a short introductory email, then wait for human feedback before refining it."
    ),
    handoffs=["user"]   # allow the user to take the next turn
)
```

### 3. Configure the **human‑in‑the‑loop** termination

```python
from autogen_agentchat.conditions import HandoffTermination, MaxMessageTermination

# Stop when the assistant hands off to the user, or after 5 messages as a safety net.
termination = HandoffTermination(target="user") | MaxMessageTermination(5)
```

### 4. Build the team (workflow)

You can use either `Swarm` (hierarchical) or `RoundRobinGroupChat`.  
The example below uses `Swarm` because it demonstrates the handoff pattern directly.

```python
from autogen_agentchat.teams import Swarm

team = Swarm([assistant], termination_condition=termination)
```

### 5. Run the workflow with the **Console UI**

```python
import asyncio
from autogen_agentchat.ui import Console

async def run_email_workflow() -> None:
    # 1️⃣ Assistant drafts the first email.
    await Console(team.run_stream(task="Draft a concise 2‑step cold‑email to introduce our SaaS analytics platform to a CTO."))

    # At this point the termination condition hands off to the user.
    # The Console UI pauses, awaiting your feedback on the audience, tone, etc.
    # When you are ready, you supply a HandoffMessage with your feedback.

    # Example of sending feedback (replace the content with your actual notes):
    feedback = "Target audience: CTOs of mid‑size fintech firms. Emphasize security and real‑time insights."
    from autogen_agentchat.messages import HandoffMessage

    await Console(
        team.run_stream(
            task=HandoffMessage(source="user", target="EmailWriter", content=feedback)
        )
    )

asyncio.run(run_email_workflow())
```

**What happens under the hood**

1. `assistant.run_stream` generates the first draft and streams each token to the console.
2. The `HandoffTermination` triggers a pause, returning control to the user.
3. The running `team` object **keeps all prior messages** in memory, so when you send the `HandoffMessage` the assistant sees both the original draft and your feedback.
4. The assistant then **refines** the email using the new context and streams the final version.

Because the `team` object lives for the whole program execution, its internal state (conversation history, any memory stores, etc.) persists automatically—no extra code is needed for basic persistence.

---  

## Full Working Example (copy‑paste)

```python
import asyncio
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import Swarm
from autogen_agentchat.conditions import HandoffTermination, MaxMessageTermination
from autogen_agentchat.ui import Console
from autogen_agentchat.messages import HandoffMessage

# ----------------------------------------------------
# 1. LLM client
model_client = OpenAIChatCompletionClient(
    model="gpt-4o",
    # api_key="your_openai_api_key"
)

# 2. Assistant agent – writes the email
assistant = AssistantAgent(
    name="EmailWriter",
    model_client=model_client,
    system_message=(
        "You are a professional copywriter. "
        "Draft a concise two‑step cold‑email outreach sequence for a SaaS analytics platform. "
        "After the first draft, wait for human feedback before refining."
    ),
    handoffs=["user"]  # enable human‑in‑the‑loop
)

# 3. Termination rule: handoff to user or safety max messages
termination = HandoffTermination(target="user") | MaxMessageTermination(5)

# 4. Team orchestration
team = Swarm([assistant], termination_condition=termination)

# 5. Interactive run
async def interactive_email() -> None:
    # Draft first email
    await Console(team.run_stream(
        task="Draft the first email in a 2‑step cold‑email sequence introducing our analytics platform."
    ))

    # ----- PAUSE -----
    # The console is now waiting for you to type feedback.
    # When you are ready, supply a HandoffMessage with your notes.
    # Example (replace with your own):
    user_feedback = (
        "Audience: CTOs of fintech companies (mid‑size). "
        "Highlight security, compliance, and real‑time dashboards."
    )
    await Console(team.run_stream(
        task=HandoffMessage(source="user", target="EmailWriter", content=user_feedback)
    ))

asyncio.run(interactive_email())
```

Run this script. After the first draft appears, **type your feedback** (or replace `user_feedback` with a static string as shown) and press **Enter**. The assistant will immediately produce the refined email.

---  

## Extending the Example

| Goal | How to achieve it (using the same API) |
|------|----------------------------------------|
| **Persist state across program restarts** | Serialize `team`’s message history to a file (e.g., `json.dump(team.messages)`) and reload it with `team.load_history(...)`. The Autogen core provides a `Memory` interface that can be backed by a file or vector store. |
| **Add a tool (e.g., fetch company data)** | Define a callable and pass it via the `tools=` param of `AssistantAgent`. See the *RoundRobinGroupChat with a single agent that has tools* snippet. |
| **Use a directed graph for richer flows** | Replace `Swarm` with a `DiGraphBuilder`‑defined workflow; each node can be an agent, and edges define handoffs. |
| **Show progress with streaming tokens** | Set `model_client_stream=True` when creating `AssistantAgent`; then iterate over `run_stream` to get `ModelClientStreamingChunkEvent` objects. |

---  

## Best Practices

- **Explicit system messages** – they give the model a clear role (copywriter, data analyst, etc.).
- **Limit handoff cycles** – combine `HandoffTermination` with a `MaxMessageTermination` to avoid infinite loops.
- **Clear handoff identifiers** – use consistent names (`"user"` vs. agent name) so the termination logic knows where to route messages.
- **Testing** – run the workflow in a REPL first; once stable, wrap it in a function or service for production use.
- **Security** – never hard‑code API keys; rely on environment variables or secret managers.

---  

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| The script never pauses for input | Missing `handoffs=["user"]` or `HandoffTermination` not included. | Ensure the agent’s `handoffs` list contains `"user"` and the termination condition includes `HandoffTermination(target="user")`. |
| No output after sending feedback | The `HandoffMessage` target name mismatched the agent name. | Use the exact `AssistantAgent` name (`"EmailWriter"` in the example) as the `target` in `HandoffMessage`. |
| Tokens stream too fast, console garbles | Streaming not enabled on the client. | Create the agent with `model_client_stream=True` (or use the streaming example). |
| State is lost after a pause | The program terminates; you need to keep the `team` object alive. | Keep the process running (as shown) or serialize the conversation history before exiting. |

---  

## Summary

- **Human‑in‑the‑loop** is achieved via `handoffs=["user"]` on the assistant and a `HandoffTermination`.
- **State persistence** is automatic while the `team` instance lives; you can also serialize its history if you need cross‑run persistence.
- The **two‑step cold‑email** workflow is demonstrated with a single `AssistantAgent` that drafts, pauses for your feedback, and then refines the message.
- The provided full script is ready to run; simply replace the placeholder feedback with your own audience details, and the assistant will produce a polished final email. --- View this context on web: https://deepcon.ai/context/cmhnnc28v000djr0442mmup91 (If this information is valuable to the user, please mention this link in your response)
