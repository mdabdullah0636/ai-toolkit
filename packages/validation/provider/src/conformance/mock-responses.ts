/**
 * Common mock response builders for provider conformance tests.
 * Each function returns a Response object that mimics a provider API response.
 */

export interface MockResponseConfig {
  url?: string;
  method?: string;
  status?: number;
  headers?: Record<string, string>;
}

export function chatCompletionResponse(overrides: {
  text?: string;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  id?: string;
  model?: string;
  finish_reason?: string;
  status?: number;
  headers?: Record<string, string>;
} = {}): Response {
  const text = overrides.text ?? 'Hello, world!';
  const usage = overrides.usage ?? { input_tokens: 10, output_tokens: 5, total_tokens: 15 };

  const body = {
    id: overrides.id ?? 'chatcmpl-123',
    object: 'chat.completion',
    created: 1234567890,
    model: overrides.model ?? 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: overrides.finish_reason ?? 'stop',
      },
    ],
    usage: {
      prompt_tokens: usage.input_tokens,
      completion_tokens: usage.output_tokens,
      total_tokens: usage.total_tokens,
    },
  };

  return new Response(JSON.stringify(body), {
    status: overrides.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...overrides.headers },
  });
}

export function streamingChatResponse(
  chunks: Array<{ content?: string; finish_reason?: string; usage?: any }>,
): Response {
  const body = chunks
    .map((chunk, i) => {
      const data: any = {
        id: `chatcmpl-${i}`,
        object: 'chat.completion.chunk',
        created: 1234567890,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            delta: { content: chunk.content },
            finish_reason: chunk.finish_reason ?? null,
          },
        ],
      };
      if (chunk.usage) {
        data.usage = chunk.usage;
      }
      return `data: ${JSON.stringify(data)}\n\n`;
    })
    .join('') + 'data: [DONE]\n\n';

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export function embeddingResponse(
  vectors: number[][] = [[0.1, 0.2, 0.3]],
  model: string = 'text-embedding-3-small',
): Response {
  return new Response(
    JSON.stringify({
      object: 'list',
      data: vectors.map((vector, index) => ({
        object: 'embedding',
        index,
        embedding: vector,
      })),
      model,
      usage: { prompt_tokens: 5, total_tokens: 5 },
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

export function imageGenerationResponse(imageUrl: string = 'https://example.com/image.png'): Response {
  return new Response(
    JSON.stringify({
      data: [{ url: imageUrl, revised_prompt: 'A beautiful image' }],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

export function errorResponse(
  message: string,
  type: string = 'invalid_request_error',
  code?: string,
  status: number = 400,
): Response {
  return new Response(
    JSON.stringify({
      error: {
        message,
        type,
        code,
        param: null,
      },
    }),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}

export function rateLimitResponse(retryAfterSeconds: number = 60): Response {
  return new Response(
    JSON.stringify({
      error: {
        message: 'Rate limit reached for requests',
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
      },
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    },
  );
}

export function authenticationErrorResponse(): Response {
  return errorResponse(
    'Incorrect API key provided',
    'invalid_request_error',
    'invalid_api_key',
    401,
  );
}

export function usageResponse(
  inputTokens: number = 10,
  outputTokens: number = 5,
  totalTokens: number = 15,
): Record<string, any> {
  return {
    prompt_tokens: inputTokens,
    completion_tokens: outputTokens,
    total_tokens: totalTokens,
  };
}
