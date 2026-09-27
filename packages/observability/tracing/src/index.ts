export type Span = {
  readonly id: string;
  readonly parentId?: string;
  readonly name: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly attributes: Record<string, unknown>;
};

export interface Tracer {
  startSpan(name: string, parentId?: string): Promise<Span>;
  endSpan(spanId: string): Promise<void>;
}

export interface TracingEngine {
  registerTracer(name: string, tracer: Tracer): void;
  getTracer(name: string): Tracer | undefined;
  startSpan(name: string, parentId?: string): Promise<Span>;
}

export function createTracingEngine(): TracingEngine {
  const tracers = new Map<string, Tracer>();

  return {
    registerTracer: (name, tracer) => tracers.set(name, tracer),
    getTracer: name => tracers.get(name),
    startSpan: async name => ({
      id: `span_${Date.now()}`,
      name,
      startTime: Date.now(),
      attributes: {},
    }),
  };
}
