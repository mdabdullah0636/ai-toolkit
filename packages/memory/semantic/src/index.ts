export type SemanticEntry = {
  readonly id: string;
  readonly content: string;
  readonly embedding: number[];
  readonly metadata: Record<string, unknown>;
};

export type SimilarityResult = {
  readonly id: string;
  readonly content: string;
  readonly score: number;
};

export interface SemanticStore {
  insert(entry: SemanticEntry): Promise<void>;
  search(query: string, topK?: number): Promise<readonly SimilarityResult[]>;
  delete(id: string): Promise<void>;
}

export interface SemanticMemory {
  remember(entry: SemanticEntry): Promise<void>;
  recall(query: string, topK?: number): Promise<readonly SimilarityResult[]>;
  forget(id: string): Promise<void>;
}

export function createSemanticMemory(store: SemanticStore): SemanticMemory {
  return {
    remember: entry => store.insert(entry),
    recall: (query, topK) => store.search(query, topK),
    forget: id => store.delete(id),
  };
}
