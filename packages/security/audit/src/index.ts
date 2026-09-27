export type AuditEntry = {
  readonly id: string;
  readonly action: string;
  readonly actor: string;
  readonly resource: string;
  readonly timestamp: number;
  readonly result: boolean;
};

export interface AuditLogger {
  log(entry: AuditEntry): Promise<void>;
  query(filter: {
    action?: string;
    actor?: string;
  }): Promise<readonly AuditEntry[]>;
}

export interface AuditEngine {
  registerLogger(name: string, logger: AuditLogger): void;
  getLogger(name: string): AuditLogger | undefined;
  log(entry: AuditEntry): Promise<void>;
}

export function createAuditEngine(): AuditEngine {
  const loggers = new Map<string, AuditLogger>();

  return {
    registerLogger: (name, logger) => loggers.set(name, logger),
    getLogger: name => loggers.get(name),
    log: async () => {},
  };
}
