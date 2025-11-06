// usage-and-keys.ts
import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

// 1) Usage analytics (last 30 UTC days, grouped by endpoint)
const usage = await client.analytics.getUserActivity();
console.log('== User Activity (last 30 days) ==');
for (const row of usage.data) {
  console.log(`${row.endpoint}: total_requests=${row.total_requests}, success=${row.success}, error=${row.error}`);
}

// 2) API key inventory
const keys = await client.apiKeys.list();
console.log('\n== API Keys ==');
for (const k of keys.data) {
  console.log(`• ${k.name}  (hash: ${k.hash.slice(0,12)}...)  enabled=${k.enabled}`);
}

// FYI: In React apps, you can prefetch with SDK-provided hooks:
// import { prefetchAnalyticsGetUserActivity } from '@openrouter/sdk/react-query/analyticsGetUserActivity.js';
// import { prefetchApiKeysList } from '@openrouter/sdk/react-query/apiKeysList.js';
// See the SDK's REACT_QUERY.md for usage details.
