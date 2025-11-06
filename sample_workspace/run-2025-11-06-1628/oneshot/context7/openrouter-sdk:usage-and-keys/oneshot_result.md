# Oneshot Mode Result

**Scenario**: openrouter-sdk:usage-and-keys
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: context7
**Tool Called**: get-library-docs
**Timestamp**: 2025-11-06T16:30:16.776Z

---

## Query

Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch.

---

## Tool Input

```json
{
  "context7CompatibleLibraryID": "/llmstxt/openrouter_ai_llms-full_txt",
  "topic": "Using the OpenRouter TypeScript SDK with analytics and key management APIs, build a CLI for org admins. Pull the last 30 days of user activity grouped by endpoint, and list all API keys with their labels. Include a note on React Query hooks for future SSR prefetch."
}
```

---

## Tool Result

### Manage OpenRouter API Keys with TypeScript

Source: https://context7_llms

Illustrates how to manage API keys using TypeScript with the fetch API. Covers listing, creating, retrieving, updating, and deleting keys, including setting authorization headers and request bodies for POST and PATCH operations.

```TypeScript
const PROVISIONING_API_KEY = 'your-provisioning-key';
const BASE_URL = 'https://openrouter.ai/api/v1/keys';

// List the most recent 100 API keys
const listKeys = await fetch(BASE_URL, {
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// You can paginate using the `offset` query parameter
const listKeys = await fetch(`${BASE_URL}?offset=100`, {
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Create a new API key
const createKey = await fetch(`${BASE_URL}`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Customer Instance Key',
    label: 'customer-123',
    limit: 1000, // Optional credit limit
  }),
});

// Get a specific key
const keyHash = '<YOUR_KEY_HASH>';
const getKey = await fetch(`${BASE_URL}/${keyHash}`, {
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Update a key
const updateKey = await fetch(`${BASE_URL}/${keyHash}`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Updated Key Name',
    disabled: true, // Disable the key
    include_byok_in_limit: false, // Optional: control BYOK usage in limit
  }),
});

// Delete a key
const deleteKey = await fetch(`${BASE_URL}/${keyHash}`, {
  method: 'DELETE',
  headers: {
    Authorization: `Bearer ${PROVISIONING_API_KEY}`,
    'Content-Type': 'application/json',
  },
});
```

--------------------------------

### Get Activity Data

Source: https://context7_llms

Retrieves daily user activity data grouped by model endpoint for the last 30 UTC days. Access to this endpoint requires a provisioning key.

```http
GET https://openrouter.ai/api/v1/activity
```

--------------------------------

### List API Keys - OpenRouter API

Source: https://openrouter.ai/docs

Lists all available API keys associated with the user's account. This endpoint helps in managing multiple keys and understanding their usage. It requires authentication.

```http
GET /api/v1/api-keys
```

--------------------------------

### List API Keys - GET

Source: https://openrouter.ai/docs

Lists all available API keys associated with the account. This GET endpoint is part of the API Keys management.

```HTTP
GET /v1/keys
```

--------------------------------

### List API Keys - OpenRouter API

Source: https://openrouter.ai/docs/quickstart

Lists all available API keys associated with the user's account. This endpoint helps in managing multiple keys and understanding their usage. It requires authentication.

```http
GET /api/v1/api-keys
```

--------------------------------

### List API Keys - GET

Source: https://openrouter.ai/docs/quickstart

Lists all available API keys associated with the account. This GET endpoint is part of the API Keys management.

```HTTP
GET /v1/keys
```

--------------------------------

### GET Activity - OpenRouter Analytics API

Source: https://openrouter.ai/docs/api-reference/overview

Fetches recent activity logs and usage data. This endpoint is useful for tracking API interactions and understanding platform usage patterns.

```HTTP
GET /analytics/get-activity
```

--------------------------------

### Query Generation Stats

Source: https://openrouter.ai/docs/api-reference/overview

This snippet shows how to fetch generation statistics, including token counts and costs, after a request is completed. It uses the fetch API to make a request to the OpenRouter generation endpoint.

```typescript
const generation = await fetch(
 'https://openrouter.ai/api/v1/generation?id=$GENERATION_ID',
 { headers },
);

const stats = await generation.json();

```

--------------------------------

### List API Keys - OpenRouter API

Source: https://openrouter.ai/docs/use-cases/usage-accounting

Retrieves a list of all API keys associated with the account. This is a GET request to the /api-keys endpoint.

```OpenAPI
{
  "summary": "List API keys",
  "operationId": "listApiKeys",
  "responses": {
    "200": {
      "description": "Successful response"
    }
  },
  "tags": [
    "API Keys"
  ],
  "method": "GET",
  "path": "/api-keys"
}
```

--------------------------------

### TypeScript: Use OpenAI SDK with OpenRouter Base URL

Source: https://context7_llms

Shows how to configure the OpenAI Typescript SDK to interact with the OpenRouter API. This involves setting the `baseURL` to OpenRouter's endpoint and providing the API key.

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
    messages: [{ role: 'user', content: 'Say this is a test' }],
  });

  console.log(completion.choices[0].message);
}

main();
```

--------------------------------

### OpenRouter API Keys Management

Source: https://openrouter.ai/docs/api-reference/overview

This snippet outlines the available API endpoints for managing API keys within the OpenRouter platform. It includes operations for getting current keys, listing all keys, creating new keys, retrieving specific keys, updating existing keys, and deleting keys.

```json
{
  "type": "apiPackage",
  "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:subpackage_apiKeys",
  "children": [
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.getCurrentApiKey",
      "title": "Get current API key",
      "slug": "docs/api-reference/api-keys/get-current-api-key",
      "canonicalSlug": "docs/api-reference/api-keys/get-current-api-key",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "GET",
      "endpointId": "endpoint_apiKeys.getCurrentApiKey",
      "isResponseStream": false
    },
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.listApiKeys",
      "title": "List API keys",
      "slug": "docs/api-reference/api-keys/list-api-keys",
      "canonicalSlug": "docs/api-reference/api-keys/list-api-keys",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "GET",
      "endpointId": "endpoint_apiKeys.listApiKeys",
      "isResponseStream": false
    },
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.createApiKey",
      "title": "Create API key",
      "slug": "docs/api-reference/api-keys/create-api-key",
      "canonicalSlug": "docs/api-reference/api-keys/create-api-key",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "POST",
      "endpointId": "endpoint_apiKeys.createApiKey",
      "isResponseStream": false
    },
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.getApiKey",
      "title": "Get API key",
      "slug": "docs/api-reference/api-keys/get-api-key",
      "canonicalSlug": "docs/api-reference/api-keys/get-api-key",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "GET",
      "endpointId": "endpoint_apiKeys.getApiKey",
      "isResponseStream": false
    },
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.deleteApiKey",
      "title": "Delete API key",
      "slug": "docs/api-reference/api-keys/delete-api-key",
      "canonicalSlug": "docs/api-reference/api-keys/delete-api-key",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "DELETE",
      "endpointId": "endpoint_apiKeys.deleteApiKey",
      "isResponseStream": false
    },
    {
      "type": "endpoint",
      "id": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.updateApiKey",
      "title": "Update API key",
      "slug": "docs/api-reference/api-keys/update-api-key",
      "canonicalSlug": "docs/api-reference/api-keys/update-api-key",
      "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
      "method": "PATCH",
      "endpointId": "endpoint_apiKeys.updateApiKey",
      "isResponseStream": false
    }
  ],
  "title": "API Keys",
  "slug": "docs/api-reference/api-keys",
  "apiDefinitionId": "40ac2ec4-66e1-43c3-af81-7581c63dd743",
  "pointsTo": "docs/api-reference/api-keys/get-current-api-key",
  "children": [
    {
      "nodeId": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.getCurrentApiKey",
      "slug": "docs/api-reference/api-keys/get-current-api-key",
      "title": "Get current API key",
      "depth": 1
    },
    {
      "nodeId": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.listApiKeys",
      "slug": "docs/api-reference/api-keys/list-api-keys",
      "title": "List API keys",
      "depth": 1
    },
    {
      "nodeId": "40ac2ec4-66e1-43c3-af81-7581c63dd743:endpoint_apiKeys.createApiKey",
      "slug": "docs/api-reference/api-keys/create-api-key",
      "title": "Create API key",
      "depth": 1
    }
  ]
}
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

### Get OpenRouter AI Activity Data

Source: https://context7_llms

Retrieve daily user activity data from the OpenRouter AI API, grouped by model endpoint. This requires an API token for authorization. The API supports filtering by date.

```shell
curl https://openrouter.ai/api/v1/activity \
     -H "Authorization: Bearer <token>"
```

```python
import requests

url = "https://openrouter.ai/api/v1/activity"

headers = {"Authorization": "Bearer <token>"}

response = requests.get(url, headers=headers)

print(response.json())
```

```javascript
const url = 'https://openrouter.ai/api/v1/activity';
const options = {method: 'GET', headers: {Authorization: 'Bearer <token>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
```

```go
package main

import (
	"fmt"
	"net/http"
	"io"
)

func main() {

	url := "https://openrouter.ai/api/v1/activity"

	req, _ := http.NewRequest("GET", url, nil)

	req.Header.Add("Authorization", "Bearer <token>")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://openrouter.ai/api/v1/activity")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Get.new(url)
request["Authorization"] = 'Bearer <token>'

response = http.request(request)
puts response.read_body
```

```java
HttpResponse<String> response = Unirest.get("https://openrouter.ai/api/v1/activity")
  .header("Authorization", "Bearer <token>")
  .asString();
```

```php
<?php

$client = new \GuzzleHttp\Client();

$response = $client->request('GET', 'https://openrouter.ai/api/v1/activity', [
  'headers' => [
    'Authorization' => 'Bearer <token>',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://openrouter.ai/api/v1/activity");
var request = new RestRequest(Method.GET);
request.AddHeader("Authorization", "Bearer <token>");
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = ["Authorization": "Bearer <token>"]

let request = NSMutableURLRequest(url: NSURL(string: "https://openrouter.ai/api/v1/activity")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "GET"
request.allHTTPHeaderFields = headers

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```

--------------------------------

### Check API Key Rate Limits and Credits Remaining

Source: https://context7_llms

This snippet demonstrates how to make a GET request to the OpenRouter API to retrieve information about your API key's rate limits and remaining credits. It includes examples for both TypeScript and Python, requiring an API key for authorization.

```TypeScript
const response = await fetch('https://openrouter.ai/api/v1/key', {
  method: 'GET',
  headers: {
    Authorization: 'Bearer {{API_KEY_REF}}',
  },
});
```

```Python
import requests
import json

response = requests.get(
  url="https://openrouter.ai/api/v1/key",
  headers={
    "Authorization": f"Bearer {{API_KEY_REF}}"
  }
)

print(json.dumps(response.json(), indent=2))
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

### Manage API Keys

Source: https://openrouter.ai/docs/api-reference/completion

This section details the API endpoints for managing API keys. It covers operations such as creating new API keys, listing existing ones, retrieving specific key details, updating key properties, and deleting keys. These operations are crucial for authenticating and authorizing access to the OpenRouter API.

```OpenAPI
{
  "openapi": "3.0.0",
  "info": {
    "title": "OpenRouter API Keys",
    "version": "1.0.0"
  },
  "paths": {
    "/api-keys": {
      "get": {
        "summary": "List API keys",
        "operationId": "listApiKeys"
      },
      "post": {
        "summary": "Create API key",
        "operationId": "createApiKey"
      }
    },
    "/api-keys/{apiKeyId}": {
      "get": {
        "summary": "Get API key",
        "operationId": "getApiKey"
      },
      "put": {
        "summary": "Update API key",
        "operationId": "updateApiKey"
      },
      "delete": {
        "summary": "Delete API key",
        "operationId": "deleteApiKey"
      }
    }
  }
}
```

--------------------------------

### List OpenRouter API Keys - JavaScript Example

Source: https://context7_llms

Example of how to list API keys using JavaScript's fetch API, including the Authorization header and error handling.

```javascript
const url = 'https://openrouter.ai/api/v1/keys';
const options = {method: 'GET', headers: {Authorization: 'Bearer <token>'}};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
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

### Get Current API Key - GET

Source: https://openrouter.ai/docs

Retrieves the currently active API key. This GET endpoint is part of the API Keys management.

```HTTP
GET /v1/keys/current
```
