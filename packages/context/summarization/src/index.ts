export type SummaryConfig = {
  readonly maxLength?: number;
  readonly preserveKeyPoints?: boolean;
  readonly includeMetadata?: boolean;
};

export type SummaryResult = {
  readonly summary: string;
  readonly tokenReduction: number;
  readonly keyPointsPreserved: boolean;
};

export interface Summarizer {
  summarize(text: string, config?: SummaryConfig): Promise<SummaryResult>;
  summarizeStream(text: string, config?: SummaryConfig): AsyncIterable<string>;
}

export interface SummarizationEngine {
  registerSummarizer(name: string, summarizer: Summarizer): void;
  getSummarizer(name: string): Summarizer | undefined;
  summarize(text: string, config?: SummaryConfig): Promise<SummaryResult>;
}

export function createSummarizationEngine(): SummarizationEngine {
  const summarizers = new Map<string, Summarizer>();

  return {
    registerSummarizer: (name, summarizer) => summarizers.set(name, summarizer),
    getSummarizer: name => summarizers.get(name),
    summarize: async (text, config) => {
      for (const summarizer of summarizers.values()) {
        return summarizer.summarize(text, config);
      }
      return {
        summary: text,
        tokenReduction: 0,
        keyPointsPreserved: true,
      };
    },
  };
}
