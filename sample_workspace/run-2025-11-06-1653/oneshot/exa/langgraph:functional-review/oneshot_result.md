# Oneshot Mode Result

**Scenario**: langgraph:functional-review
**Package**: langgraph
**Registry**: py_pi
**Context7 ID**: /websites/langchain-ai_github_io_langgraph
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:55:49.631Z

---

## Query

Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread.

---

## Tool Input

```json
{
  "query": "Using the LangGraph Python library with functional API and memory management, create a review workflow with memory. Compose a 200-word project summary from my bullet points. Pause for my approval; if I reject, I'll provide edits and you'll finalize. Keep short-term memory across invocations within the same thread."
}
```

---

## Tool Result

## Functional API overview - Docs by LangChain

https://docs.langchain.com/oss/python/langgraph/functional-api

```
from langgraph.func import entrypoint

@entrypoint(checkpointer=checkpointer)
def my_workflow(inputs: dict) -> int:
 t0 = inputs["t0"]
 t1 = time.time() 

 delta_t = t1 - t0

 if delta_t > 1:
 result = slow_task(1).result()
 value = interrupt("question")
 else:
 result = slow_task(2).result()
 value = interrupt("question")

 return {
 "result": result,
 "value": value
 }
```

## Use the functional API - Docs by LangChain

https://docs.langchain.com/oss/python/langgraph/use-functional-api

```
from langchain.messages import BaseMessage
from langgraph.graph import add_messages
from langgraph.func import entrypoint, task
from langgraph.checkpoint.memory import InMemorySaver
from langchain_anthropic import ChatAnthropic
model=ChatAnthropic( model="claude-sonnet-4-5-20250929")
@task
def call_model(messages : list[BaseMessage]):
response=model.invoke(messages)
return response
checkpointer=InMemorySaver()
@entrypoint(checkpointer=checkpointer)
def workflow(inputs : list[BaseMessage],*,previous : list[BaseMessage]):
if previous:
inputs=add_messages(previous, inputs)
response=call_model(inputs).result()
return entrypoint.final( value=response, save=add_messages(inputs, response))
config={"configurable" : { "thread_id":"1" }}
input_message={"role":"user","content":"hi! I'm bob"}
for chunk in workflow.stream([input_message], config, stream_mode="values" ):
chunk.pretty_print()
input_message={"role":"user","content":"what's my name?"}
for chunk in workflow.stream([input_message], config, stream_mode="values" ):
chunk.pretty_print()
```

## LangGraph Workflow with Human Feedback and Memory Saving

https://raw.githubusercontent.com/LangChain-OpenTutorial/LangChain-OpenTutorial/main/docs/17-LangGraph/03-Use-Cases/15-LangGraph-Functional-API.md

```
from uuid import uuid4
from langgraph.func import entrypoint, task
from langgraph.types import Command, interrupt
from langgraph.checkpoint.memory import MemorySaver


@task()
def step_1(input_query):
    """Append bar."""
    return f"{input_query} bar"


@task()
def human_feedback(input_query):
    """Append user input."""
    feedback = interrupt(f"Please provide feedback: {input_query}")
    return f"{input_query} {feedback}"


@task()
def step_3(input_query):
    """Append qux."""
    return f"{input_query} qux"

checkpointer = MemorySaver()

@entrypoint(checkpointer=checkpointer)
def graph(input_query):
    result_1 = step_1(input_query).result()
    feedback = interrupt(f"Please provide feedback: {result_1}")

    result_2 = f"{input_query} {feedback}"
    result_3 = step_3(result_2).result()

    return result_3

config = {"configurable": {"thread_id": str(uuid4())}}
for event in graph.stream("foo", config):
    print(event)
    print("\n")
```

## How to add thread-level persistence (functional API)

https://langchain-ai.github.io/langgraph/how-tos/persistence-functional/

```
================================== Ai Message ================================== I don't know your name unless you tell me. Each conversation I have starts fresh, so I don't have access to any previous interactions or personal information unless you share it with me.
```

## Introducing the LangGraph Functional API

https://blog.langchain.com/introducing-the-langgraph-functional-api/

```
from langgraph.func import entrypoint
from langgraph.types import StreamWriter

@entrypoint(checkpointer=checkpointer)
def workflow(inputs, writer: StreamWriter):
 writer("Processing started") # Write to custom stream
 # Do stuff (e.g., call tasks, call llms)
 writer("Processing completed")
 return result

# Consume the stream
for chunk in main.stream(input_data, stream_mode=["custom", "updates", "messages"], config=config):
 print(chunk)
```

## Chatbot Workflow with Langchain and InMemorySaver

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/how-tos/use-functional-api.md

```
from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages
from langgraph.func import entrypoint, task
from langgraph.checkpoint.memory import InMemorySaver
from langchain_anthropic import ChatAnthropic

model = ChatAnthropic(model="claude-3-5-sonnet-latest")

@task
def call_model(messages: list[BaseMessage]):
    response = model.invoke(messages)
    return response

checkpointer = InMemorySaver()

@entrypoint(checkpointer=checkpointer)
def workflow(inputs: list[BaseMessage], *, previous: list[BaseMessage]):
    if previous:
        inputs = add_messages(previous, inputs)

    response = call_model(inputs).result()
    return entrypoint.final(value=response, save=add_messages(inputs, response))

config = {"configurable": {"thread_id": "1"}}
input_message = {"role": "user", "content": "hi! I'm bob"}
for chunk in workflow.stream([input_message], config, stream_mode="values"):
    chunk.pretty_print()

input_message = {"role": "user", "content": "what's my name?"}
for chunk in workflow.stream([input_message], config, stream_mode="values"):
    chunk.pretty_print()
```

## Lesson Planning and Review System with Conversable Agents

https://raw.githubusercontent.com/ag2ai/ag2/main/website/snippets/python-examples/swarm.mdx

```
from autogen import (
    AfterWork,
    OnCondition,
    AfterWorkOption,
    ConversableAgent,
    SwarmResult,
    initiate_swarm_chat,
    register_hand_off,
    LLMConfig,
)

llm_config = LLMConfig(api_type="openai", model="gpt-4o", cache_seed=None)

# 1. Context
shared_context = {
    "lesson_plans": [],
    "lesson_reviews": [],
    # Will be decremented, resulting in 0 (aka False) when no reviews are left
    "reviews_left": 2,
}


# 2. Functions
def record_plan(lesson_plan: str, context_variables: dict) -> SwarmResult:
    """Record the lesson plan"""
    context_variables["lesson_plans"].append(lesson_plan)

    # Returning the updated context so the shared context can be updated
    return SwarmResult(context_variables=context_variables)


def record_review(lesson_review: str, context_variables: dict) -> SwarmResult:
    """After a review has been made, increment the count of reviews"""
    context_variables["lesson_reviews"].append(lesson_review)
    context_variables["reviews_left"] -= 1

    # Controlling the flow to the next agent from a tool call
    return SwarmResult(
        agent=teacher if context_variables["reviews_left"] < 0 else lesson_planner, context_variables=context_variables
    )


planner_message = """You are a classroom lesson planner.
Given a topic, write a lesson plan for a fourth grade class.
If you are given revision feedback, update your lesson plan and record it.
Use the following format:
<title>Lesson plan title</title>
<learning_objectives>Key learning objectives</learning_objectives>
<script>How to introduce the topic to the kids</script>
"""

reviewer_message = """You are a classroom lesson reviewer.
You compare the lesson plan to the fourth grade curriculum
and provide a maximum of 3 recommended changes for each review.
Always provide feedback for the current lesson plan.
"""

teacher_message = """You are a classroom teacher.
You decide topics for lessons and work with a lesson planner.
and reviewer to create and finalise lesson plans.
"""

# 3. Our agents now have tools to use (functions above)
with llm_config:
    lesson_planner = ConversableAgent(name="planner_agent", system_message=planner_message, functions=[record_plan])

    lesson_reviewer = ConversableAgent(name="reviewer_agent", system_message=reviewer_message, functions=[record_review])

    teacher = ConversableAgent(name="teacher_agent", system_message=teacher_message)

# 4. Transitions using hand-offs

# Lesson planner will create a plan and hand off to the reviewer if we're still
# allowing reviews. After that's done, transition to the teacher.
register_hand_off(lesson_planner,
    [
        OnCondition(
            target=lesson_reviewer,
            condition="After creating/updating and recording the plan, it must be reviewed.",
            available="reviews_left",
        ),
        AfterWork(agent=teacher),
    ]
)

# Lesson reviewer will review the plan and return control to the planner if there's
# no plan to review, otherwise it will provide a review and
register_hand_off(lesson_reviewer,
    [
        OnCondition(
            target=lesson_planner, condition="After new feedback has been made and recorded, the plan must be updated."
        ),
        AfterWork(agent=teacher),
    ]
)

# Teacher works with the lesson planner to create a plan. When control returns to them and
# a plan exists, they'll end the swarm.
register_hand_off(teacher,
    [
        OnCondition(target=lesson_planner, condition="Create a lesson plan.", available="reviews_left"),
        AfterWork(AfterWorkOption.TERMINATE),
    ]
)

# 5. Run the Swarm which returns the chat and updated context variables
chat_result, context_variables, last_agent = initiate_swarm_chat(
    initial_agent=teacher,
    agents=[lesson_planner, lesson_reviewer, teacher],
    messages="Today, let's introduce our kids to the solar system.",
    context_variables=shared_context,
)

print(f"Number of reviews: {len(context_variables['lesson_reviews'])}")
print(f"Reviews remaining: {context_variables['reviews_left']}")
print(f"Final Lesson Plan:\n{context_variables['lesson_plans'][-1]}")
```

## Define Workflow Entry Point with Langchain

https://raw.githubusercontent.com/langchain-ai/langgraph/main/docs/docs/concepts/functional_api.md

```
import { entrypoint } from "@langchain/langgraph";

const myWorkflow = entrypoint(
  { checkpointer, name: "workflow" },
  async (someInput: Record<string, any>): Promise<number> => {
    // some logic that may involve long-running tasks like API calls,
    // and may be interrupted for human-in-the-loop
    return result;
  }
);
```

## Memory - Docs by LangChain

https://langchain-ai.github.io/langgraph/how-tos/persistence/#use-in-production

```
thread_id = "1"
checkpointer.delete_thread(thread_id)
```

## Add memory

https://langchain-ai.github.io/langgraph/how-tos/memory/

```
thread_id = "1"checkpointer.delete_thread(thread_id)
```

## WriteBlog Workflow for Automated Blog Post Creation

https://raw.githubusercontent.com/gensx-inc/gensx/main/README.md

```
import * as gensx from "@gensx/core";
import { OpenAIProvider } from "gensx/openai";
import { Research, WriteDraft, EditDraft } from "./writeBlog";

interface WriteBlogInput {
  title: string;
  description: string;
}

const WriteBlog = gensx.Workflow(
  "WriteBlog",
  async ({ title, description }: WriteBlogInput) => {
    const queries = await GenerateQueries({
      title,
      description,
    });
    const research = await ResearchBlog({ queries });
    const draft = await WriteDraft({ title, context: research });
    const final = await EditDraft({ title, content: draft });
    return final;
  },
);

const result = await WriteBlog({
  title: "How AI broke modern infra",
  description: "Long-running workflows require a new approach to infra",
});
```

## Creates Context for Workflow State Management

https://raw.githubusercontent.com/run-llama/llama_index/main/docs/docs/understanding/agent/state.md

```
Hello Laurie! How can I assist you today?
```

## ChatService: FastAPI Workflow with Google Gemini and Dapr

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/07_daca_deployment_guide/old/old_04_daca_planet_scale_kubernetes_deployment_on_oracle/readme.md

```
import logging
from typing import Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowContext, WorkflowActivityContext
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateOptions, Concurrency, Consistency
import uuid
from datetime import datetime, timezone
import json
import time
import os
from sqlmodel import SQLModel, Session, create_engine
from models import Conversation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ChatService")

app = FastAPI()

# Database setup with SQLModel (Postgres)
connection_string = os.getenv("DB_CONNECTION")
engine = create_engine(connection_string, echo=True)
SQLModel.metadata.create_all(engine)

# Pydantic models
class ChatRequest(BaseModel):
    user_id: str
    text: str
    metadata: Dict[str, Any]
    tags: list[str] = []

class ChatResponse(BaseModel):
    user_id: str
    reply: str
    metadata: Dict[str, Any]

# Sensitive keywords requiring human review
SENSITIVE_KEYWORDS = ["urgent", "help", "emergency"]

# Dapr client for interacting with Dapr APIs
dapr_client = DaprClient()

# Google Gemini client setup
def get_gemini_client():
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not set")
    genai.configure(api_key=gemini_api_key)
    return genai

def generate_reply(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> str:
    user_id = input["user_id"]
    message = input["message"]
    message_count = input["message_count"]
    history = input["history"]
    
    prompt = f"User {user_id} has sent {message_count} messages. History: {history}\nMessage: {message}\nReply as a helpful assistant:"
    client = get_gemini_client()
    model = client.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text.strip()

def fetch_message_count(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> int:
    user_id = input["user_id"]
    with DaprClient() as d:
        resp = d.invoke_method(
            app_id="analytics-service",
            method_name=f"analytics/{user_id}",
            http_verb="GET"
        )
        data = resp.json()
        return data.get("message_count", 0)

def get_conversation_history(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> str:
    user_id = input["user_id"]
    with Session(engine) as session:
        conversations = session.query(Conversation).filter(Conversation.user_id == user_id).all()
        if not conversations:
            return "No previous conversation."
        history = "\n".join([f"User: {conv.message}\nAssistant: {conv.reply}" for conv in conversations])
        return history

def store_conversation(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> None:
    user_id = input["user_id"]
    message = input["message"]
    reply = input["reply"]
    conversation = Conversation(user_id=user_id, message=message, reply=reply)
    with Session(engine) as session:
        session.add(conversation)
        session.commit()

def publish_message_sent_event(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> None:
    user_id = input["user_id"]
    with DaprClient() as d:
        d.publish_event(
            pubsub_name="pubsub",
            topic_name="messages",
            data=json.dumps({"user_id": user_id, "event_type": "MessageSent"}),
            data_content_type="application/json"
        )

def check_sensitive_content(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> Dict[str, Any]:
    message = input["message"]
    is_sensitive = any(keyword in message.lower() for keyword in SENSITIVE_KEYWORDS)
    return {"is_sensitive": is_sensitive, "message": message}

def request_human_review(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> None:
    user_id = input["user_id"]
    message = input["message"]
    proposed_reply = input["proposed_reply"]
    instance_id = input["instance_id"]
    with DaprClient() as d:
        d.publish_event(
            pubsub_name="pubsub",
            topic_name="human-review",
            data=json.dumps({
                "user_id": user_id,
                "message": message,
                "proposed_reply": proposed_reply,
                "instance_id": instance_id,
                "event_type": "HumanReviewRequired"
            }),
            data_content_type="application/json"
        )

def wait_for_human_decision(ctx: WorkflowActivityContext, input: Dict[str, Any]) -> Dict[str, Any]:
    instance_id = input["instance_id"]
    with DaprClient() as d:
        while True:
            state_key = f"human-decision-{instance_id}"
            state = d.get_state(
                store_name="statestore",
                key=state_key,
                state_options=StateOptions(concurrency=Concurrency.first_write, consistency=Consistency.strong)
            )
            if state.data:
                decision_data = json.loads(state.data.decode('utf-8'))
                d.delete_state(store_name="statestore", key=state_key)
                return decision_data
            time.sleep(1)

def chat_workflow(context: DaprWorkflowContext, input: Dict[str, Any]) -> Dict[str, Any]:
    user_id = input["user_id"]
    message = input["message"]
    instance_id = context.instance_id

    logger.info(f"Starting workflow for user {user_id} with message: {message}")

    message_count = yield context.call_activity(fetch_message_count, input={"user_id": user_id})
    history = yield context.call_activity(get_conversation_history, input={"user_id": user_id})
    proposed_reply = yield context.call_activity(generate_reply, input={
        "user_id": user_id,
        "message": message,
        "message_count": message_count,
        "history": history
    })
    sensitive_result = yield context.call_activity(check_sensitive_content, input={"message": message})
    is_sensitive = sensitive_result["is_sensitive"]

    if is_sensitive:
        logger.info(f"Sensitive content detected in message: {message}. Requesting human review.")
        yield context.call_activity(request_human_review, input={
            "user_id": user_id,
            "message": message,
            "proposed_reply": proposed_reply,
            "instance_id": instance_id
        })
        decision = yield context.call_activity(wait_for_human_decision, input={"instance_id": instance_id})
        approved = decision["approved"]

        if not approved:
            logger.info(f"Human rejected the response for user {user_id}. Aborting workflow.")
            return {
                "user_id": user_id,
                "reply": "Message rejected by human reviewer.",
                "metadata": {"timestamp": datetime.now(timezone.utc).isoformat(), "session_id": str(uuid.uuid4())}
            }

    yield context.call_activity(store_conversation, input={
        "user_id": user_id,
        "message": message,
        "reply": proposed_reply
    })
    yield context.call_activity(publish_message_sent_event, input={"user_id": user_id})

    logger.info(f"Completed workflow for user {user_id}")
    return {
        "user_id": user_id,
        "reply": proposed_reply,
        "metadata": {"timestamp": datetime.now(timezone.utc).isoformat(), "session_id": str(uuid.uuid4())}
    }

workflow_runtime = WorkflowRuntime()
workflow_runtime.register_workflow(chat_workflow)
workflow_runtime.register_activity(fetch_message_count)
workflow_runtime.register_activity(get_conversation_history)
workflow_runtime.register_activity(generate_reply)
workflow_runtime.register_activity(store_conversation)
workflow_runtime.register_activity(publish_message_sent_event)
workflow_runtime.register_activity(check_sensitive_content)
workflow_runtime.register_activity(request_human_review)
workflow_runtime.register_activity(wait_for_human_decision)

@app.on_event("startup")
async def start_workflow_runtime():
    await workflow_runtime.start()

@app.on_event("shutdown")
async def stop_workflow_runtime():
    await workflow_runtime.shutdown()

@app.post("/chat/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.info(f"Received chat request for user {request.user_id}: {request.text}")
    instance_id = f"chat-{request.user_id}-{int(time.time())}"
    logger.info(f"Scheduling workflow with instance_id: {instance_id}")

    with DaprClient() as d:
        d.start_workflow(
            workflow_component="dapr",
            workflow_name="chat_workflow",
            input={
                "user_id": request.user_id,
                "message": request.text
            },
            instance_id=instance_id
        )

        while True:
            state = d.get_workflow(instance_id=instance_id, workflow_component="dapr")
            if state.runtime_status == "COMPLETED":
                result = state.result
                return ChatResponse(**result)
            elif state.runtime_status == "FAILED":
                raise HTTPException(status_code=500, detail="Workflow failed")
            time.sleep(0.5)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Workflow Control for Spec Generation in Gradual Phases

https://raw.githubusercontent.com/wasabeef/claude-code-cookbook/main/locales/pt/commands/spec.md

```
Conclusão Phase 1 → "Próximo passo" → Geração de requirements.md
Conclusão Phase 2 → "Próximo passo" → Geração de design.md
Conclusão Phase 3 → "Próximo passo" → Geração de tasks.md
```

## Create Workflow with Agent for Text Analysis

https://raw.githubusercontent.com/VoltAgent/voltagent/main/website/docs/workflows/steps/and-agent.md

```
import { createWorkflowChain, Agent } from "@voltagent/core";
import { z } from "zod";

// Create an agent
const agent = new Agent({
  name: "Assistant",
  llm: provider,
  model: "gpt-4",
});

// Use it in a workflow
const workflow = createWorkflowChain({
  id: "analyze-text",
  input: z.object({ text: z.string() }),
}).andAgent(({ data }) => `Analyze this text: ${data.text}`, agent, {
  schema: z.object({
    sentiment: z.enum(["positive", "negative", "neutral"]),
    summary: z.string(),
  }),
});

const result = await workflow.run({ text: "I love this!" });
// Result: { sentiment: "positive", summary: "Expression of enthusiasm" }
```
