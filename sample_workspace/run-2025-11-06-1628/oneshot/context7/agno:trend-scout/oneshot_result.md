# Oneshot Mode Result

**Scenario**: agno:trend-scout
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.534Z

---

## Query

Using the Agno Python framework, build a trend scout agent. Find the top 3 emerging AI tools from Hacker News right now and cross-check them with the latest web coverage. Give me a tight brief with 3 bullet takeaways, links (HN + news), and a 1-sentence risk note per tool.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/agno",
  "topic": "Using the Agno Python framework, build a trend scout agent. Find the top 3 emerging AI tools from Hacker News right now and cross-check them with the latest web coverage. Give me a tight brief with 3 bullet takeaways, links (HN + news), and a 1-sentence risk note per tool."
}
```

---

## Tool Result

### Define and Use Custom Python Tool for Agno Agent (Hacker News)

Source: https://docs.agno.com/concepts/agents/tools

This Python code illustrates how to define a custom function, `get_top_hackernews_stories`, that acts as a tool for an Agno Agent. The tool fetches and parses top stories from Hacker News using `httpx`. The agent is then initialized with this custom tool to summarize the top stories. This requires `agno` and `httpx` to be installed.

```python
import json
import httpx

from agno.agent import Agent

def get_top_hackernews_stories(num_stories: int = 10) -> str:
    """Use this function to get top stories from Hacker News.

    Args:
        num_stories (int): Number of stories to return. Defaults to 10.
    """

    # Fetch top story IDs
    response = httpx.get('https://hacker-news.firebaseio.com/v0/topstories.json')
    story_ids = response.json()

    # Fetch story details
    stories = []
    for story_id in story_ids[:num_stories]:
        story_response = httpx.get(f'https://hacker-news.firebaseio.com/v0/item/{story_id}.json')
        story = story_response.json()
        if "text" in story:
            story.pop("text", None)
        stories.append(story)
    return json.dumps(stories)

agent = Agent(tools=[get_top_hackernews_stories], markdown=True)
agent.print_response("Summarize the top 5 stories on hackernews?", stream=True)
```

--------------------------------

### Initialize and Run Agno Agent with HackerNewsTools (Python)

Source: https://docs.agno.com/examples/concepts/tools/search/hackernews

This Python script initializes an `agno` agent with the `HackerNewsTools` to query for top Hacker News stories. It requires the `agno` library and an OpenAI API key for operation. The `markdown=True` argument ensures the response is formatted in markdown.

```python
from agno.agent import Agent
from agno.tools.hackernews import HackerNewsTools

agent = Agent(
    tools=[HackerNewsTools()],
        markdown=True,
)
agent.print_response("What are the top stories on Hacker News right now?")
```

--------------------------------

### Create and Configure Agno AI News Reporter Agent in Python

Source: https://docs.agno.com/examples/getting-started/02-agent-with-tools

This Python snippet initializes an Agno AI agent, defining its core personality and capabilities. It uses an `OpenAIChat` model and a comprehensive set of instructions to establish an enthusiastic NYC news reporter persona, along with `DuckDuckGoTools` for web searching. The agent is then set up to handle queries and stream responses.

```python
from textwrap import dedent

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools

# Create a News Reporter Agent with a fun personality
agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are an enthusiastic news reporter with a flair for storytelling! 🗽
        Think of yourself as a mix between a witty comedian and a sharp journalist.

        Follow these guidelines for every report:
        1. Start with an attention-grabbing headline using relevant emoji
        2. Use the search tool to find current, accurate information
        3. Present news with authentic NYC enthusiasm and local flavor
        4. Structure your reports in clear sections:
            - Catchy headline
            - Brief summary of the news
            - Key details and quotes
            - Local impact or context
        5. Keep responses concise but informative (2-3 paragraphs max)
        6. Include NYC-style commentary and local references
        7. End with a signature sign-off phrase

        Sign-off examples:
        - 'Back to you in the studio, folks!'
        - 'Reporting live from the city that never sleeps!'
        - 'This is [Your Name], live from the heart of Manhattan!'

        Remember: Always verify facts through web searches and maintain that authentic NYC energy!\n    """),
    tools=[DuckDuckGoTools()],
    markdown=True,
)

# Example usage
agent.print_response(
    "Tell me about a breaking news story happening in Times Square.", stream=True
)

# More example prompts to try:
"""
Try these engaging news queries:
1. "What's the latest development in NYC's tech scene?"
2. "Tell me about any upcoming events at Madison Square Garden"
3. "What's the weather impact on NYC today?"
4. "Any updates on the NYC subway system?"
5. "What's the hottest food trend in Manhattan right now?"
"""
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

--------------------------------

### Create custom Hacker News tool with Agno (Python)

Source: https://docs.agno.com/examples/getting-started/04-write-your-own-tool

This Python snippet defines a `get_top_hackernews_stories` function to fetch top stories from the Hacker News API using `httpx`. It then initializes an Agno agent with a specific persona and integrates this custom tool, demonstrating how to use the agent to summarize Hacker News stories.

```python
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
    model=OpenAIChat(id="gpt-5-mini"),
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

--------------------------------

### Define and run an investment analyst agent with AGUI and YFinance in Python

Source: https://docs.agno.com/examples/agent-os/interfaces/ag-ui/agent_with_tools

This Python code defines an AI agent that acts as an investment analyst. It uses the Agno framework, integrates with OpenAI's `gpt-5-mini` model, and leverages `YFinanceTools` to access stock prices, analyst recommendations, and fundamentals. The agent is exposed via an AGUI web interface and served using `AgentOS`.

```python
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.os import AgentOS
from agno.os.interfaces.agui import AGUI
from agno.tools.yfinance import YFinanceTools

agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[
        YFinanceTools(
            stock_price=True, 
            analyst_recommendations=True, 
            stock_fundamentals=True
        )
    ],
    description="You are an investment analyst that researches stock prices, analyst recommendations, and stock fundamentals.",
    instructions="Format your response using markdown and use tables to display data where possible.",
)

agent_os = AgentOS(
    agents=[agent],
    interfaces=[AGUI(agent=agent)],
)
app = agent_os.get_app()

if __name__ == "__main__":
    agent_os.serve(app="agent_with_tool:app", reload=True)
```

--------------------------------

### Initialize Agno Agent with OpenBBTools (Python)

Source: https://docs.agno.com/examples/concepts/tools/others/openbb

This Python snippet demonstrates how to create an Agno agent instance, integrate `OpenBBTools` for financial data capabilities, and then use the agent to query for the latest stock price. It highlights the use of the `agno` library for AI agent creation.

```python
from agno.agent import Agent
from agno.tools.openbb import OpenBBTools

agent = Agent(
    tools=[OpenBBTools()],
        markdown=True,
)
agent.print_response("Get the latest stock price for AAPL")
```

--------------------------------

### Define and Use AI Agent Team for Financial Analysis (Python)

Source: https://docs.agno.com/examples/getting-started/17-agent-team

This Python code defines a collaborative AI agent team using the `agno` library. It sets up a 'Web Agent' for news searching, a 'Finance Agent' for financial data analysis, and orchestrates them with a 'Lead Editor' (the Team itself) to combine insights. Each agent is configured with an OpenAI model, specific tools (DuckDuckGo, ExaTools), and detailed instructions on how to perform its role, and the code then showcases example queries.

```python
from textwrap import dedent

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.exa import ExaTools

web_agent = Agent(
    name="Web Agent",
    role="Search the web for information",
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    instructions=dedent("""
        You are an experienced web researcher and news analyst! 🔍

        Follow these steps when searching for information:
        1. Start with the most recent and relevant sources
        2. Cross-reference information from multiple sources
        3. Prioritize reputable news outlets and official sources
        4. Always cite your sources with links
        5. Focus on market-moving news and significant developments

        Your style guide:
        - Present information in a clear, journalistic style
        - Use bullet points for key takeaways
        - Include relevant quotes when available
        - Specify the date and time for each piece of news
        - Highlight market sentiment and industry trends
        - End with a brief analysis of the overall narrative
        - Pay special attention to regulatory news, earnings reports, and strategic announcements\
    """),
    markdown=True,
)

finance_agent = Agent(
    name="Finance Agent",
    role="Get financial data",
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[
        ExaTools(
            include_domains=["trendlyne.com"],
            text=False,
            show_results=True,
            highlights=False,
        )
    ],
    instructions=dedent("""
        You are a skilled financial analyst with expertise in market data! 📊

        Follow these steps when analyzing financial data:
        1. Start with the latest stock price, trading volume, and daily range
        2. Present detailed analyst recommendations and consensus target prices
        3. Include key metrics: P/E ratio, market cap, 52-week range
        4. Analyze trading patterns and volume trends
        5. Compare performance against relevant sector indices

        Your style guide:
        - Use tables for structured data presentation
        - Include clear headers for each data section
        - Add brief explanations for technical terms
        - Highlight notable changes with emojis (📈 📉)
        - Use bullet points for quick insights
        - Compare current values with historical averages
        - End with a data-driven financial outlook\
    """),
    markdown=True,
)

agent_team = Team(
    members=[web_agent, finance_agent],
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are the lead editor of a prestigious financial news desk! 📰

        Your role:
        1. Coordinate between the web researcher and financial analyst
        2. Combine their findings into a compelling narrative
        3. Ensure all information is properly sourced and verified
        4. Present a balanced view of both news and data
        5. Highlight key risks and opportunities

        Your style guide:
        - Start with an attention-grabbing headline
        - Begin with a powerful executive summary
        - Present financial data first, followed by news context
        - Use clear section breaks between different types of information
        - Include relevant charts or tables when available
        - Add 'Market Sentiment' section with current mood
        - Include a 'Key Takeaways' section at the end
        - End with 'Risk Factors' when appropriate
        - Sign off with 'Market Watch Team' and the current date\
    """),
    add_datetime_to_context=True,
    markdown=True,
    show_members_responses=False,
)

# Example usage with diverse queries
agent_team.print_response(
    input="Summarize analyst recommendations and share the latest news for NVDA",
    stream=True,
)
agent_team.print_response(
    input="What's the market outlook and financial performance of AI semiconductor companies?",
    stream=True,
)
agent_team.print_response(
    input="Analyze recent developments and financial performance of TSLA",
    stream=True,
)
```

--------------------------------

### Configure and Define Media Trend Analysis Agent (Python)

Source: https://docs.agno.com/examples/use-cases/agents/media_trend_analysis_agent

This Python script uses the Agno framework to define an AI agent for media trend analysis. It integrates `OpenAIChat` for AI model interaction and `ExaTools` and `FirecrawlTools` for web search and content scraping. The agent is configured with a specialized persona, detailed instructions for analysis, and a structured markdown output format for comprehensive reports. It also includes example prompts to demonstrate its usage.

```python
"""Please install dependencies using:
pip install openai exa-py agno firecrawl
"""

from datetime import datetime, timedelta
from textwrap import dedent

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.exa import ExaTools
from agno.tools.firecrawl import FirecrawlTools


def calculate_start_date(days: int) -> str:
    """Calculate start date based on number of days."""
    start_date = datetime.now() - timedelta(days=days)
    return start_date.strftime("%Y-%m-%d")


agent = Agent(
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[
        ExaTools(start_published_date=calculate_start_date(30), type="keyword"),
        FirecrawlTools(scrape=True),
    ],
    description=dedent("""
        You are an expert media trend analyst specializing in:
        1. Identifying emerging trends across news and digital platforms
        2. Recognizing pattern changes in media coverage
        3. Providing actionable insights based on data
        4. Forecasting potential future developments
    """),
    instructions=[
        "Analyze the provided topic according to the user's specifications:",
        "1. Use keywords to perform targeted searches",
        "2. Identify key influencers and authoritative sources",
        "3. Extract main themes and recurring patterns",
        "4. Provide actionable recommendations",
        "5. if got sources less then 2, only then scrape them using firecrawl tool, dont crawl it  and use them to generate the report",
        "6. growth rate should be in percentage , and if not possible dont give growth rate",
    ],
    expected_output=dedent("""
    # Media Trend Analysis Report

    ## Executive Summary
    {High-level overview of findings and key metrics}

    ## Trend Analysis
    ### Volume Metrics
    - Peak discussion periods: {dates}
    - Growth rate: {percentage or dont show this}

    ## Source Analysis
    ### Top Sources
    1. {Source 1}

    2. {Source 2}


    ## Actionable Insights
    1. {Insight 1}
       - Evidence: {data points}
       - Recommended action: {action}

    ## Future Predictions
    1. {Prediction 1}
       - Supporting evidence: {evidence}

    ## References
    {Detailed source list with links}
    """
),
    markdown=True,
    add_datetime_to_context=True,
)

# Example usage:
analysis_prompt = """
Analyze media trends for:
Keywords: ai agents
Sources: verge.com ,linkedin.com, x.com
"""

agent.print_response(analysis_prompt, stream=True)

# Alternative prompt example
crypto_prompt = """
Analyze media trends for:
Keywords: cryptocurrency, bitcoin, ethereum
Sources: coindesk.com, cointelegraph.com
"""

# agent.print_response(crypto_prompt, stream=True)

```

--------------------------------

### Initialize and Run Agno Agent with Siliconflow Model and DuckDuckGoTools (Python)

Source: https://docs.agno.com/examples/models/siliconflow/tool_use

This Python snippet demonstrates how to set up and run an AI agent using the `agno` library. It initializes an `Agent` with a `Siliconflow` model and integrates `DuckDuckGoTools` for web search capabilities. The agent then processes a query and streams its response.

```python
from agno.agent import Agent
from agno.models.siliconflow import Siliconflow
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
  model=Siliconflow(id="openai/gpt-oss-120b"),
  tools=[DuckDuckGoTools()],
  markdown=True,
)

agent.print_response("Whats happening in France?", stream=True)
```

--------------------------------

### Initialize and run Agno agent with DashScope model and DuckDuckGo tools (Python)

Source: https://docs.agno.com/examples/models/dashscope/tool_use

This code initializes an AI agent using the Agno framework. It configures the agent to use the DashScope "qwen-plus" model and integrates DuckDuckGo tools for external information retrieval. The agent then processes a query, streaming the response.

```python
from agno.agent import Agent
from agno.models.dashscope import DashScope
from agno.tools.duckduckgo import DuckDuckGoTools

agent = Agent(
    model=DashScope(id="qwen-plus"),
    tools=[DuckDuckGoTools()],
    markdown=True,
)
agent.print_response("What's happening in AI today?", stream=True)
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

### Instantiate Agno Agent with HackerNewsTools in Python

Source: https://docs.agno.com/concepts/tools/toolkits/search/hackernews

This Python code demonstrates how to initialize an Agno `Agent` with the `HackerNewsTools` toolkit. It configures the agent to query Hacker News for the top two stories and their users, then requests an engaging summary of this information. The `markdown=True` parameter ensures the agent's response is formatted in markdown.

```python
from agno.agent import Agent
from agno.tools.hackernews import HackerNewsTools

agent = Agent(
    name="Hackernews Team",
    tools=[HackerNewsTools()],
        markdown=True,
)

agent.print_response(
    "Write an engaging summary of the "
    "users with the top 2 stories on hackernews. "
    "Please mention the stories as well.",
)
```
