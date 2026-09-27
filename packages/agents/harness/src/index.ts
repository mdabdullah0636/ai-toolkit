export type HarnessProvider = {
  readonly id: string;
  readonly name: string;
  readonly capabilities: readonly string[];
};

export interface Harness {
  registerProvider(provider: HarnessProvider): void;
  getProvider(id: string): HarnessProvider | undefined;
  listProviders(): readonly HarnessProvider[];
  execute(input: string, providerId?: string): Promise<string>;
}

export interface HarnessEngine {
  registerHarness(name: string, harness: Harness): void;
  getHarness(name: string): Harness | undefined;
  execute(input: string, providerId?: string): Promise<string>;
}

export function createHarnessEngine(): HarnessEngine {
  const harnesses = new Map<string, Harness>();

  return {
    registerHarness: (name, harness) => harnesses.set(name, harness),
    getHarness: name => harnesses.get(name),
    execute: async (input, providerId) => {
      const harness = providerId
        ? harnesses.get(providerId)
        : harnesses.values().next().value;
      if (!harness) throw new Error('No harness available');
      return harness.execute(input);
    },
  };
}
