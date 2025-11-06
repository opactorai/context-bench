# Oneshot Mode Result

**Scenario**: langgraph:two-agent-subgraphs
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:55:48.894Z

---

## Query

Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs.

---

## Tool Input

```json
{
  "query": "Using the LangGraph Python library with subgraphs and multi-agent orchestration, build a two-agent blog writing system. Draft a 400-word blog post about 'edge AI on factories'. First a writer plans and drafts; then an editor polishes tone and clarity. Orchestrate the two agents as reusable subgraphs."
}
```

---

## Tool Result

## Collaborative Writing Flow with Multi-Agent Coordination

https://raw.githubusercontent.com/PrefectHQ/ControlFlow/main/docs/llm-guides/llm-guide.md

```
researcher = cf.Agent(name="Researcher", instructions="Conduct thorough research on topics")
writer = cf.Agent(name="Writer", instructions="Write clear and engaging content")
editor = cf.Agent(name="Editor", instructions="Review and improve written content")

@cf.flow
def collaborative_writing_flow(topic: str):
    research = cf.run("Research the topic", agents=[researcher], context={"topic": topic})
    draft = cf.run("Write initial draft", agents=[writer], depends_on=[research])
    final = cf.run("Edit and finalize the content", agents=[editor], depends_on=[draft])
    return final

article = collaborative_writing_flow("Impact of AI on healthcare")
```

## Hierarchical Multi-Agent Supervisor with LangGraph

https://raw.githubusercontent.com/LangChain-OpenTutorial/LangChain-OpenTutorial/main/docs/17-LangGraph/02-Structures/09-LangGraph-Multi-Agent-Structures-02.md

```
from typing import Literal
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.types import Command
model = ChatOpenAI()

# define team 1 (same as the single supervisor example above)

def team_1_supervisor(state: MessagesState) -> Command[Literal["team_1_agent_1", "team_1_agent_2", END]]:
    response = model.invoke(...)
    return Command(goto=response["next_agent"])

def team_1_agent_1(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

def team_1_agent_2(state: MessagesState) -> Command[Literal["team_1_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_1_supervisor", update={"messages": [response]})

team_1_builder = StateGraph(Team1State := MessagesState)
team_1_builder.add_node(team_1_supervisor)
team_1_builder.add_node(team_1_agent_1)
team_1_builder.add_node(team_1_agent_2)
team_1_builder.add_edge(START, "team_1_supervisor")
team_1_graph = team_1_builder.compile()

# define team 2 (same as the single supervisor example above)
class Team2State(MessagesState):
    next: Literal["team_2_agent_1", "team_2_agent_2", "__end__"]

def team_2_supervisor(state: MessagesState) -> Command[Literal["team_2_agent_1", "team_2_agent_2", END]]:
    response = model.invoke(...)
    return Command(goto=response["next_agent"])

def team_2_agent_1(state: MessagesState) -> Command[Literal["team_2_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_2_supervisor", update={"messages": [response]})

def team_2_agent_2(state: MessagesState) -> Command[Literal["team_2_supervisor"]]:
    response = model.invoke(...)
    return Command(goto="team_2_supervisor", update={"messages": [response]})

team_2_builder = StateGraph(Team2State)
team_2_builder.add_node(team_2_supervisor)
team_2_builder.add_node(team_2_agent_1)
team_2_builder.add_node(team_2_agent_2)
team_2_builder.add_edge(START, "team_2_supervisor")
team_2_graph = team_2_builder.compile()


# define top-level supervisor

builder = StateGraph(MessagesState)
def top_level_supervisor(state: MessagesState) -> Command[Literal["team_1_graph", "team_2_graph", END]]:
    # you can pass relevant parts of the state to the LLM (e.g., state["messages"])
    # to determine which team to call next. a common pattern is to call the model
    # with a structured output (e.g. force it to return an output with a "next_team" field)
    response = model.invoke(...)
    # route to one of the teams or exit based on the supervisor's decision
    # if the supervisor returns "__end__", the graph will finish execution
    return Command(goto=response["next_team"])

builder = StateGraph(MessagesState)
builder.add_node(top_level_supervisor)
builder.add_node("team_1_graph", team_1_graph)
builder.add_node("team_2_graph", team_2_graph)
builder.add_edge(START, "top_level_supervisor")
builder.add_edge("team_1_graph", "top_level_supervisor")
builder.add_edge("team_2_graph", "top_level_supervisor")
graph = builder.compile()
```

## BuildBasicChatbot with LangGraph and readline

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/tutorials/get-started/1-build-basic-chatbot.md

```
Assistant: LangGraph is a library designed to help build stateful multi-agent applications using language models. It provides tools for creating workflows and state machines to coordinate multiple AI agents or language model interactions. LangGraph is built on top of LangChain, leveraging its components while adding graph-based coordination capabilities. It's particularly useful for developing more complex, stateful AI applications that go beyond simple query-response interactions.
```
