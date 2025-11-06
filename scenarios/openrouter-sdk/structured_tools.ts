// structured-tools.ts
import OpenRouter from '@openrouter/sdk';

const client = new OpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });

const baseMessages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What's the weather in Boston today? Return a strict JSON object.' },
];

// Step 1 — let the model decide whether to call the tool
const first = await client.chat.completions.create({
  model: 'openai/gpt-4o',
  messages: baseMessages,
  tools: [
    {
      type: 'function',
      function: {
        name: 'getCurrentWeather',
        description: 'Get the current weather for a city.',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string', description: 'City, State' },
            unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
          },
          required: ['location'],
        },
      },
    },
  ],
  tool_choice: 'auto',
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'weather',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          location: { type: 'string' },
          temperature: { type: 'string' },
          conditions: { type: 'string' },
        },
        required: ['location', 'temperature', 'conditions'],
        additionalProperties: false,
      },
    },
  },
});

const toolCalls = first.choices?.[0]?.message?.tool_calls ?? [];

// Mock tool execution if requested
let finalMessages = [...baseMessages];
for (const t of toolCalls) {
  if (t.function?.name === 'getCurrentWeather') {
    const args = JSON.parse(t.function.arguments || '{}');
    const fakeWeather = {
      location: args.location ?? 'Boston, MA',
      temperature: args.unit === 'fahrenheit' ? '64°F' : '18°C',
      conditions: 'Partly cloudy',
    };
    finalMessages.push({ role: 'tool', tool_call_id: t.id, content: JSON.stringify(fakeWeather) } as any);
  }
}

// Step 2 — return final structured JSON (or the first answer if no tool was needed)
if (toolCalls.length > 0) {
  const second = await client.chat.completions.create({
    model: 'openai/gpt-4o',
    messages: finalMessages,
    response_format: first.response_format, // keep same schema
  });
  console.log(JSON.stringify(second.choices[0]?.message?.content, null, 2));
} else {
  console.log(JSON.stringify(first.choices[0]?.message?.content, null, 2));
}
