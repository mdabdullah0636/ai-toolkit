import type { MemoryResult } from '../memory-tracker';
import type { StreamMemoryResult } from '../stream-analyzer';

export function jsonReport(result: MemoryResult<unknown>): string {
  return JSON.stringify(
    {
      type: 'memory',
      timestamp: new Date().toISOString(),
      metrics: {
        heapBefore: result.metrics.heapBefore,
        heapAfter: result.metrics.heapAfter,
        heapDelta: result.metrics.heapDelta,
        heapGrowthRate: result.metrics.heapGrowthRate,
        peakRSS: result.metrics.peakRSS,
        durationMs: result.metrics.durationMs,
      },
    },
    null,
    2,
  );
}

export function streamJsonReport(result: StreamMemoryResult): string {
  return JSON.stringify(
    {
      type: 'stream-memory',
      timestamp: new Date().toISOString(),
      samples: result.samples,
      metrics: {
        peakHeap: result.metrics.peakHeap,
        totalGrowth: result.metrics.totalGrowth,
        growthPerChunk: result.metrics.growthPerChunk,
        growthRate: result.metrics.growthRate,
        chunkCount: result.metrics.chunkCount,
        durationMs: result.metrics.durationMs,
      },
      warnings: result.warnings,
    },
    null,
    2,
  );
}
