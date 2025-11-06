# trend_scout.py
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.hackernews import HackerNewsTools

agent = Agent(
    name="Trend Scout",
    model=OpenAIChat(id="gpt-4o"),
    tools=[HackerNewsTools(), DuckDuckGoTools()],
    instructions=(
        "Combine Hacker News signals with web news. "
        "De-duplicate items, verify recency, and return: "
        "• 3 bullet takeaways\n• Links to HN + news\n• 1-sentence risk per tool."
    ),
    markdown=True,
)

agent.print_response(
    "Find the top 3 emerging AI tools from Hacker News and cross-check with latest web coverage.",
    stream=True,
)
