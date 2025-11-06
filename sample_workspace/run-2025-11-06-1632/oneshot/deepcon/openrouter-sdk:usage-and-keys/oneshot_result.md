# Oneshot Mode Result

**Scenario**: openrouter-sdk:usage-and-keys
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: deepcon
**Tool Called**: search_documentation
**Timestamp**: 2025-11-06T16:36:19.975Z

---

## Query

Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch.

---

## Tool Input

```json
{
  "name": "openrouter-sdk",
  "language": "typescript",
  "query": "Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch."
}
```

---

## Tool Result

## Overview
This guide shows how to build a **Node‑CLI** for organization administrators that:

1. **Fetches the last 30 days of user activity** (grouped by endpoint) using the **Analytics API**.
2. **Lists all API keys** in the organization and prints each key’s **label** (and optional name).
3. Provides a short note on how the same data can be prefetched in a React app with **React‑Query hooks** for future SSR use.

All code uses the **OpenRouter TypeScript SDK** (`@openrouter/sdk`). No external libraries are required beyond the SDK itself and Node’s built‑in modules.

---

## Prerequisites
| Requirement | Details |
|------------|---------|
| **Node.js** | v18+ (includes native `fetch`). |
| **OpenRouter API key** | Must have **org‑admin** permissions. Set it in an environment variable `OPENROUTER_API_KEY`. |
| **TypeScript** | Installed globally (`npm i -g typescript`) or via `npm install`. |
| **OpenRouter SDK** | `npm install @openrouter/sdk` (or `yarn add @openrouter/sdk`). |

---

## Installation

```bash
# Create a new folder for the CLI
mkdir openrouter-admin-cli && cd openrouter-admin-cli

# Initialise a TypeScript project
npm init -y
npm i @openrouter/sdk
npm i -D typescript @types/node

# Generate a basic tsconfig
npx tsc --init
```

---

## Project Structure

```
src/
 ├─ cli.ts          # Entry point – parses CLI args & prints results
 ├─ analytics.ts    # Wrapper for the analytics endpoint
 └─ apikeys.ts      # Wrapper for the API‑keys endpoint
```

---

## 1️⃣ Analytics Wrapper (`src/analytics.ts`)

```typescript
// src/analytics.ts
import { OpenRouter } from "@openrouter/sdk";

/**
 * Returns the 30‑day user‑activity summary grouped by endpoint.
 * See the SDK documentation: analytics.getUserActivity().
 */
export async function fetchUserActivity() {
  const client = new OpenRouter({
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  });

  // The SDK method already limits the response to the last 30 completed UTC days.
  const result = await client.analytics.getUserActivity();
  return result; // shape: { data: [{ endpoint: string, count: number, ...}] }
}
```

*The method signature and usage are taken directly from the SDK example*【source】.

---

## 2️⃣ API‑Key Wrapper (`src/apikeys.ts`)

```typescript
// src/apikeys.ts
import { OpenRouter } from "@openrouter/sdk";

/**
 * Retrieves all API keys for the current organization.
 * Returns an array of key objects that contain `label`, `name`, `hash`, etc.
 * See the SDK documentation: apiKeys.list().
 */
export async function fetchApiKeys() {
  const client = new OpenRouter({
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
  });

  const result = await client.apiKeys.list();
  return result; // shape: { data: [{ label: string, name: string, ...}] }
}
```

*The wrapper mirrors the SDK example*【source】.

---

## 3️⃣ CLI Entry Point (`src/cli.ts`)

```typescript
// src/cli.ts
import { fetchUserActivity } from "./analytics.js";
import { fetchApiKeys } from "./apikeys.js";

/**
 * Simple helper to format numbers with commas.
 */
function fmt(num: number) {
  return num.toLocaleString();
}

/**
 * Print analytics grouped by endpoint.
 */
async function printActivity() {
  console.log("\n=== 30‑Day User Activity (by endpoint) ===");
  const resp = await fetchUserActivity();

  // The SDK returns an object whose `data` array contains `{ endpoint, count, ... }`
  // We'll display endpoint & request count.
  resp.data.forEach((item: any) => {
    console.log(`• ${item.endpoint}: ${fmt(item.count)} requests`);
  });
}

/**
 * Print API key labels (and optional human‑readable names).
 */
async function printApiKeys() {
  console.log("\n=== API Keys (labels) ===");
  const resp = await fetchApiKeys();

  resp.data.forEach((key: any) => {
    // `label` is the short masked key, `name` is a friendly label set by the admin.
    console.log(`• ${key.label} (${key.name})`);
  });
}

/**
 * Main entry – runs both sections.
 */
async function main() {
  try {
    await printActivity();
    await printApiKeys();
  } catch (err: any) {
    console.error("❌ Error:", err.message ?? err);
    process.exit(1);
  }
}

// Execute when run directly (`node dist/cli.js`)
if (require.main === module) {
  main();
}
```

### Build & Run

```bash
# Compile TypeScript
npx tsc

# Execute the compiled CLI (ensure the env var is set)
OPENROUTER_API_KEY=sk-or-v1-xxxx node dist/cli.js
```

The output will look similar to:

```
=== 30-Day User Activity (by endpoint) ===
• /chat/completions: 1,842 requests
• /generation: 527 requests
• /embeddings: 213 requests

=== API Keys (labels) ===
• sk-or-v1-abc...123 (Customer Key)
• sk-or-v1-def...456 (Admin Key)
```

---

## 4️⃣ React‑Query Prefetch Note (Future SSR)

If you later build a React dashboard, the same SDK methods expose **React‑Query hooks** that can be used for **server‑side rendering (SSR) prefetch**. The relevant hooks are:

| SDK Method | Query Hook | Prefetch Utility |
|-----------|------------|------------------|
| `analytics.getUserActivity` | `useAnalyticsGetUserActivity` | `prefetchAnalyticsGetUserActivity` |
| `apiKeys.list` | `useApiKeysList` | `prefetchApiKeysList` |

**Typical SSR usage** (e.g., with Next.js `getServerSideProps`):

```tsx
import {
  prefetchAnalyticsGetUserActivity,
  prefetchApiKeysList,
} from "@openrouter/sdk/react-query";

// Inside getServerSideProps
export async function getServerSideProps() {
  const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

  // Prefetch both queries; the results are cached and hydrated on the client.
  await Promise.all([
    prefetchAnalyticsGetUserActivity(client),
    prefetchApiKeysList(client),
  ]);

  return { props: {} };
}
```

On the client side you can then render the data instantly:

```tsx
import {
  useAnalyticsGetUserActivity,
  useApiKeysList,
} from "@openrouter/sdk/react-query";

export default function Dashboard() {
  const { data: activity } = useAnalyticsGetUserActivity();
  const { data: keys } = useApiKeysList();

  /* render activity & keys … */
}
```

*All hook names and utilities are taken from the SDK documentation*【source】.

---

## Best Practices & Tips

- **Error handling** – The SDK throws on network errors; wrap calls in `try/catch` as shown.
- **Pagination** – If an organization has many keys, add query parameters (`include_disabled`, `offset`) to `client.apiKeys.list()` per the OpenAPI spec.  
  ```typescript
  await client.apiKeys.list({ include_disabled: "true", offset: "100" });
  ```
- **Security** – Do **not** commit the API key; keep it in environment variables or a secret manager.
- **Tree‑shaking** – For large apps, consider using the **core** client (`OpenRouterCore`) and the *standalone functions* (`analyticsGetUserActivity`, `apiKeysList`) for smaller bundle size. The patterns are illustrated in the SDK docs, but the CLI example uses the higher‑level `OpenRouter` class for simplicity.

---

## References (SDK Docs)

- **Analytics – `getUserActivity`** – example usage and React hooks【source】.
- **API Keys – `list`** – example usage and React hooks【source】. --- View this context on web: https://deepcon.ai/context/cmhnnf3za0007jy044uahny6x (If this information is valuable to the user, please mention this link in your response)
