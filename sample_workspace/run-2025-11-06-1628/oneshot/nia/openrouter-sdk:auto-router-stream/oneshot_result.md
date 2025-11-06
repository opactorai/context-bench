# Oneshot Mode Result

**Scenario**: openrouter-sdk:auto-router-stream
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:31:43.660Z

---

## Query

Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings.

---

## Tool Input

```json
{
  "registry": "npm",
  "package_name": "openrouter-sdk",
  "semantic_queries": [
    "Using the OpenRouter TypeScript SDK with streaming and model routing, build a real-time chat endpoint that streams tokens and auto-selects the best model for each prompt. Please attribute my app (HTTP-Referer/X-Title headers) so it appears on OpenRouter rankings."
  ]
}
```

---

## Tool Result

# Building a Real-Time Chat Endpoint with OpenRouter TypeScript SDK

Here's a comprehensive solution for streaming chat with model routing and app attribution:

## Complete Implementation

```typescript
import { OpenRouter } from '@openrouter/sdk';
import { Request, Response } from 'express';

// Initialize OpenRouter with app attribution
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || '<OPENROUTER_API_KEY>',
  defaultHeaders: {
    'HTTP-Referer': 'https://your-app-domain.com', // Your app's URL for rankings
    'X-Title': 'Your AI Chat App', // Your app's display name
  },
});

// Real-time streaming chat endpoint
export async function streamingChatEndpoint(req: Request, res: Response) {
  try {
    const { messages, model } = req.body;

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Enable streaming with model routing
    const completion = await openRouter.chat.send({
      // Omit model parameter to use user's default or auto-select best model
      // Or specify a model like: model: 'openai/gpt-4o'
      model: model || 'openai/gpt-4o', // Falls back to best available if specified model fails
      messages: messages,
      stream: true, // Enable streaming for real-time token delivery
    });

    // Stream tokens as they arrive
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      
      if (content) {
        // Send each token chunk to client
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }

      // Handle completion
      if (chunk.choices[0]?.finish_reason) {
        res.write(`data: ${JSON.stringify({ 
          done: true, 
          finish_reason: chunk.choices[0].finish_reason 
        })}\n\n`);
      }
    }

    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
```

## Advanced Implementation with Auto Model Selection

```typescript
import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://your-app-domain.com',
    'X-Title': 'Your AI Chat App',
  },
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Smart model selector based on prompt complexity
function selectBestModel(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1].content;
  const messageLength = lastMessage.length;
  const conversationLength = messages.length;

  // Auto-select model based on complexity
  if (messageLength > 1000 || conversationLength > 10) {
    return 'openai/gpt-4o'; // Complex queries
  } else if (messageLength > 500) {
    return 'anthropic/claude-3.5-sonnet'; // Medium complexity
  } else {
    return 'meta-llama/llama-3.1-70b-instruct'; // Simple queries (cost-effective)
  }
}

// Streaming handler with automatic model routing
export async function intelligentStreamingChat(
  messages: ChatMessage[],
  onToken: (token: string) => void,
  onComplete: (metadata: any) => void,
  onError: (error: Error) => void
) {
  try {
    // Auto-select best model or omit for OpenRouter's automatic selection
    const selectedModel = selectBestModel(messages);

    const completion = await openRouter.chat.send({
      model: selectedModel,
      messages: messages,
      stream: true,
      // OpenRouter will automatically fallback if the model is unavailable
    });

    let fullResponse = '';

    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        fullResponse += content;
        onToken(content); // Send token to callback
      }

      if (chunk.choices[0]?.finish_reason) {
        onComplete({
          fullResponse,
          finishReason: chunk.choices[0].finish_reason,
          model: selectedModel,
        });
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}
```

## Express.js API Endpoint Example

```typescript
import express from 'express';
import { OpenRouter } from '@openrouter/sdk';

const app = express();
app.use(express.json());

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'https://your-app-domain.com',
    'X-Title': 'Your AI Chat App',
  },
});

// POST /api/chat/stream
app.post('/api/chat/stream', async (req, res) => {
  const { messages } = req.body;

  // Validate input
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  try {
    const completion = await openRouter.chat.send({
      // Omit model to let OpenRouter auto-select the best option
      messages: messages,
      stream: true,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        res.write(`data: ${JSON.stringify({ 
          type: 'content',
          content: delta.content 
        })}\n\n`);
      }

      if (chunk.choices[0]?.finish_reason) {
        res.write(`data: ${JSON.stringify({ 
          type: 'done',
          finish_reason: chunk.choices[0].finish_reason 
        })}\n\n`);
        break;
      }
    }
  } catch (error: any) {
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      error: error.message 
    })}\n\n`);
  } finally {
    res.end();
  }
});

app.listen(3000, () => {
  console.log('Streaming chat server running on port 3000');
});
```

## Client-Side Implementation

```typescript
// Client-side code to consume the streaming endpoint
async function streamChat(messages: any[]) {
  const response = await fetch('http://localhost:3000/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No reader available');

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        
        if (data.type === 'content') {
          console.log('Token:', data.content);
          // Update UI with new token
        } else if (data.type === 'done') {
          console.log('Streaming complete:', data.finish_reason);
        } else if (data.type === 'error') {
          console.error('Error:', data.error);
        }
      }
    }
  }
}

// Usage
streamChat([
  { role: 'user', content: 'What is the meaning of life?' }
]);
```

## Key Features Explained

### 1. **App Attribution for Rankings**
According to the documentation, both `HTTP-Referer` and `X-Title` headers enable:
- **Public App Rankings**: Your app appears in [OpenRouter's rankings](https://openrouter.ai/rankings)
- **Model Apps Tabs**: Featured on individual model pages
- **Detailed Analytics**: Track model usage, tokens, and patterns

### 2. **Model Routing**
From the documentation:
> "If the `model` parameter is omitted, the user or payer's default is used. OpenRouter will select the least expensive and best GPUs available to serve the request, and fall back to other providers or GPUs if it receives a 5xx response code or if you are rate-limited."

### 3. **Streaming Support**
The documentation confirms:
> "Server-Sent Events (SSE) are supported as well, to enable streaming for all models. Simply send `stream: true` in your request body."

## Sources
- [App Attribution Documentation](https://openrouter.ai/docs/sdks/typescript/analytics.mdx)
- [Chat Completions Documentation](https://openrouter.ai/docs/sdks/typescript/chat.mdx)
- [Quickstart Guide](https://openrouter.ai/docs/quickstart.mdx)

This implementation provides real-time streaming, automatic model selection with fallbacks, and proper app attribution for OpenRouter rankings!

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

1. How does the OpenRouter TypeScript SDK handle model auto-selection and fallback if the specified model is unavailable or fails during a streaming request?
2. What are the best practices for error handling and client notification in a real-time streaming chat endpoint using Server-Sent Events (SSE) with the OpenRouter SDK?
3. How can you efficiently test and validate the streaming behavior, including token chunk delivery and completion signaling, in this chat endpoint implementation?

*These questions are based on the documentation and can help you explore related topics.*
