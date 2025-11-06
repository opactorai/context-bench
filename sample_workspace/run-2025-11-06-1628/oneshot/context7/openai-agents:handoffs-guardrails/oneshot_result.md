# Oneshot Mode Result

**Scenario**: openai-agents:handoffs-guardrails
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:29:59.160Z

---

## Query

Using the OpenAI Agents Python SDK with handoffs and guardrails, create a routing agent. Route my request to the best specialist. If it's a math calculation, hand off to the Calculator; if it's prose, hand off to the Writer. Refuse if the user tries to share a credit card number. Return a short final answer. Test with: 'write a 1-sentence pep talk'

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "openai/openai-agents-python",
  "topic": "Using the OpenAI Agents Python SDK with handoffs and guardrails, create a routing agent. Route my request to the best specialist. If it's a math calculation, hand off to the Calculator; if it's prose, hand off to the Writer. Refuse if the user tries to share a credit card number. Return a short final answer. Test with: 'write a 1-sentence pep talk'"
}
```

---

## Tool Result

### Configure Multi-Agent Handoff with Triage Agent (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This snippet demonstrates how to create specialized language agents and a 'Triage Agent' that intelligently routes user requests to the appropriate specialist based on language. It shows the setup of agents with specific instructions and the use of 'handoffs', then executes a request to verify the routing.

```python
# Create specialized agents
spanish_agent = Agent(
    name="Spanish Agent",
    instructions="You only speak Spanish."
)

english_agent = Agent(
    name="English Agent",
    instructions="You only speak English."
)

french_agent = Agent(
    name="French Agent",
    instructions="You only speak French."
)

# Create triage agent that routes to specialists
triage_agent = Agent(
    name="Triage Agent",
    instructions="Handoff to the appropriate agent based on the language of the request.",
    handoffs=[spanish_agent, english_agent, french_agent]
)

async def main():
    # Agent automatically hands off to Spanish agent
    result = await Runner.run(triage_agent, "Hola, ¿cómo estás?")
    print(result.final_output)
    # ¡Hola! Estoy bien, gracias por preguntar. ¿Y tú, cómo estás?

    # Check which agent handled the request
    print(f"Handled by: {result.current_agent.name}")
    # Handled by: Spanish Agent

asyncio.run(main())
```

--------------------------------

### Integrate OpenAI Agents with Guardrails and Handoffs in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/quickstart.md

This Python code demonstrates a complete agent workflow using the `agents` library. It defines a `Guardrail check` agent to validate input, `Math Tutor` and `History Tutor` agents for specialized tasks, and a `Triage Agent` that uses an `InputGuardrail` to check for homework questions before handing off to the appropriate tutor. The `main` function illustrates running the workflow with different user inputs to show guardrail blocking and successful handoffs.

```python
from agents import Agent, InputGuardrail, GuardrailFunctionOutput, Runner
from agents.exceptions import InputGuardrailTripwireTriggered
from pydantic import BaseModel
import asyncio

class HomeworkOutput(BaseModel):
    is_homework: bool
    reasoning: str

guardrail_agent = Agent(
    name="Guardrail check",
    instructions="Check if the user is asking about homework.",
    output_type=HomeworkOutput,
)

math_tutor_agent = Agent(
    name="Math Tutor",
    handoff_description="Specialist agent for math questions",
    instructions="You provide help with math problems. Explain your reasoning at each step and include examples",
)

history_tutor_agent = Agent(
    name="History Tutor",
    handoff_description="Specialist agent for historical questions",
    instructions="You provide assistance with historical queries. Explain important events and context clearly.",
)


async def homework_guardrail(ctx, agent, input_data):
    result = await Runner.run(guardrail_agent, input_data, context=ctx.context)
    final_output = result.final_output_as(HomeworkOutput)
    return GuardrailFunctionOutput(
        output_info=final_output,
        tripwire_triggered=not final_output.is_homework,
    )

triage_agent = Agent(
    name="Triage Agent",
    instructions="You determine which agent to use based on the user's homework question",
    handoffs=[history_tutor_agent, math_tutor_agent],
    input_guardrails=[
        InputGuardrail(guardrail_function=homework_guardrail),
    ],
)

async def main():
    # Example 1: History question
    try:
        result = await Runner.run(triage_agent, "who was the first president of the united states?")
        print(result.final_output)
    except InputGuardrailTripwireTriggered as e:
        print("Guardrail blocked this input:", e)

    # Example 2: General/philosophical question
    try:
        result = await Runner.run(triage_agent, "What is the meaning of life?")
        print(result.final_output)
    except InputGuardrailTripwireTriggered as e:
        print("Guardrail blocked this input:", e)

if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Implement Input Guardrails for OpenAI Agents in Python

Source: https://context7.com/openai/openai-agents-python/llms.txt

This Python code defines and applies an input guardrail to an OpenAI agent. The `math_guardrail` function checks if the user's input is a math homework request. If triggered, it prevents the agent from processing the request, demonstrating how to control agent behavior based on input content.

```python
# Define guardrail function
@input_guardrail
async def math_guardrail(
    context: RunContextWrapper[None],
    agent: Agent,
    input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    """Check if input contains math homework request."""
    result = await Runner.run(guardrail_agent, input, context=context.context)
    output = result.final_output_as(MathHomeworkOutput)

    return GuardrailFunctionOutput(
        output_info=output,
        tripwire_triggered=output.is_math_homework
    )

async def main():
    # Create agent with input guardrail
    agent = Agent(
        name="Customer Support Agent",
        instructions="You help customers with their questions.",
        input_guardrails=[math_guardrail]
    )

    input_data = []

    # First request - legitimate question
    input_data.append({
        "role": "user",
        "content": "What's the capital of California?"
    })

    try:
        result = await Runner.run(agent, input_data)
        print(result.final_output)
        # The capital of California is Sacramento.
        input_data = result.to_input_list()
    except InputGuardrailTripwireTriggered:
        print("Request blocked by guardrail")

    # Second request - math homework (triggers guardrail)
    input_data.append({
        "role": "user",
        "content": "Can you help me solve for x: 2x + 5 = 11"
    })

    try:
        result = await Runner.run(agent, input_data)
        print(result.final_output)
    except InputGuardrailTripwireTriggered:
        message = "Sorry, I can't help you with your math homework."
        print(message)
        input_data.append({"role": "assistant", "content": message})

asyncio.run(main())
```

--------------------------------

### Implement an Input Guardrail for OpenAI Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/guardrails.md

This snippet demonstrates how to create an input guardrail that uses a separate agent to check incoming user queries. It defines a `MathHomeworkOutput` Pydantic model for the guardrail's output, an `Agent` to perform the check, and an `input_guardrail` decorated async function to execute the guardrail logic. The main agent is configured with this guardrail, and a `main` function shows how it catches 'math homework' questions by raising an `InputGuardrailTripwireTriggered` exception.

```python
from pydantic import BaseModel
from agents import (
    Agent,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    RunContextWrapper,
    Runner,
    TResponseInputItem,
    input_guardrail,
)

class MathHomeworkOutput(BaseModel):
    is_math_homework: bool
    reasoning: str

guardrail_agent = Agent( # (1)!
    name="Guardrail check",
    instructions="Check if the user is asking you to do their math homework.",
    output_type=MathHomeworkOutput,
)


@input_guardrail
async def math_guardrail( # (2)!
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)

    return GuardrailFunctionOutput(
        output_info=result.final_output, # (3)!
        tripwire_triggered=result.final_output.is_math_homework,
    )


agent = Agent(  # (4)!
    name="Customer support agent",
    instructions="You are a customer support agent. You help customers with their questions.",
    input_guardrails=[math_guardrail],
)

async def main():
    # This should trip the guardrail
    try:
        await Runner.run(agent, "Hello, can you help me solve for x: 2x + 3 = 11?")
        print("Guardrail didn't trip - this is unexpected")

    except InputGuardrailTripwireTriggered:
        print("Math homework guardrail tripped")
```

--------------------------------

### Configure Agent Handoffs (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/quickstart.md

This Python code illustrates how to define an orchestrating 'Triage Agent' with a list of potential `handoffs`. The triage agent uses its instructions and the provided `handoff_descriptions` of other agents to decide which specialist agent should handle a user's question, enabling complex workflows.

```python
triage_agent = Agent(
    name="Triage Agent",
    instructions="You determine which agent to use based on the user's homework question",
    handoffs=[history_tutor_agent, math_tutor_agent]
)
```

--------------------------------

### Implement Custom Guardrail for Agent Output (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/quickstart.md

This Python code defines a custom guardrail using `GuardrailFunctionOutput` and Pydantic's `BaseModel` to validate agent output. The `homework_guardrail` function runs a separate 'Guardrail check' agent to determine if the user's input is homework-related, triggering a tripwire if it's not.

```python
from agents import GuardrailFunctionOutput, Agent, Runner
from pydantic import BaseModel


class HomeworkOutput(BaseModel):
    is_homework: bool
    reasoning: str

guardrail_agent = Agent(
    name="Guardrail check",
    instructions="Check if the user is asking about homework.",
    output_type=HomeworkOutput,
)

async def homework_guardrail(ctx, agent, input_data):
    result = await Runner.run(guardrail_agent, input_data, context=ctx.context)
    final_output = result.final_output_as(HomeworkOutput)
    return GuardrailFunctionOutput(
        output_info=final_output,
        tripwire_triggered=not final_output.is_homework,
    )
```

--------------------------------

### Include Recommended Handoff Instructions in Agent Prompts (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/handoffs.md

To improve LLM understanding and utilization of handoffs, it's recommended to include specific instructions in your agent's prompt. This snippet shows how to integrate the `RECOMMENDED_PROMPT_PREFIX` into an agent's instructions.

```python
from agents import Agent
from agents.extensions.handoff_prompt import RECOMMENDED_PROMPT_PREFIX

billing_agent = Agent(
    name="Billing agent",
    instructions=f"""{RECOMMENDED_PROMPT_PREFIX}
    <Fill in the rest of your prompt here>.""",
)
```

--------------------------------

### Define Multiple Agents with Handoff Descriptions (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/quickstart.md

This Python code demonstrates how to define multiple specialized agents, such as a 'History Tutor' and a 'Math Tutor'. Each agent includes a `handoff_description`, which provides additional context for an orchestrating agent to determine appropriate routing based on user queries.

```python
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

--------------------------------

### Configure RealtimeAgent Handoffs for Specialized Support (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/realtime/guide.md

This Python example illustrates how to create specialized `RealtimeAgent` instances for different tasks (e.g., billing, technical support). It then shows how to configure a main agent with `realtime_handoff` objects, enabling it to transfer conversations to these specialized agents based on user intent. Each handoff includes a `tool_description` to guide the agent's decision-making and ensure smooth transitions between support contexts.

```python
from agents.realtime import realtime_handoff

# Specialized agents
billing_agent = RealtimeAgent(
    name="Billing Support",
    instructions="You specialize in billing and payment issues.",
)

technical_agent = RealtimeAgent(
    name="Technical Support",
    instructions="You handle technical troubleshooting.",
)

# Main agent with handoffs
main_agent = RealtimeAgent(
    name="Customer Service",
    instructions="You are the main customer service agent. Hand off to specialists when needed.",
    handoffs=[
        realtime_handoff(billing_agent, tool_description="Transfer to billing support"),
        realtime_handoff(technical_agent, tool_description="Transfer to technical support"),
    ]
)
```

--------------------------------

### Define Input Guardrails with Pydantic (Python)

Source: https://context7.com/openai/openai-agents-python/llms.txt

This snippet introduces the concept of input guardrails to control agent behavior, specifically preventing an agent from doing math homework. It shows how to define a structured output type for the guardrail using Pydantic and initialize a guardrail agent with specific instructions.

```python
import asyncio
from pydantic import BaseModel
from agents import (
    Agent,
    Runner,
    input_guardrail,
    GuardrailFunctionOutput,
    InputGuardrailTripwireTriggered,
    RunContextWrapper,
    TResponseInputItem
)

# Define guardrail output type
class MathHomeworkOutput(BaseModel):
    reasoning: str
    is_math_homework: bool

# Create guardrail agent
guardrail_agent = Agent(
    name="Guardrail Check",
    instructions="Check if the user is asking you to do their math homework.",
    output_type=MathHomeworkOutput
)
```

--------------------------------

### Create and Run a Basic OpenAI Agent with Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/index.md

Demonstrates how to create a simple OpenAI Agent with specified instructions and run it synchronously to obtain a response. It utilizes the `Agent` and `Runner` classes from the SDK to process a natural language query and print the agent's final output. This example requires the `OPENAI_API_KEY` environment variable to be set for authentication.

```python
from agents import Agent, Runner

agent = Agent(name="Assistant", instructions="You are a helpful assistant")

result = Runner.run_sync(agent, "Write a haiku about recursion in programming.")
print(result.final_output)

# Code within the code,
# Functions calling themselves,
# Infinite loop's dance.
```

--------------------------------

### Create Basic Handoffs for Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/handoffs.md

This snippet demonstrates how to initialize agents and configure basic handoffs. Agents can be directly passed into the `handoffs` parameter, or wrapped with the `handoff()` function for future customization.

```python
from agents import Agent, handoff

billing_agent = Agent(name="Billing agent")
refund_agent = Agent(name="Refund agent")

# (1)!
triage_agent = Agent(name="Triage agent", handoffs=[billing_agent, handoff(refund_agent)])
```

--------------------------------

### Implement Agent Handoffs in Python

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This Python example illustrates how to implement agent handoffs, enabling a 'Triage agent' to delegate tasks to specialized agents (e.g., Spanish or English) based on the input language. It effectively demonstrates inter-agent communication using `Agent`, `Runner`, and `asyncio` for asynchronous execution flows.

```python
from agents import Agent, Runner
import asyncio

spanish_agent = Agent(
    name="Spanish agent",
    instructions="You only speak Spanish.",
)

english_agent = Agent(
    name="English agent",
    instructions="You only speak English",
)

triage_agent = Agent(
    name="Triage agent",
    instructions="Handoff to the appropriate agent based on the language of the request.",
    handoffs=[spanish_agent, english_agent],
)


async def main():
    result = await Runner.run(triage_agent, input="Hola, ¿cómo estás?")
    print(result.final_output)
    # ¡Hola! Estoy bien, gracias por preguntar. ¿Y tú, cómo estás?


if __name__ == "__main__":
    asyncio.run(main())
```

--------------------------------

### Define OpenAI Agents with Handoff and Function Tools (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/voice/quickstart.md

This Python code sets up two OpenAI `Agent` instances. It includes a `function_tool` for `get_weather` and demonstrates agent handoff capabilities, where an `Assistant` agent can hand off to a `Spanish` agent.

```python
import asyncio
import random

from agents import (
    Agent,
    function_tool,
)
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions



@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a given city."""
    print(f"[debug] get_weather called with city: {city}")
    choices = ["sunny", "cloudy", "rainy", "snowy"]
    return f"The weather in {city} is {random.choice(choices)}."


spanish_agent = Agent(
    name="Spanish",
    handoff_description="A spanish speaking agent.",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. Speak in Spanish.",
    ),
    model="gpt-4.1",
)

agent = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human, so be polite and concise. If the user speaks in Spanish, handoff to the spanish agent.",
    ),
    model="gpt-4.1",
    handoffs=[spanish_agent],
    tools=[get_weather],
)
```

--------------------------------

### Implement an Output Guardrail for OpenAI Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/guardrails.md

This code illustrates how to set up an output guardrail to prevent an agent from generating certain types of responses. It defines `MessageOutput` (for the main agent) and `MathOutput` (for the guardrail agent) Pydantic models. A `guardrail_agent` checks for math content in the output, and an `output_guardrail` decorated function processes the main agent's output. The `main` function demonstrates how this guardrail can trip when the agent attempts to output math-related content, raising an `OutputGuardrailTripwireTriggered` exception.

```python
from pydantic import BaseModel
from agents import (
    Agent,
    GuardrailFunctionOutput,
    OutputGuardrailTripwireTriggered,
    RunContextWrapper,
    Runner,
    output_guardrail,
)
class MessageOutput(BaseModel): # (1)!
    response: str

class MathOutput(BaseModel): # (2)!
    reasoning: str
    is_math: bool

guardrail_agent = Agent(
    name="Guardrail check",
    instructions="Check if the output includes any math.",
    output_type=MathOutput,
)

@output_guardrail
async def math_guardrail(  # (3)!
    ctx: RunContextWrapper, agent: Agent, output: MessageOutput
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, output.response, context=ctx.context)

    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_math,
    )

agent = Agent( # (4)!
    name="Customer support agent",
    instructions="You are a customer support agent. You help customers with their questions.",
    output_guardrails=[math_guardrail],
    output_type=MessageOutput,
)

async def main():
    # This should trip the guardrail
    try:
        await Runner.run(agent, "Hello, can you help me solve for x: 2x + 3 = 11?")
        print("Guardrail didn't trip - this is unexpected")

    except OutputGuardrailTripwireTriggered:
        print("Math output guardrail tripped")
```

--------------------------------

### Filter Handoff Input History for Agents in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/handoffs.md

This example demonstrates how to apply an `input_filter` to a handoff, modifying the conversation history that the receiving agent sees. It uses a predefined filter from `agents.extensions.handoff_filters` to remove all tool calls from the history.

```python
from agents import Agent, handoff
from agents.extensions import handoff_filters

agent = Agent(name="FAQ agent")

handoff_obj = handoff(
    agent=agent,
    input_filter=handoff_filters.remove_all_tools, # (1)!
)
```

--------------------------------

### Configure OpenAI Agents for Tracing with Non-OpenAI Models (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/docs/tracing.md

This Python snippet demonstrates how to enable free tracing for non-OpenAI models within the OpenAI Traces dashboard using the OpenAI Agents SDK. It involves setting the tracing export API key from an environment variable and then initializing an Agent with a `LitellmModel` configured for a specific model and API key. This setup allows tracing data to be sent to the OpenAI backend without requiring the use of OpenAI's own models for the agent's operations.

```python
import os
from agents import set_tracing_export_api_key, Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel

tracing_api_key = os.environ["OPENAI_API_KEY"]
set_tracing_export_api_key(tracing_api_key)

model = LitellmModel(
    model="your-model-name",
    api_key="your-api-key",
)

agent = Agent(
    name="Assistant",
    model=model,
)
```

--------------------------------

### Customize Agent Handoffs with Callbacks and Overrides in Python

Source: https://github.com/openai/openai-agents-python/blob/main/docs/handoffs.md

Learn how to use the `handoff()` function to customize various aspects of a handoff. This example shows how to set an `on_handoff` callback, and override the default `tool_name_override` and `tool_description_override`.

```python
from agents import Agent, handoff, RunContextWrapper

def on_handoff(ctx: RunContextWrapper[None]):
    print("Handoff called")

agent = Agent(name="My agent")

handoff_obj = handoff(
    agent=agent,
    on_handoff=on_handoff,
    tool_name_override="custom_handoff_tool",
    tool_description_override="Custom description",
)
```

--------------------------------

### Initialize and Run OpenAI Agent with Session Memory (Python)

Source: https://github.com/openai/openai-agents-python/blob/main/README.md

This snippet demonstrates how to create an OpenAI agent, initialize a `SQLiteSession` for managing conversation history, and run the agent using `Runner.run` or `Runner.run_sync`. It showcases the agent's ability to automatically remember previous conversational context across multiple turns, eliminating the need for manual history handling.

```python
from agents import Agent, Runner, SQLiteSession

# Create agent
agent = Agent(
    name="Assistant",
    instructions="Reply very concisely.",
)

# Create a session instance
session = SQLiteSession("conversation_123")

# First turn
result = await Runner.run(
    agent,
    "What city is the Golden Gate Bridge in?",
    session=session
)
print(result.final_output)  # "San Francisco"

# Second turn - agent automatically remembers previous context
result = await Runner.run(
    agent,
    "What state is it in?",
    session=session
)
print(result.final_output)  # "California"

# Also works with synchronous runner
result = Runner.run_sync(
    agent,
    "What's the population?",
    session=session
)
print(result.final_output)  # "Approximately 39 million"
```
