import { createTestServer } from '@ai-toolkit/test-server/with-vitest';
import { describe, vi } from 'vitest';

import { createGoogleGenerativeAI } from './google-provider';
import {
  runConformanceTests,
  type ConformanceContext,
} from '@ai-toolkit/provider/conformance';

vi.mock('./version', () => ({
  VERSION: '0.0.0-test',
}));

const server = createTestServer({
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent':
    {
      response: {
        type: 'json-value',
        body: {
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello, world!' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 5,
            totalTokenCount: 15,
          },
        },
      },
    },
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-express-001:embedContent':
    {
      response: {
        type: 'json-value',
        body: {
          embedding: { values: [0.1, 0.2, 0.3] },
        },
      },
    },
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-express-001:batchEmbedContents':
    {
      response: {
        type: 'json-value',
        body: {
          embeddings: [
            { values: [0.1, 0.2, 0.3] },
            { values: [0.4, 0.5, 0.6] },
          ],
        },
      },
    },
  'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict':
    {
      response: {
        type: 'json-value',
        body: {
          predictions: [
            {
              bytesBase64Encoded:
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            },
          ],
        },
      },
    },
});

const provider = createGoogleGenerativeAI({
  apiKey: 'test-api-key',
});

const ctx: ConformanceContext = { server };

describe('Google provider conformance', () => {
  runConformanceTests(
    {
      languageModel: {
        model: () => provider.chat('gemini-1.5-pro'),
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsUsage: true,
      },
      embeddingModel: {
        model: () => provider.embedding('gemini-embedding-express-001'),
      },
      imageModel: {
        model: () => provider.image('imagen-3.0-generate-002'),
      },
    },
    ctx,
  );
});
