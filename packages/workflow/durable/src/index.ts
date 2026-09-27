export type DurableExecution = {
  readonly executionId: string;
  readonly workflowId: string;
  readonly state: Record<string, unknown>;
  readonly persisted: boolean;
  readonly createdAt: number;
};

export interface DurableStore {
  persist(execution: DurableExecution): Promise<void>;
  restore(executionId: string): Promise<DurableExecution | undefined>;
  delete(executionId: string): Promise<void>;
}

export interface DurableEngine {
  persist(data: DurableExecution): Promise<void>;
  restore(executionId: string): Promise<DurableExecution | undefined>;
  checkpoint(
    executionId: string,
    state: Record<string, unknown>,
  ): Promise<void>;
}

export function createDurableEngine(store: DurableStore): DurableEngine {
  return {
    persist: data => store.persist(data),
    restore: id => store.restore(id),
    checkpoint: (executionId, state) =>
      store.restore(executionId).then(async exec => {
        if (exec) await store.persist({ ...exec, state });
      }),
  };
}
