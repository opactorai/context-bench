# Oneshot Mode Result

**Scenario**: agno:visual-explainer
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:39.935Z

---

## Query

Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "agno",
  "semantic_queries": [
    "Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: agno (py_pi)
**Queries:**
- Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links.

**Version:** 2.2.6

**Found 5 relevant code sections**

## Result 1
**File:** `cookbook/getting_started/13_image_agent.py`
**SHA256:** `77b2f2554ffd7bbb8a8fae07a4c2ed997c0b0f82a4a751cc9871a052bae3083b`
**Lines:** 1-101
**Language:** Python
```
"""🎨 AI Image Reporter - Your Visual Analysis & News Companion!

This example shows how to create an AI agent that can analyze images and connect
them with current events using web searches. Perfect for:
1. News reporting and journalism
2. Travel and tourism content
3. Social media analysis
4. Educational presentations
5. Event coverage

Example images to try:
- Famous landmarks (Eiffel Tower, Taj Mahal, etc.)
- City skylines
- Cultural events and festivals
- Breaking news scenes
- Historical locations

Run `pip install ddgs agno` to install dependencies.
"""

from textwrap import dedent

from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    description=dedent("""\
        You are a world-class visual journalist and cultural correspondent with a gift
        for bringing images to life through storytelling! 📸✨ With the observational skills
        of a detective and the narrative flair of a bestselling author, you transform visual
        analysis into compelling stories that inform and captivate.\
    """),
    instructions=dedent("""\
        When analyzing images and reporting news, follow these principles:

        1. Visual Analysis:
           - Start with an attention-grabbing headline using relevant emoji
           - Break down key visual elements with expert precision
           - Notice subtle details others might miss
           - Connect visual elements to broader contexts

        2. News Integration:
           - Research and verify current events related to the image
           - Connect historical context with present-day significance
           - Prioritize accuracy while maintaining engagement
           - Include relevant statistics or data when available

        3. Storytelling Style:
           - Maintain a professional yet engaging tone
           - Use vivid, descriptive language
           - Include cultural and historical references when relevant
           - End with a memorable sign-off that fits the story

        4. Reporting Guidelines:
           - Keep responses concise but informative (2-3 paragraphs)
           - Balance facts with human interest
           - Maintain journalistic integrity
           - Credit sources when citing specific information

        Transform every image into a compelling news story that informs and inspires!\
    """),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

# Example usage with a famous landmark
agent.print_response(
    "Tell me about this image and share the latest relevant news.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,
)

# More examples to try:
"""
Sample prompts to explore:
1. "What's the historical significance of this location?"
2. "How has this place changed over time?"
3. "What cultural events happen here?"
4. "What's the architectural style and influence?"
5. "What recent developments affect this area?"

Sample image URLs to analyze:
1. Eiffel Tower: "https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg"
2. Taj Mahal: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg"
3. Golden Gate Bridge: "https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
"""

# To get the response in a variable:
# from rich.pretty import pprint
# response = agent.run(
#     "Analyze this landmark's architecture and recent news.",
#     images=[Image(url="YOUR_IMAGE_URL")],
# )
# pprint(response.content)

```

## Result 2
**File:** `cookbook/models/together/image_agent_with_memory.py`
**SHA256:** `15cc9264bce3383697f9bb0e5bb8f64c5b09daf933baed1d45938f789ee2e81d`
**Lines:** 1-22
**Language:** Python
```
from agno.agent import Agent
from agno.media import Image
from agno.models.together import Together

agent = Agent(
    model=Together(id="meta-llama/Llama-Vision-Free"),
    markdown=True,
    add_history_to_context=True,
    num_history_runs=3,
)

agent.print_response(
    "Tell me about this image",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,
)

agent.print_response("Tell me where I can get more images?")

```

## Result 3
**File:** `cookbook/models/together/image_agent.py`
**SHA256:** `6bcd9788e08c2eade5f404f8b3bee3b33d9be3630c51ecef691b74558b48f1a6`
**Lines:** 1-18
**Language:** Python
```
from agno.agent import Agent
from agno.media import Image
from agno.models.together import Together

agent = Agent(
    model=Together(id="meta-llama/Llama-Vision-Free"),
    markdown=True,
)

agent.print_response(
    "Tell me about this image",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,
)

```

## Result 4
**File:** `cookbook/models/ibm/watsonx/image_agent_bytes.py`
**SHA256:** `e0b32ceae12203b8023765f6c19f363c96433d48826e781f1eda440dfec9f6e3`
**Lines:** 1-23
**Language:** Python
```
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.ibm import WatsonX

agent = Agent(
    model=WatsonX(id="meta-llama/llama-3-2-11b-vision-instruct"),
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpg")

# Read the image file content as bytes
image_bytes = image_path.read_bytes()

agent.print_response(
    "Tell me about this image and and give me the latest news about it.",
    images=[
        Image(content=image_bytes),
    ],
    stream=True,
)

```

## Result 5
**File:** `cookbook/models/xai/image_agent.py`
**SHA256:** `993dd849564359467911b79c7b456063cea2caaca60d97d7cc9721619bdd5c0f`
**Lines:** 1-20
**Language:** Python
```
from agno.agent import Agent
from agno.media import Image
from agno.models.xai import xAI
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=xAI(id="grok-2-vision-latest"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg"
        )
    ],
    stream=True,
)

```


💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
