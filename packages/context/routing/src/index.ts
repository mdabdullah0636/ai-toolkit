export type RouteRule = {
  readonly match: (context: Record<string, unknown>) => boolean;
  readonly priority: number;
  readonly routeTo: string;
};

export type ContextRoute = {
  readonly id: string;
  readonly rules: readonly RouteRule[];
  readonly fallbackRoute: string;
};

export interface ContextRouter {
  addRule(rule: RouteRule): void;
  route(context: Record<string, unknown>): string;
  setFallback(fallback: string): void;
}

export interface RoutingEngine {
  createRouter(id: string, rules: readonly RouteRule[]): ContextRoute;
  getRouter(id: string): ContextRoute | undefined;
  route(context: Record<string, unknown>): string;
}

export function createRoutingEngine(): RoutingEngine {
  const routers = new Map<string, ContextRoute>();

  return {
    createRouter: (id, rules) => {
      const route: ContextRoute = {
        id,
        rules: [...rules].sort((a, b) => b.priority - a.priority),
        fallbackRoute: '',
      };
      routers.set(id, route);
      return route;
    },
    getRouter: id => routers.get(id),
    route: context => {
      for (const route of routers.values()) {
        for (const rule of route.rules) {
          if (rule.match(context)) {
            return rule.routeTo;
          }
        }
      }
      return routers.values().next().value?.fallbackRoute ?? '';
    },
  };
}
