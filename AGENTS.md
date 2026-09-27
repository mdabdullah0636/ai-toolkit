# AGENTS.md

This file provides context for AI coding assistants (Cursor, GitHub Copilot, Claude Code, etc.) working with the Vercel AI TOOLKIT repository.

## Project Overview

The **AI TOOLKIT** by KhulnaSoft is a TypeScript/JavaScript SDK for building AI-powered applications with Large Language Models (LLMs). It provides a unified interface for multiple AI providers and framework integrations.

- **Repository**: https://github.com/khulnasoft/ai-toolkit
- **Documentation**: https://studio.khulnasoft.com/docs
- **License**: Apache-2.0

## Repository Structure

This is a **monorepo** using pnpm workspaces and Turborepo with domain-based package organization.

### Key Directories

| Directory                           | Description                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `packages/ai/core`                  | Main SDK package (`ai-toolkit` on npm)                                               |
| `packages/ai/generation`            | Text generation primitives (`@ai-toolkit/ai-generation`)                             |
| `packages/ai/multimodal`            | Multimodal runtime (`@ai-toolkit/ai-multimodal`)                                     |
| `packages/ai/reasoning`             | Reasoning engine (`@ai-toolkit/ai-reasoning`)                                        |
| `packages/ai/structured`            | Structured output generation (`@ai-toolkit/ai-structured`)                           |
| `packages/foundation/provider`      | Provider interface specifications (`@ai-toolkit/provider`)                           |
| `packages/foundation/utils`         | Shared utilities for providers and core (`@ai-toolkit/provider-utils`)               |
| `packages/foundation/runtime`       | Browser-safe runtime contracts (`@ai-toolkit/runtime`; no Node builtins)             |
| `packages/foundation/capabilities`  | Model capability declarations (`@ai-toolkit/capabilities`)                           |
| `packages/foundation/valibot`       | Valibot schema adapter (`@ai-toolkit/valibot`)                                       |
| `packages/foundation/khulnasoft`    | KhulnaSoft integration (`@ai-toolkit/khulnasoft`)                                    |
| `packages/foundation/platform`      | Platform registry and domain model (`@ai-toolkit/platform`)                          |
| `packages/agents/core`              | Agent runtime (`@ai-toolkit/agents`)                                                 |
| `packages/agents/loop`              | Agent execution loop (`@ai-toolkit/agents-loop`)                                     |
| `packages/agents/planner`           | Planning engine (`@ai-toolkit/agents-planner`)                                       |
| `packages/agents/teams`             | Multi-agent teams (`@ai-toolkit/agents-teams`)                                       |
| `packages/agents/delegation`        | Agent delegation (`@ai-toolkit/agents-delegation`)                                   |
| `packages/agents/skills`            | Skill lifecycle (`@ai-toolkit/agents-skills`)                                        |
| `packages/agents/harness`           | Harness provider (`@ai-toolkit/agents-harness`)                                      |
| `packages/context/core`             | Context primitives (`@ai-toolkit/context`)                                           |
| `packages/context/window`           | Context window management (`@ai-toolkit/context-window`)                             |
| `packages/context/compression`      | Context compression (`@ai-toolkit/context-compression`)                              |
| `packages/context/summarization`    | Context summarization (`@ai-toolkit/context-summarization`)                          |
| `packages/context/runtime`          | Runtime context tracking (`@ai-toolkit/context-runtime`)                             |
| `packages/context/routing`          | Context routing (`@ai-toolkit/context-routing`)                                      |
| `packages/memory/core`              | Memory primitives (`@ai-toolkit/memory`)                                             |
| `packages/memory/short-term`        | Short-term memory (`@ai-toolkit/memory-short-term`)                                  |
| `packages/memory/long-term`         | Long-term memory (`@ai-toolkit/memory-long-term`)                                    |
| `packages/memory/semantic`          | Semantic memory (`@ai-toolkit/memory-semantic`)                                      |
| `packages/memory/episodic`          | Episodic memory (`@ai-toolkit/memory-episodic`)                                      |
| `packages/memory/storage`           | Storage adapters (`@ai-toolkit/memory-storage`)                                      |
| `packages/tools/core`               | Tool primitives (`@ai-toolkit/tools`)                                                |
| `packages/tools/registry`           | Tool registry (`@ai-toolkit/tools-registry`)                                         |
| `packages/tools/execution`          | Tool execution (`@ai-toolkit/tools-execution`)                                       |
| `packages/tools/approval`           | Human approval (`@ai-toolkit/tools-approval`)                                        |
| `packages/tools/permissions`        | Permissions (`@ai-toolkit/tools-permissions`)                                        |
| `packages/tools/discovery`          | Tool discovery (`@ai-toolkit/tools-discovery`)                                       |
| `packages/workflow/core`            | Workflow definitions (`@ai-toolkit/workflow`)                                        |
| `packages/workflow/engine`          | Workflow execution engine (`@ai-toolkit/workflow-engine`)                            |
| `packages/workflow/durable`         | Durable execution (`@ai-toolkit/workflow-durable`)                                   |
| `packages/workflow/scheduler`       | Task scheduling (`@ai-toolkit/workflow-scheduler`)                                   |
| `packages/workflow/events`          | Event system (`@ai-toolkit/workflow-events`)                                         |
| `packages/workflow/queue`           | Queue management (`@ai-toolkit/workflow-queue`)                                      |
| `packages/sandbox/core`             | Sandbox primitives (`@ai-toolkit/sandbox`)                                           |
| `packages/sandbox/execution`        | Code execution engine (`@ai-toolkit/sandbox-execution`)                              |
| `packages/sandbox/filesystem`       | Filesystem isolation (`@ai-toolkit/sandbox-filesystem`)                              |
| `packages/sandbox/network`          | Network isolation (`@ai-toolkit/sandbox-network`)                                    |
| `packages/sandbox/isolation`        | Process isolation (`@ai-toolkit/sandbox-isolation`)                                  |
| `packages/retrieval/core`           | Retrieval primitives (`@ai-toolkit/retrieval`)                                       |
| `packages/retrieval/embeddings`     | Embedding generation (`@ai-toolkit/retrieval-embeddings`)                            |
| `packages/retrieval/vector`         | Vector database abstraction (`@ai-toolkit/retrieval-vector`)                         |
| `packages/retrieval/reranking`      | Result reranking (`@ai-toolkit/retrieval-reranking`)                                 |
| `packages/retrieval/indexing`       | Document indexing (`@ai-toolkit/retrieval-indexing`)                                 |
| `packages/retrieval/rag`            | RAG pipeline (`@ai-toolkit/retrieval-rag`)                                           |
| `packages/providers/<provider>`     | AI provider implementations (openai, anthropic, google, azure, amazon-bedrock, etc.) |
| `packages/integrations/<framework>` | UI framework integrations (react, vue, svelte, angular, rsc, langchain, llamaindex)  |
| `packages/gateway/core`             | Gateway and routing (`@ai-toolkit/gateway`)                                          |
| `packages/gateway/router`           | Gateway router (`@ai-toolkit/gateway-router`)                                        |
| `packages/gateway/load-balancer`    | Gateway load balancer (`@ai-toolkit/gateway-load-balancer`)                          |
| `packages/mcp/core`                 | Model Context Protocol implementation (`@ai-toolkit/mcp`)                            |
| `packages/ui/elements`              | React chat components (Conversation, Message, PromptInput)                           |
| `packages/ui/design`                | Design tokens and presets (`@ai-toolkit/design`)                                     |
| `packages/ui/shadcn-ui`             | UI primitives (`@ai-toolkit/shadcn-ui`)                                              |
| `packages/ui/studio`                | Studio UI components (`@ai-toolkit/ui-studio`)                                       |
| `packages/tooling/codemod`          | Codemod tools (`@ai-toolkit/codemod`)                                                |
| `packages/tooling/devtools`         | Developer tools (`@ai-toolkit/devtools`)                                             |
| `packages/tooling/cli`              | CLI tools (`@ai-toolkit/tooling-cli`)                                                |
| `packages/tooling/codegen`          | Code generation (`@ai-toolkit/tooling-codegen`)                                      |
| `packages/observability/logging`    | Structured logging (`@ai-toolkit/observability-logging`)                             |
| `packages/observability/cost`       | Cost tracking (`@ai-toolkit/observability-cost`)                                     |
| `packages/observability/replay`     | Execution replay (`@ai-toolkit/observability-replay`)                                |
| `packages/security/auth`            | Authentication (`@ai-toolkit/security-auth`)                                         |
| `packages/security/rbac`            | Role-based access control (`@ai-toolkit/security-rbac`)                              |
| `packages/security/policy`          | Policy engine (`@ai-toolkit/security-policy`)                                        |
| `packages/security/secrets`         | Secrets management (`@ai-toolkit/security-secrets`)                                  |
| `packages/security/audit`           | Audit logging (`@ai-toolkit/security-audit`)                                         |
| `packages/security/isolation`       | Resource isolation (`@ai-toolkit/security-isolation`)                                |
| `packages/testing/test-server`      | Internal test utilities (not published)                                              |
| `examples/`                         | Example applications in `01-foundations` … `04-tools` (indexed by `registry.json`)   |
| `content/`                          | Documentation source files (MDX), consumed by `apps/docs`                            |
| `contributing/`                     | Contributor guides and documentation                                                 |
| `tools/`                            | Internal tooling (`scripts/`, `eslint-config`, `tsconfig`, …)                        |
| `apps/`                             | Public-facing applications (docs, www, studio)                                       |

> See `architecture/domain-mapping.md` for the complete canonical package-to-domain mapping.

### Core Package Dependencies

```
ai-toolkit ─────┬──▶ @ai-toolkit/provider-utils ──▶ @ai-toolkit/provider
                    │
@ai-toolkit/<provider> ─┴──▶ @ai-toolkit/provider-utils ──▶ @ai-toolkit/provider
```

## Development Setup

### Requirements

- **Node.js**: v18, v20, or v22 (v22 recommended for development)
- **pnpm**: v10+ (`npm install -g pnpm@10`)

### Initial Setup

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages
```

## Development Commands

### Root-Level Commands

| Command                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| `pnpm install`           | Install dependencies                                              |
| `pnpm build`             | Build all packages                                                |
| `pnpm test`              | Run all tests (excludes examples)                                 |
| `pnpm lint`              | Run linting                                                       |
| `pnpm prettier-fix`      | Fix formatting issues                                             |
| `pnpm prettier-check`    | Check formatting                                                  |
| `pnpm type-check`        | TypeScript type checking                                          |
| `pnpm changeset`         | Add a changeset for your PR                                       |
| `pnpm update-references` | Update tsconfig.json references after adding package dependencies |

### Package-Level Commands

Run these from within a package directory (e.g., `packages/ai/core`):

| Command            | Description                 |
| ------------------ | --------------------------- |
| `pnpm build`       | Build the package           |
| `pnpm build:watch` | Build with watch mode       |
| `pnpm test`        | Run all tests (node + edge) |
| `pnpm test:node`   | Run Node.js tests only      |
| `pnpm test:edge`   | Run Edge runtime tests only |
| `pnpm test:watch`  | Run tests in watch mode     |

### Running Examples

```bash
cd examples/ai-functions
pnpm tsx src/stream-text/openai.ts    # Run a specific example
```

## Core APIs

| Function                   | Purpose                    | Package      |
| -------------------------- | -------------------------- | ------------ |
| `generateText`             | Generate text completion   | `ai-toolkit` |
| `streamText`               | Stream text completion     | `ai-toolkit` |
| `generateObject`           | Generate structured output | `ai-toolkit` |
| `streamObject`             | Stream structured output   | `ai-toolkit` |
| `embed` / `embedMany`      | Generate embeddings        | `ai-toolkit` |
| `generateImage`            | Generate images            | `ai-toolkit` |
| `tool`                     | Define a tool              | `ai-toolkit` |
| `jsonSchema` / `zodSchema` | Define schemas             | `ai-toolkit` |

## Import Patterns

| What                                          | Import From                                           |
| --------------------------------------------- | ----------------------------------------------------- |
| Core functions (`generateText`, `streamText`) | `ai-toolkit`                                          |
| Tool/schema utilities (`tool`, `jsonSchema`)  | `ai-toolkit`                                          |
| Provider implementations                      | `@ai-toolkit/<provider>` (e.g., `@ai-toolkit/openai`) |
| Error classes                                 | `ai-toolkit` (re-exports from `@ai-toolkit/provider`) |
| Provider type interfaces (`LanguageModelV3`)  | `@ai-toolkit/provider`                                |
| Provider implementation utilities             | `@ai-toolkit/provider-utils`                          |

## Coding Standards

### Formatting

- **Tool**: Prettier
- **Config**: Defined in root `package.json`
- **Settings**: Single quotes, trailing commas, 2-space indentation, no tabs
- **Run**: `pnpm prettier-fix` before committing

### Testing

- **Framework**: Vitest
- **Test files**: `*.test.ts` alongside source files
- **Type tests**: `*.test-d.ts` for type-level tests
- **Fixtures**: Store in `__fixtures__` subfolders
- **Snapshots**: Store in `__snapshots__` subfolders

### Zod Usage

The SDK supports both Zod 3 and Zod 4. Use correct imports:

```typescript
// For Zod 3 (compatibility code only)
import * as z3 from 'zod/v3';

// For Zod 4
import * as z4 from 'zod/v4';
// Use z4.core.$ZodType for type references
```

### JSON parsing

Never use `JSON.parse` directly in production code to prevent security risks.
Instead use `parseJSON` or `safeParseJSON` from `@ai-toolkit/provider-utils`.

### Package Export-Condition Conventions (ADR-006)

- Every public package `exports` map must declare `types`, `import`, `require`, and `default` conditions on the `.` entry.
- Declare `browser` (and `worker`/`edge` where supported) conditions as aliases of the runtime-neutral build, or omit them when the package is Node-only.
- Runtime-neutral packages (`core`, `validation`) must not reference Node-only entry points under any condition.
- Reference example: `packages/foundation/runtime/package.json`.

### Runtime-Neutral Node Import Rule (ADR-004, ADR-008)

- Packages in the `core` and `validation` domains must not import Node builtins (`node:*` or bare like `fs`, `os`) in source, and must not depend on Node builtin packages.
- Enforcement: `pnpm validate-structure` scans both `dependencies` and source `import` statements for `core`/`validation` packages.
- Lint (editor/CI feedback, same scope): root `.eslintrc.js` `overrides` rejects `node:*`/bare-builtin imports in `packages/core/**` + `packages/foundation/schema/**` shipped source (tests, scripts, fixtures, configs excluded). Lives in root config — not `tools/eslint-config` — because override globs resolve relative to the declaring file. Globals like `process` are intentionally unrestricted; use `globalThis` capability detection instead.
- `@ai-toolkit/runtime` is the canonical browser-safe contract module; `createRuntimeContext` provides capability detection rather than assuming Node globals.

### Package Governance Metadata (ADR-007)

- Every package declares `stability` (`stable` | `beta` | `alpha` | `internal`) and `owners` (team handles) in `package.json`.
- Missing metadata is a `validate-structure` warning during migration and an error at the end of the migration.

### File Naming Conventions

- Source files: `kebab-case.ts`
- Test files: `kebab-case.test.ts`
- Type test files: `kebab-case.test-d.ts`
- React/UI components: `kebab-case.tsx`

## Error Pattern

Errors extend `AITOOLKITError` from `@ai-toolkit/provider` and use a marker pattern for `instanceof` checks:

```typescript
import { AITOOLKITError } from '@ai-toolkit/provider';

const name = 'AI_MyError';
const marker = `vercel.ai.error.${name}`;
const symbol = Symbol.for(marker);

export class MyError extends AITOOLKITError {
  private readonly [symbol] = true; // used in isInstance

  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ name, message, cause });
  }

  static isInstance(error: unknown): error is MyError {
    return AITOOLKITError.hasMarker(error, marker);
  }
}
```

## Architecture

### Provider Pattern

The SDK uses a layered provider architecture following the adapter pattern:

1. **Specifications** (`@ai-toolkit/provider`): Defines interfaces like `LanguageModelV3`
2. **Utilities** (`@ai-toolkit/provider-utils`): Shared code for implementing providers
3. **Providers** (`@ai-toolkit/<provider>`): Concrete implementations for each AI service
4. **Core** (`ai-toolkit`): High-level functions like `generateText`, `streamText`, `generateObject`

### Provider Development

**Provider Options Schemas** (user-facing):

- Use `.optional()` unless `null` is meaningful
- Be as restrictive as possible for future flexibility

**Response Schemas** (API responses):

- Use `.nullish()` instead of `.optional()`
- Keep minimal - only include properties you need
- Allow flexibility for provider API changes

### Adding New Packages

1. Create folder under `packages/<domain>/<name>` (e.g., `packages/providers/my-provider`;
   see `architecture/domain-mapping.md` for the domain layout; if a flat
   `packages/<name>` path ever reappears, move it first with
   `node tools/scripts/migrate-package.mjs <name> --dry-run` — published
   names must not change)
2. Add to root `tsconfig.json` references
3. Run `pnpm update-references` if adding dependencies between packages

## Contributing Guides

| Task                  | Guide                                   |
| --------------------- | --------------------------------------- |
| Add new provider      | `contributing/add-new-provider.md`      |
| Add new model         | `contributing/add-new-model.md`         |
| Testing & fixtures    | `contributing/testing.md`               |
| Provider architecture | `contributing/provider-architecture.md` |
| Building new features | `contributing/building-new-features.md` |
| Codemods              | `contributing/codemods.md`              |

## Changesets

- **Required**: Every PR modifying production code needs a changeset
- **Default**: Use `patch` (non-breaking changes)
- **Command**: `pnpm changeset` in workspace root
- **Note**: Don't select example packages - they're not published

## Do Not

- Add minor/major changesets without maintainer approval
- Change public APIs without updating documentation
- Commit without running `pnpm prettier-fix`
- Use `require()` for Zod imports
- Add new dependencies without running `pnpm update-references`
