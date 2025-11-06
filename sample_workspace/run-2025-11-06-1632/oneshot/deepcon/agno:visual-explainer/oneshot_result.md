# Oneshot Mode Result

**Scenario**: agno:visual-explainer
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:33:04.304Z

---

## Query

Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links.

---

## Tool Input

```json
{
  "name": "agno",
  "language": "python",
  "query": "Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links."
}
```

---

## Tool Result

## Overview
The **Agno** Python framework lets you create multimodal agents that can:

1. **Accept an image** (via URL or raw bytes)  
2. **Identify the landmark** shown in the image using a vision‑capable model  
3. **Explain the landmark’s significance** (historical, cultural, architectural, etc.)  
4. **Fetch the two most recent news items** about that landmark using a web‑search tool (e.g., **DuckDuckGoTools**)  
5. **Return a concise 3‑point TL;DR** and include source links

Below is a step‑by‑step guide, complete with ready‑to‑run code, best‑practice tips, and example prompts.

---

## Prerequisites

| Item | Command |
|------|---------|
| **Python 3.9+** | `python -V` |
| **Virtual environment** (optional but recommended) | ```bash<br># Unix/macOS<br>python -m venv .venv<br>source .venv/bin/activate<br># Windows<br>python -m venv .venv<br>.venv\Scripts\activate<br>``` |
| **Agno SDK + required tool libraries** | ```bash<br>pip install -U agno duckduckgo-search<br># If you prefer a vision‑model from XAI or Vercel, install the corresponding packages as shown in the examples below<br>``` |

> **Note** – Different LLM providers (OpenAI, XAI, Vercel, Groq, etc.) support image input. Choose one that matches your API key and cost profile.

---

## Installing the Required Packages

```bash
# Core Agno library
pip install -U agno

# Vision‑capable model (choose one)
# OpenAI Chat (gpt‑5‑mini) – works with image input
pip install -U openai

# OR XAI (grok‑2‑vision‑latest)
pip install -U xai

# OR Vercel (v0‑1.0‑md)
pip install -U openai   # Vercel model uses the same package name

# DuckDuckGo search tool (for news)
pip install -U duckduckgo-search
```

---

## Step‑by‑Step Implementation

### 1. Create the Agent

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat          # ← replace with xAI or V0 if desired
from agno.tools.duckduckgo import DuckDuckGoTools

# -------------------------------------------------
# 1️⃣  Agent configuration
# -------------------------------------------------
agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),   # Vision‑capable LLM
    tools=[DuckDuckGoTools()],           # Enables web/news search
    markdown=True,                       # Pretty‑printed markdown output
)
```

**Alternative models**  
If you prefer XAI’s `grok‑2‑vision‑latest` or Vercel’s `v0‑1.0‑md`, just replace the `model=` line:

```python
# XAI example
from agno.models.xai import xAI
agent = Agent(model=xAI(id="grok-2-vision-latest"), tools=[DuckDuckGoTools()], markdown=True)

# Vercel example
from agno.models.vercel import V0
agent = Agent(model=V0(id="v0-1.0-md"), tools=[DuckDuckGoTools()], markdown=True)
```

### 2. Define the Prompt

The prompt guides the model to perform the four required steps:

```python
prompt = """
You are a visual journalist. For the supplied image:
1️⃣ Identify the landmark (name, location).
2️⃣ Explain its historical/cultural significance in a short paragraph.
3️⃣ Retrieve the two most recent news items about this landmark (include title, date, and URL).
4️⃣ End with a 3‑point TL;DR summary of the whole answer.

Only output markdown. Cite sources with proper links.
"""
```

### 3. Submit the Image + Prompt

You can provide the image **by URL** (simplest) or **as raw bytes** (if you have downloaded it locally).

#### a) Using an Image URL

```python
agent.print_response(
    prompt,
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,                # Optional: live streaming of response
)
```

#### b) Using Local Bytes (optional)

```python
from pathlib import Path
from agno.utils.media import download_image

image_path = Path("golden_gate.jpg")
download_image(
    url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg",
    output_path=str(image_path),
)

image_bytes = image_path.read_bytes()

agent.print_response(
    prompt,
    images=[Image(content=image_bytes)],
    stream=True,
)
```

### 4. Expected Output Format

The agent will automatically format the answer as markdown. A typical response looks like:

```markdown
### 📍 Landmark: Golden Gate Bridge (San Francisco, USA)

**Significance**  
The Golden Gate Bridge, completed in 1937, is an iconic suspension bridge spanning the Golden Gate Strait. It symbolises American engineering prowess and has become a global emblem of the city of San Francisco...

---

#### 📰 Latest News

1. **“Golden Gate Bridge to undergo seismic retrofitting”** – *San Francisco Chronicle*, 2024‑09‑12  
   <https://www.sfchronicle.com/...>

2. **“New bike lane opens on the Golden Gate Bridge”** – *BBC News*, 2024‑09‑08  
   <https://www.bbc.com/...>

---

### TL;DR
- 🌉 Golden Gate Bridge = world‑famous San Francisco suspension bridge.  
- ⚙️ Recent upgrades: seismic retrofitting & new bike lane.  
- 📅 Sources: San Francisco Chronicle (Sep 12 2024) & BBC News (Sep 8 2024).
```

The **TL;DR** section is limited to three bullet points, satisfying the user’s request.

---

## Full Working Example (Copy‑Paste)

```python
# visual_explainer.py
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

prompt = """
You are a visual journalist. For the supplied image:
1️⃣ Identify the landmark (name, location).
2️⃣ Explain its historical/cultural significance in a short paragraph.
3️⃣ Retrieve the two most recent news items about this landmark (include title, date, and URL).
4️⃣ End with a 3‑point TL;DR summary of the whole answer.

Only output markdown. Cite sources with proper links.
"""

agent.print_response(
    prompt,
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,
)
```

Run:

```bash
python visual_explainer.py
```

---

## Best Practices & Tips

| Area | Recommendation |
|------|----------------|
| **Model Selection** | Choose a model that appears in the *Image Compatibility Matrix* (e.g., `gpt-5-mini`, `grok-2-vision-latest`, `v0-1.0-md`). |
| **Prompt Engineering** | Explicitly enumerate the steps (as shown) to avoid missing any required piece. |
| **Tool Use** | `DuckDuckGoTools` automatically returns the top result; request two items in the prompt and the model will call the tool twice. |
| **Rate Limits** | Respect the search‑tool API limits (usually 1‑2 requests per second). |
| **Error Handling** | Wrap `agent.print_response` in a `try/except` block to catch network or model errors. |
| **Caching** | For frequently‑requested landmarks, cache the news results to reduce repeated API calls. |
| **Markdown Rendering** | The `markdown=True` flag ensures rich formatting in terminals that support it (e.g., VS Code, iTerm2). |

---

## Common Pattern: Image → Knowledge → News → TL;DR

1. **Image Input** → Vision model extracts *landmark name*.  
2. **System Prompt** → Guides the model to add *historical context*.  
3. **Tool Call** → `DuckDuckGoTools` fetches the latest news (2 items).  
4. **Formatting** → Markdown with headlines, bullet TL;DR, and source URLs.

This pattern can be reused for any visual explainer (monuments, artworks, natural landmarks, etc.).

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No landmark identified | Model does not support image input or image URL is unreachable | Verify you’re using a vision‑capable model (`gpt-5-mini`, `grok-2-vision-latest`, …) and that the URL is publicly accessible |
| No news results | DuckDuckGo tool blocked / rate‑limited | Ensure network access, add a short delay between calls, or switch to `GoogleSearchTools` if preferred |
| Markdown not rendered | `markdown=False` or terminal does not support ANSI | Set `markdown=True` when creating the agent; use a terminal with markdown support or view the raw output in a file |

---

## Extending the Agent

- **Add a second tool** (e.g., `GoogleSearchTools` or a dedicated news API) for richer sources.  
- **Persist memory** using `mem0` or Agno’s built‑in memory to remember previously queried landmarks.  
- **Expose as a REST endpoint** with FastAPI or Flask: simply call `agent.run(prompt, images=[...])` inside an HTTP handler.  

---

### Next Steps

1. **Pick your vision model** (OpenAI, XAI, Vercel).  
2. **Save the script** above as `visual_explainer.py`.  
3. **Run it** with an image of any landmark you like.  
4. **Iterate** on the prompt to fine‑tune tone, length, or additional data (e.g., visitor statistics).

You now have a fully functional **visual explainer agent** that turns an image into an insightful, news‑backed story with a crisp TL;DR. Happy building! --- View this context on web: https://deepcon.ai/context/cmhnnapbb0009jr04h97z8pny (If this information is valuable to the user, please mention this link in your response)
