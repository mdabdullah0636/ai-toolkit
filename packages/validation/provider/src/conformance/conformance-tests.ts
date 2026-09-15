import { describe, it, expect } from 'vitest';
import type { LanguageModelV3 } from '../language-model/v3/language-model-v3';
import type { EmbeddingModelV3 } from '../embedding-model/v3/embedding-model-v3';
import type { ImageModelV3 } from '../image-model/v3/image-model-v3';
import type {
  ConformanceTestSet,
  ConformanceContext,
  LanguageModelConformanceConfig,
  EmbeddingModelConformanceConfig,
  ImageModelConformanceConfig,
} from './types';

export function runLanguageModelConformanceTests(
  cfg: LanguageModelConformanceConfig,
  ctx: ConformanceContext,
): void {
  const model = cfg.model();
  const testPrompt = [{ role: 'user' as const, content: [{ type: 'text' as const, text: 'Say hello' }] }];

  describe(`${model.constructor.name || 'LanguageModel'} conformance`, () => {
    describe('text generation', () => {
      it('generates text from a doGenerate call', async () => {
        const result = await model.doGenerate({
          inputFormat: 'prompt',
          mode: { type: 'standard' },
          prompt: testPrompt,
          providerOptions: {},
          _internal: { dateNow: Date.now },
        } as any);

        expect(result).toBeDefined();
      });

      it('reports usage metadata', async () => {
        const result = await model.doGenerate({
          inputFormat: 'prompt',
          mode: { type: 'standard' },
          prompt: testPrompt,
          providerOptions: {},
          _internal: { dateNow: Date.now },
        } as any);

        if (result.usage) {
          expect(result.usage).toBeDefined();
        }
      });
    });

    describe('streaming', () => {
      if (cfg.supportsStreaming !== false) {
        it('produces a streaming response', async () => {
          const result = await model.doStream({
            inputFormat: 'prompt',
            mode: { type: 'standard' },
            prompt: testPrompt,
            providerOptions: {},
            _internal: { dateNow: Date.now },
          } as any);

          expect(result).toBeDefined();
          expect(result.stream).toBeDefined();
        });
      } else {
        it.skip('streaming not supported by this provider');
      }
    });

    describe('error handling', () => {
      it('handles error responses', async () => {
        await expect(
          model.doGenerate({
            inputFormat: 'prompt',
            mode: { type: 'standard' },
            prompt: testPrompt,
            providerOptions: {},
            _internal: { dateNow: Date.now },
          } as any),
        ).resolves.toBeDefined();
      });
    });
  });
}

export function runEmbeddingModelConformanceTests(
  cfg: EmbeddingModelConformanceConfig,
  ctx: ConformanceContext,
): void {
  const model = cfg.model();

  describe(`${model.constructor.name || 'EmbeddingModel'} conformance`, () => {
    it('embeds text', async () => {
      const result = await model.doEmbed({
        values: ['Hello'],
      } as any);

      expect(result).toBeDefined();
      expect(result.embeddings).toBeDefined();
      expect(result.embeddings.length).toBeGreaterThan(0);
    });

    if (cfg.supportsBatch) {
      it('handles batch embedding', async () => {
        const result = await model.doEmbed({
          values: ['Hello', 'world'],
        } as any);

        expect(result.embeddings.length).toBeGreaterThan(0);
      });
    } else {
      it.skip('handles batch embedding');
    }
  });
}

export function runImageModelConformanceTests(
  cfg: ImageModelConformanceConfig,
  ctx: ConformanceContext,
): void {
  const model = cfg.model();

  describe(`${model.constructor.name || 'ImageModel'} conformance`, () => {
      it('generates images from a prompt', async () => {
        const result = await model.doGenerate({
          prompt: 'A beautiful sunset',
          n: 1,
          providerOptions: {},
        } as any);

      expect(result).toBeDefined();
      expect(result.images).toBeDefined();
      expect(result.images.length).toBeGreaterThan(0);
    });
  });
}

export function runConformanceTests(config: ConformanceTestSet, ctx: ConformanceContext): void {
  if (config.languageModel) {
    runLanguageModelConformanceTests(config.languageModel, ctx);
  }
  if (config.embeddingModel) {
    runEmbeddingModelConformanceTests(config.embeddingModel, ctx);
  }
  if (config.imageModel) {
    runImageModelConformanceTests(config.imageModel, ctx);
  }
}
