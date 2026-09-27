export type ScorerConfig = {
  readonly metric: string;
  readonly threshold: number;
};

export type Score = {
  readonly metric: string;
  readonly value: number;
  readonly passed: boolean;
};

export interface Scorer {
  score(data: Record<string, unknown>, config: ScorerConfig): Promise<Score>;
}

export interface ScorersEngine {
  registerScorer(name: string, scorer: Scorer): void;
  getScorer(name: string): Scorer | undefined;
  score(data: Record<string, unknown>, config: ScorerConfig): Promise<Score>;
}

export function createScorersEngine(): ScorersEngine {
  const scorers = new Map<string, Scorer>();

  return {
    registerScorer: (name, scorer) => scorers.set(name, scorer),
    getScorer: name => scorers.get(name),
    score: async (data, config) => ({
      metric: config.metric,
      value: Math.random(),
      passed: Math.random() > config.threshold,
    }),
  };
}
