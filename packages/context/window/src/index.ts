export type WindowConfig = {
  readonly maxTokens: number;
  readonly strategy: 'sliding' | 'expanding' | 'summarize';
  readonly compressionThreshold?: number;
};

export type WindowState = {
  readonly totalTokens: number;
  readonly usedTokens: number;
  readonly availableTokens: number;
  readonly overflow: boolean;
};

export interface WindowManager {
  configure(config: WindowConfig): void;
  getState(): WindowState;
  trim(tokensToRemove: number): void;
  checkOverflow(): boolean;
}

export function createWindowManager(config: WindowConfig): WindowManager {
  let totalTokens = config.maxTokens;
  let usedTokens = 0;
  let availableTokens = config.maxTokens;
  let overflow = false;

  const getState = (): WindowState => ({
    totalTokens,
    usedTokens,
    availableTokens,
    overflow,
  });

  return {
    configure: newConfig => {
      Object.assign(config, newConfig);
      totalTokens = config.maxTokens;
      availableTokens = config.maxTokens - usedTokens;
    },
    getState,
    trim: tokens => {
      usedTokens = Math.max(0, usedTokens - tokens);
      totalTokens = config.maxTokens;
      availableTokens = config.maxTokens - usedTokens;
      overflow = usedTokens > config.maxTokens;
    },
    checkOverflow: () => overflow,
  };
}
