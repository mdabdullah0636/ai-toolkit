export type SandboxConfig = {
  readonly resourceLimits: {
    readonly memoryMB: number;
    readonly cpuSeconds: number;
    readonly maxProcesses: number;
  };
  readonly isolation: 'container' | 'vm' | 'process';
};

export type SandboxResult = {
  readonly sandboxId: string;
  readonly success: boolean;
  readonly output: string;
  readonly error?: Error;
};

export interface Sandbox {
  execute(code: string, config?: SandboxConfig): Promise<SandboxResult>;
  terminate(): Promise<void>;
}

export interface SandboxManager {
  createSandbox(config: SandboxConfig): Sandbox;
  getSandbox(id: string): Sandbox | undefined;
  listSandboxes(): readonly Sandbox[];
}

export function createSandboxManager(): SandboxManager {
  const sandboxes = new Map<string, Sandbox>();

  return {
    createSandbox: config => {
      const sandbox: Sandbox = {
        execute: async () => ({
          sandboxId: 'sbx_0',
          success: true,
          output: '',
        }),
        terminate: async () => {},
      };
      sandboxes.set(sandbox.constructor.name, sandbox);
      return sandbox;
    },
    getSandbox: id => sandboxes.get(id),
    listSandboxes: () => [...sandboxes.values()],
  };
}
