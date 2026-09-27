export type Metric = {
  readonly name: string;
  readonly value: number;
  readonly timestamp: number;
  readonly unit: string;
  readonly tags: Record<string, string>;
};

export interface MetricsAggregator {
  record(metric: Metric): Promise<void>;
  query(name: string): Promise<number>;
  list(): Promise<readonly Metric[]>;
}

export interface MetricsEngine {
  registerAggregator(name: string, aggregator: MetricsAggregator): void;
  getAggregator(name: string): MetricsAggregator | undefined;
  record(metric: Metric): Promise<void>;
}

export function createMetricsEngine(): MetricsEngine {
  const aggregators = new Map<string, MetricsAggregator>();

  return {
    registerAggregator: (name, aggregator) => aggregators.set(name, aggregator),
    getAggregator: name => aggregators.get(name),
    record: async () => {},
  };
}
