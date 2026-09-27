export type TelemetryEvent = {
  readonly id: string;
  readonly type: string;
  readonly timestamp: number;
  readonly data: Record<string, unknown>;
};

export interface TelemetryCollector {
  collect(event: TelemetryEvent): Promise<void>;
  getEvents(type: string): Promise<readonly TelemetryEvent[]>;
}

export interface TelemetryEngine {
  registerCollector(name: string, collector: TelemetryCollector): void;
  getCollector(name: string): TelemetryCollector | undefined;
  collect(event: TelemetryEvent): Promise<void>;
}

export function createTelemetryEngine(): TelemetryEngine {
  const collectors = new Map<string, TelemetryCollector>();

  return {
    registerCollector: (name, collector) => collectors.set(name, collector),
    getCollector: name => collectors.get(name),
    collect: async () => {},
  };
}
