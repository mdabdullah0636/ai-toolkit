export type Event = {
  readonly id: string;
  readonly type: string;
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
};

export type EventHandler = (event: Event) => Promise<void>;

export interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(type: string, handler: EventHandler): void;
  unsubscribe(type: string, handler: EventHandler): void;
  listSubscriptions(type: string): readonly EventHandler[];
}

export interface EventEngine {
  publish(event: Event): Promise<void>;
  subscribe(type: string, handler: EventHandler): void;
  on(eventType: string, handler: EventHandler): void;
}

export function createEventEngine(): EventEngine {
  const subscribers = new Map<string, EventHandler[]>();

  return {
    publish: async event => {
      const handlers = subscribers.get(event.type) ?? [];
      await Promise.all(handlers.map(h => h(event)));
    },
    subscribe: (type, handler) => {
      const handlers = subscribers.get(type) ?? [];
      subscribers.set(type, [...handlers, handler]);
    },
    on: (type, handler) => {
      const handlers = subscribers.get(type) ?? [];
      subscribers.set(type, [...handlers, handler]);
    },
  };
}
