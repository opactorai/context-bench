# Oneshot Mode Result

**Scenario**: langgraph:parallel-brief
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:55:15.778Z

---

## Query

Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report.

---

## Tool Input

```json
{
  "query": "Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report."
}
```

---

## Tool Result

## Report Generation Workflow with LangChain and Zod

https://raw.githubusercontent.com/langchain-ai/langgraphjs/main/docs/docs/tutorials/workflows/index.md

```
import { z } from "zod";
    import { task, entrypoint } from "@langchain/langgraph";

    // Schema for structured output to use in planning
    const sectionSchema = z.object({
      name: z.string().describe("Name for this section of the report."),
      description: z.string().describe(
        "Brief overview of the main topics and concepts to be covered in this section."
      ),
    });

    const sectionsSchema = z.object({
      sections: z.array(sectionSchema).describe("Sections of the report."),
    });

    // Augment the LLM with schema for structured output
    const planner = llm.withStructuredOutput(sectionsSchema);

    // Tasks
    const orchestrator = task("orchestrator", async (topic: string) => {
      // Generate queries
      const reportSections = await planner.invoke([
        { role: "system", content: "Generate a plan for the report." },
        { role: "user", content: `Here is the report topic: ${topic}` },
      ]);

      return reportSections.sections;
    });

    const llmCall = task("sectionWriter", async (section: z.infer<typeof sectionSchema>) => {
      // Generate section
      const result = await llm.invoke([
        {
          role: "system",
          content: "Write a report section.",
        },
        {
          role: "user",
          content: `Here is the section name: ${section.name} and description: ${section.description}`,
        },
      ]);

      return result.content;
    });

    const synthesizer = task("synthesizer", async (completedSections: string[]) => {
      // Synthesize full report from sections
      return completedSections.join("\n\n---\n\n");
    });

    // Build workflow
    const workflow = entrypoint(
      "orchestratorWorker",
      async (topic: string) => {
        const sections = await orchestrator(topic);
        const completedSections = await Promise.all(
          sections.map((section) => llmCall(section))
        );
        return synthesizer(completedSections);
      }
    );

    // Invoke
    const stream = await workflow.stream("Create a report on LLM scaling laws", {
      streamMode: "updates",
    });

    for await (const step of stream) {
      console.log(step);
    }
```

## Built with LangGraph! #11: Parallelization | by Okan Yenigün

https://medium.com/codetodeploy/built-with-langgraph-11-parallelization-efa2ccdba2e0

```
["I'm A", "I'm B", "I'm C", "I'm B2", "I'm D"]
```

## Parallel LLM Calls for Joke, Story, and Poem Generation

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/tutorials/workflows.md

```
// Graph state
    const State = z.object({
      topic: z.string(),
      joke: z.string().optional(),
      story: z.string().optional(),
      poem: z.string().optional(),
      combined_output: z.string().optional(),
    });

    // Nodes
    const callLlm1 = async (state: z.infer<typeof State>) => {
      // First LLM call to generate initial joke
      const msg = await llm.invoke(`Write a joke about ${state.topic}`);
      return { joke: msg.content };
    };

    const callLlm2 = async (state: z.infer<typeof State>) => {
      // Second LLM call to generate story
      const msg = await llm.invoke(`Write a story about ${state.topic}`);
      return { story: msg.content };
    };

    const callLlm3 = async (state: z.infer<typeof State>) => {
      // Third LLM call to generate poem
      const msg = await llm.invoke(`Write a poem about ${state.topic}`);
      return { poem: msg.content };
    };

    const aggregator = (state: z.infer<typeof State>) => {
      // Combine the joke and story into a single output
      let combined = `Here's a story, joke, and poem about ${state.topic}!\n\n`;
      combined += `STORY:\n${state.story}\n\n`;
      combined += `JOKE:\n${state.joke}\n\n`;
      combined += `POEM:\n${state.poem}`;
      return { combined_output: combined };
    };

    // Build workflow
    const parallelBuilder = new StateGraph(State)
      .addNode("call_llm_1", callLlm1)
      .addNode("call_llm_2", callLlm2)
      .addNode("call_llm_3", callLlm3)
      .addNode("aggregator", aggregator)
      .addEdge(START, "call_llm_1")
      .addEdge(START, "call_llm_2")
      .addEdge(START, "call_llm_3")
      .addEdge("call_llm_1", "aggregator")
      .addEdge("call_llm_2", "aggregator")
      .addEdge("call_llm_3", "aggregator")
      .addEdge("aggregator", END);

    const parallelWorkflow = parallelBuilder.compile();

    // Invoke
    const state = await parallelWorkflow.invoke({ topic: "cats" });
    console.log(state.combined_output);
```

## write_report function in LangGraph Research Assistant

https://raw.githubusercontent.com/LangChain-OpenTutorial/LangChain-OpenTutorial/main/docs/17-LangGraph/03-Use-Cases/10-LangGraph-Research-Assistant.md

```
report_writer_instructions = """You are a technical writer creating a report on this overall topic:

{topic}

You have a team of analysts. Each analyst has done two things:

1. They conducted an interview with an expert on a specific sub-topic.
2. They write up their finding into a memo.

Your task:

1. You will be given a collection of memos from your analysts.  
2. Carefully review and analyze the insights from each memo.  
3. Consolidate these insights into a detailed and comprehensive summary that integrates the central ideas from all the memos.  
4. Organize the key points from each memo into the appropriate sections provided below, ensuring that each section is logical and well-structured.  
5. Include all required sections in your report, using `### Section Name` as the header for each.  
6. Aim for approximately 250 words per section, providing in-depth explanations, context, and supporting details.  

**Sections to consider (including optional ones for greater depth):**

- **Background**: Theoretical foundations, key concepts, and preliminary information necessary to understand the methodology and results.
- **Related Work**: Overview of prior studies and how they compare or relate to the current research.
- **Problem Definition**: A formal and precise definition of the research question or problem the paper aims to address.
- **Methodology (or Methods)**: Detailed description of the methods, algorithms, models, data collection processes, or experimental setups used in the study.
- **Implementation Details**: Practical details of how the methods or models were implemented, including software frameworks, computational resources, or parameter settings.
- **Experiments**: Explanation of experimental protocols, datasets, evaluation metrics, procedures, and configurations employed to validate the methods.
- **Results**: Presentation of experimental outcomes, often with statistical tables, graphs, figures, or qualitative analyses.

To format your report:

1. Use markdown formatting.
2. Include no pre-amble for the report.
3. Use no sub-heading.
4. Start your report with a single title header: ## Insights
5. Do not mention any analyst names in your report.
6. Preserve any citations in the memos, which will be annotated in brackets, for example [1] or [2].
7. Create a final, consolidated list of sources and add to a Sources section with the `## Sources` header.
8. List your sources in order and do not repeat.

[1] Source 1
[2] Source 2

Here are the memos from your analysts to build your report from:

{context}"""


def write_report(state: ResearchGraphState):
    """Generates main report content from interview sections"""
    sections = state["sections"]
    topic = state["topic"]

    # Combine all sections
    formatted_str_sections = "\n\n".join([f"{section}" for section in sections])

    # Generate report from sections
    system_message = report_writer_instructions.format(
        topic=topic, context=formatted_str_sections
    )
    report = llm.invoke(
        [
            SystemMessage(content=system_message),
            HumanMessage(content="Write a report based upon these memos."),
        ]
    )
    return {"content": report.content}
```

## Defines Consensus Process for Multi-Agent Report Writing

https://raw.githubusercontent.com/WeThinkIn/AIGC-Interview-Book/main/AI Agent基础/AI Agent基础知识.md

```
graph TB
       A[研究员Agent] -->|提交初稿| B[共识池]
       C[数据分析Agent] -->|添加图表| B
       D[合规Agent] -->|法律审核| B
       B --> E{共识达成？}
       E -->|是| F[发布终稿]
       E -->|否| G[启动修改协议]
```

## LangGraph Tutorial: Parallel Tool Execution - Unit 2.3 Exercise 4

https://aiproduct.engineer/tutorials/langgraph-tutorial-parallel-tool-execution-unit-23-exercise-4

```
if __name__ == "__main__":
 import nest_asyncio
 nest_asyncio.apply()
 asyncio.run(demonstrate_parallel_execution())
```

## TaskGraph Configuration for User Input Processing

https://raw.githubusercontent.com/arklexai/Agent-First-Organization/main/docs/API.md

```
from arklex import TaskGraph

task_graph = TaskGraph([
    {
        "id": "process_input",
        "type": "input",
        "description": "Process user input"
    },
    {
        "id": "search_docs",
        "type": "rag_worker",
        "description": "Search knowledge base",
        "dependencies": ["process_input"]
    },
    {
        "id": "generate_response",
        "type": "llm_worker",
        "description": "Generate final response",
        "dependencies": ["search_docs"]
    }
])
```

## ProjectBriefMarkdownGenerator

https://raw.githubusercontent.com/zhsama/claude-sub-agent/main/agents/spec-agents/spec-analyst.md

```
# Project Brief

## Project Overview
**Name**: [Project Name]
**Type**: [Web App/Mobile App/API/etc.]
**Duration**: [Estimated timeline]
**Team Size**: [Recommended team composition]

## Problem Statement
[Clear description of the problem being solved]

## Proposed Solution
[High-level solution approach]

## Success Criteria
- [Measurable success metric 1]
- [Measurable success metric 2]

## Risks and Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk description] | High/Med/Low | High/Med/Low | [Mitigation strategy] |

## Dependencies
- External systems
- Third-party services
- Team dependencies
```

## Stream Outputs from LangGraph API Using Python SDK

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/cloud/how-tos/streaming.md

```
from langgraph_sdk import get_client
    client = get_client(url=<DEPLOYMENT_URL>, api_key=<API_KEY>)

    # Using the graph deployed with the name "agent"
    assistant_id = "agent"

    # create a thread
    thread = await client.threads.create()
    thread_id = thread["thread_id"]

    # create a streaming run
    # highlight-next-line
    async for chunk in client.runs.stream(
        thread_id,
        assistant_id,
        input=inputs,
        stream_mode="updates"
    ):
        print(chunk.data)
```

## Defines Dataflow Graph for Wikipedia RAG Processing

https://raw.githubusercontent.com/receptron/graphai/main/packages/graphai/README.template.md

```
flowchart TD
 source -- name --> wikipedia(wikipedia)
 wikipedia -- content --> chunks(chunks)
 chunks -- contents --> chunkEmbeddings(chunkEmbeddings)
 source -- topic --> topicEmbedding(topicEmbedding)
 chunkEmbeddings --> similarities(similarities)
 topicEmbedding -- $0 --> similarities
 similarities --> sortedChunks(sortedChunks)
 chunks -- contents --> sortedChunks
 sortedChunks --> referenceText(resourceText)
 referenceText -- content --> prompt
 source -- query --> prompt(prompt)
 prompt --> RagQuery(RagQuery)
 source -- query --> OneShotQuery(OneShotQuery)
 RagQuery -- text --> RagResult(RagResult)
 OneShotQuery -- text --> OneShotResult(OneShotResult)
```

## call_arbitrary_model function for streaming LLM output

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/how-tos/streaming.md

```
from langgraph.config import get_stream_writer

def call_arbitrary_model(state):
    """Example node that calls an arbitrary model and streams the output"""
    # highlight-next-line
    writer = get_stream_writer() # (1)!
    # Assume you have a streaming client that yields chunks
    for chunk in your_custom_streaming_client(state["topic"]): # (2)!
        # highlight-next-line
        writer({"custom_llm_chunk": chunk}) # (3)!
    return {"result": "completed"}

graph = (
    StateGraph(State)
    .add_node(call_arbitrary_model)
    # Add other nodes and edges as needed
    .compile()
)

for chunk in graph.stream(
    {"topic": "cats"},
    # highlight-next-line
    stream_mode="custom", # (4)!
):
    # The chunk will contain the custom data streamed from the llm
    print(chunk)
```

## Implements Loop for LLM Queries on People List

https://raw.githubusercontent.com/receptron/graphai/main/packages/graphai/README.md

```
version: 0.5
loop:
  while: :people
nodes:
  people:
    value:
      - Steve Jobs
      - Elon Musk
      - Nikola Tesla
    update: :retriever.array
  result:
    value: []
    update: :reducer.array
    isResult: true
  retriever:
    agent: shiftAgent
    inputs:
      array: :people
  query:
    agent: openAIAgent
    params:
      system: Describe about the person in less than 100 words
      model: gpt-4o
    inputs:
      prompt: :retriever.item
  reducer:
    agent: pushAgent
    inputs:
      array: :result
      item: :query.text
```

## efmanu/langgraph_parallel

https://github.com/efmanu/langgraph_parallel

```
import
operator
from
typing
import
Annotated
,TypedDict
from
langchain_deepseek
import
ChatDeepSeek
from
langgraph
.types
import
Send
from
langgraph
.graph
import
END
,StateGraph
,START
from
pydantic
import
BaseModel
,Field
# Model and prompts
# Define model and prompts we will use
subjects_prompt
=
"""Generate a comma separated list of between 2 and 5 examples related to: {topic}."""
summary_prompt
=
"""Generate a summary of the following topic: {topic}"""
best_summary_prompt
=
"""Below are a bunch of summaries about {topic}. Select the best one! Return the ID of the best one.
{summaries}"""
refine_summary_prompt
=
"""Refine the following summary to make it more concise and informative: {summary}."""
class
Subjects
(BaseModel
): subjects
:list
[str
]class
Summary
(BaseModel
): summary
:str
class
BestSummary
(BaseModel
): id
:int
=
Field
(description
=
"Index of the best summary, starting with 0"
,ge
=
0
)model
=
ChatDeepSeek
(model
=
"deepseek-chat"
,temperature
=
0
,max_tokens
=
1000
,timeout
=
None
,max_retries
=
2
,
) # Graph components: define the components that will make up the graph
# This will be the overall state of the main graph.
# It will contain a topic (which we expect the user to provide)
# and then will generate a list of subjects, and then a summary for
# each subject
class
OverallState
(TypedDict
): topic
:str
subjects
:list
# Notice here we use the operator.add
# This is because we want combine all the summaries we generate
# from individual nodes back into one list - this is essentially
# the "reduce" part
summaries
:Annotated
[list
,operator
.add
]best_selected_summary
:str
# This will be the state of the node that we will "map" all
# subjects to in order to generate a summary
class
SummaryState
(TypedDict
): subject
:str
summary
:Annotated
[list
,operator
.add
]# This is the function we will use to generate the subjects of the summaries
def
generate_topics
(state
:OverallState
)->
OverallState
:prompt
=
subjects_prompt
.format
(topic
=
state
["topic"
]) response
=
model
.with_structured_output
(Subjects
). invoke
(prompt
)return
{"subjects"
:response
.subjects
}# Here we generate a summary, given a subject
def
generate_summary
(state
:SummaryState
)->
SummaryState
:prompt
=
summary_prompt
.format
(topic
=
state
["subject"
]) response
=
model
.with_structured_output
(Summary
). invoke
(prompt
)return
{"summary"
: [ response
.summary
]} def
refine_summary
(state
:SummaryState
)->
OverallState
:prompt
=
refine_summary_prompt
.format
(summary
=
state
["summary"
]) response
=
model
.with_structured_output
(Summary
). invoke
(prompt
)return
{"summaries"
: [ response
.summary
]} # Here we define the logic to map out over the generated subjects
# We will use this an edge in the graph
def
continue_to_summaries
(state
:OverallState
): # We will return a list of `Send` objects
# Each `Send` object consists of the name of a node in the graph
# as well as the state to send to that node
return
[Send
("generate_summary"
, { "subject"
:s
}) for
s
in
state
["subjects"
]] # Here we will judge the best summary
def
best_summary
(state
:OverallState
)->
OverallState
:summaries
=
"\n \n"
.join
(state
["summaries"
]) prompt
=
best_summary_prompt
.format
(topic
=
state
["topic"
], summaries
=
summaries
)response
=
model
.with_structured_output
(BestSummary
). invoke
(prompt
)return
{"best_selected_summary"
:state
["summaries"
][ response
.id
]} def
continue_to_refine
(state
:SummaryState
): return
Send
("refine_summary"
,state
)def
compile_graph
(): # Construct the graph: here we put everything together to construct our graph
graph
=
StateGraph
(OverallState
)graph
.add_node
("generate_topics"
,generate_topics
)graph
.add_node
("generate_summary"
,generate_summary
)graph
.add_node
("refine_summary"
,refine_summary
)graph
.add_node
("best_summary"
,best_summary
)graph
.add_edge
(START
,"generate_topics"
)graph
.add_conditional_edges
("generate_topics"
,continue_to_summaries
, [ "generate_summary"
]) graph
.add_conditional_edges
("generate_summary"
,continue_to_refine
, [ "refine_summary"
]) graph
.add_edge
("refine_summary"
,"best_summary"
)graph
.add_edge
("best_summary"
,END
)app
=
graph
.compile
() return
app
app
=
compile_graph
() png_image
=
app
.get_graph
(). draw_mermaid_png
() with
open
("langgraph_diagram_n.png"
,"wb"
)as
f
:f
.write
(png_image
)state
=
app
.invoke
({ "topic"
:"birds"
}) print
(state
)
```

## bash Result 1

https://raw.githubusercontent.com/ruvnet/daa/main/qudag/docs/SPARC.md

```
# Phase 1: Launch parallel specialist tasks
BatchTool(
  Task("architect", "Design system architecture for [component]"),
  Task("spec-pseudocode", "Write detailed specifications for [feature]"),
  Task("security-review", "Audit current codebase for vulnerabilities"),
  Task("tdd", "Create test framework for [module]")
)

# Phase 2: Collect and integrate results
BatchTool(
  Task("code", "Implement based on architecture and specs"),
  Task("integration", "Merge all components into cohesive system"),
  Task("docs-writer", "Document the integrated solution")
)

# Phase 3: Validation and deployment
BatchTool(
  Task("debug", "Resolve any integration issues"),
  Task("devops", "Deploy to staging environment"),
  Task("post-deployment-monitoring-mode", "Set up monitoring")
)
```

## README.md for StructRAG Project Setup and Execution

https://raw.githubusercontent.com/icip-cas/StructRAG/main/README.md

```
please follow Loong/README.md
```

## Run Paragraph for Complex Variant Analysis

https://raw.githubusercontent.com/Illumina/paragraph/main/README.md

```
bin/paragraph -b <input BAM> \
              -r <reference fasta> \
              -g <input graph JSON> \
              -o <output JSON path> \
              -E 1
```

## Shandu Research System with LangGraph and LangChain

https://raw.githubusercontent.com/jolovicdev/shandu/main/shandu/README.md

```
shandu/
├── __init__.py           # Package initialization
├── cli.py                # Command-line interface
├── config.py             # Configuration management
├── prompts.py            # Centralized prompt templates
├── agents/               # Research agent implementations
│   ├── __init__.py
│   ├── agent.py          # LangChain-based agent
│   ├── langgraph_agent.py # LangGraph state-based agent
│   ├── graph/            # Graph workflow components
│   │   ├── __init__.py
│   │   ├── builder.py    # Graph construction
│   │   └── wrapper.py    # Async function wrappers
│   ├── nodes/            # Graph node implementations
│   │   ├── __init__.py
│   │   ├── initialize.py # Research initialization
│   │   ├── reflect.py    # Research reflection
│   │   ├── search.py 
```
