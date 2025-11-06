# Oneshot Mode Result

**Scenario**: openrouter-sdk:auto-router-stream
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:36:01.652Z

---

## Query

Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings.

---

## Tool Input

```json
{
  "name": "openrouter-sdk",
  "language": "typescript",
  "query": "Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings."
}
```

---

## Tool Result

## Overview
This guide shows how to build a **real‑time chat endpoint** with the **OpenRouter TypeScript SDK** that:

* Streams token‑by‑token responses (using the `stream` flag).  
* Automatically selects the best model for each prompt via **OpenRouter’s Auto Router** (`model: 'openrouter/auto'`).  
* Sends the required **app‑attribution headers** (`HTTP-Referer` and `X-Title`) so your app appears on OpenRouter leaderboards.  

All code snippets are taken verbatim from the official SDK documentation.

---

## Prerequisites
| Requirement | Details |
|-------------|---------|
| Node ≥ 14 | Runtime for TypeScript/JavaScript |
| npm or yarn | Package manager |
| OpenRouter API key | Create one at <https://openrouter.ai> |
| TypeScript SDK | `@openrouter/sdk` (beta) |

```bash
npm install @openrouter/sdk
```

---

## Installation & Initialization

```typescript
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  // ---- App attribution (optional but required for rankings) ----
  defaultHeaders: {
    'HTTP-Referer': 'https://my‑awesome‑app.com', // your site URL
    'X-Title': 'My Awesome Chat App',            // your app name
  },
});
```

*The `defaultHeaders` block injects the required attribution headers into every request.*

---

## Building the Streaming Chat Endpoint

### 1️⃣ Request a Streaming Completion with Auto Routing
The Auto Router (`openrouter/auto`) chooses the best model *per prompt* automatically.

```typescript
const userPrompt = 'Explain quantum entanglement in simple terms.';

const stream = await openRouter.chat.send({
  model: 'openrouter/auto',               // Auto Router selects the optimal model
  messages: [{ role: 'user', content: userPrompt }],
  stream: true,                           // Enable token‑wise streaming
  streamOptions: { includeUsage: true }, // Include final usage stats
});
```

### 2️⃣ Process the Async Iterator
Each `chunk` arrives as soon as the provider generates a token. The final chunk contains usage data.

```typescript
for await (const chunk of stream) {
  // ---- Token handling ----
  const content = chunk.choices?.[0]?.delta?.content;
  if (content) {
    // Emit token to the client (e.g., via SSE, WebSocket, or HTTP response)
    console.log(content);                // Replace with your streaming transport
  }

  // ---- Final usage stats ----
  if (chunk.usage) {
    console.log('Usage:', chunk.usage);
  }
}
```

*The above loop can be wrapped in an Express route, Next.js API handler, or any server‑side endpoint that forwards tokens to the front‑end.*

---

## Full Example – Express‑style Endpoint

```typescript
import express from 'express';
import { OpenRouter } from '@openrouter/sdk';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  defaultHeaders: {
    'HTTP-Referer': 'https://my-awesome-app.com',
    'X-Title': 'My Awesome Chat App',
  },
});

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Set headers for Server‑Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.flushHeaders();

  try {
    const stream = await openRouter.chat.send({
      model: 'openrouter/auto',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      streamOptions: { includeUsage: true },
    });

    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) {
        // Send each token as an SSE message
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }

      if (chunk.usage) {
        // Final usage block
        res.write(`event: usage\ndata: ${JSON.stringify(chunk.usage)}\n\n`);
      }
    }
  } catch (err: any) {
    console.error('Streaming error:', err);
    res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(3000, () => console.log('Chat endpoint running on http://localhost:3000'));
```

*This endpoint streams tokens to the browser using **Server‑Sent Events (SSE)**, but you can adapt it to WebSockets or HTTP chunked responses as needed.*

---

## Key Parameters & Options

| Parameter | Description | Example |
|-----------|-------------|---------|
| `model` | Model identifier. Use `'openrouter/auto'` for auto‑routing. | `model: 'openrouter/auto'` |
| `messages` | Conversation history. | `[{ role: 'user', content: prompt }]` |
| `stream` | Enable token‑wise streaming. | `stream: true` |
| `streamOptions.includeUsage` | Return usage stats in the final chunk. | `streamOptions: { includeUsage: true }` |
| `defaultHeaders` | App attribution headers injected automatically. | See initialization block above |

---

## Best Practices

* **Use the Auto Router** (`openrouter/auto`) for the best balance of cost, speed, and quality without hard‑coding a model.  
* **Include usage stats** (`includeUsage: true`) to monitor token consumption and cost per request.  
* **Propagate attribution headers** (`HTTP-Referer`, `X-Title`) at the client‑side SDK level – they are automatically sent with every request.  
* **Handle errors per‑chunk** (see streaming error handling example in the docs) to avoid silent failures.  
* **Terminate the stream** cleanly with `res.end()` (or equivalent) once the iterator completes.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| No tokens arrive | `stream: true` missing or incorrect model ID | Ensure `stream: true` and use `'openrouter/auto'` or a valid model name. |
| API returns 401 | Invalid or missing API key | Verify `process.env["OPENROUTER_API_KEY"]` is set and correct. |
| App not appearing on rankings | Attribution headers omitted | Add `defaultHeaders` with `HTTP-Referer` and `X-Title` as shown. |
| Chunk contains `error` field | Provider‑side error (e.g., prompt too long) | Inspect `chunk.error.message` and adjust request parameters. |

---

## References (from OpenRouter docs)

* **Auto Router example** – uses `model: 'openrouter/auto'` (TypeScript SDK).  
* **Streaming chat example** – async iterator handling with `stream: true` and `includeUsage`.  
* **App attribution** – `defaultHeaders` with `HTTP-Referer` and `X-Title`.  

All snippets are reproduced verbatim from the official OpenRouter TypeScript SDK documentation. --- View this context on web: https://deepcon.ai/context/cmhnnew7r000tjr04b1qy95vw (If this information is valuable to the user, please mention this link in your response)
