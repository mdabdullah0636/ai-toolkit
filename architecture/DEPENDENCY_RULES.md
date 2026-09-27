# Dependency Rules

Defines which packages may depend on which layers. These rules are enforced by extending `tools/scripts/validate-structure.mjs` and `tools/scripts/check-dependency-direction.mjs`.

**Last Updated**: September 23, 2026 (Phase 4 - Full Platform)

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

| From layer              | May depend on                                                 | Notes                                                                                                          |
| ----------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Foundation (L0)         | None (intra-layer OK)                                         | Foundation is the root                                                                                         |
| Runtime (L1)            | Foundation (L0), Provider (L1.5)                              | Must remain provider-agnostic; intra-layer Runtime deps allowed (ai-toolkit, provider-utils, gateway, valibot) |
| Protocol (L2)           | Foundation (L0)                                               | Protocol packages are first-class                                                                              |
| Provider (L1.5)         | Foundation (L0), Runtime (L1), other Providers                | Hub pattern is standard (openai-compatible, harness-acp)                                                       |
| Gateway (L3)            | Foundation (L0), Runtime (L1), Protocol (L2)                  | Orchestrates across layers                                                                                     |
| Integration (L5)        | Runtime (L1), Protocol (L2), Foundation (L0)                  | Must NOT depend on Provider internals (RSC needs provider directly — exception below)                          |
| Experience/Tooling (L6) | Runtime (L1), Gateway (L3), Integration (L5), Foundation (L0) | UI and tooling consume abstractions                                                                            |
| Infrastructure          | None                                                          | Internal test utilities                                                                                        |

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

## Domain-to-layer mapping (Current)

| Domain       | Directory                 | Layer              |
| ------------ | ------------------------- | ------------------ |
| Foundation   | `packages/foundation/*`   | Foundation         |
| AI Core      | `packages/ai/core`        | Runtime            |
| Gateway      | `packages/gateway/core`   | Runtime            |
| Providers    | `packages/providers/*`    | Provider           |
| MCP          | `packages/mcp/core`       | Protocol           |
| Integrations | `packages/integrations/*` | Integration        |
| Tooling      | `packages/tooling/*`      | Experience/Tooling |
| UI           | `packages/ui/*`           | Experience/Tooling |
| Testing      | `packages/testing/*`      | Infrastructure     |

## Domain-to-layer mapping (Future - 400% Platform)

| Domain                     | May Depend On                                                |
| -------------------------- | ------------------------------------------------------------ |
| `packages/ai/*`            | Foundation, Providers, Gateway                               |
| `packages/context/*`       | Foundation, AI Core, Memory                                  |
| `packages/memory/*`        | Foundation, AI Core, Context                                 |
| `packages/agents/*`        | Foundation, AI Core, Tools, MCP, Memory, Context, Workflow   |
| `packages/workflow/*`      | Foundation, Agents, Tools, Observability, Sandbox            |
| `packages/retrieval/*`     | Foundation, AI Core, Memory, Context                         |
| `packages/tools/*`         | Foundation, AI Core, MCP, Security                           |
| `packages/sandbox/*`       | Foundation, Security                                         |
| `packages/evals/*`         | Foundation, AI Core, Agents, Workflow, Observability         |
| `packages/observability/*` | Foundation (must be dependency-free for instrumentation)     |
| `packages/security/*`      | Foundation (must be dependency-free for security primitives) |

> Implemented domains: Wave 1, Wave 2, Wave 3, and Wave 4 (`packages/evals/*`, `packages/observability/*`, `packages/security/*`). Remaining domains are planned for future waves. See `architecture/FUTURE_DOMAINS.md` for implementation plans.

## Resolved violations

Both Phase 1 dependency-direction violations have been resolved:

| From                  | To                           | Resolution                                                                                                           |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ai-toolkit`          | `@ai-toolkit/gateway`        | Moved `@ai-toolkit/gateway` to `packages/gateway/core/`; classified as Runtime layer (intra-layer with `ai-toolkit`) |
| `@ai-toolkit/valibot` | `@ai-toolkit/provider-utils` | Reclassified `@ai-toolkit/valibot` as Runtime layer (depends on provider-utils for schema types)                     |

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
7. `tools/scripts/check-architecture-sync.mjs` — validates documentation-implementation consistency (Phase 0)

### Documented exceptions

The following cross-layer dependencies are allowed as documented exceptions:

| Exception key            | From                                          | To                                                                                 | Rationale                                                                                                                     |
| ------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `rsc:provider`           | `@ai-toolkit/rsc` (Integration)               | `@ai-toolkit/provider` (Foundation)                                                | RSC server components need direct provider type access                                                                        |
| `devtools:foundation`    | `@ai-toolkit/devtools` (Experience)           | `@ai-toolkit/provider` (Foundation)                                                | Devtools uses provider directly for its UI                                                                                    |
| `khulnasoft:provider`    | `@ai-toolkit/khulnasoft` (Gateway)            | `@ai-toolkit/openai-compatible` (Provider)                                         | Official KhulnaSoft integration delegates to a specific provider                                                              |
| `mcp:runtime`            | `@ai-toolkit/mcp` (Protocol)                  | `@ai-toolkit/provider-utils` (Runtime)                                             | MCP protocol implementation needs shared HTTP/schema/tool utilities (Phase 3: move protocol-relevant utilities to Foundation) |
| `gateway-router:gateway` | `@ai-toolkit/gateway-router` (Gateway)        | `@ai-toolkit/gateway` (Gateway)                                                    | Router extension depends on core gateway                                                                                      |
| `gateway-lb:gateway`     | `@ai-toolkit/gateway-load-balancer` (Gateway) | `@ai-toolkit/gateway` (Gateway)                                                    | Load balancer extension depends on core gateway                                                                               |
| `ui-studio:ui`           | `@ai-toolkit/ui-studio` (Experience)          | `@ai-toolkit/elements`, `@ai-toolkit/design`, `@ai-toolkit/shadcn-ui` (Experience) | Studio extends UI components                                                                                                  |
| `cli:tooling`            | `@ai-toolkit/tooling-cli` (Experience)        | `@ai-toolkit/codemod`, `@ai-toolkit/devtools` (Experience)                         | CLI extends tooling                                                                                                           |
| `codegen:tooling`        | `@ai-toolkit/tooling-codegen` (Experience)    | `@ai-toolkit/codemod`, `@ai-toolkit/devtools` (Experience)                         | Codegen extends tooling                                                                                                       |
