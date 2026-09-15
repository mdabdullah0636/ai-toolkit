import { describe, it, expect } from 'vitest';
import { measureMemory, resetPeak, getPeakHeap } from '../src/memory-tracker';

describe('measureMemory', () => {
  it('measures heap delta for a simple operation', async () => {
    const result = await measureMemory(async () => {
      return new Array(1000).fill(0).length;
    });

    expect(result.result).toBe(1000);
    expect(result.metrics.heapDelta).toBeGreaterThanOrEqual(0);
    expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.metrics.heapBefore).toBeGreaterThanOrEqual(0);
    expect(result.metrics.heapAfter).toBeGreaterThanOrEqual(0);
  });

  it('measures heap delta for async operations', async () => {
    const result = await measureMemory(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'done';
    });

    expect(result.result).toBe('done');
    expect(result.metrics).toBeDefined();
  });

  it('preserves thrown error with metrics', async () => {
    const errorFn = async () => {
      throw new Error('test error');
    };

    try {
      await measureMemory(errorFn);
      expect.fail('should have thrown');
    } catch (error: unknown) {
      const typed = error as Error & { metrics?: Record<string, number> };
      expect(typed.message).toContain('test error');
      expect(typed.metrics).toBeDefined();
      expect(typeof typed.metrics!.heapDelta).toBe('number');
    }
  });

  it('runs multiple iterations when specified', async () => {
    const result = await measureMemory(
      async () => {
        return 42;
      },
      { iterations: 3 },
    );

    expect(result.result).toBe(42);
    expect(result.metrics.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('supports warmup iterations', async () => {
    const result = await measureMemory(
      async () => {
        return 'warm';
      },
      { iterations: 2, warmup: true },
    );

    expect(result.result).toBe('warm');
  });

  it('heapDelta can be zero for trivial operations', async () => {
    const result = await measureMemory(async () => {
      return 1;
    });

    expect(result.result).toBe(1);
    expect(typeof result.metrics.heapDelta).toBe('number');
  });
});

describe('resetPeak', () => {
  it('resets the peak heap tracker', async () => {
    resetPeak();
    const peak1 = getPeakHeap();

    await measureMemory(async () => {
      new Array(10000).fill(0);
    });
    const peak2 = getPeakHeap();

    resetPeak();
    const peak3 = getPeakHeap();

    expect(peak3).toBeLessThanOrEqual(peak1);
    expect(peak2).toBeGreaterThanOrEqual(peak1);
  });
});
