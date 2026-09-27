export type RAGContext = {
  readonly query: string;
  readonly retrievedDocs: readonly string[];
  readonly generatedAnswer: string;
  readonly sources: readonly string[];
};

export interface RAGPipeline {
  retrieve(query: string): Promise<readonly string[]>;
  synthesize(query: string, docs: readonly string[]): Promise<string>;
  run(query: string): Promise<RAGContext>;
}

export interface RAGEngine {
  registerPipeline(name: string, pipeline: RAGPipeline): void;
  getPipeline(name: string): RAGPipeline | undefined;
  run(query: string): Promise<RAGContext>;
}

export function createRAGEngine(): RAGEngine {
  const pipelines = new Map<string, RAGPipeline>();

  return {
    registerPipeline: (name, pipeline) => pipelines.set(name, pipeline),
    getPipeline: name => pipelines.get(name),
    run: async query => ({
      query,
      retrievedDocs: [],
      generatedAnswer: '',
      sources: [],
    }),
  };
}
