# Architecture Quick Reference

A one-page cheat sheet for the AI Toolkit enterprise architecture.

---

## Directory Quick Map

```
📦 packages/core/          Core SDK (generateText, streamText, generateObject)
📦 packages/providers/     LLM providers (30+ integrations)
📦 packages/adapters/      Framework support (React, Vue, Angular, Next.js)
📦 packages/mcp/           Model Context Protocol
📦 packages/special/       Gateway, internal tools
📦 packages/validation/    Schema validation (Valibot, provider)
📦 packages/infrastructure/ Testing utilities

📚 examples/               Organized reference implementations (see registry.json)
  ├── 01-foundations/     Basic patterns (ai-functions, express, hono…)
  ├── 02-framework-integration/ React, Next.js, Angular, Nuxt, Nest
  ├── 03-integrations/    Provider & observability integrations
  └── 04-tools/           Developer tools and playgrounds

📖 apps/                   Public-facing applications
  ├── docs/               Main documentation
  └── www/                Website

🛠️  tools/                 Development tools & scripts
```

---

## Finding Code

| Goal               | Command                                       |
| ------------------ | --------------------------------------------- |
| List all providers | `ls packages/providers/`                      |
| List all adapters  | `ls packages/adapters/`                       |
| Find React code    | `find packages/adapters/react -name "*.ts"`   |
| Find OpenAI code   | `find packages/providers/openai -name "*.ts"` |
| Find examples      | `find examples -type d -maxdepth 2`           |
| Find who owns X    | `grep "path/to/X" CODEOWNERS`                 |

---

## Common Commands

### Setup & Development

```bash
pnpm install                    # Install all deps
pnpm health-check              # Verify setup
pnpm dev                        # Start dev mode
pnpm build                      # Build everything
```

### Testing

```bash
pnpm test                                    # Run all tests
pnpm test --filter=@ai-toolkit/react           # Test one package
pnpm test:core                                 # Test core domain
pnpm test:providers                            # Test providers
```

### Code Quality

```bash
pnpm format                    # Format code
pnpm format:check             # Check formatting
pnpm lint                     # Lint everything
pnpm types:check              # Check types
```

### Generators

```bash
pnpm generate provider --name=my-provider
pnpm generate adapter --framework=react
pnpm generate example --level=01-foundations --name=my-example
```

---

## Ownership & Review

| Area                             | Owner                              | Review              |
| -------------------------------- | ---------------------------------- | ------------------- |
| `packages/core/`                 | @khulnasoft/ai-toolkit-core        | 2 approvals         |
| `packages/providers/{provider}/` | Provider team                      | 1 approval + 1 core |
| `packages/adapters/`             | Framework teams                    | 1 approval          |
| `examples/`                      | @khulnasoft/ai-toolkit-developers  | 1 approval          |
| `.github/`                       | @khulnasoft/devops-team            | 1 approval          |
| Root configs                     | @khulnasoft/ai-toolkit-maintainers | 1 approval          |

**See**: `CODEOWNERS` file for complete mapping

---

## API Stability

### Public APIs ✅

- Versioned (semver)
- Backwards compatible
- 6-month deprecation notice
- Production-ready

**Examples**:

```typescript
import { generateText } from 'ai-toolkit';
import { useChat } from '@ai-toolkit/react';
import { createOpenAI } from '@ai-toolkit/openai';
```

### Internal APIs ⚠️

- Not versioned
- May change anytime
- Documented but not stable
- Don't use externally

**Examples**:

```typescript
import type { … } from 'ai-toolkit/internal';
```

### Example APIs ℹ️

- Copy & adapt
- Don't depend on them
- For reference only

---

## Package Naming Convention

```
ai                              # Core SDK entry point (npm `ai`)
@ai-toolkit/{provider}              # Provider (openai, anthropic, etc.)
@ai-toolkit/{framework}             # Framework adapter (react, vue, angular)
@ai-toolkit/{gateway,khulnasoft}    # Special-purpose packages
@example/{name}                     # Examples (not published)
```

**Examples**:

- `ai` — Main SDK
- `@ai-toolkit/openai` — OpenAI provider
- `@ai-toolkit/react` — React hooks
- `@ai-toolkit/google-vertex` — Google Vertex
- `@ai-toolkit/test-server` — Internal test utilities

---

## File Structure per Package

```
{package}/
├── src/
│   ├── index.ts                 # Main export
│   ├── types.ts                 # Public types
│   ├── errors.ts                # Error classes
│   └── [feature]/               # Feature folders
│       ├── index.ts
│       ├── [feature].ts
│       └── [feature].test.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── package.json
├── tsconfig.json
├── README.md
└── CHANGELOG.md
```

---

## Contribution Workflow

### 1. Setup

```bash
git clone https://github.com/khulnasoft/ai-toolkit
cd ai-toolkit
pnpm install && pnpm health-check
```

### 2. Create Branch

```bash
git checkout -b feature/my-feature
# or: fix/issue-123, docs/improve-readme, etc.
```

### 3. Make Changes

```bash
# Edit files
code packages/adapters/react/src/use-chat.ts

# Verify
pnpm test --filter=@ai-toolkit/react
pnpm types:check
pnpm format
```

### 4. Create Changeset

```bash
pnpm changeset
# Follow prompts: select packages, change type, write summary
```

### 5. Push & Create PR

```bash
git push origin feature/my-feature
# Create PR on GitHub
# CODEOWNERS auto-assigned for review
```

### 6. Merge

```
Once approved and CI passes, auto-merge happens
```

---

## Testing by Layer

| Layer     | Location                | Command                           |
| --------- | ----------------------- | --------------------------------- |
| Core      | `packages/core/*/`      | `pnpm test:core`                  |
| Providers | `packages/providers/*/` | `pnpm test:providers`             |
| Adapters  | `packages/adapters/*/`  | `pnpm test:adapters`              |
| Examples  | `examples/*/*/`         | `pnpm test --filter="@example/*"` |

---

## Dependencies

### Core Layer Dependencies

```
ai ──▶ @ai-toolkit/provider-utils ──▶ @ai-toolkit/provider
@ai-toolkit/runtime + @ai-toolkit/capabilities (no Node builtins; see ADR-004)
```

### Provider Layer Dependencies

```
LLM API client → Provider → Core
```

### Adapter Layer Dependencies

```
Framework library → Adapter → Core + Providers
```

### Example Dependencies

```
Everything → Examples (test only)
```

---

## Adding New Content

### New Provider

```bash
pnpm generate provider --name=my-provider
# Creates: packages/providers/my-provider/
# Implement: createLanguageModel(), export functions
# Test: pnpm test --filter=@ai-toolkit/my-provider
```

### New Framework Adapter

```bash
pnpm generate adapter --framework=next
# Creates: packages/adapters/rsc/
# Add: hooks, components, etc.
# Export: useChat, useCompletion, etc.
```

### New Example

```bash
pnpm generate example --level=02-framework-integration --name=my-example
# Creates: examples/02-framework-integration/my-example/
# Implement: working example
# Add test: examples/02-framework-integration/my-example/test.ts
```

---

## Import Paths

```typescript
// Core
import { generateText } from 'ai-toolkit';

// Providers
import { createOpenAI } from '@ai-toolkit/openai';
import { createAnthropic } from '@ai-toolkit/anthropic';

// Adapters
import { useChat } from '@ai-toolkit/react';
import { useCompletion } from '@ai-toolkit/react';

// Internal (subject to change)
import type { … } from 'ai-toolkit/internal';

// Don't import from examples
// ❌ import { setupExample } from '../example-setup';
```

---

## Turbo Commands Reference

```bash
pnpm build                                    # Build all
pnpm build --filter=@ai-toolkit/react           # Build one
pnpm build --filter="@ai-toolkit/*"             # Build by pattern

pnpm dev --no-cache --concurrency 21        # Dev all
pnpm dev --filter=@ai-toolkit/react              # Dev one

pnpm test --filter=@ai-toolkit/react            # Test one
pnpm test --filter="./packages/providers/**" # Test providers

turbo graph                                   # Visualize dependency graph
```

---

## CODEOWNERS Quick Lookup

```bash
# Find owner of a directory
grep "packages/adapters/react" CODEOWNERS

# Find all files a team owns
grep "@khulnasoft/ai-react-team" CODEOWNERS

# See complete ownership
cat CODEOWNERS
```

---

## Useful Files

| File                          | Purpose                                 |
| ----------------------------- | --------------------------------------- |
| `AGENTS.md` + `architecture/` | Architecture overview + domain docs     |
| `CONTRIBUTOR_ONBOARDING.md`   | New contributor guide                   |
| `MIGRATION_PLAN.md`           | Migration implementation guide          |
| `CODEOWNERS`                  | Package ownership & review requirements |
| `ADR/`                        | Architecture decisions                  |
| `turbo.json`                  | Monorepo task configuration             |
| `pnpm-workspace.yaml`         | Workspace definition                    |
| `tsconfig.json`               | TypeScript project references           |

---

## Problem Solving

### Can't find a package?

```bash
# Search by provider
find packages/providers -name "*openai*"

# Search by framework
find packages/adapters -name "*react*"

# Search globally
find packages -name "package.json" -exec grep '"name": ".*my-package"' {} +
```

### Import path not working?

```bash
# Check tsconfig project references
cat tsconfig.json | grep -A 20 '"references"'

# Check package.json exports
cat packages/adapters/react/package.json | grep -A 5 '"exports"'

# Verify installation
ls node_modules/@ai-toolkit/ | grep react
```

### Tests failing?

```bash
# Run with details
pnpm test -- --reporter=verbose

# Check specific test
pnpm test -- use-chat.test.ts

# Update snapshots
pnpm test:update
```

### Build errors?

```bash
# Full clean rebuild
pnpm clean && pnpm install && pnpm build

# Check specific package
cd packages/adapters/react && pnpm build

# See what's wrong
pnpm build -- --verbose
```

---

## Release Process

### For Maintainers

1. **Prepare**: Ensure all changesets are merged
2. **Version**: `pnpm changeset version` (creates PRs)
3. **Release**: `pnpm ci:release` (publishes to npm)
4. **Announce**: Blog post, social media, Discord
5. **Monitor**: Watch for issues in production

### For Contributors

- Add changeset with each PR
- Include: affected packages, type (major/minor/patch), summary
- No need to bump versions manually

---

## Support & Resources

- **Questions?** GitHub Discussions
- **Found a bug?** GitHub Issues
- **Need help?** CONTRIBUTOR_ONBOARDING.md
- **Want to contribute?** See CONTRIBUTING.md
- **Architecture?** Read AGENTS.md + `architecture/` docs
- **Decisions?** Check ADR/ directory

---

**Last Updated**: September 2026
**Status**: Reference v2.0
