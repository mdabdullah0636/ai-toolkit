import {
  LanguageModelV3,
  NoSuchModelError,
  ProviderV3,
} from '@ai-toolkit/provider';
import { OpenAICompatibleChatLanguageModel } from '@ai-toolkit/openai-compatible';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
  withUserAgentSuffix,
} from '@ai-toolkit/provider-utils';
import { KhulnasoftChatModelId } from './khulnasoft-chat-options';
import { VERSION } from './version';

export interface KhulnasoftProviderSettings {
  /**
Khulnasoft API key.
*/
  apiKey?: string;
  /**
Base URL for the API calls.
*/
  baseURL?: string;
  /**
Custom headers to include in the requests.
*/
  headers?: Record<string, string>;
  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
*/
  fetch?: FetchFunction;
}

export interface KhulnasoftProvider extends ProviderV3 {
  /**
Creates a model for text generation.
*/
  (modelId: KhulnasoftChatModelId): LanguageModelV3;

  /**
Creates a language model for text generation.
*/
  languageModel(modelId: KhulnasoftChatModelId): LanguageModelV3;

  /**
   * @deprecated Use `embeddingModel` instead.
   */
  textEmbeddingModel(modelId: string): never;
}

export function createKhulnasoft(
  options: KhulnasoftProviderSettings = {},
): KhulnasoftProvider {
  const baseURL = withoutTrailingSlash(
    options.baseURL ?? 'https://api.v0.dev/v1',
  );
  const getHeaders = () =>
    withUserAgentSuffix(
      {
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: 'KHULNASOFT_API_KEY',
          description: 'Khulnasoft',
        })}`,
        ...options.headers,
      },
      `ai-toolkit/khulnasoft/${VERSION}`,
    );

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `khulnasoft.${modelType}`,
    url: ({ path }) => `${baseURL}${path}`,
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createChatModel = (modelId: KhulnasoftChatModelId) => {
    return new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig('chat'),
    });
  };

  const provider = (modelId: KhulnasoftChatModelId) => createChatModel(modelId);

  provider.specificationVersion = 'v3' as const;
  provider.languageModel = createChatModel;
  provider.embeddingModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'embeddingModel' });
  };
  provider.textEmbeddingModel = provider.embeddingModel;
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: 'imageModel' });
  };

  return provider;
}

export const khulnasoft = createKhulnasoft();
