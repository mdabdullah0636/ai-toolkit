# Domain Mapping (Canonical)

Source of truth for the AI Toolkit domain-based package structure. Names verified against each package's `package.json` (September 2026). Published names remain unchanged (ADR-004).

## Foundation — `packages/foundation/`

| Directory      | Package name                 |
| -------------- | ---------------------------- |
| `capabilities` | `@ai-toolkit/capabilities`   |
| `khulnasoft`   | `@ai-toolkit/khulnasoft`     |
| `platform`     | `@ai-toolkit/platform`       |
| `provider`     | `@ai-toolkit/provider`       |
| `runtime`      | `@ai-toolkit/runtime`        |
| `utils`        | `@ai-toolkit/provider-utils` |
| `valibot`      | `@ai-toolkit/valibot`        |

> `@ai-toolkit/provider` and `@ai-toolkit/runtime` are foundation packages (Layer 0). See `architecture/DEPENDENCY_RULES.md`.

## AI Core — `packages/ai/`

| Directory    | Package name                     |
| ------------ | -------------------------------- |
| `core`       | `ai-toolkit` (npm: `ai-toolkit`) |
| `generation` | `@ai-toolkit/ai-generation`      |
| `multimodal` | `@ai-toolkit/ai-multimodal`      |
| `reasoning`  | `@ai-toolkit/ai-reasoning`       |
| `structured` | `@ai-toolkit/ai-structured`      |

> The main SDK package. Published as `ai-toolkit` on npm.
> AI Expansion packages (generation, multimodal, reasoning, structured) provide specialized primitives for different AI modalities and reasoning capabilities. See `architecture/FUTURE_DOMAINS.md` for details.

## Gateway — `packages/gateway/`

| Directory | Package name          |
| --------- | --------------------- |
| `core`    | `@ai-toolkit/gateway` |

> `@ai-toolkit/gateway` was previously migrated from a special path to `packages/gateway/core/`. Published name unchanged. See `architecture/DEPENDENCY_RULES.md`.

## Providers — `packages/providers/`

| Directory             | Package name                      |
| --------------------- | --------------------------------- |
| `amazon-bedrock`      | `@ai-toolkit/amazon-bedrock`      |
| `anthropic`           | `@ai-toolkit/anthropic`           |
| `assemblyai`          | `@ai-toolkit/assemblyai`          |
| `azure`               | `@ai-toolkit/azure`               |
| `baseten`             | `@ai-toolkit/baseten`             |
| `black-forest-labs`   | `@ai-toolkit/black-forest-labs`   |
| `bytedance`           | `@ai-toolkit/bytedance`           |
| `cerebras`            | `@ai-toolkit/cerebras`            |
| `cohere`              | `@ai-toolkit/cohere`              |
| `deepgram`            | `@ai-toolkit/deepgram`            |
| `deepinfra`           | `@ai-toolkit/deepinfra`           |
| `deepseek`            | `@ai-toolkit/deepseek`            |
| `elevenlabs`          | `@ai-toolkit/elevenlabs`          |
| `fal`                 | `@ai-toolkit/fal`                 |
| `fireworks`           | `@ai-toolkit/fireworks`           |
| `gladia`              | `@ai-toolkit/gladia`              |
| `google`              | `@ai-toolkit/google`              |
| `google-vertex`       | `@ai-toolkit/google-vertex`       |
| `groq`                | `@ai-toolkit/groq`                |
| `huggingface`         | `@ai-toolkit/huggingface`         |
| `hume`                | `@ai-toolkit/hume`                |
| `harness`             | `@ai-toolkit/harness`             |
| `harness-acp`         | `@ai-toolkit/harness-acp`         |
| `harness-codex`       | `@ai-toolkit/harness-codex`       |
| `harness-claude-code` | `@ai-toolkit/harness-claude-code` |
| `harness-cline`       | `@ai-toolkit/harness-cline`       |
| `harness-cursor`      | `@ai-toolkit/harness-cursor`      |
| `harness-grok-build`  | `@ai-toolkit/harness-grok-build`  |
| `harness-opencode`    | `@ai-toolkit/harness-opencode`    |
| `harness-pi`          | `@ai-toolkit/harness-pi`          |
| `lmnt`                | `@ai-toolkit/lmnt`                |
| `luma`                | `@ai-toolkit/luma`                |
| `mistral`             | `@ai-toolkit/mistral`             |
| `openai`              | `@ai-toolkit/openai`              |
| `openai-compatible`   | `@ai-toolkit/openai-compatible`   |
| `perplexity`          | `@ai-toolkit/perplexity`          |
| `prodia`              | `@ai-toolkit/prodia`              |
| `replicate`           | `@ai-toolkit/replicate`           |
| `revai`               | `@ai-toolkit/revai`               |
| `togetherai`          | `@ai-toolkit/togetherai`          |
| `xai`                 | `@ai-toolkit/xai`                 |

> Harness provider family uses hub pattern: `harness-acp` is the hub consumed by 7 other harness packages.

## Integrations — `packages/integrations/`

Framework and integration adapters (depend on `ai-toolkit`):

| Directory    | Package name             |
| ------------ | ------------------------ |
| `react`      | `@ai-toolkit/react`      |
| `rsc`        | `@ai-toolkit/rsc`        |
| `angular`    | `@ai-toolkit/angular`    |
| `svelte`     | `@ai-toolkit/svelte`     |
| `vue`        | `@ai-toolkit/vue`        |
| `langchain`  | `@ai-toolkit/langchain`  |
| `llamaindex` | `@ai-toolkit/llamaindex` |

> `langchain`/`llamaindex` are framework integrations over `ai-toolkit`, not raw providers; they live in `integrations`.

## MCP — `packages/mcp/`

| Directory | Package name      |
| --------- | ----------------- |
| `core`    | `@ai-toolkit/mcp` |

> Model Context Protocol implementation. See `architecture/DEPENDENCY_RULES.md` for dependency rules.

## Tooling — `packages/tooling/`

| Directory  | Package name           |
| ---------- | ---------------------- |
| `codemod`  | `@ai-toolkit/codemod`  |
| `devtools` | `@ai-toolkit/devtools` |

## UI — `packages/ui/`

| Directory   | Package name            |
| ----------- | ----------------------- |
| `elements`  | `@ai-toolkit/elements`  |
| `design`    | `@ai-toolkit/design`    |
| `shadcn-ui` | `@ai-toolkit/shadcn-ui` |

## Testing — `packages/testing/`

| Directory     | Package name              |
| ------------- | ------------------------- |
| `test-server` | `@ai-toolkit/test-server` |

> Internal test utilities, not published.

## Context — `packages/context/`

| Directory       | Package name                        |
| --------------- | ----------------------------------- |
| `core`          | `@ai-toolkit/context`               |
| `window`        | `@ai-toolkit/context-window`        |
| `compression`   | `@ai-toolkit/context-compression`   |
| `summarization` | `@ai-toolkit/context-summarization` |
| `runtime`       | `@ai-toolkit/context-runtime`       |
| `routing`       | `@ai-toolkit/context-routing`       |

> Context Management provides context window management with compression, summarization, and intelligent routing. See `architecture/FUTURE_DOMAINS.md` for details.

## Memory — `packages/memory/`

| Directory    | Package name                    |
| ------------ | ------------------------------- |
| `core`       | `@ai-toolkit/memory`            |
| `short-term` | `@ai-toolkit/memory-short-term` |
| `long-term`  | `@ai-toolkit/memory-long-term`  |
| `semantic`   | `@ai-toolkit/memory-semantic`   |
| `episodic`   | `@ai-toolkit/memory-episodic`   |
| `storage`    | `@ai-toolkit/memory-storage`    |

> Memory System provides short-term, long-term, semantic, and episodic memory capabilities. See `architecture/FUTURE_DOMAINS.md` for details.

## Agent Platform — `packages/agents/`

| Directory    | Package name                    |
| ------------ | ------------------------------- |
| `core`       | `@ai-toolkit/agents`            |
| `loop`       | `@ai-toolkit/agents-loop`       |
| `planner`    | `@ai-toolkit/agents-planner`    |
| `teams`      | `@ai-toolkit/agents-teams`      |
| `delegation` | `@ai-toolkit/agents-delegation` |
| `skills`     | `@ai-toolkit/agents-skills`     |
| `harness`    | `@ai-toolkit/agents-harness`    |

> Agent Platform provides a complete agent framework with execution loops, planning, multi-agent teams, delegation, and skill lifecycle management. See `architecture/FUTURE_DOMAINS.md` for details.

## Tools — `packages/tools/`

| Directory     | Package name                    |
| ------------- | ------------------------------- |
| `core`        | `@ai-toolkit/tools`             |
| `registry`    | `@ai-toolkit/tools-registry`    |
| `execution`   | `@ai-toolkit/tools-execution`   |
| `approval`    | `@ai-toolkit/tools-approval`    |
| `permissions` | `@ai-toolkit/tools-permissions` |
| `discovery`   | `@ai-toolkit/tools-discovery`   |

> Tool Platform provides comprehensive tool registry, execution, human approval, permissions, and discovery capabilities. See `architecture/FUTURE_DOMAINS.md` for details.

## Workflow Engine — `packages/workflow/`

| Directory   | Package name                     |
| ----------- | -------------------------------- |
| `core`      | `@ai-toolkit/workflow`           |
| `engine`    | `@ai-toolkit/workflow-engine`    |
| `durable`   | `@ai-toolkit/workflow-durable`   |
| `scheduler` | `@ai-toolkit/workflow-scheduler` |
| `events`    | `@ai-toolkit/workflow-events`    |
| `queue`     | `@ai-toolkit/workflow-queue`     |

> Workflow Engine provides declarative workflow definitions, durable execution, scheduling, event-driven processing, and queue management. See `architecture/FUTURE_DOMAINS.md` for details.

## Sandbox Runtime — `packages/sandbox/`

| Directory    | Package name                     |
| ------------ | -------------------------------- |
| `core`       | `@ai-toolkit/sandbox`            |
| `execution`  | `@ai-toolkit/sandbox-execution`  |
| `filesystem` | `@ai-toolkit/sandbox-filesystem` |
| `network`    | `@ai-toolkit/sandbox-network`    |
| `isolation`  | `@ai-toolkit/sandbox-isolation`  |

> Sandbox Runtime provides secure code execution with filesystem, network, and process isolation. See `architecture/FUTURE_DOMAINS.md` for details.

## Retrieval Layer — `packages/retrieval/`

| Directory    | Package name                       |
| ------------ | ---------------------------------- |
| `core`       | `@ai-toolkit/retrieval`            |
| `embeddings` | `@ai-toolkit/retrieval-embeddings` |
| `vector`     | `@ai-toolkit/retrieval-vector`     |
| `reranking`  | `@ai-toolkit/retrieval-reranking`  |
| `indexing`   | `@ai-toolkit/retrieval-indexing`   |
| `rag`        | `@ai-toolkit/retrieval-rag`        |

> Retrieval Layer provides embeddings, vector databases, reranking, indexing, and RAG pipeline capabilities. See `architecture/FUTURE_DOMAINS.md` for details.

## Evaluation Engine — `packages/evals/`

| Directory     | Package name                    |
| ------------- | ------------------------------- |
| `core`        | `@ai-toolkit/evals`             |
| `datasets`    | `@ai-toolkit/evals-datasets`    |
| `scorers`     | `@ai-toolkit/evals-scorers`     |
| `experiments` | `@ai-toolkit/evals-experiments` |
| `benchmarks`  | `@ai-toolkit/evals-benchmarks`  |
| `regression`  | `@ai-toolkit/evals-regression`  |

> Evaluation Engine provides datasets, scorers, experiments, benchmarks, and regression testing. See `architecture/FUTURE_DOMAINS.md` for details.

## Observability — `packages/observability/`

| Directory   | Package name                          |
| ----------- | ------------------------------------- |
| `telemetry` | `@ai-toolkit/observability-telemetry` |
| `tracing`   | `@ai-toolkit/observability-tracing`   |
| `metrics`   | `@ai-toolkit/observability-metrics`   |
| `logging`   | `@ai-toolkit/observability-logging`   |
| `cost`      | `@ai-toolkit/observability-cost`      |
| `replay`    | `@ai-toolkit/observability-replay`    |

> Observability provides telemetry, tracing, metrics, logging, cost tracking, and execution replay. See `architecture/FUTURE_DOMAINS.md` for details.

## Security Layer — `packages/security/`

| Directory   | Package name                     |
| ----------- | -------------------------------- |
| `auth`      | `@ai-toolkit/security-auth`      |
| `rbac`      | `@ai-toolkit/security-rbac`      |
| `policy`    | `@ai-toolkit/security-policy`    |
| `secrets`   | `@ai-toolkit/security-secrets`   |
| `audit`     | `@ai-toolkit/security-audit`     |
| `isolation` | `@ai-toolkit/security-isolation` |

> Security Layer provides authentication, RBAC, policy engine, secrets management, audit logging, and resource isolation. See `architecture/FUTURE_DOMAINS.md` for details.

## Gateway Expansion — `packages/gateway/`

| Directory       | Package name                        |
| --------------- | ----------------------------------- |
| `core`          | `@ai-toolkit/gateway`               |
| `router`        | `@ai-toolkit/gateway-router`        |
| `load-balancer` | `@ai-toolkit/gateway-load-balancer` |

> Gateway expansion provides routing and load balancing for the gateway platform. See `architecture/FUTURE_DOMAINS.md` for details.

## UI Expansion — `packages/ui/`

| Directory   | Package name            |
| ----------- | ----------------------- |
| `elements`  | `@ai-toolkit/elements`  |
| `design`    | `@ai-toolkit/design`    |
| `shadcn-ui` | `@ai-toolkit/shadcn-ui` |
| `studio`    | `@ai-toolkit/ui-studio` |

> UI expansion provides React chat components, design tokens, and studio interface. See `architecture/FUTURE_DOMAINS.md` for details.

## Tooling Expansion — `packages/tooling/`

| Directory  | Package name                  |
| ---------- | ----------------------------- |
| `codemod`  | `@ai-toolkit/codemod`         |
| `devtools` | `@ai-toolkit/devtools`        |
| `cli`      | `@ai-toolkit/tooling-cli`     |
| `codegen`  | `@ai-toolkit/tooling-codegen` |

> Tooling expansion provides CLI, codegen, and developer tools. See `architecture/FUTURE_DOMAINS.md` for details.

## Future Domains (All Implemented)

All planned domains have been implemented. See `architecture/FUTURE_DOMAINS.md` for details.

## Not in `packages/`

- `tools/*`, `examples/*`, `apps/*` are separate workspaces; not migrated into domain groups.
- `eslint-config-khulnasoft-ai` and `@khulnasoft/ai-tsconfig` live under `tools/` and stay there.
