export type CLIOptions = {
  readonly command: string;
  readonly args: readonly string[];
  readonly verbose: boolean;
};

export interface CLI {
  run(options: CLIOptions): Promise<void>;
  help(): Promise<void>;
}

export interface CLIEngine {
  registerCLI(name: string, cli: CLI): void;
  getCLI(name: string): CLI | undefined;
}

export function createCLIEngine(): CLIEngine {
  const clis = new Map<string, CLI>();

  return {
    registerCLI: (name, cli) => clis.set(name, cli),
    getCLI: name => clis.get(name),
  };
}
