export type AgentConfig = {
  readonly modelId: string;
  readonly name: string;
  readonly description?: string;
  readonly maxSteps?: number;
  readonly instructions?: string;
};

export type AgentStatus = 'idle' | 'running' | 'completed' | 'failed';

export type AgentResult = {
  readonly agentId: string;
  readonly status: AgentStatus;
  readonly output: string;
  readonly steps: number;
};

export interface Agent {
  execute(input: string): Promise<AgentResult>;
  stream(input: string): AsyncIterable<string>;
  stop(): void;
}

export interface AgentRegistry {
  registerAgent(name: string, agent: Agent): void;
  getAgent(name: string): Agent | undefined;
  listAgents(): readonly Agent[];
}

export function createAgentRegistry(): AgentRegistry {
  const agents = new Map<string, Agent>();

  return {
    registerAgent: (name, agent) => agents.set(name, agent),
    getAgent: name => agents.get(name),
    listAgents: () => [...agents.values()],
  };
}

export function createAgent(config: AgentConfig): Agent {
  let status: AgentStatus = 'idle';
  let stepCount = 0;

  return {
    execute: async input => {
      status = 'running';
      stepCount = 0;
      // Agent execution logic
      status = 'completed';
      return {
        agentId: config.name,
        status: 'completed',
        output: '',
        steps: stepCount,
      };
    },
    stream: async function* () {
      // Streaming execution
    },
    stop: () => {
      status = 'idle';
    },
  };
}
