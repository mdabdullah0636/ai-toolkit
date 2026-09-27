export type Evaluation = {
  readonly id: string;
  readonly name: string;
  readonly modelId: string;
  readonly metrics: Record<string, number>;
  readonly status: 'pending' | 'running' | 'completed' | 'failed';
};

export interface Evaluator {
  evaluate(evaluation: Evaluation): Promise<Record<string, number>>;
}

export interface EvaluationEngine {
  registerEvaluator(name: string, evaluator: Evaluator): void;
  getEvaluator(name: string): Evaluator | undefined;
  run(evaluation: Evaluation): Promise<Record<string, number>>;
}

export function createEvaluationEngine(): EvaluationEngine {
  const evaluators = new Map<string, Evaluator>();

  return {
    registerEvaluator: (name, evaluator) => evaluators.set(name, evaluator),
    getEvaluator: name => evaluators.get(name),
    run: async evaluation => {
      const evaluator = evaluators.values().next().value;
      if (evaluator) return evaluator.evaluate(evaluation);
      return {};
    },
  };
}
