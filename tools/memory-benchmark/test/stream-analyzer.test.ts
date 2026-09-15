import { describe, it, expect } from 'vitest';
import { measureStream } from '../src/stream-analyzer';

function asyncGeneratorToStream<T>(
  generator: AsyncGenerator<T>,
): ReadableStream<T> {
  return new ReadableStream<T>({
    async pull(controller) {
      const { done, value } = await generator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* generateChunks(count: number): AsyncGenerator<number> {
  for (let i = 0; i < count; i++) {
    yield i;
  }
}

describe('measureStream', () => {
  it('measures memory for a simple stream', async () => {
    const stream = asyncGeneratorToStream(generateChunks(100));
    const result = await measureStream(stream, chunk => {
      void chunk;
    });

    expect(result.metrics.chunkCount).toBe(100);
    expect(result.samples.length).toBeGreaterThan(0);
    expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('samples at configured intervals', async () => {
    const stream = asyncGeneratorToStream(generateChunks(10));
    const result = await measureStream(
      stream,
      chunk => {
        void chunk;
      },
      { sampleEvery: 2 },
    );

    for (const sample of result.samples) {
      expect(sample.chunkIndex % 2).toBe(0);
    }
  });

  it('reports warnings when threshold exceeded', async () => {
    const stream = asyncGeneratorToStream(generateChunks(50));
    const result = await measureStream(
      stream,
      chunk => {
        void chunk;
      },
      { maxHeapDelta: 1 },
    );

    if (result.metrics.totalGrowth > 1) {
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].type).toBe('threshold-exceeded');
    }
  });

  it('tracks peak heap correctly', async () => {
    const stream = asyncGeneratorToStream(generateChunks(20));
    const result = await measureStream(stream, chunk => {
      void chunk;
    });

    expect(result.metrics.peakHeap).toBeGreaterThanOrEqual(0);
    expect(typeof result.metrics.peakHeap).toBe('number');
  });

  it('handles empty stream', async () => {
    async function* empty(): AsyncGenerator<number> {
      // no yields
    }

    const stream = asyncGeneratorToStream(empty());
    const result = await measureStream(stream, chunk => {
      void chunk;
    });

    expect(result.metrics.chunkCount).toBe(0);
    expect(result.samples).toHaveLength(0);
    expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('reports growth metrics', async () => {
    const stream = asyncGeneratorToStream(generateChunks(100));
    const result = await measureStream(stream, chunk => {
      void chunk;
    });

    expect(typeof result.metrics.growthPerChunk).toBe('number');
    expect(typeof result.metrics.growthRate).toBe('number');
    expect(result.metrics.chunkCount).toBe(100);
  });
});
