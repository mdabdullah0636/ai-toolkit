export type Policy = {
  readonly id: string;
  readonly rules: readonly string[];
  readonly effect: 'allow' | 'deny';
};

export interface PolicyEngine {
  evaluate(policy: Policy, action: string): boolean;
  addPolicy(policy: Policy): void;
  removePolicy(policyId: string): void;
}

export interface PolicyEngineRuntime {
  registerEngine(name: string, engine: PolicyEngine): void;
  getEngine(name: string): PolicyEngine | undefined;
  evaluate(policy: Policy, action: string): boolean;
}

export function createPolicyEngineRuntime(): PolicyEngineRuntime {
  const engines = new Map<string, PolicyEngine>();

  return {
    registerEngine: (name, engine) => engines.set(name, engine),
    getEngine: name => engines.get(name),
    evaluate: () => true,
  };
}
