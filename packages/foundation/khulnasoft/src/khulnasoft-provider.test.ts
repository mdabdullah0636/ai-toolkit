import { createKhulnasoft } from './khulnasoft-provider';
import { OpenAICompatibleChatLanguageModel } from '@ai-toolkit/openai-compatible';
import { LanguageModelV3 } from '@ai-toolkit/provider';
import { loadApiKey } from '@ai-toolkit/provider-utils';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';

const OpenAICompatibleChatLanguageModelMock =
  OpenAICompatibleChatLanguageModel as unknown as Mock;

vi.mock('@ai-toolkit/openai-compatible', () => ({
  OpenAICompatibleChatLanguageModel: vi.fn(),
  OpenAICompatibleCompletionLanguageModel: vi.fn(),
}));

vi.mock('@ai-toolkit/provider-utils', async () => {
  const actual = await vi.importActual('@ai-toolkit/provider-utils');
  return {
    ...actual,
    loadApiKey: vi.fn().mockReturnValue('mock-api-key'),
    withoutTrailingSlash: vi.fn(url => url),
  };
});

vi.mock('./khulnasoft-image-model', () => ({
  KhulnasoftImageModel: vi.fn(),
}));

describe('KhulnasoftProvider', () => {
  let mockLanguageModel: LanguageModelV3;

  beforeEach(() => {
    mockLanguageModel = {
      // Add any required methods for LanguageModelV1
    } as LanguageModelV3;

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('createKhulnasoft', () => {
    it('should create a KhulnasoftProvider instance with default options', () => {
      const provider = createKhulnasoft();
      provider('model-id');

      // Use the mocked version
      const constructorCall =
        OpenAICompatibleChatLanguageModelMock.mock.calls[0];
      const config = constructorCall[1];
      config.headers();

      expect(loadApiKey).toHaveBeenCalledWith({
        apiKey: undefined,
        environmentVariableName: 'KHULNASOFT_API_KEY',
        description: 'Khulnasoft',
      });
    });

    it('should create a KhulnasoftProvider instance with custom options', () => {
      const options = {
        apiKey: 'custom-key',
        baseURL: 'https://custom.url',
        headers: { 'Custom-Header': 'value' },
      };
      const provider = createKhulnasoft(options);
      provider('model-id');

      const constructorCall =
        OpenAICompatibleChatLanguageModelMock.mock.calls[0];
      const config = constructorCall[1];
      config.headers();

      expect(loadApiKey).toHaveBeenCalledWith({
        apiKey: 'custom-key',
        environmentVariableName: 'KHULNASOFT_API_KEY',
        description: 'Khulnasoft',
      });
    });

    it('should return a chat model when called as a function', () => {
      const provider = createKhulnasoft();
      const modelId = 'foo-model-id';

      const model = provider(modelId);
      expect(model).toBeInstanceOf(OpenAICompatibleChatLanguageModel);
    });
  });

  it('should construct a language model with correct configuration', () => {
    const provider = createKhulnasoft();
    const modelId = 'khulnasoft-chat-model';

    const model = provider.languageModel(modelId);

    expect(model).toBeInstanceOf(OpenAICompatibleChatLanguageModel);
    expect(OpenAICompatibleChatLanguageModelMock).toHaveBeenCalledWith(
      modelId,
      expect.objectContaining({
        provider: 'khulnasoft.chat',
      }),
    );
  });
});
