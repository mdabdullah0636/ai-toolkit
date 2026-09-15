# Architecture Executive Summary

## Recommendation

The AI TOOLKIT monorepo already has strong foundations: domain-based packaging, provider abstraction, runtime contracts, capability-aware design, MCP coverage, framework adapters, and governance via ADRs. The next step is not to add more packages; it is to turn the current structure into a clear platform architecture with explicit layers, contracts, and enforceable dependency rules.

## Current State

### What exists today

**63 packages across 8 domains:**

| Domain                  | Directory                          | Packages                                                                          | Count |
| ----------------------- | ---------------------------------- | --------------------------------------------------------------------------------- | ----- |
| Core SDK                | `packages/core/ai-toolkit`         | `ai-toolkit` (npm: `ai-toolkit`)                                                  | 1     |
| Core utilities          | `packages/core/provider-utils`     | `@ai-toolkit/provider-utils`                                                      | 1     |
| Runtime contracts       | `packages/core/runtime`            | `@ai-toolkit/runtime`                                                             | 1     |
| Provider interfaces     | `packages/validation/provider`     | `@ai-toolkit/provider`                                                            | 1     |
| Capability declarations | `packages/validation/capabilities` | `@ai-toolkit/capabilities`                                                        | 1     |
| Schema validation       | `packages/validation/valibot`      | `@ai-toolkit/valibot`                                                             | 1     |
| Providers               | `packages/providers/*`             | `@ai-toolkit/{openai,anthropic,google,...}`                                       | 41    |
| MCP protocol            | `packages/mcp`                     | `@ai-toolkit/mcp`                                                                 | 1     |
| Special                 | `packages/special/*`               | `@ai-toolkit/gateway`, `devtools`, `codemod`, `khulnasoft`                        | 4     |
| Adapters                | `packages/adapters/*`              | `@ai-toolkit/react`, `rsc`, `vue`, `angular`, `svelte`, `langchain`, `llamaindex` | 7     |
| UI                      | `packages/ui/*`                    | `@ai-toolkit/elements`, `design`, `shadcn-ui`                                     | 3     |
| Infrastructure          | `packages/infrastructure/*`        | `@ai-toolkit/test-server`                                                         | 1     |

### Actual dependency graph (from package.json)

```
# Foundation
@ai-toolkit/provider          ← no internal deps (root foundation)
@ai-toolkit/provider-utils    → @ai-toolkit/provider
@ai-toolkit/runtime           ← no internal deps (browser-safe runtime)
@ai-toolkit/capabilities      → @ai-toolkit/runtime
@ai-toolkit/valibot           → @ai-toolkit/provider-utils

# Provider family: harness (harness-acp is the hub, 7 consumers depend on it)
@ai-toolkit/harness           → @ai-toolkit/provider                       (base, no provider-utils)
@ai-toolkit/harness-acp       → @ai-toolkit/provider, @ai-toolkit/provider-utils
  consumers: harness-grok-build, harness-opencode, harness-codex,
             harness-cursor, harness-claude-code, harness-cline, harness-pi
@ai-toolkit/openai-compatible → @ai-toolkit/provider, @ai-toolkit/provider-utils
  consumers: fireworks, togetherai, cerebras, baseten, google-vertex,
             huggingface, xai, deepinfra, khulnasoft
@ai-toolkit/{all other providers} → @ai-toolkit/provider, @ai-toolkit/provider-utils

# Protocol
@ai-toolkit/mcp               → @ai-toolkit/provider, @ai-toolkit/provider-utils

# Gateway (in packages/special/ but consumed by core SDK)
@ai-toolkit/gateway           → @ai-toolkit/provider, @ai-toolkit/provider-utils
@ai-toolkit/devtools          → @ai-toolkit/provider
@ai-toolkit/khulnasoft        → @ai-toolkit/openai-compatible, @ai-toolkit/provider, @ai-toolkit/provider-utils

# Core SDK
ai-toolkit                    → @ai-toolkit/gateway, @ai-toolkit/provider, @ai-toolkit/provider-utils

# Integrations
@ai-toolkit/{react,vue,ang,svelte} → @ai-toolkit/provider-utils, ai-toolkit
@ai-toolkit/rsc               → ai-toolkit, @ai-toolkit/provider, @ai-toolkit/provider-utils
@ai-toolkit/langchain         → ai-toolkit
@ai-toolkit/llamaindex        → ai-toolkit

# UI
@ai-toolkit/elements          → @ai-toolkit/shadcn-ui, ai-toolkit
@ai-toolkit/design            ← no internal deps (design tokens only)
@ai-toolkit/shadcn-ui         ← no internal deps (UI primitives only)

# Infrastructure
@ai-toolkit/test-server       ← no internal deps
```

### Strengths

- Domain packaging already organized: `core`, `providers`, `adapters`, `mcp`, `special`, `validation`, `infrastructure`, `ui`
- All packages declare `stability` and `owners` metadata (ADR-007); `validate-structure` enforces completeness
- Runtime-neutral packages (`core`, `validation`) enforce no-Node-builtin rule via `.eslintrc.js` overrides and `validate-structure` (ADR-004, ADR-008)
- All published packages declare `types`, `import`, `require`, `default` export conditions (ADR-006)
- Provider abstraction is clean: all providers implement `@ai-toolkit/provider` interfaces
- Capability-aware design exists via `@ai-toolkit/capabilities`
- MCP is a first-class protocol package (`@ai-toolkit/mcp`)
- Architecture governance exists in `AGENTS.md`, ADRs, and this directory

### Active work (from changesets)

- `gateway-refactor` — likely addresses the gateway layer placement ambiguity
- `harness-acp-provider` — adds `@ai-toolkit/harness-acp` as ACP protocol adapter
- `harness-packages` — harness provider family (`@ai-toolkit/harness` base, `harness-acp`, and 7 consumer packages)
- `platform-primitives-finalization` — core platform primitives
- `runtime-neutral-server-response` — runtime/server alignment
- `rename-ai-to-ai-toolkit` — core SDK npm rename from `ai` to `ai-toolkit`

### Risks

1. **Dependency direction ambiguity**: `ai-toolkit` depends on `@ai-toolkit/gateway`, but `@ai-toolkit/gateway` is in `packages/special/` (not `packages/core/`). This blurs the boundary between runtime and gateway layers.
2. **No enforced dependency rules**: There is no CI check that validates whether a package's imports match its allowed dependencies. The dependency graph above is a convention, not an enforcement.
3. **Utility sprawl in provider-utils**: `@ai-toolkit/provider-utils` is a general-purpose utility bucket consumed by nearly every package. Its scope is not bounded.
4. **Capability registry is incomplete**: `@ai-toolkit/capabilities` exists but the capability matrix in `architecture/model-capabilities.md` is a planning assertion, not machine-verified.
5. **No provider conformance suite**: Providers have no shared test contract. Each provider is tested independently with no guarantee of consistent behavior.
6. **Runtime package is early**: `@ai-toolkit/runtime` is v0.1.0 and its scope relative to `ai-toolkit` and `@ai-toolkit/provider-utils` is not fully defined.

## Architectural Direction

The repository should be organized around these layers, each with explicit dependency rules:

1. **Foundation** — types, protocol structures, serialization, streams, errors, validation primitives, runtime capability detection. Must depend on nothing higher.
2. **Runtime and orchestration** — text generation, structured generation, tools, agents, workflows, telemetry. May depend on foundation, protocols, and providers.
3. **Protocols and provider contracts** — MCP, normalized request/response models, provider capability declarations. Protocol packages are first-class citizens.
4. **Gateway and policy** — routing, fallback, quotas, auth, cost controls, observability. Orchestrates across runtime + protocols + providers.
5. **Integrations** — framework adapters (React, Vue, Angular, Svelte, RSC) and ecosystem bridges (LangChain, LlamaIndex). Depend on runtime and protocol contracts only.
6. **Experience and tooling** — UI primitives, developer tools, codemods, diagnostics, generators. Consume runtime and gateway abstractions.

### Where the repo actually sits today

- Foundation packages exist and are correctly bounded (`@ai-toolkit/provider`, `@ai-toolkit/runtime`, `@ai-toolkit/capabilities`)
- Protocol packages exist and are first-class (`@ai-toolkit/mcp`)
- Gateway exists but its layer placement is ambiguous (it is in `packages/special/` yet is a dependency of the core SDK)
- Integration packages are correctly scoped but have no enforced dependency rules
- Experience/tooling packages exist but their boundary with integration is not explicit

## Prioritized Roadmap

### Phase 0 — Package Inventory and Classification (immediate)

- Classify all 63 packages into the 6-layer model
- Mark each package with its architectural layer, domain, owner, stability, and runtime support
- Document the actual dependency graph and flag any violations
- Deliverable: authoritative package registry with layer classification

### Phase 1 — Dependency-Direction Validation (immediate)

- Define allowed dependency direction for each layer
- Add CI check that fails on invalid cross-layer imports
- Resolve the `ai-toolkit → gateway` dependency ambiguity
- Deliverable: enforced dependency ruleset in CI

### Phase 2 — Capability Registry and Provider Conformance (high priority)

- Machine-verify the capability matrix against provider source code
- Define a provider conformance suite (lifecycle, streaming, tool calling, structured output, error handling)
- Make capabilities queryable and comparable at runtime
- Deliverable: capability registry + conformance suite with pass/fail results

### Phase 3 — Runtime/Provider Boundary Cleanup (medium priority)

- Bound the scope of `@ai-toolkit/provider-utils`
- Clarify the role of `@ai-toolkit/runtime` vs `ai-toolkit`
- Standardize provider lifecycle contract
- Deliverable: bounded utility packages, clear runtime contract

### Phase 4 — Gateway and Policy Architecture (medium priority)

- Formalize gateway as a control-plane layer
- Define routing, fallback, quota, and policy models
- Align gateway to provider contracts and runtime capabilities
- Deliverable: gateway policy model with capability-driven decisions

### Phase 5 — Integration Boundary Cleanup (lower priority)

- Separate framework adapters from ecosystem bridges
- Ensure integrations depend on contracts, not provider internals
- Deliverable: clean integration layer with explicit dependency rules

### Phase 6 — Observability and DX (lower priority)

- Define canonical Run model and trace metadata
- Add architecture validation commands to developer workflow
- Generate docs and matrices from package metadata
- Deliverable: observable execution story, metadata-driven docs

## Exit Criteria

The architecture refinement is complete when:

- Every package belongs to exactly one architectural layer
- Dependency direction is enforced in CI (not just documented)
- Provider implementations pass a conformance suite
- Capability registry is machine-generated and cannot drift
- Gateway decisions are based on normalized request + capability + policy data
- Requests can be traced across runtime, gateway, and provider boundaries
- Docs and package inventories are generated from authoritative metadata

## Definition of Done

The architecture work is done when the repository has:

1. Explicit architectural boundaries (each package has a single, clear role)
2. Machine-checkable dependency rules (CI enforces layer boundaries)
3. A capability-driven provider model (providers satisfy a common contract)
4. A traceable execution story from request to provider response

## Document relationships

| Document                                       | Purpose                                                  | Read when                                       |
| ---------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `architecture/ARCHITECTURE_REFINEMENT_PLAN.md` | Detailed layer definitions, phases 0-5, success criteria | Planning implementation work                    |
| `architecture/IMPLEMENTATION_CHECKLIST.md`     | Phase-by-phase checklist with checkboxes and owners      | Tracking execution                              |
| `architecture/domain-mapping.md`               | Canonical package-to-domain mapping                      | Looking up where a package belongs              |
| `architecture/model-capabilities.md`           | Provider capability matrix                               | Checking which providers support which features |
| `architecture/provider-abstraction.md`         | Provider pattern and model types                         | Understanding provider implementation contract  |
| `architecture/runtime-support.md`              | Runtime matrix (node/edge/browser)                       | Checking runtime support per package            |
| `architecture/PROJECT-STRUCTURE.md`            | Project tree and proposed structure                      | Understanding layout                            |
| `architecture/PACKAGE_INVENTORY.md`            | All 63 packages classified by layer with metadata        | Package lookup, dependency analysis             |
| `architecture/DEPENDENCY_RULES.md`             | Layer dependency rules and violations                    | Understanding dependency constraints            |
| `ARCHITECTURE_INDEX.md`                        | Navigation guide for all architecture docs               | Finding the right document                      |
| `ARCHITECTURE_QUICK_REFERENCE.md`              | Daily reference cheat sheet                              | Quick lookups while coding                      |

## Recommended Immediate Next Action

**Start a tracked roadmap.** Turn this checklist into actionable tickets, beginning with:

1. **Package inventory and classification** — classify all 63 packages into the 6-layer model; flag the `ai-toolkit → gateway` dependency direction issue
2. **Dependency-direction validation** — define per-layer allowed dependencies; add a CI check using `validate-structure` or equivalent
3. **Capability registry and conformance suite** — reconcile `model-capabilities.md` against provider source; define and run a provider conformance suite

These three items produce the foundation everything else depends on.
