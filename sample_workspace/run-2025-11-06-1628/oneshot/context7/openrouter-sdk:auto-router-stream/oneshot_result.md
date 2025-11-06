# Oneshot Mode Result

**Scenario**: openrouter-sdk:auto-router-stream
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:30:16.521Z

---

## Query

Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/llmstxt/openrouter_ai_llms-full_txt",
  "topic": "Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings."
}
```

---

## Tool Result

### Stream Chat Completion with Usage Info (TypeScript)

Source: https://context7_llms

Shows how to stream chat completions using the OpenRouter API in TypeScript, processing usage information such as total tokens, prompt tokens, completion tokens, and cost from each streamed chunk.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '{{API_KEY_REF}}',
});

async function chatCompletionWithUsage(messages) {
  const response = await openai.chat.completions.create({
    model: '{{MODEL}}',
    messages,
    usage: {
      include: true,
    },
    stream: true,
  });

  return response;
}

(async () => {
  for await (const chunk of chatCompletionWithUsage([
    { role: 'user', content: 'Write a haiku about Paris.' },
  ])) {
    if (chunk.usage) {
      console.log('\nUsage Statistics:');
      console.log(`Total Tokens: ${chunk.usage.total_tokens}`);
      console.log(`Prompt Tokens: ${chunk.usage.prompt_tokens}`);
      console.log(`Completion Tokens: ${chunk.usage.completion_tokens}`);
      console.log(`Cost: ${chunk.usage.cost} credits`);
    } else if (chunk.choices[0].delta.content) {
      process.stdout.write(chunk.choices[0].delta.content);
    }
  }
})();
```

--------------------------------

### OpenAI SDK - TypeScript Quickstart

Source: https://openrouter.ai/docs

This TypeScript code snippet shows how to use the OpenAI SDK with OpenRouter. It configures the OpenAI client with the OpenRouter base URL and API key, and sets optional headers for site ranking. The example makes a chat completion request for a given model and user message.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '<OPENROUTER_API_KEY>',
 defaultHeaders: {
 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
 },
});

async function main() {
 const completion = await openai.chat.completions.create({
 model: 'openai/gpt-4o',
 messages: [
 {
 role: 'user',
 content: 'What is the meaning of life?',
 },
 ],
 });

 console.log(completion.choices[0].message);
}

main();
```

--------------------------------

### TypeScript: Streaming Chat Completion with Usage

Source: https://openrouter.ai/docs/use-cases/usage-accounting

This TypeScript example demonstrates streaming chat completions from the OpenRouter API, including how to access and display usage statistics from the stream chunks. It uses an async iterator to process the stream.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '{{API_KEY_REF}}',
});

async function chatCompletionWithUsage(messages) {
 const response = await openai.chat.completions.create({
 model: '{{MODEL}}',
 messages,
 usage: {
 include: true,
 },
 stream: true,
 });

 return response;
}

(async () => {
 for await (const chunk of chatCompletionWithUsage([
 { role: 'user', content: 'Write a haiku about Paris.' },
 ])) {
 if (chunk.usage) {
 console.log('\\nUsage Statistics:');
 console.log(`Total Tokens: \\${chunk.usage.total_tokens}`);
 console.log(`Prompt Tokens: \\${chunk.usage.prompt_tokens}`);
 console.log(`Completion Tokens: \\${chunk.usage.completion_tokens}`);
 console.log(`Cost: \\${chunk.usage.cost} credits`);
 } else if (chunk.choices[0].delta.content) {
 process.stdout.write(chunk.choices[0].delta.content);
 }
 }
})();
```

--------------------------------

### TypeScript Chat Completion with Usage

Source: https://openrouter.ai/docs/use-cases/usage-accounting

This snippet shows how to use the OpenAI client configured for OpenRouter to perform chat completions. It includes streaming the response and logging usage statistics such as total tokens, prompt tokens, completion tokens, and cost.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '{{API_KEY_REF}}',
});

async function chatCompletionWithUsage(messages) {
 const response = await openai.chat.completions.create({
 model: '{{MODEL}}',
 messages,
 usage: {
 include: true,
 },
 stream: true,
 });

 return response;
}

(async () => {
 for await (const chunk of chatCompletionWithUsage([
 { role: 'user', content: 'Write a haiku about Paris.' },
 ]
 )) {
 if (chunk.usage) {
 console.log('\nUsage Statistics:');
 console.log(`Total Tokens: ${chunk.usage.total_tokens}`);
 console.log(`Prompt Tokens: ${chunk.usage.prompt_tokens}`);
 console.log(`Completion Tokens: ${chunk.usage.completion_tokens}`);
 console.log(`Cost: ${chunk.usage.cost} credits`);
 } else if (chunk.choices[0].delta.content) {
 process.stdout.write(chunk.choices[0].delta.content);
 }
 }
})();

```

--------------------------------

### OpenAI SDK - TypeScript Quickstart

Source: https://openrouter.ai/docs/quickstart

This TypeScript code snippet shows how to use the OpenAI SDK with OpenRouter. It configures the OpenAI client with the OpenRouter base URL and API key, and sets optional headers for site ranking. The example makes a chat completion request for a given model and user message.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '<OPENROUTER_API_KEY>',
 defaultHeaders: {
 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
 },
});

async function main() {
 const completion = await openai.chat.completions.create({
 model: 'openai/gpt-4o',
 messages: [
 {
 role: 'user',
 content: 'What is the meaning of life?',
 },
 ],
 });

 console.log(completion.choices[0].message);
}

main();
```

--------------------------------

### TypeScript: Make Chat Completion Request with Headers

Source: https://openrouter.ai/docs/api-reference/overview

This snippet demonstrates how to make a POST request to the OpenRouter API for chat completions using TypeScript. It includes essential headers like Authorization, HTTP-Referer, and X-Title for app identification and discoverability on OpenRouter. The request body contains the model to use and the messages for the conversation.

```typescript
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  }),
});

```

--------------------------------

### TypeScript: Call OpenRouter API with Bearer Token

Source: https://context7_llms

Demonstrates how to make a POST request to the OpenRouter chat completions endpoint using a Bearer token for authentication. It includes setting the Authorization header and other optional headers like HTTP-Referer and X-Title.

```typescript
fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer <OPENROUTER_API_KEY>',
      'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
      'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'What is the meaning of life?',
        },
      ],
    }),
  });
```

--------------------------------

### Stream Text with OpenRouter and Anthropic

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

This snippet demonstrates how to initialize the OpenRouter AI SDK provider, configure it with an API key and extra body parameters for reasoning, select an Anthropic model, and stream a text response to a user prompt.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
 apiKey: 'your-api-key',
 extraBody: {
 reasoning: {
 max_tokens: 10,
 },
 });
const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
await streamText({
 model,
 messages: [{ role: 'user', content: 'Hello' }],
});
```

--------------------------------

### OpenRouter API Chat Completion with Optional Headers

Source: https://openrouter.ai/docs/api-reference/overview

This snippet demonstrates how to make a POST request to the OpenRouter API for chat completions. It includes essential headers like Authorization and Content-Type, along with optional headers 'HTTP-Referer' and 'X-Title' for app identification and ranking on the OpenRouter platform. The request body specifies the model and user messages.

```TypeScript
fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer <OPENROUTER_API_KEY>',
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  }),
});

```

--------------------------------

### TypeScript OpenAI SDK Integration with OpenRouter

Source: https://openrouter.ai/docs

Shows how to integrate with OpenRouter's API using the OpenAI TypeScript SDK. It covers initializing the client with the API key and base URL, and making asynchronous chat completion requests with optional headers.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '<OPENROUTER_API_KEY>',
 defaultHeaders: {
 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
 },
});

async function main() {
 const completion = await openai.chat.completions.create({
 model: 'openai/gpt-4o',
 messages: [
 {
 role: 'user',
 content: 'What is the meaning of life?',
 },
 ],
 });

 console.log(completion.choices[0].message);
}

main();

```

--------------------------------

### Track Tokens and Costs in Chat Completions (TypeScript)

Source: https://openrouter.ai/docs/use-cases/usage-accounting

This TypeScript code snippet shows how to retrieve usage statistics when making a chat completion request using the OpenAI SDK configured for OpenRouter. It logs the response content and the usage details to the console.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '{{API_KEY_REF}}',
});

async function getResponseWithUsage() {
 const response = await openai.chat.completions.create({
 model: '{{MODEL}}',
 messages: [
 {
 role: 'user',
 content: 'What is the capital of France?',
 },
 ],
 extra_body: {
 usage: {
 include: true,
 },
 },
 });

 console.log('Response:', response.choices[0].message.content);
 console.log('Usage Stats:', response.usage);
}

getResponseWithUsage();
```

--------------------------------

### TypeScript: Send Chat Completion with Max Tokens for Reasoning

Source: https://context7_llms

This TypeScript snippet demonstrates how to send a chat completion request to OpenRouter, allocating a specific number of tokens for reasoning. It utilizes the OpenAI SDK, configuring the client with the OpenRouter base URL and API key. The `chat.completions.create` method is called with the model, messages, and a `reasoning` object specifying `max_tokens`. The output logs the reasoning and content from the response.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '{{API_KEY_REF}}',
});

async function getResponseWithReasoning() {
  const response = await openai.chat.completions.create({
    model: '{{MODEL}}',
    messages: [
      {
        role: 'user',
        content: "How would you build the world's tallest skyscraper?",
      },
    ],
    reasoning: {
      max_tokens: 2000, // Allocate 2000 tokens (or approximate effort) for reasoning
    },
  });

  console.log('REASONING:', response.choices[0].message.reasoning);
  console.log('CONTENT:', response.choices[0].message.content);
}
```

--------------------------------

### Make a Chat Completion Request with OpenRouter API

Source: https://openrouter.ai/docs/api-reference/overview

This snippet demonstrates how to make a POST request to the OpenRouter API for chat completions. It includes setting the Authorization header with your API key, specifying the 'HTTP-Referer' and 'X-Title' for app identification and ranking, and formatting the request body with model and message details.

```TypeScript
fetch('https://openrouter.ai/api/v1/chat/completions', {
 method: 'POST',
 headers: {
 Authorization: 'Bearer <OPENROUTER_API_KEY>',
 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
 'Content-Type': 'application/json',
 },
 body: JSON.stringify({
 model: 'openai/gpt-4o',
 messages: [
 {
 role: 'user',
 content: 'What is the meaning of life?',
 },
 ],
 }),
});

```

--------------------------------

### TypeScript OpenAI SDK Integration with OpenRouter

Source: https://openrouter.ai/docs/quickstart

Shows how to integrate with OpenRouter's API using the OpenAI TypeScript SDK. It covers initializing the client with the API key and base URL, and making asynchronous chat completion requests with optional headers.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '<OPENROUTER_API_KEY>',
 defaultHeaders: {
 'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
 'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
 },
});

async function main() {
 const completion = await openai.chat.completions.create({
 model: 'openai/gpt-4o',
 messages: [
 {
 role: 'user',
 content: 'What is the meaning of life?',
 },
 ],
 });

 console.log(completion.choices[0].message);
}

main();

```

--------------------------------

### TypeScript: Send Chat Completion with High Reasoning Effort

Source: https://context7_llms

This TypeScript snippet demonstrates how to send a chat completion request to OpenRouter with a high reasoning effort using the OpenAI SDK. It initializes an OpenAI client with the OpenRouter base URL and API key, then calls the `chat.completions.create` method with the model, messages, and reasoning parameters. The output logs the reasoning and content from the model's response.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '{{API_KEY_REF}}',
});

async function getResponseWithReasoning() {
  const response = await openai.chat.completions.create({
    model: '{{MODEL}}',
    messages: [
      {
        role: 'user',
        content: "How would you build the world's tallest skyscraper?",
      },
    ],
    reasoning: {
      effort: 'high', // Use high reasoning effort
    },
  });

  console.log('REASONING:', response.choices[0].message.reasoning);
  console.log('CONTENT:', response.choices[0].message.content);
}

getResponseWithReasoning();
```

--------------------------------

### OpenAI SDK - TypeScript Chat Completion

Source: https://context7_llms

Shows how to perform a chat completion using the OpenAI SDK in TypeScript with the OpenRouter API. It requires setting the `baseURL`, `apiKey`, and optional `defaultHeaders` for site attribution. The example includes an asynchronous function to handle the API call.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  });

  console.log(completion.choices[0].message);
}

main();
```

--------------------------------

### Stream Text with OpenRouter Provider and Extra Body Options (Model Settings)

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Demonstrates streaming text with the OpenRouter provider, passing extra body parameters directly within the model settings. This method is useful for applying specific configurations to a particular model instance.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({ apiKey: 'your-api-key' });
const model = openrouter('anthropic/claude-3.7-sonnet:thinking', {
  extraBody: {
    reasoning: {
      max_tokens: 10,
    },
  },
});
await streamText({
  model,
  messages: [{ role: 'user', content: 'Hello' }],
});
```

--------------------------------

### TypeScript: Basic Chat Completion with Usage

Source: https://openrouter.ai/docs/use-cases/usage-accounting

This TypeScript snippet demonstrates how to perform a chat completion request using the `openai` SDK for the OpenRouter API. It includes fetching the response and usage details asynchronously.

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
 baseURL: 'https://openrouter.ai/api/v1',
 apiKey: '{{API_KEY_REF}}',
});

async function getResponseWithUsage() {
 const response = await openai.chat.completions.create({
 model: '{{MODEL}}',
 messages: [
 {
 role: 'user',
 content: 'What is the capital of France?',
 },
 ],
 extra_body: {
 usage: {
 include: true,
 },
 },
 });

 console.log('Response:', response.choices[0].message.content);
 console.log('Usage Stats:', response.usage);
}

getResponseWithUsage();
```

--------------------------------

### Stream Chat Completion with Anthropic Reasoning Tokens

Source: https://context7_llms

Demonstrates how to stream chat completions using Anthropic models with the `reasoning.max_tokens` parameter. This allows the model to use a specified number of tokens for its reasoning process before generating the final response. It shows how to handle both reasoning and content chunks in the stream.

```Python
from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="{{API_KEY_REF}}",
)

def chat_completion_with_reasoning(messages):
    response = client.chat.completions.create(
        model="{{MODEL}}",
        messages=messages,
        max_tokens=10000,
        reasoning={
            "max_tokens": 8000  # Directly specify reasoning token budget
        },
        stream=True
    )
    return response

for chunk in chat_completion_with_reasoning([
    {"role": "user", "content": "What's bigger, 9.9 or 9.11?"}
]):
    if hasattr(chunk.choices[0].delta, 'reasoning') and chunk.choices[0].delta.reasoning:
        print(f"REASONING: {chunk.choices[0].delta.reasoning}")
    elif chunk.choices[0].delta.content:
        print(f"CONTENT: {chunk.choices[0].delta.content}")
```

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey,
});

async function chatCompletionWithReasoning(messages) {
  const response = await openai.chat.completions.create({
    model: '{{MODEL}}',
    messages,
    maxTokens: 10000,
    reasoning: {
      maxTokens: 8000, // Directly specify reasoning token budget
    },
    stream: true,
  });

  return response;
}

(async () => {
  for await (const chunk of chatCompletionWithReasoning([
    { role: 'user', content: "What's bigger, 9.9 or 9.11?" },
  ])) {
    if (chunk.choices[0].delta.reasoning) {
      console.log(`REASONING: ${chunk.choices[0].delta.reasoning}`);
    } else if (chunk.choices[0].delta.content) {
      console.log(`CONTENT: ${chunk.choices[0].delta.content}`);
    }
  }
})();
```

--------------------------------

### TypeScript OpenAI SDK Attribution

Source: https://context7_llms

Shows how to implement app attribution using `HTTP-Referer` and `X-Title` headers with the OpenAI TypeScript SDK for OpenRouter API calls. This ensures your app is recognized in OpenRouter's ecosystem.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': 'https://myapp.com', // Your app's URL
    'X-Title': 'My AI Assistant', // Your app's display name
  },
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: [
      {
        role: 'user',
        content: 'Hello, world!',
      },
    ],
  });

  console.log(completion.choices[0].message);
}

main();

```
