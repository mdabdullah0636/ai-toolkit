# Capture API Response Test Fixture

This skill guides you through capturing real API responses and creating test fixtures for provider packages.

## Overview

Test fixtures are used to mock API responses in tests. They ensure tests are deterministic, fast, and don't require real API calls.

## Fixture Types

### 1. JSON Response Fixtures

For non-streaming API responses, capture the full JSON response body.

**Location**: `src/<model-type>/__fixtures__/<fixture-name>.json`

**Example** (chat completion):

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1711115037,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I assist you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 4,
    "completion_tokens": 30,
    "total_tokens": 34
  },
  "system_fingerprint": "fp_3bc1b5746c"
}
```

### 2. Streaming Response Fixtures (SSE)

For streaming responses, capture each chunk as a separate line in a `.chunks.txt` file.

**Location**: `src/<model-type>/__fixtures__/<fixture-name>.chunks.txt`

**Format**: One JSON object per line (without the `data: ` prefix)

**Example**:

```
{"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1711115037,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}
{"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1711115037,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}
{"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1711115037,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}
{"id":"chatcmpl-abc123","object":"chat.completion.chunk","created":1711115037,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}
```

## Capturing Responses

### Method 1: Using Custom Fetch

Add a custom fetch wrapper to log responses:

```typescript
import { createOpenAI } from '@ai-toolkit/openai';

const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: async (url, options) => {
    const response = await fetch(url, options);

    // Clone response to read body
    const cloned = response.clone();
    const body = await cloned.text();

    console.log('=== API Response ===');
    console.log('URL:', url);
    console.log('Status:', response.status);
    console.log('Body:', body);
    console.log('===================');

    return response;
  },
});
```

### Method 2: Using Network Inspector

1. Set up a proxy or use browser dev tools
2. Make the API call
3. Copy the response body from the network tab

### Method 3: Streaming Response Capture

For SSE streams, capture each chunk:

```typescript
import { createOpenAI } from '@ai-toolkit/openai';
import { writeFileSync } from 'node:fs';

const provider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: async (url, options) => {
    const response = await fetch(url, options);

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      const chunks: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text
          .split('\n')
          .filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6); // Remove 'data: ' prefix
          if (data !== '[DONE]') {
            chunks.push(data);
            console.log(data);
          }
        }
      }

      // Write to file
      writeFileSync('fixture.chunks.txt', chunks.join('\n'));
    }

    return response;
  },
});
```

## Using Fixtures in Tests

### JSON Fixtures

```typescript
import { createTestServer } from '@ai-toolkit/test-server/with-vitest';

const server = createTestServer({
  'https://api.openai.com/v1/chat/completions': {},
});

function prepareJsonResponse(fixture: object) {
  server.urls['https://api.openai.com/v1/chat/completions'].response = {
    type: 'json-value',
    body: fixture,
  };
}

it('should handle response', async () => {
  prepareJsonResponse({
    id: 'chatcmpl-abc123',
    choices: [{ message: { content: 'Hello!' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 4, completion_tokens: 10, total_tokens: 14 },
  });

  const result = await model.doGenerate({ prompt: TEST_PROMPT });
  expect(result.content).toMatchInlineSnapshot(`...`);
});
```

### Streaming Fixtures

```typescript
import fs from 'node:fs';

function prepareChunksFixtureResponse(filename: string) {
  const chunks = fs
    .readFileSync(`src/chat/__fixtures__/${filename}.chunks.txt`, 'utf8')
    .split('\n')
    .map(line => `data: ${line}\n\n`);
  chunks.push('data: [DONE]\n\n');

  server.urls['https://api.openai.com/v1/chat/completions'].response = {
    type: 'stream-chunks',
    chunks,
  };
}

it('should stream response', async () => {
  prepareChunksFixtureResponse('basic-chat');

  const result = await model.doStream({ prompt: TEST_PROMPT });
  const chunks = await convertReadableStreamToArray(result.stream);

  expect(chunks).toMatchInlineSnapshot(`...`);
});
```

## Fixture Naming Conventions

Use descriptive names that indicate the scenario:

- `basic-chat.chunks.txt` - Basic chat completion
- `tool-call.chunks.txt` - Response with tool calls
- `reasoning.chunks.txt` - Response with reasoning tokens
- `error-rate-limit.json` - Rate limit error response
- `multi-turn.chunks.txt` - Multi-turn conversation

## Best Practices

1. **Sanitize sensitive data** - Remove API keys, user IDs, and PII from fixtures
2. **Use realistic data** - Fixtures should represent real API behavior
3. **Cover edge cases** - Create fixtures for errors, empty responses, and edge cases
4. **Keep fixtures minimal** - Only include necessary fields for the test
5. **Update fixtures when APIs change** - Re-capture when provider APIs are updated
6. **Use inline snapshots for simple cases** - `toMatchInlineSnapshot()` is great for small responses
7. **Use file fixtures for complex responses** - Large or streaming responses belong in files
