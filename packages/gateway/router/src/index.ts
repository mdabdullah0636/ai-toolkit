export type RouteConfig = {
  readonly path: string;
  readonly method: string;
  readonly handler: string;
  readonly middleware?: readonly string[];
};

export interface Router {
  addRoute(config: RouteConfig): void;
  getRoute(path: string): RouteConfig | undefined;
  listRoutes(): readonly RouteConfig[];
}

export interface RouterEngine {
  registerRouter(name: string, router: Router): void;
  getRouter(name: string): Router | undefined;
}

export function createRouterEngine(): RouterEngine {
  const routers = new Map<string, Router>();

  return {
    registerRouter: (name, router) => routers.set(name, router),
    getRouter: name => routers.get(name),
  };
}
