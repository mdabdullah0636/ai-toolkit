export type Document = {
  readonly id: string;
  readonly content: string;
  readonly metadata: Record<string, unknown>;
  readonly indexed: boolean;
};

export interface Indexer {
  index(documents: readonly Document[]): Promise<void>;
  remove(id: string): Promise<void>;
  search(query: string): Promise<readonly Document[]>;
}

export interface IndexingEngine {
  registerIndexer(name: string, indexer: Indexer): void;
  getIndexer(name: string): Indexer | undefined;
  index(documents: readonly Document[]): Promise<void>;
}

export function createIndexingEngine(): IndexingEngine {
  const indexers = new Map<string, Indexer>();

  return {
    registerIndexer: (name, indexer) => indexers.set(name, indexer),
    getIndexer: name => indexers.get(name),
    index: async () => {},
  };
}
