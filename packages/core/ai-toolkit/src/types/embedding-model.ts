import {
  EmbeddingModelV2,
  EmbeddingModelV3,
  EmbeddingModelV3Embedding,
} from '@ai-toolkit/provider';

/**
Embedding model that is used by the AI TOOLKIT.
*/
export type EmbeddingModel =
  | string
  | EmbeddingModelV3
  | EmbeddingModelV2<string>;

/**
Embedding.
 */
export type Embedding = EmbeddingModelV3Embedding;
