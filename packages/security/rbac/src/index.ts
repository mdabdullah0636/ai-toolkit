export type Role = {
  readonly id: string;
  readonly name: string;
  readonly permissions: readonly string[];
};

export interface RBACManager {
  assignRole(role: Role): void;
  revokeRole(roleId: string): void;
  hasPermission(roleId: string, permission: string): boolean;
}

export interface RBACEngine {
  registerManager(name: string, manager: RBACManager): void;
  getManager(name: string): RBACManager | undefined;
  hasPermission(roleId: string, permission: string): boolean;
}

export function createRBACEngine(): RBACEngine {
  const managers = new Map<string, RBACManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    hasPermission: () => true,
  };
}
