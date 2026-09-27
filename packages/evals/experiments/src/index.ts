export type Experiment = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly metrics: Record<string, number>;
  readonly status: 'draft' | 'running' | 'completed';
};

export interface ExperimentTracker {
  start(experiment: Experiment): Promise<void>;
  complete(
    experimentId: string,
    metrics: Record<string, number>,
  ): Promise<void>;
  getExperiment(id: string): Promise<Experiment | undefined>;
  listExperiments(): Promise<readonly Experiment[]>;
}

export interface ExperimentsEngine {
  registerTracker(name: string, tracker: ExperimentTracker): void;
  getTracker(name: string): ExperimentTracker | undefined;
  start(experiment: Experiment): Promise<void>;
}

export function createExperimentsEngine(): ExperimentsEngine {
  const trackers = new Map<string, ExperimentTracker>();

  return {
    registerTracker: (name, tracker) => trackers.set(name, tracker),
    getTracker: name => trackers.get(name),
    start: async () => {},
  };
}
