# Oneshot Mode Result

**Scenario**: agno:copy-workflow
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:28:38.984Z

---

## Query

Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/agno",
  "topic": "Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs."
}
```

---

## Tool Result

### Define and run a sequential workflow using Agno Steps (Python)

Source: https://docs.agno.com/examples/concepts/workflows/01-basic-workflows/workflow_using_steps

This Python code demonstrates how to build a structured workflow using the Agno framework's `Steps` object. It defines three distinct agents (researcher, writer, editor), individual steps for each agent, then groups these steps into an `article_creation_sequence` using `Steps`. Finally, it instantiates and runs a `Workflow` using this sequence to generate an article, showcasing how to organize and execute a series of actions.

```python
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.workflow.step import Step
from agno.workflow.steps import Steps
from agno.workflow.workflow import Workflow

# Define agents for different tasks
researcher = Agent(
    name="Research Agent",
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    instructions="Research the given topic and provide key facts and insights.",
)

writer = Agent(
    name="Writing Agent",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions="Write a comprehensive article based on the research provided. Make it engaging and well-structured.",
)

editor = Agent(
    name="Editor Agent",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions="Review and edit the article for clarity, grammar, and flow. Provide a polished final version.",
)

# Define individual steps
research_step = Step(
    name="research",
    agent=researcher,
    description="Research the topic and gather information",
)

writing_step = Step(
    name="writing",
    agent=writer,
    description="Write an article based on the research",
)

editing_step = Step(
    name="editing",
    agent=editor,
    description="Edit and polish the article",
)

# Create a Steps sequence that chains these above steps together
article_creation_sequence = Steps(
    name="article_creation",
    description="Complete article creation workflow from research to final edit",
    steps=[research_step, writing_step, editing_step],
)

# Create and use workflow
if __name__ == "__main__":
    article_workflow = Workflow(
        name="Article Creation Workflow",
        description="Automated article creation from research to publication",
        steps=[article_creation_sequence],
    )

    article_workflow.print_response(
        input="Write an article about the benefits of renewable energy",
        markdown=True,
    )
```

--------------------------------

### Define and Run Investment Report Generator Workflow in Python

Source: https://docs.agno.com/examples/use-cases/workflows/investment-report-generator

This Python script defines an 'Investment Report Generator' workflow using Agno's Workflow and SqliteDb classes. It includes an asynchronous 'main' function to prompt the user for company symbols, execute the workflow with dynamic input, and pretty-print the results. The workflow is initialized with steps from 'investment_analysis_execution' and uses a SQLite database for session management.

```python
    """

    return summary


# --- Workflow definition ---
investment_workflow = Workflow(
    name="Investment Report Generator",
    description="Automated investment analysis with market research and portfolio allocation",
    db=SqliteDb(
        session_table="workflow_session",
        db_file="tmp/workflows.db",
    ),
    steps=investment_analysis_execution,
    session_state={},  # Initialize empty workflow session state
)


if __name__ == "__main__":

    async def main():
        from rich.prompt import Prompt

        # Example investment scenarios to showcase the analyzer's capabilities
        example_scenarios = [
            "AAPL, MSFT, GOOGL",  # Tech Giants
            "NVDA, AMD, INTC",  # Semiconductor Leaders
            "TSLA, F, GM",  # Automotive Innovation
            "JPM, BAC, GS",  # Banking Sector
            "AMZN, WMT, TGT",  # Retail Competition
            "PFE, JNJ, MRNA",  # Healthcare Focus
            "XOM, CVX, BP",  # Energy Sector
        ]

        # Get companies from user with example suggestion
        companies = Prompt.ask(
            "[bold]Enter company symbols (comma-separated)[/bold] "
            "(or press Enter for a suggested portfolio)\n✨",
            default=random.choice(example_scenarios),
        )

        print("🧪 Testing Investment Report Generator with New Workflow Structure")
        print("=" * 70)

        result = await investment_workflow.arun(
            input="Generate comprehensive investment analysis and portfolio allocation recommendations",
            companies=companies,
        )

        pprint_run_response(result, markdown=True)

    asyncio.run(main())
```

--------------------------------

### Implement Dynamic Routing in Agno Workflows with Python

Source: https://docs.agno.com/concepts/workflows/workflow-patterns/branching-workflow

This Python code demonstrates how to create a branching workflow using Agno's Router step. It defines a `route_by_topic` function to dynamically select subsequent steps based on the input topic, allowing for expert routing to different agents (tech, business, or general). The workflow then synthesizes the results from the chosen branch, providing a flexible processing pipeline.

```python
from agno.workflow import Router, Step, Workflow

def route_by_topic(step_input) -> List[Step]:
    topic = step_input.input.lower()

    if "tech" in topic:
        return [Step(name="Tech Research", agent=tech_expert)]
    elif "business" in topic:
        return [Step(name="Business Research", agent=biz_expert)]
    else:
        return [Step(name="General Research", agent=generalist)]

workflow = Workflow(
    name="Expert Routing",
    steps=[
        Router(
            name="Topic Router",
            selector=route_by_topic,
            choices=[tech_step, business_step, general_step]
        ),
        Step(name="Synthesis", agent=synthesizer),
    ]
)

workflow.print_response("Latest developments in artificial intelligence and machine learning", markdown=True)
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

### Run Agno Blog Post Generator Workflow with User Input (Python)

Source: https://docs.agno.com/how-to/workflows-migration

This Python script demonstrates how to initialize and execute an `agno` workflow for generating blog posts. It prompts the user for a topic, or uses a random example, converts the topic for a session ID, configures SQLite for caching, and runs the `BlogPostGenerator` workflow. The output is then pretty-printed to the console.

```python
if __name__ == "__main__":
    import random

    from rich.prompt import Prompt

    # Fun example prompts to showcase the generator's versatility
    example_prompts = [
        "Why Cats Secretly Run the Internet",
        "The Science Behind Why Pizza Tastes Better at 2 AM",
        "Time Travelers' Guide to Modern Social Media",
        "How Rubber Ducks Revolutionized Software Development",
        "The Secret Society of Office Plants: A Survival Guide",
        "Why Dogs Think We're Bad at Smelling Things",
        "The Underground Economy of Coffee Shop WiFi Passwords",
        "A Historical Analysis of Dad Jokes Through the Ages",
    ]

    # Get topic from user
    topic = Prompt.ask(
        "[bold]Enter a blog post topic[/bold] (or press Enter for a random example)\n✨",
        default=random.choice(example_prompts),
    )

    # Convert the topic to a URL-safe string for use in session_id
    url_safe_topic = topic.lower().replace(" ", "-")

    # Initialize the blog post generator workflow
    # - Creates a unique session ID based on the topic
    # - Sets up SQLite storage for caching results
    generate_blog_post = BlogPostGenerator(
        session_id=f"generate-blog-post-on-{url_safe_topic}",
        db=SqliteDb(
            db_file="tmp/agno_workflows.db",
        ),
        debug_mode=True,
    )

    # Execute the workflow with caching enabled
    # Returns an iterator of RunOutput objects containing the generated content
    blog_post: Iterator[RunOutputEvent] = generate_blog_post.run(
        topic=topic,
        use_search_cache=True,
        use_scrape_cache=True,
        use_cached_report=True,
    )

    # Print the response
    pprint_run_response(blog_post, markdown=True)
```

--------------------------------

### Implement Conversational Workflow with Conditional Step in Python

Source: https://docs.agno.com/examples/concepts/workflows/06_workflows_advanced_concepts/conversational_workflows/conversational_workflow_with_conditional_step

This Python code defines a conversational workflow using the Agno framework. It sets up multiple agents (Story Writer, Editor, Formatter) and orchestrates them through a workflow that includes a conditional step. The `needs_editing` function dynamically determines if a generated story requires editing based on its length and complexity before proceeding to formatting and adding references. The `main` function demonstrates how to run and interact with the workflow, showing how it handles both new prompts and historical queries.

```python
import asyncio

from agno.agent import Agent
from agno.db.postgres import PostgresDb
from agno.models.openai import OpenAIChat
from agno.workflow import WorkflowAgent
from agno.workflow.condition import Condition
from agno.workflow.step import Step
from agno.workflow.types import StepInput
from agno.workflow.workflow import Workflow

db_url = "postgresql+psycopg://ai:ai@localhost:5532/ai"


# === AGENTS ===
story_writer = Agent(
    name="Story Writer",
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="You are tasked with writing a 100 word story based on a given topic",
)

story_editor = Agent(
    name="Story Editor",
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="Review and improve the story's grammar, flow, and clarity",
)

story_formatter = Agent(
    name="Story Formatter",
    model=OpenAIChat(id="gpt-4o-mini"),
    instructions="Break down the story into prologue, body, and epilogue sections",
)


# === CONDITION EVALUATOR ===
def needs_editing(step_input: StepInput) -> bool:
    """Determine if the story needs editing based on length and complexity"""
    story = step_input.previous_step_content or ""

    # Check if story is long enough to benefit from editing
    word_count = len(story.split())

    # Edit if story is more than 50 words or contains complex punctuation
    return word_count > 50 or any(punct in story for punct in ["!", "?", ";", ":"])


def add_references(step_input: StepInput):
    """Add references to the story"""
    previous_output = step_input.previous_step_content

    if isinstance(previous_output, str):
        return previous_output + "\n\nReferences: https://www.agno.com"


# === WORKFLOW STEPS ===
write_step = Step(
    name="write_story",
    description="Write initial story",
    agent=story_writer,
)

edit_step = Step(
    name="edit_story",
    description="Edit and improve the story",
    agent=story_editor,
)

format_step = Step(
    name="format_story",
    description="Format the story into sections",
    agent=story_formatter,
)

# Create a WorkflowAgent that will decide when to run the workflow
workflow_agent = WorkflowAgent(model=OpenAIChat(id="gpt-4o-mini"), num_history_runs=4)

# === WORKFLOW WITH CONDITION ===
workflow = Workflow(
    name="Story Generation with Conditional Editing",
    description="A workflow that generates stories, conditionally edits them, formats them, and adds references",
    agent=workflow_agent,
    steps=[
        write_step,
        Condition(
            name="editing_condition",
            description="Check if story needs editing",
            evaluator=needs_editing,
            steps=[edit_step],
        ),
        format_step,
        add_references,
    ],
    db=PostgresDb(db_url),
)


async def main():
    """Async main function"""
    print("\n" + "=" * 80)
    print("WORKFLOW WITH CONDITION - ASYNC STREAMING")
    print("=" * 80)

    # First call - will run the workflow with condition
    print("\n" + "=" * 80)
    print("FIRST CALL: Tell me a story about a brave knight")
    print("=" * 80)
    await workflow.aprint_response(
        "Tell me a story about a brave knight",
        stream=True,
        stream_events=True,
    )

    # Second call - should answer from history without re-running workflow
    print("\n" + "=" * 80)
    print("SECOND CALL: What was the knight's name?")
    print("=" * 80)
    await workflow.aprint_response(
        "What was the knight's name?",
        stream=True,
        stream_events=True,
    )

    # Third call - new topic, should run workflow again
    print("\n" + "=" * 80)
    print("THIRD CALL: Now tell me about a cat")
    print("=" * 80)
    await workflow.aprint_response(
        "Now tell me about a cat",
        stream=True,
        stream_events=True,
    )


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Python: Run Agno Workflow with Image Input and Print Response

Source: https://docs.agno.com/concepts/workflows/input-and-output

This example illustrates how to create and run an Agno workflow that processes an image. It defines agents for image analysis and news research, sets up steps, and then executes the workflow by passing an `Image` object as input to `media_workflow.print_response()` for direct output.

```python
from agno.agent import Agent
from agno.media import Image
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.workflow import Step, Workflow
from agno.db.sqlite import SqliteDb

# Define agents
image_analyzer = Agent(
    name="Image Analyzer",
    model=OpenAIChat(id="gpt-5-mini"),
    instructions="Analyze the provided image and extract key details, objects, and context.",
)

news_researcher = Agent(
    name="News Researcher", 
    model=OpenAIChat(id="gpt-5-mini"),
    tools=[DuckDuckGoTools()],
    instructions="Search for latest news and information related to the analyzed image content.",
)

# Define steps
analysis_step = Step(
    name="Image Analysis Step",
    agent=image_analyzer,
)

research_step = Step(
    name="News Research Step", 
    agent=news_researcher,
)

# Create workflow with media input
media_workflow = Workflow(
    name="Image Analysis and Research Workflow",
    description="Analyze an image and research related news",
    steps=[analysis_step, research_step],
    db=SqliteDb(db_file="tmp/workflow.db"),
)

# Run workflow with image input
if __name__ == "__main__":
    media_workflow.print_response(
        input="Please analyze this image and find related news",
        images=[
            Image(url="https://upload.wikimedia.org/wikipedia/commons/0/0c/GoldenGateBridge-001.jpg")
        ],
        markdown=True,
    )
```

--------------------------------

### Define Named Steps in Agno Workflow (Python)

Source: https://docs.agno.com/concepts/workflows/workflow-patterns/step-based-workflow

This Python example illustrates how to construct an Agno `Workflow` where each `Step` is assigned a meaningful name. Named steps are crucial for enhanced logging, easier identification of process stages on the Agno platform, and more intuitive access to individual step outputs.

```python
from agno.workflow import Step, Workflow

# Named steps for better tracking
workflow = Workflow(
    name="Content Creation Pipeline",
    steps=[
        Step(name="Research Phase", team=researcher),
        Step(name="Analysis Phase", executor=custom_function),
        Step(name="Writing Phase", agent=writer),
    ]
)

workflow.print_response(
    "AI trends in 2024",
    markdown=True,
)
```

--------------------------------

### Define and Run a Basic Linear Agno Workflow in Python

Source: https://docs.agno.com/concepts/workflows/running-workflow

This snippet demonstrates how to define a simple linear workflow using Agno, incorporating agents and a conditional step. It also shows the asynchronous execution of the workflow and how to print the final response.

```python
basic_workflow = Workflow(
    name="Basic Linear Workflow",
    description="Research -> Summarize -> Condition(Fact Check) -> Write Article",
    steps=[
        research_step,
        summarize_step,
        Condition(
            name="fact_check_condition",
            description="Check if fact-checking is needed",
            evaluator=needs_fact_checking,
            steps=[fact_check_step],
        ),
        write_article,
    ],
)

async def main():
    try:
        response: WorkflowRunOutput = await basic_workflow.arun(
            input="Recent breakthroughs in quantum computing",
        )
        pprint_run_response(response, markdown=True)
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
```
