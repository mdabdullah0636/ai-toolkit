export type IsolationLevel = 'container' | 'vm' | 'process' | 'namespace';

export type IsolationConfig = {
  readonly level: IsolationLevel;
  readonly seccomp?: boolean;
  readonly namespaces?: boolean;
  readonly cgroups?: boolean;
};

export interface Isolator {
  isolate(config: IsolationConfig): Promise<void>;
  release(): Promise<void>;
  getStatus(): IsolationLevel;
}

export interface IsolationEngine {
  createIsolation(config: IsolationConfig): Promise<Isolator>;
  enforce(resourceLimits: { memoryMB: number; cpuSeconds: number }): void;
}

export function createIsolationEngine(): IsolationEngine {
  return {
    createIsolation: async config => {
      const isolator: Isolator = {
        isolate: async () => {},
        release: async () => {},
        getStatus: () => config.level,
      };
      return isolator;
    },
    enforce: () => {},
  };
}
