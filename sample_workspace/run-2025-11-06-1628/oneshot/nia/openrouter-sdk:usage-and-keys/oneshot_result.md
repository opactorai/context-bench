# Oneshot Mode Result

**Scenario**: openrouter-sdk:usage-and-keys
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:31:45.328Z

---

## Query

Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch.

---

## Tool Input

```json
{
  "registry": "npm",
  "package_name": "openrouter-sdk",
  "semantic_queries": [
    "Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch."
  ]
}
```

---

## Tool Result

# OpenRouter Admin CLI with Analytics & Key Management

Here's a comprehensive CLI tool for organization admins using the OpenRouter TypeScript SDK:

## Installation

```bash
npm install @openrouter/sdk commander chalk
npm install -D @types/node tsx
```

## CLI Implementation

```typescript
// admin-cli.ts
import { OpenRouter } from "@openrouter/sdk";
import { Command } from "commander";
import chalk from "chalk";

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const program = new Command();

program
  .name("openrouter-admin")
  .description("OpenRouter Admin CLI for analytics and key management")
  .version("1.0.0");

// Analytics Command
program
  .command("analytics")
  .description("Get user activity for the last 30 days grouped by endpoint")
  .action(async () => {
    try {
      console.log(chalk.blue("📊 Fetching user activity data...\n"));
      
      const result = await openRouter.analytics.getUserActivity();
      
      console.log(chalk.green("✓ User Activity (Last 30 Days)"));
      console.log(chalk.gray("─".repeat(60)));
      
      if (result && typeof result === 'object') {
        // Display activity data grouped by endpoint
        Object.entries(result).forEach(([endpoint, data]) => {
          console.log(chalk.yellow(`\n📍 Endpoint: ${endpoint}`));
          console.log(JSON.stringify(data, null, 2));
        });
      } else {
        console.log(result);
      }
      
      console.log(chalk.gray("\n" + "─".repeat(60)));
    } catch (error) {
      console.error(chalk.red("❌ Error fetching analytics:"), error);
      process.exit(1);
    }
  });

// List API Keys Command
program
  .command("keys")
  .description("List all API keys with their labels")
  .action(async () => {
    try {
      console.log(chalk.blue("🔑 Fetching API keys...\n"));
      
      const result = await openRouter.apiKeys.list();
      
      console.log(chalk.green("✓ API Keys"));
      console.log(chalk.gray("─".repeat(60)));
      
      if (Array.isArray(result)) {
        result.forEach((key, index) => {
          console.log(chalk.yellow(`\n${index + 1}. Key ID: ${key.id || 'N/A'}`));
          console.log(`   Label: ${chalk.cyan(key.label || key.name || 'Unlabeled')}`);
          console.log(`   Created: ${key.created_at || 'N/A'}`);
          console.log(`   Status: ${key.is_active ? chalk.green('Active') : chalk.red('Inactive')}`);
        });
      } else {
        console.log(result);
      }
      
      console.log(chalk.gray("\n" + "─".repeat(60)));
    } catch (error) {
      console.error(chalk.red("❌ Error fetching API keys:"), error);
      process.exit(1);
    }
  });

// Combined Dashboard Command
program
  .command("dashboard")
  .description("Show complete admin dashboard (analytics + keys)")
  .action(async () => {
    try {
      console.log(chalk.bold.blue("\n🎯 OpenRouter Admin Dashboard\n"));
      
      // Fetch both analytics and keys in parallel
      const [analytics, keys] = await Promise.all([
        openRouter.analytics.getUserActivity(),
        openRouter.apiKeys.list()
      ]);
      
      // Display Analytics
      console.log(chalk.green("📊 User Activity (Last 30 Days)"));
      console.log(chalk.gray("─".repeat(60)));
      if (analytics && typeof analytics === 'object') {
        Object.entries(analytics).forEach(([endpoint, data]) => {
          console.log(chalk.yellow(`\n📍 ${endpoint}`));
          console.log(JSON.stringify(data, null, 2));
        });
      }
      
      // Display API Keys
      console.log(chalk.green("\n\n🔑 API Keys"));
      console.log(chalk.gray("─".repeat(60)));
      if (Array.isArray(keys)) {
        console.log(`Total Keys: ${chalk.bold(keys.length)}\n`);
        keys.forEach((key, index) => {
          console.log(chalk.yellow(`${index + 1}. ${key.label || key.name || 'Unlabeled'}`));
          console.log(`   ID: ${key.id || 'N/A'}`);
          console.log(`   Status: ${key.is_active ? chalk.green('●') : chalk.red('○')}`);
        });
      }
      
      console.log(chalk.gray("\n" + "─".repeat(60)));
    } catch (error) {
      console.error(chalk.red("❌ Error loading dashboard:"), error);
      process.exit(1);
    }
  });

program.parse();
```

## Alternative: Standalone Functions (Better Tree-Shaking)

```typescript
// admin-cli-standalone.ts
import { OpenRouterCore } from "@openrouter/sdk/core.js";
import { analyticsGetUserActivity } from "@openrouter/sdk/funcs/analyticsGetUserActivity.js";
import { apiKeysList } from "@openrouter/sdk/funcs/apiKeysList.js";
import { Command } from "commander";
import chalk from "chalk";

// Use OpenRouterCore for best tree-shaking performance
const openRouter = new OpenRouterCore({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
});

const program = new Command();

program
  .command("dashboard")
  .action(async () => {
    try {
      console.log(chalk.bold.blue("\n🎯 OpenRouter Admin Dashboard\n"));
      
      // Fetch analytics
      const analyticsRes = await analyticsGetUserActivity(openRouter);
      if (analyticsRes.ok) {
        const { value: result } = analyticsRes;
        console.log(chalk.green("📊 User Activity"));
        console.log(result);
      } else {
        console.error(chalk.red("Analytics error:"), analyticsRes.error);
      }
      
      // Fetch API keys
      const keysRes = await apiKeysList(openRouter);
      if (keysRes.ok) {
        const { value: keys } = keysRes;
        console.log(chalk.green("\n🔑 API Keys"));
        console.log(keys);
      } else {
        console.error(chalk.red("Keys error:"), keysRes.error);
      }
    } catch (error) {
      console.error(chalk.red("❌ Error:"), error);
      process.exit(1);
    }
  });

program.parse();
```

## Usage

```bash
# Set your API key
export OPENROUTER_API_KEY="your-api-key"

# Run commands
npx tsx admin-cli.ts analytics
npx tsx admin-cli.ts keys
npx tsx admin-cli.ts dashboard

# Or compile and run
tsc admin-cli.ts
node admin-cli.js dashboard
```

## Package.json Scripts

```json
{
  "scripts": {
    "admin:analytics": "tsx admin-cli.ts analytics",
    "admin:keys": "tsx admin-cli.ts keys",
    "admin:dashboard": "tsx admin-cli.ts dashboard"
  }
}
```

## 📝 Note: React Query Hooks for Future SSR Prefetch

**Source:** [TypeScript SDK Documentation](https://openrouter.ai/docs/sdks/typescript/analytics.mdx)

When you're ready to build a web-based admin dashboard with Server-Side Rendering (SSR), the OpenRouter SDK provides React Query hooks for both analytics and API key management:

### Analytics Hooks

```tsx
import {
  // Query hooks for fetching data
  useAnalyticsGetUserActivity,
  useAnalyticsGetUserActivitySuspense,
  
  // Utility for prefetching during SSR
  prefetchAnalyticsGetUserActivity,
  
  // Cache invalidation utilities
  invalidateAnalyticsGetUserActivity,
  invalidateAllAnalyticsGetUserActivity,
} from "@openrouter/sdk/react-query/analytics";
```

### API Keys Hooks

```tsx
import {
  // Query hooks for fetching data
  useApiKeysList,
  useApiKeysListSuspense,
  
  // Utility for prefetching during SSR
  prefetchApiKeysList,
  
  // Cache invalidation utilities
  invalidateApiKeysList,
  invalidateAllApiKeysList,
} from "@openrouter/sdk/react-query/apiKeys";
```

### SSR Prefetch Example (Next.js App Router)

```tsx
// app/admin/page.tsx
import { prefetchAnalyticsGetUserActivity } from "@openrouter/sdk/react-query/analytics";
import { prefetchApiKeysList } from "@openrouter/sdk/react-query/apiKeys";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const queryClient = new QueryClient();
  
  // Prefetch data during SSR
  await Promise.all([
    prefetchAnalyticsGetUserActivity(queryClient),
    prefetchApiKeysList(queryClient)
  ]);
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboard />
    </HydrationBoundary>
  );
}
```

### Client Component Usage

```tsx
// AdminDashboard.tsx
"use client";

import { useAnalyticsGetUserActivity } from "@openrouter/sdk/react-query/analytics";
import { useApiKeysList } from "@openrouter/sdk/react-query/apiKeys";

export default function AdminDashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsGetUserActivity();
  const { data: keys, isLoading: keysLoading } = useApiKeysList();
  
  if (analyticsLoading || keysLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>User Activity (Last 30 Days)</h2>
      {/* Render analytics */}
      
      <h2>API Keys</h2>
      {/* Render keys */}
    </div>
  );
}
```

**Benefits of React Query Hooks:**
- Automatic caching and deduplication
- SSR/SSG support with prefetching
- Optimistic updates with cache invalidation
- Suspense support for concurrent rendering
- Type-safe throughout

**Reference:** Check the [React Query guide](https://openrouter.ai/docs/REACT_QUERY.md) for complete setup instructions.

---

This CLI provides a production-ready foundation for OpenRouter admin operations with clear paths to scale into a web-based dashboard using the provided React Query hooks.

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

1. How does the OpenRouter TypeScript SDK's getUserActivity method structure its response, and what fields are available for further filtering or aggregation of analytics data?
2. What are the best practices for securely managing and rotating API keys within the CLI, and does the SDK provide built-in methods for key creation, deletion, or permissions management?
3. How could React Query hooks be integrated with the SDK's analytics and key management APIs to enable SSR prefetching, and what patterns should be followed to ensure data consistency between CLI and frontend usage?

*These questions are based on the documentation and can help you explore related topics.*
