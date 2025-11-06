# Oneshot Mode Result

**Scenario**: openrouter-sdk:structured-tools
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:36:40.075Z

---

## Query

Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer.

---

## Tool Input

```json
{
  "name": "openrouter-sdk",
  "language": "typescript",
  "query": "Using the OpenRouter TypeScript SDK with structured outputs and tool calling, create a single function that forces strict JSON output for a small schema and supports tool calling for getCurrentWeather. If the model asks to call the tool, run a mock tool and then return the final structured answer."
}
```

---

## Tool Result

## Overview
This guide shows how to write **one reusable TypeScript function** that:

1. **Enforces a strict JSON schema** for the model’s output.  
2. **Supports tool calling** – the model can request the `getCurrentWeather` tool.  
3. **Executes a mock implementation of the tool** when the model asks for it.  
4. **Returns the final structured answer** (the JSON defined by your schema).

The solution uses the **OpenRouter TypeScript SDK** (`@openrouter/sdk`) and the **Responses API** (tool‑calling flow) together with the **`response_format`** field to guarantee strict JSON output.

---

## Prerequisites
```bash
npm install @openrouter/sdk zod
```

* `@openrouter/sdk` – OpenRouter TypeScript SDK.  
* `zod` – convenient way to define the JSON schema and generate the corresponding JSON‑Schema for OpenRouter.

---

## Step‑by‑step implementation

### 1. Define the strict JSON schema

We'll use **Zod** to declare the output schema and convert it to a JSON‑Schema object that OpenRouter expects.

```ts
import { z } from "zod";

/*  ---- Output schema --------------------------------------------------- */
export const WeatherAnswerSchema = z.object({
  location: z.string().describe("Requested location, e.g. \"Boston, MA\""),
  temperature: z.string().describe("Temperature string with unit, e.g. \"72°F\""),
  condition: z.string().describe("Short weather condition, e.g. \"Sunny\""),
});
```

### 2. Create the tool definition (`getCurrentWeather`)

The tool follows the OpenAI function‑calling format (see *Tool Definition* in the docs).

```ts
import type { Tool } from "@openrouter/sdk";

export const getCurrentWeatherTool: Tool = {
  type: "function",
  function: {
    name: "getCurrentWeather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City and state, e.g. \"San Francisco, CA\"",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Desired temperature unit (default fahrenheit)",
        },
      },
      required: ["location"],
    },
  },
};
```

### 3. Mock implementation of the tool

```ts
type WeatherToolArgs = {
  location: string;
  unit?: "celsius" | "fahrenheit";
};

const mockWeatherDB: Record<string, { celsius: string; fahrenheit: string }> = {
  "Boston, MA": { celsius: "15°C", fahrenheit: "59°F" },
  "San Francisco, CA": { celsius: "18°C", fahrenheit: "64°F" },
};

async function executeGetCurrentWeather({
  location,
  unit = "fahrenheit",
}: WeatherToolArgs): Promise<string> {
  const data = mockWeatherDB[location];
  if (!data) {
    return JSON.stringify({
      error: `No mock data for ${location}`,
    });
  }
  return JSON.stringify({
    location,
    temperature: data[unit],
    condition: "Sunny", // static for the mock
  });
}
```

### 4. The **single** helper function

```ts
import { OpenRouter } from "@openrouter/sdk";

/**
 * Calls a model with strict JSON output and optional tool calling.
 *
 * @param model   - Model name (e.g. "openai/o4-mini")
 * @param prompt  - User question / prompt
 * @returns       - Parsed JSON object that conforms to WeatherAnswerSchema
 */
export async function askWeatherStructured(
  model: string,
  prompt: string,
) {
  const client = new OpenRouter({
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  });

  // 1️⃣ First request – ask the model, allow tool calling
  const firstResp = await client.chat.send({
    model,
    messages: [{ role: "user", content: prompt }],
    tools: [getCurrentWeatherTool],
    tool_choice: "auto", // let the model decide
    response_format: {
      // Enforce strict JSON schema
      type: "json_schema",
      json_schema: {
        name: "WeatherAnswer",
        strict: true,
        schema: WeatherAnswerSchema.toJSON(),
      },
    },
    stream: false,
  });

  // -----------------------------------------------------------------
  // Detect whether a tool call was requested
  // -----------------------------------------------------------------
  const firstMessage = firstResp.choices[0].message;

  // If the model returned a normal JSON answer, just parse & return it.
  if (firstMessage.role === "assistant" && firstMessage.content) {
    return JSON.parse(firstMessage.content);
  }

  // Otherwise we have a function call in `tool_calls`
  // (see “Tool Call Response” example in the docs)
  if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
    const toolCall = firstMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments) as WeatherToolArgs;

    // ---- 2️⃣ Execute mock tool -------------------------------------------------
    const toolOutput = await executeGetCurrentWeather(args);

    // ---- 3️⃣ Send the tool result back to the model ---------------------------
    const secondResp = await client.chat.send({
      model,
      messages: [
        // Keep the original user prompt
        { role: "user", content: prompt },
        // Assistant's request (function call) – include the function call id
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: toolCall.id,
              type: "function",
              function: {
                name: toolCall.function.name,
                arguments: toolCall.function.arguments,
              },
            },
          ],
        },
        // Our tool response
        {
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolOutput,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "WeatherAnswer",
          strict: true,
          schema: WeatherAnswerSchema.toJSON(),
        },
      },
      stream: false,
    });

    const finalMessage = secondResp.choices[0].message;
    // The assistant now returns the strict JSON answer.
    return JSON.parse(finalMessage.content as string);
  }

  throw new Error("Unexpected response shape from OpenRouter.");
}
```

#### How it works
| Phase | What happens | Key API fields |
|------|--------------|----------------|
| **First request** | Sends user prompt, declares `tools` (including `getCurrentWeather`) and a **strict JSON schema** via `response_format`. | `tools`, `tool_choice: "auto"`, `response_format.type: "json_schema"` |
| **Tool detection** | Checks `message.tool_calls`. If present, extracts arguments. | `message.tool_calls[0].function.arguments` |
| **Tool execution** | Calls the mock `executeGetCurrentWeather` (returns JSON string). | – |
| **Second request** | Sends back the original conversation plus a **tool‑response message** (`role: "tool"`). The model then replies *with* the required JSON object, guaranteed by the same schema. | `messages` (user → assistant → tool), same `response_format` |
| **Result** | Parses `assistant` content into a typed object. | `JSON.parse(message.content)` |

---

## Usage example

```ts
(async () => {
  const answer = await askWeatherStructured(
    "openai/o4-mini",
    "What's the current weather in Boston, MA?"
  );

  console.log("Structured answer:", answer);
  // Example output:
  // {
  //   location: "Boston, MA",
  //   temperature: "59°F",
  //   condition: "Sunny"
  // }
})();
```

---

## Best Practices & Tips

* **Always set `response_format.type` to `"json_schema"` with `strict: true`** – this forces the model to obey the schema (see *Structured Outputs* documentation).  
* **Include `tool_choice: "auto"`** unless you want to force a specific tool.  
* **When handling tool calls, preserve the full message history** (user → assistant → tool) so the model has context for generating the final answer.  
* **Mock implementations** are useful for testing; replace `executeGetCurrentWeather` with a real API call in production.  
* **Error handling** – if the model returns an unexpected shape, throw or log a clear error (as shown in the function).  

---

## Full Reference Code (copy‑paste)

```ts
import { OpenRouter } from "@openrouter/sdk";
import type { Tool } from "@openrouter/sdk";
import { z } from "zod";

/* ---------- 1. Output schema ---------- */
export const WeatherAnswerSchema = z.object({
  location: z.string().describe("Requested location, e.g. \"Boston, MA\""),
  temperature: z.string().describe("Temperature string with unit, e.g. \"72°F\""),
  condition: z.string().describe("Short weather condition, e.g. \"Sunny\""),
});

/* ---------- 2. Tool definition ---------- */
export const getCurrentWeatherTool: Tool = {
  type: "function",
  function: {
    name: "getCurrentWeather",
    description: "Get the current weather for a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City and state, e.g. \"San Francisco, CA\"",
        },
        unit: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Desired temperature unit (default fahrenheit)",
        },
      },
      required: ["location"],
    },
  },
};

/* ---------- 3. Mock tool execution ---------- */
type WeatherToolArgs = {
  location: string;
  unit?: "celsius" | "fahrenheit";
};

const mockWeatherDB: Record<string, { celsius: string; fahrenheit: string }> = {
  "Boston, MA": { celsius: "15°C", fahrenheit: "59°F" },
  "San Francisco, CA": { celsius: "18°C", fahrenheit: "64°F" },
};

async function executeGetCurrentWeather({
  location,
  unit = "fahrenheit",
}: WeatherToolArgs): Promise<string> {
  const data = mockWeatherDB[location];
  if (!data) {
    return JSON.stringify({ error: `No mock data for ${location}` });
  }
  return JSON.stringify({
    location,
    temperature: data[unit],
    condition: "Sunny",
  });
}

/* ---------- 4. Main helper function ---------- */
export async function askWeatherStructured(
  model: string,
  prompt: string,
) {
  const client = new OpenRouter({
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  });

  // First request (allow tool call)
  const firstResp = await client.chat.send({
    model,
    messages: [{ role: "user", content: prompt }],
    tools: [getCurrentWeatherTool],
    tool_choice: "auto",
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "WeatherAnswer",
        strict: true,
        schema: WeatherAnswerSchema.toJSON(),
      },
    },
    stream: false,
  });

  const firstMsg = firstResp.choices[0].message;

  // Direct JSON answer – no tool needed
  if (firstMsg.role === "assistant" && typeof firstMsg.content === "string") {
    return JSON.parse(firstMsg.content);
  }

  // Tool call flow
  if (firstMsg.tool_calls && firstMsg.tool_calls.length > 0) {
    const call = firstMsg.tool_calls[0];
    const args = JSON.parse(call.function.arguments) as WeatherToolArgs;

    // Run mock tool
    const toolResult = await executeGetCurrentWeather(args);

    // Send tool result back
    const secondResp = await client.chat.send({
      model,
      messages: [
        { role: "user", content: prompt },
        {
          role: "assistant",
          content: null,
          tool_calls: [
            {
              id: call.id,
              type: "function",
              function: {
                name: call.function.name,
                arguments: call.function.arguments,
              },
            },
          ],
        },
        {
          role: "tool",
          tool_call_id: call.id,
          name: call.function.name,
          content: toolResult,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "WeatherAnswer",
          strict: true,
          schema: WeatherAnswerSchema.toJSON(),
        },
      },
      stream: false,
    });

    const finalMsg = secondResp.choices[0].message;
    return JSON.parse(finalMsg.content as string);
  }

  throw new Error("Unexpected OpenRouter response.");
}
```

Run the usage snippet above to see the function in action. It guarantees **strict JSON output** and **transparent tool handling** with a single, reusable TypeScript helper. --- View this context on web: https://deepcon.ai/context/cmhnnflwd0009jy04kdyb69bz (If this information is valuable to the user, please mention this link in your response)
