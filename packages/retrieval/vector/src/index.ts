export type VectorDatabaseConfig = {
  readonly provider: 'pinecone' | 'weaviate' | 'qdrant' | 'chromadb';
  readonly namespace?: string;
};

export type VectorRecord = {
  readonly id: string;
  readonly vector: number[];
  readonly metadata: Record<string, unknown>;
};

export interface VectorStore {
  insert(record: VectorRecord): Promise<void>;
  search(queryVector: number[], topK: number): Promise<readonly VectorRecord[]>;
  delete(id: string): Promise<void>;
}

export interface VectorDatabase {
  connect(config: VectorDatabaseConfig): Promise<void>;
  getStore(collection: string): VectorStore;
  listCollections(): Promise<readonly string[]>;
}

export function createVectorDatabase(): VectorDatabase {
  return {
    connect: async () => {},
    getStore: () => ({
      insert: async () => {},
      search: async () => [],
      delete: async () => {},
    }),
    listCollections: async () => [],
  };
}
