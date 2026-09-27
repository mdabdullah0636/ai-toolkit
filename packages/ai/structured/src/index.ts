import type { StandardSchema } from '@ai-toolkit/provider';

export type StructuredOutputConfig = {
  readonly schema: StandardSchema;
  readonly modelId: string;
  readonly prompt: string;
  readonly retryCount?: number;
};

export type StructuredResult<T> = {
  readonly data: T;
  readonly modelId: string;
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
  };
};

export interface StructuredGenerator {
  generate<T>(config: StructuredOutputConfig): Promise<StructuredResult<T>>;
  stream<T>(config: StructuredOutputConfig): AsyncIterable<StructuredResult<T>>;
}

export interface StructuredEngine {
  registerGenerator<T>(modelId: string, generator: StructuredGenerator): void;
  getGenerator<T>(modelId: string): StructuredGenerator | undefined;
  listGenerators(): readonly StructuredGenerator[];
}

export function createStructuredEngine(): StructuredEngine {
  const generators = new Map<string, StructuredGenerator>();

  return {
    registerGenerator: (modelId, generator) =>
      generators.set(modelId, generator),
    getGenerator: modelId => generators.get(modelId),
    listGenerators: () => [...generators.values()],
  };
}
