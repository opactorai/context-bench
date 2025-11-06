# Oneshot Mode Result

**Scenario**: openrouter-sdk:models-and-providers
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:57:38.478Z

---

## Query

Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model.

---

## Tool Input

```json
{
  "query": "Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model."
}
```

---

## Tool Result

## OpenRouter TypeScript SDK | Complete Documentation

https://openrouter.ai/docs/sdks/typescript

```
1
 import OpenRouter from '@openrouter/sdk';
 2
 3
 const client = new OpenRouter({
 4
 apiKey: process.env.OPENROUTER_API_KEY
 5
 });
 6
 7
 const response = await client.chat.completions.create({
 8
 model: "minimax/minimax-m2",
 9
 messages: [
 10
 { role: "user", content: "Hello!" }
 11
]
 12
 });
 13
 14
 console.log(response.choices[0].message.content);
```

## OpenRouter Quickstart Guide

https://openrouter.ai/docs/quick-start

```
1
 import OpenAI from 'openai';
 2
 3
 const openai = new OpenAI({
 4
 baseURL: 'https://openrouter.ai/api/v1',
 5
 apiKey: '',
 6
 defaultHeaders: {
 7
 'HTTP-Referer': '', // Optional. Site URL for rankings on openrouter.ai.
 8
 'X-Title': '', // Optional. Site title for rankings on openrouter.ai.
 9
 },
 10
 });
 11
 12
 async function main() {
 13
 const completion = await openai.chat.completions.create({
 14
 model: 'openai/gpt-4o',
 15
 messages: [
 16
{
 17
 role: 'user',
 18
 content: 'What is the meaning of life?',
 19
 },
 20
 ],
 21
 });
 22
 23
 console.log(completion.choices[0].message);
 24
}
 25
 26
 main();
```

## Ember CLI Commands for AI Provider Configuration

https://raw.githubusercontent.com/pyember/ember/main/docs/cli/README.md

```
# Display the version
ember version

# List available providers
ember provider list

# Configure a provider with your API key
ember provider configure openai

# List available models
ember model list

# Invoke a model
ember invoke --model openai:gpt-4o-mini --prompt "Hello, world!"
```

## GitHub - mmeerrkkaa/openrouter-kit: Powerful & flexible TypeScript SDK for the OpenRouter API. Streamlines building LLM applications with easy chat, adapter-based history, secure tool calling (function calling), cost tracking, and plugin support.

https://github.com/mmeerrkkaa/openrouter-kit

```
{ host, port, user?, pass? }
```

## Run Command for Ollama Provider in Droidrun CLI

https://raw.githubusercontent.com/droidrun/droidrun/main/docs/v3/guides/cli.mdx

```
droidrun run \
  --provider Ollama \
  --model qwen2.5vl:3b \
  --base_url http://localhost:11434 \
  "Open the settings app"
```

## Check Available Models via Bytebot and LiteLLM API

https://raw.githubusercontent.com/bytebot-ai/bytebot/main/docs/deployment/litellm.mdx

```
# Check available models through Bytebot API
    curl http://localhost:9991/tasks/models
    
    # Or directly from LiteLLM proxy
    curl http://localhost:4000/model/info
```

## OpenRouterTeam/typescript-sdk

https://github.com/OpenRouterTeam/typescript-sdk

```
cp .env.example .env
```

## Configure Ollama Provider with Custom Endpoint and Models

https://raw.githubusercontent.com/Helicone/helicone/main/docs/ai-gateway/concepts/providers.mdx

```
providers:
      ollama:
        base-url: "http://192.168.1.100:8080"  # Custom host and port
        models:
          - llama3.2
          - deepseek-r1
          - custom-fine-tuned-model
    
    routers:
      development:
        load-balance:
          chat:
            strategy: latency
            providers:
              - ollama
```

## Check Model Connectivity with cURL in Open WebUI

https://raw.githubusercontent.com/open-webui/docs/main/docs/getting-started/advanced-topics/monitoring/index.md

```
# Authenticated model connectivity check
   curl -H "Authorization: Bearer YOUR_API_KEY" https://your-open-webui-instance/api/models
```

## Stream Text with OpenRouter AI SDK

https://raw.githubusercontent.com/steipete/Peekaboo/main/docs/ai-sdk-full.md

```
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: 'YOUR_OPENROUTER_API_KEY',
});

const result = streamText({
  model: openrouter.chat('meta-llama/llama-3.1-405b-instruct'),
  prompt: 'Write a short story about AI.',
});

for await (const chunk of result) {
  console.log(chunk);
}
```

## Configuration for OpenRouter API and Models

https://raw.githubusercontent.com/karakeep-app/karakeep/main/docs/docs/14-Guides/05-different-ai-providers.md

```
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_API_KEY=YOUR_API_KEY

# Example models:
INFERENCE_TEXT_MODEL=meta-llama/llama-4-scout
INFERENCE_IMAGE_MODEL=meta-llama/llama-4-scout
```

## Configure OpenRouterModel with Metrics Callback

https://raw.githubusercontent.com/ruvnet/dspy.ts/main/docs/integrations/openrouter/basic-setup.md

```
const model = new OpenRouterModel({
  metrics: {
    enabled: true,
    callback: (metrics) => {
      console.log('Request:', {
        prompt: metrics.prompt,
        model: metrics.model,
        tokens: metrics.tokens,
        cost: metrics.cost,
        latency: metrics.latency
      });
    }
  }
});
```

## Run Chat Sample with OpenVINO Model Directory

https://raw.githubusercontent.com/openvinotoolkit/openvino.genai/main/samples/cpp/text_generation/README.md

```
./chat_sample <MODEL_DIR>
```

## API Authentication - Secure Access to OpenRouter

https://openrouter.ai/docs/api-reference/authentication

```
1
 import { OpenRouter } from '@openrouter/sdk';
 2
 3
 const openRouter = new OpenRouter({
 4
 apiKey: '',
 5
 defaultHeaders: {
 6
 'HTTP-Referer': '', // Optional. Site URL for rankings on openrouter.ai.
 7
 'X-Title': '', // Optional. Site title for rankings on openrouter.ai.
 8
 },
 9
 });
 10
 11
 const completion = await openRouter.chat.send({
 12
 model: 'openai/gpt-4o',
 13
 messages: [{ role: 'user', content: 'Say this is a test' }],
 14
 stream: false,
 15
 });
 16
 17
 console.log(completion.choices[0].message);
```

## OpenRouter

https://gist.github.com/rbiswasfc/f38ea50e1fa12058645e6077101d55bb

```
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { z } from "zod";

export const getLasagnaRecipe = async (modelName: string) => {
 const openrouter = createOpenRouter({
 apiKey: "",
 });

 const result = await streamText({
 model: openrouter(modelName),
 prompt: "Write a vegetarian lasagna recipe for 4 people.",
 });
 return result.toAIStreamResponse();
};

export const getWeather = async (modelName: string) => {
 const openrouter = createOpenRouter({
 apiKey: "",
 });

 const result = await streamText({
 model: openrouter(modelName),
 prompt: "What is the weather in San Francisco, CA in Fahrenheit?",
 tools: {
 getCurrentWeather: {
 description: "Get the current weather in a given location",
 parameters: z.object({
 location: z
 .string()
 .describe("The city and state, e.g. San Francisco, CA"),
 unit: z.enum(["celsius", "fahrenheit"]).optional(),
 }),
 execute: async ({ location, unit = "celsius" }) => {
 // Mock response for the weather
 const weatherData = {
 "Boston, MA": {
 celsius: "15°C",
 fahrenheit: "59°F",
 },
 "San Francisco, CA": {
 celsius: "18°C",
 fahrenheit: "64°F",
 },
 };

 const weather = weatherData[location];
 if (!weather) {
 return `Weather data for ${location} is not available.`;
 }

 return `The current weather in ${location} is ${weather[unit]}.`;
 },
 },
 },
 });
 return result.toAIStreamResponse();
};
```

## Configure OpenAI and OpenRouter Providers with Custom Retries

https://raw.githubusercontent.com/Royaltyprogram/Crux/main/crux-agent/README.md

```
from app.core.providers.openai import OpenAIProvider
from app.core.providers.openrouter import OpenRouterProvider

# Configure with custom retry count
openai_provider = OpenAIProvider(
    api_key="your-api-key",
    model="gpt-4o-mini",
    max_retries=5  # Increase retries for better resilience
)

openrouter_provider = OpenRouterProvider(
    api_key="your-api-key", 
    model="mistralai/mistral-7b-instruct",
    max_retries=2  # Reduce retries for faster failures
)
```

## Fetches and Displays Available Models from OpenRouter API

https://raw.githubusercontent.com/OlympiaAI/open_router/main/README.md

```
models = client.models
puts models
# => [{"id"=>"openrouter/auto", "object"=>"model", "created"=>1684195200, "owned_by"=>"openrouter", "permission"=>[], "root"=>"openrouter", "parent"=>nil}, ...]
```

## Configure OpenAI Model Providers for Comparison

https://raw.githubusercontent.com/promptfoo/promptfoo/main/site/docs/guides/gpt-vs-o1.md

```
providers:
     - openai:gpt-4.1
     - openai:o1-preview
```

## OpenAI SDK Integration - OpenRouter SDK Support

https://openrouter.ai/docs/community/open-ai-sdk

```
1
 import OpenAI from "openai"
 2
 3
 const openai = new OpenAI({
 4
 baseURL: "https://openrouter.ai/api/v1",
 5
 apiKey: "${API_KEY_REF}",
 6
 defaultHeaders: {
 7
 ${getHeaderLines().join('\n ')}
 8
 },
 9
 })
 10
 11
 async function main() {
 12
 const completion = await openai.chat.completions.create({
 13
 model: "${Model.GPT_4_Omni}",
 14
 messages: [
 15
 { role: "user", content: "Say this is a test" }
 16
 ],
 17
 })
 18
 19
 console.log(completion.choices[0].message)
 20
}
 21
 main();
```

## Integrate with lmdeploy APIClient for Chat Completions

https://raw.githubusercontent.com/InternLM/lmdeploy/main/docs/en/llm/api_server.md

```
from lmdeploy.serve.openai.api_client import APIClient
api_client = APIClient('http://{server_ip}:{server_port}')
model_name = api_client.available_models[0]
messages = [{"role": "user", "content": "Say this is a test!"}]
for item in api_client.chat_completions_v1(model=model_name, messages=messages):
    print(item)
```

## Integrates OpenRouter AI Models with openrouter Function

https://raw.githubusercontent.com/daydreamsai/daydreams/main/docs/content/docs/core/providers/ai-sdk.mdx

```
// Install: npm install @openrouter/ai-sdk-provider
import { openrouter } from "@openrouter/ai-sdk-provider";

model: openrouter("anthropic/claude-3-opus");
model: openrouter("google/gemini-pro");
model: openrouter("meta-llama/llama-3-70b");
// And 100+ more models!
```

## Initialize OpenRouterChatModel with API Key and Model

https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/docs/how-to-guides/available-chat-models.md

```
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  model: "openai/gpt-4o",
});
```

## How to Use OpenRouter with TypeScript: A Step-by- ...

https://medium.com/@vishal.gupta_14050/how-to-use-openrouter-with-typescript-a-step-by-step-guide-to-query-free-public-models-27c91bb50395

```
npx tsx index.ts
```

## Stream Responses from OpenRouterChatModel with Claude 3 Opus

https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/models/open-router/README.md

```
import { isAgentResponseDelta } from "@aigne/core";
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  apiKey: "your-api-key",
  model: "anthropic/claude-3-opus",
});

const stream = await model.invoke(
  {
    messages: [{ role: "user", content: "Which model are you using?" }],
  },
  { streaming: true },
);

let fullText = "";
const json = {};

for await (const chunk of stream) {
  if (isAgentResponseDelta(chunk)) {
    const text = chunk.delta.text?.text;
    if (text) fullText += text;
    if (chunk.delta.json) Object.assign(json, chunk.delta.json);
  }
}

console.log(fullText); // Output: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic."
console.log(json); // { model: "anthropic/claude-3-opus", usage: { inputTokens: 5, outputTokens: 14 } }
```

## Create Chat Completion with TokenJS and OpenRouter

https://raw.githubusercontent.com/token-js/token.js/main/docs/providers/openrouter.md

```
import { TokenJS } from 'token.js'

// Create the Token.js client
const tokenjs = new TokenJS()

async function main() {
  // Create a model response
  const completion = await tokenjs.chat.completions.create({
    // Specify the provider and model
    provider: 'openrouter',
    model: 'nvidia/nemotron-4-340b-instruct',
    // Define your message
    messages: [
      {
        role: 'user',
        content: 'Hello!',
      },
    ],
  })
  console.log(completion.choices[0])
}
main()
```

## Connects to OpenRouter API and Streams Chat Responses

https://raw.githubusercontent.com/lofcz/LlmTornado/main/src/LlmTornado.Docs/website/docs/chat/models.md

```
// Connect to OpenRouter with API key
var api = new TornadoApi("your-openrouter-api-key", LLmProviders.OpenRouter);

// Create conversation with any model from OpenRouter
var conversation = api.Chat.CreateConversation(new ChatRequest
{
    Model = ChatModel.OpenRouter.All.Llama38bInstruct
});

// Stream response to console
await foreach (var chunk in conversation.StreamResponse())
{
    Console.Write(chunk.Content);
}
```

## Effect AI SDK Integration - OpenRouter SDK Support

https://openrouter.ai/docs/community/effect-ai-sdk

```
1
 import { LanguageModel } from "@effect/ai"
 2
 import { OpenRouterClient, OpenRouterLanguageModel } from "@effect/ai-openrouter"
 3
 import { FetchHttpClient } from "@effect/platform"
 4
 import { Config, Effect, Layer, Stream } from "effect"
 5
 6
 const Gpt4o = OpenRouterLanguageModel.model("openai/gpt-4o")
 7
 8
 const program = LanguageModel.streamText({
 9
 prompt: [
 10
 { role: "system", content: "You are a comedian with a penchant for groan-inducing puns" },
 11
 { role: "user", content: [{ type: "text", text: "Tell me a dad joke" }] }
 12
]
 13
 }).pipe(
 14
 Stream.filter((part) => part.type === "text-delta"),
 15
 Stream.runForEach((part) => Effect.sync(() => process.stdout.write(part.delta))),
 16
 Effect.provide(Gpt4o)
 17
)
 18
 19
 const OpenRouter = OpenRouterClient.layerConfig({
 20
 apiKey: Config.redacted("OPENROUTER_API_KEY")
 21
 }).pipe(Layer.provide(FetchHttpClient.layer))
 22
 23
 program.pipe(
 24
 Effect.provide(OpenRouter),
 25
 Effect.runPromise
 26
)
```

## Initialize LLMClient and Create Chat Completion

https://raw.githubusercontent.com/bytedance/UI-TARS-desktop/main/multimodal/tarko/llm/README.md

```
import { LLMClient } from '@agent-infra/llm';

const client = new LLMClient('openrouter', {
  apiKey: '',
  baseUrl: '',
});

const result = await client.chat.completions.create({
  messages: [{ role: 'user', content: 'Say this is a test' }],
  model: 'openai/gpt-4o',
});
```

## cURL Request to OpenAI GPT-4o Mini Model

https://raw.githubusercontent.com/Helicone/helicone/main/docs/ai-gateway/self-hosted/deployment/docker.mdx

```
curl http://localhost:8080/router/production/chat/completions \
      -H "Content-Type: application/json" \
      -d '{
        "model": "openai/gpt-4o-mini",
        "messages": [
          { "role": "user", "content": "Hello from my custom router!" }
        ]
      }'
```

## Configure OpenRouterModel for High-Performance Routing

https://raw.githubusercontent.com/ruvnet/dspy.ts/main/docs/integrations/openrouter/README.md

```
const model = new OpenRouterModel({
  routingStrategy: 'performance',
  maxLatency: 1000,  // ms
  models: {
    fast: ['openai/gpt-3.5-turbo'],
    powerful: ['openai/gpt-4']
  }
});
```

## Installation Instructions for @openrouter/ai-sdk-provider

https://raw.githubusercontent.com/OpenRouterTeam/ai-sdk-provider/main/README.md

```
# For pnpm
pnpm add @openrouter/ai-sdk-provider

# For npm
npm install @openrouter/ai-sdk-provider

# For yarn
yarn add @openrouter/ai-sdk-provider
```

## Generate Text with OpenRouter using Claude 3.5

https://raw.githubusercontent.com/vercel/ai/main/content/providers/03-community-providers/13-openrouter.mdx

```
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';

const openrouter = createOpenRouter({
  apiKey: 'YOUR_OPENROUTER_API_KEY',
});

const { text } = await generateText({
  model: openrouter.chat('anthropic/claude-3.5-sonnet'),
  prompt: 'What is OpenRouter?',
});

console.log(text);
```

## Create and Send ChatCompletionRequest with OpenRouterClient

https://raw.githubusercontent.com/WilliamAvHolmberg/glenn-explore/main/api/Source/Features/OpenRouter/Tools/README.md

```
// Create a request with messages
var request = new ChatCompletionRequest
{
    Model = "openai/gpt-4o",
    Messages = new[]
    {
        Message.FromSystem("You have access to tools. Use them when helpful."),
        Message.FromUser("What's the weather like in San Francisco?")
    }
};

// Execute the request with automatic tool handling
var response = await client.SendMessageWithToolLoopAsync(request);

// Return the response to the user
Console.WriteLine(response.Choices[0].Message.Content);
```

## Setup OpenRouter API Key and Model for Supabase Functions

https://raw.githubusercontent.com/agenticsorg/edge-agents/main/docs/tutorials/02-basic-agentic-function.md

```
OPENROUTER_API_KEY=your-openrouter-api-key
MODEL=openai/gpt-3.5-turbo
```

## openrouter_create_chat_completion_stream Function

https://raw.githubusercontent.com/Klavis-AI/klavis/main/mcp_servers/openrouter/README.md

```
{
  "name": "openrouter_create_chat_completion_stream",
  "arguments": {
    "model": "anthropic/claude-3-opus",
    "messages": [
      {
        "role": "user",
        "content": "Write a short story about a robot."
      }
    ],
    "max_tokens": 500,
    "temperature": 0.8
  }
}
```

## OpenRouter API Reference - Complete Documentation

https://openrouter.ai/docs/api-reference/overview

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

## Custom OpenRouterClient Configuration and Prompt Testing

https://raw.githubusercontent.com/ruvnet/SynthLang/main/docs/openrouter.md

```
// Custom configuration
const client = new OpenRouterClient({
  apiKey: 'your-api-key',
  timeout: 60000,
  retryAttempts: 5,
  defaultModel: OpenRouterModel.GPT4,
});

// Advanced prompt testing
const result = await client.testPrompt(
  {
    messages: [
      {
        role: 'system',
        content: 'You are a SynthLang translation expert',
      },
      {
        role: 'user',
        content: 'Translate this prompt to SynthLang format',
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  },
  OpenRouterModel.GPT4
);
```

## OpenRouter Client for Chat Completion with Toppy Model

https://raw.githubusercontent.com/dsdanielpark/Gemini-API/main/documents/README_OPENROUTER.md

```
from gemini import OpenRouter

api_key = "<your_api_key>"
toppy_client = OpenRouter(api_key=api_key, model="undi95/toppy-m-7b:free")

prompt = "Give me infomation of Seoul, Korea."
response = toppy_client.create_chat_completion(prompt)
print(response)
```
