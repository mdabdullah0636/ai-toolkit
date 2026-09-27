export type GenerationConfig = {
  readonly modelId: string;
  readonly prompt: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly topP?: number;
  readonly stopSequences?: readonly string[];
  readonly frequencyPenalty?: number;
  readonly presencePenalty?: number;
};

export type GenerationResult = {
  readonly text: string;
  readonly modelId: string;
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
  };
};

export interface TextGenerator {
  generate(config: GenerationConfig): Promise<GenerationResult>;
  stream(config: GenerationConfig): AsyncIterable<GenerationResult>;
}

export interface GenerationEngine {
  registerGenerator(modelId: string, generator: TextGenerator): void;
  getGenerator(modelId: string): TextGenerator | undefined;
  listGenerators(): readonly TextGenerator[];
}

export function createGenerationEngine(): GenerationEngine {
  const generators = new Map<string, TextGenerator>();

  return {
    registerGenerator: (modelId, generator) =>
      generators.set(modelId, generator),
    getGenerator: modelId => generators.get(modelId),
    listGenerators: () => [...generators.values()],
  };
}
