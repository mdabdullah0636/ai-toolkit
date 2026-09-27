export type StorageType = 'postgresql' | 'redis' | 'memory' | 's3' | 'dynamodb';

export interface StorageConfig {
  readonly type: StorageType;
  readonly connectionString?: string;
  readonly options?: Record<string, unknown>;
}

export interface StorageAdapter {
  readonly type: StorageType;
  initialize(): Promise<void>;
  save(key: string, value: Uint8Array): Promise<void>;
  load(key: string): Promise<Uint8Array | undefined>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<readonly string[]>;
  close(): Promise<void>;
}

export interface StorageManager {
  createAdapter(config: StorageConfig): Promise<StorageAdapter>;
  getAdapter(type: StorageType): StorageAdapter | undefined;
  listAdapters(): readonly StorageAdapter[];
}

export function createStorageManager(): StorageManager {
  const adapters = new Map<StorageType, StorageAdapter>();

  return {
    createAdapter: async config => {
      // Adapter creation logic would be implementation-specific
      return {
        type: config.type,
        initialize: async () => {},
        save: async () => {},
        load: async () => undefined,
        delete: async () => {},
        list: async () => [],
        close: async () => {},
      };
    },
    getAdapter: type => adapters.get(type),
    listAdapters: () => [...adapters.values()],
  };
}
