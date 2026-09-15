import { createTestServer } from '@ai-toolkit/test-server/with-vitest';
import { describe, vi } from 'vitest';

import { createOpenAI } from './openai-provider';
import {
  runConformanceTests,
  type ConformanceContext,
} from '@ai-toolkit/provider/conformance';

vi.mock('./version', () => ({
  VERSION: '0.0.0-test',
}));

const server = createTestServer({
  'https://api.openai.com/v1/chat/completions': {
    response: {
      type: 'json-value',
      body: {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Hello, world!' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
      },
    },
  },
  'https://api.openai.com/v1/embeddings': {
    response: {
      type: 'json-value',
      body: {
        object: 'list',
        data: [
          { object: 'embedding', index: 0, embedding: [0.1, 0.2, 0.3] },
          { object: 'embedding', index: 1, embedding: [0.4, 0.5, 0.6] },
        ],
        model: 'text-embedding-3-small',
        usage: { prompt_tokens: 5, total_tokens: 5 },
      },
    },
  },
  'https://api.openai.com/v1/images/generations': {
    response: {
      type: 'json-value',
      body: {
        data: [{
          b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          revised_prompt: 'A beautiful image',
        }],
      },
    },
  },
});

const provider = createOpenAI({
  apiKey: 'test-api-key',
});

const ctx: ConformanceContext = { server };

describe('OpenAI provider conformance', () => {
  runConformanceTests(
    {
      languageModel: {
        model: () => provider.chat('gpt-3.5-turbo'),
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsUsage: true,
      },
      embeddingModel: {
        model: () => provider.embedding('text-embedding-3-small'),
        supportsBatch: true,
      },
      imageModel: {
        model: () => provider.image('dall-e-3'),
      },
    },
    ctx,
  );
});
