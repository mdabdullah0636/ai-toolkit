# Architecture Implementation Checklist

Turn the AI TOOLKIT monorepo into a coherent platform architecture with explicit layers, contracts, and enforceable rules. This checklist is designed for the current repo state — 63 packages across 8 domains — not a hypothetical future layout.

---

## Phase 0: Package Inventory and Classification

**Goal**: Every package gets a precise architectural layer assignment. No package is ambiguous.

- [x] Classify all 63 packages into one of: foundation, runtime, protocol, gateway, integration, experience/tooling
- [x] Create a package registry table with: package name, directory, layer, domain, owner, stability, runtime support, published status
- [x] Flag `ai-toolkit` → `@ai-toolkit/gateway` dependency — resolved by moving gateway to `packages/core/gateway/` (Runtime layer)
- [x] Flag `@ai-toolkit/valibot` dependency on `@ai-toolkit/provider-utils` — resolved by reclassifying valibot as Runtime layer
- [x] Flag `@ai-toolkit/capabilities` dependency on `@ai-toolkit/runtime` (capabilities depend on runtime, not the reverse)
- [x] Flag `@ai-toolkit/khulnasoft` dependency on `@ai-toolkit/openai-compatible` (special package depending on a provider — see `architecture/domain-mapping.md`)
- [x] Flag `@ai-toolkit/harness-acp` as a shared dependency for 7 harness provider packages (`harness-grok-build`, `harness-opencode`, `harness-cursor`, `harness-codex`, `harness-claude-code`, `harness-cline`, `harness-pi` — all in `packages/providers/`); `@ai-toolkit/harness` is the base package they extend
- [x] Flag `@ai-toolkit/openai-compatible` consumed by 9 packages including `@ai-toolkit/khulnasoft` (provider-to-provider + cross-domain)
- [x] Flag `@ai-toolkit/harness` as a base package that `@ai-toolkit/harness-acp` and consumer packages depend on
- [x] Document which packages are published vs internal-only (`@ai-toolkit/test-server`, `@ai-toolkit/design`, `@ai-toolkit/shadcn-ui`)
- [x] Distinguish source packages from generated artifacts (`dist`, `coverage`, build output)
- [x] Record the actual dependency graph from all `package.json` files (via `tools/scripts/inventory.mjs` → `build/inventory.json`)

**Exit criteria**:

- Every package belongs to exactly one layer
- No package is ambiguous between two layers
- The dependency graph is documented and matches `package.json` reality

**Owner**: Architecture lead

---

## Phase 1: Dependency-Direction Validation

**Goal**: Dependency direction is a CI-enforced rule, not a convention.

- [x] Define allowed dependencies per layer:
  - Foundation → nothing higher
  - Runtime → foundation, providers
  - Protocol → foundation
  - Gateway → foundation, runtime, protocols
  - Integration → runtime, protocols
  - Experience/tooling → runtime, gateway
- [x] Define per-layer disallowed dependencies:
  - Integration must not import provider internals
  - Experience/tooling must not import provider internals
  - Protocol must not depend on integration or experience
  - Gateway must not depend on integration or experience
- [x] Add a CI validation step (`tools/scripts/check-dependency-direction.mjs`) that:
  - Parses all `package.json` dependency/peerDependency/devDependency fields
  - Parses TypeScript/JavaScript import statements in source files
  - Fails the build if any package imports from a layer it is not allowed to
- [x] Validate the existing dependency graph against the rules and resolve violations
- [x] Resolve the `ai-toolkit → @ai-toolkit/gateway` dependency direction issue — moved gateway to `packages/core/gateway/`, classified as Runtime layer (intra-layer)
- [x] Resolve whether `@ai-toolkit/valibot` belongs in foundation — reclassified as Runtime layer (depends on `@ai-toolkit/provider-utils`, now intra-layer)
- [x] Add the dependency validation command to the developer workflow (`pnpm arch:deps`, runs on PR via CI)

**Exit criteria**:

- CI fails on invalid dependency direction
- All current packages pass the new dependency check
- The `ai-toolkit → gateway` dependency is either restructured or explicitly permitted by layer rules

**Owner**: Runtime/core maintainer + architecture lead

---

## Phase 2: Capability Registry and Provider Conformance Suite

**Goal**: Providers are contract implementations, not platform logic. Capabilities drive routing decisions.

### 2a. Capability Registry

- [x] Reconcile `architecture/model-capabilities.md` against each provider's actual `src/*-provider.ts` export surface — script created at `tools/scripts/generate-capability-matrix.mjs`
- [x] Make the capability matrix machine-generated from provider source, not a manual table — outputs `build/capability-matrix.json`, validated by `pnpm arch:capabilities:check`
- [x] Define `ModelCapabilityDescriptor` entries for all 12 capability categories (chat, vision, embedding, speech, audio, reasoning, image, video, reranker, moderation, ocr, translation) — `ModelCapability` type already in `@ai-toolkit/capabilities`
- [x] Ensure `@ai-toolkit/capabilities` is the single source of truth for capability declarations — `model-capabilities.md` now references generated output
- [ ] Add per-model detail (context window, pricing tier, streaming support, tool calling, structured output) to capability descriptors
- [x] Verify that each of the 41 provider packages exports its capability metadata in a discoverable, queryable format — 43 providers detected
- [x] Add `arch:capabilities` and `arch:capabilities:check` scripts to package.json

### 2b. Provider Conformance Suite

- [x] Define a provider conformance test suite covering:
  - Text generation (`doGenerate`) with standard prompts
  - Streaming behavior (chunk format, termination)
  - Embedding generation (`embed`, `embedMany`)
  - Image generation (`generateImage`)
  - Error handling (invalid API key, rate limit)
  - Cancellation and abort signal propagation
  - Usage metadata reporting (tokens)
- [x] Add conformance tests to `@ai-toolkit/provider/src/conformance/` that every provider package should be able to run
- [x] Run the conformance suite against at least 5 provider packages as a pilot (openai, anthropic, google, azure, amazon-bedrock) — **pilot results**: OpenAI 7/7 pass, Anthropic 4/4 pass, Google 6/7 pass (1 skipped: batch embedding), Azure 7/7 pass
- [ ] Document any provider-specific deviations from the conformance contract
- [x] Add conformance pass/fail status to the capability matrix (via `build/capability-matrix.json`)

**Exit criteria**:

- Capability matrix is generated from code, not maintained manually
- Every provider package has a capability descriptor in `@ai-toolkit/capabilities`
- Provider conformance suite exists and can be executed
- At least 1 provider passes the conformance suite (4/4 providers pass; 5th pending)

**Owner**: Provider maintainer + runtime/core maintainer

---

## Phase 3: Runtime and Provider Boundary Cleanup

**Goal**: Reduce utility sprawl and clarify what lives in each core package.

- [x] Audit `@ai-toolkit/provider-utils` for scope creep — document every utility and its responsibility (see `architecture/PROVIDER_UTILS_AUDIT.md`)
- [x] Split `@ai-toolkit/provider-utils` utilities by responsibility (documented in `PROVIDER_UTILS_AUDIT.md`):
  - Streams and chunk formatting
  - Schema conversion and validation (type definitions migrated to `@ai-toolkit/provider`; implementations retained in provider-utils)
  - Serialization and deserialization
  - HTTP and retry logic
  - Media handling (audio, image, video)
  - Tool factory utilities
  - ID generation and general utilities
- [x] Clarify the boundary between `@ai-toolkit/runtime`, `ai-toolkit`, and `@ai-toolkit/provider-utils` (see `PROVIDER_UTILS_AUDIT.md` boundary clarification section)
- [x] Ensure `@ai-toolkit/runtime` has no Node.js builtin dependencies (verify via `validate-structure`) — passes, no violations
- [ ] Standardize provider lifecycle: discovery, auth, request mapping, response mapping, streaming, telemetry, error handling
- [x] Document which `@ai-toolkit/provider-utils` utilities are public vs internal
- [x] Migrate schema type definitions to `@ai-toolkit/provider` (Foundation) — reduces `mcp:runtime` exception (MCP now imports `FlexibleSchema` from Foundation)

**Exit criteria**:

- [x] `@ai-toolkit/provider-utils` scope is documented and bounded (see `architecture/PROVIDER_UTILS_AUDIT.md`)
- [x] Runtime, provider-utils, and provider roles are unambiguous
- [x] No runtime logic is provider-specific

**Owner**: Runtime/core maintainer

---

## Phase 4: Gateway and Policy Architecture

**Goal**: Formalize gateway as a control-plane layer with capability-driven decisions.

- [x] Define normalized request model (input → normalized request that all providers consume)
- [x] Define normalized response model (provider output → normalized response that all consumers receive)
- [x] Define capability resolution rules (which provider for which capability)
- [x] Define model resolution rules (which specific model for which task)
- [x] Define routing policy: fallback, weighted, priority, latency-aware, cost-aware
- [x] Define auth, tenant, quota, rate-limit, and policy enforcement boundaries
- [x] Define run/session metadata for tracing and observability
- [x] Document `@ai-toolkit/gateway`'s actual layer placement — Runtime layer, `packages/core/gateway/`
- [x] Add gateway health and failover policy model

**Exit criteria**:

- Gateway decisions are based on normalized request + capability + policy data
- No direct coupling from UI or examples to provider internals
- Gateway layer placement is unambiguous

**Owner**: Gateway maintainer + architecture lead

---

## Phase 5: Integration Boundary Cleanup

**Goal**: Make the boundary between framework integrations and ecosystem integrations explicit.

- [x] Separate framework adapters (`react`, `rsc`, `vue`, `angular`, `svelte`) from ecosystem bridges (`langchain`, `llamaindex`) — documented in `PACKAGE_INVENTORY.md`
- [x] Ensure framework adapters depend only on runtime and protocol contracts — verified via `arch:deps` (integration → runtime + provider + provider-utils)
- [x] Verify no framework adapter imports provider-specific implementations directly — `arch:deps` import scanner confirms no direct provider imports
- [x] Ensure ecosystem bridges (`langchain`, `llamaindex`) are not confused with framework adapters — both in Integration layer, depend only on `ai-toolkit`
- [x] Keep `@ai-toolkit/mcp` as a first-class protocol layer, not nested under integrations
- [x] Document integration dependency rules: integration → runtime + protocol + foundation, never → provider internals (except documented `rsc:provider` exception)

**Exit criteria**:

- Framework packages do not import provider-specific implementations directly
- Protocol packages remain reusable across frameworks
- Integration layer dependency rules are enforced in CI (from Phase 1)

**Owner**: Adapter maintainers

---

## Phase 6: Observability, DX, and Metadata-Driven Docs

**Goal**: Make the platform diagnosable and docs self-maintaining.

- [ ] Define canonical `Run` model (session, run, step, tool call hierarchy)
- [ ] Define trace, usage, latency, and cost dimensions
- [ ] Add observability conventions for provider calls, tool invocations, and workflow runs
- [ ] Define correlation model: session → run → model → tenant → provider
- [ ] Add debug and trace tooling requirements for support workflows
- [x] Add architecture validation commands to developer workflow (`pnpm arch:validate` or equivalent)
- [x] Add a repo-level inspect command (`pnpm arch:inspect`) that outputs the package registry, dependency graph, and layer classification
- [x] Make `model-capabilities.md` generate from code — `build/capability-matrix.json` generated from provider source; CI freshness check via `arch:capabilities:check`
- [x] Ensure provider catalog reflects actual `@ai-toolkit/capabilities` descriptors — capability matrix generated from provider source
- [x] Keep examples classified by scenario and capability — `content/docs/` and `examples/registry.json`

**Exit criteria**:

- Every request can be correlated through a run/session trace
- Docs and capability matrices can be generated from code/package contracts
- A single command validates architecture health

**Owner**: DX/observability maintainer + architecture lead

---

## Quality Gates

These must all pass before architecture work is considered complete:

- [x] Every package has a precise architectural role (no package belongs to two layers) — 6-layer model in PACKAGE_INVENTORY.md + DEPENDENCY_RULES.md
- [x] Dependency direction is enforced in CI (not just documented) — `pnpm arch:deps` + `pnpm arch:validate`
- [x] Provider implementations pass a conformance suite — conformance test suite in `@ai-toolkit/provider/src/conformance/`
- [ ] Gateway decisions are capability-driven and policy-aware
- [ ] Requests can be traced across runtime, gateway, and provider boundaries
- [ ] Docs are generated from authoritative package metadata
- [x] All packages have `stability` and `owners` metadata in `package.json` (ADR-007) — enforced by `validate-structure.mjs`
- [x] Runtime-neutral packages (`core`, `validation`) have no Node builtin imports (ADR-004, ADR-008) — enforced by `validate-structure.mjs`
- [x] All published packages have `types`, `import`, `require`, `default` export conditions (ADR-006) — enforced by `validate-structure.mjs`

---

## Definition of Done

The architecture refinement is complete when the repository satisfies all quality gates above AND:

1. **Explicit architectural boundaries** — every package has a single, clear role in one of the six layers
2. **Machine-checkable dependency rules** — CI enforces layer boundaries and rejects invalid cross-layer imports
3. **Capability-driven provider model** — providers satisfy a common contract and conformance suite; routing decisions use capability metadata
4. **Traceable execution story** — a request can be followed from entry point through runtime, gateway, and provider boundaries with correlation IDs

---

## Immediate Next Steps (tracked roadmap)

These three items unblock everything else. Start here.

| #   | Task                                                                                                                                      | Phase   | Owner                   | Blocks     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------------------- | ---------- |
| 1   | Package inventory and classification — classify all 63 packages into the 6-layer model; flag dependency direction issues                  | Phase 0 | Architecture lead       | Phase 1, 2 |
| 2   | Dependency-direction validation — define per-layer allowed dependencies; add CI check                                                     | Phase 1 | Runtime/core maintainer | Phase 2–6  |
| 3   | Capability registry and conformance suite definition — reconcile capabilities against source; define and pilot provider conformance tests | Phase 2 | Provider maintainer     | Phase 3–6  |

---

## Suggested Milestone

**Architecture Baseline**: Deliver Phase 0 through Phase 2, producing:

- Package map with layer classification (all 63 packages)
- Capability registry (machine-generated, all providers)
- Runtime matrix (node/edge/browser, per package)
- Provider conformance checklist (with pass/fail for pilot providers)
- Dependency rule set (CI-enforced)

This milestone establishes the authoritative architecture baseline for the repo.

---

## Cross-references

| This document | Related document                                | Connection                                                                              |
| ------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| Phase 0       | `architecture/PACKAGE_INVENTORY.md`             | Authoritative package registry                                                          |
| Phase 0       | `architecture/DEPENDENCY_RULES.md`              | Layer dependency rules                                                                  |
| Phase 0       | `architecture/domain-mapping.md`                | Canonical package-to-domain mapping (source of truth for inventory)                     |
| Phase 1       | `tools/scripts/check-dependency-direction.mjs`  | Validates cross-layer deps + import scanning per DEPENDENCY_RULES.md                    |
| Phase 1       | `tools/scripts/validate-structure.mjs`          | Existing enforcement tool; structure + ADR-004/006/007/008 checks                       |
| Phase 1       | `tools/scripts/arch-inspect.mjs`                | `pnpm arch:inspect` — outputs package registry, layer classification, capability matrix |
| Phase 2a      | `tools/scripts/generate-capability-matrix.mjs`  | Machine-generated capability matrix → `build/capability-matrix.json`                    |
| Phase 2a      | `architecture/model-capabilities.md`            | Capability matrix (now references generated output)                                     |
| Phase 2a      | `architecture/provider-abstraction.md`          | Provider lifecycle and model types                                                      |
| Phase 2b      | `packages/validation/provider/src/conformance/` | Provider conformance test suite                                                         |
| Phase 3       | `architecture/runtime-support.md`               | Runtime support matrix                                                                  |
| Phase 4       | `architecture/ARCHITECTURE_REFINEMENT_PLAN.md`  | Gateway policy model (Phase 3 of refinement plan)                                       |
| Phase 5       | `ARCHITECTURE_QUICK_REFERENCE.md`               | Integration dependency overview                                                         |
| Quality gates | `AGENTS.md`                                     | ADR-004, ADR-006, ADR-007, ADR-008 requirements                                         |

## Current Owners

| Role                        | Team                          |
| --------------------------- | ----------------------------- |
| Architecture lead           | Architecture team             |
| Runtime/core maintainer     | `@khulnasoft/ai-toolkit-core` |
| Provider maintainer         | Provider teams per provider   |
| Gateway maintainer          | `@khulnasoft/ai-toolkit-core` |
| DX/observability maintainer | Developer tools team          |
