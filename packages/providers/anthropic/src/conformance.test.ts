import { createTestServer } from '@ai-toolkit/test-server/with-vitest';
import { describe, vi } from 'vitest';

import { createAnthropic } from './anthropic-provider';
import {
  runConformanceTests,
  type ConformanceContext,
} from '@ai-toolkit/provider/conformance';

vi.mock('./version', () => ({
  VERSION: '0.0.0-test',
}));

const server = createTestServer({
  'https://api.anthropic.com/v1/messages': {
    response: {
      type: 'json-value',
      body: {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello, world!' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        stop_sequence: null,
        usage: { input_tokens: 10, output_tokens: 5 },
      },
    },
  },
});

const provider = createAnthropic({
  apiKey: 'test-api-key',
});

const ctx: ConformanceContext = { server };

describe('Anthropic provider conformance', () => {
  runConformanceTests(
    {
      languageModel: {
        model: () => provider.chat('claude-3-5-sonnet-20241022'),
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsUsage: true,
      },
    },
    ctx,
  );
});
