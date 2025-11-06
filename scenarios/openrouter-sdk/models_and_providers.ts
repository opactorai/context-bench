// models-and-providers.ts
import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

const models = await client.models.list();
console.log(`Model count (from list): ${models.data.length}`);

const providers = await client.providers.list();
console.log(
  'Some providers:',
  providers.data.slice(0, 5).map(p => p.id).join(', ')
);

const completion = await client.chat.completions.create({
  model: 'openrouter/auto',
  messages: [{ role: 'user', content: 'Name 3 benefits of model routing in one sentence.' }],
});

console.log('\nAssistant:', completion.choices[0]?.message?.content);
