export type ChainOfThought = {
  readonly step: number;
  readonly reasoning: string;
  readonly conclusion: string;
};

export type ReasoningConfig = {
  readonly modelId: string;
  readonly maxSteps?: number;
  readonly depth?: number;
};

export interface Reasoner {
  reason(prompt: string, config?: ReasoningConfig): Promise<ChainOfThought[]>;
  stream(
    prompt: string,
    config?: ReasoningConfig,
  ): AsyncIterable<ChainOfThought>;
}

export interface ReasoningEngine {
  registerReasoner(modelId: string, reasoner: Reasoner): void;
  getReasoner(modelId: string): Reasoner | undefined;
  listReasoners(): readonly Reasoner[];
}

export function createReasoningEngine(): ReasoningEngine {
  const reasoners = new Map<string, Reasoner>();

  return {
    registerReasoner: (modelId, reasoner) => reasoners.set(modelId, reasoner),
    getReasoner: modelId => reasoners.get(modelId),
    listReasoners: () => [...reasoners.values()],
  };
}
