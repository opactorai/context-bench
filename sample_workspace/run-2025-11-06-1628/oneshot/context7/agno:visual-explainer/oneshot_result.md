# Oneshot Mode Result

**Scenario**: agno:visual-explainer
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.039Z

---

## Query

Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/agno",
  "topic": "Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links."
}
```

---

## Tool Result

### Create Agno Agent for Image Analysis with OpenAI and DuckDuckGo

Source: https://docs.agno.com/concepts/multimodal/images/image_input

This Python snippet initializes an Agno agent configured with an OpenAI chat model (gpt-5-mini) and DuckDuckGo tools. It then uses the agent to process an image provided via a URL, instructing it to analyze the image and retrieve the latest news related to its content. The response is streamed directly to the console.

```python
from agno.agent import Agent
    from agno.media import Image
    from agno.models.openai import OpenAIChat
    from agno.tools.duckduckgo import DuckDuckGoTools

    agent = Agent(
        model=OpenAIChat(id="gpt-5-mini"),
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

--------------------------------

### Image Input and Processing for Agno AI Tools in Python

Source: https://docs.agno.com/examples/concepts/agent/multimodal/image_input_for_tool

This Python example showcases how to build an Agno agent capable of processing images. It defines functions for image analysis and counting, integrates DALL-E for image generation, and demonstrates an end-to-end workflow including initial image upload, in-run generation, and cross-run media persistence. It relies on `agno` and `openai` libraries and uses a `PostgresDb` for persistence.

```python
from typing import Optional, Sequence

from agno.agent import Agent
from agno.db.postgres import PostgresDb
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.dalle import DalleTools


def analyze_images(images: Optional[Sequence[Image]] = None) -> str:
    """
    Analyze all available images and provide detailed descriptions.

    Args:
        images: Images available to the tool (automatically injected)

    Returns:
        Analysis of all available images
    """
    if not images:
        return "No images available to analyze."

    print(f"--> analyze_images received {len(images)} images")

    analysis_results = []
    for i, image in enumerate(images):
        if image.url:
            analysis_results.append(
                f"Image {i + 1}: URL-based image at {image.url}"
            )
        elif image.content:
            analysis_results.append(
                f"Image {i + 1}: Content-based image ({len(image.content)} bytes)"
            )
        else:
            analysis_results.append(f"Image {i + 1}: Unknown image format")

    return f"Found {len(images)} images:\n" + "\n".join(analysis_results)


def count_images(images: Optional[Sequence[Image]] = None) -> str:
    """
    Count the number of available images.

    Args:
        images: Images available to the tool (automatically injected)

    Returns:
        Count of available images
    """
    if not images:
        return "0 images available"

    print(f"--> count_images received {len(images)} images")
    return f"{len(images)} images available"


def create_sample_image_content() -> bytes:
    """Create a simple image-like content for demonstration."""
    return b"FAKE_IMAGE_CONTENT_FOR_DEMO"


def main():
    # Create an agent with both DALL-E and image analysis functions
    agent = Agent(
        model=OpenAIChat(id="gpt-4o"),
        tools=[DalleTools(), analyze_images, count_images],
        name="Joint Media Test Agent",
        description="An agent that can generate and analyze images using joint media access.",
        debug_mode=True,
        add_history_to_context=True,
        send_media_to_model=False,
        db=PostgresDb(db_url="postgresql+psycopg://ai:ai@localhost:5532/ai"),
    )

    print("=== Joint Media Access Test ===\n")

    # Test 1: Initial image upload and analysis
    print("1. Testing initial image upload and analysis...")

    sample_image = Image(id="test_image_1", content=create_sample_image_content())

    response1 = agent.run(
        input="I've uploaded an image. Please count how many images are available and analyze them.",
        images=[sample_image],
    )

    print(f"Run 1 Response: {response1.content}")
    print(f"--> Run 1 Images in response: {len(response1.input.images or [])}")
    print("\n" + "=" * 50 + "\n")

    # Test 2: DALL-E generation + analysis in same run
    print("2. Testing DALL-E generation and immediate analysis...")

    response2 = agent.run(input="Generate an image of a cute cat.")

    print(f"Run 2 Response: {response2.content}")
    print(f"--> Run 2 Images in response: {len(response2.images or [])}")
    print("\n" + "=" * 50 + "\n")

    # Test 3: Cross-run media persistence
    print("3. Testing cross-run media persistence...")

    response3 = agent.run(
        input="Count how many images are available from all previous runs and analyze them."
    )

    print(f"Run 3 Response: {response3.content}")
    print("\n" + "=" * 50 + "\n")


if __name__ == "__main__":
    main()
```

--------------------------------

### Initialize and Run OpenAI Image Agent with GoogleSearchTools (Python)

Source: https://docs.agno.com/examples/models/openai/responses/image_agent

This Python snippet demonstrates how to initialize an Agno agent using `OpenAIResponses` with a specified model (e.g., gpt-5-mini) and integrate `GoogleSearchTools`. The agent is then used to analyze an image provided by a URL and retrieve the latest news related to it, with the response streamed back.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIResponses
from agno.tools.googlesearch import GoogleSearchTools

agent = Agent(
    model=OpenAIResponses(id="gpt-5-mini"),
    tools=[GoogleSearchTools()],
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

--------------------------------

### Define and Run Image Analysis AI Agent (Python)

Source: https://docs.agno.com/examples/getting-started/13-image-agent

This Python code defines an AI agent using the 'agno' library, configured as a visual journalist. It leverages OpenAI's 'gpt-5-mini' model and DuckDuckGo tools for web search, providing detailed instructions for visual analysis, news integration, and storytelling. The example demonstrates how to make the agent analyze a given image URL and report relevant news in a stream.

```python
from textwrap import dedent

from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    description=dedent("""
        You are a world-class visual journalist and cultural correspondent with a gift
        for bringing images to life through storytelling! 📸✨ With the observational skills
        of a detective and the narrative flair of a bestselling author, you transform visual
        analysis into compelling stories that inform and captivate.
    """),
    instructions=dedent("""
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
```

--------------------------------

### Initialize Agno Agent with AWS Bedrock for Image Analysis (Python)

Source: https://docs.agno.com/examples/models/aws/bedrock/image_agent

This Python snippet demonstrates how to set up an Agno agent using AWS Bedrock's `amazon.nova-pro-v1:0` model to process image input. It reads an image file, passes its bytes to the agent, and prompts for analysis and news, leveraging DuckDuckGo tools.

```python
from pathlib import Path
from agno.agent import Agent
from agno.media import Image
from agno.models.aws import AwsBedrock
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=AwsBedrock(id="amazon.nova-pro-v1:0"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpg")

# Read the image file content as bytes
with open(image_path, "rb") as img_file:
    image_bytes = img_file.read()

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(content=image_bytes, format="jpeg"),
    ],
)
```

--------------------------------

### Process Image URL with Anthropic Claude Agent in Python

Source: https://docs.agno.com/examples/models/anthropic/image_input_url

This Python snippet initializes an `agno` agent using Anthropic's Claude model and integrates `DuckDuckGoTools` for web search. It demonstrates how to send an image URL to the agent for analysis, enabling it to interpret the image content and search the web for related information while streaming the response.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.anthropic import Claude
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=Claude(id="claude-sonnet-4-20250514"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

agent.print_response(
    "Tell me about this image and search the web for more information.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
        ),
    ],
    stream=True,
)
```

--------------------------------

### Analyze Image Input Bytes with Agno Agent and Claude (Python)

Source: https://docs.agno.com/examples/models/vertexai/claude/image_input_bytes

This Python code demonstrates how to use the `agno` agent framework with the `Claude` model to process image input provided as raw bytes. It downloads an image from a URL, reads its content into a byte string, and then sends it to the agent for analysis along with a text prompt.

```python
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.vertexai.claude import Claude
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.utils.media import download_image

agent = Agent(
    model=Claude(id="claude-sonnet-4@20250514"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpg")

download_image(
    url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg",
    output_path=str(image_path),
)

# Read the image file content as bytes
image_bytes = image_path.read_bytes()

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(content=image_bytes),
    ],
    stream=True,
)
```

--------------------------------

### Initialize and Run Agno Image Agent with XAI and DuckDuckGo

Source: https://docs.agno.com/examples/models/xai/image_agent

This Python snippet demonstrates how to initialize an Agno Agent using the 'grok-2-vision-latest' xAI model and integrate DuckDuckGo search tools. It then shows how to process an image from a URL, asking the agent to describe it and provide the latest news, with streamed output.

```python
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

--------------------------------

### Implement Agno Image Agent with Google Gemini (Python)

Source: https://docs.agno.com/examples/models/gemini/image_input

This Python snippet demonstrates how to initialize an `agno` agent, configure it with a Google Gemini model and DuckDuckGo tools, and instruct it to analyze an image from a URL, streaming the response. It showcases multimodal capabilities for image understanding and news retrieval.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.google import Gemini
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=Gemini(id="gemini-2.0-flash-exp"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/b/bf/Krakow_-_Kosciol_Mariacki.jpg"
        ),
    ],
    stream=True,
)
```

--------------------------------

### Pass Images to Agno Agent Run in Python

Source: https://docs.agno.com/concepts/agents/running-agents

This Python example illustrates how to provide multimodal input, specifically an image, to an Agno agent during a run. By passing a list of `Image` objects with their URLs to the `images` parameter, the agent can process visual information alongside text prompts, enabling richer interactions.

```python
agent.run("Tell me a 5 second short story about this image", images=[Image(url="https://example.com/image.jpg")])
```

--------------------------------

### Initialize and Run OpenAI Image Agent with DuckDuckGo Tools (Python)

Source: https://docs.agno.com/examples/models/openai/chat/image_agent

This Python snippet demonstrates how to initialize an `agno` Agent configured with an OpenAI chat model and DuckDuckGo tools. It then uses the agent to process an image URL, requesting analysis and the latest news about its content, streaming the response.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/b/bf/Krakow_-_Kosciol_Mariacki.jpg"
        )
    ],
    stream=True,
)
```

--------------------------------

### Analyze Image with Agno and Groq (Python)

Source: https://docs.agno.com/examples/models/groq/image_agent

This Python snippet demonstrates how to initialize an Agno agent using a Groq model (meta-llama/llama-4-scout-17b-16e-instruct) to analyze an image from a URL. It sends a text prompt along with the image and streams the agent's response to the console. Ensure 'agno' and 'groq' libraries are installed.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.groq import Groq

agent = Agent(model=Groq(id="meta-llama/llama-4-scout-17b-16e-instruct"))

agent.print_response(
    "Tell me about this image",
    images=[
        Image(url="https://upload.wikimedia.org/wikipedia/commons/f/f2/LPU-v1-die.jpg"),
    ],
    stream=True,
)
```

--------------------------------

### Initialize and run Python image agent with Together AI

Source: https://docs.agno.com/examples/models/together/image_agent

This Python snippet demonstrates how to initialize an `Agent` from the `agno` library, configuring it to use a `Together` model (specifically `meta-llama/Llama-Vision-Free`). It then sends a prompt along with an image URL to the agent and prints the streamed response, showcasing basic image analysis capabilities.

```python
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

--------------------------------

### Initialize and Run Agno Agent for Image Analysis with Mistral and DuckDuckGo

Source: https://docs.agno.com/examples/models/mistral/image_file_input_agent

This Python script defines an `agno` agent using `MistralChat` for AI processing and `DuckDuckGoTools` for external information retrieval. It loads a sample image, then prompts the agent to describe the image and provide the latest news about its content, streaming the response.

```python
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.mistral.mistral import MistralChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=MistralChat(id="pixtral-12b-2409"),
    tools=[
        DuckDuckGoTools()
    ],
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpeg")

agent.print_response(
    "Tell me about this image and give me the latest news about it from duckduckgo.",
    images=[
        Image(filepath=image_path),
    ],
    stream=True,
)
```

--------------------------------

### Define and Run Image to Text Agent in Python

Source: https://docs.agno.com/examples/concepts/multimodal/image-to-text

This Python code initializes an AI agent using the `agno` framework and an `OpenAIChat` model (e.g., gpt-5-mini) to process images. It defines an agent with specific instructions to describe images and then calls `print_response` to generate a 3-sentence fiction story based on a provided image file. The agent requires the `agno` and `openai` libraries.

```python
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat

agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    id="image-to-text",
    name="Image to Text Agent",
    markdown=True,
    debug_mode=True,
        instructions=[
        "You are an AI agent that can generate text descriptions based on an image.",
        "You have to return a text response describing the image.",
    ],
)
image_path = Path(__file__).parent.joinpath("sample.jpg")
agent.print_response(
    "Write a 3 sentence fiction story about the image",
    images=[Image(filepath=image_path)],
    stream=True,
)
```

--------------------------------

### Initialize Agno Agent with Claude for Image Input

Source: https://docs.agno.com/examples/models/vertexai/claude/image_input_url

This Python script sets up an Agno agent using the Claude model from Vertex AI, configured with DuckDuckGo tools. It demonstrates how to pass an image URL to the agent for analysis and web search, streaming the response as it processes the input.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.vertexai.claude import Claude
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=Claude(id="claude-sonnet-4@20250514"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

agent.print_response(
    "Tell me about this image and search the web for more information.",
    images=[
        Image(
            url="https://upload.wikimedia.org/wikipedia/commons/a/a7/Camponotus_flavomarginatus_ant.jpg"
        ),
    ],
    stream=True,
)
```

--------------------------------

### Initialize Agno Agent with IBM WatsonX Vision and Process Local Image (Python)

Source: https://docs.agno.com/examples/models/ibm/image_agent_bytes

This Python script initializes an Agno Agent using an IBM WatsonX vision model (`meta-llama/llama-3-2-11b-vision-instruct`) and DuckDuckGo tools. It reads a local image file as bytes, then sends the image along with a text prompt to the agent for analysis and news retrieval. Requires Agno, IBM WatsonX, and DuckDuckGo libraries.

```python
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.ibm import WatsonX
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=WatsonX(id="meta-llama/llama-3-2-11b-vision-instruct"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpg")

# Read the image file content as bytes
with open(image_path, "rb") as img_file:
    image_bytes = img_file.read()

agent.print_response(
    "Tell me about this image and give me the latest news about it.",
    images=[
        Image(content=image_bytes),
    ],
    stream=True,
)
```

--------------------------------

### Define Agno Agent with BraveSearchTools (Python)

Source: https://docs.agno.com/examples/concepts/tools/search/bravesearch

This Python code defines an Agno agent that leverages BraveSearchTools to find the latest news. It initializes the agent with the tool and specific instructions to respond with four news items on a given topic. The example then demonstrates its use by requesting news on 'AI Agents'.

```python
from agno.agent import Agent
from agno.tools.bravesearch import BraveSearchTools

agent = Agent(
    tools=[BraveSearchTools()],
    description="You are a news agent that helps users find the latest news.",
    instructions=[
        "Given a topic by the user, respond with 4 latest news items about that topic."
    ],
    )
agent.print_response("AI Agents", markdown=True)
```
