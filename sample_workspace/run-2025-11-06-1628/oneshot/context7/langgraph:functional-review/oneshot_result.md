# Oneshot Mode Result

**Scenario**: langgraph:functional-review
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:29:56.608Z

---

## Query

Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/websites/langchain-ai_github_io_langgraph",
  "topic": "Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread."
}
```

---

## Tool Result

### Review Workflow with Caching and Interruption

Source: https://langchain-ai.github.io/langgraph/reference/func

Sets up a workflow using `@entrypoint` to manage essay generation and review. It uses `InMemorySaver` for checkpointers, allowing results to be cached. The workflow includes an `interrupt` call for human review, demonstrating how the workflow can pause and resume.

```python
from langgraph.func import entrypoint, task
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import InMemorySaver

@task
def compose_essay(topic: str) -> str:
    time.sleep(1.0)  # Simulate slow operation
    return f"An essay about {topic}"

@entrypoint(checkpointer=InMemorySaver())
def review_workflow(topic: str) -> dict:
    """Manages the workflow for generating and reviewing an essay.

    The workflow includes:
    1. Generating an essay about the given topic.
    2. Interrupting the workflow for human review of the generated essay.

    Upon resuming the workflow, compose_essay task will not be re-executed
    as its result is cached by the checkpointer.

    Args:
        topic: The subject of the essay.

    Returns:
        dict: A dictionary containing the generated essay and the human review.
    """
    essay_future = compose_essay(topic)
    essay = essay_future.result()
    human_review = interrupt({
        "question": "Please provide a review",
        "essay": essay
    })
    return {
        "essay": essay,
        "review": human_review,
    }

# Example configuration for the workflow
config = {
    "configurable": {
        "thread_id": "some_thread"
    }
}

# Topic for the essay
topic = "cats"

# Stream the workflow to generate the essay and await human review
for result in review_workflow.stream(topic, config):
    print(result)

# Example human review provided after the interrupt
human_review = "This essay is great."
```

--------------------------------

### Define Workflow with Memory - Python

Source: https://langchain-ai.github.io/langgraph/how-tos/persistence-functional

Defines the chatbot's workflow using LangGraph. It includes a task to call the model and an entrypoint that manages message history using an InMemorySaver for short-term memory. The workflow persists conversation context across interactions.

```Python
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages
from langgraph.func import entrypoint, task
from langgraph.checkpoint.memory import InMemorySaver


@task
defcall_model(messages: list[BaseMessage]):
    response = model.invoke(messages)
    return response


checkpointer = InMemorySaver()


@entrypoint(checkpointer=checkpointer)
defworkflow(inputs: list[BaseMessage], *, previous: list[BaseMessage]):
    if previous:
        inputs = add_messages(previous, inputs)

    response = call_model(inputs).result()
    return entrypoint.final(value=response, save=add_messages(inputs, response))
```

--------------------------------

### Trim Messages in LangGraph Workflow

Source: https://langchain-ai.github.io/langgraph/how-tos/memory/add-memory

Shows how to integrate the `trim_messages` function directly into a workflow's `call_model` function. This approach manages message history before invoking the model within a custom LangGraph state.

```Python
from langchain_core.messages.utils import (
    trim_messages,
    count_tokens_approximately
)

def call_model(state: MessagesState):
    messages = trim_messages(
        state["messages"],
        strategy="last",
        token_counter=count_tokens_approximately,
        max_tokens=128,
        start_on="human",
        end_on=("human", "tool"),
    )
    response = model.invoke(messages)
    return {"messages": [response]}
```

--------------------------------

### LangGraph Short-term Memory with Checkpointer

Source: https://langchain-ai.github.io/langgraph/concepts/functional_api

Illustrates how to implement short-term memory in LangGraph using a checkpointer. The `previous` parameter in the entrypoint retrieves the state from the last invocation, defaulting to 0 if none exists. Shows basic addition using previous state.

```Python
@entrypoint(checkpointer=checkpointer)
defmy_workflow(number: int, *, previous: Any = None) -> int:
    previous = previous or 0
    return number + previous

config = {
    "configurable": {
        "thread_id": "some_thread_id"
    }
}

my_workflow.invoke(1, config)  # 1 (previous was None)
my_workflow.invoke(2, config)  # 3 (previous was 1 from the previous invocation)
```

--------------------------------

### Trim Messages in LangGraph Workflow

Source: https://langchain-ai.github.io/langgraph/how-tos/persistence

Shows how to integrate the `trim_messages` function directly into a workflow's `call_model` function. This approach manages message history before invoking the model within a custom LangGraph state.

```Python
from langchain_core.messages.utils import (
    trim_messages,
    count_tokens_approximately
)

def call_model(state: MessagesState):
    messages = trim_messages(
        state["messages"],
        strategy="last",
        token_counter=count_tokens_approximately,
        max_tokens=128,
        start_on="human",
        end_on=("human", "tool"),
    )
    response = model.invoke(messages)
    return {"messages": [response]}
```

--------------------------------

### Create Workflow with Memory Persistence

Source: https://langchain-ai.github.io/langgraph/js/how-tos/persistence-functional

Defines a LangGraph workflow with a single task to call the chat model. It incorporates memory persistence by using a MemorySaver as a Checkpointer, allowing the conversation state to be saved and retrieved across interactions.

```typescript
importtype{BaseMessage,BaseMessageLike}from"@langchain/core/messages";
import{
addMessages,
entrypoint,
task,
getPreviousState,
MemorySaver,
}from"@langchain/langgraph";

constcallModel=task("callModel",async(messages:BaseMessageLike[])=>{
constresponse=model.invoke(messages);
returnresponse;
});

constcheckpointer=newMemorySaver();

constworkflow=entrypoint({
name:"workflow",
checkpointer,
},
async(inputs:BaseMessageLike[])=>{
constprevious=getPreviousState<BaseMessage>()??[];
constmessages=addMessages(previous,inputs);
constresponse=awaitcallModel(messages);
returnentrypoint.final({
value:response,
save:addMessages(messages,response),
});
});
```

--------------------------------

### Read Short-Term Memory in LangGraph Tools

Source: https://langchain-ai.github.io/langgraph/how-tos/memory/add-memory

This snippet demonstrates how to allow LangGraph agents to access their short-term memory (state) within custom tools. It uses `InjectedState` to pass the agent's state to the tool function, enabling dynamic responses based on the current state.

```Python
from typing import Annotated
from langgraph.prebuilt import InjectedState, create_react_agent

class CustomState(AgentState):
    user_id: str

def get_user_info(
    state: Annotated[CustomState, InjectedState]
) -> str:
    """Look up user info."""
    user_id = state["user_id"]
    return "User is John Smith" if user_id == "user_123" else "Unknown user"

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_user_info],
    state_schema=CustomState,
)

agent.invoke({
    "messages": "look up user information",
    "user_id": "user_123"
})
```

--------------------------------

### Define Essay Writing Workflow with Interrupt

Source: https://langchain-ai.github.io/langgraph/concepts/functional_api

Defines a LangGraph workflow that writes an essay using a task and then interrupts for human review. It utilizes `InMemorySaver` for checkpointing and `interrupt` to pass data to the user for approval.

```Python
fromlanggraph.checkpoint.memoryimport InMemorySaver
fromlanggraph.funcimport entrypoint, task
fromlanggraph.typesimport interrupt
importtime

@task
defwrite_essay(topic: str) -> str:
    """Write an essay about the given topic."""
    time.sleep(1)  # This is a placeholder for a long-running task.
    return f"An essay about topic: {topic}"

@entrypoint(checkpointer=InMemorySaver())
defworkflow(topic: str) -> dict:
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
```

--------------------------------

### Read Short-Term Memory in LangGraph Tools

Source: https://langchain-ai.github.io/langgraph/how-tos/cross-thread-persistence

This snippet demonstrates how to allow LangGraph agents to access their short-term memory (state) within custom tools. It uses `InjectedState` to pass the agent's state to the tool function, enabling dynamic responses based on the current state.

```Python
from typing import Annotated
from langgraph.prebuilt import InjectedState, create_react_agent

class CustomState(AgentState):
    user_id: str

def get_user_info(
    state: Annotated[CustomState, InjectedState]
) -> str:
    """Look up user info."""
    user_id = state["user_id"]
    return "User is John Smith" if user_id == "user_123" else "Unknown user"

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_user_info],
    state_schema=CustomState,
)

agent.invoke({
    "messages": "look up user information",
    "user_id": "user_123"
})
```

--------------------------------

### Read Short-Term Memory in LangGraph Tools

Source: https://langchain-ai.github.io/langgraph/how-tos/persistence

This snippet demonstrates how to allow LangGraph agents to access their short-term memory (state) within custom tools. It uses `InjectedState` to pass the agent's state to the tool function, enabling dynamic responses based on the current state.

```Python
from typing import Annotated
from langgraph.prebuilt import InjectedState, create_react_agent

class CustomState(AgentState):
    user_id: str

def get_user_info(
    state: Annotated[CustomState, InjectedState]
) -> str:
    """Look up user info."""
    user_id = state["user_id"]
    return "User is John Smith" if user_id == "user_123" else "Unknown user"

agent = create_react_agent(
    model="anthropic:claude-3-7-sonnet-latest",
    tools=[get_user_info],
    state_schema=CustomState,
)

agent.invoke({
    "messages": "look up user information",
    "user_id": "user_123"
})
```

--------------------------------

### Summarize conversation history

Source: https://langchain-ai.github.io/langgraph/how-tos/cross-thread-persistence

This Python function, `summarize_conversation`, takes a state object containing message history and an optional existing summary. It constructs a prompt to either create a new summary or extend an existing one using a language model. The function then invokes the model, updates the summary, and prunes the message history to keep only the two most recent messages.

```python
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, BaseMessage
from typing import Dict, List, Any

# Assuming 'model' and 'State' are defined elsewhere
# class State(MessagesState):
#     summary: str
#     messages: List[BaseMessage]

def summarize_conversation(state: State):

    # First, we get any existing summary
    summary = state.get("summary", "")

    # Create our summarization prompt
    if summary:

        # A summary already exists
        summary_message = (
            f"This is a summary of the conversation to date: {summary}\n\n"
            "Extend the summary by taking into account the new messages above:"
        )

    else:
        summary_message = "Create a summary of the conversation above:"

    # Add prompt to our history
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)

    # Delete all but the 2 most recent messages
    delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]
    return {"summary": response.content, "messages": delete_messages}

```

--------------------------------

### Summarize conversation history

Source: https://langchain-ai.github.io/langgraph/how-tos/persistence

This Python function, `summarize_conversation`, takes a state object containing message history and an optional existing summary. It constructs a prompt to either create a new summary or extend an existing one using a language model. The function then invokes the model, updates the summary, and prunes the message history to keep only the two most recent messages.

```python
from langgraph.graph import MessagesState
from langchain_core.messages import HumanMessage, BaseMessage
from typing import Dict, List, Any

# Assuming 'model' and 'State' are defined elsewhere
# class State(MessagesState):
#     summary: str
#     messages: List[BaseMessage]

def summarize_conversation(state: State):

    # First, we get any existing summary
    summary = state.get("summary", "")

    # Create our summarization prompt
    if summary:

        # A summary already exists
        summary_message = (
            f"This is a summary of the conversation to date: {summary}\n\n"
            "Extend the summary by taking into account the new messages above:"
        )

    else:
        summary_message = "Create a summary of the conversation above:"

    # Add prompt to our history
    messages = state["messages"] + [HumanMessage(content=summary_message)]
    response = model.invoke(messages)

    # Delete all but the 2 most recent messages
    delete_messages = [RemoveMessage(id=m.id) for m in state["messages"][:-2]]
    return {"summary": response.content, "messages": delete_messages}

```
