export type MemoryEntry = {
  readonly id: string;
  readonly content: string;
  readonly type: 'short-term' | 'long-term' | 'semantic' | 'episodic';
  readonly metadata: Record<string, unknown>;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export interface MemoryStore {
  get(id: string): MemoryEntry | undefined;
  set(entry: MemoryEntry): void;
  delete(id: string): void;
  list(filter?: { type?: string }): readonly MemoryEntry[];
}

export interface MemoryManager {
  store(entry: MemoryEntry): void;
  retrieve(id: string): MemoryEntry | undefined;
  delete(id: string): void;
  search(query: string): readonly MemoryEntry[];
  list(): readonly MemoryEntry[];
}

export function createMemoryStore(): MemoryStore {
  const store = new Map<string, MemoryEntry>();

  return {
    get: id => store.get(id),
    set: entry => store.set(entry.id, entry),
    delete: id => store.delete(id),
    list: filter => {
      const entries = [...store.values()];
      return filter?.type
        ? entries.filter(e => e.type === filter.type)
        : entries;
    },
  };
}

export function createMemoryManager(): MemoryManager {
  const store = createMemoryStore();
  let counter = 0;

  return {
    store: entry => store.set({ ...entry, id: entry.id ?? `mem_${++counter}` }),
    retrieve: id => store.get(id),
    delete: id => store.delete(id),
    search: query => store.list().filter(e => e.content.includes(query)),
    list: () => store.list(),
  };
}
