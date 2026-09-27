export type RegistryEntry = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly version: string;
  readonly metadata: Record<string, unknown>;
};

export interface ToolDiscovery {
  discover(): Promise<readonly RegistryEntry[]>;
  search(query: string): Promise<readonly RegistryEntry[]>;
  filter(category: string): Promise<readonly RegistryEntry[]>;
}

export interface RegistryEngine {
  registerEntry(entry: RegistryEntry): void;
  discover(): Promise<readonly RegistryEntry[]>;
  search(query: string): Promise<readonly RegistryEntry[]>;
}

export function createRegistryEngine(): RegistryEngine {
  const entries: RegistryEntry[] = [];

  return {
    registerEntry: entry => entries.push(entry),
    discover: async () => [...entries],
    search: async query =>
      entries.filter(e => e.name.includes(query) || e.category.includes(query)),
  };
}
