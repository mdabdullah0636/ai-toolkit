export type LogEntry = {
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly message: string;
  readonly timestamp: number;
  readonly context: Record<string, unknown>;
};

export interface Logger {
  log(entry: LogEntry): Promise<void>;
  query(level: string): Promise<readonly LogEntry[]>;
}

export interface LoggingEngine {
  registerLogger(name: string, logger: Logger): void;
  getLogger(name: string): Logger | undefined;
  log(entry: LogEntry): Promise<void>;
}

export function createLoggingEngine(): LoggingEngine {
  const loggers = new Map<string, Logger>();

  return {
    registerLogger: (name, logger) => loggers.set(name, logger),
    getLogger: name => loggers.get(name),
    log: async () => {},
  };
}
