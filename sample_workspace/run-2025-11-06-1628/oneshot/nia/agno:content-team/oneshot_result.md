# Oneshot Mode Result

**Scenario**: agno:content-team
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:39.943Z

---

## Query

Using the Agno Python framework with multi-agent teams, create a content generation system for launching a stainless, eco-friendly water bottle. Build a team that produces a 1-page blog post: (a) outline, (b) 3-5 credible source links, (c) final copy in markdown. The writer must cite the researcher's sources, and the planner should ensure a clear buyer persona.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "agno",
  "semantic_queries": [
    "Using the Agno Python framework with multi-agent teams, create a content generation system for launching a stainless, eco-friendly water bottle. Build a team that produces a 1-page blog post: (a) outline, (b) 3-5 credible source links, (c) final copy in markdown. The writer must cite the researcher's sources, and the planner should ensure a clear buyer persona."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: agno (py_pi)
**Queries:**
- Using the Agno Python framework with multi-agent teams, create a content generation system for launching a stainless, eco-friendly water bottle. Build a team that produces a 1-page blog post: (a) outline, (b) 3-5 credible source links, (c) final copy in markdown. The writer must cite the researcher's sources, and the planner should ensure a clear buyer persona.

**Version:** 2.2.6

**Found 2 relevant code sections**

## Result 1
**File:** `cookbook/teams/other/input_as_messages_list.py`
**SHA256:** `9ede85f1576a6a571bf423e94e5ef79d3645cd0459223d85c794abd360cd0fe0`
**Lines:** 1-44
**Language:** Python
```
from agno.agent import Agent
from agno.models.message import Message
from agno.team import Team

# Create a research team
research_team = Team(
    name="Research Team",
    members=[
        Agent(
            name="Sarah",
            role="Data Researcher",
            instructions="Focus on gathering and analyzing data",
        ),
        Agent(
            name="Mike",
            role="Technical Writer",
            instructions="Create clear, concise summaries",
        ),
    ],
    stream=True,
    markdown=True,
)

research_team.print_response(
    [
        Message(
            role="user",
            content="I'm preparing a presentation for my company about renewable energy adoption.",
        ),
        Message(
            role="assistant",
            content="I'd be happy to help with your renewable energy presentation. What specific aspects would you like me to focus on?",
        ),
        Message(
            role="user",
            content="Could you research the latest solar panel efficiency improvements in 2024?",
        ),
        Message(
            role="user",
            content="Also, please summarize the key findings in bullet points for my slides.",
        ),
    ],
    markdown=True,
)

```

## Result 2
**File:** `cookbook/teams/other/run_as_cli.py`
**SHA256:** `e304db9b4fb50434e789cd82cfe7b55b56e76884f5ab268405928c1e384f0591`
**Lines:** 1-98
**Language:** Python
```
"""✍️ Interactive Writing Team - CLI App Example

This example shows how to create an interactive CLI app with a collaborative writing team.

Run `pip install openai agno duckduckgo-search` to install dependencies.
"""

from textwrap import dedent

from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.team import Team
from agno.tools.duckduckgo import DuckDuckGoTools

research_agent = Agent(
    name="Research Specialist",
    role="Information Research and Fact Verification",
    model=OpenAIChat(id="gpt-4o-mini"),
    tools=[DuckDuckGoTools()],
    instructions=dedent("""\
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
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions=dedent("""\
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
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions=dedent("""\
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
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions=dedent("""\
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
```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
