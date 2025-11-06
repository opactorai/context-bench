# Oneshot Mode Result

**Scenario**: openai-agents:streaming-tools
**Package**: openai-agents
**Registry**: py_pi
**Context7 ID**: openai/openai-agents-python
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:56:23.241Z

---

## Query

Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user.

---

## Tool Input

```json
{
  "query": "Using the OpenAI Agents Python SDK with streaming and tool calling, build an agent that plans the next hour. First, tell me the current time in America/Los_Angeles and then compute 137 * 42. Stream partial text and show when tools are called so I can display progress to the user."
}
```

---

## Tool Result

## Streaming - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/streaming/

```
import asyncio
import random
from agents import Agent,ItemHelpers,Runner,function_tool
@function_tool
def how_many_jokes () -> int:
return random.randint(1,10)
async def main ():
agent=Agent(
name="Joker",
instructions="First call the `how_many_jokes` tool, then tell that many jokes.",
tools=[how_many_jokes ],
)
result=Runner.run_streamed(
agent,
input="Hello",
)
print("=== Run starting ===")
async for event in result.stream_events ():
# We'll ignore the raw responses event deltas
if event.type == "raw_response_event":
continue
# When the agent updates, print that
elif event.type == "agent_updated_stream_event":
print(f "Agent updated:{event.new_agent.name}")
continue
# When items are generated, print them
elif event.type == "run_item_stream_event":
if event.item.type == "tool_call_item":
print("-- Tool was called")
elif event.item.type == "tool_call_output_item":
print(f "-- Tool output:{event.item.output}")
elif event.item.type == "message_output_item":
print(f "-- Message output: \n{ItemHelpers.text_message_output(event.item)}")
else:
pass # Ignore other event types
print("=== Run complete ===")
if __name__ == "__main__":
asyncio.run(main ())
```

## Agent Class Implementation with Streaming Events and Tool Calls

https://raw.githubusercontent.com/openai/openai-agents-python/main/docs/ja/streaming.md

```
import asyncio
import random
from agents import Agent, ItemHelpers, Runner, function_tool

@function_tool
def how_many_jokes() -> int:
    return random.randint(1, 10)


async def main():
    agent = Agent(
        name="Joker",
        instructions="First call the `how_many_jokes` tool, then tell that many jokes.",
        tools=[how_many_jokes],
    )

    result = Runner.run_streamed(
        agent,
        input="Hello",
    )
    print("=== Run starting ===")

    async for event in result.stream_events():
        # We'll ignore the raw responses event deltas
        if event.type == "raw_response_event":
            continue
        # When the agent updates, print that
        elif event.type == "agent_updated_stream_event":
            print(f"Agent updated: {event.new_agent.name}")
            continue
        # When items are generated, print them
        elif event.type == "run_item_stream_event":
            if event.item.type == "tool_call_item":
                print("-- Tool was called")
            elif event.item.type == "tool_call_output_item":
                print(f"-- Tool output: {event.item.output}")
            elif event.item.type == "message_output_item":
                print(f"-- Message output:\n {ItemHelpers.text_message_output(event.item)}")
            else:
                pass  # Ignore other event types

    print("=== Run complete ===")


if __name__ == "__main__":
    asyncio.run(main())
```

## Stream Agent Responses Using LangChain's API

https://raw.githubusercontent.com/mcp-use/mcp-use/main/docs/getting-started/quickstart.mdx

```
async for chunk in agent.astream("your query here"):
    print(chunk, end="", flush=True)
```

## Calculator Function and Streaming Agent Implementation

https://raw.githubusercontent.com/SylphAI-Inc/AdalFlow/main/docs/source/new_tutorials/streaming.md

```
# Define a simple tool
def calculator(expression: str) -> str:
    """Evaluate a mathematical expression."""
    try:
        result = eval(expression)
        return f"Result: {result}"
    except Exception as e:
        return f"Error: {e}"

# Create agent and runner
agent = Agent(
    name="StreamingAgent",
    tools=[FunctionTool(calculator)],
    model_client=OpenAIClient(),
    model_kwargs={"model": "gpt-4o", "temperature": 0.3},
    max_steps=5
)

runner = Runner(agent=agent)

async def handle_raw_responses():
    streaming_result = runner.astream(
        prompt_kwargs={"input_str": "Calculate 25 * 4 and explain the result"},
        model_kwargs={"stream": True}
    )

    async for event in streaming_result.stream_events():
        if isinstance(event, RawResponsesStreamEvent):
            # Process raw model output
            if hasattr(event.data, 'choices') and event.data.choices:
                delta = event.data.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    print(delta.content, end='', flush=True)

asyncio.run(handle_raw_responses())
```

## Mastering Streaming Events in OpenAI Agents SDK

https://medium.com/@abdulkabirlive1/streaming-events-in-openai-agents-sdk-complete-expert-guide-b79c1ccd9714

```
async for event in result.stream_events()
```

## StreamedRunResult Handling in Agent Runner

https://raw.githubusercontent.com/openai/openai-agents-js/main/docs/src/content/docs/ja/guides/running-agents.md

```
const streamed = await runner.run(agent, 'Tell me a joke', { stream: true });

for await (const event of streamed) {
  // Inspect tool calls, model deltas, …
}

// Or just pipe the text
streamed.toTextStream({ compatibleWithNodeStreams: true }).pipe(process.stdout);
```

## Stream Text and Convert to DataStream in Vercel AI Package

https://raw.githubusercontent.com/VoltAgent/voltagent/main/packages/vercel-ui/CHANGELOG.md

```
const result = await agent.streamText("Hello, world!");
  const dataStream = toDataStream(result.fullStream);
```

## Help for function calls with streaming - API

https://community.openai.com/t/help-for-function-calls-with-streaming/627170

```
$
./streaming_chat_with_funcs.mjs
user>
what is 1234567*7654321/45678
bot>
The result of \( \frac{1234567 \ times 7654321}{45678} \) is approximately **206,877,974**.
...
```

## Agent Class and Loop for LLM Interaction

https://raw.githubusercontent.com/ai-that-works/ai-that-works/main/2025-05-17-workshop-sf-twelve-factor-agents/pre-requisites/01-cli-and-agent/README.md

```
// ./walkthrough/01-agent.ts
import { b } from "../baml_client";

// tool call or a respond to human tool
type AgentResponse = Awaited<ReturnType<typeof b.DetermineNextStep>>;

export interface Event {
    type: string
    data: any;
}

export class Thread {
    events: Event[] = [];

    constructor(events: Event[]) {
        this.events = events;
    }

    serializeForLLM() {
        // can change this to whatever custom serialization you want to do, XML, etc
        // e.g. https://github.com/got-agents/agents/blob/59ebbfa236fc376618f16ee08eb0f3bf7b698892/linear-assistant-ts/src/agent.ts#L66-L105
        return JSON.stringify(this.events);
    }
}

// right now this just runs one turn with the LLM, but
// we'll update this function to handle all the agent logic
export async function agentLoop(thread: Thread): Promise<AgentResponse> {
    const nextStep = await b.DetermineNextStep(thread.serializeForLLM());
    return nextStep;
}
```

## unknown Result 1

https://raw.githubusercontent.com/liteli1987gmail/langchainzh/main/pages/modules/agents/how_to/streaming.md

```
开始代理: Agent with input: {'input': 'where is the cat hiding? what items are in that location?'}
    --
    开始工具: where_cat_is_hiding with inputs: {}
    完成工具: where_cat_is_hiding
    工具输出为: on the shelf
    --
    --
    开始工具: get_items with inputs: {'place': 'shelf'}
    完成工具: get_items
    工具输出为: books, pencils and pictures
    The| cat| is| currently| hiding| on| the| shelf|.| In| that| location|,| you| can| find| books|,| pencils|,| and| pictures|.|
    --
    完成代理: Agent with output: The cat is currently hiding on the shelf. In that location, you can find books, pencils, and pictures.
```

## Invoke runToolAgent for Weather Query in TypeScript

https://raw.githubusercontent.com/mlflow/mlflow/main/docs/docs/genai/tracing/quickstart/typescript-openai.mdx

```
// If you are running this tutorial as a script, remove the `await` keyword.
await runToolAgent("What's the weather like in Seattle?")
```

## Stream Chat with Agent for Financial Reports

https://raw.githubusercontent.com/vectara/py-vectara-agentic/main/docs/usage.md

```
agent = Agent(tools=[ask_finance], topic="financial reports")

# User sees response as it's generated
stream_response = agent.stream_chat("What was Apple's revenue growth in 2022?")
async for chunk in stream_response.async_response_gen():
    print(chunk, end="", flush=True)
```

## OpenAI Chat Completion in ReAct Agent Loop

https://raw.githubusercontent.com/promptfoo/promptfoo/main/site/blog/mcp-proxy-announcement.md

```
// in the ReAct Agent loop - https://github.com/promptfoo/mcp-agent-provider/blob/main/src/react-agent.js#L104

const completion = await this.openai.chat.completions.create({
  model: 'gpt-4.1',
  messages: messages,
  tools: tools.length > 0 ? tools : undefined,
  tool_choice: tools.length > 0 ? 'auto' : undefined,
  temperature: 0.7,
  max_tokens: 2000,
});

const message = completion.choices[0].message;
messages.push(message);

if (message.tool_calls && message.tool_calls.length > 0) {
  for (const toolCall of message.tool_calls) {
    toolCalls.push(toolCall);
    // highlight-next-line
    const result = await this.executeTool(toolCall);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: result,
    });
  }
}
```

## Agentica Event Handling with OpenAI Integration

https://raw.githubusercontent.com/wrtnlabs/agentica/main/website/content/docs/core/event.mdx

```
import { Agentica, AgenticaEvent } from "@agentica/core";
import OpenAI from "openai";

const agent = new Agentica({
  model: "chatgpt",
  vendor: {
    api: new OpenAI({ apiKey: "********" }),
    model: "gpt-4o-mini",
  },
  controllers: [...],
});
agent.on("describe", async (event) => {
  console.log("Describe Function Calling");
  for (const execute of event.executes)
    console.log(`  - ${execute.operation.name}`);
  for await (const text of event.stream)
    process.stdout.write(text);
  process.stdout.write("\n");
});
await agent.conversate("I wanna buy Surface Pro");
```

## Integrates OpenWeatherMap with FunctionAgent for Weather Queries

https://raw.githubusercontent.com/run-llama/llama_index/main/llama-index-integrations/tools/llama-index-tools-weather/README.md

```
from llama_index.tools.weather import OpenWeatherMapToolSpec
from llama_index.core.agent.workflow import FunctionAgent
from llama_index.llms.openai import OpenAI

tool_spec = OpenWeatherMapToolSpec(key="...")

agent = FunctionAgent(
    tools=tool_spec.to_tool_list(),
    llm=OpenAI(model="gpt-4.1"),
)

print(await agent.run("What is the temperature like in Paris?"))
print(await agent.run("What is the wind like in Budapest tomorrow?"))
```

## Async Event Processing with Strands Agent and Calculator Tool

https://raw.githubusercontent.com/strands-agents/mcp-server/main/src/strands_mcp_server/content/quickstart.md

```
import asyncio
from strands import Agent
from strands_tools import calculator

# Initialize our agent without a callback handler
agent = Agent(
    tools=[calculator],
    callback_handler=None  # Disable default callback handler
)

# Async function that iterates over streamed agent events
async def process_streaming_response():
    query = "What is 25 * 48 and explain the calculation"

    # Get an async iterator for the agent's response stream
    agent_stream = agent.stream_async(query)

    # Process events as they arrive
    async for event in agent_stream:
        if "data" in event:
            # Print text chunks as they're generated
            print(event["data"], end="", flush=True)
        elif "current_tool_use" in event and event["current_tool_use"].get("name"):
            # Print tool usage information
            print(f"\n[Tool use delta for: {event['current_tool_use']['name']}]")

# Run the agent with the async event processing
asyncio.run(process_streaming_response())
```

## Connects MCPClient and Creates Weather Agent

https://raw.githubusercontent.com/dapr/dapr-agents/main/quickstarts/07-agent-mcp-client-stdio/README.md

```
client = MCPClient()

# Connect to MCP server using STDIO transport
await client.connect_stdio(
    server_name="local",
    command=sys.executable,  # Use the current Python interpreter
    args=["tools.py"]  # Run tools.py directly
)

# Get available tools from the MCP instance
tools = client.get_all_tools()

# Create the Weather Agent using MCP tools
weather_agent = Agent(
    name="Stevie",
    role="Weather Assistant",
    goal="Help humans get weather and location info using MCP tools.",
    instructions=["Instrictions go here"],
    tools=tools,
) 

# Run a sample query
result: AssistantMessage = await weather_agent.run("What is the weather in New York?")
print(result.content)
```

## Real-time Tool Call Tracking with AgentStatusType

https://raw.githubusercontent.com/vectara/py-vectara-agentic/main/README.md

```
from vectara_agentic import AgentStatusType

def tool_tracker(status_type, msg, event_id):
    if status_type == AgentStatusType.TOOL_CALL:
        print(f"🔧 Using {msg['tool_name']} with {msg['arguments']}")
    elif status_type == AgentStatusType.TOOL_OUTPUT:
        print(f"📊 {msg['tool_name']} completed")

agent = Agent(
    tools=[your_tools],
    agent_progress_callback=tool_tracker
)

# With streaming - see tool calls as they happen, plus streaming response
stream_response = await agent.astream_chat("Analyze Apple's finances")
async for chunk in stream_response.async_response_gen():
    print(chunk, end="", flush=True)

# With regular chat - see tool calls as they happen, then get final response
response = await agent.achat("Analyze Apple's finances") 
print(response.response)
```

## Initialize ToolCallingAgent with OpenAI and Weather Tools

https://raw.githubusercontent.com/Arize-ai/phoenix/main/docs/section-integrations/frameworks/beeai/beeai-tracing-js.md

```
import "./instrumentation.js";
import { ToolCallingAgent } from "beeai-framework/agents/toolCalling/agent";
import { TokenMemory } from "beeai-framework/memory/tokenMemory";
import { DuckDuckGoSearchTool } from "beeai-framework/tools/search/duckDuckGoSearch";
import { OpenMeteoTool } from "beeai-framework/tools/weather/openMeteo";
import { OpenAIChatModel } from "beeai-framework/adapters/openai/backend/chat";

const llm = new OpenAIChatModel(
  "gpt-4o", 
  {},
  { apiKey: 'your-openai-api-key' }
);

const agent = new ToolCallingAgent({
  llm,
  memory: new TokenMemory(),
  tools: [
    new DuckDuckGoSearchTool(),
    new OpenMeteoTool(), // weather tool
  ],
});

async function main() {
  const response = await agent.run({ prompt: "What's the current weather in Berlin?" });
  console.log(`Agent 🤖 : `, response.result.text);
}

main();
```

## Stream Responses with agentClient.RunStream in Go

https://raw.githubusercontent.com/runagent-dev/runagent/main/docs/sdk/typescript/getting-started.mdx

```
// Stream responses for real-time output
stream, err := agentClient.RunStream(ctx, map[string]interface{}{
	"role":    "user",
	"message": "Write a story about AI",
})
if err != nil {
	log.Fatalf("Failed to start stream: %v", err)
}
defer stream.Close()

// Read from stream
for {
	data, hasMore, err := stream.Next(ctx)
	if err != nil {
		log.Printf("Stream error: %v", err)
		break
	}

	if !hasMore {
		fmt.Println("Stream completed")
		break
	}

	fmt.Printf("%v", data)
}
```

## shell Result 1

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/providers/openai/README.md

```
python cookbook/providers/openai/agent.py
```

## Implements Joke Generation with Async Agent and Streaming

https://raw.githubusercontent.com/panaversity/learn-agentic-ai/main/01_ai_agents_first/10_streaming/README.md

```
=== Run starting ===
-- Tool output: 4
-- Message output:
 Sure, here are four jokes for you:

1. **Why don't skeletons fight each other?**
   They don't have the guts!

2. **What do you call fake spaghetti?**
   An impasta!

3. **Why did the scarecrow win an award?**
   Because he was outstanding in his field!

4. **Why can't you give Elsa a balloon?**
   Because she will let it go!
```

## Tool-calling agents - Python AI SDK

https://pythonaisdk.mintlify.app/examples/tool-agent

```
from ai_sdk import openai, generate_text
from tools import add # assume above code lives in tools.py

model = openai("gpt-4.1-mini", temperature=0)

res = generate_text(
 model=model,
 prompt="What is 21 + 21?",
 tools=[add],
)
print(res.text) # "The result is 42."
print(res.tool_calls) # introspection
print(res.tool_results)
```

## Quickstart - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/realtime/quickstart/

```
session=await runner.run(model_config={"api_key":"your-api-key" })
```

## EventHandler Class for AgencyEventHandler in Streaming API

https://raw.githubusercontent.com/VRSEN/agency-swarm/main/docs/additional-features/streaming.mdx

```
from typing_extensions import override
from agency_swarm import AgencyEventHandler

class EventHandler(AgencyEventHandler):
    @override
    def on_text_created(self, text) -> None:
        # Get the name of the agent that is sending the message
        print(f"\n{self.recipient_agent_name} @ {self.agent_name}  > ", end="", flush=True)

    @override
    def on_text_delta(self, delta, snapshot):
        print(delta.value, end="", flush=True)

    def on_tool_call_created(self, tool_call):
        print(f"\n{self.recipient_agent_name} > {tool_call.type}\n", flush=True)

    def on_tool_call_delta(self, delta, snapshot):
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                print(delta.code_interpreter.input, end="", flush=True)
            if delta.code_interpreter.outputs:
                print(f"\n\noutput >", flush=True)
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        print(f"\n{output.logs}", flush=True)

    @classmethod
    def on_all_streams_end(cls):
        print("\n\nAll streams have ended.")  # Conversation is over and message is returned to the user.

response = agency.get_completion_stream("I want you to build me a website", event_handler=EventHandler)
```

## Agent - Python AI SDK

https://pythonaisdk.mintlify.app/sdk/agent

```
stream = agent.stream("Tell me a story")
async for chunk in stream.text_stream:
 print(chunk, end="", flush=True)
```

## Stream Weather Query Results with Agent

https://raw.githubusercontent.com/mcp-use/mcp-use/main/docs/api-reference/mcpagent.mdx

```
async for item in agent.stream("What's the weather like?"):
    if isinstance(item, str):
        print(f"Final result: {item}")
    else:
        action, observation = item
        print(f"Tool: {action.tool}, Result: {observation}")
```

## Enable Streaming Output with Agent.run Method

https://raw.githubusercontent.com/wxai-space/LightAgent/main/README.fr.md

```
# Enable streaming output
response = agent.run("Please generate an article about AI", stream=True)
for chunk in response:
    print(chunk)
```

## GitHub - openai/openai-agents-python: A lightweight, powerful framework for multi-agent workflows

https://github.com/openai/openai-agents-python

```
make tests # run tests
make mypy # run typechecker
make lint # run linter
make format-check # run style checker
```

## Running agents - OpenAI Agents SDK

https://openai.github.io/openai-agents-python/running_agents/

```
from agents import Agent,Runner
async def main ():
agent=Agent(name="Assistant",instructions="Reply very concisely.")
# First turn
result1=await Runner.run(agent,"What city is the Golden Gate Bridge in?")
print(result1.final_output)
# San Francisco
# Second turn, chained to the previous response
result2=await Runner.run(
agent,
"What state is it in?",
previous_response_id=result1.last_response_id,
)
print(result2.final_output)
# California
```

## Create Agent and Define Time Query in Agently

https://raw.githubusercontent.com/AgentEra/Agently/main/README.md

```
from agently import Agently

agent = Agently.create_agent()

(
    agent
        .input("What time is it now?", always=True)
        .info({
            "default_timezone": "",
            "tool_list": [{
                "name": "get_current_time",
                "desc": "Get current time by time zone provided",
                "kwargs": {
                    "timezone_str": (str, "time zone string in ZoneInfo()"),
                },
            }]
        })
        .output({
            "first_time_response": (str, ),
            "tool_using_judgement": (bool, ),
            "tool_using_command": (
                {
                    "name": (str, "Decide which tool to use by tool name:{tool_list.[].name}"),
                    "kwargs": (dict, "According {tool_list.[].args} to output kwargs dictionary"),
                },
                "If {tool_using_judgement}==False, just output {}",
            ),
        })
)
```
