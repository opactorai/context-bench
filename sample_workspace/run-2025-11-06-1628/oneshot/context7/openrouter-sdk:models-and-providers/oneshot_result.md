# Oneshot Mode Result

**Scenario**: openrouter-sdk:models-and-providers
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:30:16.577Z

---

## Query

Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/llmstxt/openrouter_ai_llms-full_txt",
  "topic": "Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model."
}
```

---

## Tool Result

### Generate Text with OpenRouter

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Demonstrates how to import the default OpenRouter instance and use it with the `generateText` function from the AI SDK. It shows how to specify a model and provide a prompt.

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openrouter('openai/gpt-4o'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

--------------------------------

### Generate Text with OpenRouter Provider

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Demonstrates how to use the default `openrouter` instance from the SDK to generate text. It specifies a model and a prompt, then awaits the text generation.

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openrouter('openai/gpt-4o'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
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

### TypeScript: Use Multiple Models with OpenRouter

Source: https://context7_llms

Demonstrates how to create and use different AI agents powered by various models available through OpenRouter using the Mastra framework and the AI SDK. It shows instantiating agents for Claude and GPT models and making calls to them.

```typescript
import { Agent } from '@mastra/core/agent';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Create agents using different models
const claudeAgent = new Agent({
  model: openrouter('anthropic/claude-3-opus'),
  name: 'ClaudeAssistant',
  instructions: 'You are a helpful assistant powered by Claude.',
});

const gptAgent = new Agent({
  model: openrouter('openai/gpt-4'),
  name: 'GPTAssistant',
  instructions: 'You are a helpful assistant powered by GPT-4.',
});

// Use different agents based on your needs
const claudeResponse = await claudeAgent.generate([
  {
    role: 'user',
    content: 'Explain quantum mechanics simply.',
  },
]);
console.log(claudeResponse.text);

const gptResponse = await gptAgent.generate([
  {
    role: 'user',
    content: 'Explain quantum mechanics simply.',
  },
]);
console.log(gptResponse.text);
```

--------------------------------

### Configure Model with Extra Body in TypeScript

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

This snippet demonstrates how to configure an AI model using the OpenRouter SDK in TypeScript. It specifically shows how to pass custom parameters, such as reasoning configurations with 'max_tokens', via the 'extraBody' property when creating a model instance. The example also includes a basic 'streamText' call to interact with the configured model.

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

### Configure Model Name in index.ts

Source: https://github.com/OpenRouterTeam/openrouter-examples

This snippet demonstrates how to change the AI model used by configuring the `modelName` variable in your `index.ts` file. It allows you to switch between models from providers like OpenAI, Anthropic, and Google. Refer to the OpenRouter documentation for a full list of available models.

```typescript
const modelName = "google/gemini-pro"; // Example: Change this to your desired model
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

### Generate Text with OpenRouter

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

An example of using the `generateText` function with the `openrouter` provider to generate text based on a prompt. It specifies the model and the prompt content.

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const { text } = await generateText({
 model: openrouter('openai/gpt-4o'),
 prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
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

### Stream Text with OpenRouter and Anthropic Options (TypeScript)

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

This snippet demonstrates how to use the `streamText` function with the OpenRouter provider, including Anthropic-specific options like `cacheControl`. It shows setting up the provider with an API key, selecting a model, and constructing messages with system and user roles, including a user message with provider-specific options.

```TypeScript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({ apiKey: 'your-api-key' });
const model = openrouter('anthropic/<supported-caching-model>');

await streamText({
 model,
 messages: [
 {
 role: 'system',
 content:
 'You are a podcast summary assistant. You are detail-oriented and critical about the content.',
 },
 {
 role: 'user',
 content: [
 {
 type: 'text',
 text: 'Given the text body below:',
 },
 {
 type: 'text',
 text: `<LARGE BODY OF TEXT>`,
 providerOptions: {
 openrouter: {
 cacheControl: { type: 'ephemeral' },
 },
 },
 },
 {
 type: 'text',
 text: 'List the speakers?',
 },
 ],
 },
 ],
});
```

--------------------------------

### Call OpenRouter API with TypeScript

Source: https://context7_llms

This TypeScript example demonstrates integrating OpenRouter with the OpenAI SDK. It sets up the SDK with the base URL and API key, then makes a chat completion request, specifying the model and user identifier.

```TypeScript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '{{API_KEY_REF}}',
});

async function chatWithUserTracking() {
  const response = await openai.chat.completions.create({
    model: '{{MODEL}}',
    messages: [
      {
        role: 'user',
        content: "What's the weather like today?",
      },
    ],
    user: 'user_12345', // Your user identifier
  });

  console.log(response.choices[0].message.content);
}

chatWithUserTracking();
```

--------------------------------

### Pass Extra Body via providerOptions.openrouter in TypeScript

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

This snippet shows how to pass extra body parameters to the OpenRouter AI SDK using the `providerOptions.openrouter` property. It demonstrates configuring the `reasoning.max_tokens` parameter for a specific model.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({ apiKey: 'your-api-key' });
const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
await streamText({
 model,
 messages: [{ role: 'user', content: 'Hello' }],
 providerOptions: {
 openrouter: {
 reasoning: {
 max_tokens: 10,
 },
 },
 },
});
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

### Stream Text with OpenRouter and Extra Body Options

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Illustrates three methods for passing extra body parameters to OpenRouter when streaming text. This includes using `providerOptions.openrouter`, `extraBody` in model settings, and `extraBody` in the model factory.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({ apiKey: 'your-api-key' });
const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
await streamText({
  model,
  messages: [{ role: 'user', content: 'Hello' }],
  providerOptions: {
    openrouter: {
      reasoning: {
        max_tokens: 10,
      },
    },
  },
});
```

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

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: 'your-api-key',
  extraBody: {
    reasoning: {
      max_tokens: 10,
    },
  },
});
const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
await streamText({
  model,
  messages: [{ role: 'user', content: 'Hello' }],
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

### Import OpenRouter Provider Instance

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Demonstrates how to import the default `openrouter` provider instance from the `@openrouter/ai-sdk-provider` package in TypeScript.

```typescript
import { openrouter } from '@openrouter/ai-sdk-provider';
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

### Stream Text with OpenRouter Provider and Extra Body Options (Model Factory)

Source: https://github.com/OpenRouterTeam/ai-sdk-provider

Illustrates streaming text with the OpenRouter provider, configuring extra body parameters at the model factory level. This approach applies the specified options to all models created by that factory instance.

```typescript
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: 'your-api-key',
  extraBody: {
    reasoning: {
      max_tokens: 10,
    },
  },
});
const model = openrouter('anthropic/claude-3.7-sonnet:thinking');
await streamText({
  model,
  messages: [{ role: 'user', content: 'Hello' }],
});
```
