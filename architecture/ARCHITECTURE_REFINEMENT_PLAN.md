# Architecture Refinement Plan

## Purpose

This plan refines the architecture assessment into a repository-specific roadmap for the current AI TOOLKIT monorepo. The repository already has strong foundations: ADRs, domain packaging, runtime contracts, provider breadth, framework adapters, and extensive docs/examples. The next step is not broad package proliferation; it is clarifying the platform layers and turning the existing structure into an explicit, enforceable system.

---

## 1. Working assumptions

The current repository is already structurally mature relative to a typical SDK monorepo. The real opportunity is to move from a large collection of packages to a coherent platform architecture.

### Confirmed strengths

- Domain-based packaging already exists via `packages/core`, `packages/providers`, `packages/adapters`, `packages/ui`, `packages/mcp`, `packages/validation`, and `packages/infrastructure`.
- Architecture governance is already present in `AGENTS.md`, ADRs, runtime support docs, and migration documentation.
- The repo has a strong provider ecosystem and a solid runtime contract direction.
- The repository already thinks in capability and runtime terms, which is a better foundation than ad hoc package growth.

### Key constraint

The biggest risk is not missing capability. It is architectural drift caused by broad growth without a stricter conceptual model.

---

## 2. Refined architectural model

The target architecture should be expressed as a layered platform instead of a flat package tree.

### Layer 1: Foundation

This is the lowest-level shared substrate.

Responsibilities:

- types and protocol structures
- serialized content types
- streams and transport contracts
- error model
- schema and validation primitives
- runtime capability detection
- common HTTP/serialization utilities

Repository alignment:

- `packages/core/runtime`
- `packages/validation/*`
- `packages/core/provider-utils` should be treated as a compatibility layer only until it is split by responsibility

Rule:

- foundation should depend on no higher layer

### Layer 2: Runtime and orchestration

This is where execution semantics live.

Responsibilities:

- text generation and structured generation
- tool orchestration
- agents and workflows
- memory/context abstraction
- multimodal and embeddings runtime behavior
- telemetry and run tracing

Repository alignment:

- `packages/core/ai-toolkit`
- `packages/core/runtime`
- `packages/core/provider-utils` for shared runtime utilities

Rule:

- runtime may depend on foundation, providers, and protocols
- runtime must not be provider- or framework-specific

### Layer 3: Protocols and provider contracts

This is the normalized boundary between the platform and external systems.

Responsibilities:

- `MCP`, `A2A`, `ACP`, OpenAI-compatible interfaces
- normalized request/response models
- provider capability declarations
- semantic compatibility contracts

Repository alignment:

- `packages/mcp`
- `packages/providers/*`
- `packages/validation/*`

Rule:

- protocol packages are first-class and should not be buried inside integration packages

### Layer 4: Gateway and policy enforcement

This is the control plane for routing, auth, safety, and resilience.

Responsibilities:

- model routing
- fallback and health management
- policy decisions
- tenant/project scopes
- quotas and cost control
- tracing and observability metadata

Repository alignment:

- existing gateway package direction
- may remain in `packages/core/gateway` or become a dedicated gateway domain under the same top-level organization if the repo continues to expand

Rule:

- gateway should orchestrate across runtime + protocols + provider implementations
- gateway should not own business logic unrelated to routing and enforcement

### Layer 5: Integrations

This is the ecosystem edge.

Responsibilities:

- React, Vue, Angular, RSC, Svelte integrations
- LangChain / LlamaIndex / ecosystem adapters
- protocol consumers and bridge packages

Repository alignment:

- `packages/adapters`
- maintain split between framework integrations and ecosystem integrations

Rule:

- integrations depend on runtime and protocol contracts, never on provider internals

### Layer 6: Experience and developer tooling

This is the developer-facing surface.

Responsibilities:

- UI primitives and experience packages
- dev tools and trace/debug systems
- generators, codemods, and validation tooling
- CLI and diagnostics

Repository alignment:

- `packages/ui`
- `packages/special/*`
- `packages/infrastructure/*`

Rule:

- experience and tooling should consume runtime and gateway abstractions, not low-level provider implementations

---

## 3. Target package principles

### Principle 1: architecture by responsibility, not by adoption history

The repository is already a monorepo with many package types; that is fine. The important improvement is that each package should clearly map to one of the above layers.

### Principle 2: providers are contract implementations, not platform logic

Providers are not the center of the platform; they are adapters that satisfy shared capability contracts.

### Principle 3: capabilities trump provider-specific branching

The repo already has concepts for model capabilities and runtime support. These should become the canonical decision layer for routing and request planning.

### Principle 4: all packages must declare stable metadata

This should be machine-readable metadata: domain, runtime support, owner, stability, allowed dependencies, and capabilities.

### Principle 5: generated artifacts and source should be kept structurally separate

`dist`, coverage, temporary outputs, and generated docs should not live in the conceptual source tree as if they are primary architecture.

---

## 4. Recommended repository refinement roadmap

## Phase 0 — Architectural inventory and freeze

Goal: create a static inventory of what exists before making more structural changes.

Deliverables:

- package registry
- dependency graph
- runtime matrix
- provider capability registry
- package ownership and stability labels
- public API inventory

Concrete repo actions:

- validate all current package names and ownership metadata
- inventory `packages/core`, `packages/providers`, `packages/adapters`, `packages/ui`, `packages/mcp`, `packages/validation`, and `packages/infrastructure`
- map each package to foundation/runtime/gateway/protocol/integration/experience

Exit criteria:

- every package belongs to a clear domain
- no package is ambiguous between runtime, provider, and integration concerns

---

## Phase 1 — Formalize contracts and metadata

Goal: turn architecture into a rule-driven system rather than documentation-only intent.

Changes:

- add package metadata to each published package
- standardize runtime rules (`node`, `edge`, `browser`)
- define allowed dependency direction for each layer
- define capability registry for providers and models
- codify a provider conformance suite

Concrete repo actions:

- treat `packages/core/runtime` as the contract baseline
- verify `packages/validation/*` remains runtime-neutral
- require that integrations depend only on runtime/protocol interfaces
- require gateway logic to depend on normalized capability metadata

Exit criteria:

- architecture checks can fail CI for invalid dependency direction
- provider capabilities are queryable and comparable

---

## Phase 2 — Normalize runtime and provider boundaries

Goal: reduce provider leakage into the runtime core.

Issues to resolve:

- `provider-utils` is a general-purpose utility bucket and should be split by responsibility
- runtime should not become a proxy for provider-specific logic
- providers should all satisfy a standard lifecycle and test contract

Concrete repo actions:

- split utility concerns into stream/media/schema/http/retry/serialization responsibilities
- centralize provider conformance tests
- standardize model metadata and capability evaluation
- define provider lifecycle: discovery, auth, request mapping, response mapping, streaming, telemetry, error handling

Exit criteria:

- provider implementations follow the same lifecycle and test obligations
- runtime logic is portable across providers without provider-specific branching

---

## Phase 3 — Clarify gateway and policy architecture

Goal: make gateway a control-plane concern rather than a thin wrapper.

Concrete repo actions:

- define model resolution, capability resolution, fallback policy, routing policy
- define run/session metadata and tracing boundaries
- define auth and tenant isolation responsibilities
- align gateway to provider contracts and runtime capabilities

Required outputs:

- routing policy model
- capability policy model
- request normalization model
- execution trace model

Exit criteria:

- gateway decisions are based on normalized request + capability + policy data
- no direct coupling from UI or examples to provider internals

---

## Phase 4 — Split integrations cleanly

Goal: make the boundary between framework integrations and ecosystem integrations explicit.

Concrete repo actions:

- keep framework adapters under a clear integration domain
- separate ecosystem bridges like LangChain and LlamaIndex from direct framework UI packages
- avoid burying protocol packages inside integrations

Recommended boundary:

- `packages/adapters` = framework/integration surface
- `packages/mcp` and other protocol packages = first-class protocol layer

Exit criteria:

- framework packages do not import provider-specific implementations directly
- protocol packages remain reusable across frameworks

---

## Phase 5 — Upgrade developer experience and observability

Goal: make the platform diagnosable and scalable.

Concrete repo actions:

- define a canonical run model
- define trace, usage, and latency dimensions
- add a standard observability layer for provider calls, tool invocations, and workflow runs
- convert docs generation to be metadata-driven rather than manually maintained
- expand CLI/doctor tooling around architecture inspection

Exit criteria:

- every request can be correlated through a run/session trace
- docs and capability matrices can be generated from code/package contracts

---

## 5. Implementation order

Priority order for this repository:

1. package metadata + dependency rules
2. runtime/provider boundary cleanup
3. capability registry and provider conformance suite
4. gateway routing and policy model
5. integration separation and protocol clarity
6. observability + run model
7. docs generation from metadata

This order yields the highest architectural leverage with the least churn.

---

## 6. Success criteria

The refinement is successful when:

- each package has a single architectural purpose
- runtime logic is provider-agnostic
- providers satisfy a common contract and conformance suite
- routing and policy decisions are capability-driven
- integrations depend on contracts, not provider internals
- observability can trace a request across runtime, gateway, and provider boundaries
- docs and package inventories are generated from authoritative metadata

---

## 7. Practical recommendation for this repo

The most important architectural move is not to rename packages wholesale or create a complete new top-level taxonomy immediately. The most effective path is:

- keep the current monorepo layout
- enforce clear domains
- standardize contracts
- make capability, routing, and run metadata primary
- reduce utility sprawl and provider leakage

That approach preserves current work while moving the repo toward the platform architecture described in the assessment.

---

## 8. Recommended next milestone

The next milestone should be a repository-wide architecture validation pass that produces:

- package domain map
- runtime capability matrix
- provider conformance checklist
- dependency rule set
- run/trace metadata model

This should be treated as the foundation for the next large-scale platform iteration.
