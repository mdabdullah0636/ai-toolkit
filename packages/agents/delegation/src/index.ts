export type DelegationRequest = {
  readonly task: string;
  readonly preferredAgent?: string;
  readonly priority: number;
};

export type DelegationResult = {
  readonly taskId: string;
  readonly assignedTo: string;
  readonly status: 'accepted' | 'rejected' | 'pending';
  readonly result?: string;
};

export interface DelegationManager {
  delegate(request: DelegationRequest): Promise<DelegationResult>;
  approve(taskId: string): Promise<void>;
  reject(taskId: string, reason: string): Promise<void>;
}

export interface DelegationEngine {
  registerDelegator(name: string, manager: DelegationManager): void;
  getDelegator(name: string): DelegationManager | undefined;
  delegate(request: DelegationRequest): Promise<DelegationResult>;
}

export function createDelegationEngine(): DelegationEngine {
  const delegators = new Map<string, DelegationManager>();

  return {
    registerDelegator: (name, manager) => delegators.set(name, manager),
    getDelegator: name => delegators.get(name),
    delegate: async request => ({
      taskId: `task_${Date.now()}`,
      assignedTo: request.preferredAgent ?? 'default',
      status: 'pending',
    }),
  };
}
