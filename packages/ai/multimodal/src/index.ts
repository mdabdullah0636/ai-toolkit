export type MultimodalInput = {
  readonly text?: string;
  readonly image?: Uint8Array;
  readonly audio?: Uint8Array;
  readonly video?: Uint8Array;
};

export type MultimodalOutput = {
  readonly text: string;
  readonly confidence: number;
  readonly modalities: readonly string[];
};

export interface MultimodalProcessor {
  process(input: MultimodalInput): Promise<MultimodalOutput>;
  processStream(input: MultimodalInput): AsyncIterable<MultimodalOutput>;
}

export interface MultimodalRuntime {
  registerProcessor(processor: MultimodalProcessor): void;
  getProcessor(mediatype: string): MultimodalProcessor | undefined;
  listProcessors(): readonly MultimodalProcessor[];
}

export function createMultimodalRuntime(): MultimodalRuntime {
  const processors = new Map<string, MultimodalProcessor>();

  return {
    registerProcessor: processor =>
      processors.set(processor.constructor.name, processor),
    getProcessor: mediatype => processors.get(mediatype),
    listProcessors: () => [...processors.values()],
  };
}
