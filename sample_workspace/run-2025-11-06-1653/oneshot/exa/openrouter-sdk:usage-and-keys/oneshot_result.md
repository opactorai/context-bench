# Oneshot Mode Result

**Scenario**: openrouter-sdk:usage-and-keys
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: exa
**Tool Called**: get_code_context_exa
**Timestamp**: 2025-11-06T16:58:05.272Z

---

## Query

Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch.

---

## Tool Input

```json
{
  "query": "Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch."
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

## List API Keys with litellm-proxy CLI

https://raw.githubusercontent.com/BerriAI/litellm/main/litellm/proxy/client/cli/README.md

```
litellm-proxy keys list [--format table|json] [options]
```

## Provisioning API Keys - Programmatic Control of OpenRouter API Keys

https://openrouter.ai/docs/features/provisioning-api-keys

```
1
{
 2
 "data": [
 3
{
 4
 "created_at": "2025-02-19T20:52:27.363244+00:00",
 5
 "updated_at": "2025-02-19T21:24:11.708154+00:00",
 6
 "hash": "",
 7
 "label": "sk-or-v1-abc...123",
 8
 "name": "Customer Key",
 9
 "disabled": false,
 10
 "limit": 10,
 11
 "limit_remaining": 10,
 12
 "limit_reset": null,
 13
 "include_byok_in_limit": false,
 14
 "usage": 0,
 15
 "usage_daily": 0,
 16
 "usage_weekly": 0,
 17
 "usage_monthly": 0,
 18
 "byok_usage": 0,
 19
 "byok_usage_daily": 0,
 20
 "byok_usage_weekly": 0,
 21
 "byok_usage_monthly": 0
 22
}
 23
]
 24
}
```

## Constructs API Query for User Analytics Dashboard

https://raw.githubusercontent.com/unkeyed/unkey/main/apps/engineering/content/docs/rfcs/0005-analytics-api.mdx

```
?start={timestamp_30_days_ago}&end={timestamp_now}&granularity=day&groupBy=identity&limit=10&orderBy=total&order=desc
```

## GET /admin/analytics Endpoint with JWT Authorization

https://raw.githubusercontent.com/ProjWildBerry/wildberry/main/front-end/API.md

```
GET /admin/analytics/*
Authorization: Bearer <jwt_token>
```

## OpenRouterTeam/typescript-sdk

https://github.com/OpenRouterTeam/typescript-sdk

```
cp .env.example .env
```

## GitHub - mmeerrkkaa/openrouter-kit: Powerful & flexible TypeScript SDK for the OpenRouter API. Streamlines building LLM applications with easy chat, adapter-based history, secure tool calling (function calling), cost tracking, and plugin support.

https://github.com/mmeerrkkaa/openrouter-kit

```
{ host, port, user?, pass? }
```

## Defines Acorn API Resource Endpoints for Security Considerations

https://raw.githubusercontent.com/acorn-io/runtime/main/docs/versioned_docs/version-0.8/60-architecture/02-security-considerations.md

```
"apps"
"apps/log"
"builders"
"builders/port"
"builders/registryport"
"images"
"images/tag"
"images/push"
"images/pull"
"images/details"
"volumes"
"containerreplicas"
"containerreplicas/exec"
"credentials"
"secrets"
"secrets/reveal"
"infos"
```

## GET Usage Daily Analytics from Microsoft Dev Center

https://raw.githubusercontent.com/MicrosoftDocs/windows-dev-docs/main/uwp/monetize/get-app-usage-daily.md

```
GET https://manage.devcenter.microsoft.com/v1.0/my/analytics/usagedaily?applicationId=9NBLGGGZ5QDR&startDate=06/19/2022&endDate=07/20/2022&top=10&skip=0&groupby=applicationName,subscriptionName,deviceType,packageVersion,market,date

HTTP/1.1
Authorization: Bearer <your access token>
```

## fetchUserEvents and fetchAnalytics functions using mooseClient

https://raw.githubusercontent.com/514-labs/moosestack/main/apps/framework-docs/src/pages/moose/apis/openapi-sdk.mdx

```
import { mooseClient } from "../lib/moose-client";

// Type-safe API calls with full IntelliSense
const fetchUserEvents = async () => {
  const response = await mooseClient.ingestUserEventsPost({
    id: "event1",
    userId: "user1", 
    timestamp: new Date().toISOString(),
    action: "page_view"
  });
  
  return response;
};

// Analytics API with query parameters
const fetchAnalytics = async () => {
  const response = await mooseClient.consumptionUserEventsGet({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    limit: 100
  });
  
  return response;
};
```

## OpenRouter Quickstart Guide

https://openrouter.docs.buildwithfern.com/docs/quickstart

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

## Defines Acorn API Resource Endpoints for Apps and Images

https://raw.githubusercontent.com/acorn-io/runtime/main/docs/versioned_docs/version-0.4/60-architecture/02-security-considerations.md

```
"apps"
"apps/log"
"builders"
"builders/port"
"builders/registryport"
"images"
"images/tag"
"images/push"
"images/pull"
"images/details"
"volumes"
"containerreplicas"
"containerreplicas/exec"
"credentials"
"secrets"
"secrets/expose"
"infos"
```

## fetchUsageSummary Function for Admin Analytics

https://raw.githubusercontent.com/FireBird-Technologies/Auto-Analyst/main/auto-analyst-frontend/docs/communication/api-integration.md

```
// lib/api/analytics.ts
export async function fetchUsageSummary(
  adminKey: string,
  startDate?: string,
  endDate?: string
) {
  let url = `${API_BASE_URL}/analytics/usage/summary`;
  
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': adminKey,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Error fetching usage summary: ${response.statusText}`);
  }
  
  return response.json();
}
```

## kotlin Result 1

https://raw.githubusercontent.com/NoWakeLock/NoWakeLock/main/docs/fr/developers/architecture/database.md

```
// Utiliser vues pour simplifier requêtes complexes
@DatabaseView("""
    SELECT 
        a.packageName,
        a.userId,
        a.label,
        a.system,
        COUNT(e.instanceId) as eventCount,
        MAX(e.startTime) as lastActivity,
        SUM(CASE WHEN e.isBlocked THEN 1 ELSE 0 END) as blockedCount
    FROM appInfo a
    LEFT JOIN info_event e ON a.packageName = e.packageName AND a.userId = e.userId
    WHERE e.startTime >= :startTime OR e.startTime IS NULL
    GROUP BY a.packageName, a.userId
""")
data class AppSummaryView(
    val packageName: String,
    val userId: Int,
    val label: String,
    val system: Boolean,
    val eventCount: Int,
    val lastActivity: Long?,
    val blockedCount: Int
)

// Optimisation requête paginée
@Query("""
    SELECT * FROM info_event 
    WHERE packageName = :packageName 
    ORDER BY startTime DESC 
    LIMIT :pageSize OFFSET :offset
""")
suspend fun getEventsPaged(
    packageName: String, 
    pageSize: Int, 
    offset: Int
): List<InfoEvent>

// Données statistiques précalculées
@Entity(tableName = "event_statistics_cache")
data class EventStatisticsCache(
    @PrimaryKey val key: String, // packageName_userId_type_date
    val packageName: String,
    val userId: Int,
    val type: InfoEvent.Type,
    val date: String, // yyyy-MM-dd
    val eventCount: Int,
    val blockedCount: Int,
    val totalDuration: Long,
    val avgDuration: Long,
    val maxDuration: Long,
    val lastUpdated: Long
)
```

## Retrieve Daily User Activity via API Call

https://raw.githubusercontent.com/BerriAI/litellm/main/docs/my-website/docs/proxy/cost_tracking.md

```
curl -L -X GET 'http://localhost:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27' \
-H 'Authorization: Bearer sk-...'
```

## Configures API Rate Limiting with UserResourceLimits

https://raw.githubusercontent.com/artisansdk/ratelimiter/main/readme.md

```
use App\Http\UserResourceLimits;

Route::middleware('throttle:'.UserResourceLimits::class)
    ->prefix('api/user')
    ->group(function($router){
        $router->get('/', 'UserApi@index');
        $router->get('{id}', 'UserApi@show');
    });

Route::get('/dashboard', 'Dashboard@index');
```

## List and Use API Keys in React Components

https://raw.githubusercontent.com/stack-auth/stack-auth/main/docs/templates/concepts/api-keys.mdx

```
// List user's API keys
    const userApiKeys = await user.listApiKeys();
    
    // List a team's API keys
    const team = await user.getTeam("team-id-here");
    const teamApiKeys = await team.listApiKeys();
    
    // Using hooks in React components
    const apiKeys = user.useApiKeys();
    const teamApiKeys = team.useApiKeys();
```

## HTTP Rate Limiting with Envoy Proxy Responses

https://raw.githubusercontent.com/envoyproxy/gateway/main/site/content/en/v0.5/user/rate-limit.md

```
HTTP/1.1 200 OK
content-type: application/json
x-content-type-options: nosniff
date: Wed, 08 Feb 2023 02:33:31 GMT
content-length: 460
x-envoy-upstream-service-time: 4
server: envoy

HTTP/1.1 200 OK
content-type: application/json
x-content-type-options: nosniff
date: Wed, 08 Feb 2023 02:33:32 GMT
content-length: 460
x-envoy-upstream-service-time: 2
server: envoy

HTTP/1.1 200 OK
content-type: application/json
x-content-type-options: nosniff
date: Wed, 08 Feb 2023 02:33:33 GMT
content-length: 460
x-envoy-upstream-service-time: 0
server: envoy

HTTP/1.1 429 Too Many Requests
x-envoy-ratelimited: true
date: Wed, 08 Feb 2023 02:33:34 GMT
server: envoy
transfer-encoding: chunked
```

## Manage API Keys with open-responses key Command

https://raw.githubusercontent.com/julep-ai/julep/main/documentation/responses/cli.mdx

```
open-responses key <action>
```

## sh Result 1

https://raw.githubusercontent.com/pnp/cli-microsoft365/main/docs/docs/cmd/skype/report/report-activityusercounts.mdx

```
m365 skype report activityusercounts [options]
```

## How to Use OpenRouter with TypeScript: A Step-by-Step Guide to Query Free Public Models

https://medium.com/@vishal.gupta_14050/how-to-use-openrouter-with-typescript-a-step-by-step-guide-to-query-free-public-models-27c91bb50395

```
npx tsx index.ts
```

## Retrieve API Keys with sdk.admin.apiKey.list()

https://raw.githubusercontent.com/medusajs/medusa/main/www/apps/resources/references/js_sdk/admin/Admin/properties/js_sdk.admin.Admin.apiKey/page.mdx

```
sdk.admin.apiKey.list()
.then(({ api_keys, count, limit, offset }) => {
  console.log(api_keys)
})
```

## GET Daily Activity API Call for User Metrics

https://raw.githubusercontent.com/BerriAI/litellm/main/docs/my-website/release_notes/v1.65.0-stable/index.md

```
curl -L -X GET 'http://localhost:4000/user/daily/activity?start_date=2025-03-20&end_date=2025-03-27' \
    -H 'Authorization: Bearer sk-...'
```

## Fetch Monthly Verification Analytics with cURL

https://raw.githubusercontent.com/unkeyed/unkey/main/apps/docs/analytics/quickstarts.mdx

```
curl 'https://api.unkey.dev/v1/analytics.getVerifications?start=1734168087000&end=1736760087000&externalId=user_123&groupBy=month&apiId=api_123' \
 -H 'Authorization: Bearer unkey_XXX'
```

## Fetches User Verification Analytics from Unkey API

https://raw.githubusercontent.com/unkeyed/unkey/main/apps/docs/analytics/overview.mdx

```
curl 'https://api.unkey.dev/v1/analytics.getVerifications?start=1733749385000&end=1736431397000&apiId=api_262b3iR7gkmP7aUyZ24uihcijsCe&groupBy=identity&orderBy=total&order=desc&limit=5' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <UNKEY_ROOT_KEY>'
```

## Vibekit CLI Analytics Commands for Agent Monitoring

https://raw.githubusercontent.com/superagent-ai/vibekit/main/docs/cli/observability.mdx

```
# View analytics summary (default: 7 days)
vibekit analytics

# View analytics for specific agent
vibekit analytics --agent claude

# View analytics for custom time period
vibekit analytics --days 30

# Export analytics to JSON
vibekit analytics --export analytics.json
```

## List API Keys with yarn create-api-key -l

https://raw.githubusercontent.com/magda-io/magda/main/docs/docs/how-to-create-api-key.md

```
yarn create-api-key -l
```

## Configures OpenRouter API Key for LLM Utility

https://raw.githubusercontent.com/simonw/llm-openrouter/main/README.md

```
Enter key: <paste key here>
```

## Environment Configuration for OpenRouter API Integration

https://raw.githubusercontent.com/ruvnet/dspy.ts/main/docs/integrations/openrouter/README.md

```
# .env
OPENROUTER_API_KEY=your_api_key
OPENROUTER_ORG_ID=your_org_id
```

## Fetch Recent Renders and Analytics Data via cURL

https://raw.githubusercontent.com/rkstgr/papermake/main/README.md

```
# Recent renders
curl localhost:8080/renders?limit=10

# Template usage stats
curl localhost:8080/analytics/templates

# Performance over time
curl localhost:8080/analytics/duration?days=30
```

## Create Next.js App for OpenRouter Observability

https://raw.githubusercontent.com/PostHog/posthog.com/main/contents/tutorials/openrouter-observability.md

```
npx create-next-app@latest openrouter-observability
```

## Implements OpenRouter API Interaction in basic.py

https://raw.githubusercontent.com/agno-agi/phidata/main/cookbook/providers/openrouter/README.md

```
python cookbook/providers/openrouter/basic.py
```

## typescript Result 1

https://raw.githubusercontent.com/polarsource/polar-js/main/docs/sdks/metrics/README.md

```
import { PolarCore } from "@polar-sh/sdk/core.js";
import { metricsGet } from "@polar-sh/sdk/funcs/metricsGet.js";
import { RFCDate } from "@polar-sh/sdk/types/rfcdate.js";

// Use `PolarCore` for best tree-shaking performance.
// You can create one instance of it to use across an application.
const polar = new PolarCore({
  accessToken: process.env["POLAR_ACCESS_TOKEN"] ?? "",
});

async function run() {
  const res = await metricsGet(polar, {
    startDate: new RFCDate("2025-03-14"),
    endDate: new RFCDate("2025-03-18"),
    interval: "hour",
    organizationId: "1dbfc517-0bbf-4301-9ba8-555ca42b9737",
  });
  if (res.ok) {
    const { value: result } = res;
    console.log(result);
  } else {
    console.log("metricsGet failed:", res.error);
  }
}

run();
```

## List OpenAI API Usage with Instructor CLI

https://raw.githubusercontent.com/567-labs/instructor/main/docs/cli/usage.md

```
$ instructor usage list --n 3
```

## Fetch Usage Analytics with API Key Authentication

https://raw.githubusercontent.com/FireBird-Technologies/Auto-Analyst/main/auto-analyst-backend/docs/troubleshooting/troubleshooting.md

```
curl -X GET "http://localhost:8000/analytics/usage" \
        -H "X-API-Key: your_admin_key"
```

## Manage API Keys with orra CLI: Generate and List Keys

https://raw.githubusercontent.com/orra-dev/orra/main/docs/cli.md

```
# Generate a new API key
orra api-keys gen staging-key

# List all API keys
orra api-keys ls
# - production-key
#   KEY: sk-orra-v1-abc...
# - staging-key
#   KEY: sk-orra-v1-xyz...
```

## OpenRouter Auto llm

https://relevanceai.com/llm-models/set-up-and-use-openrouter-auto-llm-for-ai-applications

```
curl -X POST "https://openrouter.ai/api/v1/chat/completions" -H "Authorization: Bearer $YOUR_API_KEY" -H "Content-Type: application/json" -d '{"model": "anthropic/claude-instant-v1", "messages": [{"role": "user", "content": "Hello!"}]}'
```

## llms-full.txt - Comet

https://www.comet.com/docs/opik/llms-full.txt?trk=public_post_comment-text

```
# Home
The Opik platform allows you to log, view and evaluate your LLM traces during
both development and production. Using the platform and our LLM as a Judge
evaluators, you can identify and fix issues in your LLM application.
 
## Overview
The Opik platform allows you to track, view and evaluate your LLM traces during
both development and production.
### Development
During development, you can use the platform to log, view and debug your LLM traces:
1. Log traces using:
 a. One of our [integrations](/tracing/integrations/overview).
 b. The `@track` decorator for Python, learn more in the [Logging Traces](/tracing/log_traces) guide.
 c. Using the Typescript Opik SDK, learn more in the [Logging Traces](/tracing/log_traces#logging-with-the-js--ts-sdk) guide.
2. [Annotate and label traces](/tracing/annotate_traces) through the SDK or the UI.
### Evaluation and Testing
Evaluating the output of your LLM calls is critical to ensure that your application is working as expected and can be challenging. Using the Opik platform, you can:
1. Use one of our [LLM as a Judge evaluators](/evaluation/metrics/overview) or [Heuristic evaluators](/evaluation/metrics/heuristic_metrics) to score your traces and LLM calls
2. [Store evaluation datasets](/evaluation/manage_datasets) in the platform and [run evaluations](/evaluation/evaluate_your_llm)
3. Use our [pytest integration](/testing/pytest_integration) to track unit test results and compare results between runs
### Production Monitoring
Opik has been designed from the ground up to support high volumes of traces making it the ideal tool for monitoring your production LLM applications. We have stress-tested the application and even a small deployment can ingest more than 40 million traces per day!
Our goal is to make it easy for you to monitor your production LLM applications and easily identify any issues with your production LLM application, for this we have included:
1. [Online evaluation metrics](/production/rules) that allow you to score all your production traces and easily identify any issues with your production LLM application.
2. [Production monitoring dashboards](/production/production_monitoring) that allow you to review your feedback scores, trace count and tokens over time at both a daily and hourly granularity.
## Getting Started
[Comet](https://www.comet.com/site) provides a managed Cloud offering for Opik, simply [create an account](https://www.comet.com/signup?from=llm) to get started.
You can also run Opik locally using our [local installer](/self-host/local_deployment). If you are looking for a more production ready deployment, you can also use our [Kubernetes deployment option](/self-host/kubernetes).
## J
```

## Install and Run micro-analytics CLI for Node.js

https://raw.githubusercontent.com/micro-analytics/micro-analytics-cli/main/packages/micro-analytics-cli/readme.md

```
npm install -g micro-analytics-cli

micro-analytics
```
