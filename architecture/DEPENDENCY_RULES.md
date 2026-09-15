# Dependency Rules

Phase 1 deliverable. Defines which packages may depend on which layers. These rules are enforced by extending `tools/scripts/validate-structure.mjs`.

---

## Layer dependency graph

```
Foundation (L0)
  └─▶ Runtime (L1)
  └─▶ Protocol (L2)

Runtime (L1)
  └─▶ Integration (L5)

Gateway (L3)
  └─▶ Foundation (L0)
  └─▶ Runtime (L1)
  └─▶ Protocol (L2)

Integration (L5)
  └─▶ Runtime (L1)
  └─▶ Protocol (L2)

Experience/Tooling (L6)
  └─▶ Runtime (L1)
  └─▶ Gateway (L3)
  └─▶ Integration (L5)

Provider (L1.5)
  └─▶ Foundation (L0)
  └─▶ Runtime (L1)
```

## Allowed dependencies

| From layer              | May depend on                                                 | Notes                                                                                 |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Foundation (L0)         | None (intra-layer OK)                                         | Foundation is the root                                                                |
| Runtime (L1)            | Foundation (L0), Provider (L1.5)                              | Must remain provider-agnostic; intra-layer Runtime deps allowed (ai-toolkit, provider-utils, gateway, valibot) |
| Protocol (L2)           | Foundation (L0)                                               | Protocol packages are first-class                                                     |
| Provider (L1.5)         | Foundation (L0), Runtime (L1), other Providers                | Hub pattern is standard (openai-compatible, harness-acp)                              |
| Gateway (L3)            | Foundation (L0), Runtime (L1), Protocol (L2)                  | Orchestrates across layers                                                            |
| Integration (L5)        | Runtime (L1), Protocol (L2), Foundation (L0)                  | Must NOT depend on Provider internals (RSC needs provider directly — exception below) |
| Experience/Tooling (L6) | Runtime (L1), Gateway (L3), Integration (L5), Foundation (L0) | UI and tooling consume abstractions                                                   |
| Infrastructure          | None                                                          | Internal test utilities                                                               |

## Intra-layer dependencies (allowed)

Dependencies within the same layer are always allowed. Examples:

- Provider → Provider: hub packages like `@ai-toolkit/openai-compatible`, `@ai-toolkit/harness-acp`
- Experience → Experience: `@ai-toolkit/elements` → `@ai-toolkit/shadcn-ui`
- Foundation → Foundation: `@ai-toolkit/capabilities` → `@ai-toolkit/runtime`
- Runtime → Runtime: `ai-toolkit` → `@ai-toolkit/gateway`, `@ai-toolkit/provider-utils`, `@ai-toolkit/valibot`

## Disallowed dependencies (common violations)

| From               | To                 | Why                                                               |
| ------------------ | ------------------ | ----------------------------------------------------------------- |
| Integration        | Provider           | Integrations should use runtime contracts, not provider internals |
| Experience/Tooling | Provider           | Tooling should use runtime/gateway abstractions                   |
| Protocol           | Integration        | Protocols are first-class, not nested under integrations          |
| Protocol           | Experience/Tooling | Protocol packages are reusable across frameworks                  |
| Gateway            | Integration        | Gateway orchestrates, not consumes integration UI                 |
| Gateway            | Experience/Tooling | Gateway doesn't depend on UI or tooling                           |
| Foundation         | Any higher layer   | Foundation must be the root of the dependency tree                |

## Domain-to-layer mapping

| Domain                  | Directory                                            | Layer              |
| ----------------------- | ---------------------------------------------------- | ------------------ |
| Core SDK                | `packages/core/ai-toolkit`                           | Runtime            |
| Core gateway/routing    | `packages/core/gateway`                              | Runtime            |
| Core utilities          | `packages/core/provider-utils`                       | Runtime            |
| Runtime contracts       | `packages/core/runtime`                              | Foundation         |
| Provider interfaces     | `packages/validation/provider`                       | Foundation         |
| Capability declarations | `packages/validation/capabilities`                   | Foundation         |
| Schema validation       | `packages/validation/valibot`                        | Runtime            |
| Providers               | `packages/providers/*`                               | Provider           |
| MCP                     | `packages/mcp`                                       | Protocol           |
| Gateway (special)       | `packages/special/khulnasoft`                        | Gateway            |
| Dev tools               | `packages/special/devtools`                          | Experience/Tooling |
| Codemods                | `packages/special/codemod`                           | Experience/Tooling |
| Platform registry       | `packages/special/platform`                          | Experience/Tooling |
| Framework adapters      | `packages/adapters/react, vue, angular, svelte, rsc` | Integration        |
| Ecosystem bridges       | `packages/adapters/langchain, llamaindex`            | Integration        |
| UI elements             | `packages/ui/elements`                               | Experience/Tooling |
| UI design               | `packages/ui/design`                                 | Experience/Tooling |
| UI primitives           | `packages/ui/shadcn-ui`                              | Experience/Tooling |
| Infrastructure          | `packages/infrastructure/test-server`                | Infrastructure     |

## Resolved violations

Both Phase 1 dependency-direction violations have been resolved:

| From                  | To                           | Resolution                                                                 |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `ai-toolkit`          | `@ai-toolkit/gateway`        | Moved `@ai-toolkit/gateway` to `packages/core/gateway/`; classified as Runtime layer (intra-layer with `ai-toolkit`) |
| `@ai-toolkit/valibot` | `@ai-toolkit/provider-utils` | Reclassified `@ai-toolkit/valibot` as Runtime layer (depends on provider-utils for schema types)                    |

### Schema type migration (Phase 3, partial)

Schema **type definitions** (`Schema`, `LazySchema`, `ZodSchema`, `StandardSchema`, `FlexibleSchema`, `InferSchema`, `ValidationResult`, `schemaSymbol`) have been migrated from `@ai-toolkit/provider-utils` (Runtime) to `@ai-toolkit/provider` (Foundation). The **implementation functions** (`jsonSchema`, `asSchema`, `zod3Schema`, `zod4Schema`, `zodSchema`, `isZod4Schema`) remain in `@ai-toolkit/provider-utils`.

As a result:
- `@ai-toolkit/mcp` now imports `FlexibleSchema` from `@ai-toolkit/provider` (Foundation) instead of `@ai-toolkit/provider-utils` (Runtime)
- `@ai-toolkit/provider` added `zod` and `@standard-schema/spec` as peerDependencies to support type-only imports
- The `mcp:runtime` exception is **partial** — MCP still imports the `Tool` type from provider-utils (a type-only import), but this is documented as a known limitation

## Implementation

Dependency direction is validated by:

1. `tools/scripts/check-dependency-direction.mjs` — standalone script, run via `pnpm arch:deps`
2. `tools/scripts/validate-structure.mjs` — existing tool; extended with layer classification
3. Both run in CI via `pnpm arch:validate` and fail the build on violations (except documented exceptions)
4. `tools/scripts/check-dependency-direction.mjs` also scans TypeScript/JavaScript `import` statements in source files for cross-layer violations
5. `tools/scripts/arch-inspect.mjs` — `pnpm arch:inspect` provides a quick overview of the architecture state
6. `tools/scripts/generate-capability-matrix.mjs` — `pnpm arch:capabilities` generates the machine-readable capability matrix

### Documented exceptions

The following cross-layer dependencies are allowed as documented exceptions (Phase 3 targets to eliminate where possible):

| Exception key | From | To | Rationale |
| ------------- | ---- | -- | --------- |
| `rsc:provider` | `@ai-toolkit/rsc` (Integration) | `@ai-toolkit/provider` (Foundation) | RSC server components need direct provider type access |
| `devtools:foundation` | `@ai-toolkit/devtools` (Experience) | `@ai-toolkit/provider` (Foundation) | Devtools uses provider directly for its UI |
| `khulnasoft:provider` | `@ai-toolkit/khulnasoft` (Gateway) | `@ai-toolkit/openai-compatible` (Provider) | Official KhulnaSoft integration delegates to a specific provider |
| `mcp:runtime` | `@ai-toolkit/mcp` (Protocol) | `@ai-toolkit/provider-utils` (Runtime) | MCP protocol implementation needs shared HTTP/schema/tool utilities (Phase 3: move protocol-relevant utilities to Foundation) |
