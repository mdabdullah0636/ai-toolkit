export type LoadBalanceConfig = {
  readonly strategy: 'round-robin' | 'least-connections' | 'weighted';
  readonly healthCheckInterval: number;
};

export interface LoadBalancer {
  route(modelId: string): Promise<string>;
  addEndpoint(endpoint: string): void;
  removeEndpoint(endpoint: string): void;
}

export interface LoadBalancerEngine {
  registerLoadBalancer(name: string, balancer: LoadBalancer): void;
  getBalancer(name: string): LoadBalancer | undefined;
}

export function createLoadBalancerEngine(): LoadBalancerEngine {
  const balancers = new Map<string, LoadBalancer>();

  return {
    registerLoadBalancer: (name, balancer) => balancers.set(name, balancer),
    getBalancer: name => balancers.get(name),
  };
}
