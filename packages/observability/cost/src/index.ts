export type CostRecord = {
  readonly id: string;
  readonly modelId: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly cost: number;
  readonly currency: string;
  readonly timestamp: number;
};

export interface CostTracker {
  recordCost(record: CostRecord): Promise<void>;
  getTotalCost(): Promise<number>;
  getCostByModel(modelId: string): Promise<number>;
}

export interface CostEngine {
  registerTracker(name: string, tracker: CostTracker): void;
  getTracker(name: string): CostTracker | undefined;
  recordCost(record: CostRecord): Promise<void>;
}

export function createCostEngine(): CostEngine {
  const trackers = new Map<string, CostTracker>();

  return {
    registerTracker: (name, tracker) => trackers.set(name, tracker),
    getTracker: name => trackers.get(name),
    recordCost: async () => {},
  };
}
