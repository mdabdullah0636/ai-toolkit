# Domain Mapping (Canonical)

Source of truth for migrating the 48 legacy `packages/*` packages into the domain structure. Names verified against each package's `package.json` (2026-08-05). Published names remain unchanged (ADR-004).

## Core — `packages/core/`

| Legacy dir        | Package name                 |
| ----------------- | ---------------------------- |
| `ai`              | `ai-toolkit`                 |
| `gateway`         | `@ai-toolkit/gateway`        |
| `provider-utils`  | `@ai-toolkit/provider-utils` |
| `runtime`         | `@ai-toolkit/runtime`        |

> `@ai-toolkit/gateway` was migrated from `packages/special/gateway/` to `packages/core/gateway/`. Published name unchanged. See `architecture/DEPENDENCY_RULES.md`.

## Providers — `packages/providers/`

| Legacy dir          | Package name                    |
| ------------------- | ------------------------------- |
| `amazon-bedrock`    | `@ai-toolkit/amazon-bedrock`    |
| `anthropic`         | `@ai-toolkit/anthropic`         |
| `assemblyai`        | `@ai-toolkit/assemblyai`        |
| `azure`             | `@ai-toolkit/azure`             |
| `baseten`           | `@ai-toolkit/baseten`           |
| `black-forest-labs` | `@ai-toolkit/black-forest-labs` |
| `cerebras`          | `@ai-toolkit/cerebras`          |
| `cohere`            | `@ai-toolkit/cohere`            |
| `deepgram`          | `@ai-toolkit/deepgram`          |
| `deepinfra`         | `@ai-toolkit/deepinfra`         |
| `deepseek`          | `@ai-toolkit/deepseek`          |
| `elevenlabs`        | `@ai-toolkit/elevenlabs`        |
| `fal`               | `@ai-toolkit/fal`               |
| `fireworks`         | `@ai-toolkit/fireworks`         |
| `gladia`            | `@ai-toolkit/gladia`            |
| `google`            | `@ai-toolkit/google`            |
| `google-vertex`     | `@ai-toolkit/google-vertex`     |
| `groq`              | `@ai-toolkit/groq`              |
| `huggingface`       | `@ai-toolkit/huggingface`       |
| `hume`              | `@ai-toolkit/hume`              |
| `lmnt`              | `@ai-toolkit/lmnt`              |
| `luma`              | `@ai-toolkit/luma`              |
| `mistral`           | `@ai-toolkit/mistral`           |
| `openai`            | `@ai-toolkit/openai`            |
| `openai-compatible` | `@ai-toolkit/openai-compatible` |
| `perplexity`        | `@ai-toolkit/perplexity`        |
| `prodia`            | `@ai-toolkit/prodia`            |
| `replicate`         | `@ai-toolkit/replicate`         |
| `revai`             | `@ai-toolkit/revai`             |
| `togetherai`        | `@ai-toolkit/togetherai`        |
| `xai`               | `@ai-toolkit/xai`               |

## Adapters — `packages/adapters/`

Framework and integration adapters (depend on `ai`):

| Legacy dir   | Package name             |
| ------------ | ------------------------ |
| `react`      | `@ai-toolkit/react`      |
| `rsc`        | `@ai-toolkit/rsc`        |
| `angular`    | `@ai-toolkit/angular`    |
| `svelte`     | `@ai-toolkit/svelte`     |
| `vue`        | `@ai-toolkit/vue`        |
| `langchain`  | `@ai-toolkit/langchain`  |
| `llamaindex` | `@ai-toolkit/llamaindex` |

> `langchain`/`llamaindex` are framework integrations over `ai`, not raw providers; they live in `adapters`.

## MCP — `packages/mcp/`

| Legacy dir | Package name                         |
| ---------- | ------------------------------------ |
| `mcp`      | `@ai-toolkit/mcp` (already in place) |

## Special — `packages/special/`

| Legacy dir   | Package name             |
| ------------ | ------------------------ |
| `khulnasoft` | `@ai-toolkit/khulnasoft` |
| `codemod`    | `@ai-toolkit/codemod`    |
| `devtools`   | `@ai-toolkit/devtools`   |
| `platform`   | `@ai-toolkit/platform`   |

## Validation — `packages/validation/`

| Legacy dir   | Package name             |
| ------------ | ------------------------ |
| `provider`   | `@ai-toolkit/provider`   |
| `valibot`    | `@ai-toolkit/valibot`    |

> Existing: `packages/validation/capabilities` (`@ai-toolkit/capabilities`).

## Infrastructure — `packages/infrastructure/`

| Legacy dir    | Package name              |
| ------------- | ------------------------- |
| `test-server` | `@ai-toolkit/test-server` |

> `eslint-config-khulnasoft-ai` and `@khulnasoft/ai-tsconfig` live under `tools/` and stay there.

## Not in `packages/`

- `tools/*`, `examples/*`, `apps/*` are separate workspaces; not migrated into domain groups.
