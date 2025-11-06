# visual_explainer.py
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    name="Visual News Explainer",
    model=OpenAIChat(id="gpt-4o"),
    tools=[DuckDuckGoTools()],
    instructions=(
        "1) Identify the landmark and give a brief significance. "
        "2) Search latest related news (2 items) with links. "
        "3) Return a 3-point TL;DR."
    ),
    markdown=True,
)

agent.print_response(
    "Explain this image and fetch latest related news.",
    images=[Image(url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg")],
    stream=True,
)
