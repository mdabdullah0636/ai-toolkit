export type ExecutionResult = {
  readonly workflowId: string;
  readonly stepId: string;
  readonly status: 'success' | 'failure' | 'pending';
  readonly output: unknown;
};

export interface StepExecutor {
  execute(stepId: string, input: unknown): Promise<ExecutionResult>;
}

export interface WorkflowEngineRuntime {
  execute(workflowId: string): AsyncIterable<ExecutionResult>;
  parallelExecute(workflowId: string): Promise<ExecutionResult[]>;
}

export interface WorkflowEngineManager {
  createEngine(name: string): WorkflowEngineRuntime;
  getEngine(name: string): WorkflowEngineRuntime | undefined;
}

export function createWorkflowEngineManager(): WorkflowEngineManager {
  const engines = new Map<string, WorkflowEngineRuntime>();

  return {
    createEngine: name => {
      const engine: WorkflowEngineRuntime = {
        execute: async function* () {
          yield { workflowId: '', stepId: '', status: 'success', output: null };
        },
        parallelExecute: async () => [],
      };
      engines.set(name, engine);
      return engine;
    },
    getEngine: name => engines.get(name),
  };
}
