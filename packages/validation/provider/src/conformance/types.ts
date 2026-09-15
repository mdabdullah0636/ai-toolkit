import type { LanguageModelV3 } from '../language-model/v3/language-model-v3';
import type { EmbeddingModelV3 } from '../embedding-model/v3/embedding-model-v3';
import type { ImageModelV3 } from '../image-model/v3/image-model-v3';
import type { SpeechModelV3 } from '../speech-model/v3/speech-model-v3';
import type { TranscriptionModelV3 } from '../transcription-model/v3/transcription-model-v3';
import type { RerankingModelV3 } from '../reranking-model/v3/reranking-model-v3';
import type { VideoModelV3 } from '../video-model/v3/video-model-v3';

export type TestLanguageModelFn = () => LanguageModelV3;
export type TestEmbeddingModelFn = () => EmbeddingModelV3;
export type TestImageModelFn = () => ImageModelV3;
export type TestSpeechModelFn = () => SpeechModelV3;
export type TestTranscriptionModelFn = () => TranscriptionModelV3;
export type TestRerankingModelFn = () => RerankingModelV3;
export type TestVideoModelFn = () => VideoModelV3;

export interface ConformanceTestOptions {
  baseUrl?: string;
  apiKey?: string;
  fetch?: any;
  [key: string]: any;
}

export interface LanguageModelConformanceConfig {
  model: TestLanguageModelFn;
  options?: ConformanceTestOptions;
  /** Whether the provider supports streaming */
  supportsStreaming?: boolean;
  /** Whether the provider supports tool calling */
  supportsToolCalling?: boolean;
  /** Whether the provider supports structured output */
  supportsStructuredOutput?: boolean;
  /** Whether the provider supports usage reporting */
  supportsUsage?: boolean;
}

export interface EmbeddingModelConformanceConfig {
  model: TestEmbeddingModelFn;
  options?: ConformanceTestOptions;
  /** Whether the provider supports batch embedding */
  supportsBatch?: boolean;
}

export interface ImageModelConformanceConfig {
  model: TestImageModelFn;
  options?: ConformanceTestOptions;
}

export interface SpeechModelConformanceConfig {
  model: TestSpeechModelFn;
  options?: ConformanceTestOptions;
}

export interface TranscriptionModelConformanceConfig {
  model: TestTranscriptionModelFn;
  options?: ConformanceTestOptions;
}

export interface RerankingModelConformanceConfig {
  model: TestRerankingModelFn;
  options?: ConformanceTestOptions;
}

export interface ConformanceTestSet {
  languageModel?: LanguageModelConformanceConfig;
  embeddingModel?: EmbeddingModelConformanceConfig;
  imageModel?: ImageModelConformanceConfig;
  speechModel?: SpeechModelConformanceConfig;
  transcriptionModel?: TranscriptionModelConformanceConfig;
  rerankingModel?: RerankingModelConformanceConfig;
}

export interface ConformanceResult {
  passed: number;
  failed: number;
  skipped: number;
  failures: string[];
}

export interface ConformanceContext {
  baseUrl?: string;
  apiKey?: string;
  fetch?: any;
}
