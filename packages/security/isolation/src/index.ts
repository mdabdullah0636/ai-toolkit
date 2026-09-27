export type IsolationBoundary = {
  readonly id: string;
  readonly resource: string;
  readonly tenant: string;
  readonly isolated: boolean;
};

export interface IsolationManager {
  createBoundary(boundary: IsolationBoundary): Promise<void>;
  enforce(boundaryId: string): Promise<void>;
  checkIsolation(boundaryId: string): Promise<boolean>;
}

export interface IsolationEngine {
  registerManager(name: string, manager: IsolationManager): void;
  getManager(name: string): IsolationManager | undefined;
  createBoundary(boundary: IsolationBoundary): Promise<void>;
}

export function createIsolationEngine(): IsolationEngine {
  const managers = new Map<string, IsolationManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    createBoundary: async () => {},
  };
}
