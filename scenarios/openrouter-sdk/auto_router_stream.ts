// auto-router-stream.ts
import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
  // App attribution
  defaultHeaders: {
    'HTTP-Referer': process.env.APP_URL ?? 'http://localhost:3000',
    'X-Title': process.env.APP_TITLE ?? 'My SDK Demo',
  },
});

const stream = await client.chat.completions.create({
  model: 'openrouter/auto',               // Auto Router
  stream: true,                           // Enable streaming
  messages: [{ role: 'user', content: 'Write a cheerful 2‑sentence haiku about TypeScript.' }],
});

// Print streamed chunks
for await (const chunk of stream as any) {
  const delta = chunk?.choices?.[0]?.delta?.content ?? '';
  if (delta) process.stdout.write(delta);
}
console.log('\n--- done ---');
