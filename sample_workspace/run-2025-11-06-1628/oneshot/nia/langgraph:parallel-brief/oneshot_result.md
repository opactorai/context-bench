# Oneshot Mode Result

**Scenario**: langgraph:parallel-brief
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:40.099Z

---

## Query

Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "langgraph",
  "semantic_queries": [
    "Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: langgraph (py_pi)
**Queries:**
- Using the LangGraph Python library with parallel graph execution and streaming, create a parallel research brief generator. Create a one-page research brief on 'small modular reactors'. Plan 3-5 sections, draft them in parallel, stream progress as each section completes, then merge into a single report.

**Version:** 1.0.2

**Found 3 relevant code sections**

## Result 1
**File:** `docs/docs/how-tos/use-functional-api.md`
**SHA256:** `458627c5992767d7ccb3f944bf21e2272268b4269a2fcc3391af2f41f9558a42`
**Lines:** 227-332
**Language:** Markdown
```
This example demonstrates how to run multiple LLM calls in parallel using `@task`. Each call generates a paragraph on a different topic, and results are joined into a single text output.

    :::python
    ```python
    import uuid
    from langchain.chat_models import init_chat_model
    from langgraph.func import entrypoint, task
    from langgraph.checkpoint.memory import InMemorySaver

    # Initialize the LLM model
    llm = init_chat_model("openai:gpt-3.5-turbo")

    # Task that generates a paragraph about a given topic
    @task
    def generate_paragraph(topic: str) -> str:
        response = llm.invoke([
            {"role": "system", "content": "You are a helpful assistant that writes educational paragraphs."},
            {"role": "user", "content": f"Write a paragraph about {topic}."}
        ])
        return response.content

    # Create a checkpointer for persistence
    checkpointer = InMemorySaver()

    @entrypoint(checkpointer=checkpointer)
    def workflow(topics: list[str]) -> str:
        """Generates multiple paragraphs in parallel and combines them."""
        futures = [generate_paragraph(topic) for topic in topics]
        paragraphs = [f.result() for f in futures]
        return "\n\n".join(paragraphs)

    # Run the workflow
    config = {"configurable": {"thread_id": str(uuid.uuid4())}}
    result = workflow.invoke(["quantum computing", "climate change", "history of aviation"], config=config)
    print(result)
    ```
    :::

    :::js
    ```typescript
    import { v4 as uuidv4 } from "uuid";
    import { ChatOpenAI } from "@langchain/openai";
    import { entrypoint, task, MemorySaver } from "@langchain/langgraph";

    // Initialize the LLM model
    const llm = new ChatOpenAI({ model: "gpt-3.5-turbo" });

    // Task that generates a paragraph about a given topic
    const generateParagraph = task("generateParagraph", async (topic: string) => {
      const response = await llm.invoke([
        { role: "system", content: "You are a helpful assistant that writes educational paragraphs." },
        { role: "user", content: `Write a paragraph about ${topic}.` }
      ]);
      return response.content as string;
    });

    // Create a checkpointer for persistence
    const checkpointer = new MemorySaver();

    const workflow = entrypoint(
      { checkpointer, name: "workflow" },
      async (topics: string[]) => {
        // Generates multiple paragraphs in parallel and combines them
        const paragraphs = await Promise.all(topics.map(generateParagraph));
        return paragraphs.join("\n\n");
      }
    );

    // Run the workflow
    const config = { configurable: { thread_id: uuidv4() } };
    const result = await workflow.invoke(["quantum computing", "climate change", "history of aviation"], config);
    console.log(result);
    ```
    :::

    This example uses LangGraph's concurrency model to improve execution time, especially when tasks involve I/O like LLM completions.

## Calling graphs

The **Functional API** and the [**Graph API**](../concepts/low_level.md) can be used together in the same application as they share the same underlying runtime.

:::python

```python
from langgraph.func import entrypoint
from langgraph.graph import StateGraph

builder = StateGraph()
...
some_graph = builder.compile()

@entrypoint()
def some_workflow(some_input: dict) -> int:
    # Call a graph defined using the graph API
    result_1 = some_graph.invoke(...)
    # Call another graph defined using the graph API
    result_2 = another_graph.invoke(...)
    return {
        "result_1": result_1,
        "result_2": result_2
    }
```

:::

:::js
```

## Result 2
**File:** `examples/stream-multiple.ipynb`
**SHA256:** `af1cbee800f1c7226124c02637db0b67488cc89ff2e33e13fca3e7612881a06a`
**Lines:** 1-1
**Language:** Markdown
```
This file has been moved to https://github.com/langchain-ai/langgraph/blob/main/docs/docs/how-tos/stream-multiple.ipynb
```

## Result 3
**File:** `docs/docs/llms.txt`
**SHA256:** `13991387e64137131233a35decd7a720feae1d1a76c58a36e800057b943d7e0d`
**Lines:** 88-95
**Language:** Text
```
- [Streaming in LangGraph Platform](https://langchain-ai.github.io/langgraph/cloud/concepts/streaming/): This page provides an overview of streaming capabilities within the LangGraph Platform, detailing the various streaming modes available for LLM applications. It includes instructions for creating streaming runs, handling stateless runs, and joining active background runs. Additionally, code examples in Python, JavaScript, and cURL are provided to illustrate the implementation of these features.
- [Streaming Outputs with LangGraph SDK](https://langchain-ai.github.io/langgraph/cloud/how-tos/streaming/): This documentation page provides detailed instructions on how to stream outputs from the LangGraph API server using the LangGraph SDK in Python, JavaScript, and cURL. It covers various streaming modes, including updates, values, and custom data, along with examples for each mode. Additionally, it explains how to handle subgraphs, debug information, and LLM tokens during streaming.
- [Human-in-the-Loop Workflows in LangGraph](https://langchain-ai.github.io/langgraph/cloud/how-tos/add-human-in-the-loop/): This page provides an overview of the human-in-the-loop (HIL) capabilities in LangGraph, allowing for human intervention in automated processes. It details the `interrupt` function, which pauses execution for human input, and includes examples in Python, JavaScript, and cURL for implementing HIL workflows. Additionally, it links to further resources for understanding and utilizing HIL features effectively.
- [Using Breakpoints in LangGraph](https://langchain-ai.github.io/langgraph/cloud/how-tos/human_in_the_loop_breakpoint/): This page provides an overview of how to set and use breakpoints in LangGraph to pause graph execution for inspection. It includes examples for setting breakpoints at compile time and run time in Python, JavaScript, and cURL. Additionally, it offers guidance on resuming execution after hitting a breakpoint.
- [Using Time Travel in LangGraph](https://langchain-ai.github.io/langgraph/cloud/how-tos/human_in_the_loop_time_travel/): This page provides a comprehensive guide on how to utilize the time travel functionality in LangGraph, allowing users to resume execution from previous checkpoints. It outlines the steps to run a graph, identify checkpoints, modify graph states, and resume execution. Additionally, the page includes code examples in Python, JavaScript, and cURL for practical implementation.
- [Model Context Protocol (MCP) Endpoint Documentation](https://langchain-ai.github.io/langgraph/concepts/server-mcp/): This page provides comprehensive documentation on the Model Context Protocol (MCP) endpoint available in LangGraph Server. It covers the requirements for using MCP, how to expose agents as MCP tools, and includes examples for connecting with MCP-compliant clients in various programming languages. Additionally, it outlines session behavior, authentication, and instructions for disabling the MCP endpoint.
- [Managing Double Texting in LangGraph](https://langchain-ai.github.io/langgraph/concepts/double_texting/): This page provides an overview of how to handle double texting scenarios in LangGraph, where users may send multiple messages before the first has completed. It outlines four strategies: Reject, Enqueue, Interrupt, and Rollback, each with links to detailed configuration guides. Prerequisites for implementing these strategies include having the LangGraph Server set up.
- [Using the Interrupt Option in Double Texting](https://langchain-ai.github.io/langgraph/cloud/how-tos/interrupt_concurrent/): This guide provides detailed instructions on how to utilize the `interrupt` option for double texting, allowing users to interrupt a prior run of a graph and start a new one. It includes setup instructions, code examples in Python, JavaScript, and CURL, as well as guidance on viewing run results and verifying the status of interrupted runs. Familiarity with double texting is assumed, and a link to a conceptual guide is provided for further understanding.

```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
