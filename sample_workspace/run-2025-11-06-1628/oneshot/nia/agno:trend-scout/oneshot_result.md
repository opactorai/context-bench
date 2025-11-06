# Oneshot Mode Result

**Scenario**: agno:trend-scout
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:39.884Z

---

## Query

Using the Agno Python framework, build a trend scout agent. Find the top 3 emerging AI tools from Hacker News right now and cross-check them with the latest web coverage. Give me a tight brief with 3 bullet takeaways, links (HN + news), and a 1-sentence risk note per tool.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "agno",
  "semantic_queries": [
    "Using the Agno Python framework, build a trend scout agent. Find the top 3 emerging AI tools from Hacker News right now and cross-check them with the latest web coverage. Give me a tight brief with 3 bullet takeaways, links (HN + news), and a 1-sentence risk note per tool."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: agno (py_pi)
**Queries:**
- Using the Agno Python framework, build a trend scout agent. Find the top 3 emerging AI tools from Hacker News right now and cross-check them with the latest web coverage. Give me a tight brief with 3 bullet takeaways, links (HN + news), and a 1-sentence risk note per tool.

**Version:** 2.2.6

**Found 4 relevant code sections**

## Result 1
**File:** `cookbook/tools/hackernews_tools.py`
**SHA256:** `3e6f974ace5ca38f5529d9980e441af7893a6075036a1e54237a208e082e9f0b`
**Lines:** 1-10
**Language:** Python
```
from agno.agent import Agent
from agno.models.anthropic import Claude
from agno.tools.hackernews import HackerNewsTools

agent = Agent(
    model=Claude(id="claude-sonnet-4-5"),
    tools=[HackerNewsTools()],
    markdown=True,
)
agent.print_response("Write a report on trending startups and products.", stream=True)

```

## Result 2
**File:** `cookbook/getting_started/04_write_your_own_tool.py`
**SHA256:** `5b40b4e13752c0bc8ebf80ab1563e5f2db22313bd9585a627fad8475cdd38aaf`
**Lines:** 1-75
**Language:** Python
```
"""🛠️ Writing Your Own Tool - An Example Using Hacker News API

This example shows how to create and use your own custom tool with Agno.
You can replace the Hacker News functionality with any API or service you want!

Some ideas for your own tools:
- Weather data fetcher
- Stock price analyzer
- Personal calendar integration
- Custom database queries
- Local file operations

Run `pip install openai httpx agno` to install dependencies.
"""

import json
from textwrap import dedent

import httpx
from agno.agent import Agent
from agno.models.openai import OpenAIChat


def get_top_hackernews_stories(num_stories: int = 10) -> str:
    """Use this function to get top stories from Hacker News.

    Args:
        num_stories (int): Number of stories to return. Defaults to 10.

    Returns:
        str: JSON string of top stories.
    """

    # Fetch top story IDs
    response = httpx.get("https://hacker-news.firebaseio.com/v0/topstories.json")
    story_ids = response.json()

    # Fetch story details
    stories = []
    for story_id in story_ids[:num_stories]:
        story_response = httpx.get(
            f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
        )
        story = story_response.json()
        if "text" in story:
            story.pop("text", None)
        stories.append(story)
    return json.dumps(stories)


# Create a Tech News Reporter Agent with a Silicon Valley personality
agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    instructions=dedent("""\
        You are a tech-savvy Hacker News reporter with a passion for all things technology! 🤖
        Think of yourself as a mix between a Silicon Valley insider and a tech journalist.

        Your style guide:
        - Start with an attention-grabbing tech headline using emoji
        - Present Hacker News stories with enthusiasm and tech-forward attitude
        - Keep your responses concise but informative
        - Use tech industry references and startup lingo when appropriate
        - End with a catchy tech-themed sign-off like 'Back to the terminal!' or 'Pushing to production!'

        Remember to analyze the HN stories thoroughly while keeping the tech enthusiasm high!\
    """),
    tools=[get_top_hackernews_stories],
    markdown=True,
)

# Example questions to try:
# - "What are the trending tech discussions on HN right now?"
# - "Summarize the top 5 stories on Hacker News"
# - "What's the most upvoted story today?"
agent.print_response("Summarize the top 5 stories on hackernews?", stream=True)

```

## Result 3
**File:** `cookbook/agents/dependencies/reference_dependencies.py`
**SHA256:** `614564ba66797c9c63c4d9d62a740fca4b220c1aabfe43dcb76ff663b7340240`
**Lines:** 1-51
**Language:** Python
```
import json

import httpx
from agno.agent import Agent
from agno.models.openai import OpenAIChat


def get_top_hackernews_stories(num_stories: int = 5) -> str:
    """Fetch and return the top stories from HackerNews.

    Args:
        num_stories: Number of top stories to retrieve (default: 5)
    Returns:
        JSON string containing story details (title, url, score, etc.)
    """
    # Get top stories
    stories = [
        {
            k: v
            for k, v in httpx.get(
                f"https://hacker-news.firebaseio.com/v0/item/{id}.json"
            )
            .json()
            .items()
            if k != "kids"  # Exclude discussion threads
        }
        for id in httpx.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json"
        ).json()[:num_stories]
    ]
    return json.dumps(stories, indent=4)


# Create a Context-Aware Agent that can access real-time HackerNews data
agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    # Each function in the dependencies is resolved when the agent is run,
    # think of it as dependency injection for Agents
    dependencies={"top_hackernews_stories": get_top_hackernews_stories},
    instructions=[
        "You are an insightful tech trend observer! 📰",
        "Here are the top stories on HackerNews: {top_hackernews_stories}",
    ],
    markdown=True,
)

# Example usage
agent.print_response(
    "Summarize the top stories on HackerNews and identify any interesting trends.",
    stream=True,
)

```

## Result 4
**File:** `cookbook/agents/dependencies/add_dependencies_to_context.py`
**SHA256:** `36816696f7a9ff30d9e6d4bf7b189bd688c71458e4a686458aff80e3ff4421f1`
**Lines:** 1-49
**Language:** Python
```
import json

import httpx
from agno.agent import Agent
from agno.models.openai import OpenAIChat


def get_top_hackernews_stories(num_stories: int = 5) -> str:
    """Fetch and return the top stories from HackerNews.

    Args:
        num_stories: Number of top stories to retrieve (default: 5)
    Returns:
        JSON string containing story details (title, url, score, etc.)
    """
    # Get top stories
    stories = [
        {
            k: v
            for k, v in httpx.get(
                f"https://hacker-news.firebaseio.com/v0/item/{id}.json"
            )
            .json()
            .items()
            if k != "kids"  # Exclude discussion threads
        }
        for id in httpx.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json"
        ).json()[:num_stories]
    ]
    return json.dumps(stories, indent=4)


# Create a Context-Aware Agent that can access real-time HackerNews data
agent = Agent(
    model=OpenAIChat(id="gpt-4o"),
    # Each function in the dependencies is resolved when the agent is run,
    # think of it as dependency injection for Agents
    dependencies={"top_hackernews_stories": get_top_hackernews_stories},
    # We can add the entire dependencies dictionary to the user message
    add_dependencies_to_context=True,
    markdown=True,
)

# Example usage
agent.print_response(
    "Summarize the top stories on HackerNews and identify any interesting trends.",
    stream=True,
)

```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
