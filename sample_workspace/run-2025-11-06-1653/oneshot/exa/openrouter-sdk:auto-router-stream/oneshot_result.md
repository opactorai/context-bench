# Oneshot Mode Result

**Scenario**: openrouter-sdk:auto-router-stream
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:57:09.751Z

---

## Query

Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings.

---

## Tool Input

```json
{
  "query": "Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings."
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

## API Streaming | Real-time Model Responses in OpenRouter

https://openrouter.ai/docs/api-reference/streaming

```
1
 import { OpenRouter } from '@openrouter/sdk';
 2
 3
 const openRouter = new OpenRouter({
 4
 apiKey: '{{API_KEY_REF}}',
 5
 });
 6
 7
 async function streamWithErrorHandling(prompt: string) {
 8
 try {
 9
 const stream = await openRouter.chat.send({
 10
 model: '{{MODEL}}',
 11
 messages: [{ role: 'user', content: prompt }],
 12
 stream: true,
 13
 });
 14
 15
 for await (const chunk of stream) {
 16
 // Check for errors in chunk
 17
 if ('error' in chunk) {
 18
 console.error(`Stream error: ${chunk.error.message}`);
 19
 if (chunk.choices?.[0]?.finish_reason === 'error') {
 20
 console.log('Stream terminated due to error');
 21
}
 22
 return;
 23
}
 24
 25
 // Process normal content
 26
 const content = chunk.choices?.[0]?.delta?.content;
 27
 if (content) {
 28
 console.log(content);
 29
}
 30
}
 31
 } catch (error) {
 32
 // Handle pre-stream errors
 33
 console.error(`Error: ${error.message}`);
 34
}
 35
}
```

## Model Routing | Dynamic AI Model Selection and Fallback

https://openrouter.ai/docs/features/model-routing

```
1
 import OpenAI from 'openai';
 2
 3
 const openrouterClient = new OpenAI({
 4
 baseURL: 'https://openrouter.ai/api/v1',
 5
 // API key and headers
 6
 });
 7
 8
 async function main() {
 9
 // @ts-expect-error
 10
 const completion = await openrouterClient.chat.completions.create({
 11
 model: 'openai/gpt-4o',
 12
 models: ['anthropic/claude-3.5-sonnet', 'gryphe/mythomax-l2-13b'],
 13
 messages: [
 14
{
 15
 role: 'user',
 16
 content: 'What is the meaning of life?',
 17
 },
 18
 ],
 19
 });
 20
 console.log(completion.choices[0].message);
 21
}
 22
 23
 main();
```

## Stream Text with OpenRouter using Llama-3.1 Model

https://raw.githubusercontent.com/vercel/ai/main/content/providers/03-community-providers/13-openrouter.mdx

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

## OpenRouter · GitHub

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

## OpenRouterTeam/typescript-sdk

https://github.com/OpenRouterTeam/typescript-sdk

```
cp .env.example .env
```

## Stream OpenAI API Tokens to Postgres with Interrupt Functionality

https://raw.githubusercontent.com/electric-sql/electric/main/website/blog/posts/2025-04-09-building-ai-apps-on-sync.md

```
// Stream tokens from the OpenAI API.
const stream = await openai.chat.completions.create({
  model,
  messages,
  stream: true,
})

// Into Postgres
for await (const event of stream) {
  pg.insert("INSERT INTO tokens value ($1)", [event.message])
}

// Until interrupted
function interrupt() {
  stream.controller.abort()
}
```

## Create OpenAI Chat Object with Streaming Token Function

https://raw.githubusercontent.com/matlab-deep-learning/llms-with-matlab/main/examples/ProcessGeneratedTextinRealTimebyUsingChatGPTinStreamingMode.md

```
chat = openAIChat(StreamFun=@printToken);
```

## Curl Request to OpenAI API for Chat Completions

https://raw.githubusercontent.com/alibaba/higress/main/plugins/wasm-go/extensions/ai-agent/README_EN.md

```
curl 'http://<replace with gateway public IP>/api/openai/v1/chat/completions' \
-H 'Accept: application/json, text/event-stream' \
-H 'Content-Type: application/json' \
--data-raw '{"model":"qwen","frequency_penalty":0,"max_tokens":800,"stream":false,"messages":[{"role":"user","content":"What is the current weather in Beijing ?"}],"presence_penalty":0,"temperature":0,"top_p":0}'
```

## GitHub - OpenRouterTeam/ai-sdk-provider: The OpenRouter provider for the Vercel AI SDK contains support for hundreds of models through the OpenRouter chat and completion APIs.

https://github.com/openrouterteam/ai-sdk-provider

```
// Enable usage accounting
const
model
=
openrouter
(
'openai/gpt-3.5-turbo'
,
{
usage
:{
include
:true
,
}
,
}
)
;
// Access usage accounting data
const
result
=
await
generateText
(
{
model,
prompt
:'Hello, how are you today?'
,
}
)
;
// Provider-specific usage details (available in providerMetadata)
if
(
result
.
providerMetadata
?.
openrouter
?.
usage
)
{
console
.
log
(
'Cost:'
,
result
.
providerMetadata
.
openrouter
.
usage
.
cost
)
;
console
.
log
(
'Total Tokens:'
,
result
.
providerMetadata
.
openrouter
.
usage
.
totalTokens
,
)
;
}
```

## Implement Chat Streaming with Azure AI Inference Client

https://raw.githubusercontent.com/dotnet/extensions/main/src/Libraries/Microsoft.Extensions.AI.AzureAIInference/README.md

```
using Azure;
using Microsoft.Extensions.AI;

IChatClient client =
    new Azure.AI.Inference.ChatCompletionsClient(
        new("https://models.inference.ai.azure.com"),
        new AzureKeyCredential(Environment.GetEnvironmentVariable("GH_TOKEN")!))
    .AsIChatClient("gpt-4o-mini");

await foreach (var update in client.GetStreamingResponseAsync("What is AI?"))
{
    Console.Write(update);
}
```

## Enable Usage Accounting with OpenRouter for GPT-3.5

https://raw.githubusercontent.com/OpenRouterTeam/ai-sdk-provider/main/README.md

```
// Enable usage accounting
const model = openrouter('openai/gpt-3.5-turbo', {
  usage: {
    include: true,
  },
});

// Access usage accounting data
const result = await generateText({
  model,
  prompt: 'Hello, how are you today?',
});

// Provider-specific usage details (available in providerMetadata)
if (result.providerMetadata?.openrouter?.usage) {
  console.log('Cost:', result.providerMetadata.openrouter.usage.cost);
  console.log(
    'Total Tokens:',
    result.providerMetadata.openrouter.usage.totalTokens,
  );
}
```

## Stream Generates Text with lorax Client

https://raw.githubusercontent.com/predibase/lorax/main/docs/getting_started/docker.md

```
from lorax import Client

    client = Client("http://127.0.0.1:8080")
    prompt = "[INST] Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May? [/INST]"

    text = ""
    for response in client.generate_stream(prompt, max_new_tokens=64):
        if not response.token.special:
            text += response.token.text
    print(text)
```

## stream function processes streamed model responses

https://raw.githubusercontent.com/open-webui/docs/main/docs/features/plugin/functions/filter.mdx

```
{"id": "chatcmpl-B4l99MMaP3QLGU5uV7BaBM0eDS0jb","choices": [{"delta": {"content": "Hi"}}]}
{"id": "chatcmpl-B4l99MMaP3QLGU5uV7BaBM0eDS0jb","choices": [{"delta": {"content": "!"}}]}
{"id": "chatcmpl-B4l99MMaP3QLGU5uV7BaBM0eDS0jb","choices": [{"delta": {"content": " 😊"}}]}
```

## GitHub - mmeerrkkaa/openrouter-kit: Powerful & flexible TypeScript SDK for the OpenRouter API. Streamlines building LLM applications with easy chat, adapter-based history, secure tool calling (function calling), cost tracking, and plugin support.

https://github.com/mmeerrkkaa/openrouter-kit

```
{ host, port, user?, pass? }
```

## FastAPI Chat and History Endpoints Implementation

https://raw.githubusercontent.com/openinterpreter/open-interpreter/main/docs/README_JA.md

```
# server.py

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from interpreter import interpreter

app = FastAPI()

@app.get("/chat")
def chat_endpoint(message: str):
    def event_stream():
        for result in interpreter.chat(message, stream=True):
            yield f"data: {result}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/history")
def history_endpoint():
    return interpreter.messages
```

## POST Function for Streaming OpenAI Responses

https://raw.githubusercontent.com/steipete/Peekaboo/main/docs/ai-sdk-full.md

```
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';

// Allow responses up to 5 minutes
export const maxDuration = 300;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('o3-mini'),
    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
```

## Curl Request to OpenRouter with GPT-4o Model

https://raw.githubusercontent.com/kgateway-dev/kgateway/main/design/11177.md

```
curl "localhost:8080/openrouter" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"openai/gpt-4o\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"What is the meaning of life?\"
      }
    ],
    \"temperature\": 0.7,
    \"max_tokens\": 150,
    \"n\": 2,
    \"seed\": 123
  }" | jq
```

## Integrates OpenAI API with Helicone AI Gateway

https://raw.githubusercontent.com/Helicone/ai-gateway/main/README.md

```
from openai import OpenAI
import os

helicone_api_key = os.getenv("HELICONE_API_KEY")

client = OpenAI(
    base_url="http://localhost:8080/router/your-router-name",
    api_key=helicone_api_key
)

# Route to any LLM provider through the same interface, we handle the rest.
response = client.chat.completions.create(
    model="anthropic/claude-3-5-sonnet",  # Or other 100+ models..
    messages=[{"role": "user", "content": "Hello from Helicone AI Gateway!"}]
)
```

## OpenAI Router Configuration for Production and Development

https://raw.githubusercontent.com/Helicone/helicone/main/docs/ai-gateway/concepts/routers.mdx

```
# Production router
curl -X POST http://localhost:8080/router/production/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'

# Development router  
curl -X POST http://localhost:8080/router/development/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "openai/gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## OpenRouter Quickstart Guide

https://openrouter.ai/docs/quickstart

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

## Fetch Chat Completions from OpenRouter API with Headers

https://raw.githubusercontent.com/Helicone/helicone/main/docs/getting-started/integration-method/openrouter.mdx

```
fetch("https://openrouter.helicone.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    "Helicone-Auth": `Bearer ${HELICONE_API_KEY}`,
    "HTTP-Referer": `${YOUR_SITE_URL}`, // Optional, for including your app on openrouter.ai rankings.
    "X-Title": `${YOUR_SITE_NAME}`, // Optional. Shows in rankings on openrouter.ai.
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "openai/gpt-4o-mini", // Optional (user controls the default),
    messages: [{ role: "user", content: "What is the meaning of life?" }],
    stream: true,
  }),
});
```

## Implements Asynchronous Chat API with OpenAI Streaming

https://raw.githubusercontent.com/axflow/axflow/main/docs/guides/models/streaming.md

```
❯ curl -i 'http://localhost:3000/api/chat' --data-raw '{"query":"<query>"}'
HTTP/1.1 200 OK
content-type: application/x-ndjson; charset=utf-8
date: Mon, 04 Sep 2023 23:11:36 GMT
keep-alive: timeout=5
connection: close
transfer-encoding: chunked

{"type":"data","value":<document>}
{"type":"data","value":<document>}
{"type":"chunk","value":"<token>"}
{"type":"chunk","value":" <token>"}
...
{"type":"chunk","value":"."}
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

## Configure useChat Hook with Token Accessor

https://raw.githubusercontent.com/axflow/axflow/main/docs/guides/models/building-client-applications.md

```
useChat({
  accessor: (chunk) => chunk.token,
});
```

## POST API Route for OpenAI Chat Streaming

https://raw.githubusercontent.com/axflow/axflow/main/docs/tutorials/stream-chat-app.md

```
// app/api/chat/route.ts
import { OpenAIChat } from '@axflow/models/openai/chat';
import { StreamingJsonResponse, type MessageType } from '@axflow/models/shared';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await OpenAIChat.streamTokens(
    {
      model: 'gpt-4',
      messages: messages.map((msg: MessageType) => ({ role: msg.role, content: msg.content })),
    },
    {
      apiKey: process.env.OPENAI_API_KEY!,
    }
  );

  return new StreamingJsonResponse(stream);
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

## OpenRouterChatModel Invocation with Claude 3 Opus

https://raw.githubusercontent.com/AIGNE-io/aigne-framework/main/models/open-router/README.md

```
import { OpenRouterChatModel } from "@aigne/open-router";

const model = new OpenRouterChatModel({
  // Provide API key directly or use environment variable OPEN_ROUTER_API_KEY
  apiKey: "your-api-key", // Optional if set in env variables
  // Specify model (defaults to 'openai/gpt-4o')
  model: "anthropic/claude-3-opus",
  modelOptions: {
    temperature: 0.7,
  },
});

const result = await model.invoke({
  messages: [{ role: "user", content: "Which model are you using?" }],
});

console.log(result);
/* Output:
  {
    text: "I'm powered by OpenRouter, using the Claude 3 Opus model from Anthropic.",
    model: "anthropic/claude-3-opus",
    usage: {
      inputTokens: 5,
      outputTokens: 14
    }
  }
  */
```

## Free, Unlimited OpenRouter API

https://developer.puter.com/tutorials/free-unlimited-openrouter-api/

```
OpenRouter Model Explorer
 
 Meta Llama 3.1 (8B)
 Anthropic Claude 3.5 Sonnet
 Mistral 7B
 Google Gemini Pro 1.5
 OpenAI GPT-4o Mini
 
 Explain how solar panels work.
 Generate
 Generating response...
 
 

 
 
 document.getElementById('generate').addEventListener('click', async () => {
 const modelSelect = document.getElementById('model-select');
 const promptInput = document.getElementById('prompt');
 const responseDiv = document.getElementById('response');
 const loadingDiv = document.getElementById('loading');
 
 const selectedModel = modelSelect.value;
 const prompt = promptInput.value;
 
 if (!prompt) return;
 
 responseDiv.innerHTML = '';
 loadingDiv.style.display = 'block';
 
 try {
 const response = await puter.ai.chat(prompt, {model: selectedModel});
 responseDiv.innerHTML = response;
 } catch (error) {
 responseDiv.innerHTML = `Error: ${error.message}`;
 } finally {
 loadingDiv.style.display = 'none';
 }
 });
```

## Express.js Chat Endpoint for OpenAI Model Streaming

https://raw.githubusercontent.com/vercel/ai/main/packages/angular/README.md

```
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText } from 'ai';
import express from 'express';

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { messages, selectedModel } = req.body;

  const result = streamText({
    model: openai(selectedModel || 'gpt-4o'),
    messages: convertToModelMessages(messages),
  });

  result.pipeUIMessageStreamToResponse(res);
});
```
