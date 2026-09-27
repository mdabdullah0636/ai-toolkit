export type Secret = {
  readonly id: string;
  readonly key: string;
  readonly encrypted: boolean;
  readonly rotated: boolean;
};

export interface SecretsManager {
  store(secret: Secret): Promise<void>;
  retrieve(id: string): Promise<Secret | undefined>;
  rotate(id: string): Promise<void>;
}

export interface SecretsEngine {
  registerManager(name: string, manager: SecretsManager): void;
  getManager(name: string): SecretsManager | undefined;
  store(secret: Secret): Promise<void>;
}

export function createSecretsEngine(): SecretsEngine {
  const managers = new Map<string, SecretsManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    store: async () => {},
  };
}
