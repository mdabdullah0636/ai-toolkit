export type NetworkPolicy = {
  readonly allowList: readonly string[];
  readonly denyList: readonly string[];
  readonly allowPorts: readonly number[];
};

export interface NetworkManager {
  restrict(policy: NetworkPolicy): void;
  isAllowed(url: string): boolean;
  getStats(): { bytesIn: number; bytesOut: number };
}

export interface SandboxNetwork {
  createNetwork(sandboxId: string): NetworkManager;
  restrict(sandboxId: string, policy: NetworkPolicy): void;
}

export function createSandboxNetwork(): SandboxNetwork {
  const networks = new Map<string, NetworkManager>();

  return {
    createNetwork: sandboxId => {
      const network: NetworkManager = {
        restrict: () => {},
        isAllowed: () => true,
        getStats: () => ({ bytesIn: 0, bytesOut: 0 }),
      };
      networks.set(sandboxId, network);
      return network;
    },
    restrict: (sandboxId, policy) => {
      const network = networks.get(sandboxId);
      if (network) network.restrict(policy);
    },
  };
}
