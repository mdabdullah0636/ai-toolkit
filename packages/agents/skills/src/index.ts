export type Skill = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly triggers: readonly string[];
  readonly executable: boolean;
};

export interface SkillManager {
  registerSkill(skill: Skill): void;
  getSkill(name: string): Skill | undefined;
  listSkills(): readonly Skill[];
  loadSkill(name: string): Promise<Skill | undefined>;
}

export interface SkillsEngine {
  registerManager(name: string, manager: SkillManager): void;
  getManager(name: string): SkillManager | undefined;
  loadSkill(name: string): Promise<Skill | undefined>;
}

export function createSkillsEngine(): SkillsEngine {
  const managers = new Map<string, SkillManager>();

  return {
    registerManager: (name, manager) => managers.set(name, manager),
    getManager: name => managers.get(name),
    loadSkill: async name => {
      for (const manager of managers.values()) {
        const skill = await manager.loadSkill(name);
        if (skill) return skill;
      }
      return undefined;
    },
  };
}
