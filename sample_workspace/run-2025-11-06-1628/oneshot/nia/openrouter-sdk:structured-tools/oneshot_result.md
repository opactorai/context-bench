# Oneshot Mode Result

**Scenario**: openrouter-sdk:structured-tools
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:31:50.637Z

---

## Query

Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer.

---

## Tool Input

```json
{
  "registry": "npm",
  "package_name": "openrouter-sdk",
  "semantic_queries": [
    "Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer."
  ]
}
```

---

## Tool Result

# Structured Outputs + Tool Calling with OpenRouter TypeScript SDK

Based on the OpenRouter documentation, here's a complete function that combines structured outputs with tool calling:

```typescript
import { OpenRouter } from '@openrouter/sdk';

interface WeatherResponse {
  location: string;
  temperature: number;
  conditions: string;
  timestamp: string;
}

async function getWeatherWithStructuredOutput(
  userQuery: string
): Promise<WeatherResponse> {
  const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || 'YOUR_API_KEY',
  });

  // Define the weather tool
  const weatherTool = {
    type: 'function' as const,
    name: 'getCurrentWeather',
    description: 'Get the current weather in a location',
    strict: null,
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
          description: 'Temperature unit',
        },
      },
      required: ['location'],
    },
  };

  // Define strict JSON schema for final output
  const weatherSchema = {
    type: 'json_schema',
    jsonSchema: {
      name: 'weather_response',
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
          timestamp: {
            type: 'string',
            description: 'ISO 8601 timestamp of the weather data',
          },
        },
        required: ['location', 'temperature', 'conditions', 'timestamp'],
        additionalProperties: false,
      },
    },
  };

  // Mock tool function
  function mockGetCurrentWeather(location: string, unit: string = 'celsius') {
    const mockData: Record<string, { temp: number; conditions: string }> = {
      'san francisco': { temp: 18, conditions: 'Partly cloudy with light fog' },
      'london': { temp: 15, conditions: 'Rainy with occasional showers' },
      'tokyo': { temp: 22, conditions: 'Clear skies and sunny' },
      'paris': { temp: 16, conditions: 'Overcast with light drizzle' },
    };

    const normalizedLocation = location.toLowerCase().split(',')[0].trim();
    const data = mockData[normalizedLocation] || { 
      temp: 20, 
      conditions: 'Mild and partly cloudy' 
    };

    return {
      location: location,
      temperature: unit === 'fahrenheit' ? (data.temp * 9/5) + 32 : data.temp,
      conditions: data.conditions,
      unit: unit,
    };
  }

  // Initial request with tool calling enabled
  const initialResponse = await openRouter.chat.send({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: userQuery,
      },
    ],
    tools: [weatherTool],
    tool_choice: 'auto', // Let model decide if it needs to call the tool
    stream: false,
  });

  const initialMessage = initialResponse.choices[0].message;

  // Check if model wants to call a tool
  if (initialMessage.tool_calls && initialMessage.tool_calls.length > 0) {
    const toolCall = initialMessage.tool_calls[0];
    
    if (toolCall.function.name === 'getCurrentWeather') {
      // Parse tool arguments
      const args = JSON.parse(toolCall.function.arguments);
      
      // Execute mock tool
      const weatherData = mockGetCurrentWeather(args.location, args.unit || 'celsius');
      
      console.log('Tool called with:', args);
      console.log('Mock weather data:', weatherData);

      // Make final request with tool result and structured output
      const finalResponse = await openRouter.chat.send({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: userQuery,
          },
          {
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          },
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(weatherData),
          },
        ],
        responseFormat: weatherSchema, // Force structured output
        stream: false,
      });

      // Parse and return structured response
      const structuredContent = finalResponse.choices[0].message.content;
      return JSON.parse(structuredContent) as WeatherResponse;
    }
  }

  // If no tool call was made, request structured output directly
  const directResponse = await openRouter.chat.send({
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: userQuery,
      },
    ],
    responseFormat: weatherSchema,
    stream: false,
  });

  const structuredContent = directResponse.choices[0].message.content;
  return JSON.parse(structuredContent) as WeatherResponse;
}

// Example usage
async function main() {
  try {
    const result = await getWeatherWithStructuredOutput(
      'What is the weather like in San Francisco?'
    );
    
    console.log('Final structured response:', result);
    console.log('Location:', result.location);
    console.log('Temperature:', result.temperature);
    console.log('Conditions:', result.conditions);
    console.log('Timestamp:', result.timestamp);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Key Features

**Sources:**
- Tool calling implementation: [OpenRouter Tool Calling Docs](https://openrouter.ai/docs/sdks/typescript/oauth.mdx)
- Structured outputs: [OpenRouter Structured Outputs Docs](https://openrouter.ai/docs/features/prompt-caching.mdx)

1. **Tool Definition**: Uses OpenAI function calling format with strict parameter definitions
2. **Tool Choice**: Set to `'auto'` so the model decides when to call the tool
3. **Mock Tool Execution**: Simulates weather API with realistic data
4. **Structured Output**: Enforces strict JSON schema validation on final response
5. **Multi-step Flow**: 
   - Initial request with tools enabled
   - Execute tool if requested
   - Final request with tool results AND structured output enforcement

The function handles both scenarios: when the model calls the tool and when it doesn't, always returning a strictly validated JSON response matching the `WeatherResponse` interface.

## Sources

### Source 1

### Source 2

### Source 3

### Source 4

### Source 5

### Source 6

### Source 7

### Source 8

### Source 9

### Source 10


💡 **Need more details from a source?**

If you need more information from the source links provided above, use the `read_source_content` tool from the available tools provided by Nia to get full context about that particular source.


## 🔍 Suggested Follow-up Questions

1. How does the OpenRouter TypeScript SDK handle validation errors if the model returns JSON that does not conform to the strict weatherSchema, and what mechanisms are available for custom error handling?
2. What are the best practices for mocking the getCurrentWeather tool in unit tests to ensure that the entire structured output and tool-calling workflow can be reliably tested?
3. Are there configuration options or patterns in the OpenRouter SDK to optimize or control whether tool calls are triggered versus returning direct model outputs, especially for ambiguous user inputs?

*These questions are based on the documentation and can help you explore related topics.*
