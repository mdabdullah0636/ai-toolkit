export type WorkflowDefinition = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly steps: readonly WorkflowStep[];
};

export type WorkflowStep = {
  readonly id: string;
  readonly action: string;
  readonly dependencies: readonly string[];
};

export type WorkflowStatus =
  | 'draft'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface WorkflowEngine {
  register(workflow: WorkflowDefinition): void;
  get(id: string): WorkflowDefinition | undefined;
  run(id: string): Promise<WorkflowStatus>;
  cancel(id: string): void;
}

export interface WorkflowManager {
  create(definition: WorkflowDefinition): WorkflowDefinition;
  execute(id: string): Promise<WorkflowStatus>;
  list(): readonly WorkflowDefinition[];
}

export function createWorkflowEngine(): WorkflowEngine {
  const workflows = new Map<string, WorkflowDefinition>();

  return {
    register: workflow => workflows.set(workflow.id, workflow),
    get: id => workflows.get(id),
    run: async id => {
      const wf = workflows.get(id);
      if (!wf) throw new Error(`Workflow "${id}" not found`);
      return 'completed';
    },
    cancel: id => workflows.delete(id),
  };
}
