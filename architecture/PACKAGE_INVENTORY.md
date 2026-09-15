# Package Inventory and Classification

Phase 0 deliverable. Every package classified by architectural layer, with owner, stability, runtime support, and dependency metadata from `package.json`.

**Generated**: September 2026  
**Source**: All `package.json` files under `packages/`  
**Total**: 63 packages across 8 domains

---

## Layer Classification Schema

| Layer                  | Description                                                                                                 | Packages                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Foundation         | Types, protocols, serialization, streams, errors, validation, runtime contracts. Depends on nothing higher. | `@ai-toolkit/provider`, `@ai-toolkit/runtime`, `@ai-toolkit/capabilities` |
| Runtime            | High-level generation functions, shared utilities for providers, gateway routing. | `ai-toolkit`, `@ai-toolkit/provider-utils`, `@ai-toolkit/gateway`, `@ai-toolkit/valibot` |
| **Protocol**           | MCP and other protocol implementations. First-class citizens.                                               | `@ai-toolkit/mcp`                                                                                |
| **Gateway**            | Routing, fallback, auth, policy enforcement.                                                                | `@ai-toolkit/gateway`                                                                            |
| **Provider**           | LLM, embedding, image, speech, etc. provider implementations.                                               | 41 packages under `packages/providers/`                                                          |
| **Integration**        | Framework adapters and ecosystem bridges.                                                                   | `@ai-toolkit/react`, `rsc`, `vue`, `angular`, `svelte`, `langchain`, `llamaindex`                |
| **Experience/Tooling** | UI primitives, developer tools, codemods, diagnostics.                                                      | `@ai-toolkit/elements`, `design`, `shadcn-ui`, `@ai-toolkit/devtools`, `@ai-toolkit/codemod`     |
| **Infrastructure**     | Internal test utilities.                                                                                    | `@ai-toolkit/test-server`                                                                        |

---

## Core Domain — `packages/core/`

| Package                      | Layer      | Stability | Owners                        | Runtime  | Published | Dependencies                                                                |
| ---------------------------- | ---------- | --------- | ----------------------------- | -------- | --------- | --------------------------------------------------------------------------- |
| `ai-toolkit`                 | Runtime    | stable    | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`, `@ai-toolkit/gateway`                       |
| `@ai-toolkit/gateway`        | Runtime    | beta      | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`                                              |
| `@ai-toolkit/provider-utils` | Runtime    | stable    | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `@ai-toolkit/provider`                                                        |
| `@ai-toolkit/runtime`        | Foundation | stable    | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | none (browser-safe)                                                           |

**Notes**:

- `ai-toolkit` is the main SDK entry point (npm `ai-toolkit`, formerly `ai`). It depends on `@ai-toolkit/gateway` which now lives in `packages/core/gateway/` and is classified as Runtime layer (intra-layer, no violation).
- `@ai-toolkit/gateway` provides model routing and gateway protocol support. Moved from `packages/special/gateway/` to `packages/core/gateway/` to resolve the Runtime → Gateway dependency-direction violation.
- `@ai-toolkit/runtime` is v0.1.0 and is browser-safe (no Node builtins, per ADR-004).

---

## Validation Domain — `packages/validation/`

| Package                    | Layer    | Stability | Owners                        | Runtime  | Published | Dependencies                 |
| -------------------------- | -------- | --------- | ----------------------------- | -------- | --------- | ---------------------------- |
| `@ai-toolkit/provider`     | Foundation | stable    | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `json-schema` (external)     |
| `@ai-toolkit/capabilities` | Foundation | beta      | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `@ai-toolkit/runtime`        |
| `@ai-toolkit/valibot`      | Runtime    | stable    | `@khulnasoft/ai-toolkit-core` | node>=18 | yes       | `@ai-toolkit/provider-utils` |

**Notes**:

- `@ai-toolkit/provider` defines `LanguageModelV3` and all model type interfaces. It is the contract that all providers implement.
- `@ai-toolkit/capabilities` depends on `@ai-toolkit/runtime` (both Foundation, intra-layer). This is correct: capabilities are runtime features, not protocol types.
- `@ai-toolkit/valibot` depends on `@ai-toolkit/provider-utils` (now both Runtime layer, intra-layer). This resolves the Foundation → Runtime violation.

---

## Provider Domain — `packages/providers/` (41 packages)

### Hub providers (depend on `@ai-toolkit/openai-compatible`)

These providers share an OpenAI-compatible abstraction:

| Package                         | Layer    | Stability | Owners                             | Dependencies                                                                          |
| ------------------------------- | -------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| `@ai-toolkit/openai-compatible` | Provider | stable    | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`                                  |
| `@ai-toolkit/fireworks`         | Provider | stable    | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/openai-compatible`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |
| `@ai-toolkit/huggingface`       | Provider | stable    | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/openai-compatible`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |
| `@ai-toolkit/deepinfra`         | Provider | stable    | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/openai-compatible`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |

### Direct provider implementations (standard pattern)

These providers depend only on `@ai-toolkit/provider` + `@ai-toolkit/provider-utils`:

| Package                         | Layer    | Stability | Owners                                              |
| ------------------------------- | -------- | --------- | --------------------------------------------------- |
| `@ai-toolkit/openai`            | Provider | stable    | `@khulnasoft/ai-openai`                             |
| `@ai-toolkit/anthropic`         | Provider | stable    | `@khulnasoft/ai-anthropic`                          |
| `@ai-toolkit/google`            | Provider | stable    | `@khulnasoft/ai-google`                             |
| `@ai-toolkit/mistral`           | Provider | stable    | `@mistral-team`, `@khulnasoft/ai-toolkit-providers` |
| `@ai-toolkit/cohere`            | Provider | stable    | `@cohere-team`, `@khulnasoft/ai-toolkit-providers`  |
| `@ai-toolkit/groq`              | Provider | stable    | `@groq-team`, `@khulnasoft/ai-toolkit-providers`    |
| `@ai-toolkit/perplexity`        | Provider | stable    | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/deepseek`          | Provider | stable    | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/bytedance`         | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/xai`               | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/togetherai`        | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/fal`               | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/replicate`         | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/luma`              | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/revai`             | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/assemblyai`        | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/elevenlabs`        | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/deepgram`          | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/cerebras`          | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/baseten`           | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/black-forest-labs` | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/hume`              | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |
| `@ai-toolkit/lmnt`              | Provider | —         | `@khulnasoft/ai-toolkit-providers`                  |

### Provider variants (multi-model providers with sub-packages)

| Package                      | Layer    | Stability | Owners                  | Dependencies                                                                                                                         | Notes                                                               |
| ---------------------------- | -------- | --------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `@ai-toolkit/azure`          | Provider | stable    | `@khulnasoft/ai-azure`  | `@ai-toolkit/openai`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`                                                           | Depends on `@ai-toolkit/openai` not `@ai-toolkit/openai-compatible` |
| `@ai-toolkit/amazon-bedrock` | Provider | stable    | `@khulnasoft/ai-aws`    | `@ai-toolkit/anthropic`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`                                                        | Also provides anthropic-compatible endpoint                         |
| `@ai-toolkit/google-vertex`  | Provider | stable    | `@khulnasoft/ai-google` | `@ai-toolkit/anthropic`, `@ai-toolkit/google`, `@ai-toolkit/openai-compatible`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` | Also provides anthropic-compatible endpoint; node>=22               |

### Harness provider family

| Package                           | Layer    | Stability | Owners                             | Dependencies                                                                    | Notes                                             |
| --------------------------------- | -------- | --------- | ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| `@ai-toolkit/harness`             | Provider | alpha     | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/provider`                                                          | Base package; no provider-utils dep               |
| `@ai-toolkit/harness-acp`         | Provider | alpha     | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/provider`, `@ai-toolkit/provider-utils`                            | ACP protocol adapter; hub for 7 consumer packages |
| `@ai-toolkit/harness-grok-build`  | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` | Consumer of harness-acp                           |
| `@ai-toolkit/harness-opencode`    | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |
| `@ai-toolkit/harness-codex`       | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |
| `@ai-toolkit/harness-cursor`      | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |
| `@ai-toolkit/harness-claude-code` | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |
| `@ai-toolkit/harness-cline`       | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |
| `@ai-toolkit/harness-pi`          | Provider | —         | `@khulnasoft/ai-toolkit-providers` | `@ai-toolkit/harness-acp`                                                       | Consumer of harness-acp                           |

**Notes**:

- 8 of 9 harness packages are alpha stability and owned by `@khulnasoft/ai-toolkit-providers`.
- `@ai-toolkit/harness-acp` is a hub: 7 packages depend on it (grok-build, opencode, codex, cursor, claude-code, cline, pi).
- The harness family is actively being developed (changeset: `harness-acp-provider`, `harness-packages`).

---

## MCP Domain — `packages/mcp`

| Package           | Layer    | Stability | Owners            | Runtime  | Published | Dependencies                                         |
| ----------------- | -------- | --------- | ----------------- | -------- | --------- | ---------------------------------------------------- |
| `@ai-toolkit/mcp` | Protocol | beta      | `@ai-toolkit/mcp` | node>=18 | yes       | `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |

**Notes**:

- MCP is a first-class protocol package (not nested under integrations).
- It has a separate entry point: `./mcp-stdio`.
- Currently beta stability.

---

## Special Domain — `packages/special/`

| Package                  | Layer              | Stability | Owners                             | Runtime  | Published | Dependencies                                                                          |
| ------------------------ | ------------------ | --------- | ---------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------- |
| `@ai-toolkit/devtools`   | Experience/Tooling | stable    | `@khulnasoft/developer-tools-team` | node>=18 | yes       | `@ai-toolkit/provider` (dep), `ai-toolkit` (devDep)                                   |
| `@ai-toolkit/codemod`    | Experience/Tooling | stable    | `@khulnasoft/developer-tools-team` | node>=18 | yes       | none (devDeps only on `ai-toolkit`)                                                   |
| `@ai-toolkit/khulnasoft` | Gateway            | stable    | `@khulnasoft/ai-toolkit-core`      | node>=18 | yes       | `@ai-toolkit/openai-compatible`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |
| `@ai-toolkit/platform`   | Experience/Tooling | internal  | `@khulnasoft/ai-toolkit-core`      | node>=18 | no        | `@ai-toolkit/provider` (devDep)                                                       |

**Notes**:

- `@ai-toolkit/gateway` was moved to `packages/core/gateway/` and is now classified as Runtime layer. See Core Domain section above.
- `@ai-toolkit/devtools` is a CLI tool (`bin: devtools`) and a web app. It depends on `@ai-toolkit/provider` but not `@ai-toolkit/provider-utils` — verify this is intentional.
- `@ai-toolkit/codemod` has no runtime dependencies on ai-toolkit packages (only dev deps). It's a build-time tool.
- `@ai-toolkit/khulnasoft` depends on `@ai-toolkit/openai-compatible` (a provider) — documented exception: Gateway → Provider (khulnasoft:provider exception in check-dependency-direction.mjs).

---

## Adapters Domain — `packages/adapters/`

| Package                  | Layer       | Stability | Owners                                                  | Runtime  | Published | Dependencies                                                       |
| ------------------------ | ----------- | --------- | ------------------------------------------------------- | -------- | --------- | ------------------------------------------------------------------ |
| `@ai-toolkit/react`      | Integration | stable    | `@khulnasoft/ai-react-team`                             | node>=18 | yes       | `@ai-toolkit/provider-utils`, `ai-toolkit`                         |
| `@ai-toolkit/rsc`        | Integration | stable    | `@khulnasoft/ai-nextjs-team`                            | node>=18 | yes       | `ai-toolkit`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |
| `@ai-toolkit/vue`        | Integration | stable    | `@vue-community`, `@khulnasoft/ai-toolkit-adapters`     | node>=18 | yes       | `@ai-toolkit/provider-utils`, `ai-toolkit`                         |
| `@ai-toolkit/angular`    | Integration | stable    | `@angular-community`, `@khulnasoft/ai-toolkit-adapters` | node>=18 | yes       | `@ai-toolkit/provider-utils`, `ai-toolkit`                         |
| `@ai-toolkit/svelte`     | Integration | stable    | `@svelte-community`, `@khulnasoft/ai-toolkit-adapters`  | node>=18 | yes       | `@ai-toolkit/provider-utils`, `ai-toolkit`                         |
| `@ai-toolkit/langchain`  | Integration | stable    | `@khulnasoft/ai-toolkit-maintainers`                    | node>=18 | yes       | `ai-toolkit`                                                       |
| `@ai-toolkit/llamaindex` | Integration | stable    | `@khulnasoft/ai-toolkit-maintainers`                    | node>=18 | yes       | `ai-toolkit`                                                       |

**Notes**:

- Framework adapters (react, rsc, vue, angular, svelte) all depend on `@ai-toolkit/provider-utils` and `ai-toolkit`. They do NOT depend on `@ai-toolkit/provider` directly — correct, they depend on runtime contracts.
- `@ai-toolkit/rsc` is unusual: it depends on `@ai-toolkit/provider` and `@ai-toolkit/provider-utils` in addition to `ai-toolkit`. This may be intentional for RSC server component support. Verify.
- Ecosystem bridges (langchain, llamaindex) depend only on `ai-toolkit`. They are correctly isolated from provider internals.
- `@ai-toolkit/langchain` has optional peer deps on `@langchain/langgraph`.

---

## UI Domain — `packages/ui/`

| Package                 | Layer              | Stability | Owners                      | Runtime  | Published | Dependencies                          |
| ----------------------- | ------------------ | --------- | --------------------------- | -------- | --------- | ------------------------------------- |
| `@ai-toolkit/elements`  | Experience/Tooling | beta      | `@khulnasoft/ai-react-team` | node>=18 | yes       | `@ai-toolkit/shadcn-ui`, `ai-toolkit` |
| `@ai-toolkit/design`    | Experience/Tooling | alpha     | `@khulnasoft/ai-toolkit`    | —        | no        | none (design tokens only)             |
| `@ai-toolkit/shadcn-ui` | Experience/Tooling | beta      | `@khulnasoft/ai-react-team` | node>=18 | yes       | none (UI primitives only)             |

**Notes**:

- `@ai-toolkit/design` is not published (no `publishConfig`). It provides design tokens and Tailwind presets for the docs/studio apps.
- `@ai-toolkit/elements` is the main UI component package (shadcn-ready React components).
- `@ai-toolkit/shadcn-ui` provides unstyled primitives consumed by `@ai-toolkit/elements`.

---

## Infrastructure Domain — `packages/infrastructure/`

| Package                   | Layer          | Stability | Owners                                  | Runtime  | Published | Dependencies    |
| ------------------------- | -------------- | --------- | --------------------------------------- | -------- | --------- | --------------- |
| `@ai-toolkit/test-server` | Infrastructure | internal  | `@khulnasoft/ai-toolkit-infrastructure` | node>=18 | no        | none (internal) |

**Notes**:

- Internal-only, not published. Used for testing across all packages.
- `stability: internal` per ADR-007 convention.

---

## Cross-cutting dependency patterns

### Provider dependency types

| Pattern                                 | Packages                                                                                                                                                                                                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Standard: `provider` + `provider-utils` | openai, anthropic, google, mistral, cohere, groq, perplexity, deepseek, bytedance, xai, togetherai, fal, replicate, luma, revai, assemblyai, elevenlabs, deepgram, cerebras, baseten, black-forest-labs, huggingface (also openai-compatible), deepinfra (also openai-compatible), fireworks (also openai-compatible) |
| OpenAI-compatible hub                   | huggingface, fireworks, deepinfra depend on openai-compatible                                                                                                                                                                                                                                                         |
| Direct provider dependency              | azure depends on openai (not openai-compatible); amazon-bedrock and google-vertex depend on anthropic                                                                                                                                                                                                                 |
| Harness family                          | harness-acp hub; 7 consumers (grok-build, opencode, codex, cursor, claude-code, cline, pi)                                                                                                                                                                                                                            |

### Cross-domain dependencies (flagged)

| From                                    | To                                         | Concern                                                         |
| --------------------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `@ai-toolkit/khulnasoft` (Gateway)      | `@ai-toolkit/openai-compatible` (Provider) | Special package depends on a specific provider — documented exception |

### Runtime support matrix (high-level)

| Package                | Node | Edge | Browser                             |
| ---------------------- | ---- | ---- | ----------------------------------- |
| All providers          | yes  | yes  | no                                  |
| `ai-toolkit`           | yes  | yes  | partial (via `@ai-toolkit/runtime`) |
| `@ai-toolkit/gateway`  | yes  | yes  | no                                  |
| `@ai-toolkit/runtime`  | yes  | yes  | yes                                 |
| `@ai-toolkit/mcp`      | yes  | yes  | no                                  |
| `@ai-toolkit/react`    | yes  | no   | yes (via peer dep)                  |
| `@ai-toolkit/rsc`      | yes  | yes  | server-only                         |
| UI packages            | no   | no   | yes (React)                         |
| `@ai-toolkit/devtools` | yes  | no   | yes (web app)                       |

---

## Packages missing stability or owners (verify)

The following packages from `packages/providers/` were not individually inspected but should be verified for `stability` and `owners` metadata per ADR-007:

`bytedance`, `xai`, `togetherai`, `fal`, `replicate`, `luma`, `revai`, `assemblyai`, `elevenlabs`, `deepgram`, `cerebras`, `baseten`, `black-forest-labs`, `hume`, `lmnt`, `harness-grok-build`, `harness-opencode`, `harness-codex`, `harness-cursor`, `harness-claude-code`, `harness-cline`, `harness-pi`

---

## Next steps

- [x] Resolve cross-cutting dependency concerns (gateway moved to core; valibot reclassified as Runtime)
- [x] Assign each package a definitive layer from the schema above
- [x] Feed this inventory into the dependency-direction validation tool (Phase 1)
- [ ] Review packages missing stability/owners and update `package.json`
- [ ] Feed capability declarations into the provider conformance suite (Phase 2)
