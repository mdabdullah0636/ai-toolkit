export type ConversationTurn = {
  readonly role: 'user' | 'assistant' | 'system';
  readonly content: string;
  readonly timestamp: number;
};

export type ShortTermMemoryConfig = {
  readonly maxTurns?: number;
  readonly maxTokens?: number;
  readonly ttl?: number;
};

export interface ShortTermStore {
  addTurn(turn: ConversationTurn): void;
  getTurns(): readonly ConversationTurn[];
  clear(): void;
}

export interface ShortTermMemory {
  remember(turn: ConversationTurn): void;
  recall(window?: number): readonly ConversationTurn[];
  forget(maxAge?: number): void;
}

export function createShortTermMemory(
  config?: ShortTermMemoryConfig,
): ShortTermMemory {
  const turns: ConversationTurn[] = [];
  const maxTurns = config?.maxTurns ?? 100;

  return {
    remember: turn => {
      turns.push(turn);
      if (turns.length > maxTurns) turns.shift();
    },
    recall: window => turns.slice(-(window ?? turns.length)),
    forget: maxAge => {
      const cutoff = Date.now() - (maxAge ?? 3600000);
      for (let i = turns.length - 1; i >= 0; i--) {
        if (turns[i].timestamp < cutoff) turns.splice(0, i + 1);
      }
    },
  };
}
