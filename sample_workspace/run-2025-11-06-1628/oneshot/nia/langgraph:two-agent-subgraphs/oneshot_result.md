# Oneshot Mode Result

**Scenario**: langgraph:two-agent-subgraphs
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:30:39.605Z

---

## Query

Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "langgraph",
  "semantic_queries": [
    "Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: langgraph (py_pi)
**Queries:**
- Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs.

**Version:** 1.0.2

**Found 5 relevant code sections**

## Result 1
**File:** `docs/docs/tutorials/multi_agent/multi-agent-collaboration.ipynb`
**SHA256:** `044ade02459a3c445dc98f10eee46d3c8ab147db9514deace85248ac94192db7`
**Lines:** 1-3
**Language:** Markdown
```
## Create graph

Now that we've defined our tools and made some helper functions, will create the individual agents below and tell them how to talk to each other using LangGraph.
```

## Result 2
**File:** `docs/docs/tutorials/multi_agent/hierarchical_agent_teams.ipynb`
**SHA256:** `eea59193e8d7ec7b5315fe3c4782a0c43cbe496ec3201eb66e00af9a90320f62`
**Lines:** 1-24
**Language:** Markdown
```
# Hierarchical Agent Teams

In our previous example ([Agent Supervisor](../agent_supervisor)), we introduced the concept of a single [supervisor node](https://langchain-ai.github.io/langgraph/concepts/multi_agent/#supervisor) to route work between different worker nodes.

But what if the job for a single worker becomes too complex? What if the number of workers becomes too large?

For some applications, the system may be more effective if work is distributed _hierarchically_.

You can do this by composing different subgraphs and creating a top-level supervisor, along with mid-level supervisors.

To do this, let's build a simple research assistant! The graph will look something like the following:

![diagram](attachment:d98ed25c-51cb-441f-a6f4-016921d59fc3.png)

This notebook is inspired by the paper [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155), by Wu, et. al. In the rest of this notebook, you will:

1. Define the agents' tools to access the web and write files
2. Define some utilities to help create the graph and agents
3. Create and define each team (web research + doc writing)
4. Compose everything together.

## Setup

First, let's install our required packages and set our API keys
```

## Result 3
**File:** `docs/docs/tutorials/llm-compiler/LLMCompiler.ipynb`
**SHA256:** `4dac65635033c2c448998ed75ab272b107bad518b1f35b79c70ac86dcf960a4d`
**Lines:** 1-7
**Language:** Markdown
```
## Compose using LangGraph

We'll define the agent as a stateful graph, with the main nodes being:

1. Plan and execute (the DAG from the first step above)
2. Join: determine if we should finish or replan
3. Recontextualize: update the graph state based on the output from the joiner
```

## Result 4
**File:** `docs/docs/how-tos/multi-agent-multi-turn-convo-functional.ipynb`
**SHA256:** `9a56b2a9c6903286f0437fe80814aeea3f29df1bc2de4be21bf03ae0e5a7979d`
**Lines:** 1-1
**Language:** Markdown
```
Let's now create our agents using the prebuilt [`create_react_agent`][langgraph.prebuilt.chat_agent_executor.create_react_agent] and our multi-agent workflow. Note that will be calling [`interrupt`][langgraph.types.interrupt] every time after we get the final response from each of the agents.
```

## Result 5
**File:** `docs/docs/how-tos/autogen-integration-functional.ipynb`
**SHA256:** `cc54186596abe5d63e6d26b622b18e272d2bc05199a3dddbe56b70484c7ddf9f`
**Lines:** 1-3
**Language:** Markdown
```
## Create the workflow

We will now create a LangGraph chatbot graph that calls AutoGen agent.
```


💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
