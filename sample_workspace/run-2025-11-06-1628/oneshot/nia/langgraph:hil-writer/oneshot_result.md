# Oneshot Mode Result

**Scenario**: langgraph:hil-writer
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:29:40.156Z

---

## Query

Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint.

---

## Tool Input

```json
{
  "registry": "py_pi",
  "package_name": "langgraph",
  "semantic_queries": [
    "Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint."
  ]
}
```

---

## Tool Result

# 🔎 Package Semantic Search: langgraph (py_pi)
**Queries:**
- Using the LangGraph Python library with interrupts and persistence, build a human-in-the-loop writer. Draft a concise README in Markdown about 'LangGraph-powered agents'. Wait for me to approve or send change requests before saving. If I request changes, revise and ask again; I may also rewind to a previous checkpoint.

**Version:** 1.0.2

**Found 4 relevant code sections**

## Result 1
**File:** `docs/docs/concepts/why-langgraph.md`
**SHA256:** `79adeff6e94b6ade74f1a7c0361ba012ef6807975186ebd1f04718fb28fafccd`
**Lines:** 1-26
**Language:** Markdown
```
# Overview

LangGraph is built for developers who want to build powerful, adaptable AI agents. Developers choose LangGraph for:

- **Reliability and controllability.** Steer agent actions with moderation checks and human-in-the-loop approvals. LangGraph persists context for long-running workflows, keeping your agents on course.
- **Low-level and extensible.** Build custom agents with fully descriptive, low-level primitives free from rigid abstractions that limit customization. Design scalable multi-agent systems, with each agent serving a specific role tailored to your use case.
- **First-class streaming support.** With token-by-token streaming and streaming of intermediate steps, LangGraph gives users clear visibility into agent reasoning and actions as they unfold in real time.

## Learn LangGraph basics

To get acquainted with LangGraph's key concepts and features, complete the following LangGraph basics tutorials series:

1. [Build a basic chatbot](../tutorials/get-started/1-build-basic-chatbot.md)
2. [Add tools](../tutorials/get-started/2-add-tools.md)
3. [Add memory](../tutorials/get-started/3-add-memory.md)
4. [Add human-in-the-loop controls](../tutorials/get-started/4-human-in-the-loop.md)
5. [Customize state](../tutorials/get-started/5-customize-state.md)
6. [Time travel](../tutorials/get-started/6-time-travel.md)

In completing this series of tutorials, you will build a support chatbot in LangGraph that can:

* ✅ **Answer common questions** by searching the web
* ✅ **Maintain conversation state** across calls  
* ✅ **Route complex queries** to a human for review  
* ✅ **Use custom state** to control its behavior  
* ✅ **Rewind and explore** alternative conversation paths  

```

## Result 2
**File:** `docs/docs/llms.txt`
**SHA256:** `13991387e64137131233a35decd7a720feae1d1a76c58a36e800057b943d7e0d`
**Lines:** 19-26
**Language:** Text
```
- [Integrating MCP with LangGraph Agents](https://langchain-ai.github.io/langgraph/agents/mcp/): This page provides a comprehensive guide on how to integrate the Model Context Protocol (MCP) with LangGraph agents using the `langchain-mcp-adapters` library. It includes installation instructions, example code for using MCP tools, and guidance on creating custom MCP servers. Additional resources for further reading on MCP are also provided.
- [Understanding Context in LangGraph Agents](https://langchain-ai.github.io/langgraph/agents/context/): This page provides an overview of how to supply context to agents in LangGraph, detailing the three primary types: Config, State, and Long-Term Memory. It explains how to use these context types to enhance agent behavior, customize prompts, and access context in tools. Additionally, it includes code examples for implementing context in various scenarios.
- [Understanding Memory in LangGraph for Conversational Agents](https://langchain-ai.github.io/langgraph/agents/memory/): This documentation page provides an overview of the two types of memory supported by LangGraph: short-term and long-term memory. It explains how to implement these memory types in conversational agents, including code examples and best practices for managing message history. Additionally, it covers the use of persistent storage and tools for enhancing memory functionality.
- [Implementing Human-in-the-Loop in LangGraph](https://langchain-ai.github.io/langgraph/agents/human-in-the-loop/): This documentation page provides a comprehensive guide on how to implement Human-in-the-Loop (HIL) features in LangGraph, allowing for human review and approval of tool calls in agents. It covers the use of the `interrupt()` function to pause execution for human input, along with practical examples and code snippets. Additionally, it explains how to create a wrapper to add HIL capabilities to any tool seamlessly.
- [Building Multi-Agent Systems](https://langchain-ai.github.io/langgraph/agents/multi-agent/): This page provides an overview of multi-agent systems, detailing how to create and manage them using supervisor and swarm architectures. It includes practical examples of implementing a flight and hotel booking assistant using the LangGraph libraries. Additionally, the page explains the concept of handoffs between agents, allowing for seamless communication and task delegation.
- [Evaluating Agent Performance with LangSmith](https://langchain-ai.github.io/langgraph/agents/evals/): This page provides a comprehensive guide on how to evaluate the performance of agents using the LangSmith evaluations framework. It includes instructions on defining evaluator functions, utilizing prebuilt evaluators from the AgentEvals package, and running evaluations with specific datasets. Additionally, it covers different evaluation techniques, including trajectory matching and using LLMs as judges.
- [Deploying Your LangGraph Agent](https://langchain-ai.github.io/langgraph/agents/deployment/): This page provides a comprehensive guide on how to deploy a LangGraph agent, including setting up a LangGraph app for both local development and production. It covers essential features, installation steps, and configuration requirements, along with instructions for launching the local server and utilizing the LangGraph Studio Web UI for debugging. Additionally, it offers links to further resources for deployment options.
- [Agent Chat UI Documentation](https://langchain-ai.github.io/langgraph/agents/ui/): This page provides comprehensive guidance on using the Agent Chat UI for interacting with LangGraph agents. It covers setup instructions, features like human-in-the-loop workflows, and the integration of generative UI components. Users can find links to relevant resources and tips for customizing their chat experience.

```

## Result 3
**File:** `README.md`
**SHA256:** `b335630551682c19a781afebcf4d07bf978fb1f8ac04c6bf87428ed5106870f5`
**Lines:** 1-63
**Language:** Markdown
```
<picture class="github-only">
  <source media="(prefers-color-scheme: light)" srcset="https://langchain-ai.github.io/langgraph/static/wordmark_dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://langchain-ai.github.io/langgraph/static/wordmark_light.svg">
  <img alt="LangGraph Logo" src="https://langchain-ai.github.io/langgraph/static/wordmark_dark.svg" width="80%">
</picture>

<div>
<br>
</div>

[![Version](https://img.shields.io/pypi/v/langgraph.svg)](https://pypi.org/project/langgraph/)
[![Downloads](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

Trusted by companies shaping the future of agents – including Klarna, Replit, Elastic, and more – LangGraph is a low-level orchestration framework for building, managing, and deploying long-running, stateful agents.

## Get started

Install LangGraph:

```
pip install -U langgraph
```

Then, create an agent [using prebuilt components](https://langchain-ai.github.io/langgraph/agents/agents/):

```python
# pip install -qU "langchain[anthropic]" to call the model

from langgraph.prebuilt import create_react_agent

def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_weather],
    prompt="You are a helpful assistant"
)

# Run the agent
agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)
```

For more information, see the [Quickstart](https://langchain-ai.github.io/langgraph/agents/agents/). Or, to learn how to build an [agent workflow](https://langchain-ai.github.io/langgraph/concepts/low_level/) with a customizable architecture, long-term memory, and other complex task handling, see the [LangGraph basics tutorials](https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/).

## Core benefits

LangGraph provides low-level supporting infrastructure for *any* long-running, stateful workflow or agent. LangGraph does not abstract prompts or architecture, and provides the following central benefits:

- [Durable execution](https://langchain-ai.github.io/langgraph/concepts/durable_execution/): Build agents that persist through failures and can run for extended periods, automatically resuming from exactly where they left off.
- [Human-in-the-loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/): Seamlessly incorporate human oversight by inspecting and modifying agent state at any point during execution.
- [Comprehensive memory](https://langchain-ai.github.io/langgraph/concepts/memory/): Create truly stateful agents with both short-term working memory for ongoing reasoning and long-term persistent memory across sessions.
- [Debugging with LangSmith](http://www.langchain.com/langsmith): Gain deep visibility into complex agent behavior with visualization tools that trace execution paths, capture state transitions, and provide detailed runtime metrics.
- [Production-ready deployment](https://langchain-ai.github.io/langgraph/concepts/deployment_options/): Deploy sophisticated agent systems confidently with scalable infrastructure designed to handle the unique challenges of stateful, long-running workflows.

## LangGraph’s ecosystem

While LangGraph can be used standalone, it also integrates seamlessly with any LangChain product, giving developers a full suite of tools for building agents. To improve your LLM application development, pair LangGraph with:
```

## Result 4
**File:** `libs/langgraph/README.md`
**SHA256:** `8ee8eb68c6b1e6329356ef3c6df88ed5e373ff16fbf0e6752d6a9f48a49207cc`
**Lines:** 1-63
**Language:** Markdown
```
<picture class="github-only">
  <source media="(prefers-color-scheme: light)" srcset="https://langchain-ai.github.io/langgraph/static/wordmark_dark.svg">
  <source media="(prefers-color-scheme: dark)" srcset="https://langchain-ai.github.io/langgraph/static/wordmark_light.svg">
  <img alt="LangGraph Logo" src="https://langchain-ai.github.io/langgraph/static/wordmark_dark.svg" width="80%">
</picture>

<div>
<br>
</div>

[![Version](https://img.shields.io/pypi/v/langgraph.svg)](https://pypi.org/project/langgraph/)
[![Downloads](https://static.pepy.tech/badge/langgraph/month)](https://pepy.tech/project/langgraph)
[![Open Issues](https://img.shields.io/github/issues-raw/langchain-ai/langgraph)](https://github.com/langchain-ai/langgraph/issues)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://langchain-ai.github.io/langgraph/)

Trusted by companies shaping the future of agents – including Klarna, Replit, Elastic, and more – LangGraph is a low-level orchestration framework for building, managing, and deploying long-running, stateful agents.

## Get started

Install LangGraph:

```
pip install -U langgraph
```

Then, create an agent [using prebuilt components](https://langchain-ai.github.io/langgraph/agents/agents/):

```python
# pip install -qU "langchain[anthropic]" to call the model

from langgraph.prebuilt import create_react_agent

def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_weather],
    prompt="You are a helpful assistant"
)

# Run the agent
agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather in sf"}]}
)
```

For more information, see the [Quickstart](https://langchain-ai.github.io/langgraph/agents/agents/). Or, to learn how to build an [agent workflow](https://langchain-ai.github.io/langgraph/concepts/low_level/) with a customizable architecture, long-term memory, and other complex task handling, see the [LangGraph basics tutorials](https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/).

## Core benefits

LangGraph provides low-level supporting infrastructure for *any* long-running, stateful workflow or agent. LangGraph does not abstract prompts or architecture, and provides the following central benefits:

- [Durable execution](https://langchain-ai.github.io/langgraph/concepts/durable_execution/): Build agents that persist through failures and can run for extended periods, automatically resuming from exactly where they left off.
- [Human-in-the-loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/): Seamlessly incorporate human oversight by inspecting and modifying agent state at any point during execution.
- [Comprehensive memory](https://langchain-ai.github.io/langgraph/concepts/memory/): Create truly stateful agents with both short-term working memory for ongoing reasoning and long-term persistent memory across sessions.
- [Debugging with LangSmith](http://www.langchain.com/langsmith): Gain deep visibility into complex agent behavior with visualization tools that trace execution paths, capture state transitions, and provide detailed runtime metrics.
- [Production-ready deployment](https://langchain-ai.github.io/langgraph/concepts/deployment_options/): Deploy sophisticated agent systems confidently with scalable infrastructure designed to handle the unique challenges of stateful, long-running workflows.

## LangGraph’s ecosystem

While LangGraph can be used standalone, it also integrates seamlessly with any LangChain product, giving developers a full suite of tools for building agents. To improve your LLM application development, pair LangGraph with:
```


💡 **To read full file content:**
Copy a SHA256 above and use: `nia_package_search_read_file(registry=..., package_name=..., filename_sha256="...", start_line=1, end_line=100)`
