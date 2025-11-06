# Oneshot Mode Result

**Scenario**: openai-agents:handoffs-guardrails
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:56:56.856Z

---

## Query

Using the OpenAI Agents Python SDK with handoffs and guardrails, create a routing agent. Route my request to the best specialist. If it's a math calculation, hand off to the Calculator; if it's prose, hand off to the Writer. Refuse if the user tries to share a credit card number. Return a short final answer. Test with: 'write a 1-sentence pep talk'

---

## Tool Input

```json
{
  "query": "Using the OpenAI Agents Python SDK with handoffs and guardrails, create a routing agent. Route my request to the best specialist. If it's a math calculation, hand off to the Calculator; if it's prose, hand off to the Writer. Refuse if the user tries to share a credit card number. Return a short final answer. Test with: 'write a 1-sentence pep talk'"
}
```

---

## Tool Result

## Handoffs - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/ref/handoffs/

```
def handoff(
agent:Agent[TContext ],
tool_name_override:str|None=None,
tool_description_override:str|None=None,
on_handoff:OnHandoffWithInput[THandoffInput]|OnHandoffWithoutInput|None=None,
input_type:type[THandoffInput]|None=None,
input_filter:Callable [[ HandoffInputData ], HandoffInputData]|None=None,
is_enabled:bool
|Callable [[ RunContextWrapper[Any ], Agent[TContext ]], MaybeAwaitable[bool ]]=True,
)-> Handoff[TContext,Agent[TContext ]]:
"""Create a handoff from an agent.
Args:
agent: The agent to handoff to, or a function that returns an agent.
tool_name_override: Optional override for the name of the tool that represents the handoff.
tool_description_override: Optional override for the description of the tool that
represents the handoff.
on_handoff: A function that runs when the handoff is invoked.
input_type: the type of the input to the handoff. If provided, the input will be validated
against this type. Only relevant if you pass a function that takes an input.
input_filter: a function that filters the inputs that are passed to the next agent.
is_enabled: Whether the handoff is enabled. Can be a bool or a callable that takes the run
context and agent and returns whether the handoff is enabled. Disabled handoffs are
hidden from the LLM at runtime.
"""
assert(on_handoff and input_type)or not(on_handoff and input_type ),(
"You must provide either both on_handoff and input_type, or neither"
)
type_adapter:TypeAdapter[Any]|None
if input_type is not None:
assert callable(on_handoff ), "on_handoff must be callable"
sig=inspect.signature(on_handoff)
if len(sig.parameters)!= 2:
raise UserError("on_handoff must take two arguments: context and input")
type_adapter=TypeAdapter(input_type)
input_json_schema=type_adapter.json_schema ()
else:
type_adapter=None
input_json_schema={}
if on_handoff is not None:
sig=inspect.signature(on_handoff)
if len(sig.parameters)!= 1:
raise UserError("on_handoff must take one argument: context")
async def _invoke_handoff(
ctx:RunContextWrapper[Any ], input_json:str|None=None
)-> Agent[TContext ]:
if input_type is not None and type_adapter is not None:
if input_json is None:
_error_tracing.attach_error_to_current_span(
SpanError(
message="Handoff function expected non-null input, but got None",
data={"details":"input_json is None" },
)
)
raise ModelBehaviorError("Handoff function expected non-null input, but got None")
validated_input=_json.validate_json(
json_str=input_json,
type_adapter=type_adapter,
partial=False,
)
input_func=cast(OnHandoffWithInput[THandoffInput ], on_handoff)
if inspect.iscoroutinefunction(input_func ):
await input_func(ctx,validated_input)
else:
input_func(ctx,validated_input)
elif on_handoff is not None:
no_input_func=cast(OnHandoffWithoutInput,on_handoff)
if inspect.iscoroutinefunction(no_input_func ):
await no_input_func(ctx)
else:
no_input_func(ctx)
return agent
tool_name=tool_name_override or Handoff.default_tool_name(agent)
tool_description=tool_description_override or Handoff.default_tool_description(agent)
# Always ensure the input JSON schema is in strict mode
# If there is a need, we can make this configurable in the future
input_json_schema=ensure_strict_json_schema(input_json_schema)
async def _is_enabled(ctx:RunContextWrapper[Any ], agent_base:AgentBase[Any ]) -> bool:
from .agent import Agent
assert callable(is_enabled ), "is_enabled must be callable here"
assert isinstance(agent_base,Agent ), "Can't handoff to a non-Agent"
result=is_enabled(ctx,agent_base)
if inspect.isawaitable(result ):
return await result
return result
return Handoff(
tool_name=tool_name,
tool_description=tool_description,
input_json_schema=input_json_schema,
on_invoke_handoff=_invoke_handoff,
input_filter=input_filter,
agent_name=agent.name,
is_enabled=_is_enabled if callable(is_enabled)else is_enabled,
)
```

## Creates Triage Agent with Handoffs to Billing and Refund Agents

https://raw.githubusercontent.com/disler/claude-code-is-programmable/main/ai_docs/fc_openai_agents.md

```
from agents import Agent, handoff

billing_agent = Agent(name="Billing agent")
refund_agent = Agent(name="Refund agent")

triage_agent = Agent(name="Triage agent", handoffs=[billing_agent, handoff(refund_agent)])
```

## Quickstart - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/quickstart/

```
from agents import Agent,InputGuardrail,GuardrailFunctionOutput,Runner
from agents.exceptions import InputGuardrailTripwireTriggered
from pydantic import BaseModel
import asyncio
class HomeworkOutput(BaseModel ):
is_homework:bool
reasoning:str
guardrail_agent=Agent(
name="Guardrail check",
instructions="Check if the user is asking about homework.",
output_type=HomeworkOutput,
)
math_tutor_agent=Agent(
name="Math Tutor",
handoff_description="Specialist agent for math questions",
instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
)
history_tutor_agent=Agent(
name="History Tutor",
handoff_description="Specialist agent for historical questions",
instructions="You provide assistance with historical queries. Explain important events and context clearly.",
)
async def homework_guardrail(ctx,agent,input_data ):
result=await Runner.run(guardrail_agent,input_data,context=ctx.context)
final_output=result.final_output_as(HomeworkOutput)
return GuardrailFunctionOutput(
output_info=final_output,
tripwire_triggered=not final_output.is_homework,
)
triage_agent=Agent(
name="Triage Agent",
instructions="You determine which agent to use based on the user's homework question",
handoffs=[history_tutor_agent,math_tutor_agent ],
input_guardrails=[
InputGuardrail(guardrail_function=homework_guardrail ),
],
)
async def main ():
# Example 1: History question
try:
result=await Runner.run(triage_agent,"who was the first president of the united states?")
print(result.final_output)
except InputGuardrailTripwireTriggered as e:
print("Guardrail blocked this input:",e)
# Example 2: General/philosophical question
try:
result=await Runner.run(triage_agent,"What is the meaning of life?")
print(result.final_output)
except InputGuardrailTripwireTriggered as e:
print("Guardrail blocked this input:",e)
if __name__ == "__main__":
asyncio.run(main ())
```

## Handoffs - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/handoffs/

```
from agents import Agent
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX
billing_agent=Agent(
name="Billing agent",
instructions=f """{RECOMMENDED_PROMPT_PREFIX}
.""",
)
```

## MainAgent.Run with sub_agent.MathAgent for arithmetic operations

https://raw.githubusercontent.com/Ingenimax/agent-sdk-go/main/examples/subagents/TRACING_ENHANCEMENTS.md

```
MainAgent.Run
├── sub_agent.MathAgent (span)
│   ├── input: "sum 1 + 333"
│   ├── duration: 2.1s
│   ├── response: "334"
│   └── success: true
└── response returned to user
```

## Defines History and Math Tutor Agents for Educational Queries

https://raw.githubusercontent.com/disler/single-file-agents/main/ai_docs/fc_openai_agents.md

```
from agents import Agent

history_tutor_agent = Agent(
    name="History Tutor",
    handoff_description="Specialist agent for historical questions",
    instructions="You provide assistance with historical queries. Explain important events and context clearly.",
)

math_tutor_agent = Agent(
    name="Math Tutor",
    handoff_description="Specialist agent for math questions",
    instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
)
```

## Async Joke Generator with Tracing in CAI SDK

https://raw.githubusercontent.com/aliasrobotics/cai/main/docs/tracing.md

```
from cai.sdk.agents import Agent, Runner, trace

async def main():
    agent = Agent(name="Joke generator", instructions="Tell funny jokes.")

    with trace("Joke workflow"): # (1)!
        first_result = await Runner.run(agent, "Tell me a joke")
        second_result = await Runner.run(agent, f"Rate this joke: {first_result.final_output}")
        print(f"Joke: {first_result.final_output}")
        print(f"Rating: {second_result.final_output}")
```

## Mastering Handoff Agents in the OpenAI Agents SDK

https://medium.com/@abdulkabirlive1/mastering-handoff-agents-in-the-openai-agents-sdk-complete-guide-6103bd85217a

```
tool_name_overridehandoff expected input
```

## Role Selection in Role Play Game for AI Agents

https://raw.githubusercontent.com/ag2ai/ag2/main/website/docs/_blogs/2023-12-29-AgentDescriptions/index.mdx

```
You are in a role play game. The following roles are available:

assistant: A helpful and general-purpose AI assistant that has strong language skills, Python skills, and Linux command line skills.
user_proxy: A user that can run Python code or input command line commands at a Linux terminal and report back the execution results.
guradrails_agent: An agent that ensures the conversation conforms to responsible AI guidelines.

Read the following conversation.
Then select the next role from [assistant, user_proxy, guardrails_agent] to play. Only return the role.
```

## Fun with Agents - Simple example of an Agent Hand-off - API

https://community.openai.com/t/fun-with-agents-simple-example-of-an-agent-hand-off/1142697

```
### Approach
When crafting a ballad about the plight of homelessness in the city during winter, I want to create a narrative that evokes empathy and highlights the stark contrast between the warmth of home and the coldness of the streets. Ballads often tell a story and have a rhythmic, musical quality, so I’ll focus on a structure with quatrains and a rhyme scheme (ABCB).
I’ll employ imagery that captures the harshness of winter and the vulnerability of those without shelter. Dark themes will be conveyed through the setting, symbolic elements like cold wind and bare branches, and the emotional tone of despair and resilience.
### The Poem
**In Winter's Grasp**
Upon the city's shadowed streets, 
Where bitter winds do moan, 
The nameless tread with weary feet, 
Their hearts as cold as stone.
Beneath the sky's indifferent eye, 
The snow descends like tears, 
It blankets all, as dreams belie, 
The haunting chill of fears.
Each corner holds a silent tale, 
Of lives left out to freeze, 
In cardboard beds where hopes grow frail, 
Midst whispers of the trees.
The moon casts down its silver light, 
On souls that darkness keeps, 
A fleeting warmth in endless night, 
Where only silence weeps.
Yet still they walk, these shadows thin, 
Through alleyways of steel, 
In search of warmth, a light within, 
A hearth that some might feel.
With every breath, a cloud appears, 
And fades into the air, 
A fleeting moment, like their years, 
Condemned to harsh despair.
So heed, dear traveler in haste, 
These stories etched in frost, 
For even in the deepest waste, 
No soul should e'er be lost.
 Hello, I’m Ron the Rhyme Master! I'll dive into your draft of “In Winter’s Grasp” with absolute precision and candid insight. 
Your choice of quatrains and the ABCB rhyme scheme is classic, fitting the ballad form nicely. The poem evokes the stark contrast between warmth and cold effectively, using vivid imagery and strong symbolic elements. Let’s break it down:
**Structure & Form:**
- You maintain quatrains throughout, and the ABCB rhyme scheme holds consistently. This aids the rhythmic, musical quality essential in ballads.
 
**Imagery & Themes:**
- The imagery is potent; "bitter winds," "cardboard beds," and "silver light" are evocative, underscoring the harshness of winter and vulnerability.
- Themes of despair and resilience are prevalent. Phrases like "hearts as cold as stone" and "a fleeting warmth in endless night" highlight this poignantly.
**Symbolism:**
- Elements like "snow descending like tears" and "the moon casting its silver light" serve well to symbolize indifference and fleeting warmth, respectively.
 
**Emotional Tone:**
- The tone balances between despair ("souls that darkness keeps") and a flicker of resilience or yearning ("in search of warmth").
**Suggestions:**
- Consider enhancing the narrative arc. A clearer storyline or character might strengthen the emotional pull and reader connection.
- You could also play with meter to ensure a consistent rhythm, enhancing the musicality of the ballad.
The poem is impactful but could delve more into individual stories or moments to deepen the narrative. Keep refining with your sharp imagery and keen sense of emotion. You're crafting something both haunting and beautiful. Keep at it!
```

## Generate Content with Agent Streaming in Workflow

https://raw.githubusercontent.com/VoltAgent/voltagent/main/website/docs/workflows/streaming.md

```
.andThen({
  id: "generate-content",
  execute: async ({ data, writer }) => {
    const agent = new Agent({ /* ... */ });
    const response = await agent.streamText(prompt);

    if (response.fullStream) {
      await writer.pipeFrom(response.fullStream, {
        prefix: "agent-",      // Prefix for event types
        agentId: agent.id,     // Override 'from' field
        filter: (part) => {    // Filter events
          return part.type !== "finish";
        }
      });
    }

    const text = await response.text;
    return { ...data, generated: text };
  }
})
```

## Creates Math Tutor Agent with Detailed Instructions

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/quickstart.md

```
from agents import Agent

agent = Agent(
    name="Math Tutor",
    instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
)
```

## python Result 1

https://raw.githubusercontent.com/tsinghua-fib-lab/AgentSociety/main/packages/agentsociety-benchmark/agentsociety_benchmark/benchmarks/BehaviorModeling/README.md

```
# For review writing tasks (target == "review_writing")
if target == "review_writing":
    return {
        "stars": int,        # Rating from 1-5, must be integer
        "review": str        # Review text, string format
    }

# For recommendation tasks (target == "recommendation")
elif target == "recommendation":
    return {
        "item_list": list    # Ranked list of item IDs, must be from candidate_list
    }
```

## Start Handoffs Agent with pnpm Command

https://raw.githubusercontent.com/openai/openai-agents-js/main/examples/docs/README.md

```
pnpm -F docs start:agents-handoffs
```

## GreetingAgent to SummaryAgent Transition Flow

https://raw.githubusercontent.com/livekit-examples/python-agents-examples/main/flows/README.md

```
GreetingAgent → AskColorAgent → SummaryAgent
```

## Invoice Agent Specialization for Query Handling

https://raw.githubusercontent.com/microsoft/semantic-kernel/main/dotnet/samples/Demos/A2AClientServer/README.md

```
You specialize in handling queries related to invoices.
```

## Agents - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/agents/

```
from agents import Agent,Runner,function_tool,FunctionToolResult,RunContextWrapper
from agents.agent import ToolsToFinalOutputResult
from typing import List,Any
@function_tool
def get_weather(city:str)-> str:
"""Returns weather info for the specified city."""
return f "The weather in{city}is sunny"
def custom_tool_handler(
context:RunContextWrapper[Any ],
tool_results:List[FunctionToolResult]
)-> ToolsToFinalOutputResult:
"""Processes tool results to decide final output."""
for result in tool_results:
if result.output and "sunny" in result.output:
return ToolsToFinalOutputResult(
is_final_output=True,
final_output=f "Final weather:{result.output}"
)
return ToolsToFinalOutputResult(
is_final_output=False,
final_output=None
)
agent=Agent(
name="Weather Agent",
instructions="Retrieve weather details.",
tools=[get_weather ],
tool_use_behavior=custom_tool_handler
)
```

## ModelRouter Class for Optimal AI Model Selection

https://raw.githubusercontent.com/crmne/ruby_llm/main/docs/_advanced/agentic-workflows.md

```
class ModelRouter < RubyLLM::Tool
  description "Routes requests to the optimal model"
  param :query, desc: "The user's request"

  def execute(query:)
    task_type = classify_task(query)

    case task_type
    when :code
      RubyLLM.chat(model: 'claude-3-5-sonnet').ask(query).content
    when :creative
      RubyLLM.chat(model: 'gpt-4o').ask(query).content
    when :factual
      RubyLLM.chat(model: 'gemini-1.5-pro').ask(query).content
    else
      RubyLLM.chat.ask(query).content
    end
  end

  private

  def classify_task(query)
    classifier = RubyLLM.chat(model: 'gpt-4o-mini')
                     .with_instructions("Classify: code, creative, or factual. One word only.")
    classifier.ask(query).content.downcase.to_sym
  end
end

# Usage
chat = RubyLLM.chat.with_tool(ModelRouter)
response = chat.ask "Write a Ruby function to parse JSON"
```

## Override Output Processors in Agent's Generate and Stream Methods

https://raw.githubusercontent.com/mastra-ai/mastra/main/docs/src/content/en/docs/agents/output-processors.mdx

```
// Override output processors for this specific call
const result = await agent.generate('Hello', {
  outputProcessors: [
    new ModerationProcessor({ model: openai("gpt-4.1-nano") }),
  ],
});

// Same for streaming
const stream = await agent.streamVNext('Hello', {
  outputProcessors: [
    new TokenLimiterProcessor({ maxTokens: 500 }),
  ],
});
```

## Create Math Tutor Agent with Step-by-Step Instructions

https://raw.githubusercontent.com/DannyMac180/meta-agent/main/docs/openai_agents_sdk_docs.md

```
from agents import Agent

math_tutor = Agent(
    name="Math Tutor",
    instructions="Help with math problems. Show your reasoning step‑by‑step."
)
```

## Guardrails - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/guardrails/

```
from pydantic import BaseModel
from agents import(
Agent,
GuardrailFunctionOutput,
OutputGuardrailTripwireTriggered,
RunContextWrapper,
Runner,
output_guardrail,
)
class MessageOutput(BaseModel ): # (1)!
response:str
class MathOutput(BaseModel ): # (2)!
reasoning:str
is_math:bool
guardrail_agent=Agent(
name="Guardrail check",
instructions="Check if the output includes any math.",
output_type=MathOutput,
)
@output_guardrail
async def math_guardrail(# (3)!
ctx:RunContextWrapper,agent:Agent,output:MessageOutput
)-> GuardrailFunctionOutput:
result=await Runner.run(guardrail_agent,output.response,context=ctx.context)
return GuardrailFunctionOutput(
output_info=result.final_output,
tripwire_triggered=result.final_output.is_math,
)
agent=Agent(# (4)!
name="Customer support agent",
instructions="You are a customer support agent. You help customers with their questions.",
output_guardrails=[math_guardrail ],
output_type=MessageOutput,
)
async def main ():
# This should trip the guardrail
try:
await Runner.run(agent,"Hello, can you help me solve for x: 2x + 3 = 11?")
print("Guardrail didn't trip - this is unexpected")
except OutputGuardrailTripwireTriggered:
print("Math output guardrail tripped")
```

## Create Math Tutor Agent with OpenAI SDK

https://raw.githubusercontent.com/aliasrobotics/cai/main/docs/quickstart.md

```
from cai.sdk.agents import Agent

agent = Agent(
    name="Math Tutor",
    instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
)
```

## Orchestrating Agents: Routines and Handoffs | OpenAI Cookbook

https://cookbook.openai.com/examples/orchestrating_agents

```
agent = triage_agent
messages = []

whileTrue:
 user =input("User: ")
 messages.append({"role": "user", "content": user})

 response = run_full_turn(agent, messages)
 agent = response.agent
 messages.extend(response.messages)
```
