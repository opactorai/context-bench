# Oneshot Mode Result

**Scenario**: openrouter-sdk:structured-tools
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:58:12.712Z

---

## Query

Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer.

---

## Tool Input

```json
{
  "query": "Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer."
}
```

---

## Tool Result

## Structured Outputs - Type-Safe JSON Responses from AI Models

https://openrouter.ai/docs/structured-outputs

```
1
{
 2
 "stream": true,
 3
 "response_format": {
 4
 "type": "json_schema",
 5
 // ... rest of your schema
 6
}
 7
}
```

## Tool & Function Calling

https://openrouter.ai/docs/features/tool-calling

```
1
{
 2
 "tools": [
 3
{
 4
 "type": "function",
 5
 "function": {
 6
 "name": "search_products",
 7
 "description": "Search for products in the catalog"
 8
}
 9
 },
 10
{
 11
 "type": "function",
 12
 "function": {
 13
 "name": "get_product_details",
 14
 "description": "Get detailed information about a specific product"
 15
}
 16
 },
 17
{
 18
 "type": "function",
 19
 "function": {
 20
 "name": "check_inventory",
 21
 "description": "Check current inventory levels for a product"
 22
}
 23
}
 24
]
 25
}
```

## openrouter.ts — stupid simple client for strict JSON output, fallback, and routing pricing control

https://gist.github.com/bholagabbar/3da99f59faf593970fe2a5d61c90d9d3

```
npm install zod zod-to-json-schema
```

## Define Weather Tool with Geocoding and Weather APIs

https://raw.githubusercontent.com/mastra-ai/mastra/main/docs/src/content/ja/examples/workflows_vNext/agent-and-tool-interop.mdx

```
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

interface GeocodingResponse {
  results: {
    latitude: number;
    longitude: number;
    name: string;
  }[];
}
interface WeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_gusts_10m: number;
    weather_code: number;
  };
}

// Create a tool to fetch weather data
export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema: z.object({
    location: z.string().describe("City name"),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ context }) => {
    return await getWeather(context.location);
  },
});

// Helper function to fetch weather data from external APIs
const getWeather = async (location: string) => {
  const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
  const geocodingResponse = await fetch(geocodingUrl);
  const geocodingData = (await geocodingResponse.json()) as GeocodingResponse;

  if (!geocodingData.results?.[0]) {
    throw new Error(`Location '${location}' not found`);
  }

  const { latitude, longitude, name } = geocodingData.results[0];

  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code`;

  const response = await fetch(weatherUrl);
  const data = (await response.json()) as WeatherResponse;

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    windGust: data.current.wind_gusts_10m,
    conditions: getWeatherCondition(data.current.weather_code),
    location: name,
  };
};

// Helper function to convert numeric weather codes to human-readable descriptions
function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return conditions[code] || "Unknown";
}
```

## GitHub - mmeerrkkaa/openrouter-kit: Powerful & flexible TypeScript SDK for the OpenRouter API. Streamlines building LLM applications with easy chat, adapter-based history, secure tool calling (function calling), cost tracking, and plugin support.

https://github.com/mmeerrkkaa/openrouter-kit

```
{ host, port, user?, pass? }
```

## Implements Weather Retrieval via OpenAI API

https://raw.githubusercontent.com/Helicone/helicone/main/docs/integrations/tools/logger-sdk.mdx

```
import os
    import requests

    tools = [{
      "type": "function",
      "function": {
        "name": "getWeather",
        "description": "Get current temperature for a given location.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and country e.g. Bogotá, Colombia"
            }
          },
          "required": ["location"],
          "additionalProperties": False
        },
        "strict": True
      }
    }]

    def tool_call(result_recorder):
      # The tool call
      response = requests.post(
          "https://api.openai.com/v1/chat/completions",
          headers={
              "Content-Type": "application/json",
              "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"
          },
          json={
              "model": "gpt-4o-mini",
              "messages": [
                  {
                      "role": "user",
                      "content": "What's the weather like in Panama City, Panama?"
                  }
              ],
              "tools": tools
          }
      )
      response_json = response.json()

      # Log the results to Helicone
      result_recorder.append_results({
          "response": response_json,
          "usage": response_json.get("usage"),
          "model": response_json.get("model")
      })
      return response

    request = helicone_logger.log_request(
        provider="openai",
        request={"tools": tools},
        operation=tool_call,
        additional_headers={
            "Helicone-Property-Session": "user-123" # Optional: Add session tracking or any custom properties
        }
      )
```

## OpenRouter API Reference - Complete Documentation

https://openrouter.ai/docs/requests

```
1
 const generation = await fetch(
 2
 'https://openrouter.ai/api/v1/generation?id=$GENERATION_ID',
 3
 { headers },
 4
 );
 5
 6
 const stats = await generation.json();
```

## Tool Class for Fetching Current Weather Conditions

https://raw.githubusercontent.com/lofcz/LlmTornado/main/src/LlmTornado.Docs/website/docs/chat/functions.md

```
// Good description
new Tool((string city, ToolArguments args) =>
{
    return GetWeather(city);
}, "get_weather", "Gets current weather conditions for a specified city. City name should be in English and include country if ambiguous (e.g., 'London, UK' vs 'London, Ontario'). Returns temperature in Celsius and weather description.")

// Poor description
new Tool((string city, ToolArguments args) =>
{
    return GetWeather(city);
}, "get_weather", "Weather function")
```

## Weather Tool Integration with GenerativeModel in Vertex AI

https://raw.githubusercontent.com/googleapis/python-aiplatform/main/vertexai/generative_models/README.md

```
from vertexai.preview.generative_models import GenerativeModel, Tool, FunctionDeclaration, AutomaticFunctionCallingResponder

# First, create functions that the model can use to answer your questions.
def get_current_weather(location: str, unit: str = "centigrade"):
    """Gets weather in the specified location.

    Args:
        location: The location for which to get the weather.
        unit: Optional. Temperature unit. Can be Centigrade or Fahrenheit. Defaults to Centigrade.
    """
    return dict(
        location=location,
        unit=unit,
        weather="Super nice, but maybe a bit hot.",
    )

# Infer function schema
get_current_weather_func = FunctionDeclaration.from_func(get_current_weather)
# Tool is a collection of related functions
weather_tool = Tool(
    function_declarations=[get_current_weather_func],
)

# Use tools in chat:
model = GenerativeModel(
    "gemini-pro",
    # You can specify tools when creating a model to avoid having to send them with every request.
    tools=[weather_tool],
)

# Activate automatic function calling:
afc_responder = AutomaticFunctionCallingResponder(
    # Optional:
    max_automatic_function_calls=5,
)
chat = model.start_chat(responder=afc_responder)
# Send a message to the model. The model will respond with a function call.
# The SDK will automatically call the requested function and respond to the model.
# The model will use the function call response to answer the original question.
print(chat.send_message("What is the weather like in Boston?"))
```

## Tool.from_tool Custom Output Schema Definition

https://raw.githubusercontent.com/jlowin/fastmcp/main/docs/patterns/tool-transformation.mdx

```
Tool.from_tool(parent_tool, output_schema={
    "type": "object", 
    "properties": {"status": {"type": "string"}}
})
```

## Use Weather Tool from Weather-Server in Roo

https://raw.githubusercontent.com/Michaelzag/RooCode-Tips-Tricks/main/personal_roo_docs/normal/mcp-server-integration.md

```
Can you use the weather tool from the weather-server to check the forecast for San Francisco?
```

## Handles Function Calls for Weather and Nickname Retrieval

https://raw.githubusercontent.com/daveshap/OpenAI_Agent_Swarm/main/agents/agent_builder/agents/Autonomous Swarm Agent Builder/files/OpenAI_Documentation.md

```
{
  "id": "run_3HV7rrQsagiqZmYynKwEdcxS",
  "object": "thread.run",
  "assistant_id": "asst_rEEOF3OGMan2ChvEALwTQakP",
  "thread_id": "thread_dXgWKGf8Cb7md8p0wKiMDGKc",
  "status": "requires_action",
  "required_action": {
    "type": "submit_tool_outputs",
    "submit_tool_outputs": {
      "tool_calls": [
        {
          "tool_call_id": "call_Vt5AqcWr8QsRTNGv4cDIpsmA",
          "type": "function",
          "function": {
            "name": "getCurrentWeather",
            "arguments": "{\"location\":\"San Francisco\"}"
          }
        },
        {
          "tool_call_id": "call_45y0df8230430n34f8saa",
          "type": "function",
          "function": {
            "name": "getNickname",
            "arguments": "{\"location\":\"Los Angeles\"}"
          }
        }
      ]
    }
  },
...
```

## Defines get_weather_tool for weather data retrieval

https://raw.githubusercontent.com/DataTalksClub/llm-zoomcamp/main/cohorts/2025/0a-agents/homework.md

```
get_weather_tool = {
    "type": "function",
    "name": "<TODO1>",
    "description": "<TODO2>",
    "parameters": {
        "type": "object",
        "properties": {
            "<TODO3>": {
                "type": "string",
                "description": "<TODO4>"
            }
        },
        "required": [TODO5],
        "additionalProperties": False
    }
}
```

## Partially structured output? Free text output, but force ...

https://community.openai.com/t/partially-structured-output-free-text-output-but-force-correct-tool-call-json/955147

```
Miami's weather today: 77F and sunny!
```

## Define vercelWeatherTool for Vercel AI SDK

https://raw.githubusercontent.com/mastra-ai/mastra/main/docs/src/content/ja/docs/tools-mcp/advanced-usage.mdx

```
import { tool } from "ai";
import { z } from "zod";

export const vercelWeatherTool = tool({
  description: "Fetches current weather using Vercel AI SDK format",
  parameters: z.object({
    city: z.string().describe("The city to get weather for"),
  }),
  execute: async ({ city }) => {
    console.log(`Fetching weather for ${city} (Vercel format tool)`);
    // Replace with actual API call
    const data = await fetch(`https://api.example.com/weather?city=${city}`);
    return data.json();
  },
});
```

## Responses API Beta Tool Calling

https://openrouter.ai/docs/api-reference/responses-api/tool-calling

```
1
{
 2
 "type": "function_call",
 3
 "id": "fc_abc123",
 4
 "call_id": "call_xyz789",
 5
 "name": "get_weather",
 6
 "arguments": "{\"location\":\"Seattle, WA\"}"
 7
}
```

## GetResolvedToolOutput: Resolves Tool Outputs Based on Function Name

https://raw.githubusercontent.com/Azure/azure-sdk-for-net/main/sdk/ai/Azure.AI.Agents.Persistent/samples/Sample8_PersistentAgents_FunctionsWithStreaming.md

```
ToolOutput GetResolvedToolOutput(string functionName, string toolCallId, string functionArguments)
{
    if (functionName == getUserFavoriteCityTool.Name)
    {
        return new ToolOutput(toolCallId, GetUserFavoriteCity());
    }
    using JsonDocument argumentsJson = JsonDocument.Parse(functionArguments);
    if (functionName == getCityNicknameTool.Name)
    {
        string locationArgument = argumentsJson.RootElement.GetProperty("location").GetString();
        return new ToolOutput(toolCallId, GetCityNickname(locationArgument));
    }
    if (functionName == getCurrentWeatherAtLocationTool.Name)
    {
        string locationArgument = argumentsJson.RootElement.GetProperty("location").GetString();
        if (argumentsJson.RootElement.TryGetProperty("unit", out JsonElement unitElement))
        {
            string unitArgument = unitElement.GetString();
            return new ToolOutput(toolCallId, GetWeatherAtLocation(locationArgument, unitArgument));
        }
        return new ToolOutput(toolCallId, GetWeatherAtLocation(locationArgument));
    }
    return null;
}
```

## Revisiting OpenAI Function Calling with Strict JSON Output

https://medium.com/@enriquecano12/revisiting-openai-function-calling-with-strict-json-output-c8311e3ed88e

```
python -m venv .venv && source .venv/bin/activate
```

## Structured outputs with OpenRouter, a complete guide with instructor - Instructor

https://python.useinstructor.com/integrations/openrouter/

```
from pydantic import BaseModel,Field
import os
from openai import OpenAI
import instructor
class User(BaseModel ):
name:str
age:int
# Initialize with API key
# Initialize client with base URL
client=instructor.from_provider(
"openrouter/google/gemini-2.0-flash-lite-001",
base_url="https://openrouter.ai/api/v1",
)
# Create structured output with nested objects
user=client.chat.completions.create_partial(
messages=[
{
"role":"user",
"content":"""
Extract: Jason is 25 years old and his number is 1-212-456-7890
""",
},
],
response_model=User,
)
for chunk in user:
print(chunk)
# > name=None age=None
# > name='Jason' age=None
# > name='Jason' age=25
```

## getCurrentWeather and getCurrentWeatherTool Functions

https://raw.githubusercontent.com/LangbaseInc/BaseAI/main/apps/baseai.dev/content/learn/learn/run-pipe-with-tool.mdx

```
import {ToolI} from '@baseai/core';

export async function getCurrentWeather(location: string, unit: string) {
	return `Weather in ${location} is 72 degrees ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}`;
}

const getCurrentWeatherTool = (): ToolI => ({
	run: getCurrentWeather,
	type: 'function' as const,
	function: {
		name: 'getCurrentWeather',
		description: 'Get the current weather for a given location',
		parameters: {
			type: 'object',
			properties: {
				location: {
					type: 'string',
					description: 'The city and state, e.g. San Francisco, CA',
				},
				unit: {
					type: 'string',
					enum: ['celsius', 'fahrenheit'],
				},
			},
			required: ['location'],
		},
	},
});

export default getCurrentWeatherTool;
```

## Defines weatherTool for fetching current weather data

https://raw.githubusercontent.com/bytedance/UI-TARS-desktop/main/multimodal/tarko/agent-interface/README.md

```
import { Tool } from '@tarko/agent-interface';
import { z } from 'zod';

const weatherTool: Tool = {
  name: 'get_weather',
  description: 'Get current weather for a location',
  schema: z.object({
    location: z.string().describe('The city and state/country'),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  function: async ({ location, unit }) => {
    // Fetch weather data
    return {
      location,
      temperature: 22,
      unit,
      condition: 'sunny',
    };
  },
};
```

## How can I use function calling with response format ...

https://community.openai.com/t/how-can-i-use-function-calling-with-response-format-structured-output-feature-for-final-response/965784

```
anyOf[{"type": "string","type": "null"}]
```

## ts Result 1

https://raw.githubusercontent.com/openai/openai-node/main/helpers.md

```
import OpenAI from 'openai';

const client = new OpenAI();

async function main() {
  const runner = client.chat.completions
    .runTools({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'How is the weather this week?' }],
      tools: [
        {
          type: 'function',
          function: {
            function: getCurrentLocation,
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            function: getWeather,
            parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
            parameters: {
              type: 'object',
              properties: {
                location: { type: 'string' },
              },
            },
          },
        },
      ],
    })
    .on('message', (message) => console.log(message));

  const finalContent = await runner.finalContent();
  console.log();
  console.log('Final content:', finalContent);
}

async function getCurrentLocation() {
  return 'Boston'; // Simulate lookup
}

async function getWeather(args: { location: string }) {
  const { location } = args;
  // … do lookup …
  return { temperature, precipitation };
}

main();

// {role: "user",      content: "How's the weather this week?"}
// {role: "assistant", tool_calls: [{type: "function", function: {name: "getCurrentLocation", arguments: "{}"}, id: "123"}
// {role: "tool",      name: "getCurrentLocation", content: "Boston", tool_call_id: "123"}
// {role: "assistant", tool_calls: [{type: "function", function: {name: "getWeather", arguments: '{"location": "Boston"}'}, id: "1234"}]}
// {role: "tool",      name: "getWeather", content: '{"temperature": "50degF", "preciptation": "high"}', tool_call_id: "1234"}
// {role: "assistant", content: "It's looking cold and rainy - you might want to wear a jacket!"}
//
// Final content: "It's looking cold and rainy - you might want to wear a jacket!"
```

## Run Prompt with Weather Tool in Latitude SDK

https://raw.githubusercontent.com/latitude-dev/latitude-llm/main/docs/guides/sdk/typescript.mdx

```
await latitude.prompts.run('prompt-path', {
  parameters: {
    query: 'What is the weather in San Francisco?',
  },
  // Define the tools the model can use
  tools: {
    getWeather: async (args, details) => {
      // `args` contains the arguments passed by the model
      // `details` contains context like tool id, name, messages...
      // The result can be anything JSON serializable
      console.log('Getting weather for:', args.location)
      return { temperature: '72°F', conditions: 'Sunny' }
    },
  },
})
```

## shell Result 1

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/assistants/llms/openrouter/README.md

```
python cookbook/llms/openrouter/tool_call.py
```

## Defines getCurrentWeather Tool for Weather Retrieval

https://raw.githubusercontent.com/langwatch/scenario/main/docs/docs/pages/agent-integration.mdx

```
# See OpenAI Message Agents above for Python tool usage (litellm)
```
