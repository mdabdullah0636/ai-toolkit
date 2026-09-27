export type AuthProvider = {
  readonly id: string;
  readonly type: string;
  readonly authenticate: () => Promise<boolean>;
};

export interface AuthManager {
  registerProvider(provider: AuthProvider): void;
  authenticate(providerId: string): Promise<boolean>;
  listProviders(): readonly AuthProvider[];
}

export interface AuthEngine {
  registerManager(name: string, manager: AuthManager): void;
  getManager(name: string): AuthManager | undefined;
  authenticate(providerId: string): Promise<boolean>;
}

export function createAuthEngine(): AuthEngine {
  const managers = new Map<string, AuthManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    authenticate: async () => true,
  };
}
