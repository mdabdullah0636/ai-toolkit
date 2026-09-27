export type RegressionResult = {
  readonly experimentId: string;
  readonly regressionDetected: boolean;
  readonly degradation: number;
  readonly previousMetrics: Record<string, number>;
};

export interface RegressionDetector {
  detect(experimentId: string): Promise<RegressionResult>;
}

export interface RegressionEngine {
  registerDetector(name: string, detector: RegressionDetector): void;
  getDetector(name: string): RegressionDetector | undefined;
  detect(experimentId: string): Promise<RegressionResult>;
}

export function createRegressionEngine(): RegressionEngine {
  const detectors = new Map<string, RegressionDetector>();

  return {
    registerDetector: (name, detector) => detectors.set(name, detector),
    getDetector: name => detectors.get(name),
    detect: async () => ({
      experimentId: '',
      regressionDetected: false,
      degradation: 0,
      previousMetrics: {},
    }),
  };
}
