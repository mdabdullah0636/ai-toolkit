export type ExecutionResult = {
  readonly toolName: string;
  readonly success: boolean;
  readonly output: unknown;
  readonly duration: number;
  readonly error?: Error;
};

export interface AsyncToolExecutor {
  execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ExecutionResult>;
  executeStream(
    toolName: string,
    args: Record<string, unknown>,
  ): AsyncIterable<ExecutionResult>;
}

export interface ExecutionEngine {
  execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<ExecutionResult>;
  executeBatch(
    tools: readonly { toolName: string; args: Record<string, unknown> }[],
  ): Promise<readonly ExecutionResult[]>;
}

export function createExecutionEngine(): ExecutionEngine {
  return {
    execute: async (toolName, args) => ({
      toolName,
      success: true,
      output: null,
      duration: 0,
    }),
    executeBatch: async tools =>
      tools.map(t => ({
        toolName: t.toolName,
        success: true,
        output: null,
        duration: 0,
      })),
  };
}
