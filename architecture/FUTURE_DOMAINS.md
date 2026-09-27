# Future Domains Implementation Plan

**Status**: All Waves Implemented (Month 3)  
**Created**: September 23, 2026  
**Version**: 3.0

This document defines the implementation plans for the new domains required to deliver the 400% platform architecture vision. All 5 waves have been fully implemented with new packages across 22 domains.

---

## Overview

The AI Toolkit platform vision requires 14 domain expansions beyond the current foundation, AI core, providers, integrations, MCP, gateway, UI, tooling, and testing packages:

| Wave   | Domain                                     | Status         |
| ------ | ------------------------------------------ | -------------- |
| Wave 1 | AI Expansion (`packages/ai/*`)             | ✅ Implemented |
| Wave 1 | Context Management (`packages/context/*`)  | ✅ Implemented |
| Wave 1 | Memory System (`packages/memory/*`)        | ✅ Implemented |
| Wave 2 | Agent Platform (`packages/agents/*`)       | ✅ Implemented |
| Wave 2 | Tool Platform (`packages/tools/*`)         | ✅ Implemented |
| Wave 3 | Workflow Engine (`packages/workflow/*`)    | ✅ Implemented |
| Wave 3 | Sandbox Runtime (`packages/sandbox/*`)     | ✅ Implemented |
| Wave 3 | Retrieval Layer (`packages/retrieval/*`)   | ✅ Implemented |
| Wave 4 | Evaluation Engine (`packages/evals/*`)     | ✅ Implemented |
| Wave 4 | Observability (`packages/observability/*`) | ✅ Implemented |
| Wave 4 | Security Layer (`packages/security/*`)     | ✅ Implemented |
| Wave 4 | Gateway Expansion (`packages/gateway/*`)   | ✅ Implemented |
| Wave 5 | UI Expansion (`packages/ui/*`)             | ✅ Implemented |
| Wave 5 | Tooling Expansion (`packages/tooling/*`)   | ✅ Implemented |

---

## Domain 1: AI Expansion (`packages/ai/*`)

### Purpose

Expand the AI core beyond the current `ai-toolkit` package to provide specialized primitives for different AI modalities and reasoning capabilities.

### Packages

| Package                  | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `packages/ai/generation` | Text generation primitives and utilities         |
| `packages/ai/multimodal` | Vision, audio, image, and video runtime          |
| `packages/ai/reasoning`  | Reasoning engine and chain-of-thought primitives |
| `packages/ai/structured` | Structured output generation and validation      |

### Dependencies

- May depend on: Foundation, Providers, Gateway
- Must not depend on: Higher-level domains (agents, workflow, etc.)

### Implementation Timeline

**Month 3** (Wave 1)

### Success Criteria

- Text generation can be configured independently from core SDK
- Multimodal runtime supports vision, audio, image, and video
- Reasoning engine provides chain-of-thought and planning primitives
- Structured output generation has dedicated validation and type safety

---

## Domain 2: Agent Platform (`packages/agents/*`)

### Purpose

Provide a complete agent framework with execution loops, planning, multi-agent teams, delegation, and skill lifecycle management.

### Packages

| Package                      | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `packages/agents/core`       | Agent runtime and lifecycle               |
| `packages/agents/loop`       | Agent execution loop (observe-act-reason) |
| `packages/agents/planner`    | Planning engine for agent decision-making |
| `packages/agents/teams`      | Multi-agent team coordination             |
| `packages/agents/delegation` | Agent-to-agent delegation                 |
| `packages/agents/skills`     | Skill lifecycle and management            |
| `packages/agents/harness`    | Harness provider integration              |

### Dependencies

- May depend on: Foundation, AI Core, Tools, MCP, Memory, Context, Workflow
- Must not depend on: Provider internals (use AI Core abstractions)

### Implementation Timeline

**Month 5-6** (Wave 2)

### Success Criteria

- Agents can execute complex multi-step tasks
- Planning engine provides actionable plans
- Multi-agent teams can coordinate on shared goals
- Skills can be dynamically loaded and managed
- Harness integration works seamlessly

---

## Domain 3: Workflow Engine (`packages/workflow/*`)

### Purpose

Provide a native workflow engine for orchestrating complex AI operations with durable execution, scheduling, and event-driven processing.

### Packages

| Package                       | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `packages/workflow/core`      | Workflow definitions and DSL       |
| `packages/workflow/engine`    | Workflow execution engine          |
| `packages/workflow/durable`   | Durable execution with persistence |
| `packages/workflow/scheduler` | Task scheduling and cron jobs      |
| `packages/workflow/events`    | Event system and pub/sub           |
| `packages/workflow/queue`     | Queue management for async tasks   |

### Dependencies

- May depend on: Foundation, Agents, Tools, Observability, Sandbox
- Must not depend on: Provider internals

### Implementation Timeline

**Month 7-8** (Wave 3)

### Success Criteria

- Workflows can be defined declaratively
- Durable execution survives process restarts
- Scheduler supports cron and event-based triggers
- Event system enables reactive workflows
- Queue management handles backpressure

---

## Domain 4: Context Management (`packages/context/*`)

### Purpose

Provide context window management with compression, summarization, and intelligent routing to optimize token usage and relevance.

### Packages

| Package                          | Purpose                        |
| -------------------------------- | ------------------------------ |
| `packages/context/core`          | Context primitives and types   |
| `packages/context/window`        | Context window management      |
| `packages/context/compression`   | Context compression algorithms |
| `packages/context/summarization` | Context summarization          |
| `packages/context/runtime`       | Runtime context tracking       |
| `packages/context/routing`       | Context routing and selection  |

### Dependencies

- May depend on: Foundation, AI Core, Memory
- Must not depend on: Provider internals

### Implementation Timeline

**Month 4** (Wave 1)

### Success Criteria

- Context window is managed automatically
- Compression reduces token usage without losing information
- Summarization preserves key information
- Routing selects most relevant context
- Runtime context tracks execution state

---

## Domain 5: Memory System (`packages/memory/*`)

### Purpose

Provide a comprehensive memory system with short-term, long-term, semantic, and episodic memory capabilities.

### Packages

| Package                      | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `packages/memory/core`       | Memory primitives and interfaces           |
| `packages/memory/short-term` | Short-term memory (conversation)           |
| `packages/memory/long-term`  | Long-term memory (persistent)              |
| `packages/memory/semantic`   | Semantic memory (vector-based)             |
| `packages/memory/episodic`   | Episodic memory (event-based)              |
| `packages/memory/storage`    | Storage adapters (PostgreSQL, Redis, etc.) |

### Dependencies

- May depend on: Foundation, AI Core, Context
- Must not depend on: Provider internals

### Implementation Timeline

**Month 4-5** (Wave 1)

### Success Criteria

- Short-term memory tracks conversation state
- Long-term memory persists across sessions
- Semantic memory enables similarity search
- Episodic memory recalls specific events
- Storage adapters support multiple backends

---

## Domain 6: Retrieval Layer (`packages/retrieval/*`)

### Purpose

Provide a native retrieval layer with embeddings, vector databases, reranking, indexing, and RAG pipeline capabilities.

### Packages

| Package                         | Purpose                             |
| ------------------------------- | ----------------------------------- |
| `packages/retrieval/core`       | Retrieval primitives and interfaces |
| `packages/retrieval/embeddings` | Embedding generation                |
| `packages/retrieval/vector`     | Vector database abstraction         |
| `packages/retrieval/reranking`  | Result reranking                    |
| `packages/retrieval/indexing`   | Document indexing                   |
| `packages/retrieval/rag`        | RAG pipeline implementation         |

### Dependencies

- May depend on: Foundation, AI Core, Memory, Context
- Must not depend on: Provider internals

### Implementation Timeline

**Month 8-9** (Wave 3)

### Success Criteria

- Embeddings can be generated from multiple providers
- Vector database abstraction supports multiple backends
- Reranking improves result relevance
- Indexing handles large document collections
- RAG pipeline is configurable and extensible

---

## Domain 7: Tool Platform (`packages/tools/*`)

### Purpose

Provide a comprehensive tool platform with registry, execution, human approval, permissions, and discovery capabilities.

### Packages

| Package                      | Purpose                        |
| ---------------------------- | ------------------------------ |
| `packages/tools/core`        | Tool primitives and interfaces |
| `packages/tools/registry`    | Tool registry and discovery    |
| `packages/tools/execution`   | Tool execution engine          |
| `packages/tools/approval`    | Human approval workflows       |
| `packages/tools/permissions` | Tool permission system         |
| `packages/tools/discovery`   | Automatic tool discovery       |

### Dependencies

- May depend on: Foundation, AI Core, MCP, Security
- Must not depend on: Provider internals

### Implementation Timeline

**Month 6** (Wave 2)

### Success Criteria

- Tools can be registered and discovered automatically
- Execution engine handles async and streaming tools
- Human approval workflows are configurable
- Permission system enforces access control
- Discovery integrates with MCP and other protocols

---

## Domain 8: Sandbox Runtime (`packages/sandbox/*`)

### Purpose

Provide a secure sandbox runtime for code execution with filesystem, network, and process isolation.

### Packages

| Package                       | Purpose                           |
| ----------------------------- | --------------------------------- |
| `packages/sandbox/core`       | Sandbox primitives and interfaces |
| `packages/sandbox/execution`  | Code execution engine             |
| `packages/sandbox/filesystem` | Filesystem isolation              |
| `packages/sandbox/network`    | Network isolation                 |
| `packages/sandbox/isolation`  | Process isolation                 |

### Dependencies

- May depend on: Foundation, Security
- Must not depend on: Provider internals, AI Core

### Implementation Timeline

**Month 8** (Wave 3)

### Success Criteria

- Code execution is isolated from host system
- Filesystem access is controlled and virtualized
- Network access is restricted and monitored
- Process isolation prevents escape
- Resource limits are enforced

---

## Domain 9: Evaluation Engine (`packages/evals/*`)

### Purpose

Provide a first-class evaluation engine with datasets, scorers, experiments, benchmarks, and regression testing capabilities.

### Packages

| Package                      | Purpose                        |
| ---------------------------- | ------------------------------ |
| `packages/evals/core`        | Eval primitives and interfaces |
| `packages/evals/datasets`    | Dataset management             |
| `packages/evals/scorers`     | Evaluation metrics and scorers |
| `packages/evals/experiments` | Experiment tracking            |
| `packages/evals/benchmarks`  | Benchmarking framework         |
| `packages/evals/regression`  | Regression testing             |

### Dependencies

- May depend on: Foundation, AI Core, Agents, Workflow, Observability
- Must not depend on: Provider internals

### Implementation Timeline

**Month 9-10** (Wave 4)

### Success Criteria

- Datasets can be versioned and managed
- Scorers support custom metrics
- Experiments are tracked and comparable
- Benchmarks provide standardized performance metrics
- Regression testing detects performance degradation

---

## Domain 10: Observability (`packages/observability/*`)

### Purpose

Provide comprehensive observability with telemetry, tracing, metrics, logging, cost tracking, and execution replay capabilities.

### Packages

| Package                            | Purpose              |
| ---------------------------------- | -------------------- |
| `packages/observability/telemetry` | Telemetry collection |
| `packages/observability/tracing`   | Distributed tracing  |
| `packages/observability/metrics`   | Metrics aggregation  |
| `packages/observability/logging`   | Structured logging   |
| `packages/observability/cost`      | Cost tracking        |
| `packages/observability/replay`    | Execution replay     |

### Dependencies

- May depend on: Foundation only (must be dependency-free for instrumentation)
- Must not depend on: Any other domain (to avoid circular dependencies)

### Implementation Timeline

**Month 10-11** (Wave 4)

### Success Criteria

- Telemetry is collected from all domains
- Tracing spans execution across domains
- Metrics are aggregated and queryable
- Logging is structured and searchable
- Cost tracking provides detailed breakdowns
- Replay enables deterministic reproduction

---

## Domain 11: Security Layer (`packages/security/*`)

### Purpose

Provide a comprehensive security layer with authentication, RBAC, policy engine, secrets management, audit logging, and resource isolation.

### Packages

| Package                       | Purpose                   |
| ----------------------------- | ------------------------- |
| `packages/security/auth`      | Authentication            |
| `packages/security/rbac`      | Role-based access control |
| `packages/security/policy`    | Policy engine             |
| `packages/security/secrets`   | Secrets management        |
| `packages/security/audit`     | Audit logging             |
| `packages/security/isolation` | Resource isolation        |

### Dependencies

- May depend on: Foundation only (must be dependency-free for security primitives)
- Must not depend on: Any other domain (to avoid security vulnerabilities)

### Implementation Timeline

**Month 11-12** (Wave 4)

### Success Criteria

- Authentication supports multiple providers
- RBAC enforces fine-grained permissions
- Policy engine evaluates rules in real-time
- Secrets are securely stored and rotated
- Audit logging tracks all security events
- Isolation prevents cross-tenant data leakage

---

## Dependency Graph

```
Foundation (L0)
  ├─▶ AI Core (L1)
  ├─▶ Observability (L6) - dependency-free
  ├─▶ Security (L6) - dependency-free
  └─▶ All other domains

AI Core (L1)
  ├─▶ Context
  ├─▶ Memory
  ├─▶ Retrieval
  ├─▶ Tools
  └─▶ Agents

Context
  └─▶ Memory

Memory
  └─▶ Context

Retrieval
  ├─▶ Memory
  └─▶ Context

Tools
  ├─▶ Security
  └─▶ MCP

Agents
  ├─▶ Tools
  ├─▶ Memory
  ├─▶ Context
  ├─▶ Workflow
  └─▶ MCP

Workflow
  ├─▶ Agents
  ├─▶ Tools
  ├─▶ Observability
  └─▶ Sandbox

Sandbox
  └─▶ Security

Evals
  ├─▶ AI Core
  ├─▶ Agents
  ├─▶ Workflow
  └─▶ Observability
```

---

## Implementation Waves

### Wave 1: Core Intelligence (Month 3-5) ✅ IMPLEMENTED

- AI Expansion (`packages/ai/generation`, `packages/ai/multimodal`, `packages/ai/reasoning`, `packages/ai/structured`)
- Context Management (`packages/context/core`, `packages/context/window`, `packages/context/compression`, `packages/context/summarization`, `packages/context/runtime`, `packages/context/routing`)
- Memory System (`packages/memory/core`, `packages/memory/short-term`, `packages/memory/long-term`, `packages/memory/semantic`, `packages/memory/episodic`, `packages/memory/storage`)

### Wave 2: Agent Platform (Month 5-7) ✅ IMPLEMENTED

- Agent Platform (`packages/agents/core`, `packages/agents/loop`, `packages/agents/planner`, `packages/agents/teams`, `packages/agents/delegation`, `packages/agents/skills`, `packages/agents/harness`)
- Tool Platform (`packages/tools/core`, `packages/tools/registry`, `packages/tools/execution`, `packages/tools/approval`, `packages/tools/permissions`, `packages/tools/discovery`)

### Wave 3: Orchestration & Execution (Month 7-9) ✅ IMPLEMENTED

- Workflow Engine (`packages/workflow/core`, `packages/workflow/engine`, `packages/workflow/durable`, `packages/workflow/scheduler`, `packages/workflow/events`, `packages/workflow/queue`)
- Sandbox Runtime (`packages/sandbox/core`, `packages/sandbox/execution`, `packages/sandbox/filesystem`, `packages/sandbox/network`, `packages/sandbox/isolation`)
- Retrieval Layer (`packages/retrieval/core`, `packages/retrieval/embeddings`, `packages/retrieval/vector`, `packages/retrieval/reranking`, `packages/retrieval/indexing`, `packages/retrieval/rag`)

### Wave 4: Operations & Security (Month 9-12) ✅ IMPLEMENTED

- Evaluation Engine (`packages/evals/core`, `packages/evals/datasets`, `packages/evals/scorers`, `packages/evals/experiments`, `packages/evals/benchmarks`, `packages/evals/regression`)
- Observability (`packages/observability/telemetry`, `packages/observability/tracing`, `packages/observability/metrics`, `packages/observability/logging`, `packages/observability/cost`, `packages/observability/replay`)
- Security Layer (`packages/security/auth`, `packages/security/rbac`, `packages/security/policy`, `packages/security/secrets`, `packages/security/audit`, `packages/security/isolation`)

### Wave 5: Experience Layer (Month 12-14)

- UI Expansion (Studio)
- Tooling Expansion (CLI, Codegen)

---

## Resource Requirements

### Team Structure

Each wave requires:

- 2-3 senior engineers
- 1-2 mid-level engineers
- 1 QA engineer
- 1 technical writer

### Infrastructure

- Additional CI/CD capacity for new packages
- Monitoring and observability infrastructure
- Security audit resources
- Documentation infrastructure

---

## Risk Assessment

| Risk                     | Impact | Mitigation                                    |
| ------------------------ | ------ | --------------------------------------------- |
| Dependency complexity    | High   | Strict dependency rules, automated validation |
| Performance overhead     | Medium | Benchmarking, optimization iterations         |
| Security vulnerabilities | High   | Security audits, penetration testing          |
| Documentation lag        | Medium | Technical writer dedicated to each wave       |
| Integration complexity   | High   | Incremental integration, feature flags        |

---

## Success Metrics

- All domains implemented according to specification
- Dependency rules enforced and validated
- Test coverage > 80% for all domains
- Documentation complete for all domains
- Integration tests pass for cross-domain scenarios
- Performance benchmarks meet targets
- Security audit passes

---

**Document Owner**: Architecture Team  
**Review Required**: Yes  
**Last Updated**: September 23, 2026
