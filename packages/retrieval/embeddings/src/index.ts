export type EmbeddingConfig = {
  readonly modelId: string;
  readonly dimensions?: number;
};

export type Embedding = {
  readonly id: string;
  readonly vector: number[];
  readonly text: string;
};

export interface EmbeddingGenerator {
  generate(text: string, config?: EmbeddingConfig): Promise<Embedding>;
  generateBatch(
    texts: string[],
    config?: EmbeddingConfig,
  ): Promise<readonly Embedding[]>;
}

export interface EmbeddingEngine {
  registerGenerator(name: string, generator: EmbeddingGenerator): void;
  getGenerator(name: string): EmbeddingGenerator | undefined;
  generate(text: string, config?: EmbeddingConfig): Promise<Embedding>;
}

export function createEmbeddingEngine(): EmbeddingEngine {
  const generators = new Map<string, EmbeddingGenerator>();

  return {
    registerGenerator: (name, generator) => generators.set(name, generator),
    getGenerator: name => generators.get(name),
    generate: async text => ({
      id: `emb_${Date.now()}`,
      vector: new Array(1536).fill(0),
      text,
    }),
  };
}
