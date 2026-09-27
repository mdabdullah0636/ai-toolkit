export type RetrievalConfig = {
  readonly topK: number;
  readonly minScore: number;
  readonly filter?: Record<string, unknown>;
};

export type RetrievalResult = {
  readonly id: string;
  readonly content: string;
  readonly score: number;
  readonly metadata: Record<string, unknown>;
};

export interface Retriever {
  retrieve(
    query: string,
    config: RetrievalConfig,
  ): Promise<readonly RetrievalResult[]>;
}

export interface RetrievalEngine {
  registerRetriever(name: string, retriever: Retriever): void;
  getRetriever(name: string): Retriever | undefined;
  retrieve(
    query: string,
    config: RetrievalConfig,
  ): Promise<readonly RetrievalResult[]>;
}

export function createRetrievalEngine(): RetrievalEngine {
  const retrievers = new Map<string, Retriever>();

  return {
    registerRetriever: (name, retriever) => retrievers.set(name, retriever),
    getRetriever: name => retrievers.get(name),
    retrieve: async (query, config) => {
      for (const retriever of retrievers.values()) {
        return retriever.retrieve(query, config);
      }
      return [];
    },
  };
}
