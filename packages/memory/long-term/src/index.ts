export type PersistentMemory = {
  readonly id: string;
  readonly content: string;
  readonly embeddings?: number[];
  readonly metadata: Record<string, unknown>;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly accessCount: number;
};

export type StorageAdapter = {
  save(entry: PersistentMemory): Promise<void>;
  load(id: string): Promise<PersistentMemory | undefined>;
  delete(id: string): Promise<void>;
  list(): Promise<readonly PersistentMemory[]>;
};

export interface LongTermMemory {
  store(memory: PersistentMemory): Promise<void>;
  retrieve(id: string): Promise<PersistentMemory | undefined>;
  forget(id: string): Promise<void>;
  list(): Promise<readonly PersistentMemory[]>;
}

export function createLongTermMemory(storage: StorageAdapter): LongTermMemory {
  return {
    store: memory => storage.save(memory),
    retrieve: id => storage.load(id),
    forget: id => storage.delete(id),
    list: () => storage.list(),
  };
}
