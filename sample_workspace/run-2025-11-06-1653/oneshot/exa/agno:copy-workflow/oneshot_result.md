# Oneshot Mode Result

**Scenario**: agno:copy-workflow
**Package**: agno
**Registry**: py_pi
**Context7 ID**: /websites/agno
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:53:32.930Z

---

## Query

Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs.

---

## Tool Input

```json
{
  "query": "Using the Agno Python framework's workflow system, build a deterministic copy generation workflow. From a spec, produce a short landing page (headline, 3 benefits, CTA) and then a Spanish translation. Keep style crisp and product-led. Make the process deterministic and show step outputs."
}
```

---

## Tool Result

## Prompt Chaining for Marketing Copy Creation and Translation

https://raw.githubusercontent.com/latitude-dev/latitude-llm/main/docs/examples/cases/building-effective-agents/prompt-chaining.mdx

```
---
provider: openai
model: gpt-4.1
temperature: 0.7
---

<step as="marketing_copy">
  <system>
    You are a creative marketing copywriter. Create compelling marketing copy for the given product.
  </system>

  <user>
  Create marketing copy for: {{ product_description }}
  Target audience: {{ target_audience }}
  Tone: {{ tone }}
  Length: {{ length }}
  </user>
</step>

<step as="translation">
  <system>
    You are a professional translator with marketing expertise.
    Translate the provided marketing copy while maintaining its persuasive impact and cultural relevance.
  </system>

  <user>
  Translate the following marketing copy to {{ target_language }}:

  {{ marketing_copy }}

  Ensure the translation:
  1. Maintains the original tone and persuasive impact
  2. Adapts cultural references appropriately
  3. Uses marketing language natural to {{ target_language }} speakers
  </user>
</step>

<system>
  You are a quality assurance specialist. Review both the original and translated marketing copy to ensure quality and consistency.
</system>

<user>
  Review the marketing copy creation and translation process:

  Original copy:
  {{ marketing_copy }}

  Translated copy:
  {{ translation }}

  Provide:
  1. Quality assessment (1-10)
  2. Any improvements needed
  3. Final recommendation
</user>
```

## Multilingual Marketing Copy Generation Workflow

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/backup_recent/07c_langgraph_functional_api/04_prompt_chaining_pattern/multilingual_marketing_copy/README.md

```
flowchart TD
    A[Input: Topic & Languages] --> B[Generate Marketing Copy]
    B --> C[Translate to Target Languages]
    C --> D[Create Markdown Document]
    D --> E[Save Markdown File]
    E --> F[Generate Individual Language Files]
    F --> G[Save Language-Specific TXT Files]
    E --> H[Save Complete Markdown File]

    style A fill:#e1f5fe,stroke:#222,stroke-width:2px,color:#111
    style B fill:#fff3e0,stroke:#222,stroke-width:2px,color:#111
    style C fill:#fff3e0,stroke:#222,stroke-width:2px,color:#111
    style D fill:#f3e5f5,stroke:#222,stroke-width:2px,color:#111
    style E fill:#f3e5f5,stroke:#222,stroke-width:2px,color:#111
    style F fill:#f3e5f5,stroke:#222,stroke-width:2px,color:#111
    style G fill:#e8f5e9,stroke:#222,stroke-width:2px,color:#111
    style H fill:#e8f5e9,stroke:#222,stroke-width:2px,color:#111
```

## Run Content Creation Workflow with workflow.py

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/workflows/content_creator_workflow/readme.md

```
python workflow.py
```

## Prompt Chaining for Marketing Copy Generation and Translation

https://raw.githubusercontent.com/julep-ai/julep/main/documentation/advanced/agentic-patterns.mdx

```
main:
# Step 1: Generate initial content
- prompt:
   role: system
   content: >-
      $ f'''Generate marketing copy for product X based on the following:
      target_audience: {_.audience}
      product_features: {_.features}
      keywords: {_.seo_keywords}'''
   unwrap: true

# Step 2: Quality check gate
- evaluate:
   quality_check: $ _.content

# Step 3: Translation
- prompt:
   role: system
   content: Translate the approved content to Spanish
   unwrap: true
```

## generate_marketing_content: Create, Review, and Translate Copy

https://raw.githubusercontent.com/Siddhant-Goswami/100x-LLM/main/llm_workflows/README.md

```
TRANSLATE_TEMPLATE = """
Translate the following marketing copy to {target_language}:
Copy: {reviewed_copy}
...
"""
```

## Generate and Translate Marketing Copy for AI Agents

https://raw.githubusercontent.com/triggerdotdev/trigger.dev/main/docs/guides/ai-agents/generate-translate-copy.mdx

```
{
  marketingSubject: "The controversial new Jaguar electric concept car",
  targetLanguage: "Spanish",
  targetWordCount: 100,
}
```

## Implement Dependency-Aware Application Deployment Workflow

https://raw.githubusercontent.com/Abiorh001/mcp_omni_connect/main/docs/features/tool-orchestration.md

```
> Deploy application: build, test, deploy, then notify

🤖 Dependency-aware execution:

Phase 1 (Sequential):
🔧 build_application → ✅ (3.2s)
🔧 run_tests ← build artifacts → ✅ (5.7s)

Phase 2 (Parallel):
🔧 deploy_staging ← test results → ✅ (12.3s)
🔧 update_documentation → ✅ (4.1s)
🔧 prepare_notifications → ✅ (0.5s)

Phase 3 (Final):
🔧 send_deployment_notification ← all results → ✅ (1.2s)

Total time: 22.7s (vs 27.0s sequential)
```

## Composable Workflow with PDF Processing Verbs

https://raw.githubusercontent.com/MaximeRivest/attachments/main/docs/architecture/architecture.md

```
# Composable verbs for complex workflows
insights = (attach("report.pdf")
           | load.pdf_to_pdfplumber    # File → Object
           | split.pages               # Object → Collection  
           | present.markdown          # Extract content
           | refine.add_headers        # Polish content
           | adapt.claude("Analyze"))  # Format for AI
```

## Defines Marketing Agent System Structure and Workflow

https://raw.githubusercontent.com/davidkimai/Context-Engineering/main/.claude/commands/marketing.agent.md

```
/marketing.agent.system.prompt.md
├── [meta]            # Protocol version, audit, runtime, namespaces
├── [instructions]    # Agent rules, invocation, argument mapping
├── [ascii_diagrams]  # File tree, campaign workflow, feedback cycles
├── [context_schema]  # JSON/YAML: marketing/session/goal fields
├── [workflow]        # YAML: campaign phases
├── [tools]           # YAML/fractal.json: tool registry & control
├── [recursion]       # Python: analytics/feedback loop
├── [examples]        # Markdown: sample campaigns, analytics logs
```

## /sc:workflow Command for Implementation Workflow Generation

https://raw.githubusercontent.com/SuperClaude-Org/SuperClaude_Framework/main/Docs/commands-guide.md

```
/sc:workflow docs/feature-100-prd.md --strategy systematic --c7 --sequential
/sc:workflow "user authentication system" --persona security --output detailed
/sc:workflow payment-api --strategy mvp --risks --dependencies
```

## summarizeContent Function for Processing Website Content

https://raw.githubusercontent.com/pgflow-dev/pgflow/main/pkgs/website/src/content/docs/how-to/create-reusable-tasks.mdx

```
// Good: Task accepts direct content parameter
async function summarizeContent(content: string) {
  // Process the content directly
  return { summary: "Processed summary..." };
}

// In your flow:
.step(
  { slug: 'summary', dependsOn: ['website'] },
  async (input) => await summarizeContent(input.website.content)
)
```

## Create Fact Extraction Workflows for Production and Debugging

https://raw.githubusercontent.com/quantalogic/quantalogic/main/quantalogic_flow/examples/questions_and_answers/WORKFLOW_IMPROVEMENTS.md

```
# Use the streamlined version for production
workflow = create_fact_extraction_workflow()

# Use the detailed version for debugging/education  
workflow = create_fact_extraction_workflow_detailed()
```

## Clone Serverless Workflow CTK Repository

https://raw.githubusercontent.com/serverlessworkflow/specification/main/ctk/README.md

```
git clone https://github.com/serverlessworkflow/specification.git
```

## Defines GoodWorkflow for Deterministic Execution in GenSX

https://raw.githubusercontent.com/gensx-inc/gensx/main/website/docs/src/content/durable-execution.mdx

```
// ❌ Breaks replay
const BadWorkflow = gensx.Component("Bad", async () => {
  return await ProcessData({
    timestamp: Date.now(),
    randomId: Math.random()
  });
});

// ✅ Safe for replay
const GoodWorkflow = gensx.Component(
  "Good",
  async ({ timestamp, randomId }) => {
    return await ProcessData({ timestamp, randomId });
  }
);
```

## CreateSpecForECProductManagementSystem

https://raw.githubusercontent.com/wasabeef/claude-code-cookbook/main/locales/en/commands/spec.md

```
"Create a spec for an EC site product management system"
→ Concept to working prototype in one weekend
→ Consistent quality from prototype to production
→ Structured approach through spec-driven development
```

## Implements MkDocs Translation Process for Documentation

https://raw.githubusercontent.com/fastapi/fastapi/main/docs/en/docs/contributing.md

```
docs/en/docs/features.md
```

## Workflows and agents - Docs by LangChain

https://docs.langchain.com/oss/python/langgraph/workflows-agents

```
from langgraph.graph import MessagesState
from langchain.messages import SystemMessage, HumanMessage, ToolMessage
# Nodes
def llm_call(state : MessagesState):
"""LLM decides whether to call a tool or not"""
return{
"messages" : [
llm_with_tools.invoke(
[
SystemMessage(
content="You are a helpful assistant tasked with performing arithmetic on a set of inputs."
)
]
+state[ "messages"]
)
]
}
def tool_node(state:dict ):
"""Performs the tool call"""
result=[]
for tool_call in state[ "messages" ][-1 ].tool_calls:
tool=tools_by_name[tool_call[ "name" ]]
observation=tool.invoke(tool_call[ "args" ])
result.append(ToolMessage( content=observation, tool_call_id=tool_call[ "id" ]))
return{"messages" : result}
# Conditional edge function to route to the tool node or end based upon whether the LLM made a tool call
def should_continue(state : MessagesState) -> Literal[ "tool_node",END ]:
"""Decide if we should continue the loop or stop based upon whether the LLM made a tool call"""
messages=state[ "messages"]
last_message=messages[-1]
# If the LLM makes a tool call, then perform an action
if last_message.tool_calls:
return "tool_node"
# Otherwise, we stop (reply to the user)
return END
# Build workflow
agent_builder=StateGraph(MessagesState)
# Add nodes
agent_builder.add_node( "llm_call" , llm_call)
agent_builder.add_node( "tool_node" , tool_node)
# Add edges to connect nodes
agent_builder.add_edge( START,"llm_call")
agent_builder.add_conditional_edges(
"llm_call",
should_continue,
["tool_node",END]
)
agent_builder.add_edge( "tool_node","llm_call")
# Compile the agent
agent=agent_builder.compile()
# Show the agent
display(Image(agent.get_graph( xray=True ).draw_mermaid_png()))
# Invoke
messages=[HumanMessage( content="Add 3 and 4." )]
messages=agent.invoke({ "messages" : messages})
for m in messages[ "messages" ]:
m.pretty_print()
```

## ConceptExtractorAgent and WriterAgent for Beverage Bottles

https://raw.githubusercontent.com/MicrosoftDocs/semantic-kernel-docs/main/semantic-kernel/Frameworks/agent/agent-orchestration/sequential.md

```
# ConceptExtractorAgent
- Key Features:
- Made of eco-friendly stainless steel
- Keeps drinks cold for 24 hours
...
# WriterAgent
Keep your beverages refreshingly chilled all day long with our eco-friendly stainless steel bottles...
# FormatProofAgent
Keep your beverages refreshingly chilled all day long with our eco-friendly stainless steel bottles...
***** Final Result *****
Keep your beverages refreshingly chilled all day long with our eco-friendly stainless steel bottles...
```

## Crafting Beginner-Friendly Tech Articles with Agno Workflows and Streamlit

https://www.bitdoze.com/agno-workflow-writing-team/

```
# beginner_article_workflow_streamlit.py
import os
import json
import logging
import re
import traceback
import time
from textwrap import dedent
from typing import Dict, Iterator, List, Optional
import streamlit as st
from dotenv import load_dotenv
from pydantic import BaseModel, Field, ValidationError
# Agno Imports
from agno.agent import Agent
from agno.models.openrouter import OpenRouter
from agno.run.response import RunEvent, RunResponse
from agno.storage.sqlite import SqliteStorage
from agno.tools.crawl4ai import Crawl4aiTools
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.workflow import Workflow
# --- Basic Logging Setup ---
logging.basicConfig( level=logging. INFO,format='%(asctime)s-%(levelname)s-%(message)s')
logger=logging.getLogger( __name__)
# --- Configuration ---
load_dotenv()
OPENROUTER_API_KEY=os.getenv( "OPENROUTER_API_KEY")
# --- Custom JSON Serializer ---
def default_serializer (obj):
"""JSON serializer for objects not serializable by default json code"""
if isinstance (obj, set ):
return list (obj)
raise TypeError(f "Object of type {type (obj). __name__} is not JSON serializable by default_serializer")
# --- Pydantic Models ---
class ResearchFinding(BaseModel ):
url: str=Field( ...,description="Source URL of the information.")
summary: str=Field( ...,description="Concise summary of the key information relevant to the topic.")
content_snippet: Optional[ str]=Field( None,description="A relevant short quote or snippet from the source.")
class ResearchSummary(BaseModel ):
key_findings: List[ResearchFinding]=Field( ...,description="A list of key findings from the research.")
overall_summary: str=Field( ...,description="A brief overall synthesis of the research conducted.")
class ArticleOutline(BaseModel ):
title: str=Field( ...,description="Proposed title for the article, engaging for beginners.")
sections: List[ str]=Field( ...,description="A list of section titles for the article structure, logical for a beginner learning the topic.")
keywords: List[ str]=Field( ...,description="List of relevant SEO keywords, including beginner-related terms.")
class SectionDraft(BaseModel ):
section_title: str=Field( ...,description="The title of the section being drafted.")
content: str=Field( ...,description="The drafted content for this section, formatted in Markdown. Include code blocks with explanations, tables, lists, etc. Aim for clarity and detail suitable for beginners.")
# --- Beginner Article Workflow ---
class BeginnerArticleWorkflow(Workflow ):
"""
A workflow that orchestrates agents to research, outline, write (section by section),
and edit a technical article specifically tailored for beginners.
Errors during execution will raise Exceptions. Yields final result on completion.
"""
description: str="Generates beginner-friendly technical articles."
researcher: Agent
outliner: Agent
writer: Agent
editor: Agent
def __init__(
self,
api_key: str,
model_id: str,
max_tokens: int,
session_id: str,
storage: Optional[SqliteStorage]=None,
debug_mode: bool=False,
max_writer_retries: int=2,
):
super (). __init__(session_id=session_id, storage=storage, debug_mode=debug_mode)
self .max_writer_retries=max_writer_retries
if not api_key:
raise ValueError("OpenRouter API Key is required for BeginnerArticleWorkflow.")
common_model_args={"id" : model_id, "api_key" : api_key, "max_tokens" : max_tokens}
writer_tokens=max (max_tokens, 8192)
editor_tokens=max (max_tokens, 8192)
writer_model_args={"id" : model_id, "api_key" : api_key, "max_tokens" : writer_tokens}
editor_model_args={"id" : model_id, "api_key" : api_key, "max_tokens" : editor_tokens}
# Initialize Agents with full prompts
self .researcher=Agent(
name="TechResearcherBeginnerFocus",
model=OpenRouter( ** common_model_args),
tools=[DuckDuckGoTools( search=True,news=True ), Crawl4aiTools( max_length=10000 )],
description="Expert tech researcher finding and synthesizing information on dev/tech topics for a beginner audience.",
instructions=dedent( """\
Your goal is to research the given topic thoroughly, focusing on information accessible to beginners.
1. Use DuckDuckGo to find 5-7 highly relevant and recent online sources (articles, docs, blog posts).
2. **Prioritize:** Official 'getting started' guides, tutorials, reputable tech blogs known for clear explanations, and foundational documentation. Avoid overly academic papers or highly advanced discussions unless essential.
3. For each promising source URL, use `web_crawler` to extract main content.
4. Synthesize the information, identifying key concepts, simple definitions, introductory code examples, benefits, common use cases, and potential beginner challenges.
5. Provide a structured summary. Output MUST be `ResearchSummary` JSON.
""" ),
response_model=ResearchSummary, markdown=True,add_history_to_messages=False,exponential_backoff=True
)
self .outliner=Agent(
name="BeginnerArticleOutliner",
model=OpenRouter( ** common_model_args),
description="Structures technical articles logically for beginners.",
instructions=dedent( """\
Given a research summary, create a logical article outline tailored for beginners.
1. **Title:** Craft a compelling title that clearly indicates the topic and suggests it's beginner-friendly (e.g., "Introduction to X", "Getting Started with Y").
2. **Sections:** Structure the article logically for learning. Start with basics, then build up. Include sections like:
* Introduction (What is it? Why care?)
* Key Concepts/Terminology (Define important terms simply)
* Getting Started / Core How-To (Simple, practical examples)
* Code Examples Explained (If applicable, focus on clarity)
* Benefits / Use Cases (Why is this useful?)
* Potential Challenges for Beginners (Common pitfalls/tips)
* Conclusion / Next Steps
3. **Keywords:** Include relevant SEO keywords, focusing on beginner terms (e.g., "tutorial", "basics", "introduction", "for beginners").
4. Output MUST be `ArticleOutline` JSON.
""" ),
add_history_to_messages=False,response_model=ArticleOutline, markdown=False,exponential_backoff=True
)
self .writer=Agent(
name="BeginnerTechWriter",
model=OpenRouter( ** writer_model_args),
description="Writes a detailed, engaging technical article *section* specifically for beginners.",
instructions=dedent( """\
You are a skilled senior technical writer specializing in making complex topics easy for **beginners**.
You will receive:
a) The overall research summary (for facts).
b) The article outline (for structure context).
c) The specific `section_title` you need to write content for.
Your task is to write the content ONLY for the specified `section_title`, targeting **complete beginners** to this specific topic.
1. **Accuracy:** Use the research summary for technical facts.
2. **Clarity is Key:** Explain concepts as simply as possible. Define technical terms immediately. Use analogies or real-world examples if helpful. Avoid unnecessary jargon. Assume minimal prior knowledge.
3. **Code/Command Explanations:** If including code snippets (```language) or commands (` `):
* Provide a **clear, step-by-step explanation** for each line or significant part.
* Explain the *purpose* of the code/command.
* Describe the expected input and output (if applicable).
* Keep initial examples simple.
4. **Structure & Formatting:**
* Use Markdown extensively and correctly: `###` or `####` for sub-headings, **Bold**, *Italics*, ` ` for inline code, ```language ... ``` for blocks, bullet points (`*` or `-`), numbered lists (`1.`, `2.`), tables.
5. **Engagement:** Start sections engagingly. Write in a slightly personal but professional and encouraging tone.
6. **Detail:** Aim for sufficient detail to be genuinely helpful to a beginner. Prioritize clarity and thorough explanation over strict word count (~400 words is a rough guide, more is fine if needed for clarity).
7. **Focus:** Do NOT write the main section title (like `## Section Title`) in your content. Do NOT write content for other sections. Focus *only* on the requested `section_title`.
8. Output MUST be a `SectionDraft` JSON object containing the `section_title` you were given and the `content` you wrote.
""" ),
response_model=SectionDraft, add_history_to_messages=False,markdown=True,exponential_backoff=True
)
self .editor=Agent(
name="BeginnerFocusedEditor",
model=OpenRouter( ** editor_model_args),
description="Polishes a full article draft, ensuring clarity for beginners.",
instructions=dedent( """\
You are reviewing a complete article draft (in Markdown) assembled from sections written for beginners. You will receive the draft and the original outline.
Your task is to perform final polishing:
1. **Clarity for Beginners:** Read through from the perspective of someone new to the topic. Is it clear? Is jargon explained? Are explanations thorough enough? Add minor clarifications if needed.
2. **Consistency:** Ensure consistent terminology, tone, and code/command formatting across sections.
3. **Flow & Grammar:** Perform minor edits for smooth transitions, grammar, spelling, and punctuation
```

## Defines NStack Workflow for PostgreSQL Data Transformation

https://raw.githubusercontent.com/nstack/nstack/main/README.md

```
module Demo:0.1.0 {
  import NStack.Transformers:0.1.4 as T
  import Acme.Classifiers:0.3.0 as C

  // our analytics workflow
  def workflow = Sources.Postgresql<(Text, Int)> 
                 | T.transform { strength = 5 }
                 | C.classify { model = "RandomForest" }
                 | Sinks.S3blob<Text>
}
```

## Create Article Creation Workflow with Steps and Workflow

https://raw.githubusercontent.com/agno-agi/agno/main/cookbook/workflows_2/README.md

```
from agno.workflow.v2 import Steps, Step, Workflow

# Create a reusable content creation sequence
article_creation_sequence = Steps(
    name="ArticleCreation",
    description="Complete article creation workflow from research to final edit",
    steps=[
        Step(name="research", agent=researcher),
        Step(name="writing", agent=writer), 
        Step(name="editing", agent=editor),
    ],
)

# Use the sequence in a workflow
workflow = Workflow(
    name="Article Creation 
```
