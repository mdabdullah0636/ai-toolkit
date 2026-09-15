export interface StreamMemorySample {
  chunkIndex: number;
  heapUsed: number;
  heapDelta: number;
  rss: number;
  timestamp: number;
}

export interface StreamMemoryResult {
  samples: StreamMemorySample[];
  metrics: {
    peakHeap: number;
    totalGrowth: number;
    growthPerChunk: number;
    growthRate: number;
    chunkCount: number;
    durationMs: number;
  };
  warnings: Array<{
    type: string;
    message: string;
    threshold?: number;
    actual?: number;
  }>;
}

export interface StreamMeasurementOptions {
  sampleEvery?: number;
  maxHeapDelta?: number;
  maxGrowthPerChunk?: number;
}

export async function measureStream<T>(
  stream: ReadableStream<T>,
  consumer: (chunk: T) => void | Promise<void>,
  options?: StreamMeasurementOptions,
): Promise<StreamMemoryResult> {
  const sampleEvery = options?.sampleEvery ?? 1;
  const maxHeapDelta = options?.maxHeapDelta;
  const maxGrowthPerChunk = options?.maxGrowthPerChunk;

  const samples: StreamMemorySample[] = [];
  const warnings: StreamMemoryResult['warnings'] = [];

  let peakHeap = 0;
  let initialHeap = process.memoryUsage().heapUsed;
  let lastHeap = initialHeap;
  let chunkIndex = 0;
  let totalGrowth = 0;

  const startTime = performance.now();

  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      await consumer(value);
      chunkIndex++;

      if (chunkIndex % sampleEvery === 0) {
        const usage = process.memoryUsage();
        const heapUsed = usage.heapUsed;
        const heapDelta = heapUsed - initialHeap;

        if (heapUsed > peakHeap) {
          peakHeap = heapUsed;
        }

        samples.push({
          chunkIndex,
          heapUsed,
          heapDelta,
          rss: usage.rss,
          timestamp: performance.now(),
        });

        if (maxHeapDelta !== undefined && heapDelta > maxHeapDelta) {
          warnings.push({
            type: 'threshold-exceeded',
            message: `Heap delta ${formatBytes(heapDelta)} exceeds threshold ${formatBytes(maxHeapDelta)} at chunk ${chunkIndex}`,
            threshold: maxHeapDelta,
            actual: heapDelta,
          });
        }

        if (maxGrowthPerChunk !== undefined) {
          const growthSinceLast = heapUsed - lastHeap;
          if (growthSinceLast > maxGrowthPerChunk * sampleEvery) {
            warnings.push({
              type: 'growth-anomaly',
              message: `Growth ${formatBytes(growthSinceLast)} in last ${sampleEvery} chunks exceeds threshold ${formatBytes(maxGrowthPerChunk)}`,
              threshold: maxGrowthPerChunk,
              actual: growthSinceLast,
            });
          }
        }

        lastHeap = heapUsed;
        totalGrowth = heapDelta;
      }
    }
  } finally {
    reader.releaseLock();
  }

  const durationMs = performance.now() - startTime;
  const growthPerChunk = chunkIndex > 0 ? totalGrowth / chunkIndex : 0;
  const growthRate = durationMs > 0 ? totalGrowth / durationMs : 0;

  return {
    samples,
    metrics: {
      peakHeap,
      totalGrowth,
      growthPerChunk,
      growthRate,
      chunkCount: chunkIndex,
      durationMs,
    },
    warnings,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(2)} ${units[i]}`;
}
