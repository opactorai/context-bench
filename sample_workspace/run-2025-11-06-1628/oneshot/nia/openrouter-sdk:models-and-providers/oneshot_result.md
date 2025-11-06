# Oneshot Mode Result

**Scenario**: openrouter-sdk:models-and-providers
**Package**: openrouter-sdk
**Registry**: npm
**Context7 ID**: /llmstxt/openrouter_ai_llms-full_txt
**MCP Server**: nia
**Tool Called**: nia_package_search_hybrid
**Timestamp**: 2025-11-06T16:31:21.703Z

---

## Query

Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model.

---

## Tool Input

```json
{
  "registry": "npm",
  "package_name": "openrouter-sdk",
  "semantic_queries": [
    "Using the OpenRouter TypeScript SDK, write a small script that counts available models, lists providers, and then sends a chat using a safe default model."
  ]
}
```

---

## Tool Result

# OpenRouter TypeScript SDK Script

Here's a complete script that counts available models, lists providers, and sends a chat using a safe default model:

```typescript
import { OpenRouter } from '@openrouter/sdk';

async function main() {
  // Initialize the OpenRouter client
  const openRouter = new OpenRouter({
    apiKey: '<OPENROUTER_API_KEY>', // Replace with your actual API key
  });

  try {
    // 1. Fetch and count available models
    console.log('Fetching available models...\n');
    const models = await openRouter.models.list();
    
    console.log(`Total available models: ${models.length}\n`);

    // 2. Extract and list unique providers
    const providers = new Set<string>();
    models.forEach(model => {
      // Model IDs are typically in format "provider/model-name"
      const provider = model.id.split('/')[0];
      providers.add(provider);
    });

    console.log(`Total providers: ${providers.size}`);
    console.log('Providers:', Array.from(providers).sort().join(', '));
    console.log('\n---\n');

    // 3. Send a chat completion using a safe default model
    console.log('Sending chat completion...\n');
    
    const completion = await openRouter.chat.send({
      model: 'meta-llama/llama-3.1-70b-instruct:floor', // Safe default model
      messages: [
        { 
          role: 'user', 
          content: 'Hello! Can you briefly explain what OpenRouter is?' 
        }
      ],
      stream: false,
    });

    console.log('Response:');
    console.log(completion.choices[0].message.content);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Key Features:

1. **Model Counting**: Uses `openRouter.models.list()` to fetch all available models and counts them
2. **Provider Listing**: Extracts unique providers from model IDs (format: `provider/model-name`)
3. **Safe Chat**: Uses `meta-llama/llama-3.1-70b-instruct:floor` as a reliable default model

## Running the Script:

```bash
# Install the SDK first
npm install @openrouter/sdk

# Run the script
npx tsx script.ts  # or ts-node script.ts
```

**Note**: Replace `<OPENROUTER_API_KEY>` with your actual OpenRouter API key from your [account settings](https://openrouter.ai/settings).

### Sources:
- Model listing: `https://openrouter.ai/docs/sdks/typescript/models.mdx`
- Chat completion: `https://openrouter.ai/docs/sdks/typescript/parameters.mdx`
- SDK initialization: `https://openrouter.ai/docs/sdks/typescript/chat.mdx`

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

1. How does the OpenRouter TypeScript SDK handle errors or rate limits when fetching models or sending chat completions, and are there recommended practices for implementing retries or backoff strategies?
2. Are there options or parameters in the OpenRouter chat API to customize model behavior, such as temperature, max tokens, or system prompts, and how can these be leveraged for different use cases?
3. What is the recommended approach to programmatically select the most up-to-date or best-performing model from the available list, instead of hardcoding a default model like 'meta-llama/llama-3.1-70b-instruct:floor'?

*These questions are based on the documentation and can help you explore related topics.*
