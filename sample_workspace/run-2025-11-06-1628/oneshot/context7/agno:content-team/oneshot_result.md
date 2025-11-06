# Oneshot Mode Result

**Scenario**: agno:content-team
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:39.059Z

---

## Query

Using the Agno Python framework with multi-agent teams, create a content generation system for launching a stainless, eco-friendly water bottle. Build a team that produces a 1-page blog post: (a) outline, (b) 3-5 credible source links, (c) final copy in markdown. The writer must cite the researcher's sources, and the planner should ensure a clear buyer persona.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/agno",
  "topic": "Using the Agno Python framework with multi-agent teams, create a content generation system for launching a stainless, eco-friendly water bottle. Build a team that produces a 1-page blog post: (a) outline, (b) 3-5 credible source links, (c) final copy in markdown. The writer must cite the researcher's sources, and the planner should ensure a clear buyer persona."
}
```

---

## Tool Result

### Define Agno Content Team with Researcher and Writer Agents (Python)

Source: https://docs.agno.com/examples/use-cases/teams/content_team

This Python code demonstrates how to set up an AI-powered content creation team using the `agno` library. It initializes a `Researcher` agent with `DuckDuckGoTools` and a `Writer` agent, then combines them into a `Content Team` operating in `coordinate` mode, all powered by `OpenAIChat` models. The team is instructed to create high-quality content and is given a task to generate an article on quantum computing.

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools

# Create individual specialized agents
researcher = Agent(
    name="Researcher",
    role="Expert at finding information",
    tools=[DuckDuckGoTools()],
    model=OpenAIChat(id="gpt-5-mini"),
)

writer = Agent(
    name="Writer",
    role="Expert at writing clear, engaging content",
    model=OpenAIChat(id="gpt-5-mini"),
)

# Create a team with these agents
content_team = Team(
    name="Content Team",
    members=[researcher, writer],
    instructions="You are a team of researchers and writers that work together to create high-quality content.",
    model=OpenAIChat(id="gpt-5-mini"),
    show_members_responses=True,
)

# Run the team with a task
content_team.print_response("Create a short article about quantum computing")
```

--------------------------------

### Agno Workflow for Multi-Stage Blog Post Generation

Source: https://docs.agno.com/how-to/workflows-migration

This Python code implements a sophisticated blog post generator workflow using the Agno framework. It defines three main agents: a 'searcher' for web research with DuckDuckGo, an 'article_scraper' for content extraction with Newspaper4k, and a 'writer' (partially defined) for crafting the blog post. The workflow orchestrates these agents to research, process content, and generate well-researched blog posts with proper citations, utilizing OpenAI models and Pydantic for data structuring.

```python
import json
from textwrap import dedent
from typing import Dict, Iterator, Optional

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.run.workflow import WorkflowCompletedEvent
from agno.storage.sqlite import SqliteDb
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.newspaper4k import Newspaper4kTools
from agno.utils.log import logger
from agno.utils.pprint import pprint_run_response
from agno.workflow import RunOutput, Workflow
from pydantic import BaseModel, Field


class NewsArticle(BaseModel):
    title: str = Field(..., description="Title of the article.")
    url: str = Field(..., description="Link to the article.")
    summary: Optional[str] = Field(
        ..., description="Summary of the article if available."
    )


class SearchResults(BaseModel):
    articles: list[NewsArticle]


class ScrapedArticle(BaseModel):
    title: str = Field(..., description="Title of the article.")
    url: str = Field(..., description="Link to the article.")
    summary: Optional[str] = Field(
        ..., description="Summary of the article if available."
    )
    content: Optional[str] = Field(
        ...,
        description="Full article content in markdown format. None if content is unavailable.",
    )


class BlogPostGenerator(Workflow):
    """Advanced workflow for generating professional blog posts with proper research and citations."""

    description: str = dedent("""\
    An intelligent blog post generator that creates engaging, well-researched content.
    This workflow orchestrates multiple AI agents to research, analyze, and craft
    compelling blog posts that combine journalistic rigor with engaging storytelling.
    The system excels at creating content that is both informative and optimized for
    digital consumption.
    """)

    # Search Agent: Handles intelligent web searching and source gathering
    searcher: Agent = Agent(
        model=OpenAIChat(id="gpt-5-mini"),
        tools=[DuckDuckGoTools()],
        description=dedent("""\
        You are BlogResearch-X, an elite research assistant specializing in discovering
        high-quality sources for compelling blog content. Your expertise includes:

        - Finding authoritative and trending sources
        - Evaluating content credibility and relevance
        - Identifying diverse perspectives and expert opinions
        - Discovering unique angles and insights
        - Ensuring comprehensive topic coverage\
        """),
        instructions=dedent("""\
        1. Search Strategy 🔍
           - Find 10-15 relevant sources and select the 5-7 best ones
           - Prioritize recent, authoritative content
           - Look for unique angles and expert insights
        2. Source Evaluation 📊
           - Verify source credibility and expertise
           - Check publication dates for timeliness
           - Assess content depth and uniqueness
        3. Diversity of Perspectives 🌐
           - Include different viewpoints
           - Gather both mainstream and expert opinions
           - Find supporting data and statistics\
        """),
        output_schema=SearchResults,
    )

    # Content Scraper: Extracts and processes article content
    article_scraper: Agent = Agent(
        model=OpenAIChat(id="gpt-5-mini"),
        tools=[Newspaper4kTools()],
        description=dedent("""\
        You are ContentBot-X, a specialist in extracting and processing digital content
        for blog creation. Your expertise includes:

        - Efficient content extraction
        - Smart formatting and structuring
        - Key information identification
        - Quote and statistic preservation
        - Maintaining source attribution\
        """),
        instructions=dedent("""\
        1. Content Extraction 📃
           - Extract content from the article
           - Preserve important quotes and statistics
           - Maintain proper attribution
           - Handle paywalls gracefully
        2. Content Processing 🔄
           - Format text in clean markdown
           - Preserve key information
           - Structure content logically
        3. Quality Control ✅
           - Verify content relevance
           - Ensure accurate extraction
           - Maintain readability\
        """),
        output_schema=ScrapedArticle,
    )

    # Content Writer Agent: Crafts engaging blog posts from research
    writer: Agent = Agent(
        model=OpenAIChat(id="gpt-5-mini"),
        description=dedent("""\

```

--------------------------------

### Define Blog Post Generator Workflow with Agno (Python)

Source: https://docs.agno.com/examples/use-cases/workflows/blog-post-generator

This Python script initializes the core structure and components for an advanced blog post generator using the `agno` framework. It sets up necessary imports, defines Pydantic models for data structuring (NewsArticle, SearchResults, ScrapedArticle), and outlines the multi-stage workflow for intelligent web research, content extraction, and professional writing. This serves as the foundational code for an AI-powered content creation studio.

```python
"""🎨 Blog Post Generator v2.0 - Your AI Content Creation Studio!

This advanced example demonstrates how to build a sophisticated blog post generator using
the new workflow v2.0 architecture. The workflow combines web research capabilities with
professional writing expertise using a multi-stage approach:

1. Intelligent web research and source gathering
2. Content extraction and processing
3. Professional blog post writing with proper citations

Key capabilities:
- Advanced web research and source evaluation
- Content scraping and processing
- Professional writing with SEO optimization
- Automatic content caching for efficiency
- Source attribution and fact verification
"""

import asyncio
import json
from textwrap import dedent
from typing import Dict, Optional

from agno.agent import Agent
from agno.db.sqlite import SqliteDb
from agno.models.openai import OpenAIChat
from agno.tools.googlesearch import GoogleSearchTools
from agno.tools.newspaper4k import Newspaper4kTools
from agno.utils.log import logger
from agno.utils.pprint import pprint_run_response
from agno.workflow.workflow import Workflow
from pydantic import BaseModel, Field


# --- Response Models ---
class NewsArticle(BaseModel):
    title: str = Field(..., description="Title of the article.")
    url: str = Field(..., description="Link to the article.")
    summary: Optional[str] = Field(
        ..., description="Summary of the article if available."
    )


class SearchResults(BaseModel):
    articles: list[NewsArticle]


class ScrapedArticle(BaseModel):
    title: str = Field(..., description="Title of the article.")
    url: str = Field(..., description="Link to the article.")
    summary: Optional[str] = Field(
        ..., description="Summary of the article if available."
    )
    content: Optional[str] = Field(
        ...,
        description="Full article content in markdown format. None if content is unavailable.",
    )
```

--------------------------------

### Configure Blog Research AI Agent with Google Search (Python)

Source: https://docs.agno.com/examples/getting-started/19-blog-generator-workflow

This Python code defines an AI agent named "Blog Research Agent" using the `agno` framework. It utilizes an `OpenAIChat` model (gpt-5-mini) and `GoogleSearchTools` to find and evaluate high-quality sources for blog content. The agent's instructions detail its search strategy, source evaluation criteria, and the need for diverse perspectives, outputting results in a `SearchResults` schema.

```python
research_agent = Agent(
    name="Blog Research Agent",
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[GoogleSearchTools()],
    description=dedent("""
    You are BlogResearch-X, an elite research assistant specializing in discovering
    high-quality sources for compelling blog content. Your expertise includes:

    - Finding authoritative and trending sources
    - Evaluating content credibility and relevance
    - Identifying diverse perspectives and expert opinions
    - Discovering unique angles and insights
    - Ensuring comprehensive topic coverage
    """),
    instructions=dedent("""
    1. Search Strategy 🔍
       - Find 10-15 relevant sources and select the 5-7 best ones
       - Prioritize recent, authoritative content
       - Look for unique angles and expert insights
    2. Source Evaluation 📊
       - Verify source credibility and expertise
       - Check publication dates for timeliness
       - Assess content depth and uniqueness
    3. Diversity of Perspectives 🌐
       - Include different viewpoints
       - Gather both mainstream and expert opinions
       - Find supporting data and statistics
    """),
    output_schema=SearchResults,
)
```

--------------------------------

### Create an Interactive Writing Team CLI App in Python

Source: https://docs.agno.com/examples/concepts/teams/other/run_as_cli

This Python script demonstrates how to build an interactive command-line application using the Agno framework to orchestrate a collaborative writing team. It defines distinct AI agents for research, brainstorming, writing, and editing, each with specialized roles and instructions, and integrates them into a `Team` to handle content creation tasks. The example also shows how to set up tools like DuckDuckGo for research and run the team as a CLI application.

```python
"""✍️ Interactive Writing Team - CLI App Example

This example shows how to create an interactive CLI app with a collaborative writing team.

Run `pip install openai agno ddgs` to install dependencies.
"""

from textwrap import dedent

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools

research_agent = Agent(
    name="Research Specialist",
    role="Information Research and Fact Verification",
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    instructions=dedent("""
        You are an expert research specialist! 
        
        Your expertise:
        - **Deep Research**: Find comprehensive, current information on any topic
        - **Fact Verification**: Cross-reference claims and verify accuracy
        - **Source Analysis**: Evaluate credibility and relevance of sources
        - **Data Synthesis**: Organize research into clear, usable insights
        
        Always provide:
        - Multiple reliable sources
        - Key statistics and recent developments
        - Different perspectives on topics
        - Credible citations and links
        """),
)

brainstorm_agent = Agent(
    name="Creative Brainstormer",
    role="Idea Generation and Creative Concepts",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are a creative brainstorming expert! 
        
        Your specialty:
        - **Idea Generation**: Create unique, engaging content concepts
        - **Creative Angles**: Find fresh perspectives on familiar topics
        - **Content Formats**: Suggest various ways to present information
        - **Audience Targeting**: Tailor ideas to specific audiences
        
        Generate:
        - Multiple creative approaches
        - Compelling headlines and hooks
        - Engaging story structures
        - Interactive content ideas
        """),
)

writer_agent = Agent(
    name="Content Writer",
    role="Content Creation and Storytelling",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are a skilled content writer! 
        
        Your craft includes:
        - **Structured Writing**: Create clear, logical content flow
        - **Engaging Style**: Write compelling, readable content
        - **Audience Awareness**: Adapt tone and style for target readers
        - **SEO Knowledge**: Optimize for search and engagement
        
        Create:
        - Well-structured articles and posts
        - Compelling introductions and conclusions
        - Smooth transitions between ideas
        - Action-oriented content
        """),
)

editor_agent = Agent(
    name="Editor",
    role="Content Editing and Quality Assurance",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are a meticulous editor! 
        
        Your expertise:
        - **Grammar & Style**: Perfect language mechanics and flow
        - **Clarity**: Ensure ideas are clear and well-expressed
        - **Consistency**: Maintain consistent tone and formatting
        - **Quality Assurance**: Final review for publication readiness
        
        Focus on:
        - Error-free grammar and punctuation
        - Clear, concise expression
        - Logical structure and flow
        - Professional presentation
        """),
)

writing_team = Team(
    name="Writing Team",
    members=[research_agent, brainstorm_agent, writer_agent, editor_agent],
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=dedent("""
        You are a collaborative writing team that excels at creating high-quality content!
        
        Team Process:
        1. **Research Phase**: Gather comprehensive, current information
        2. **Creative Phase**: Brainstorm unique angles and approaches  
        3. **Writing Phase**: Create structured, engaging content
        4. **Editing Phase**: Polish and perfect the final piece
        
        Collaboration Style:
        - Each member contributes their specialized expertise
        - Build upon each other's contributions
        - Ensure cohesive, high-quality final output
        - Provide diverse perspectives and ideas
        
        Always deliver content that is well-researched, creative,
        expertly written, and professionally edited!
        """),
    show_members_responses=True,
    markdown=True,
)

if __name__ == "__main__":
    print("💡 Tell us about your writing project and watch the team collaborate!")
    print("✏️ Type 'exit', 'quit', or 'bye' to end our session.\n")

    writing_team.cli_app(
        input="Hello! We're excited to work on your writing project. What would you like us to help you create today? Our team can handle research, brainstorming, writing, and editing - just tell us what you need!",
        user="Client",
        emoji="👥",
        stream=True,
    )

```

--------------------------------

### Define AI Agents and Team for Image-to-Story Generation (Python)

Source: https://docs.agno.com/examples/concepts/teams/multimodal/image_to_text

This Python script uses the Agno framework to define an 'Image Analyst' agent and a 'Creative Writer' agent, both powered by OpenAI's GPT-5-mini. It then creates a 'Team' to orchestrate their collaboration, where the Image Analyst describes an image and the Creative Writer crafts a 3-sentence fiction story based on that description. The script includes instructions for each agent and the team, and demonstrates how to run the team with a sample image input.

```python
from pathlib import Path

from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.team import Team

image_analyzer = Agent(
    name="Image Analyst",
    role="Analyze and describe images in detail",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=[
        "Analyze images carefully and provide detailed descriptions",
        "Focus on visual elements, composition, and key details",
    ],
)

creative_writer = Agent(
    name="Creative Writer",
    role="Create engaging stories and narratives",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions=[
        "Transform image descriptions into compelling fiction stories",
        "Use vivid language and creative storytelling techniques",
    ],
)

# Create a team for collaborative image-to-text processing
image_team = Team(
    name="Image Story Team",
    model=OpenAIChat(id="gpt-5-mini"),
    members=[image_analyzer, creative_writer],
    instructions=[
        "Work together to create compelling fiction stories from images.",
        "Image Analyst: First analyze the image for visual details and context.",
        "Creative Writer: Transform the analysis into engaging fiction narratives.",
        "Ensure the story captures the essence and mood of the image.",
    ],
    markdown=True,
)

image_path = Path(__file__).parent.joinpath("sample.jpg")
image_team.print_response(
    "Write a 3 sentence fiction story about the image",
    images=[Image(filepath=image_path)],
)
```

--------------------------------

### Configure Blog Writer AI Agent with Structured Output (Python)

Source: https://docs.agno.com/examples/getting-started/19-blog-generator-workflow

This Python code defines an AI agent named "Blog Writer Agent" using an `OpenAIChat` model. It specializes in crafting engaging blog posts, focusing on viral headlines, compelling introductions, structured content for digital consumption, and SEO optimization. The agent's detailed instructions guide its content strategy, writing excellence, source integration, and digital optimization, explicitly outlining a markdown output structure for the blog post.

```python
blog_writer_agent = Agent(
    name="Blog Writer Agent",
    model=OpenAIChat(id="gpt-5-mini"),
    description=dedent("""
    You are BlogMaster-X, an elite content creator combining journalistic excellence
    with digital marketing expertise. Your strengths include:

    - Crafting viral-worthy headlines
    - Writing engaging introductions
    - Structuring content for digital consumption
    - Incorporating research seamlessly
    - Optimizing for SEO while maintaining quality
    - Creating shareable conclusions
    """),
    instructions=dedent("""
    1. Content Strategy 📝
       - Craft attention-grabbing headlines
       - Write compelling introductions
       - Structure content for engagement
       - Include relevant subheadings
    2. Writing Excellence ✍️
       - Balance expertise with accessibility
       - Use clear, engaging language
       - Include relevant examples
       - Incorporate statistics naturally
    3. Source Integration 🔍
       - Cite sources properly
       - Include expert quotes
       - Maintain factual accuracy
    4. Digital Optimization 💻
       - Structure for scanability
       - Include shareable takeaways
       - Optimize for SEO
       - Add engaging subheadings

    Format your blog post with this structure:
    # {Viral-Worthy Headline}

    ## Introduction
    {Engaging hook and context}

    ## {Compelling Section 1}
    {Key insights and analysis}
    {Expert quotes and statistics}

    ## {Engaging Section 2}
    {Deeper exploration}
    {Real-world examples}

    ## {Practical Section 3}
    {Actionable insights}
    {Expert recommendations}

    ## Key Takeaways
    - {Shareable insight 1}
    - {Practical takeaway 2}
    - {Notable finding 3}

    ## Sources
    {Properly attributed sources with links}
    """),
    markdown=True,
)
```

--------------------------------

### Define Multi-Agent Research Team with Agno in Python

Source: https://docs.agno.com/examples/agent-os/interfaces/ag-ui/team

This Python snippet demonstrates how to define a multi-agent research team using the `agno` library. It initializes a 'researcher' and a 'writer' agent with specific roles, `OpenAIChat` models, and detailed instructions. These agents are then combined into a `Team` with overarching instructions, and the entire setup is integrated with `AgentOS` and an `AGUI` interface for web-based interaction. The main block serves the application.

```python
from agno.agent.agent import Agent
from agno.models.openai import OpenAIChat
from agno.os.app import AgentOS
from agno.os.interfaces.agui.agui import AGUI
from agno.team import Team

researcher = Agent(
    name="researcher",
    role="Research Assistant",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions="You are a research assistant. Find information and provide detailed analysis.",
    markdown=True,
)

writer = Agent(
    name="writer",
    role="Content Writer", 
    model=OpenAIChat(id="gpt-5-mini"),
    instructions="You are a content writer. Create well-structured content based on research.",
    markdown=True,
)

research_team = Team(
    members=[researcher, writer],
    name="research_team",
    instructions="""
    You are a research team that helps users with research and content creation.
    First, use the researcher to gather information, then use the writer to create content.
    """,
    show_members_responses=True,
    get_member_information_tool=True,
    add_member_tools_to_context=True,
)

# Setup our AgentOS app
agent_os = AgentOS(
    teams=[research_team],
    interfaces=[AGUI(team=research_team)],
)
app = agent_os.get_app()


if __name__ == "__main__":
    """Run our AgentOS.

    You can see the configuration and available apps at:
    http://localhost:7777/config

    """
    agent_os.serve(app="research_team:app", reload=True)
```
