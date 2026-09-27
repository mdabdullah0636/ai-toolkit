export type RuntimeContext = {
  readonly executionId: string;
  readonly state: Record<string, unknown>;
  readonly startTime: number;
  readonly endTime?: number;
  readonly contextStack: string[];
};

export interface RuntimeTracker {
  start(executionId: string): void;
  track(executionId: string, state: Record<string, unknown>): void;
  end(executionId: string): void;
  getContext(executionId: string): RuntimeContext | undefined;
}

export interface RuntimeContextManager {
  createContext(): string;
  trackState(executionId: string, state: Record<string, unknown>): void;
  getContext(executionId: string): RuntimeContext | undefined;
  closeContext(executionId: string): void;
  listContexts(): readonly RuntimeContext[];
}

export function createRuntimeContextManager(): RuntimeContextManager {
  const contexts = new Map<string, RuntimeContext>();
  let counter = 0;

  const tracker = {
    start: (executionId: string) => {
      contexts.set(executionId, {
        executionId,
        state: {},
        startTime: Date.now(),
        contextStack: [],
      });
    },
    track: (executionId: string, state: Record<string, unknown>) => {
      const ctx = contexts.get(executionId);
      if (ctx) {
        Object.assign(ctx.state, state);
      }
    },
    end: (executionId: string) => {
      const ctx = contexts.get(executionId);
      if (ctx) {
        contexts.set(executionId, { ...ctx, endTime: Date.now() });
      }
    },
    getContext: (executionId: string) => contexts.get(executionId),
  };

  return {
    createContext: () => {
      const id = `exec_${++counter}`;
      tracker.start(id);
      return id;
    },
    trackState: tracker.track.bind(tracker),
    getContext: tracker.getContext.bind(tracker),
    closeContext: executionId => {
      tracker.end(executionId);
    },
    listContexts: () => [...contexts.values()],
  };
}
