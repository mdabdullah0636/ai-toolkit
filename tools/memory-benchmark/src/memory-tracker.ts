export interface MemorySample {
  timestamp: number;
  heapUsed: number;
  heapDelta: number;
  rss: number;
}

export interface MemoryResult<T> {
  result: T;
  metrics: {
    heapBefore: number;
    heapAfter: number;
    heapDelta: number;
    heapGrowthRate: number;
    peakRSS: number;
    durationMs: number;
  };
}

export interface MemoryMeasurementOptions {
  warmup?: boolean;
  iterations?: number;
}

let peakHeap = 0;

export function resetPeak(): void {
  peakHeap = 0;
}

export function getPeakHeap(): number {
  return peakHeap;
}

function captureHeap(): { heapUsed: number; heapTotal: number; rss: number } {
  const usage = process.memoryUsage();
  const heapUsed = usage.heapUsed;
  const rss = usage.rss;

  if (heapUsed > peakHeap) {
    peakHeap = heapUsed;
  }

  return { heapUsed, heapTotal: usage.heapTotal, rss };
}

export async function measureMemory<T>(
  fn: () => Promise<T>,
  options?: MemoryMeasurementOptions,
): Promise<MemoryResult<T>> {
  const iterations = options?.iterations ?? 1;
  const warmup = options?.warmup ?? false;

  let lastResult: T;
  let bestDuration = Infinity;
  let heapBeforeTotal = 0;
  let heapAfterTotal = 0;
  let peakRSSTotal = 0;
  let durationTotal = 0;

  const runCount = warmup ? iterations + 1 : iterations;

  for (let i = 0; i < runCount; i++) {
    const heapBefore = captureHeap();
    const start = performance.now();

    try {
      lastResult = await fn();
    } catch (error) {
      const end = performance.now();
      const heapAfter = captureHeap();
      throw Object.assign(new Error(String(error)), {
        metrics: {
          heapBefore: heapBefore.heapUsed,
          heapAfter: heapAfter.heapUsed,
          heapDelta: heapAfter.heapUsed - heapBefore.heapUsed,
          peakRSS: heapAfter.rss,
          durationMs: end - start,
        },
      });
    }

    const end = performance.now();
    const heapAfter = captureHeap();
    const duration = end - start;

    if (i >= (warmup ? 1 : 0)) {
      const idx = i - (warmup ? 1 : 0);
      if (duration < bestDuration) {
        bestDuration = duration;
      }
      heapBeforeTotal += heapBefore.heapUsed;
      heapAfterTotal += heapAfter.heapUsed;
      peakRSSTotal += heapAfter.rss;
      durationTotal += duration;
    }
  }

  const count = warmup ? iterations : iterations;
  const heapBefore = heapBeforeTotal / count;
  const heapAfter = heapAfterTotal / count;
  const heapDelta = heapAfter - heapBefore;
  const heapGrowthRate = bestDuration > 0 ? heapDelta / bestDuration : 0;
  const peakRSS = peakRSSTotal / count;
  const durationMs = durationTotal / count;

  return {
    result: lastResult!,
    metrics: {
      heapBefore,
      heapAfter,
      heapDelta,
      heapGrowthRate,
      peakRSS,
      durationMs,
    },
  };
}
