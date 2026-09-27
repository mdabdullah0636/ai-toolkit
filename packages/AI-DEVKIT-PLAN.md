# packages/AI-DEVKIT-PLAN.md

## Status

Proposed architecture and executable migration plan.

### Audit Findings (2026-09-16)

| Issue                                                                            | Status      | Fix                                                                          |
| -------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| Plan used `@platform/` namespace                                                 | **Fixed**   | Replaced all `@platform/` with `@ai-toolkit/` to match actual codebase       |
| Source checkpoint referenced non-existent `packages.md`                          | **Fixed**   | Updated Section 1 to reflect actual repo structure                           |
| Broken tsconfig references in examples                                           | **Fixed**   | See Section 8 below                                                          |
| `packages/ai/core/AGENTS.md` used wrong import `ai-toolkit`                      | **Fixed**   | Changed to `@ai-toolkit/ai`                                                  |
| 1199+ example files imported from `ai-toolkit` instead of `@ai-toolkit/ai`       | **Fixed**   | Bulk sed replacement across all example source files                         |
| 20+ `packages/ui/elements` source files imported from `ai-toolkit`               | **Fixed**   | Updated to `@ai-toolkit/ai`                                                  |
| `tools/create-ai-sdk` and `tools/create-ai-provider` templates used `ai-toolkit` | **Fixed**   | Updated to `@ai-toolkit/ai`                                                  |
| Empty target directories (agents, evals, etc.)                                   | **Pending** | Created but awaiting implementation (Phases 7-16)                            |
| `@ai-toolkit/provider-utils` not yet decomposed                                  | **Pending** | Still exists as dependency; plan calls for decomposition into `foundation/*` |
| Residual empty dirs (`packages/core`, `packages/special`)                        | **Fixed**   | Removed (no package.json, not referenced by any tsconfig)                    |

### Broken tsconfig references found and fixed

| File                                                             | Broken Reference                      | Fixed To                         |
| ---------------------------------------------------------------- | ------------------------------------- | -------------------------------- |
| `examples/02-framework-integration/angular/tsconfig.server.json` | `packages/core/ai-toolkit`            | `packages/ai/core`               |
| `examples/01-foundations/ai-functions/tsconfig.json`             | `packages/special/gateway`            | `packages/gateway/core`          |
| `examples/01-foundations/ai-functions/tsconfig.json`             | `packages/special/khulnasoft`         | `packages/foundation/khulnasoft` |
| `examples/01-foundations/ai-functions/tsconfig.json`             | `packages/foundation/schema/provider` | `packages/foundation/provider`   |
| `examples/01-foundations/ai-functions/tsconfig.json`             | `packages/foundation/schema/valibot`  | `packages/foundation/valibot`    |
| `examples/04-tools/playground/tsconfig.json`                     | `packages/foundation/schema/provider` | `packages/foundation/provider`   |
| `examples/02-framework-integration/next-openai/tsconfig.json`    | `packages/foundation/schema/valibot`  | `packages/foundation/valibot`    |

## Purpose

Evolve the existing `packages/` workspace from a layered AI SDK/package collection into a TypeScript-native **AI Development Toolkit** that covers:

- AI model APIs and multimodal generation
- provider contracts and provider implementations
- intelligent gateway/routing
- agents and subagents
- durable workflows
- context and memory
- MCP
- evaluation, replay, regression, and benchmarks
- observability and cost intelligence
- AI security and tool policy
- isolated sandbox execution
- coding-agent/repository intelligence
- framework integrations and AI UI
- AI SDK compatibility

The migration is additive and staged. Existing production behavior must remain working throughout the transition.

---

# 1. Source checkpoint

This plan is derived from the current `packages/` tree captured in `packages.md` and the prior `packages/PLAN.md`.

**Status**: Partial migration already complete. Many target packages exist with code; others are empty directories awaiting implementation.

Current top-level areas include:

```text
ai/
foundation/
gateway/
providers/
integrations/
mcp/
testing/
tooling/
ui/
special/
```

Already migrated to target structure:

```text
packages/ai/core/          → @ai-toolkit/ai (v2.0.0, stable, monolithic — decomposition pending)
packages/gateway/core/     → @ai-toolkit/gateway (v2.0.0, beta)
packages/foundation/provider/ → @ai-toolkit/provider (provider contracts)
packages/foundation/runtime/ → @ai-toolkit/runtime (browser-safe runtime)
packages/foundation/utils/ → @ai-toolkit/provider-utils (shared utilities)
packages/foundation/valibot/ → @ai-toolkit/valibot
packages/foundation/capabilities/ → @ai-toolkit/capabilities
packages/integrations/react    → @ai-toolkit/react
packages/integrations/vue      → @ai-toolkit/vue
packages/integrations/svelte   → @ai-toolkit/svelte
packages/integrations/angular  → @ai-toolkit/angular
packages/integrations/rsc      → @ai-toolkit/rsc
packages/integrations/langchain → @ai-toolkit/langchain
packages/integrations/llamaindex → @ai-toolkit/llamaindex
packages/testing/test-server → @ai-toolkit/test-server
packages/tooling/codemod     → @ai-toolkit/codemod
packages/tooling/devtools    → @ai-toolkit/devtools
packages/foundation/platform → @ai-toolkit/platform (internal registry/generation)
```

Empty target directories (created in anticipation, awaiting implementation):

```text
packages/agents/      → empty (Phase 7: Agent Runtime v1)
packages/evals/       → empty (Phase 12: Evaluation platform v1)
packages/observability/ → empty (Phase 14: Observability v1)
packages/sandbox/     → empty (Phase 16: Sandbox v1)
packages/security/    → empty (Phase 15: Security v1)
packages/memory/      → empty (Phase 10: Memory v1)
packages/context/     → empty (Phase 9: Context Engine v1)
packages/workflow/    → empty (Phase 8: Workflow Engine v1)
```

Removed directories:

```text
packages/core/        → REMOVED (residual empty dir, no package.json)
packages/special/     → REMOVED (residual empty dir, no package.json)
packages/compatibility/ → does not exist (Phase 18 target: AI SDK compatibility bridge)
```

The current tree contains a large `packages/ai/core` package (~441KB CJS bundle), a working `packages/gateway/core`, a provider contract package at `packages/foundation/provider`, many provider implementations, framework integrations, AI UI elements, and shared foundation packages.

The existing provider packages use repeatable provider/model/options/error/test layouts. The existing UI surface already contains AI-specific elements such as agent, artifact, message, model selector, sandbox, task, terminal, tool, voice, and web-preview components. These become migration anchors rather than being rewritten from scratch.

---

# 2. Product target

## Positioning

The target is **not merely an alternative AI SDK**.

It is:

> A TypeScript-native AI development runtime for building, running, evaluating, debugging, securing, and continuously improving AI applications and agents.

## Product layers

```text
AI Applications
      ↓
AI DevKit API
      ↓
AI Core + Models + Tools
      ↓
Agents + Workflow + Context + Memory
      ↓
Gateway + Providers + MCP
      ↓
Sandbox + Security + Observability
      ↓
Evals + Replay + Regression + Optimization
```

---

# 3. Target package architecture

```text
packages/
├── foundation/
│   ├── types/
│   ├── errors/
│   ├── protocol/
│   ├── schema/
│   ├── runtime/
│   ├── fetch/
│   ├── stream/
│   └── utils/
│
├── ai/
│   ├── core/
│   ├── model/
│   ├── generate/
│   ├── stream/
│   ├── object/
│   ├── embed/
│   ├── rerank/
│   ├── image/
│   ├── video/
│   ├── speech/
│   ├── transcription/
│   ├── translation/
│   ├── realtime/
│   ├── multimodal/
│   ├── tools/
│   ├── prompt/
│   ├── middleware/
│   ├── registry/
│   └── telemetry/
│
├── agents/
│   ├── core/
│   ├── runtime/
│   ├── planning/
│   ├── loops/
│   ├── delegation/
│   ├── subagents/
│   ├── context/
│   ├── memory/
│   ├── approvals/
│   ├── policies/
│   └── autonomy/
│
├── workflow/
│   ├── core/
│   ├── graph/
│   ├── state/
│   ├── durable/
│   ├── events/
│   ├── scheduling/
│   ├── retry/
│   ├── pause-resume/
│   └── human-in-loop/
│
├── gateway/
│   ├── core/
│   ├── client/
│   ├── server/
│   ├── registry/
│   ├── routing/
│   ├── resolution/
│   ├── fallback/
│   ├── cache/
│   ├── policy/
│   ├── quota/
│   ├── billing/
│   └── telemetry/
│
├── providers/
│   ├── openai/
│   ├── anthropic/
│   ├── google/
│   ├── google-vertex/
│   ├── azure/
│   ├── amazon-bedrock/
│   ├── groq/
│   ├── mistral/
│   ├── xai/
│   ├── deepgram/
│   ├── elevenlabs/
│   ├── assemblyai/
│   ├── replicate/
│   ├── fal/
│   └── openai-compatible/
│
├── mcp/
│   ├── core/
│   ├── client/
│   ├── server/
│   ├── transport/
│   ├── protocol/
│   ├── tools/
│   ├── resources/
│   ├── prompts/
│   ├── registry/
│   └── auth/
│
├── memory/
│   ├── core/
│   ├── working/
│   ├── episodic/
│   ├── semantic/
│   ├── procedural/
│   ├── vector/
│   ├── graph/
│   ├── retrieval/
│   └── lifecycle/
│
├── context/
│   ├── core/
│   ├── collector/
│   ├── ranking/
│   ├── budgeting/
│   ├── compression/
│   ├── summarization/
│   ├── retrieval/
│   ├── provenance/
│   └── cache/
│
├── evals/
│   ├── core/
│   ├── datasets/
│   ├── cases/
│   ├── graders/
│   ├── judges/
│   ├── assertions/
│   ├── regression/
│   ├── benchmarks/
│   ├── experiments/
│   └── replay/
│
├── observability/
│   ├── tracing/
│   ├── metrics/
│   ├── logs/
│   ├── cost/
│   ├── latency/
│   ├── tokens/
│   └── events/
│
├── security/
│   ├── core/
│   ├── auth/
│   ├── permissions/
│   ├── policy/
│   ├── prompt-injection/
│   ├── tool-security/
│   ├── secrets/
│   ├── pii/
│   ├── sandbox-policy/
│   └── audit/
│
├── sandbox/
│   ├── core/
│   ├── runtime/
│   ├── filesystem/
│   ├── process/
│   ├── network/
│   ├── snapshots/
│   ├── artifacts/
│   └── limits/
│
├── coding/
│   ├── repository/
│   ├── indexing/
│   ├── symbols/
│   ├── diagnostics/
│   ├── patches/
│   ├── git/
│   ├── tests/
│   ├── review/
│   └── pull-request/
│
├── integrations/
│   ├── react/
│   ├── vue/
│   ├── svelte/
│   ├── angular/
│   ├── rsc/
│   ├── langchain/
│   └── llamaindex/
│
├── ui/
│   ├── primitives/
│   ├── design/
│   ├── elements/
│   ├── chat/
│   ├── agent/
│   ├── workflow/
│   ├── traces/
│   ├── evals/
│   ├── playground/
│   └── studio/
│
├── testing/
│   ├── core/
│   ├── mocks/
│   ├── fixtures/
│   ├── simulators/
│   ├── harness/
│   └── agent-test/
│
├── tooling/
│   ├── cli/
│   ├── codemod/
│   ├── devtools/
│   ├── inspector/
│   └── project-init/
│
└── compatibility/
    └── ai-sdk/
```

---

# 4. Canonical package names

Use one namespace consistently:

```text
@ai-toolkit/ai
@ai-toolkit/provider
@ai-toolkit/provider-openai
@ai-toolkit/provider-anthropic
@ai-toolkit/agent
@ai-toolkit/workflow
@ai-toolkit/memory
@ai-toolkit/context
@ai-toolkit/gateway
@ai-toolkit/mcp
@ai-toolkit/evals
@ai-toolkit/observability
@ai-toolkit/security
@ai-toolkit/sandbox
@ai-toolkit/coding
@ai-toolkit/react
@ai-toolkit/vue
@ai-toolkit/svelte
@ai-toolkit/rsc
@ai-toolkit/ui
@ai-toolkit/ui-elements
@ai-toolkit/cli
@ai-toolkit/ai-sdk-compat
@ai-toolkit/ai-devkit
```

`@ai-toolkit/ai-devkit` is the convenience meta-package. It should not contain business logic.

---

# 5. Dependency DAG

```text
                           foundation
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
             ai             context          security
              │                │                │
       ┌──────┼───────┐       │         ┌──────┴──────┐
       ▼      ▼       ▼       ▼         ▼             ▼
    gateway agents  memory  workflow   sandbox     observability
       │      │       │       │           │            │
       └──────┴───────┴───────┴──────┬────┴────────────┘
                                     ▼
                                  providers
                                     │
                              integrations / mcp
                                     │
                                     ▼
                                     ui

validation/testing/tooling may test or inspect all layers but must not become
runtime dependencies of production packages.
```

## Actual dependency state (as of audit)

```text
foundation/runtime ────┐
foundation/utils ──────┤
foundation/provider ───┼──▶ @ai-toolkit/gateway ──┐
foundation/valibot ────┤                         │
foundation/capabilities┘                         │
foundation/khulnasoft ──┐                        │
foundation/platform ────┐                        │
                        ▼                        ▼
              @ai-toolkit/ai ──▶ @ai-toolkit/provider ──▶ providers/*
               │                                      │
               └──▶ @ai-toolkit/gateway ──────────────┘
               │
               └──▶ @opentelemetry/api (external)
```

Key actual dependencies:

- `@ai-toolkit/ai` → `@ai-toolkit/gateway`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`, `@opentelemetry/api`
- `@ai-toolkit/gateway` → `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`, `@vercel/oidc`
- `@ai-toolkit/provider` → foundation/\* (internal)
- `@ai-toolkit/provider-utils` → foundation/\* (internal)

## Forbidden edges

```text
foundation → providers
foundation → ui
ai → provider-openai
ai → react
provider → react
provider → ui
ui → provider-openai
production → tooling
production → test-server
```

Note: `@ai-toolkit/ai → @ai-toolkit/gateway` is currently an edge that the plan's DAG doesn't explicitly show but exists in the actual codebase. This may need architectural review since gateway depends on provider, making `ai → gateway → provider` a chain.

---

# 6. Public API contracts

## `@ai-toolkit/ai`

```ts
export {
  generateText,
  streamText,
  generateObject,
  streamObject,
  embed,
  embedMany,
  rerank,
} from './core';

export type {
  LanguageModel,
  EmbeddingModel,
  ImageModel,
  VideoModel,
  SpeechModel,
  TranscriptionModel,
  RealtimeModel,
} from '@ai-toolkit/provider';
```

## `@ai-toolkit/agent`

```ts
export interface Agent {
  run(input: AgentInput, options?: AgentRunOptions): Promise<AgentResult>;
  stream(input: AgentInput, options?: AgentRunOptions): AgentStream;
  resume(runId: string, options?: ResumeOptions): Promise<AgentResult>;
}
```

## `@ai-toolkit/workflow`

```ts
export interface Workflow<I, O> {
  run(input: I): Promise<O>;
  start(input: I): Promise<WorkflowHandle>;
  resume(runId: string): Promise<O>;
  inspect(runId: string): Promise<WorkflowState>;
}
```

## `@ai-toolkit/memory`

```ts
export interface MemoryStore {
  put(entry: MemoryEntry): Promise<void>;
  get(id: string): Promise<MemoryEntry | null>;
  search(query: MemoryQuery): Promise<MemoryHit[]>;
  delete(id: string): Promise<void>;
}
```

## `@ai-toolkit/evals`

```ts
export interface Evaluator<TInput, TOutput> {
  evaluate(input: TInput, output: TOutput): Promise<EvaluationResult>;
}
```

## `@ai-toolkit/sandbox`

```ts
export interface Sandbox {
  exec(command: string, options?: ExecOptions): Promise<ExecResult>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array | string): Promise<void>;
  snapshot(): Promise<SnapshotRef>;
  restore(snapshot: SnapshotRef): Promise<void>;
  destroy(): Promise<void>;
}
```

---

# Phase 0 — Freeze and inventory

## Goal

Create a dependency-aware migration inventory without changing behavior.

## Tasks

- [ ] enumerate all package directories
- [ ] read every `package.json`
- [ ] extract dependencies/peerDependencies/devDependencies
- [ ] classify runtime: browser/node/edge/universal
- [ ] identify public exports
- [ ] detect generated `dist/` files
- [ ] detect duplicate utilities
- [ ] detect package cycles
- [ ] generate migration inventory

## Outputs

```text
.docs/packages/
├── inventory.json
├── dependency-graph.json
├── exports.json
├── runtime-matrix.json
├── duplicate-capabilities.md
└── migration-map.md
```

## Acceptance

No package is moved before it has a recorded owner and dependency set.

---

# Phase 1 — Establish package governance

Create:

```text
packages/README.md
packages/ARCHITECTURE.md
packages/PACKAGE-RULES.md
```

Add lint/CI rules for:

- dependency direction
- allowed workspace imports
- no internal-source imports across packages
- no generated `dist/` source commits
- package metadata consistency

Acceptance:

```bash
pnpm lint:architecture
pnpm check:packages
```

must run successfully.

---

# Phase 2 — Foundation extraction

## Existing → target

```text
core/runtime/*
  → foundation/runtime/*

core/provider-utils/src/schema*
  → foundation/schema/*

core/provider-utils/src/*headers*
  → foundation/fetch/*

core/provider-utils/src/*stream*
  → foundation/stream/*

core/provider-utils/src/*error*
  → foundation/errors/*

core/provider-utils/src/*serialize*
  → foundation/protocol/*
```

Keep `@ai-toolkit/provider-utils` as a compatibility re-export package until downstream imports migrate.

Acceptance:

- no provider imports internal foundation paths
- no duplicate foundational implementation remains
- public type signatures unchanged

---

# Phase 3 — Provider contract extraction

Current provider capability semantics become canonical in:

```text
packages/foundation/provider/
```

or, preferably for public consumers:

```text
packages/provider/
```

Recommended package:

```text
@ai-toolkit/provider
```

Extract interfaces for:

```text
language model
embedding model
image model
video model
speech model
transcription model
translation model
realtime model
reranking model
batch
files
skills
middleware
provider
```

Validation tests consume these interfaces but do not define them.

---

# Phase 4 — AI core decomposition

## Existing

```text
core/ai-toolkit/
```

## Target

```text
ai/core/
ai/model/
ai/generate/
ai/stream/
ai/object/
ai/embed/
ai/rerank/
ai/image/
ai/video/
ai/speech/
ai/transcription/
ai/translation/
ai/realtime/
ai/multimodal/
ai/tools/
ai/prompt/
ai/middleware/
ai/registry/
ai/telemetry/
```

Split by public responsibility, not by arbitrary file count.

`@ai-toolkit/ai` becomes the ergonomic facade.

---

# Phase 5 — Provider normalization

Migrate existing provider packages without rewriting provider behavior.

## Exact namespace mappings

```text
providers/amazon-bedrock
  → providers/amazon-bedrock

providers/anthropic
  → providers/anthropic

providers/assemblyai
  → providers/assemblyai

providers/azure
  → providers/azure

providers/baseten
  → providers/baseten

providers/black-forest-labs
  → providers/black-forest-labs

providers/bytedance
  → providers/bytedance

providers/cerebras
  → providers/cerebras

providers/cohere
  → providers/cohere

providers/deepgram
  → providers/deepgram

providers/deepinfra
  → providers/deepinfra

providers/deepseek
  → providers/deepseek

providers/elevenlabs
  → providers/elevenlabs

providers/fal
  → providers/fal

providers/fireworks
  → providers/fireworks

google
  → providers/google

google-vertex
  → providers/google-vertex

groq
  → providers/groq

hume
  → providers/hume

huggingface
  → providers/huggingface

lmnt
  → providers/lmnt

luma
  → providers/luma

mistral
  → providers/mistral

openai
  → providers/openai

openai-compatible
  → providers/openai-compatible

perplexity
  → providers/perplexity

prodia
  → providers/prodia

replicate
  → providers/replicate

revai
  → providers/revai

togetherai
  → providers/togetherai

xai
  → providers/xai
```

Provider internals remain vendor-specific.

Standard internal shape:

```text
src/
├── provider.ts
├── models/
├── options/
├── protocol/
├── conversion/
├── tools/
├── errors/
├── tests/
└── index.ts
```

Do not force unsupported modalities into a provider package.

---

# Phase 6 — Gateway 2.0

## Existing

```text
core/gateway
```

## Target

```text
gateway/core
gateway/client
gateway/server
gateway/registry
gateway/routing
gateway/resolution
gateway/fallback
gateway/cache
gateway/policy
gateway/quota
gateway/billing
gateway/telemetry
```

### Required capabilities

- provider registry
- model capability registry
- model aliasing
- intelligent routing
- fallback chains
- latency-aware routing
- cost-aware routing
- context-aware routing
- retry policy
- request budgets
- quota enforcement
- semantic cache
- telemetry
- request tracing

### Intelligent routing API

```ts
const model = await gateway.resolve({
  task: 'repository-analysis',
  capabilities: ['tools', 'structured-output'],
  budget: { maxCost: 1.0 },
  latency: { maxMs: 3000 },
  context: { tokens: 100000 },
});
```

---

# Phase 7 — Agent Runtime v1

Create:

```text
packages/agents/
```

## Runtime components

```text
Agent
 ├── model-router
 ├── planner
 ├── context-manager
 ├── memory-manager
 ├── tool-router
 ├── policy-engine
 ├── approval-engine
 ├── evaluator
 ├── recovery-manager
 └── event-bus
```

## Core capabilities

- tool loops
- multi-step reasoning state
- model switching
- subagents
- delegation
- approvals
- retries
- checkpoints
- resumable execution
- cancellation
- structured state
- event emission

## Agent API

```ts
const agent = createAgent({
  model: 'auto',
  tools,
  memory,
  policy,
  evaluator,
});

const result = await agent.run({
  task,
});
```

Acceptance:

- deterministic lifecycle events
- persisted run state
- resumable execution
- tool policy enforcement
- trace produced for every run

---

# Phase 8 — Workflow Engine v1

Create durable workflow primitives.

```ts
const workflow = defineWorkflow({
  analyze,
  plan,
  implement,
  test,
  review,
});
```

Capabilities:

```text
sequence
parallel
branch
join
map
reduce
retry
backoff
timeout
pause
resume
human approval
scheduled execution
event-driven execution
checkpoint
compensation
```

Workflow state must be serializable and inspectable.

Acceptance:

- kill/restart does not lose checkpointed state
- pause/resume preserves logical execution
- retries are idempotent where configured

---

# Phase 9 — Context Engine v1

Create:

```text
packages/context/
```

Responsibilities:

```text
collect
rank
budget
compress
summarize
retrieve
cache
provenance
```

API:

```ts
const context = await contextEngine.build({
  task,
  conversation,
  memories,
  documents,
  tools,
  budget: 128_000,
});
```

Acceptance:

- token budget enforcement
- deterministic ranking in tests
- provenance preserved
- pluggable retrievers

---

# Phase 10 — Memory v1

Create:

```text
packages/memory/
```

Memory classes:

```text
working
short-term
episodic
semantic
procedural
repository
organizational
```

Lifecycle:

```text
capture
→ normalize
→ score
→ store
→ retrieve
→ reinforce
→ decay
→ merge
→ invalidate
```

API:

```ts
const memory = createMemory({
  store,
  embeddings,
  namespace: 'agent:123',
});
```

Acceptance:

- persistence
- search
- namespace isolation
- metadata filters
- deletion
- lifecycle hooks

---

# Phase 11 — MCP Fabric v1

Existing:

```text
mcp/
```

Target:

```text
mcp/core
mcp/client
mcp/server
mcp/transport
mcp/protocol
mcp/tools
mcp/resources
mcp/prompts
mcp/registry
mcp/auth
```

Add platform capabilities:

- capability discovery
- tool registry
- resource registry
- authorization
- lifecycle hooks
- telemetry
- health checks
- version negotiation
- per-tool policy

Acceptance:

- existing MCP behavior remains compatible
- stdio/http/sse transports remain covered
- authorization tests exist

---

# Phase 12 — Evaluation platform v1

Create:

```text
packages/evals/
```

Entities:

```text
Dataset
Case
Run
Evaluator
Grader
Judge
Assertion
Experiment
Benchmark
Regression
Replay
```

Example:

```ts
const result = await evaluate(agent, {
  dataset,
  evaluators: [
    correctness(),
    groundedness(),
    toolAccuracy(),
    latency(),
    cost(),
  ],
});
```

Acceptance:

- dataset execution
- deterministic assertions
- custom evaluator API
- LLM-as-judge adapter
- regression comparison
- JSON export

---

# Phase 13 — Deterministic replay

Every agent/workflow run receives a durable event ledger.

```text
run
├── inputs
├── model
├── context
├── tool calls
├── tool results
├── state transitions
├── memory mutations
├── policy decisions
├── timings
├── token usage
├── cost
└── outputs
```

Commands:

```bash
ai replay <run-id>
ai replay <run-id> --model <model>
ai replay <run-id> --mock-tools
ai replay <run-id> --eval
```

Acceptance:

- run can be replayed from persisted events
- external side effects are mockable
- replay output is diffable

---

# Phase 14 — Observability v1

Create:

```text
packages/observability/
```

Capture:

```text
trace
span
model
provider
tokens
latency
cost
cache
tool
workflow
memory
policy
error
```

Provide stable event types that can be consumed by UI and external exporters.

Acceptance:

- every model request is traceable
- every tool execution is traceable
- token/cost accounting is consistent
- errors include correlation IDs

---

# Phase 15 — Security v1

Create:

```text
packages/security/
```

Capabilities:

```text
identity
permissions
capability-based tool access
prompt-injection detection
secret filtering
PII handling
network policy
filesystem policy
sandbox policy
audit log
```

Every privileged operation receives an authorization decision.

Example:

```ts
await policy.authorize({
  agent,
  tool,
  resource,
  operation: 'write',
});
```

Acceptance:

- denied tools cannot execute
- secrets are redacted by policy
- sandbox/network policies are enforced
- audit entries are emitted

---

# Phase 16 — Sandbox v1

Create:

```text
packages/sandbox/
```

Capabilities:

```text
process
filesystem
network
resource limits
snapshot
restore
artifacts
```

API:

```ts
const sandbox = await createSandbox({
  runtime: 'node',
  network: false,
  memory: '2gb',
});
```

Acceptance:

- command execution isolated
- filesystem scoped
- network policy enforced
- snapshot/restore tested
- artifact export tested

---

# Phase 17 — Coding Agent / Repository Intelligence v1

Create:

```text
packages/coding/
```

Capabilities:

```text
repository discovery
file indexing
symbol graph
dependency graph
diagnostics
patch generation
patch application
test execution
git operations
review
PR preparation
```

Execution model:

```text
issue
 ↓
repository analysis
 ↓
plan
 ↓
edit
 ↓
typecheck
 ↓
test
 ↓
review
 ↓
repair
 ↓
diff
 ↓
PR
```

Acceptance:

- agent can inspect repository structure
- patches are reviewable
- tests execute in sandbox
- failed tests can trigger repair loops

---

# Phase 18 — AI SDK compatibility bridge

Create:

```text
packages/compatibility/ai-sdk/
```

Canonical package:

```text
@ai-toolkit/ai-sdk-compat
```

Goal:

Allow common AI SDK-style application code to migrate incrementally onto the platform runtime.

Compatibility surface should cover, where practical:

```text
generateText
streamText
generateObject
streamObject
tool definitions
model/provider references
UI message patterns
transports
MCP adapters
```

Do not duplicate the underlying implementations.

Compatibility packages should translate API calls into `@ai-toolkit/ai`, `@ai-toolkit/agent`, `@ai-toolkit/workflow`, and `@ai-toolkit/gateway`.

Acceptance:

- compatibility examples compile
- migration docs exist
- compatibility package has no provider-specific logic
- canonical runtime remains the source of truth

---

# Phase 19 — UI / Studio / Developer Experience

Reorganize existing AI UI components into:

```text
ui/primitives
ui/design
ui/elements
ui/chat
ui/agent
ui/workflow
ui/traces
ui/evals
ui/playground
ui/studio
```

Build AI Studio surfaces:

```text
Model Explorer
Prompt Lab
Agent Builder
Workflow Builder
Tool Explorer
MCP Explorer
Memory Explorer
Trace Viewer
Evaluation Lab
Replay Inspector
Sandbox
Cost Explorer
```

Existing AI-specific elements should be migrated instead of rewritten wherever possible.

Acceptance:

- core primitives remain framework-safe
- AI-specific UI consumes public platform contracts
- no concrete provider import from UI packages

---

# Phase 20 — Unification, packaging, and release

Create meta-package:

```text
@ai-toolkit/ai-devkit
```

Exports stable top-level APIs:

```ts
export * from '@ai-toolkit/ai';
export * from '@ai-toolkit/agent';
export * from '@ai-toolkit/workflow';
export * from '@ai-toolkit/memory';
export * from '@ai-toolkit/context';
export * from '@ai-toolkit/gateway';
export * from '@ai-toolkit/mcp';
export * from '@ai-toolkit/evals';
export * from '@ai-toolkit/observability';
export * from '@ai-toolkit/security';
export * from '@ai-toolkit/sandbox';
```

The meta-package must remain an export composition layer only.

---

# 7. Exact legacy migration map

## Migration Status

Most structural migrations are complete. The remaining work is decomposition (splitting large packages into smaller ones) and creation of new capabilities.

| Source                       | Target                          | Status                                                                                               |
| ---------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `core/ai-toolkit`            | `ai/*`                          | **Done** — but `ai/core` is still monolithic; decomposition pending                                  |
| `core/provider-utils`        | `foundation/*` + provider utils | **Done** — `foundation/provider` created; `@ai-toolkit/provider-utils` still exists as compatibility |
| `core/runtime`               | `foundation/runtime`            | **Done**                                                                                             |
| `core/gateway`               | `gateway/*`                     | **Done** — `packages/gateway/core/` → `@ai-toolkit/gateway`                                          |
| `adapters/react`             | `integrations/react`            | **Done**                                                                                             |
| `adapters/vue`               | `integrations/vue`              | **Done**                                                                                             |
| `adapters/svelte`            | `integrations/svelte`           | **Done**                                                                                             |
| `adapters/angular`           | `integrations/angular`          | **Done**                                                                                             |
| `adapters/rsc`               | `integrations/rsc`              | **Done**                                                                                             |
| `adapters/langchain`         | `integrations/langchain`        | **Done**                                                                                             |
| `adapters/llamaindex`        | `integrations/llamaindex`       | **Done**                                                                                             |
| `infrastructure/test-server` | `testing/test-server`           | **Done**                                                                                             |
| `special/codemod`            | `tooling/codemod`               | **Done**                                                                                             |
| `special/devtools`           | `tooling/devtools`              | **Done**                                                                                             |

## Core

```text
core/ai-toolkit
  → ai/* (done — see note above: ai/core is monolithic, decomposition pending)

core/provider-utils
  → foundation/* + provider utilities (done — @ai-toolkit/provider-utils remains as compatibility)

core/runtime
  → foundation/runtime (done)

core/gateway
  → gateway/* (done)
```

## Adapters

```text
adapters/react
  → integrations/react

adapters/vue
  → integrations/vue

adapters/svelte
  → integrations/svelte

adapters/angular
  → integrations/angular

adapters/rsc
  → integrations/rsc

adapters/langchain
  → integrations/langchain

adapters/llamaindex
  → integrations/llamaindex
```

## MCP

```text
mcp/*
  → mcp/*
```

This is primarily an internal decomposition, preserving the external package identity initially.

## UI

```text
ui/design
  → ui/design

ui/elements
  → ui/elements

ui/shadcn-ui
  → ui/shadcn
```

## Infrastructure

```text
infrastructure/test-server
  → testing/test-server
```

## Special

```text
special/codemod
  → tooling/codemod

special/devtools
  → tooling/devtools

special/khulnasoft
  → product/platform workspace, not shared runtime

special/platform
  → product/platform workspace, not shared runtime
```

Note: `packages/special/` directory has been removed as part of the 2026-09-16 audit (was an empty residual directory).

---

# 8. Compatibility phase policy

Every migrated package follows:

```text
old package
   ↓
compatibility re-export
   ↓
new canonical package
```

Example:

```ts
// legacy package
export * from '@ai-toolkit/ai';
```

Remove a compatibility package only when:

- zero internal imports remain
- migration guide exists
- downstream test matrix passes
- changelog contains deprecation
- release includes a major-version removal notice

---

# 9. Migration commands

## Inventory

```bash
pnpm -r list --depth -1
pnpm -r exec node -e "console.log(require('./package.json').name)"
```

Prefer a dedicated workspace inventory script for deterministic output.

## Directory moves

Use `git mv` for source-preserving moves.

```bash
git mv packages/core/runtime packages/foundation/runtime
git mv packages/core/gateway packages/gateway
git mv packages/adapters packages/integrations
```

Provider directory names that already match the canonical target can remain in place.

## Update imports

Use codemods rather than ad-hoc global replacement:

```bash
pnpm codemod packages:rename
pnpm codemod packages:imports
```

**Completed in 2026-09-16 audit**: Fixed 1199+ files across all examples importing from `ai-toolkit` → `@ai-toolkit/ai`, plus 20+ files in `packages/ui/elements` and template files in `tools/`. All `from 'ai-toolkit'` and `from 'ai-toolkit/test'` imports were updated to `from '@ai-toolkit/ai'` and `from '@ai-toolkit/ai/test'` respectively.

## Build graph

```bash
pnpm install
pnpm -r build
pnpm -r test
```

## Architecture checks

```bash
pnpm lint:architecture
pnpm check:packages
pnpm check:exports
pnpm check:cycles
```

---

# 10. Testing strategy

Every new subsystem gets four layers of tests.

```text
unit
integration
conformance
end-to-end
```

Agent-specific:

```text
lifecycle
recovery
replay
policy
tool execution
memory mutation
```

Workflow-specific:

```text
checkpoint
resume
retry
parallelism
cancellation
idempotency
```

Sandbox-specific:

```text
isolation
filesystem
network
limits
snapshot
restore
```

Evals-specific:

```text
dataset
grader
judge
regression
replay
```

---

# 11. Performance requirements

The toolkit must not turn into a monolithic runtime for simple use cases.

## Requirements

- tree-shakeable packages
- lazy optional subsystems
- provider packages loaded only when used
- no mandatory database for local generation APIs
- no mandatory telemetry
- no mandatory gateway
- no mandatory sandbox for simple SDK calls
- avoid loading Studio/UI code in server runtimes

Performance tiers:

```text
Tier 0 — direct model call
Tier 1 — model + tools
Tier 2 — agent
Tier 3 — workflow
Tier 4 — full development runtime
```

Simple applications must pay only for the tier they use.

---

# 12. Runtime matrix

Each package declares supported runtime(s):

```text
universal
browser
node
edge
deno
bun
worker
sandbox
```

Do not accidentally import Node-only APIs into universal/edge packages.

CI matrix should cover at minimum:

```text
Node
Browser bundle
Edge-like runtime
TypeScript typecheck
```

---

# 13. Security boundaries

Three trust zones:

```text
trusted-core
  foundation / contracts

controlled-runtime
  gateway / agent / workflow / memory / sandbox

untrusted-input
  prompts / tool arguments / remote MCP / retrieved content
```

Never allow untrusted input to directly select arbitrary executable capabilities.

Tool execution must pass through:

```text
identity
→ permission
→ policy
→ sandbox
→ execution
→ audit
```

---

# 14. Versioning policy

Stable packages:

```text
@ai-toolkit/ai
@ai-toolkit/provider
@ai-toolkit/gateway
@ai-toolkit/agent
@ai-toolkit/workflow
@ai-toolkit/memory
@ai-toolkit/context
@ai-toolkit/evals
```

Experimental packages may be marked:

```text
@ai-toolkit/experimental-*
```

Do not stabilize APIs before conformance coverage exists.

---

# 15. CI gates

Every PR touching packages must pass:

```text
[ ] package metadata validation
[ ] exports validation
[ ] dependency boundary validation
[ ] typecheck
[ ] unit tests
[ ] integration tests
[ ] provider conformance where applicable
[ ] bundle/build validation
[ ] runtime compatibility validation
[ ] cycle detection
```

Subsystem PRs additionally require:

```text
Agent PR       → replay + policy tests
Workflow PR    → resume + checkpoint tests
Memory PR      → lifecycle tests
Gateway PR     → routing + fallback tests
Sandbox PR     → isolation tests
Evals PR       → dataset + regression tests
Security PR    → deny-path tests
```

---

# 16. Definition of Done

The AI DevKit migration is complete when:

```text
[ ] core/ai-toolkit is decomposed
[ ] provider-utils is decomposed
[ ] gateway is independent
[ ] provider contracts are canonical
[ ] provider implementations conform to contracts
[ ] adapters become integrations
[ ] MCP is a first-class package family
[ ] Agent Runtime v1 is production-capable
[ ] Workflow v1 is durable and resumable
[ ] Context Engine v1 exists
[ ] Memory v1 exists
[ ] Evals v1 exists
[ ] deterministic replay exists
[ ] observability is native
[ ] security policy is native
[ ] sandbox execution is native
[ ] coding/repository intelligence exists
[ ] AI SDK compatibility layer exists
[ ] Studio/UI surfaces consume public APIs
[ ] dependency cycles are zero
[ ] generated dist artifacts are removed from source control
[ ] compatibility aliases are documented
[ ] complete CI matrix passes
```

---

# 17. Strategic end-state

```text
                         @ai-toolkit/ai-devkit
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
      BUILD                      RUN                     IMPROVE
        │                         │                         │
      AI Core                  Agents                   Evals
      Models                   Workflow                 Replay
      Tools                    Memory                   Regression
      MCP                      Context                  Benchmarks
      Prompts                  Gateway                  Optimization
        │                       Sandbox                  Learning
        │                       Security                   │
        └────────────────────────┬────────────────────────┘
                                 │
                           Provider Fabric
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
              Cloud           Local           Custom
              Models          Models          Providers
```

The key strategic property is that **AI SDK compatibility is only an entry point**. The canonical runtime is the broader AI Development Toolkit.
