export type CodeExecutionResult = {
  readonly executionId: string;
  readonly stdout: string;
  readonly stderr: string;
  readonly exitCode: number;
  readonly duration: number;
  readonly success: boolean;
};

export interface CodeExecutor {
  execute(code: string, language: string): Promise<CodeExecutionResult>;
  executeStream(code: string, language: string): AsyncIterable<string>;
}

export interface ExecutionEngine {
  execute(code: string, language: string): Promise<CodeExecutionResult>;
  setResourceLimits(limits: { memoryMB: number; cpuSeconds: number }): void;
}

export function createExecutionEngine(): ExecutionEngine {
  return {
    execute: async (code, language) => ({
      executionId: `exec_${Date.now()}`,
      stdout: '',
      stderr: '',
      exitCode: 0,
      duration: 0,
      success: true,
    }),
    setResourceLimits: () => {},
  };
}
