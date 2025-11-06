# Oneshot Mode Result

**Scenario**: agno:visual-explainer
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:53:31.039Z

---

## Query

Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links.

---

## Tool Input

```json
{
  "query": "Using the Agno Python framework with image input capabilities, build a visual explainer agent. When I send an image, identify the landmark, explain its significance, then pull the two latest news items related to it. End with a 3-point TL;DR and links."
}
```

---

## Tool Result

## Multimodal Image Input Handling in GeneralAgent

https://raw.githubusercontent.com/CosmosShadow/GeneralAgent/main/README_EN.md

```
# Multimodal support: Image input
from GeneralAgent import Agent

agent = Agent('You are a helpful assistant.')
agent.user_input(['what is in the image?', {'image': '../docs/images/self_call.png'}])
```

## Image Agent - Agno

https://docs.agno.com/examples/getting-started/13-image-agent

```
pip install openai ddgs agno
```

## Enhances News Reporter with DuckDuckGo Search Integration

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/getting_started/README.md

```
python cookbook/getting_started/02_agent_with_tools.py
```

## Implements ImageAgent for Image Input Processing

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/lmstudio/README.md

```
python cookbook/models/lmstudio/image_agent.py
```

## ImageAgent Class in XAI for Image Processing

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/xai/README.md

```
python cookbook/models/xai/image_agent.py
```

## ImageAgentWithMemory Class for Enhanced Image Processing

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/together/README.md

```
python cookbook/models/together/image_agent_with_memory.py
```

## Agent with Tools - Agno

https://docs.agno.com/examples/models/groq/tool_use

```
pip install -U groq ddgs newspaper4k lxml_html_clean agno
```

## Initialize Agent with Markdown and Monitoring Features

https://raw.githubusercontent.com/agno-agi/phidata/main/README.md

```
from phi.agent import Agent

agent = Agent(markdown=True, monitoring=True)
agent.print_response("Share a 2 sentence horror story")
```

## Uses image_qa to answer questions about images

https://raw.githubusercontent.com/ictnlp/TruthX/main/transformers/docs/source/ja/custom_tools.md

```
`text
[...]

=====

Human: Answer the question in the variable `question` about the image stored in the variable `image`.

Assistant: I will use the tool `image_qa` to answer the question on the input image.
```

## Analyze Landmarks with Azure Computer Vision API

https://raw.githubusercontent.com/Azure-Samples/cognitive-services-quickstart-code/main/python/ComputerVision/REST/python-domain.md

```
import os
import sys
import requests
# If you are using a Jupyter Notebook, uncomment the following line.
# %matplotlib inline
import matplotlib.pyplot as plt
from PIL import Image
from io import BytesIO

# Add your Computer Vision key and endpoint to your environment variables.
if 'COMPUTER_VISION_KEY' in os.environ:
    subscription_key = os.environ['COMPUTER_VISION_KEY']
else:
    print("\nSet the COMPUTER_VISION_KEY environment variable.\n**Restart your shell or IDE for changes to take effect.**")
    sys.exit()

if 'COMPUTER_VISION_ENDPOINT' in os.environ:
    endpoint = os.environ['COMPUTER_VISION_ENDPOINT']

landmark_analyze_url = endpoint + "vision/v3.1/models/landmarks/analyze"

# Set image_url to the URL of an image that you want to analyze.
image_url = "https://upload.wikimedia.org/wikipedia/commons/f/f6/" + \
    "Bunker_Hill_Monument_2005.jpg"

headers = {'Ocp-Apim-Subscription-Key': subscription_key}
params = {'model': 'landmarks'}
data = {'url': image_url}
response = requests.post(
    landmark_analyze_url, headers=headers, params=params, json=data)
response.raise_for_status()

# The 'analysis' object contains various fields that describe the image. The
# most relevant landmark for the image is obtained from the 'result' property.
analysis = response.json()
assert analysis["result"]["landmarks"] is not []
print(analysis)
landmark_name = analysis["result"]["landmarks"][0]["name"].capitalize()

# Display the image and overlay it with the landmark name.
image = Image.open(BytesIO(requests.get(image_url).content))
plt.imshow(image)
plt.axis("off")
_ = plt.title(landmark_name, size="x-large", y=-0.1)
plt.show()
```

## Invoke Claude Models for Image Description and Text Extraction

https://raw.githubusercontent.com/simonw/llm-anthropic/main/README.md

```
llm -m claude-4-sonnet 'describe this image' -a https://static.simonwillison.net/static/2024/pelicans.jpg
llm -m claude-3.5-haiku 'extract text' -a page.png
```

## log Result 1

https://raw.githubusercontent.com/intel/BigDL/main/python/llm/example/CPU/HF-Transformers-AutoModels/Model/mixtral/README.md

```
Inference time: xxxx s 
-------------------- Output --------------------
[INST] What is AI? [/INST] AI, or Artificial Intelligence, refers to the development of computer systems that can perform tasks that would normally require human intelligence to accomplish. These tasks can include things
```

## AI Agents X : Agno — Agentic Framework

https://medium.com/@danushidk507/ai-agents-x-agno-agentic-framework-2a2abba49604

```
docker compose up -d
```

## OpenRouterAgent Class with Image Analysis Functionality

https://raw.githubusercontent.com/activeagents/activeagent/main/docs/docs/generation-providers/open-router-provider.md

```
class OpenRouterAgent < ApplicationAgent
  generate_with :open_router, model: "openai/gpt-4o-mini"

  def analyze_image
    @image_url = params[:image_url]

    prompt(
      message: build_image_message,
      output_schema: image_analysis_schema
    )
  end

  private

  def image_analysis_schema
    {
      name: "image_analysis",
      strict: true,
      schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          objects: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                position: { type: "string" },
                color: { type: "string" }
              },
              required: ["name", "position", "color"],
              additionalProperties: false
            }
          },
          scene_type: {
            type: "string",
            enum: ["indoor", "outdoor", "abstract", "document", "photo", "illustration"]
          }
        },
        required: ["description", "objects", "scene_type"],
        additionalProperties: false
      }
    }
  end
end
```

## ImageAgent Class for Analyzing URL-based Images

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/litellm/README.md

```
python cookbook/models/litellm/image_agent.py
```

## Serve Image and Set LLM in Meta-Agentic AGI Demo

https://raw.githubusercontent.com/MontrealAI/AGI-Alpha-Agent-v0/main/internal_docs/meta_agentic_agi_v3_assets_README.md

```
from alpha_factory_v1.meta_agentic_agi.ui.helpers import asset_url, theme_token

# 1 · Serve a hero illustration
st.image(asset_url("illu/alpha‑factory_hero.png"), use_container_width=True)

# 2 · Grab a semantic colour for a custom component
violet = theme_token("--alpha‑violet‑600")

# 3 · Switch large‑language‑model at run‑time
from alpha_factory_v1.models import set_llm
set_llm(provider="open_weights", model_name="meta-llama-3-70b-instruct")
```

## agent.run method for generating images based on user input

https://raw.githubusercontent.com/liuzard/transformers_zh_docs/main/docs_zh/custom_tools.md

```
agent.run("给我画一幅河流和湖泊的图片")
```

## Initiates Chat with Image Agent for Description Retrieval

https://raw.githubusercontent.com/ag2ai/ag2/main/website/docs/user-guide/models/amazon-bedrock.mdx

```
User_proxy (to image-explainer):

What's happening in this image?
<image>.

--------------------------------------------------------------------------------

>>>>>>>> USING AUTO REPLY...
image-explainer (to User_proxy):

This image appears to be an advertisement or promotional material for a company called Autogen. The central figure is a stylized robot or android holding up a signboard with the company's name on it. The signboard also features a colorful heart design made up of many smaller hearts, suggesting themes related to love, care, or affection. The robot has a friendly, cartoonish expression with a large blue eye or lens. The overall style and color scheme give it a vibrant, eye-catching look that likely aims to portray Autogen as an innovative, approachable technology brand focused on connecting with people.

--------------------------------------------------------------------------------
```

## LLMVisionSynthesize for Image Description Generation

https://raw.githubusercontent.com/antononcube/MathematicaForPrediction/main/MarkdownDocuments/AI-vision-via-WL.md

```
LLMVisionSynthesize["Give concise descriptions of the images.", {"https://i.imgur.com/LEGfCeql.jpg", $HomeDirectory <> "/Downloads/ThreeHunters.jpg"}, "MaxTokens" -> 600]
```

## Candy Crush Game Agent with Image Processing and AI

https://raw.githubusercontent.com/lmgame-org/GamingAgent/main/computer_use/README.md

```
#### Build Your Own Policy

The Candy Crush game agent has two workers: one extracts board information from images and converts it into text, and the other plays the game. The AI agent follows a simple prompt to play Candy Crush but performs surprisingly well. Feel free to create and implement your own policy to improve its gameplay.

### Ace Attorney

Ace Attorney is a visual novel adventure game where players take on the role of a defense attorney, gathering evidence and cross-examining witnesses to prove their client's innocence.

#### Launch Gaming Agent

1. Launch the agent with:
```

## How to Build MultiModal AI Agents Using Agno Framework?

https://www.analyticsvidhya.com/blog/2025/03/agno-framework/

```
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.yfinance import YFinanceTools
from agno.team import Team

web_agent = Agent(
 name="Web Agent",
 role="Search the web for information",
 model=OpenAIChat(id="o3-mini"),
 tools=[DuckDuckGoTools()],
 instructions="Always include sources",
 show_tool_calls=True,
 markdown=True,
)

finance_agent = Agent(
 name="Finance Agent",
 role="Get financial data",
 model=OpenAIChat(id="o3-mini"),
 tools=[YFinanceTools(stock_price=True, analyst_recommendations=True, company_info=True)],
 instructions="Use tables to display data",
 show_tool_calls=True,
 markdown=True,
)

agent_team = Agent(
 team=[web_agent, finance_agent],
 model=OpenAIChat(id="gpt-4o"),
 instructions=["Always include sources", "Use tables to display data"],
 show_tool_calls=True,
 markdown=True,
)

agent_team.print_response("What's the market outlook and financial performance of top AI companies of the world?", stream=True)
```

## ImageAgent Class in Ollama for Vision Model Processing

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/ollama/README.md

```
python cookbook/models/ollama/image_agent.py
```

## ImageAgent Class for Analyzing Images in OpenAI Cookbook

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/openai/chat/README.md

```
python cookbook/models/openai/image_agent.py
```

## Agent Class Implements Multi-Modal User Input Handling

https://raw.githubusercontent.com/CosmosShadow/GeneralAgent/main/README.md

```
# 支持多模态: 图片输入
from GeneralAgent import Agent

agent = Agent('You are a helpful assistant.')
agent.user_input(['what is in the image?', {'image': '../docs/images/self_call.png'}])
```

## ImageAgent Class for Analyzing Images in Anthropic Models

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/anthropic/README.md

```
python cookbook/models/anthropic/image_agent.py
```

## ImageAgent Class in Gemini for Image Analysis

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/google/gemini/README.md

```
python cookbook/models/google/gemini/image_agent.py
```

## ImageAgent Class for Analyzing Images in Groq Model

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/groq/README.md

```
python cookbook/models/groq/image_agent.py
```

## AsyncImageAgent Class for Asynchronous Image Processing

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/models/dashscope/README.md

```
python cookbook/models/dashscope/async_image_agent.py
```

## Quickstart - Agno

https://docs.agno.com/introduction/quickstart

```
fastapi dev agno_agent.py
```

## Load ImageDescription Tool and Run HfAgent for Image Captioning

https://raw.githubusercontent.com/InternLM/agentlego/main/agentlego/tools/image_text/README.md

```
from transformers import HfAgent
from agentlego.apis import load_tool
from PIL import Image

# load tools and build transformers agent
tool = load_tool('ImageDescription', device='cuda').to_transformers_agent()
agent = HfAgent('https://api-inference.huggingface.co/models/bigcode/starcoder', additional_tools=[tool])

# agent running with the tool (For demo, we directly specify the tool name here.)
caption = agent.run(f'Use the tool `{tool.name}` to describe the image.', image=Image.open('examples/demo.png'))
print(caption)
```

## ImageAnalyzerAgent for Analyzing Images and Generating Descriptions

https://raw.githubusercontent.com/i-am-bee/acp/main/docs/core-concepts/agent-manifest.mdx

```
@server.agent(
    name="image-analyzer",
    description="Analyzes images and provides text descriptions",
    input_content_types=["image/png", "image/jpeg"],
    output_content_types=["text/plain", "application/json"]
)
async def ImageAnalyzerAgent(input: list[Message], context: Context):
    # Process image inputs and return text/json outputs
    pass
```

## What is Agno? - Agno

https://docs.agno.com/introduction

```
from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.anthropic import Claude
from agno.os import AgentOS
from agno.tools.mcp import MCPTools
# ************* Create Agent *************
agno_agent=Agent(
name="Agno Agent",
model=Claude( id="claude-sonnet-4-5" ),
db=SqliteDb( db_file="agno.db" ),
tools=[MCPTools( transport="streamable-http",url="https://docs.agno.com/mcp" )],
add_history_to_context=True,
markdown=True,
)
# ************* Create AgentOS *************
agent_os=AgentOS( agents=[agno_agent])
app=agent_os.get_app()
# ************* Run AgentOS *************
if __name__ == "__main__":
agent_os.serve( app="agno_agent:app",reload=True)
```

## Integrates Image Processing with ChatAgent in CAMEL Framework

https://raw.githubusercontent.com/camel-ai/camel/main/docs/mintlify/cookbooks/basic_concepts/agents_message.mdx

```
from io import BytesIO

import requests
from PIL import Image

from camel.agents import ChatAgent
from camel.messages import BaseMessage
# URL of the image
url = "https://raw.githubusercontent.com/camel-ai/camel/master/misc/logo_light.png"
response = requests.get(url)
img = Image.open(BytesIO(response.content))

# Define system message
sys_msg = BaseMessage.make_assistant_message(
    role_name="Assistant",
    content="You are a helpful assistant.",
)

# Set agent
camel_agent = ChatAgent(system_message=sys_msg)

# Set user message
user_msg = BaseMessage.make_user_message(
    role_name="User", content="""what's in the image?""", image_list=[img]
)

# Get response information
response = camel_agent.step(user_msg)
print(response.msgs[0].content)
```

## VisionAgent Class with Image Analysis using Claude Model

https://raw.githubusercontent.com/activeagents/activeagent/main/docs/docs/generation-providers/anthropic-provider.md

```
class VisionAgent < ApplicationAgent
  generate_with :anthropic, model: "claude-3-5-sonnet-latest"
  
  def analyze_image
    @image_path = params[:image_path]
    @image_base64 = Base64.encode64(File.read(@image_path))
    
    prompt content_type: :text
  end
end

# In your view (analyze_image.text.erb):
# Analyze this image: [base64 image data would be included]
```

## Download Image and Send to ChatAgent with BaseMessage

https://raw.githubusercontent.com/camel-ai/camel/main/docs/mintlify/key_modules/messages.mdx

```
from io import BytesIO
import requests
from PIL import Image

from camel.agents import ChatAgent
from camel.messages import BaseMessage

# Download an image
url = "https://raw.githubusercontent.com/camel-ai/camel/master/misc/logo_light.png"
img = Image.open(BytesIO(requests.get(url).content))

# Build system and user messages
sys_msg = BaseMessage.make_assistant_message(
    role_name="Assistant",
    content="You are a helpful assistant.",
)

user_msg = BaseMessage.make_user_message(
    role_name="User", content="what's in the image?", image_list=[img]
)

# Create agent and send message
camel_agent = ChatAgent(system_message=sys_msg)
response = camel_agent.step(user_msg)
print(response.msgs[0].content)
```

## Generate Images with Intermediate Steps - Agno

https://docs.agno.com/examples/concepts/multimodal/generate-image

```
pip install -U openai rich agno
```

## Initialize Notte Agent for Web Task Automation

https://raw.githubusercontent.com/nottelabs/notte/main/README.md

```
import notte
from dotenv import load_dotenv
load_dotenv()

with notte.Session(headless=False) as session:
    agent = notte.Agent(session=session, reasoning_model='gemini/gemini-2.5-flash', max_steps=30)
    response = agent.run(task="doom scroll cat memes on google images")
```

## Analyze Images and PDFs with VisionAgent from AskUI

https://raw.githubusercontent.com/askui/vision-agent/main/docs/extracting-data.md

```
from PIL import Image
from askui import VisionAgent
from pathlib import Path

with VisionAgent() as agent:
    # From PIL Image
    image = Image.open("screenshot.png")
    result = agent.get("What's in this image?", source=image)

    # From file path

    ## as a string
    result = agent.get("What's in this image?", source="screenshot.png")
    result = agent.get("What is this PDF about?", source="document.pdf")

    ## as a Path
    result = agent.get("What is this PDF about?", source="document.pdf")
    result = agent.get("What is this PDF about?", source=Path("table.xlsx"))

    # From a data url
    result = agent.get("What's in this image?", source="data:image/png;base64,...")
    result = agent.get("What is this PDF about?", source="data:application/pdf;base64,...")
```

## Agentic Framework Deep Dive Series (Part 2): Agno | by Devi

https://medium.com/@devipriyakaruppiah/agentic-framework-deep-dive-series-part-2-agno-c45da579b7c0

```
# Giphy Agentgiphy_agent = Agent( name="Giphy Agent", role="Find relevant GIFs", model=OpenAIChat(id="gpt-4o"), tools=[GiphyTools( api_key=os.getenv("GIPHY_API_KEY"), limit=1 # Number of GIFs to return )], instructions="Find relevant and appropriate GIFs related to the query.", show_tool_calls=True, markdown=True,)
```

## Building an AI Agent with Agno: A Step-by-Step Guide

https://ai.plainenglish.io/building-an-ai-agent-with-agno-a-step-by-step-guide-13542b2a5fb6

```
pip install agno openai
```

## VisionAgent Class for Image Analysis with OpenAI GPT-4o

https://raw.githubusercontent.com/activeagents/activeagent/main/docs/docs/generation-providers/openai-provider.md

```
class VisionAgent < ApplicationAgent
  generate_with :openai, model: "gpt-4o"
  
  def analyze_image
    @image_url = params[:image_url]
    prompt content_type: :text
  end
end

# In your view (analyze_image.text.erb):
# Analyze this image: <%= @image_url %>
```

## Initialize CrewAI Agent for Image Analysis

https://raw.githubusercontent.com/crewAIInc/crewAI/main/docs/pt-BR/learn/multimodal-agents.mdx

```
from crewai import Agent

agent = Agent(
    role="Image Analyst",
    goal="Analyze and extract insights from images",
    backstory="An expert in visual content interpretation with years of experience in image analysis",
    multimodal=True  # This enables multimodal capabilities
)
```

## How to Create Your Personalized News Digest Using AI Agents?

https://www.analyticsvidhya.com/blog/2024/09/personalized-news-digest/

```
query = "What's the news on the Indian cricket team in the past month?"

# this query will go the START node.
inputs = {"messages": [("user", query)]}

async for chunk in agent.astream(inputs, stream_mode="values"):
 chunk["messages"][-1].pretty_print()
```

## unknown Result 1

https://raw.githubusercontent.com/langgptai/Awesome-Multimodal-Prompts/main/README.md

```
Describe the landmark in the image.
```

## Reasoning Team - Agno

https://docs.agno.com/examples/use-cases/teams/reasoning_team

```
export OPENAI_API_KEY=****
export ANTHROPIC_API_KEY=****
export EXA_API_KEY=****
```
