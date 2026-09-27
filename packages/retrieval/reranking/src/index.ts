export type RerankConfig = {
  readonly modelId: string;
  readonly topK: number;
};

export type RerankResult = {
  readonly id: string;
  readonly score: number;
  readonly relevance: number;
};

export interface Reranker {
  rerank(
    query: string,
    results: readonly RerankResult[],
    config: RerankConfig,
  ): Promise<readonly RerankResult[]>;
}

export interface RerankingEngine {
  registerReranker(name: string, reranker: Reranker): void;
  getReranker(name: string): Reranker | undefined;
  rerank(
    query: string,
    results: readonly RerankResult[],
    config: RerankConfig,
  ): Promise<readonly RerankResult[]>;
}

export function createRerankingEngine(): RerankingEngine {
  const rerankers = new Map<string, Reranker>();

  return {
    registerReranker: (name, reranker) => rerankers.set(name, reranker),
    getReranker: name => rerankers.get(name),
    rerank: async (query, results, config) => results,
  };
}
