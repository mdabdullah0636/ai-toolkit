export type CompressionResult = {
  readonly compressed: string;
  readonly originalTokens: number;
  readonly compressedTokens: number;
  readonly ratio: number;
  readonly preserved: boolean;
};

export interface Compressor {
  compress(text: string): Promise<CompressionResult>;
  decompress(compressed: string): Promise<string>;
}

export interface CompressionEngine {
  registerCompressor(name: string, compressor: Compressor): void;
  getCompressor(name: string): Compressor | undefined;
  compress(text: string): Promise<CompressionResult>;
}

export function createCompressionEngine(): CompressionEngine {
  const compressors = new Map<string, Compressor>();

  return {
    registerCompressor: (name, compressor) => compressors.set(name, compressor),
    getCompressor: name => compressors.get(name),
    compress: async text => {
      for (const compressor of compressors.values()) {
        return compressor.compress(text);
      }
      return {
        compressed: text,
        originalTokens: text.length,
        compressedTokens: text.length,
        ratio: 1,
        preserved: true,
      };
    },
  };
}
