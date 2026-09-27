export type Benchmark = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly results: Record<string, number>;
};

export interface BenchmarkRunner {
  run(benchmark: Benchmark): Promise<Record<string, number>>;
}

export interface BenchmarksEngine {
  registerRunner(name: string, runner: BenchmarkRunner): void;
  getRunner(name: string): BenchmarkRunner | undefined;
  run(benchmark: Benchmark): Promise<Record<string, number>>;
}

export function createBenchmarksEngine(): BenchmarksEngine {
  const runners = new Map<string, BenchmarkRunner>();

  return {
    registerRunner: (name, runner) => runners.set(name, runner),
    getRunner: name => runners.get(name),
    run: async benchmark => ({ ...benchmark.results }),
  };
}
