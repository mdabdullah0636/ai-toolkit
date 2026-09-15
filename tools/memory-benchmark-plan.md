# Plan: @tools/memory-benchmark

## Overview

`@tools/memory-benchmark` is a dev tool that measures and reports memory usage (heap delta, peak RSS, growth rate) of AI TOOLKIT operations. It fills a gap in the existing benchmark infrastructure: load-time benchmarks measure startup cost and stream benchmarks measure throughput, but nothing tracks **memory consumption** of operations like `streamText`, `generateObject`, or tool execution.

This enables detecting memory regressions (e.g., unbounded buffer growth in streaming, memory leaks in long-running agent loops) before they ship.

## Goals

1. **Measure heap delta** around any async operation via `measureMemory(fn)`
2. **Track streaming memory growth** during `streamText` / `streamObject` consumption
3. **Report structured metrics**: heap delta, peak RSS, per-chunk growth, growth rate
4. **CI integration**: fail builds when memory growth exceeds thresholds
5. **Zero runtime cost** in production (tree-shakable, no-op when disabled)

## Scope (Phased)

### Phase 1 — Core Measurement (MVP)

- `measureMemory(fn: () => Promise<T>): Promise<MemoryResult<T>>`
  - Captures `process.memoryUsage()` before and after
  - Returns heap delta, peak RSS, elapsed time, and the result
- `measureStream(readable: ReadableStream, consumer: (chunk) => void): Promise<StreamMemoryResult>`
  - Samples memory every N chunks during stream consumption
  - Reports per-sample heap usage and growth trend
- `resetPeak()` — resets the high-water mark for isolated measurements
- Basic CLI: `node tools/memory-benchmark/memory-benchmark.mjs <scenario>`

### Phase 2 — AI TOOLKIT Integrations

- Wrappers for `streamText`, `generateObject`, `generateText` that auto-track memory
- Tool-call memory tracking (input size vs. output memory growth)
- Configurable thresholds: `maxHeapDelta`, `maxGrowthPerChunk`, `maxTotalMB`
- Integration with existing benchmark patterns in `examples/01-foundations/ai-functions/src/benchmark/`

### Phase 3 — CI & Reporting

- `@tools/memory-benchmark/cli` — CI-friendly output (JSON, TAP)
- GitHub Actions step template for memory regression gates
- JSON reporter: `{ scenario, iterations, heapDelta, peakRSS, growthRate, passed, failed }`
- Integration with `.github/workflows/ci.yml` (new job: `memory-check`)

## Package Structure

```
tools/memory-benchmark/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # Public API: measureMemory, measureStream, resetPeak
│   ├── memory-tracker.ts      # Core tracker class (sample, delta, peak)
│   ├── stream-analyzer.ts     # Streaming memory analysis
│   ├── reporters/
│   │   ├── text-reporter.ts   # Human-readable console output
│   │   └── json-reporter.ts   # Machine-readable JSON output
│   ├── integrations/
│   │   ├── stream-text.ts     # streamText memory wrapper
│   │   ├── generate-object.ts # generateObject memory wrapper
│   │   └── tool-call.ts       # Tool call memory wrapper
│   └── cli.ts                # CLI entry point
├── lib/
│   └── run.ts                 # Shared run helper (copied from examples pattern)
└── test/
    ├── memory-tracker.test.ts
    ├── stream-analyzer.test.ts
    └── integrations/
        ├── stream-text.test.ts
        └── generate-object.test.ts
```

## API Design

### Core API

```typescript
import { measureMemory, measureStream, resetPeak } from '@tools/memory-benchmark';

// Simple measurement
const result = await measureMemory(async () => {
  const data = await fetchLargeDataset();
  return data.process();
});
// result: { heapDelta: 1048576, peakRSS: 52428800, durationMs: 250, result: ... }

// Stream measurement
const streamResult = await measureStream(
  aiStream,
  (chunk) => processChunk(chunk),
  { sampleEvery: 5 },
);
// streamResult: { samples: [...], growthRate: 1024, peakHeap: 8388608, ... }

// Reset between tests
resetPeak();
```

### MemoryResult Types

```typescript
interface MemoryResult<T> {
  result: T;
  metrics: {
    heapBefore: number;       // bytes
    heapAfter: number;        // bytes
    heapDelta: number;        // bytes
    heapGrowthRate: number;   // bytes/ms
    peakRSS: number;          // bytes
    durationMs: number;
  };
}

interface StreamMemoryResult {
  samples: MemorySample[];
  metrics: {
    peakHeap: number;
    totalGrowth: number;
    growthPerChunk: number;
    growthRate: number;        // bytes/ms
    chunkCount: number;
    durationMs: number;
  };
  warnings: MemoryWarning[];
}

interface MemorySample {
  chunkIndex: number;
  heapUsed: number;
  heapDelta: number;
  rss: number;
  timestamp: number;
}

interface MemoryWarning {
  type: 'threshold-exceeded' | 'growth-anomaly';
  message: string;
  threshold?: number;
  actual?: number;
}
```

## Dependencies

| Type | Package | Reason |
|------|---------|--------|
| Runtime | none | Uses native `process.memoryUsage()` |
| Dev | `@ai-toolkit/test` | For test infrastructure |
| Dev | `typescript` | Already in repo |
| Dev | `tsup` | Already in repo |
| Peer | none | Zero external deps |

**No new runtime dependencies.** The tool uses Node.js built-in `process.memoryUsage()` and `performance.now()`.

## Implementation Phases

### Phase 1: Core (2 weeks)

1. **Scaffold package** — `package.json`, `tsconfig.json`, workspace registration
2. **Memory tracker** — `measureMemory()`, `resetPeak()` with Node.js API
3. **Stream analyzer** — `measureStream()` with periodic sampling
4. **Reporters** — text + JSON output
5. **Tests** — unit tests for tracker and analyzer
6. **Basic CLI** — single-command usage

### Phase 2: Integrations (1 week)

1. **streamText wrapper** — drop-in replacement that tracks memory
2. **generateObject wrapper** — same pattern
3. **Integration tests** — verify wrappers work with real AI TOOLKIT functions
4. **Threshold configuration** — add `maxHeapDelta`, `maxGrowthPerChunk` options

### Phase 3: CI Integration (1 week)

1. **CI job template** — GitHub Actions step for memory gates
2. **JSON reporter enhancements** — summary, pass/fail per scenario
3. **Add to CI workflow** — `.github/workflows/ci.yml` new job `memory-check`
4. **Documentation** — usage guide, CI setup instructions

## Integration Points

### Existing Benchmark Infrastructure

The repo already has benchmarks in:
- `examples/01-foundations/ai-functions/src/benchmark/stream-text-benchmark.ts` — throughput/perf
- `examples/01-foundations/ai-functions/src/benchmark/load-time.ts` — import cost

`@tools/memory-benchmark` complements these by adding **memory cost** metrics. Proposed integration:

```typescript
// examples/01-foundations/ai-functions/src/benchmark/memory-benchmark.ts
import { measureMemory } from '@tools/memory-benchmark';
import { streamText } from 'ai-toolkit';
import { MockLanguageModelV3 } from 'ai-toolkit/test';
import { run } from '../lib/run';

run(async () => {
  const result = await measureMemory(async () => {
    const output = await streamText({ model, prompt: 'Test' });
    await output.textStream.consume();
    return output;
  });
  console.log(`Heap delta: ${(result.metrics.heapDelta / 1024 / 1024).toFixed(2)} MB`);
});
```

### CI Integration

New job in `.github/workflows/ci.yml`:

```yaml
memory-check:
  name: 'Memory Check'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v5
    - uses: pnpm/action-setup@v4
      with: { version: 10.11.0 }
    - uses: actions/setup-node@v5
      with: { node-version: 22, cache: 'pnpm' }
    - run: pnpm install --frozen-lockfile
    - run: pnpm run build:packages
    - run: node tools/memory-benchmark/memory-benchmark.mjs --config .memory-benchmark.json
```

### Package Registration

1. Add `tools/memory-benchmark` to `pnpm-workspace.yaml` (already covered by `tools/*`)
2. Add to `tsconfig.json` references
3. Add to `tools/tsconfig/base.json` if needed for composite builds
4. Add to `tools/scripts/` directory if it needs to be a callable script

## Testing Strategy

### Unit Tests

- `measureMemory` with synchronous and asynchronous functions
- `measureMemory` with functions that throw (error propagation)
- `measureStream` with varying chunk sizes
- `measureStream` with early termination (abort)
- Threshold breach detection
- `resetPeak` isolation between measurements

### Integration Tests

- `measureMemory` wrapping `streamText` with MockLanguageModelV3
- `measureMemory` wrapping `generateObject` with Zod schema
- Memory growth detection on intentionally leaky stream

### Regression Tests

- Snapshots of JSON reporter output for known scenarios
- CI job that fails if memory baseline regresses

## Risks & Considerations

| Risk | Mitigation |
|------|-----------|
| `process.memoryUsage()` is Node-only (not Edge) | Document as Node-only tool; Edge runtime uses `performance.memory` where available |
| Garbage collection timing affects measurements | Run multiple iterations, report median; add `warmup` option |
| Memory overhead of measurement itself | Measure tracker overhead in baseline; subtract from results |
| V8 heap limits differ across Node versions | Normalize by percentage of `memoryUsage().heapLimit` |
| CI noise in shared environments | Configure threshold buffers (e.g., 110% of baseline) |

## Success Metrics

- [ ] Can measure heap delta for any async operation within 5% accuracy
- [ ] Can detect 1MB+ memory growth in streaming operations
- [ ] CI job fails when memory threshold exceeded
- [ ] Zero new runtime dependencies
- [ ] All existing benchmark patterns (load-time, stream-text) have memory counterparts
