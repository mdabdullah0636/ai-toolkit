export type EpisodicEvent = {
  readonly id: string;
  readonly eventType: string;
  readonly content: string;
  readonly timestamp: number;
  readonly metadata: Record<string, unknown>;
};

export interface EpisodicStore {
  addEvent(event: EpisodicEvent): void;
  getEvents(type?: string): readonly EpisodicEvent[];
  getEvent(id: string): EpisodicEvent | undefined;
  clear(): void;
}

export interface EpisodicMemory {
  remember(event: EpisodicEvent): void;
  recall(type?: string): readonly EpisodicEvent[];
  forget(maxAge?: number): void;
}

export function createEpisodicMemory(): EpisodicMemory {
  const events: EpisodicEvent[] = [];

  return {
    remember: event => events.push(event),
    recall: type =>
      type ? events.filter(e => e.eventType === type) : [...events],
    forget: maxAge => {
      const cutoff = Date.now() - (maxAge ?? 86400000);
      for (let i = events.length - 1; i >= 0; i--) {
        if (events[i].timestamp < cutoff) events.splice(0, i + 1);
      }
    },
  };
}
