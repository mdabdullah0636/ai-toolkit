import type { MemoryResult } from '../memory-tracker';
import type { StreamMemoryResult } from '../stream-analyzer';

export function textReport(result: MemoryResult<unknown>): string {
  const m = result.metrics;
  const lines = [
    'Memory Benchmark Results',
    '─'.repeat(40),
    `Duration:      ${m.durationMs.toFixed(2)} ms`,
    `Heap Before:   ${formatBytes(m.heapBefore)}`,
    `Heap After:    ${formatBytes(m.heapAfter)}`,
    `Heap Delta:    ${formatBytes(m.heapDelta)}`,
    `Growth Rate:   ${formatBytes(m.heapGrowthRate)}/ms`,
    `Peak RSS:      ${formatBytes(m.peakRSS)}`,
    '─'.repeat(40),
  ];
  return lines.join('\n');
}

export function streamTextReport(result: StreamMemoryResult): string {
  const m = result.metrics;
  const lines = [
    'Stream Memory Benchmark Results',
    '─'.repeat(40),
    `Chunks:        ${m.chunkCount}`,
    `Duration:      ${m.durationMs.toFixed(2)} ms`,
    `Peak Heap:     ${formatBytes(m.peakHeap)}`,
    `Total Growth:  ${formatBytes(m.totalGrowth)}`,
    `Growth/Chunk:  ${formatBytes(m.growthPerChunk)}`,
    `Growth Rate:   ${formatBytes(m.growthRate)}/ms`,
  ];

  if (result.warnings.length > 0) {
    lines.push('─'.repeat(40));
    lines.push('Warnings:');
    for (const w of result.warnings) {
      lines.push(`  ⚠ ${w.message}`);
    }
  }

  return lines.join('\n');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(2)} ${units[i]}`;
}
