export type PlanStep = {
  readonly id: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly completed: boolean;
};

export type Plan = {
  readonly id: string;
  readonly steps: readonly PlanStep[];
  readonly objective: string;
};

export interface Planner {
  createPlan(objective: string): Promise<Plan>;
  updatePlan(planId: string, steps: readonly PlanStep[]): Promise<Plan>;
  executePlan(plan: Plan): AsyncIterable<PlanStep>;
}

export interface PlanningEngine {
  registerPlanner(name: string, planner: Planner): void;
  getPlanner(name: string): Planner | undefined;
  createPlan(objective: string): Promise<Plan>;
}

export function createPlanningEngine(): PlanningEngine {
  const planners = new Map<string, Planner>();

  return {
    registerPlanner: (name, planner) => planners.set(name, planner),
    getPlanner: name => planners.get(name),
    createPlan: async objective => {
      return {
        id: `plan_${Date.now()}`,
        steps: [],
        objective,
      };
    },
  };
}
