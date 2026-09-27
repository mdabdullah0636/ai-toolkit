export type TeamMember = {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly capabilities: readonly string[];
};

export type TeamTask = {
  readonly id: string;
  readonly description: string;
  readonly assignedTo: string[];
  readonly completed: boolean;
};

export interface Team {
  addMember(member: TeamMember): void;
  assignTask(task: TeamTask): void;
  getProgress(): number;
  coordinate(): Promise<string>;
}

export interface TeamOrchestrator {
  createTeam(name: string): Team;
  getTeam(id: string): Team | undefined;
  listTeams(): readonly Team[];
}

export function createTeamOrchestrator(): TeamOrchestrator {
  const teams = new Map<string, Team>();

  return {
    createTeam: name => {
      const team: Team = {
        addMember: () => {},
        assignTask: () => {},
        getProgress: () => 0,
        coordinate: async () => '',
      };
      teams.set(name, team);
      return team;
    },
    getTeam: id => teams.get(id),
    listTeams: () => [...teams.values()],
  };
}
