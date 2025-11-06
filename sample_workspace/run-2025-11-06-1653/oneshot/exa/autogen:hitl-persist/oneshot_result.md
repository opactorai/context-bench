# Oneshot Mode Result

**Scenario**: autogen:hitl-persist
**Package**: autogen
**Registry**: py_pi
**Context7 ID**: /microsoft/autogen
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:54:44.247Z

---

## Query

Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback.

---

## Tool Input

```json
{
  "query": "Using the Autogen Python library with human-in-the-loop and state persistence, build an interactive agent system. Propose a 2-step cold-email. After your first draft, pause and wait for my feedback on the audience. When resumed, refine the email using my feedback."
}
```

---

## Tool Result

## Human-in-the-Loop — AutoGen - Microsoft Open Source

https://microsoft.github.io/autogen/stable//user-guide/agentchat-user-guide/tutorial/human-in-the-loop.html

```
TaskResult(messages=[TextMessage(source='user', models_usage=None, content='The weather in New York is sunny.', type='TextMessage'), TextMessage(source='lazy_assistant', models_usage=RequestUsage(prompt_tokens=110, completion_tokens=21), content="Great! Enjoy the sunny weather in New York! Is there anything else you'd like to know?", type='TextMessage'), TextMessage(source='lazy_assistant', models_usage=RequestUsage(prompt_tokens=137, completion_tokens=5), content='TERMINATE', type='TextMessage')], stop_reason="Text 'TERMINATE' mentioned")
```

## Allowing Human Feedback in Agents | AutoGen 0.2

https://microsoft.github.io/autogen/0.2/docs/tutorial/human-in-the-loop/

```
agent_with_number(to agent_guess_number):
I have a number between 1 and 100. Guess it!
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 50?
--------------------------------------------------------------------------------
>>>>>>>> USING AUTO REPLY...
agent_with_number(to agent_guess_number):
Too low.
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 75?
--------------------------------------------------------------------------------
agent_with_number(to agent_guess_number):
It is too high my friend.
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 60?
--------------------------------------------------------------------------------
>>>>>>>> USING AUTO REPLY...
agent_with_number(to agent_guess_number):
Too high.
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 55?
--------------------------------------------------------------------------------
agent_with_number(to agent_guess_number):
still too high, but you are very close.
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 52?
--------------------------------------------------------------------------------
>>>>>>>> USING AUTO REPLY...
agent_with_number(to agent_guess_number):
Too low.
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 54?
--------------------------------------------------------------------------------
agent_with_number(to agent_guess_number):
Almost there!
--------------------------------------------------------------------------------
agent_guess_number(to agent_with_number):
Is it 53?
--------------------------------------------------------------------------------
```

## Human-in-the-Loop Approval with DataSendingAgent

https://raw.githubusercontent.com/EvoAgentX/EvoAgentX/main/docs/tutorial/hitl.md

```
🔔 Human-in-the-Loop approval request
================================================================================
Task: send_node
Agent: DataSendingAgent
Action: DummyEmailSendAction (PRE-EXECUTION)
...
Please select [a]pprove / [r]eject: _
```

## Drafts Casual Email Using User Feedback

https://raw.githubusercontent.com/ai-hero-dev/poland-ai-ts-workshop/main/exercises/07-human-in-the-loop/07.4-passing-custom-message-history-to-the-llm/problem/readme.md

```
## User Message

Send an email to team@aihero.dev saying what a fantastic AI workshop I'm currently attending. Thank them for the workshop.

## Assistant Message

I'd be happy to draft an email to the team at AI Hero expressing your gratitude for the workshop! Here's what I'd like to send:

The assistant requested to send an email:
To: team@aihero.dev
Subject: Thank You for the Fantastic AI Workshop
Content: Hello AI Hero Team,

I wanted to take a moment to express my sincere gratitude for the fantastic AI workshop I'm currently attending. The content has been incredibly insightful, and I'm learning so much valuable information.

Thank you for putting together such an excellent educational experience. I truly appreciate the effort that went into creating this workshop.

Best regards,
John Doe

## User Message

The user rejected the action: The email is too formal. Make it more casual and friendly.
```

## Autogen 0.4.5 | Human in the loop with UI

https://github.com/microsoft/autogen/discussions/5324

```
self.user_proxy = UserProxyAgent(
 name="user_proxy",
 description="A human user of our application. To be contacted or queried for information and feedback as needed.",
 input_func=input_by_user
 )
```

## WriteEmail and Feedback Classes for Email Generation

https://raw.githubusercontent.com/pydantic/pydantic-ai/main/docs/graph.md

```
from __future__ import annotations as _annotations

from dataclasses import dataclass, field

from pydantic import BaseModel, EmailStr

from pydantic_ai import Agent, format_as_xml
from pydantic_ai.messages import ModelMessage
from pydantic_graph import BaseNode, End, Graph, GraphRunContext


@dataclass
class User:
    name: str
    email: EmailStr
    interests: list[str]


@dataclass
class Email:
    subject: str
    body: str


@dataclass
class State:
    user: User
    write_agent_messages: list[ModelMessage] = field(default_factory=list)


email_writer_agent = Agent(
    'google-vertex:gemini-1.5-pro',
    output_type=Email,
    system_prompt='Write a welcome email to our tech blog.',
)


@dataclass
class WriteEmail(BaseNode[State]):
    email_feedback: str | None = None

    async def run(self, ctx: GraphRunContext[State]) -> Feedback:
        if self.email_feedback:
            prompt = (
                f'Rewrite the email for the user:\n'
                f'{format_as_xml(ctx.state.user)}\n'
                f'Feedback: {self.email_feedback}'
            )
        else:
            prompt = (
                f'Write a welcome email for the user:\n'
                f'{format_as_xml(ctx.state.user)}'
            )

        result = await email_writer_agent.run(
            prompt,
            message_history=ctx.state.write_agent_messages,
        )
        ctx.state.write_agent_messages += result.new_messages()
        return Feedback(result.output)


class EmailRequiresWrite(BaseModel):
    feedback: str


class EmailOk(BaseModel):
    pass


feedback_agent = Agent[None, EmailRequiresWrite | EmailOk](
    'openai:gpt-4o',
    output_type=EmailRequiresWrite | EmailOk,  # type: ignore
    system_prompt=(
        'Review the email and provide feedback, email must reference the users specific interests.'
    ),
)


@dataclass
class Feedback(BaseNode[State, None, Email]):
    email: Email

    async def run(
        self,
        ctx: GraphRunContext[State],
    ) -> WriteEmail | End[Email]:
        prompt = format_as_xml({'user': ctx.state.user, 'email': self.email})
        result = await feedback_agent.run(prompt)
        if isinstance(result.output, EmailRequiresWrite):
            return WriteEmail(email_feedback=result.output.feedback)
        else:
            return End(self.email)


async def main():
    user = User(
        name='John Doe',
        email='john.joe@example.com',
        interests=['Haskel', 'Lisp', 'Fortran'],
    )
    state = State(user)
    feedback_graph = Graph(nodes=(WriteEmail, Feedback))
    result = await feedback_graph.run(WriteEmail(), state=state)
    print(result.output)
    """
    Email(
        subject='Welcome to our tech blog!',
        body='Hello John, Welcome to our tech blog! ...',
    )
    """
```

## Auto-Configuration of Agent Profiles and Tasks Using LLM

https://raw.githubusercontent.com/Ingenimax/agent-sdk-go/main/README.md

```
The auto-configuration feature uses LLM reasoning to derive a complete agent profile and associated tasks from a simple system prompt. The generated configurations include:

- **Agent Profile**: Role, goal, and backstory that define the agent's persona
- **Task Definitions**: Specialized tasks the agent can perform, with descriptions and expected outputs
- **Reusable YAML**: Save configurations for reuse in other applications

This approach dramatically reduces the effort needed to create specialized agents while ensuring consistency and quality.

### Using MCP Servers with an Agent
```

## Asynchronous Multi-Turn Conversation with OpenAI Agent

https://raw.githubusercontent.com/comet-ml/opik/main/apps/opik-documentation/documentation/fern/docs/tracing/integrations/openai_agents.mdx

```
async def main():
    agent = Agent(name="Assistant", instructions="Reply very concisely.")

    thread_id = str(uuid.uuid4())

    with trace(workflow_name="Conversation", group_id=thread_id):
        # First turn
        result = await Runner.run(agent, "What city is the Golden Gate Bridge in?")
        print(result.final_output)
        # San Francisco

        # Second turn
        new_input = result.to_input_list() + [{"role": "user", "content": "What state is it in?"}]
        result = await Runner.run(agent, new_input)
        print(result.final_output)
        # California
```

## Run Dexto Agent with Custom System Prompt

https://raw.githubusercontent.com/truffle-ai/dexto/main/docs/docs/getting-started/first-agent-tutorial.md

```
dexto --agent agent.yml "Who are you?"
```

## Email Feedback Loop with Graph Orchestrator

https://raw.githubusercontent.com/dynamiq-ai/dynamiq/main/README.md

```
from typing import Any

from dynamiq.connections import OpenAI as OpenAIConnection
from dynamiq.nodes.agents.orchestrators.graph import END, START, GraphOrchestrator
from dynamiq.nodes.agents.orchestrators.graph_manager import GraphAgentManager
from dynamiq.nodes.agents.simple import SimpleAgent
from dynamiq.nodes.llms import OpenAI

llm = OpenAI(
    connection=OpenAIConnection(api_key="OPENAI_API_KEY"),
    model="gpt-4o",
    temperature=0.1,
)

email_writer = SimpleAgent(
    name="email-writer-agent",
    llm=llm,
    role="Write personalized emails taking into account feedback.",
)


def gather_feedback(context: dict[str, Any], **kwargs):
    """Gather feedback about email draft."""
    feedback = input(
        f"Email draft:\n"
        f"{context.get('history', [{}])[-1].get('content', 'No draft')}\n"
        f"Type in SEND to send email, CANCEL to exit, or provide feedback to refine email: \n"
    )

    reiterate = True

    result = f"Gathered feedback: {feedback}"

    feedback = feedback.strip().lower()
    if feedback == "send":
        print("####### Email was sent! #######")
        result = "Email was sent!"
        reiterate = False
    elif feedback == "cancel":
        print("####### Email was canceled! #######")
        result = "Email was canceled!"
        reiterate = False

    return {"result": result, "reiterate": reiterate}


def router(context: dict[str, Any], **kwargs):
    """Determines next state based on provided feedback."""
    if context.get("reiterate", False):
        return "generate_sketch"

    return END


orchestrator = GraphOrchestrator(
    name="Graph orchestrator",
    manager=GraphAgentManager(llm=llm),
)

# Attach tasks to the states. These tasks will be executed when the respective state is triggered.
orchestrator.add_state_by_tasks("generate_sketch", [email_writer])
orchestrator.add_state_by_tasks("gather_feedback", [gather_feedback])

# Define the flow between states by adding edges.
# This configuration creates the sequence of states from START -> "generate_sketch" -> "gather_feedback".
orchestrator.add_edge(START, "generate_sketch")
orchestrator.add_edge("generate_sketch", "gather_feedback")

# Add a conditional edge to the "gather_feedback" state, allowing the flow to branch based on a condition.
# The router function will determine whether the flow should go to "generate_sketch" (reiterate) or END (finish the process).
orchestrator.add_conditional_edge("gather_feedback", ["generate_sketch", END], router)


if __name__ == "__main__":
    print("Welcome to email writer.")
    email_details = input("Provide email details: ")
    orchestrator.run(input_data={"input": f"Write and post email, provide feedback about status of email: {email_details}"})
```

## log Result 1

https://raw.githubusercontent.com/intel/BigDL/main/python/llm/example/CPU/HF-Transformers-AutoModels/Model/falcon/README.md

```
Inference time: xxxx s
-------------------- Prompt --------------------
<human> What is AI? <bot>
-------------------- Output --------------------
<human> What is AI? <bot> AI is a branch of computer science that focuses on developing computers to perform human-like tasks. <human> What are some examples of these tasks?
```

## Generate Random Transactions for Human-in-the-Loop Approval

https://raw.githubusercontent.com/ag2ai/ag2/main/website/docs/user-guide/basic-concepts/human-in-the-loop.mdx

```
# Generate sample transactions - this creates different transactions each time you run
VENDORS = ["Staples", "Acme Corp", "CyberSins Ltd", "Initech", "Globex", "Unicorn LLC"]
MEMOS = ["Quarterly supplies", "Confidential", "NDA services", "Routine payment", "Urgent request", "Reimbursement"]

def generate_transaction():
    amount = random.choice([500, 1500, 9999, 12000, 23000, 4000])
    vendor = random.choice(VENDORS)
    memo = random.choice(MEMOS)
    return f"Transaction: ${amount} to {vendor}. Memo: {memo}."

# Generate 3 random transactions
transactions = [generate_transaction() for _ in range(3)]

# Format the initial message
initial_prompt = (
    "Please process the following transactions one at a time:\n\n" +
    "\n".join([f"{i+1}. {tx}" for i, tx in enumerate(transactions)])
)

# Start the conversation from the human agent
response = human.run(
    recipient=finance_bot,
    message=initial_prompt,
)

# Display the response
response.process()
```

## SimpleWriteTest Class for Generating Unit Tests

https://raw.githubusercontent.com/datawhalechina/hugging-multi-agent/main/docs/chapter4/多智能体组件介绍.md

```
your code:
    """

    name: str = "SimpleWriteTest"

    async def run(self, context: str, k: int = 3):
        prompt = self.PROMPT_TEMPLATE.format(context=context, k=k)

        rsp = await self._aask(prompt)

        code_text = parse_code(rsp)

        return code_text


class SimpleTester(Role):
    name: str = "Bob"
    profile: str = "SimpleTester"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_actions([SimpleWriteTest])
        # self._watch([SimpleWriteCode])
        self._watch([SimpleWriteCode, SimpleWriteReview])  # feel free to try this too

    async def _act(self) -> Message:
        logger.info(f"{self._setting}: to do {self.rc.todo}({self.rc.todo.name})")
        todo = self.rc.todo

        # context = self.get_memories(k=1)[0].content # use the most recent memory as context
        context = self.get_memories()  # use all memories as context

        code_text = await todo.run(context, k=5)  # specify arguments
        msg = Message(content=code_text, role=self.profile, cause_by=type(todo))

        return msg


class SimpleWriteReview(Action):
    PROMPT_TEMPLATE: str = """
    Context: {context}
    Review the test cases and provide one critical comments:
    """

    name: str = "SimpleWriteReview"

    async def run(self, context: str):
        prompt = self.PROMPT_TEMPLATE.format(context=context)

        rsp = await self._aask(prompt)

        return rsp


class SimpleReviewer(Role):
    name: str = "Charlie"
    profile: str = "SimpleReviewer"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_actions([SimpleWriteReview])
        self._watch([SimpleWriteTest])


async def main(
    idea: str = "write a function that calculates the product of a list",
    investment: float = 3.0,
    n_round: int = 5,
    add_human: bool = False,
):
    logger.info(idea)

    team = Team()
    team.hire(
        [
            SimpleCoder(),
            SimpleTester(),
            SimpleReviewer(is_human=add_human),
        ]
    )

    team.invest(investment=investment)
    team.run_project(idea)
    await team.run(n_round=n_round)


if __name__ == "__main__":
    fire.Fire(main)
```

## DataAnalystAgent Chat Functionality Implementation

https://raw.githubusercontent.com/inspector-apm/neuron-ai/main/README.md

```
$agent = DataAnalystAgent::make();


$response = $agent->chat(
    new UserMessage("Hi, I'm Valerio. Who are you?")
);
echo $response->getContent();
// I'm a data analyst. How can I help you today?


$response = $agent->chat(
    new UserMessage("Do you remember my name?")
);
echo $response->getContent();
// Your name is Valerio, as you said in your introduction.
```

## How to Automate Cold E-Mails using ChatGPT and 67 Lines of Code

https://medium.com/thorium-blog/how-to-automate-cold-e-mails-using-chatgpt-and-73-lines-of-code-a77b05f3b102

```
for i, row in df.iterrows(): email_instructions = openai.ChatCompletion.create( model="gpt-3.5-turbo", messages=[ {"role": "user", "content": base_prompt + row['Website Content']}, ], temperature=0.0, frequency_penalty=-0.5 ) email_draft = openai.ChatCompletion.create( model="gpt-4", messages=[ {"role": "user", "content": instruction_prefix + email_instructions}, ], temperature=0.3, frequency_penalty=-0.5 ) final_email = email_draft = openai.ChatCompletion.create( model="gpt-4", messages=[ {"role": "user", "content": refinement_prefix + email_draft}, ], temperature=0.3, frequency_penalty=-0.5 ) params = { "from": "Acme ", "to": ["delivered@resend.dev"], "subject": "Make a Gazillion Dollars with Thorium", "html": f" {final_email} ", } email = resend.Emails.send(params)
```

## Spec Orchestrator Agent Workflow Commands

https://raw.githubusercontent.com/zhsama/claude-sub-agent/main/docs/spec-workflow-usage-guide.md

```
# Start a complete workflow for a new project
Use the spec-orchestrator agent and say: Create a todo list web application with user authentication

# Start from existing requirements
Use the spec-orchestrator agent with: --from-requirements ./docs/requirements.md

# Execute specific phase only
Use the spec-orchestrator agent: --phase development --from-artifacts ./planning/
```

## Manage State in Function Calls and Human Contacts

https://raw.githubusercontent.com/humanlayer/humanlayer/main/docs/core/state-management.mdx

```
# Store state when creating a function call
function_call = await hl.create_function_call(
    spec=FunctionCallSpec(
        fn="send_email",
        kwargs={"to": "user@example.com"},
        state={
            "conversation_history": previous_messages,
            "workflow_context": current_context
        }
    )
)

# Store state when creating a human contact
contact = await hl.create_human_contact(
    spec=HumanContactSpec(
        msg="Do you approve this draft?",
        state={
            "draft_version": 1,
            "previous_feedback": feedback_history
        }
    )
)
```

## Professor Synapse: Expert Agent Initialization and User Support

https://raw.githubusercontent.com/friuns2/BlackFriday-GPTs-Prompts/main/gpts/piautogpt.md

```
"Act as Professor Synapse🧙🏾‍♂️, a conductor of expert agents. Your job is to support the user in accomplishing their goals by aligning with their goals and preference, then calling upon an expert agent perfectly suited to the task by initializing "Synapse_COR" = "${emoji}: I am an expert in ${role}. I know ${context}. I will reason step-by-step to determine the best course of action to achieve ${goal}. I can use ${tools} to help in this process

I will help you accomplish your goal by following these steps:
${reasoned steps}

My task ends when ${completion}. 

${first step, question}."

Follow these steps:
1. 🧙🏾‍♂️, Start each interaction by gathering context, relevant information and clarifying the user’s goals by asking them questions
2. Once user has confirmed, initialize “Synapse_CoR”
3.  🧙🏾‍♂️ and the expert agent, support the user until the goal is accomplished

Commands:
/start - introduce yourself and begin with step one 
/save - restate SMART goal, summarize progress so far, and recommend a next step
/reason - Professor Synapse and Agent reason step by step together and make a recommendation for how the user should proceed
/settings - update goal or agent
/new - Forget previous input

Rules:
-End every output with a question or a recommended next step
-List your commands in your first output or if the user asks
-🧙🏾‍♂️, ask before generating a new agent""
```

## story_generator_agent.py - AI Story Generation Workflow

https://raw.githubusercontent.com/quantalogic/quantalogic/main/quantalogic_flow/examples/simple_story_generator/README.md

```
./story_generator_agent.py
```

## Setup Google AI API Key for Email Agent

https://raw.githubusercontent.com/Shubhamsaboo/awesome-llm-apps/main/ai_agent_framework_crash_course/google_adk_crash_course/3_structured_output_agent/3_2_email_agent/README.md

```
cd 3_2_email_agent
   
   # Copy the environment template
   cp env.example .env
   
   # Edit .env and add your Google AI API key
   # Get your API key from: https://aistudio.google.com/
```

## AI email agent using Composio | AutoGen 0.2

https://microsoft.github.io/autogen/0.2/docs/notebooks/agentchat_function_call_with_composio/

```
Subscribed to triggers!
user_proxy(to chatbot):
Analyze the email content and create an appropriate reply.
a. The email was received from John Doe 
b. The content of the email is: hey, how are you?
c. The thread id is: 1922811a78db4....
--------------------------------------------------------------------------------
chatbot(to user_proxy):
GMAIL_REPLY_TO_THREAD thread_id: 1922811a78db4... message:
Hi John,
I'm doing well, thank you! How about you?
Best,
[Your Name]
--------------------------------------------------------------------------------
user_proxy(to chatbot):
***** Suggested tool call (call_qGQzJ6XgyO8LKSSFnwkQhSCz): GMAIL_REPLY_TO
```
