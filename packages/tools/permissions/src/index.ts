export type Permission = {
  readonly resource: string;
  readonly action: string;
  readonly allowed: boolean;
  readonly subject: string;
};

export type PermissionPolicy = {
  readonly id: string;
  readonly rules: readonly Permission[];
  readonly effect: 'allow' | 'deny';
};

export interface PermissionChecker {
  check(permission: Permission): boolean;
  checkPolicy(policy: PermissionPolicy, action: string): boolean;
}

export interface PermissionEngine {
  check(permission: Permission): boolean;
  enforce(policy: PermissionPolicy): void;
  addPolicy(policy: PermissionPolicy): void;
}

export function createPermissionEngine(): PermissionEngine {
  const policies: PermissionPolicy[] = [];

  return {
    check: permission => {
      const policy = policies.find(p =>
        p.rules.some(
          r =>
            r.resource === permission.resource &&
            r.action === permission.action,
        ),
      );
      return policy?.effect === 'allow';
    },
    enforce: policy => {
      policies.push(policy);
    },
    addPolicy: policy => policies.push(policy),
  };
}
