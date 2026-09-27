export type Schedule = {
  readonly id: string;
  readonly workflowId: string;
  readonly cron: string;
  readonly trigger: 'cron' | 'event';
  readonly enabled: boolean;
};

export interface Scheduler {
  schedule(schedule: Schedule): void;
  cancel(id: string): void;
  list(): readonly Schedule[];
  triggerEvent(event: string): Promise<void>;
}

export interface SchedulerEngine {
  registerScheduler(name: string, scheduler: Scheduler): void;
  getScheduler(name: string): Scheduler | undefined;
  schedule(schedule: Schedule): void;
}

export function createSchedulerEngine(): SchedulerEngine {
  const schedulers = new Map<string, Scheduler>();

  return {
    registerScheduler: (name, scheduler) => schedulers.set(name, scheduler),
    getScheduler: name => schedulers.get(name),
    schedule: schedule => {
      const scheduler = schedulers.values().next().value;
      if (scheduler) scheduler.schedule(schedule);
    },
  };
}
