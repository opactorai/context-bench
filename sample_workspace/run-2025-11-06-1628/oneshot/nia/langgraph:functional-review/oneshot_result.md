# Oneshot Mode Result

**Scenario**: langgraph:functional-review
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:30:40.292Z

---

## Query

Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "langgraph",
  "semantic_queries": [
    "Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: langgraph (py_pi)
**Queries:**
- Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread.

**Version:** 1.0.2

**Found 3 relevant code sections**

## Result 1
**File:** `docs/docs/concepts/functional_api.md`
**SHA256:** `a86370647e7ef5c912fb88716195c69416012b61c4fe470ebc3db8ed5a0383c6`
**Lines:** 121-225
**Language:** Markdown
```
This workflow will write an essay about the topic "cat" and then pause to get a review from a human. The workflow can be interrupted for an indefinite amount of time until a review is provided.

    When the workflow is resumed, it executes from the very start, but because the result of the `writeEssay` task was already saved, the task result will be loaded from the checkpoint instead of being recomputed.

    :::python
    ```python
    import time
    import uuid
    from langgraph.func import entrypoint, task
    from langgraph.types import interrupt
    from langgraph.checkpoint.memory import InMemorySaver


    @task
    def write_essay(topic: str) -> str:
        """Write an essay about the given topic."""
        time.sleep(1)  # This is a placeholder for a long-running task.
        return f"An essay about topic: {topic}"

    @entrypoint(checkpointer=InMemorySaver())
    def workflow(topic: str) -> dict:
        """A simple workflow that writes an essay and asks for a review."""
        essay = write_essay("cat").result()
        is_approved = interrupt(
            {
                # Any json-serializable payload provided to interrupt as argument.
                # It will be surfaced on the client side as an Interrupt when streaming data
                # from the workflow.
                "essay": essay,  # The essay we want reviewed.
                # We can add any additional information that we need.
                # For example, introduce a key called "action" with some instructions.
                "action": "Please approve/reject the essay",
            }
        )
        return {
            "essay": essay,  # The essay that was generated
            "is_approved": is_approved,  # Response from HIL
        }


    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    for item in workflow.stream("cat", config):
        print(item)
    # > {'write_essay': 'An essay about topic: cat'}
    # > {
    # >     '__interrupt__': (
    # >        Interrupt(
    # >            value={
    # >                'essay': 'An essay about topic: cat',
    # >                'action': 'Please approve/reject the essay'
    # >            },
    # >            id='b9b2b9d788f482663ced6dc755c9e981'
    # >        ),
    # >    )
    # > }
    ```

    An essay has been written and is ready for review. Once the review is provided, we can resume the workflow:

    ```python
    from langgraph.types import Command

    # Get review from a user (e.g., via a UI)
    # In this case, we're using a bool, but this can be any json-serializable value.
    human_review = True

    for item in workflow.stream(Command(resume=human_review), config):
        print(item)
    ```

    ```pycon
    {'workflow': {'essay': 'An essay about topic: cat', 'is_approved': False}}
    ```

    The workflow has been completed and the review has been added to the essay.
    :::

    :::js
    ```typescript
    import { v4 as uuidv4 } from "uuid";
    import { MemorySaver, entrypoint, task, interrupt } from "@langchain/langgraph";

    const writeEssay = task("writeEssay", async (topic: string) => {
      // This is a placeholder for a long-running task.
      await new Promise(resolve => setTimeout(resolve, 1000));
      return `An essay about topic: ${topic}`;
    });

    const workflow = entrypoint(
      { checkpointer: new MemorySaver(), name: "workflow" },
      async (topic: string) => {
        const essay = await writeEssay(topic);
        const isApproved = interrupt({
          // Any json-serializable payload provided to interrupt as argument.
          // It will be surfaced on the client side as an Interrupt when streaming data
          // from the workflow.
          essay, // The essay we want reviewed.
          // We can add any additional information that we need.
          // For example, introduce a key called "action" with some instructions.
          action: "Please approve/reject the essay",
        });

        return {
          essay, // The essay that was generated

```

## Result 2
**File:** `docs/docs/llms.txt`
**SHA256:** `13991387e64137131233a35decd7a720feae1d1a76c58a36e800057b943d7e0d`
**Lines:** 34-40
**Language:** Text
```
- [LangGraph Persistence and Checkpointing](https://langchain-ai.github.io/langgraph/concepts/persistence/): This page provides an in-depth overview of the persistence layer in LangGraph, focusing on the use of checkpointers to save graph states at each super-step. It covers key concepts such as threads, checkpoints, state retrieval, and memory management, along with practical examples and code snippets. Additionally, it discusses advanced features like time travel, fault tolerance, and the integration of memory stores for cross-thread information retention.
- [Understanding Durable Execution in LangGraph](https://langchain-ai.github.io/langgraph/concepts/durable_execution/): This page provides an overview of durable execution, a technique that allows workflows to save their progress and resume from key points. It details the requirements for implementing durable execution in LangGraph, including the use of persistence and tasks to ensure deterministic and consistent replay. Additionally, it covers how to handle pausing, resuming, and recovering workflows effectively.
- [Implementing Memory in LangGraph for AI Applications](https://langchain-ai.github.io/langgraph/how-tos/persistence/): This documentation page provides a comprehensive guide on adding persistence to AI applications using LangGraph. It covers both short-term and long-term memory implementations, including code examples for managing conversation context and user-specific data. Additionally, it discusses the use of various storage backends and semantic search capabilities for enhanced memory management.
- [Understanding Memory in AI Agents](https://langchain-ai.github.io/langgraph/concepts/memory/): This documentation page provides an in-depth overview of memory types in AI agents, focusing on short-term and long-term memory. It explains how these memory types can be implemented and managed within applications using LangGraph, including techniques for handling conversation history and storing memories. Additionally, it discusses the importance of memory in enhancing user interactions and the various strategies for writing and updating memories.
- [Memory Management in LangGraph for AI Applications](https://langchain-ai.github.io/langgraph/how-tos/memory/): This page provides an overview of memory management in LangGraph, focusing on short-term and long-term memory functionalities essential for conversational agents. It includes detailed instructions on how to implement memory strategies such as trimming, summarizing, and deleting messages to optimize conversation tracking without exceeding context limits. Code examples are provided to illustrate the implementation of these memory management techniques.
- [Human-in-the-Loop Workflows in LangGraph](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/): This page provides an overview of the human-in-the-loop (HIL) capabilities within LangGraph, highlighting how human intervention can enhance automated processes. It details key features such as persistent execution state and flexible integration points, along with typical use cases for validating outputs and providing context. Additionally, it outlines the implementation of HIL through specific functions and primitives.
- [Implementing Human-in-the-Loop Workflows with Interrupts](https://langchain-ai.github.io/langgraph/how-tos/human_in_the_loop/add-human-in-the-loop/): This documentation page provides a comprehensive guide on using the `interrupt` function in LangGraph to facilitate human-in-the-loop workflows. It covers the implementation details, design patterns, and best practices for pausing graph execution to gather human input, as well as how to resume execution with that input. Additionally, it highlights common pitfalls and offers extended examples to illustrate various use cases.

```

## Result 3
**File:** `docs/docs/how-tos/cross-thread-persistence-functional.ipynb`
**SHA256:** `d4c7a0737bacf8d18e3e714ec0867225b9b09ef8296097d7d7b6f27c59b3c4d4`
**Lines:** 1-49
**Language:** Markdown
```
# How to add cross-thread persistence (functional API)

!!! info "Prerequisites"

    This guide assumes familiarity with the following:
    
    - [Functional API](../../concepts/functional_api/)
    - [Persistence](../../concepts/persistence/)
    - [Memory](../../concepts/memory/)
    - [Chat Models](https://python.langchain.com/docs/concepts/chat_models/)

LangGraph allows you to persist data across **different [threads](../../concepts/persistence/#threads)**. For instance, you can store information about users (their names or preferences) in a shared (cross-thread) memory and reuse them in the new threads (e.g., new conversations).

When using the [functional API](../../concepts/functional_api/), you can set it up to store and retrieve memories by using the [Store](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.BaseStore) interface:

1. Create an instance of a `Store`

    ```python
    from langgraph.store.memory import InMemoryStore, BaseStore
    
    store = InMemoryStore()
    ```

2. Pass the `store` instance to the `entrypoint()` decorator and expose `store` parameter in the function signature:

    ```python
    from langgraph.func import entrypoint

    @entrypoint(store=store)
    def workflow(inputs: dict, store: BaseStore):
        my_task(inputs).result()
        ...
    ```
    
In this guide, we will show how to construct and use a workflow that has a shared memory implemented using the [Store](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.BaseStore) interface.

!!! note Note

    Support for the [`Store`](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.BaseStore) API that is used in this guide was added in LangGraph `v0.2.32`.

    Support for __index__ and __query__ arguments of the [`Store`](https://langchain-ai.github.io/langgraph/reference/store/#langgraph.store.base.BaseStore) API that is used in this guide was added in LangGraph `v0.2.54`.

!!! tip "Note"

    If you need to add cross-thread persistence to a `StateGraph`, check out this [how-to guide](../cross-thread-persistence).

## Setup

First, let's install the required packages and set our API keys
```

⚠️ **Note:** The given query was too permissive and 1 matching results were omitted from the response. Please try again with a more specific query.

💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
