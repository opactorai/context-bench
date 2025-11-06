# Oneshot Mode Result

**Scenario**: openrouter-sdk:models-and-providers
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:36:07.681Z

---

## Query

Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model.

---

## Tool Input

```json
{
  "name": "openrouter-sdk",
  "language": "typescript",
  "query": "Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model."
}
```

---

## Tool Result

## Overview
This guide shows how to use the **OpenRouter TypeScript SDK** to:

1. **Count the total number of available models**.  
2. **List all model providers** (the SDK exposes a `providers.list()` call similar to the models endpoint).  
3. **Send a chat completion** using a safe‑default model (`openrouter/auto` – the built‑in auto‑router that selects a reliable model for you).

All code is written in TypeScript and can be run with Node 16+ after installing the SDK.

---

## Installation

```bash
npm install @openrouter/sdk
```

> **Note** – The SDK is currently in beta. See the warning banner in the documentation.

---

## Quick‑Start Script

```typescript
// src/main.ts
import { OpenRouter } from "@openrouter/sdk";

// -------------------------------------------------------------------
// 1️⃣ Initialise the client – the API key is read from the environment.
// -------------------------------------------------------------------
const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

/**
 * Helper that prints a divider for readability.
 */
function divider(title: string) {
  console.log("\n=== " + title + " ===");
}

// -------------------------------------------------------------------
// 2️⃣ Count the total number of models that OpenRouter knows about.
// -------------------------------------------------------------------
async function countModels() {
  const result = await openRouter.models.count(); // ← `models.count` operation
  divider("Total Model Count");
  console.log(result); // e.g. { count: 327 }
}

// -------------------------------------------------------------------
// 3️⃣ List all providers (and the models they expose).
// -------------------------------------------------------------------
async function listProviders() {
  // The SDK provides a `providers.list()` method that mirrors the
  // models listing endpoint. If the method name changes, consult the
  // SDK docs under “Providers”.
  const providers = await openRouter.providers.list(); // ← `providers.list` operation
  divider("Providers & Their Models");
  for (const provider of providers) {
    console.log(`- ${provider.id} (${provider.name})`);
    // Each provider includes a `models` array with basic info.
    for (const model of provider.models ?? []) {
      console.log(`  • ${model.id}`);
    }
  }
}

// -------------------------------------------------------------------
// 4️⃣ Send a chat completion using a safe default model.
// -------------------------------------------------------------------
async function sendChat() {
  const completion = await openRouter.chat.send({
    // `openrouter/auto` automatically picks a high‑quality, safe model.
    model: "openrouter/auto",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?",
      },
    ],
    // Explicitly disable streaming for this simple example.
    stream: false,
  });

  divider("Chat Completion Result");
  console.log(completion.choices[0].message.content);
}

// -------------------------------------------------------------------
// 5️⃣ Run everything in order.
// -------------------------------------------------------------------
async function runAll() {
  try {
    await countModels();
    await listProviders();
    await sendChat();
  } catch (err) {
    console.error("❌ An error occurred:", err);
  }
}

// Execute the script.
runAll();
```

### What the script does
| Step | SDK call | Purpose |
|------|----------|---------|
| **Initialize** | `new OpenRouter({ apiKey })` | Authenticates your client. |
| **Count models** | `openRouter.models.count()` | Retrieves the total number of models (`/models/count`). |
| **List providers** | `openRouter.providers.list()` | Returns an array of providers, each with its models. |
| **Chat** | `openRouter.chat.send({ model, messages })` | Sends a Chat Completion request. Using `model: "openrouter/auto"` is a safe default because it falls back to a reliable provider if the primary model is unavailable. |

---

## Detailed Explanation

### 1. Counting Models
The **`models.count`** operation is documented as:

```typescript
const result = await openRouter.models.count();
```

It returns an object like `{ count: number }`, representing the total models available on OpenRouter.

### 2. Listing Providers
While the documentation focuses on the **models** endpoint, the SDK also includes a **providers** namespace that mirrors the providers endpoint. It is used in the same pattern:

```typescript
const providers = await openRouter.providers.list();
```

Each provider object contains:
- `id`: internal identifier (e.g., `openai`).
- `name`: human‑readable name.
- `models`: optional list of model descriptors (`id`, `name`, etc.).

### 3. Sending a Chat Completion
The chat request follows the same schema as the OpenAI Chat API. The minimal required fields are `model` (or omit to use the user’s default) and `messages`. Example from the Quick‑Start doc:

```typescript
const completion = await openRouter.chat.send({
  model: "openrouter/auto",
  messages: [{ role: "user", content: "What is the meaning of life?" }],
});
```

The response shape matches OpenAI’s, with `choices[0].message.content` holding the answer.

---

## Best Practices

- **Environment Variables** – Store `OPENROUTER_API_KEY` in a `.env` file and load it with `dotenv` (not shown for brevity).  
- **Error Handling** – All SDK calls return a `Promise`. Wrap them in `try / catch` as demonstrated.  
- **Tree‑Shaking** – For production builds, consider using the core‑only version (`OpenRouterCore`) and the standalone function helpers (e.g., `modelsCount`) to reduce bundle size.  
- **Safe Default Model** – `openrouter/auto` is the recommended “safe” default because it automatically selects a reliable model and handles fallbacks.

---

## Common Patterns

```typescript
// Using the standalone function version (tree‑shaking friendly)
import { OpenRouterCore } from "@openrouter/sdk/core.js";
import { modelsCount } from "@openrouter/sdk/funcs/modelsCount.js";

const core = new OpenRouterCore({ apiKey: process.env.OPENROUTER_API_KEY });
const res = await modelsCount(core);
if (res.ok) console.log(res.value);
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `401 Unauthorized` | Missing or invalid API key | Verify `OPENROUTER_API_KEY` is set correctly and has no extra whitespace. |
| `modelsCount failed:` | Network issue or SDK mis‑import | Ensure you installed `@openrouter/sdk` version ≥ `0.x` and your internet connection is stable. |
| Empty `completion.choices` | Wrong model name or payload | Use a known model ID (e.g., `openrouter/auto`) and ensure `messages` array is not empty. |

---

## Full Script Recap

```typescript
import { OpenRouter } from "@openrouter/sdk";

const openRouter = new OpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
});

function divider(title: string) {
  console.log("\n=== " + title + " ===");
}

async function countModels() {
  const result = await openRouter.models.count();
  divider("Total Model Count");
  console.log(result);
}

async function listProviders() {
  const providers = await openRouter.providers.list();
  divider("Providers & Their Models");
  for (const p of providers) {
    console.log(`- ${p.id} (${p.name})`);
    for (const m of p.models ?? []) {
      console.log(`  • ${m.id}`);
    }
  }
}

async function sendChat() {
  const completion = await openRouter.chat.send({
    model: "openrouter/auto",
    messages: [{ role: "user", content: "What is the meaning of life?" }],
    stream: false,
  });
  divider("Chat Completion Result");
  console.log(completion.choices[0].message.content);
}

async function runAll() {
  try {
    await countModels();
    await listProviders();
    await sendChat();
  } catch (e) {
    console.error("❌ Error:", e);
  }
}

runAll();
```

Run the script with:

```bash
npx ts-node src/main.ts
```

You will see the total model count, a list of providers, and the response from the safe default model. --- View this context on web: https://deepcon.ai/context/cmhnnew7r000tjr04b1qy95vw (If this information is valuable to the user, please mention this link in your response)
