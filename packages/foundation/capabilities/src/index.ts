import type { RuntimeTarget } from '@ai-toolkit/runtime';

export type ModelCapability =
  | 'chat'
  | 'vision'
  | 'embedding'
  | 'speech'
  | 'audio'
  | 'reasoning'
  | 'image'
  | 'video'
  | 'reranker'
  | 'moderation'
  | 'ocr'
  | 'translation';

export interface ModelPricing {
  readonly input?: number;
  readonly output?: number;
  readonly unit?: 'token' | 'character' | 'second' | 'image' | 'request';
  readonly currency?: string;
}

export interface ModelCapabilityDescriptor {
  readonly id: string;
  readonly provider: string;
  readonly capabilities: readonly ModelCapability[];
  readonly runtimes: readonly RuntimeTarget[];
  readonly streaming: boolean;
  readonly toolCalling?: boolean;
  readonly structuredOutput?: boolean;
  readonly contextWindow?: number;
  readonly pricing?: ModelPricing;
  readonly status?: 'active' | 'deprecated' | 'preview';
}

export interface ModelCatalog {
  get(modelId: string): ModelCapabilityDescriptor | undefined;
  list(filter?: {
    provider?: string;
    capability?: ModelCapability;
    runtime?: RuntimeTarget;
  }): readonly ModelCapabilityDescriptor[];
  register(model: ModelCapabilityDescriptor): void;
}

export function createModelCatalog(
  initial: readonly ModelCapabilityDescriptor[] = [],
): ModelCatalog {
  const models = new Map(initial.map(model => [model.id, model]));

  return {
    get: modelId => models.get(modelId),
    list: filter =>
      [...models.values()].filter(
        model =>
          (!filter?.provider || model.provider === filter.provider) &&
          (!filter?.capability ||
            model.capabilities.includes(filter.capability)) &&
          (!filter?.runtime || model.runtimes.includes(filter.runtime)),
      ),
    register: model => models.set(model.id, model),
  };
}
