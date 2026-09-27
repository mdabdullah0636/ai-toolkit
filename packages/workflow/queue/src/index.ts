export type QueueItem = {
  readonly id: string;
  readonly workflowId: string;
  readonly payload: Record<string, unknown>;
  readonly priority: number;
  readonly status: 'pending' | 'processing' | 'completed' | 'failed';
};

export interface Queue {
  enqueue(item: QueueItem): Promise<void>;
  dequeue(): Promise<QueueItem | undefined>;
  peek(): Promise<QueueItem | undefined>;
  size(): Promise<number>;
}

export interface QueueManager {
  createQueue(name: string): Queue;
  getQueue(name: string): Queue | undefined;
  listQueues(): readonly Queue[];
}

export function createQueueManager(): QueueManager {
  const queues = new Map<string, Queue>();

  return {
    createQueue: name => {
      const queue: Queue = {
        enqueue: async () => {},
        dequeue: async () => undefined,
        peek: async () => undefined,
        size: async () => 0,
      };
      queues.set(name, queue);
      return queue;
    },
    getQueue: name => queues.get(name),
    listQueues: () => [...queues.values()],
  };
}
