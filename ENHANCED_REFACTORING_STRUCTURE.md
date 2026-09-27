# Enhanced Refactoring Structure

**Status**: Active Refactoring Plan  
**Created**: September 23, 2026  
**Version**: 2.0 (400% Platform Architecture)

---

## Executive Summary

This document provides an enhanced refactoring structure for the AI Toolkit monorepo, addressing the gap between documented architecture and actual implementation while establishing a roadmap for transforming AI Toolkit from an AI SDK alternative into a **complete AI application and agent engineering platform**.

The project has successfully migrated to a domain-based package structure, but documentation and workspace configuration need alignment to reflect the current state and the expanded 400% platform vision.

### Vision Statement

> **AI Toolkit: A complete TypeScript AI engineering platform for building, orchestrating, executing, evaluating, securing, and operating AI agents and applications across any model provider.**

Rather than positioning as "AI SDK + more APIs," AI Toolkit provides four distinct dimensions of capability:

- **Intelligence**: Models, reasoning, context, memory, retrieval
- **Execution**: Agents, workflows, tools, MCP, sandbox
- **Operations**: Evals, tracing, metrics, cost, replay
- **Platform**: Security, policy, RBAC, multi-tenancy, routing, governance

---

## 400% Platform Architecture

### Platform Layers

```
┌──────────────────────────────────────────────────────────────┐
│                     AI TOOLKIT PLATFORM                      │
│             Build • Run • Evaluate • Operate AI             │
└──────────────────────────────────────────────────────────────┘

                         EXPERIENCE
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   AI UI / Apps          Agent Studio          Developer CLI
   Chat / Voice          Playground            Codegen
   Generative UI         Debugger              Codemods
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                       AGENT PLATFORM
                              │
       ┌──────────────┬───────┼───────┬──────────────┐
       ▼              ▼       ▼       ▼              ▼
    Agents         Teams   Routing  Planning      Skills
       │              │       │       │              │
       └──────────────┴───────┼───────┴──────────────┘
                              ▼
                       ORCHESTRATION
                              │
       ┌────────────┬─────────┼─────────┬────────────┐
       ▼            ▼         ▼         ▼            ▼
   Workflow       Tasks     Events    Queues      Scheduler
       │
       ▼
                     EXECUTION RUNTIME
                              │
       ┌──────────┬───────────┼───────────┬──────────┐
       ▼          ▼           ▼           ▼          ▼
    Runtime    Sandbox     Durable     Parallel   Human
               Execution   Execution   Execution  Approval
                              │
                              ▼
                         AI CORE
                              │
       ┌──────────────┬───────┼───────┬──────────────┐
       ▼              ▼       ▼       ▼              ▼
     Text          Vision   Audio    Image          Video
       │              │       │       │              │
       └──────────────┴───────┼───────┴──────────────┘
                              ▼
                         INTELLIGENCE
                              │
       ┌─────────┬─────────┬──┴──┬─────────┬──────────┐
       ▼         ▼         ▼     ▼         ▼          ▼
   Reasoning  Planning  Memory Context  Retrieval  Evals
                              │
                              ▼
                        TOOL PLATFORM
                              │
       ┌─────────┬──────────┬┼──────────┬─────────┐
       ▼         ▼          ▼▼          ▼         ▼
      MCP      APIs       Tools      Functions  Connectors
                              │
                              ▼
                         DATA LAYER
                              │
       ┌────────┬────────┬────────┬────────┬─────────┐
       ▼        ▼        ▼        ▼        ▼         ▼
    Memory   Vector    Cache    Files    Registry  Knowledge
                              │
                              ▼
                      PROVIDER PLATFORM
                              │
                 50+ / 100+ model providers
                              │
                              ▼
                     OBSERVABILITY
                              │
       ┌──────────┬───────────┼───────────┬──────────┐
       ▼          ▼           ▼           ▼          ▼
    Tracing     Metrics     Logs       Cost       Replay
                              │
                              ▼
                     SECURITY / GOVERNANCE
                              │
       ┌─────────┬─────────┬──┴──┬──────────┬─────────┐
       ▼         ▼         ▼     ▼          ▼         ▼
      RBAC     Policy    Secrets Audit    Isolation  Limits
```

### Four Capability Dimensions

```
                 AI TOOLKIT
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   INTELLIGENCE   EXECUTION     OPERATIONS
       │             │             │
   Models          Agents        Evals
   Reasoning       Workflow      Tracing
   Context         Sandbox       Metrics
   Memory          Tools         Cost
   Retrieval       MCP           Replay
       │             │             │
       └─────────────┼─────────────┘
                     ▼
                  PLATFORM
                     │
          Security • Policy • RBAC
          Multi-tenancy • Registry
          Routing • Governance
```

### Capability Matrix: AI SDK 7 vs AI Toolkit Target

| Area                    | AI SDK 7                      | AI Toolkit target              |
| ----------------------- | ----------------------------- | ------------------------------ |
| Multi-provider          | ✅                            | ✅                             |
| Text generation         | ✅                            | ✅                             |
| Structured output       | ✅                            | ✅                             |
| Streaming               | ✅                            | ✅                             |
| Tool calling            | ✅                            | ✅                             |
| MCP                     | ✅                            | ✅                             |
| Agents                  | ✅                            | **Advanced**                   |
| Agent teams             | —                             | **New**                        |
| Planning engine         | —                             | **New**                        |
| Workflow engine         | ecosystem                     | **Native**                     |
| Durable execution       | ecosystem/native integrations | **Native**                     |
| Human approval          | ✅                            | **Advanced policy engine**     |
| Memory                  | provider/tool ecosystem       | **Native memory system**       |
| Context management      | runtime context               | **Context orchestration**      |
| RAG                     | ecosystem                     | **Native retrieval layer**     |
| Evals                   | ecosystem                     | **First-class eval engine**    |
| Agent simulation        | —                             | **New**                        |
| Agent replay            | telemetry                     | **Full deterministic replay**  |
| Sandbox                 | ecosystem                     | **Runtime primitive**          |
| Skills                  | ✅                            | **Skill lifecycle system**     |
| Files                   | provider capabilities         | **Unified file platform**      |
| Connectors              | ecosystem                     | **Connector framework**        |
| Voice                   | ✅                            | **Multimodal runtime**         |
| Image                   | ✅                            | **Multimodal runtime**         |
| Video                   | ✅                            | **Multimodal runtime**         |
| Observability           | ✅                            | **Full agent observability**   |
| Cost management         | usage data                    | **Budget/policy engine**       |
| Security                | application-level             | **AI security layer**          |
| RBAC                    | —                             | **Native**                     |
| Policy engine           | —                             | **Native**                     |
| Secrets                 | external                      | **Native abstraction**         |
| Multi-tenancy           | —                             | **Native**                     |
| Rate limiting           | application-level             | **Runtime service**            |
| Model routing           | Gateway                       | **Intelligent routing engine** |
| Fallback                | ✅                            | **Policy-based routing**       |
| A/B testing             | —                             | **Native**                     |
| Prompt versioning       | —                             | **Native**                     |
| Dataset management      | —                             | **Native**                     |
| Agent benchmarking      | —                             | **Native**                     |
| Agent marketplace       | —                             | **Future**                     |
| CLI                     | ecosystem                     | **First-class**                |
| Studio                  | ecosystem                     | **First-class**                |
| Code generation         | —                             | **Native**                     |
| Architecture validation | —                             | **Native**                     |

---

## Current State Analysis

### 1. Actual Package Structure (As of September 2026)

The monorepo has been reorganized into the following domains:

```
packages/
├── foundation/           # Foundation layer (L0)
│   ├── capabilities/     # @ai-toolkit/capabilities
│   ├── khulnasoft/       # @ai-toolkit/khulnasoft
│   ├── platform/         # @ai-toolkit/platform
│   ├── provider/         # @ai-toolkit/provider
│   ├── runtime/          # @ai-toolkit/runtime
│   ├── utils/            # @ai-toolkit/provider-utils
│   └── valibot/          # @ai-toolkit/valibot
│
├── ai/                   # Core SDK (L1 - Runtime)
│   └── core/             # ai-toolkit (npm: ai-toolkit)
│
├── gateway/              # Gateway layer (L3)
│   └── core/             # @ai-toolkit/gateway
│
├── providers/            # Provider implementations (L1.5)
│   ├── openai/
│   ├── anthropic/
│   ├── google/
│   ├── amazon-bedrock/
│   ├── openai-compatible/
│   ├── harness/          # Harness provider family
│   └── [35+ more providers]
│
├── mcp/                  # Protocol layer (L2)
│   └── core/             # @ai-toolkit/mcp
│
├── integrations/         # Integration layer (L5)
│   ├── react/
│   ├── vue/
│   ├── angular/
│   ├── svelte/
│   ├── rsc/
│   ├── langchain/
│   └── llamaindex/
│
├── ui/                   # Experience/Tooling layer (L6)
│   ├── elements/
│   ├── design/
│   └── shadcn-ui/
│
├── tooling/              # Experience/Tooling layer (L6)
│   ├── codemod/
│   └── devtools/
│
└── testing/              # Infrastructure
    └── test-server/
```

### 2. Target Package Architecture (400% Vision)

The complete platform architecture requires the following domain structure:

```
packages/
│
├── foundation/           # Foundation layer (L0) ✅
│   ├── capabilities/     # @ai-toolkit/capabilities
│   ├── platform/         # @ai-toolkit/platform
│   ├── provider/         # @ai-toolkit/provider
│   ├── runtime/          # @ai-toolkit/runtime
│   ├── security/         # @ai-toolkit/security (NEW)
│   ├── utils/            # @ai-toolkit/provider-utils
│   └── valibot/          # @ai-toolkit/valibot
│
├── ai/                   # AI Core (L1) ✅
│   ├── core/             # ai-toolkit (npm: ai-toolkit)
│   ├── generation/       # Text generation (NEW)
│   ├── multimodal/       # Vision/Audio/Image/Video (NEW)
│   ├── reasoning/        # Reasoning engine (NEW)
│   └── structured/       # Structured output (NEW)
│
├── agents/               # Agent Platform (NEW)
│   ├── core/             # Agent runtime
│   ├── loop/             # Agent execution loop
│   ├── planner/          # Planning engine
│   ├── teams/            # Multi-agent teams
│   ├── delegation/       # Agent delegation
│   ├── skills/           # Skill lifecycle
│   └── harness/          # Harness integration
│
├── workflow/             # Orchestration (NEW)
│   ├── core/             # Workflow definitions
│   ├── engine/           # Workflow execution engine
│   ├── durable/          # Durable execution
│   ├── scheduler/        # Task scheduling
│   ├── events/           # Event system
│   └── queue/            # Queue management
│
├── context/              # Context Management (NEW)
│   ├── core/             # Context primitives
│   ├── window/           # Context window
│   ├── compression/      # Context compression
│   ├── summarization/    # Context summarization
│   ├── runtime/          # Runtime context
│   └── routing/          # Context routing
│
├── memory/               # Memory System (NEW)
│   ├── core/             # Memory primitives
│   ├── short-term/       # Short-term memory
│   ├── long-term/        # Long-term memory
│   ├── semantic/         # Semantic memory
│   ├── episodic/         # Episodic memory
│   └── storage/          # Storage adapters
│
├── retrieval/            # Retrieval Layer (NEW)
│   ├── core/             # Retrieval primitives
│   ├── embeddings/       # Embedding generation
│   ├── vector/           # Vector database
│   ├── reranking/       # Result reranking
│   ├── indexing/         # Document indexing
│   └── rag/              # RAG pipeline
│
├── tools/                # Tool Platform (NEW)
│   ├── core/             # Tool primitives
│   ├── registry/         # Tool registry
│   ├── execution/        # Tool execution
│   ├── approval/         # Human approval
│   ├── permissions/      # Tool permissions
│   └── discovery/        # Tool discovery
│
├── mcp/                  # Protocol layer (L2) ✅
│   ├── core/             # @ai-toolkit/mcp
│   ├── client/           # MCP client (NEW)
│   ├── server/           # MCP server (NEW)
│   ├── resources/        # Resource handling (NEW)
│   ├── prompts/          # Prompt templates (NEW)
│   └── apps/             # MCP Apps (NEW)
│
├── providers/            # Provider implementations (L1.5) ✅
│   ├── openai/
│   ├── anthropic/
│   ├── google/
│   ├── amazon-bedrock/
│   ├── openai-compatible/
│   ├── harness/          # Harness provider family
│   └── [35+ more providers]
│
├── gateway/              # Gateway layer (L3) ✅
│   ├── core/             # @ai-toolkit/gateway
│   ├── routing/          # Intelligent routing (NEW)
│   ├── fallback/         # Fallback strategies (NEW)
│   ├── load-balancing/   # Load balancing (NEW)
│   ├── policies/         # Policy enforcement (NEW)
│   └── catalog/          # Provider catalog (NEW)
│
├── sandbox/              # Sandbox Runtime (NEW)
│   ├── core/             # Sandbox primitives
│   ├── execution/        # Code execution
│   ├── filesystem/       # Filesystem isolation
│   ├── network/          # Network isolation
│   └── isolation/        # Process isolation
│
├── evals/                # Evaluation Engine (NEW)
│   ├── core/             # Eval primitives
│   ├── datasets/         # Dataset management
│   ├── scorers/          # Evaluation metrics
│   ├── experiments/      # Experiment tracking
│   ├── benchmarks/       # Benchmarking
│   └── regression/       # Regression testing
│
├── observability/        # Observability (NEW)
│   ├── telemetry/        # Telemetry collection
│   ├── tracing/          # Distributed tracing
│   ├── metrics/          # Metrics aggregation
│   ├── logging/          # Structured logging
│   ├── cost/             # Cost tracking
│   └── replay/           # Execution replay
│
├── security/             # Security Layer (NEW)
│   ├── auth/             # Authentication
│   ├── rbac/             # Role-based access
│   ├── policy/           # Policy engine
│   ├── secrets/          # Secrets management
│   ├── audit/            # Audit logging
│   └── isolation/        # Resource isolation
│
├── integrations/         # Integration layer (L5) ✅
│   ├── react/
│   ├── vue/
│   ├── angular/
│   ├── svelte/
│   ├── rsc/
│   ├── langchain/
│   └── llamaindex/
│
├── ui/                   # Experience/Tooling layer (L6) ✅
│   ├── elements/
│   ├── design/
│   ├── studio/           # Agent Studio UI (NEW)
│   └── shadcn-ui/
│
└── tooling/              # Experience/Tooling layer (L6) ✅
    ├── cli/              # Developer CLI (NEW)
    ├── codemod/
    ├── devtools/
    └── codegen/          # Code generation (NEW)
```

### 3. Workspace Configuration (pnpm-workspace.yaml)

The current workspace configuration includes domains that are **not yet implemented**:

```yaml
packages:
  - 'packages/foundation/*' # ✅ Implemented
  - 'packages/ai/*' # ✅ Implemented
  - 'packages/agents/*' # ❌ Not implemented (NEW)
  - 'packages/workflow/*' # ❌ Not implemented (NEW)
  - 'packages/gateway/*' # ✅ Implemented
  - 'packages/providers/*' # ✅ Implemented
  - 'packages/mcp/*' # ✅ Implemented
  - 'packages/memory/*' # ❌ Not implemented (NEW)
  - 'packages/context/*' # ❌ Not implemented (NEW)
  - 'packages/evals/*' # ❌ Not implemented (NEW)
  - 'packages/observability/*' # ❌ Not implemented (NEW)
  - 'packages/security/*' # ❌ Not implemented (NEW)
  - 'packages/sandbox/*' # ❌ Not implemented (NEW)
  - 'packages/retrieval/*' # ❌ Not implemented (NEW)
  - 'packages/tools/*' # ❌ Not implemented (NEW)
  - 'packages/integrations/*' # ✅ Implemented
  - 'packages/ui/*' # ✅ Implemented
  - 'packages/tooling/*' # ✅ Implemented
  - 'packages/testing/*' # ✅ Implemented
```

### 4. Documentation Gaps

**Outdated references in architecture documents:**

- `architecture/domain-mapping.md` references old paths like `packages/core/ai-toolkit`, `packages/validation/provider`, etc.
- These paths have been migrated to `packages/ai/core`, `packages/foundation/provider`, etc.
- The document needs to be updated to reflect the new structure.

**Missing domains in documentation:**

- No documentation exists for the planned domains: agents, workflow, memory, context, evals, observability, security, sandbox, retrieval, tools
- These domains are referenced in workspace configuration but have no implementation guidance
- No ADRs exist for the new platform capabilities

---

## Structural Issues Identified

### Issue 1: Documentation-Implementation Mismatch

**Severity**: High  
**Impact**: Confusion for contributors, incorrect dependency rules

The architecture documents reference the old package structure, while the actual codebase has been migrated. This causes:

- Incorrect import paths in documentation
- Misleading dependency rule enforcement
- Confusion for new contributors

### Issue 2: Workspace Configuration Prematurely Includes Future Domains

**Severity**: Medium  
**Impact**: Workspace validation errors, unclear roadmap

The workspace configuration includes 10 domains that don't exist yet:

- `packages/agents/*` (NEW - Agent Platform)
- `packages/workflow/*` (NEW - Orchestration)
- `packages/memory/*` (NEW - Memory System)
- `packages/context/*` (NEW - Context Management)
- `packages/evals/*` (NEW - Evaluation Engine)
- `packages/observability/*` (NEW - Observability)
- `packages/security/*` (NEW - Security Layer)
- `packages/sandbox/*` (NEW - Sandbox Runtime)
- `packages/retrieval/*` (NEW - Retrieval Layer)
- `packages/tools/*` (NEW - Tool Platform)

These are now **strategic domains** for the 400% platform vision and should be:

- Kept in workspace configuration with clear implementation plans
- Documented with phased implementation roadmap
- Prioritized based on platform value

### Issue 3: Apps Restructuring In Progress

**Severity**: Medium  
**Impact**: Deployment complexity, dependency management

The `apps/` directory restructuring (docs/www/studio → single `@ai-toolkit/apps` package) is planned but not yet executed. The current state has:

- Three separate Next.js applications with different stacks
- Conflicting dependency versions (Next 15 vs 16, React 18 vs 19, Tailwind v3 vs v4)
- Duplicated domain logic across apps

### Issue 4: Platform Architecture Not Implemented

**Severity**: Medium  
**Impact**: Data duplication, inconsistent catalog data

The platform architecture plan (`apps/PLATFORM-ARCHITECTURE-PLAN.md`) proposes:

- Single `@ai-toolkit/platform` package for registry and domain model
- Unified API boundary for catalog data
- Elimination of app-local catalog types

This is planned but not yet implemented, leading to:

- Duplicated provider/model parsing logic across apps
- No single source of truth for catalog data
- Inconsistent data representations

### Issue 5: Missing Platform Capabilities (NEW)

**Severity**: High  
**Impact**: Inability to deliver 400% platform vision

The following platform capabilities are not yet implemented:

- Agent platform (teams, planning, delegation)
- Workflow engine (durable execution, scheduling)
- Memory system (short-term, long-term, semantic, episodic)
- Context orchestration (compression, summarization, routing)
- Retrieval layer (embeddings, vector, reranking, RAG)
- Tool platform (registry, execution, approval, permissions)
- Sandbox runtime (code execution, isolation)
- Evaluation engine (datasets, scorers, benchmarks)
- Observability (telemetry, tracing, cost tracking, replay)
- Security layer (RBAC, policy engine, secrets, audit)

### Issue 6: No Implementation Roadmap for New Domains (NEW)

**Severity**: High  
**Impact**: Unclear path to 400% vision, resource allocation challenges

There is no documented implementation plan for the 10 new domains. This leads to:

- Unclear prioritization
- No dependency analysis between domains
- No resource requirements
- No success criteria

---

## Enhanced Refactoring Plan

### Phase 0: Foundation Stabilization (Week 1-2)

**Goal**: Stabilize current foundation before expanding to new domains.

**Tasks**:

1. **Documentation Alignment**

   - Update `architecture/domain-mapping.md` with new paths
   - Update `architecture/DEPENDENCY_RULES.md` with new structure
   - Update `ARCHITECTURE_QUICK_REFERENCE.md`
   - Update `AGENTS.md` repository structure section

2. **Workspace Configuration Update**

   - Keep all 10 new domains in `pnpm-workspace.yaml` (they are strategic)
   - Add comments indicating implementation status
   - Create `architecture/FUTURE_DOMAINS.md` with implementation plans

3. **Architecture Validation Enhancement**
   - Update dependency rules for new domain structure
   - Add validation for workspace configuration
   - Create `tools/scripts/check-architecture-sync.mjs`

**Deliverables**:

- All docs reflect current structure
- Future domains documented with implementation plans
- Architecture validation passes

**Success Criteria**:

- `pnpm arch:validate` passes
- No documentation-implementation mismatches

---

### Phase 1: Documentation Alignment (Week 1-2)

**Goal**: Update all architecture documents to reflect the current package structure and 400% vision.

**Tasks**:

1. **Update `architecture/domain-mapping.md`**

   - Change all old paths to new domain-based paths
   - Add mapping for new structure
   - Verify all package names match actual `package.json` files

2. **Update `architecture/DEPENDENCY_RULES.md`**

   - Update directory references to new structure
   - Verify layer mappings are accurate
   - Update any script references

3. **Update `ARCHITECTURE_QUICK_REFERENCE.md`**

   - Update directory quick map
   - Update command examples
   - Update file structure templates

4. **Update `AGENTS.md`**

   - Update repository structure section
   - Update package directory references
   - Update import path examples

5. **Create `architecture/FUTURE_DOMAINS.md`**
   - Document all 10 new domains
   - Define purpose and scope for each
   - Create dependency graph between domains
   - Define success criteria

**Deliverables**:

- All architecture documents reflect current package structure
- No references to old paths remain
- Documentation is consistent with implementation
- Future domains have clear implementation plans

**Success Criteria**:

- `pnpm arch:validate` passes without path-related errors
- New contributors can follow documentation without confusion
- Future domains have documented implementation paths

---

### Phase 2: Apps Restructuring Execution (Month 1-2)

**Goal**: Execute the plan in `apps/RESTRUCTURE-PLAN.md` to consolidate docs/www/studio.

**Key Steps** (from existing plan):

1. **Phase 0**: Create single `apps/package.json` with unified dependencies
2. **Phase 1**: Rewire workspace configuration
3. **Phase 2**: Implement build orchestration scripts
4. **Phase 3**: Update Vercel deployment configurations
5. **Phase 4**: Migrate www/studio to Next 16/React 19/Tailwind v4
6. **Phase 5**: Cleanup and validation

**Enhancements to existing plan**:

- Add automated migration testing
- Create rollback procedures
- Document breaking changes for external consumers
- Add performance benchmarks before/after migration

**Deliverables**:

- Single `@ai-toolkit/apps` package
- Unified Next 16/React 19/Tailwind v4 stack
- Independent deployability preserved
- No breaking changes to public APIs

**Success Criteria**:

- All three sites build and run from single package
- Deployment to Vercel works for each site independently
- No regression in site performance or functionality

---

### Phase 3: Platform Architecture Implementation (Month 2-3)

**Goal**: Execute the plan in `apps/PLATFORM-ARCHITECTURE-PLAN.md` to create unified platform layer.

**Key Steps** (from existing plan):

1. **P0**: Contract and inventory

   - Freeze app-local catalog types
   - Create entity inventory
   - Reserve API host

2. **P1**: Platform package and registry

   - Implement `packages/special/platform` (already exists)
   - Add schemas and validation
   - Generate registry snapshot

3. **P2**: Query and contract hardening

   - Define typed queries
   - Add DTO mappers
   - Implement contract tests

4. **P3**: API boundary

   - Implement `/api/platform/v1` routes
   - Add OpenAPI spec
   - Implement metrics API

5. **P4**: Experience migration

   - Migrate Studio readers
   - Migrate WWW readers
   - Migrate Docs adapters

6. **P5**: Canonical content and cleanup
   - Unify content trees
   - Remove duplicated logic
   - Add CI checks

**Enhancements to existing plan**:

- Create incremental migration path with feature flags
- Add comprehensive API versioning strategy
- Implement caching strategy for API responses
- Add monitoring and alerting for platform API

**Deliverables**:

- Single `@ai-toolkit/platform` package with registry and queries
- Versioned platform API at `api.ai-toolkit.dev`
- Elimination of app-local catalog types
- Unified content source

**Success Criteria**:

- Single source of truth for all catalog data
- All three experiences use platform queries
- API is versioned and documented
- No data duplication

---

### Phase 4: New Domain Implementation (Month 3-12)

**Goal**: Implement the 10 new domains to deliver the 400% platform vision.

#### Implementation Priority

**Wave 1: Core Intelligence (Month 3-5)**

1. **packages/ai/expansion** (Month 3)

   - `packages/ai/generation` - Text generation primitives
   - `packages/ai/multimodal` - Vision/Audio/Image/Video runtime
   - `packages/ai/reasoning` - Reasoning engine
   - `packages/ai/structured` - Structured output

2. **packages/context/** (Month 4)

   - `packages/context/core` - Context primitives
   - `packages/context/window` - Context window management
   - `packages/context/compression` - Context compression
   - `packages/context/summarization` - Context summarization
   - `packages/context/runtime` - Runtime context
   - `packages/context/routing` - Context routing

3. **packages/memory/** (Month 4-5)
   - `packages/memory/core` - Memory primitives
   - `packages/memory/short-term` - Short-term memory
   - `packages/memory/long-term` - Long-term memory
   - `packages/memory/semantic` - Semantic memory
   - `packages/memory/episodic` - Episodic memory
   - `packages/memory/storage` - Storage adapters

**Wave 2: Agent Platform (Month 5-7)**

4. **packages/agents/** (Month 5-6)

   - `packages/agents/core` - Agent runtime
   - `packages/agents/loop` - Agent execution loop
   - `packages/agents/planner` - Planning engine
   - `packages/agents/teams` - Multi-agent teams
   - `packages/agents/delegation` - Agent delegation
   - `packages/agents/skills` - Skill lifecycle
   - `packages/agents/harness` - Harness integration

5. **packages/tools/** (Month 6)

   - `packages/tools/core` - Tool primitives
   - `packages/tools/registry` - Tool registry
   - `packages/tools/execution` - Tool execution
   - `packages/tools/approval` - Human approval
   - `packages/tools/permissions` - Tool permissions
   - `packages/tools/discovery` - Tool discovery

6. **packages/mcp/expansion** (Month 6-7)
   - `packages/mcp/client` - MCP client
   - `packages/mcp/server` - MCP server
   - `packages/mcp/resources` - Resource handling
   - `packages/mcp/prompts` - Prompt templates
   - `packages/mcp/apps` - MCP Apps

**Wave 3: Orchestration & Execution (Month 7-9)**

7. **packages/workflow/** (Month 7-8)

   - `packages/workflow/core` - Workflow definitions
   - `packages/workflow/engine` - Workflow execution engine
   - `packages/workflow/durable` - Durable execution
   - `packages/workflow/scheduler` - Task scheduling
   - `packages/workflow/events` - Event system
   - `packages/workflow/queue` - Queue management

8. **packages/sandbox/** (Month 8)

   - `packages/sandbox/core` - Sandbox primitives
   - `packages/sandbox/execution` - Code execution
   - `packages/sandbox/filesystem` - Filesystem isolation
   - `packages/sandbox/network` - Network isolation
   - `packages/sandbox/isolation` - Process isolation

9. **packages/retrieval/** (Month 8-9)
   - `packages/retrieval/core` - Retrieval primitives
   - `packages/retrieval/embeddings` - Embedding generation
   - `packages/retrieval/vector` - Vector database
   - `packages/retrieval/reranking` - Result reranking
   - `packages/retrieval/indexing` - Document indexing
   - `packages/retrieval/rag` - RAG pipeline

**Wave 4: Operations & Security (Month 9-12)**

10. **packages/evals/** (Month 9-10)

    - `packages/evals/core` - Eval primitives
    - `packages/evals/datasets` - Dataset management
    - `packages/evals/scorers` - Evaluation metrics
    - `packages/evals/experiments` - Experiment tracking
    - `packages/evals/benchmarks` - Benchmarking
    - `packages/evals/regression` - Regression testing

11. **packages/observability/** (Month 10-11)

    - `packages/observability/telemetry` - Telemetry collection
    - `packages/observability/tracing` - Distributed tracing
    - `packages/observability/metrics` - Metrics aggregation
    - `packages/observability/logging` - Structured logging
    - `packages/observability/cost` - Cost tracking
    - `packages/observability/replay` - Execution replay

12. **packages/security/** (Month 11-12)

    - `packages/security/auth` - Authentication
    - `packages/security/rbac` - Role-based access
    - `packages/security/policy` - Policy engine
    - `packages/security/secrets` - Secrets management
    - `packages/security/audit` - Audit logging
    - `packages/security/isolation` - Resource isolation

13. **packages/gateway/expansion** (Month 12)
    - `packages/gateway/routing` - Intelligent routing
    - `packages/gateway/fallback` - Fallback strategies
    - `packages/gateway/load-balancing` - Load balancing
    - `packages/gateway/policies` - Policy enforcement
    - `packages/gateway/catalog` - Provider catalog

**Wave 5: Experience Layer (Month 12-14)**

14. **packages/ui/expansion** (Month 12-13)

    - `packages/ui/studio` - Agent Studio UI

15. **packages/tooling/expansion** (Month 13-14)
    - `packages/tooling/cli` - Developer CLI
    - `packages/tooling/codegen` - Code generation

**Deliverables**:

- All 10 new domains implemented
- Comprehensive test coverage
- Documentation for each domain
- Integration examples

**Success Criteria**:

- All capability matrix items marked as "New" or "Native" are implemented
- Integration tests pass for all domains
- Documentation is complete
- Examples demonstrate platform capabilities

---

### Phase 5: Integration & Polish (Month 14-16)

**Goal**: Integrate all new domains, polish the platform, and prepare for GA.

**Tasks**:

1. **Cross-domain integration**

   - Integrate agents with workflow
   - Integrate memory with context
   - Integrate retrieval with agents
   - Integrate evals with all domains
   - Integrate observability across platform

2. **Platform polish**

   - Performance optimization
   - Security hardening
   - Documentation completion
   - Example applications
   - Migration guides

3. **Developer experience**

   - CLI completion
   - Studio UI polish
   - Debugging tools
   - Getting started guides

4. **Launch preparation**
   - Release notes
   - Marketing materials
   - Training content
   - Support documentation

**Deliverables**:

- Fully integrated platform
- Comprehensive documentation
- Example applications
- Launch-ready

**Success Criteria**:

- All domains work together seamlessly
- Documentation is complete
- Examples demonstrate full platform
- Platform is launch-ready

---

## Timeline Summary

| Phase   | Duration    | Focus                     | Deliverables                         |
| ------- | ----------- | ------------------------- | ------------------------------------ |
| Phase 0 | Week 1-2    | Foundation Stabilization  | Docs updated, future domains planned |
| Phase 1 | Week 1-2    | Documentation Alignment   | All docs reflect current structure   |
| Phase 2 | Month 1-2   | Apps Restructuring        | Single apps package, unified stack   |
| Phase 3 | Month 2-3   | Platform Architecture     | Unified registry and API             |
| Phase 4 | Month 3-12  | New Domain Implementation | 10 new domains across 5 waves        |
| Phase 5 | Month 14-16 | Integration & Polish      | GA-ready platform                    |

**Total Timeline**: 16 months

---

## Dependency Rules Enforcement

### Current State

The project has dependency rules defined in `architecture/DEPENDENCY_RULES.md` and enforced via:

- `tools/scripts/check-dependency-direction.mjs`
- `tools/scripts/validate-structure.mjs`
- CI check: `pnpm arch:validate`

### Enhancements Needed

1. **Update layer mappings** to reflect new package structure and 10 new domains
2. **Add validation** for workspace configuration
3. **Add automated checks** for documentation-implementation consistency
4. **Add pre-commit hooks** to prevent drift
5. **Define dependency rules for new domains** (agents, workflow, memory, context, evals, observability, security, sandbox, retrieval, tools)

### Proposed New Script

Create `tools/scripts/check-architecture-sync.mjs`:

```javascript
// Validates that:
// 1. All packages in workspace actually exist
// 2. All referenced paths in docs exist
// 3. Layer mappings are consistent
// 4. No orphaned packages (exist but not in workspace)
// 5. Future domains have implementation plans
```

### New Domain Dependency Rules

Define dependency rules for the 10 new domains:

| Domain                     | May Depend On                                                |
| -------------------------- | ------------------------------------------------------------ |
| `packages/ai/*`            | Foundation, Providers, Gateway                               |
| `packages/agents/*`        | Foundation, AI Core, Tools, MCP, Memory, Context, Workflow   |
| `packages/workflow/*`      | Foundation, Agents, Tools, Observability, Sandbox            |
| `packages/context/*`       | Foundation, AI Core, Memory                                  |
| `packages/memory/*`        | Foundation, AI Core, Context                                 |
| `packages/retrieval/*`     | Foundation, AI Core, Memory, Context                         |
| `packages/tools/*`         | Foundation, AI Core, MCP, Security                           |
| `packages/sandbox/*`       | Foundation, Security                                         |
| `packages/evals/*`         | Foundation, AI Core, Agents, Workflow, Observability         |
| `packages/observability/*` | Foundation (must be dependency-free for instrumentation)     |
| `packages/security/*`      | Foundation (must be dependency-free for security primitives) |

---

## Testing Strategy

### Architecture Validation Tests

1. **Package Structure Tests**

   - Verify all packages have required metadata
   - Verify package.json exports match directory structure
   - Verify workspace configuration is complete

2. **Dependency Direction Tests**

   - Test cross-layer dependencies
   - Test intra-layer dependencies
   - Test circular dependencies

3. **Documentation Sync Tests**
   - Verify all paths in docs exist
   - Verify all packages are documented
   - Verify layer mappings are accurate

### Integration Tests

1. **Build Tests**

   - Test building each domain independently
   - Test building entire monorepo
   - Test incremental builds

2. **Runtime Tests**
   - Test import paths from documentation
   - Test package interdependencies
   - Test runtime compatibility

---

## Rollback Strategy

### For Each Phase

**Phase 1 (Documentation)**:

- Git revert is sufficient
- No code changes

**Phase 2 (Workspace Config)**:

- Git revert workspace.yaml
- Regenerate lockfile

**Phase 3 (Apps Restructuring)**:

- Documented in existing plan
- Restore individual package.json files
- Revert workspace configuration

**Phase 4 (Platform Architecture)**:

- Feature flags for gradual rollout
- Keep old readers as fallback
- Database/registry rollback procedures

**Phase 5 (Future Domains)**:

- No rollback needed (planning only)

---

## Success Metrics

### Quantitative Metrics

- **Documentation accuracy**: 100% of paths in docs reference actual packages
- **Workspace validation**: 0 errors from `pnpm arch:validate`
- **Build time**: No regression in monorepo build time
- **Test coverage**: Architecture validation tests cover 100% of rules

### Qualitative Metrics

- **Contributor onboarding time**: Reduced by 50%
- **Confusion reports**: Zero reports about structure confusion
- **Architecture violations**: Zero CI failures from dependency rules
- **Documentation freshness**: All docs reviewed and updated within 30 days of changes

---

## Timeline

### Immediate (Week 1-2)

- Phase 1: Documentation alignment
- Phase 2: Workspace configuration cleanup

### Short-term (Month 1-2)

- Phase 3: Apps restructuring execution
- Enhanced testing strategy

### Medium-term (Month 3-4)

- Phase 4: Platform architecture implementation
- Dependency rules enhancements

### Long-term (Month 5-6)

- Phase 5: Future domain planning
- Comprehensive architecture documentation

---

## Definition of Done

The enhanced refactoring is complete when:

### Foundation (Phases 0-1)

1. ✅ All architecture documents reflect the current package structure
2. ✅ Future domains have clear implementation plans in `architecture/FUTURE_DOMAINS.md`
3. ✅ Workspace configuration includes all strategic domains with status comments
4. ✅ Dependency rules are defined for all 10 new domains
5. ✅ Architecture validation passes for current structure

### Platform Stabilization (Phases 2-3)

6. ✅ Apps are consolidated into single package with unified Next 16/React 19/Tailwind v4 stack
7. ✅ Platform architecture is implemented with unified registry and API
8. ✅ Single source of truth for catalog data across docs/www/studio
9. ✅ Platform API is versioned and documented

### 400% Platform Delivery (Phase 4)

10. ✅ All 10 new domains are implemented:
    - `packages/ai/*` expansion (generation, multimodal, reasoning, structured)
    - `packages/agents/*` (core, loop, planner, teams, delegation, skills, harness)
    - `packages/workflow/*` (core, engine, durable, scheduler, events, queue)
    - `packages/context/*` (core, window, compression, summarization, runtime, routing)
    - `packages/memory/*` (core, short-term, long-term, semantic, episodic, storage)
    - `packages/retrieval/*` (core, embeddings, vector, reranking, indexing, rag)
    - `packages/tools/*` (core, registry, execution, approval, permissions, discovery)
    - `packages/sandbox/*` (core, execution, filesystem, network, isolation)
    - `packages/evals/*` (core, datasets, scorers, experiments, benchmarks, regression)
    - `packages/observability/*` (telemetry, tracing, metrics, logging, cost, replay)
    - `packages/security/*` (auth, rbac, policy, secrets, audit, isolation)
11. ✅ All capability matrix items marked as "New" or "Native" are implemented
12. ✅ Cross-domain integration is complete (agents↔workflow, memory↔context, retrieval↔agents, etc.)

### Integration & Polish (Phase 5)

13. ✅ Platform is fully integrated and tested
14. ✅ Documentation is complete for all domains
15. ✅ Example applications demonstrate full platform capabilities
16. ✅ Developer CLI and Studio UI are functional
17. ✅ Platform is launch-ready (GA)

### Quality & Governance

18. ✅ Architecture validation tests are comprehensive
19. ✅ Rollback procedures are documented
20. ✅ Success metrics are tracked and met
21. ✅ Contributors can onboard without confusion
22. ✅ Security audit passes
23. ✅ Performance benchmarks meet targets

---

## Next Actions

1. **Review this plan** with architecture team and stakeholders
2. **Approve 400% platform vision** and capability matrix
3. **Prioritize phases** based on team capacity and business needs
4. **Create tracking tickets** for each phase and task
5. **Assign owners** to each phase\*\*
6. **Begin Phase 0** (Foundation Stabilization)
7. **Create `architecture/FUTURE_DOMAINS.md`** with detailed implementation plans for all 10 new domains

---

## Appendix: Quick Reference

### File Changes Summary

| File                                        | Action                              | Phase          |
| ------------------------------------------- | ----------------------------------- | -------------- |
| `architecture/domain-mapping.md`            | Update paths to new structure       | Phase 0        |
| `architecture/DEPENDENCY_RULES.md`          | Update paths + add new domain rules | Phase 0        |
| `ARCHITECTURE_QUICK_REFERENCE.md`           | Update directory map                | Phase 1        |
| `AGENTS.md`                                 | Update repository structure section | Phase 1        |
| `architecture/FUTURE_DOMAINS.md`            | Create new file with domain plans   | Phase 0        |
| `pnpm-workspace.yaml`                       | Add status comments for new domains | Phase 0        |
| `apps/package.json`                         | Create unified manifest             | Phase 2        |
| `apps/scripts/*.mjs`                        | Create build scripts                | Phase 2        |
| `packages/special/platform/`                | Implement registry and API          | Phase 3        |
| `packages/ai/generation/`                   | Create new package                  | Phase 4 Wave 1 |
| `packages/ai/multimodal/`                   | Create new package                  | Phase 4 Wave 1 |
| `packages/ai/reasoning/`                    | Create new package                  | Phase 4 Wave 1 |
| `packages/ai/structured/`                   | Create new package                  | Phase 4 Wave 1 |
| `packages/context/*`                        | Create 6 packages                   | Phase 4 Wave 1 |
| `packages/memory/*`                         | Create 6 packages                   | Phase 4 Wave 1 |
| `packages/agents/*`                         | Create 7 packages                   | Phase 4 Wave 2 |
| `packages/tools/*`                          | Create 6 packages                   | Phase 4 Wave 2 |
| `packages/mcp/*` expansion                  | Create 5 packages                   | Phase 4 Wave 2 |
| `packages/workflow/*`                       | Create 6 packages                   | Phase 4 Wave 3 |
| `packages/sandbox/*`                        | Create 5 packages                   | Phase 4 Wave 3 |
| `packages/retrieval/*`                      | Create 6 packages                   | Phase 4 Wave 3 |
| `packages/evals/*`                          | Create 6 packages                   | Phase 4 Wave 4 |
| `packages/observability/*`                  | Create 6 packages                   | Phase 4 Wave 4 |
| `packages/security/*`                       | Create 6 packages                   | Phase 4 Wave 4 |
| `packages/gateway/*` expansion              | Create 5 packages                   | Phase 4 Wave 4 |
| `packages/ui/studio/`                       | Create new package                  | Phase 4 Wave 5 |
| `packages/tooling/cli/`                     | Create new package                  | Phase 4 Wave 5 |
| `packages/tooling/codegen/`                 | Create new package                  | Phase 4 Wave 5 |
| `tools/scripts/check-architecture-sync.mjs` | Create new script                   | Phase 0        |

### Command Reference

```bash
# Validate architecture
pnpm arch:validate

# Check dependency direction
pnpm arch:deps

# Generate capability matrix
pnpm arch:capabilities

# Inspect architecture state
pnpm arch:inspect

# Validate structure
pnpm validate-structure

# Generate inventory
pnpm inventory

# Platform registry generation
pnpm platform-registry
```

---

## Key Takeaways

1. **400% Vision**: AI Toolkit is positioned as a complete AI engineering platform, not just an SDK alternative
2. **Four Dimensions**: Intelligence, Execution, Operations, and Platform capabilities
3. **10 New Domains**: agents, workflow, memory, context, evals, observability, security, sandbox, retrieval, tools
4. **16-Month Timeline**: Phased implementation across 5 waves
5. **Capability Leadership**: 30+ new capabilities beyond AI SDK 7

---

**Document Owner**: Architecture Team  
**Review Required**: Yes  
**Last Updated**: September 23, 2026  
**Version**: 2.0 (400% Platform Architecture)
