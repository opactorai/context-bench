# Oneshot Mode Result

**Scenario**: openrouter-sdk:structured-tools
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:30:23.521Z

---

## Query

Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/llmstxt/openrouter_ai_llms-full_txt",
  "topic": "Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer."
}
```

---

## Tool Result

### OpenRouter Structured Output Request Example

Source: https://context7_llms

Shows how to use OpenRouter's structured output feature by including a 'response_format' parameter with 'type' set to 'json_schema'. This enforces JSON schema validation on model responses for consistency.

```typescript
{
  "messages": [
    { "role": "user", "content": "What's the weather like in London?" }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "weather",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City or location name"
          },
          "temperature": {
            "type": "number",
            "description": "Temperature in Celsius"
          },
          "conditions": {
            "type": "string",
            "description": "Weather conditions description"
          }
        },
        "required": ["location", "temperature", "conditions"],
        "additionalProperties": false
      }
    }
  }
}
```

--------------------------------

### MCP Server with Structured Output Support

Source: https://github.com/modelcontextprotocol/python-sdk

This Python code demonstrates a low-level MCP server that supports structured output for tools. It defines a 'get_weather' tool with input and output schemas, and a handler that returns simulated weather data, which is validated against the output schema.

```Python
import asyncio
from typing import Any

import mcp.server.stdio
import mcp.types as types
from mcp.server.lowlevel import NotificationOptions, Server
from mcp.server.models import InitializationOptions

server = Server("example-server")

@server.list_tools()
def list_tools() -> list[types.Tool]:
    """List available tools with structured output schemas."""
    return [
        types.Tool(
            name="get_weather",
            description="Get current weather for a city",
            inputSchema={
                "type": "object",
                "properties": {"city": {"type": "string", "description": "City name"}},
                "required": ["city"],
            },
            outputSchema={
                "type": "object",
                "properties": {
                    "temperature": {"type": "number", "description": "Temperature in Celsius"},
                    "condition": {"type": "string", "description": "Weather condition"},
                    "humidity": {"type": "number", "description": "Humidity percentage"},
                    "city": {"type": "string", "description": "City name"},
                },
                "required": ["temperature", "condition", "humidity", "city"],
            },
        )
    ]

@server.call_tool()
def call_tool(name: str, arguments: dict[str, Any]) -> dict[str, Any]:
    """Handle tool calls with structured output."""
    if name == "get_weather":
        city = arguments["city"]

        # Simulated weather data - in production, call a weather API
        weather_data = {
            "temperature": 22.5,
            "condition": "partly cloudy",
            "humidity": 65,
            "city": city,  # Include the requested city
        }

        # low-level server will validate structured output against the tool's
        # output schema, and additionally serialize it into a TextContent block
        # for backwards compatibility with pre-2025-06-18 clients.
        return weather_data
    else:
        raise ValueError(f"Unknown tool: {name}")

async def run():
    """Run the structured output server."""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="structured-output-example",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )

if __name__ == "__main__":
    asyncio.run(run())
```

--------------------------------

### OpenRouter LLM - Tool Call Handling

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Details the structure for handling tool calls in OpenRouter AI LLMs, including the type of tool call and descriptions for specific error types related to tool parsing.

```typescript
{
  name: 'toolCall',
  type: 'LanguageModelV2ToolCall',
  description: 'The tool call that failed to parse.'
},
{
  name: 'tools',
  type: 'TOOLS',
  description: 'The tools that are available.'
},
{
  name: 'parameterSchema',
  type: '(options: { toolName: string }) => JSONSchema7',
  description: 'A function that returns the JSON Schema for a tool.'
},
{
  name: 'error',
  type: 'NoSuchToolError | InvalidToolInputError',
  description: 'The error that occurred while parsing the tool call.'
}
```

--------------------------------

### Make OpenRouter API Call with Tools (TypeScript)

Source: https://context7_llms

Initiates a chat completion request to the OpenRouter API using a specified model, tools, and messages via a POST request. It then parses the JSON response to extract the LLM's message, which may include tool calls.

```TypeScript
const request_1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer {{API_KEY_REF}}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: '{{MODEL}}',
    tools,
    messages,
  }),
});

const data = await request_1.json();
const response_1 = data.choices[0].message;
```

--------------------------------

### Fetch API Example for Structured Outputs (TypeScript)

Source: https://context7_llms

Demonstrates how to make a POST request to the OpenRouter API using the Fetch API in TypeScript to get structured weather information. It includes setting headers, sending a JSON body with model details, messages, and a JSON schema for response formatting. The example shows how to parse the JSON response and extract the structured content.

```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer {{API_KEY_REF}}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: '{{MODEL}}',
    messages: [
      { role: 'user', content: 'What is the weather like in London?' },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'weather',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            location: {
              type: 'string',
              description: 'City or location name',
            },
            temperature: {
              type: 'number',
              description: 'Temperature in Celsius',
            },
            conditions: {
              type: 'string',
              description: 'Weather conditions description',
            },
          },
          required: ['location', 'temperature', 'conditions'],
          additionalProperties: false,
        },
      },
    },
  }),
});

const data = await response.json();
const weatherInfo = data.choices[0].message.content;
```

--------------------------------

### Define Weather Retrieval Function Schema in JSON

Source: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

This JSON schema defines a function called 'get_weather' that retrieves the current weather in a given location. It specifies the input schema, including the 'location' parameter with its type and description. The schema is used to provide structured information to the LLM for function calling.

```JSON
{
  "name": "get_weather",
  "description": "Get the current weather in a given location",
  "input_schema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "The city and state, e.g. San Francisco, CA"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"]
      }
    }
  }
}
```

--------------------------------

### Define Tool Structure for Model Interaction

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Defines the structure for a 'Tool' that can be used by AI models. It includes an optional description, an input schema (Zod or JSON), and an optional asynchronous execute function.

```typescript
{
  type: 'Tool',
  parameters: [
    {
      name: 'description',
      isOptional: true,
      type: 'string',
      description: 'Information about the purpose of the tool including details on how and when it can be used by the model.'
    },
    {
      name: 'inputSchema',
      type: 'Zod Schema | JSON Schema',
      description: 'The schema of the input that the tool expects. The language model will use this to generate the input. It is also used to validate the output of the language model. Use descriptions to make the input understandable for the language model. You can either pass in a Zod schema or a JSON schema (using the `jsonSchema` function).'
    },
    {
      name: 'execute',
      isOptional: true,
      type: 'async (parameters: T, options: ToolExecutionOptions) => RESULT',
      description: 'An async function that is called with the arguments from the tool call and produces a result. If not provided, the tool will not be executed automatically.'
    }
  ]
}
```

--------------------------------

### OpenRouter Structured Output Response Example

Source: https://context7_llms

Provides an example of a model response that strictly adheres to a predefined JSON schema when using OpenRouter's structured output feature.

```json
{
  "location": "London",
  "temperature": 18,
  "conditions": "Partly cloudy with light drizzle"
}
```

--------------------------------

### Call Claude Opus Model with Tool Use

Source: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

This example demonstrates how to make an asynchronous call to the Claude Opus model via OpenRouter. It includes setting the model, max tokens, and defining a tool for 'get_weather' with its schema.

```javascript
async function main() {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 1024,
    tools: [
      {
        name: "get_weather",
        description: "Get the current weather in a given location",
        input_schema: {
          // Schema definition would go here
        }
      }
    ]
  });
}
```

--------------------------------

### Output Generation Options

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Describes the 'Output' structure used for generating structured outputs from the model. It provides methods to forward text output or generate a JSON object based on a provided schema.

```typescript
interface Output {
  text(): Output;
  object(): Output;
  schema: Schema<OBJECT>;
  onStepFinish?: (result: onStepFinishResult) => Promise<void> | void;
};
```

--------------------------------

### Output Parameters for OpenRouter AI LLMs

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Defines the parameters for handling output from AI models, including methods for retrieving text and generating JSON objects with schema validation.

```typescript
{
  name: 'Output.text()',
  type: 'Output',
  description: 'Forward text output.',
},
{
  name: 'Output.object()',
  type: 'Output',
  description: 'Generate a JSON object of type OBJECT.',
  properties: [
    {
      type: 'Options',
      parameters: [
        {
          name: 'schema',
          type: 'Schema<OBJECT>',
          description: 'The schema of the JSON object to generate.',
        },
      ],
    },
  ],
}
```

--------------------------------

### TypeScript Response Schema

Source: https://context7_llms

Defines the structure of the response from the OpenRouter Completions API, including properties like id, choices, created, model, object, system_fingerprint, and usage. It also details subtypes for non-streaming, streaming, and non-chat choices, along with error and tool call structures.

```TypeScript
type Response = {
  id: string;
  // Depending on whether you set "stream" to "true" and
  // whether you passed in "messages" or a "prompt", you
  // will get a different output shape
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];
  created: number; // Unix timestamp
  model: string;
  object: 'chat.completion' | 'chat.completion.chunk';

  system_fingerprint?: string; // Only present if the provider supports it

  // Usage data is always returned for non-streaming.
  // When streaming, you will get one usage object at
  // the end accompanied by an empty choices array.
  usage?: ResponseUsage;
};

// If the provider returns usage, we pass it down
// as-is. Otherwise, we count using the GPT-4 tokenizer.

type ResponseUsage = {
  /** Including images and tools if any */
  prompt_tokens: number;
  /** The tokens generated */
  completion_tokens: number;
  /** Sum of the above two fields */
  total_tokens: number;
};

// Subtypes:
type NonChatChoice = {
  finish_reason: string | null;
  text: string;
  error?: ErrorResponse;
};

type NonStreamingChoice = {
  finish_reason: string | null;
  native_finish_reason: string | null;
  message: {
    content: string | null;
    role: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type StreamingChoice = {
  finish_reason: string | null;
  native_finish_reason: string | null;
  delta: {
    content: string | null;
    role?: string;
    tool_calls?: ToolCall[];
  };
  error?: ErrorResponse;
};

type ErrorResponse = {
  code: number; // See "Error Handling" section
  message: string;
  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.
};

type ToolCall = {
  id: string;
  type: 'function';
  function: FunctionCall;
};
```

--------------------------------

### OpenRouter LLM Response Structure

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Defines the structure of a complete response from an OpenRouter AI LLM. It includes details about tool calls, tool results, the reason for finishing generation, token usage, and optional request/response metadata.

```typescript
{
  "toolCalls": ToolCall[],
  "toolResults": ToolResult[],
  "finishReason": "stop" | "length" | "content-filter" | "tool-calls" | "error" | "other" | "unknown",
  "usage": LanguageModelUsage,
  "request": RequestMetadata | undefined,
  "response": ResponseMetadata | undefined,
  "warnings": Warning[] | undefined,
  "isContinued": boolean,
  "providerMetadata": Record<string, Record<string, JSONValue>> | undefined
}
```

--------------------------------

### TypeScript Agentic Loop for LLM Tool Calls

Source: https://context7_llms

Provides a TypeScript implementation of an agentic loop for LLM interactions, handling tool calls and responses. It uses asynchronous functions for API calls and manages the message history through iterations.

```typescript
async function callLLM(messages: Message[]): Promise<Message> {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer {{API_KEY_REF}}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: '{{MODEL}}',
        tools,
        messages,
      }),
    },
  );

  const data = await response.json();
  messages.push(data.choices[0].message);
  return data;
}

async function getToolResponse(response: Message): Promise<Message> {
  const toolCall = response.toolCalls[0];
  const toolName = toolCall.function.name;
  const toolArgs = JSON.parse(toolCall.function.arguments);

  // Look up the correct tool locally, and call it with the provided arguments
  // Other tools can be added without changing the agentic loop
  const toolResult = await TOOL_MAPPING[toolName](toolArgs);

  return {
    role: 'tool',
    toolCallId: toolCall.id,
    content: toolResult,
  };
}

const maxIterations = 10;
let iterationCount = 0;

while (iterationCount < maxIterations) {
  iterationCount++;
  const response = await callLLM(messages);

  if (response.toolCalls) {
    messages.push(await getToolResponse(response));
  } else {
    break;
  }
}

if (iterationCount >= maxIterations) {
  console.warn("Warning: Maximum iterations reached");
}

console.log(messages[messages.length - 1].content);
```

--------------------------------

### OpenAI Chat API Compatible Request Schema

Source: https://openrouter.ai/docs/api-reference/overview

Defines the structure for a chat completions request, compatible with the OpenAI API. It supports both 'messages' and 'prompt' fields, allows specifying the model, and includes parameters for controlling output format, streaming, and generation behavior like max tokens and temperature. Tool calling is also supported.

```typescript
type Request = {
 // Either "messages" or "prompt" is required
 messages?: Message[];
 prompt?: string;

 // If "model" is unspecified, uses the user's default
 model?: string; // See "Supported Models" section

 // Allows to force the model to produce specific output format.
 // See models page and note on this docs page for which models support it.
 response_format?: { type: 'json_object' };

 stop?: string | string[];
 stream?: boolean; // Enable streaming

 // See LLM Parameters (openrouter.ai/docs/api-reference/parameters)
 max_tokens?: number; // Range: [1, context_length)
temperature?: number; // Range: [0, 2]

 // Tool calling
 // Will be passed down as-is for providers implementing Op
```

--------------------------------

### TypeScript Request Schema for OpenRouter AI LLMs

Source: https://openrouter.ai/docs/api-reference/overview

Defines the structure for requests to the OpenRouter AI chat completions endpoint. It includes required and optional fields for messages, model selection, response formatting, streaming, tool calling, and advanced parameters. Subtypes for content parts, messages, and tool definitions are also provided.

```typescript
// Definitions of subtypes are below
type Request = {
 // Either "messages" or "prompt" is required
 messages?: Message[];
 prompt?: string;

 // If "model" is unspecified, uses the user's default
 model?: string; // See "Supported Models" section

 // Allows to force the model to produce specific output format.
 // See models page and note on this docs page for which models support it.
 response_format?: { type: 'json_object' };

 stop?: string | string[];
 stream?: boolean; // Enable streaming

 // See LLM Parameters (openrouter.ai/docs/api-reference/parameters)
 max_tokens?: number; // Range: [1, context_length)
temperature?: number; // Range: [0, 2]

 // Tool calling
 // Will be passed down as-is for providers implementing OpenAI's interface.
 // For providers with custom interfaces, we transform and map the properties.
 // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.
 // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools
 tools?: Tool[];
 tool_choice?: ToolChoice;

 // Advanced optional parameters
 seed?: number; // Integer only
top_p?: number; // Range: (0, 1]
top_k?: number; // Range: [1, Infinity) Not available for OpenAI models
frequency_penalty?: number; // Range: [-2, 2]
presence_penalty?: number; // Range: [-2, 2]
repetition_penalty?: number; // Range: (0, 2]
logit_bias?: { [key: number]: number };
top_logprobs: number; // Integer only
min_p?: number; // Range: [0, 1]
top_a?: number; // Range: [0, 1]

 // Reduce latency by providing the model with a predicted output
 // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs
 prediction?: { type: 'content'; content: string };

 // OpenRouter-only parameters
 // See "Prompt Transforms" section: openrouter.ai/docs/transforms
transforms?: string[];
 // See "Model Routing" section: openrouter.ai/docs/model-routing
models?: string[];
route?: 'fallback';
 // See "Provider Routing" section: openrouter.ai/docs/provider-routing
provider?: ProviderPreferences;
user?: string; // A stable identifier for your end-users. Used to help detect and prevent abuse.
};

// Subtypes:

type TextContent = {
 type: 'text';
 text: string;
};

type ImageContentPart = {
 type: 'image_url';
 image_url: {
 url: string; // URL or base64 encoded image data
 detail?: string; // Optional, defaults to "auto"
 };
};

type ContentPart = TextContent | ImageContentPart;

type Message =
 | {
 role: 'user' | 'assistant' | 'system';
 // ContentParts are only for the "user" role:
 content: string | ContentPart[];
 // If "name" is included, it will be prepended like this
 // for non-OpenAI models: `name: content`
 name?: string;
 }
 | {
 role: 'tool';
 content: string;
 tool_call_id: string;
 name?: string;
 };

type FunctionDescription = {
 description?: string;
 name: string;
 parameters: object; // JSON Schema object
};

type Tool = {
 type: 'function';
 function: FunctionDescription;
};

type ToolChoice =
 | 'none'
 | 'auto'
 | {
 type: 'function';
 function: {
 name: string;
 };
 };
```

--------------------------------

### JSON Mode for Structured Output

Source: https://docs.anthropic.com/en/docs/build-with-claude/tool-use

Explains how to leverage tools to generate JSON output that conforms to a specified schema, even when the output is not intended for tool execution. It advises using a single tool, setting 'tool_choice' to force tool use, and ensuring the tool's input description is from the model's perspective.

```text
You can use tools to get Claude produce JSON output that follows a schema, even if you don’t have any intention of running that output through a tool or function.\nWhen using tools in this way:\nYou usually want to provide a single tool\nYou should set tool_choice (see Forcing tool use) to instruct the model to explicitly use that tool\nRemember that the model will pass the input to the tool, so the name of the tool and description should be from the model’s perspective.
```

--------------------------------

### Tool Calls and Results

Source: https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text

Defines the structure for tool calls and their corresponding results. Tool calls represent actions the model intends to perform, while tool results contain the output of those actions. This is crucial for models that interact with external tools or APIs.

```typescript
{
name: 'toolCalls',
type: 'Promise<TypedToolCall<TOOLS>[]>',
description:
'The tool calls that have been executed. Automatically consumes the stream.',
},
{
name: 'toolResults',
type: 'Promise<TypedToolResult<TOOLS>[]>',
description:
'The tool results that have been generated. Resolved when the all tool executions are finished.',
}
```
