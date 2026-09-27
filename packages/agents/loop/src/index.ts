export type Observation = {
  readonly toolCalls: readonly string[];
  readonly response: string;
  readonly metadata: Record<string, unknown>;
};

export type Action = {
  readonly tool: string;
  readonly input: Record<string, unknown>;
};

export type LoopStep = {
  readonly step: number;
  readonly observation: Observation;
  readonly action: Action;
};

export interface AgentLoop {
  run(input: string): AsyncIterable<LoopStep>;
  stop(): void;
}

export interface LoopEngine {
  registerLoop(name: string, loop: AgentLoop): void;
  getLoop(name: string): AgentLoop | undefined;
  runLoop(name: string, input: string): Promise<AsyncIterable<LoopStep>>;
}

export function createLoopEngine(): LoopEngine {
  const loops = new Map<string, AgentLoop>();

  return {
    registerLoop: (name, loop) => loops.set(name, loop),
    getLoop: name => loops.get(name),
    runLoop: async (name, input) => {
      const loop = loops.get(name);
      if (!loop) throw new Error(`Loop "${name}" not found`);
      return loop.run(input);
    },
  };
}
