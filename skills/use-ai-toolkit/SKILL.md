# Use AI Toolkit

This skill provides patterns for using the AI Toolkit in applications.

## Installation

```bash
pnpm add ai @ai-toolkit/openai
# or
npm install ai @ai-toolkit/openai
```

## Core Concepts

### Providers

Providers connect to AI services. Each provider package exports a factory function and a default instance:

```typescript
import { openai } from '@ai-toolkit/openai';
import { anthropic } from '@ai-toolkit/anthropic';
import { google } from '@ai-toolkit/google';

// Use default instance
const model = openai('gpt-4o');

// Or create custom instance
import { createOpenAI } from '@ai-toolkit/openai';
const customOpenAI = createOpenAI({
  apiKey: 'custom-key',
  baseURL: 'https://custom-endpoint.com/v1',
});
```

### Gateway (Recommended for v0)

The AI Gateway provides zero-config access to multiple providers:

```typescript
import { gateway } from 'ai-toolkit';

// Use any supported model through the gateway
const model = gateway('openai/gpt-4o');
const anthropicModel = gateway('anthropic/claude-opus-4');
const googleModel = gateway('google/gemini-3-flash');
```

## Text Generation

### generateText

For single completions:

```typescript
import { generateText } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

const { text, usage, finishReason } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is the capital of France?',
});
```

### streamText

For streaming responses:

```typescript
import { streamText } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

const result = streamText({
  model: openai('gpt-4o'),
  prompt: 'Write a short story about a robot.',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}

// Get final result
const { text, usage } = await result;
```

## Structured Output

### generateObject

Generate structured data with schema validation:

```typescript
import { generateObject } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';
import { z } from 'zod/v4';

const { object } = await generateObject({
  model: openai('gpt-4o'),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  }),
  prompt: 'Generate a recipe for chocolate chip cookies.',
});
```

### streamObject

Stream structured data:

```typescript
import { streamObject } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';
import { z } from 'zod/v4';

const result = streamObject({
  model: openai('gpt-4o'),
  schema: z.object({
    characters: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
      }),
    ),
  }),
  prompt: 'Generate 3 fantasy characters.',
});

for await (const partialObject of result.partialObjectStream) {
  console.log(partialObject);
}
```

## Tool Calling

### Defining Tools

```typescript
import { tool } from 'ai-toolkit';
import { z } from 'zod/v4';

const weatherTool = tool({
  description: 'Get the current weather for a location',
  parameters: z.object({
    location: z.string().describe('The city and state'),
    unit: z.enum(['celsius', 'fahrenheit']).optional(),
  }),
  execute: async ({ location, unit }) => {
    // Fetch weather data
    return { temperature: 22, condition: 'sunny' };
  },
});
```

### Using Tools with generateText

```typescript
import { generateText } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

const { text, toolResults } = await generateText({
  model: openai('gpt-4o'),
  tools: { weather: weatherTool },
  prompt: 'What is the weather in San Francisco?',
});
```

### Multi-step Tool Execution

```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  tools: { weather: weatherTool, calendar: calendarTool },
  maxSteps: 5, // Allow up to 5 tool calls
  prompt: 'Plan my outdoor activities based on the weather.',
});
```

## Embeddings

```typescript
import { embed, embedMany } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

// Single embedding
const { embedding } = await embed({
  model: openai.embedding('text-embedding-3-small'),
  value: 'Hello, world!',
});

// Multiple embeddings
const { embeddings } = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: ['Hello', 'World', 'AI'],
});
```

## Image Generation

```typescript
import { generateImage } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

const { image } = await generateImage({
  model: openai.image('dall-e-3'),
  prompt: 'A futuristic city at sunset',
  size: '1024x1024',
});

// image.base64 contains the image data
```

## Provider-Specific Options

Pass provider-specific options through `providerOptions`:

```typescript
const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Hello!',
  providerOptions: {
    openai: {
      logprobs: true,
      user: 'user-123',
      reasoningEffort: 'high', // For reasoning models
    },
  },
});
```

## Next.js Integration

### Route Handler (App Router)

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai-toolkit';
import { openai } from '@ai-toolkit/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### React Hook

```typescript
// app/page.tsx
'use client';

import { useChat } from '@ai-toolkit/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## Error Handling

```typescript
import { generateText, AITOOLKITError } from 'ai-toolkit';

try {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    prompt: 'Hello!',
  });
} catch (error) {
  if (error instanceof AITOOLKITError) {
    console.error('AI Error:', error.message);
    console.error('Cause:', error.cause);
  }
}
```

## Best Practices

1. **Use the gateway for multi-provider apps** - Simplifies provider management
2. **Stream for long responses** - Better UX with streaming
3. **Use structured output for data extraction** - More reliable than parsing text
4. **Implement proper error handling** - AI APIs can fail
5. **Set appropriate timeouts** - Use `abortSignal` for cancellation
6. **Use tools for external data** - Better than asking the model to make up data
7. **Leverage provider-specific features** - Use `providerOptions` for advanced capabilities

## Resources

- [AI TOOLKIT Documentation](https://studio.khulnasoft.com/docs)
- [Provider Documentation](https://studio.khulnasoft.com/docs/providers)
- [Examples](https://github.com/khulnasoft/ai-toolkit/tree/main/examples)
