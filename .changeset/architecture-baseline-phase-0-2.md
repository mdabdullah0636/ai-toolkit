---
'@ai-toolkit/gateway': patch
'ai-toolkit': patch
'@ai-toolkit/valibot': patch
---

Architecture baseline: Phase 0-2 implementation

**Phase 0 — Package Inventory and Classification (complete)**

All 64 packages are now classified into a 6-layer architectural model:

| Layer          | Packages | Description                            |
|----------------|----------|----------------------------------------|
| Foundation (L0) | 3        | `@ai-toolkit/provider`, `@ai-toolkit/runtime`, `@ai-toolkit/capabilities` |
| Runtime (L1)    | 4        | `ai-toolkit`, `@ai-toolkit/provider-utils`, `@ai-toolkit/gateway`, `@ai-toolkit/valibot` |
| Protocol (L2)   | 1        | `@ai-toolkit/mcp`                      |
| Gateway (L3)    | 1        | `@ai-toolkit/khulnasoft`               |
| Provider (L1.5) | 41       | All provider packages                  |
| Integration (L5) | 7       | Framework adapters + ecosystem bridges |
| Experience/Tooling | 6     | UI, devtools, codemods, platform       |
| Infrastructure   | 1        | `@ai-toolkit/test-server` (internal)   |

**Phase 1 — Dependency-Direction Validation (complete)**

Two dependency-direction violations have been resolved:

1. `ai-toolkit (Runtime) → @ai-toolkit/gateway (Gateway)`: resolved by
   moving `@ai-toolkit/gateway` from `packages/special/` to
   `packages/core/gateway/` and classifying it as Runtime layer (intra-layer
   dependency). No public API changes; published package name unchanged.

2. `@ai-toolkit/valibot (Foundation) → @ai-toolkit/provider-utils (Runtime)`:
   resolved by reclassifying `@ai-toolkit/valibot` as Runtime layer (intra-layer
   dependency).

A new validation tool (`tools/scripts/check-dependency-direction.mjs`) now scans
both `package.json` dependencies and TypeScript/JavaScript import statements for
cross-layer violations. Run with `pnpm arch:deps`.

**Phase 2a — Capability Registry (complete)**

A machine-generated capability matrix is now produced by
`tools/scripts/generate-capability-matrix.mjs` which scans each provider's
source code for model factory methods and maps them to capability categories.
Output: `build/capability-matrix.json` (43 providers, 187 gateway models).
Validated by `pnpm arch:capabilities:check`.

**Phase 2b — Provider Conformance Suite (started)**

A provider conformance test suite has been added to
`@ai-toolkit/provider/src/conformance/`. It covers text generation,
streaming, embedding, image generation, error handling, and abort signal
propagation. Providers can run the tests via the `./conformance` export:
```ts
import { runConformanceTests } from '@ai-toolkit/provider/conformance';
```

**New developer workflow commands:**

- `pnpm arch:deps` — validate dependency direction (package.json + imports)
- `pnpm arch:capabilities` — regenerate capability matrix
- `pnpm arch:capabilities:check` — verify capability matrix is fresh (CI)
- `pnpm arch:validate` — run all architecture validation checks
- `pnpm arch:inspect` — output package registry, layer classification, and capability summary
