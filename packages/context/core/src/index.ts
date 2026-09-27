export type Context = {
  readonly id: string;
  readonly content: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: number;
  readonly updatedAt: number;
};

export interface ContextStore {
  get(id: string): Context | undefined;
  set(context: Context): void;
  delete(id: string): void;
  list(filter?: { metadata?: Record<string, unknown> }): readonly Context[];
}

export interface ContextManager {
  create(content: string, metadata?: Record<string, unknown>): Context;
  retrieve(id: string): Context | undefined;
  update(id: string, content: string): void;
  delete(id: string): void;
  list(): readonly Context[];
}

export function createContextStore(): ContextStore {
  const store = new Map<string, Context>();

  return {
    get: id => store.get(id),
    set: context => store.set(context.id, context),
    delete: id => store.delete(id),
    list: filter => {
      const entries = [...store.values()];
      return filter?.metadata
        ? entries.filter(c =>
            Object.entries(filter.metadata!).every(
              ([key, value]) => c.metadata[key] === value,
            ),
          )
        : entries;
    },
  };
}

export function createContextManager(): ContextManager {
  const store = createContextStore();
  let counter = 0;

  return {
    create: (content, metadata) => {
      const context: Context = {
        id: `ctx_${++counter}`,
        content,
        metadata: metadata ?? {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      store.set(context);
      return context;
    },
    retrieve: id => store.get(id),
    update: (id, content) => {
      const existing = store.get(id);
      if (existing) {
        store.set({ ...existing, content, updatedAt: Date.now() });
      }
    },
    delete: id => store.delete(id),
    list: () => store.list(),
  };
}
