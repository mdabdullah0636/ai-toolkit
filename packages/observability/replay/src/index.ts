export type ReplayEntry = {
  readonly executionId: string;
  readonly traces: readonly string[];
  readonly logs: readonly string[];
  readonly deterministic: boolean;
};

export interface ReplayEngine {
  record(
    executionId: string,
    traces: readonly string[],
    logs: readonly string[],
  ): Promise<void>;
  replay(executionId: string): Promise<ReplayEntry>;
  isDeterministic(executionId: string): Promise<boolean>;
}

export function createReplayEngine(): ReplayEngine {
  const recordings = new Map<string, ReplayEntry>();

  return {
    record: async () => {},
    replay: async () => ({
      executionId: '',
      traces: [],
      logs: [],
      deterministic: true,
    }),
    isDeterministic: async () => true,
  };
}
