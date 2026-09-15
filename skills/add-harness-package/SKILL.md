# Add Harness Package

This skill guides you through creating a new AI harness package for the AI Toolkit monorepo. Harness packages define agent harnesses that connect `HarnessAgent` to ACP (Agent Client Protocol) runtimes such as Codex, OpenCode, Claude Code, etc.

## Overview

There are two types of harness packages:

1. **Base harness package** (`@ai-toolkit/harness`) — Defines shared harness contracts and error types.
2. **ACP harness package** (`@ai-toolkit/harness-acp`) — Defines the `createACP()` factory and ACP-specific types.
3. **Harness profile packages** (`@ai-toolkit/harness-*`) — Provide concrete configurations for specific ACP runtimes (e.g., `@ai-toolkit/harness-codex`, `@ai-toolkit/harness-opencode`, `@ai-toolkit/harness-claude-code`).

Profile packages depend on `@ai-toolkit/harness-acp` and export a pre-configured harness instance via `createACP()`.

## Package Structure

A harness profile package follows this structure:

```
packages/providers/<harness-name>/
├── src/
│   ├── index.ts                           # Main exports
│   ├── <harness>.ts                      # Harness profile definition
│   ├── version.ts                        # Version export
│   └── [harness-name].test.ts            # Tests (optional)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── vitest.node.config.js
├── vitest.edge.config.js
└── turbo.json
```

## Step-by-Step Guide

### 1. Create package.json

```json
{
  "name": "@ai-toolkit/<harness-name>",
  "version": "0.0.0",
  "description": "<Human-readable description>",
  "license": "Apache-2.0",
  "sideEffects": false,
  "stability": "alpha",
  "owners": ["@khulnasoft/ai-toolkit-providers"],
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "source": "./src/index.ts",
  "files": ["dist/**/*", "CHANGELOG.md", "README.md"],
  "scripts": {
    "build": "pnpm clean && tsup --tsconfig tsconfig.build.json",
    "build:watch": "pnpm clean && tsup --watch",
    "clean": "del-cli dist *.tsbuildinfo",
    "lint": "eslint \"./**/*.ts*\"",
    "type-check": "tsc --build",
    "prettier-check": "prettier --check \"./**/*.ts*\"",
    "test": "pnpm test:node && pnpm test:edge",
    "test:update": "pnpm test:node -u",
    "test:watch": "vitest --config vitest.node.config.js",
    "test:edge": "vitest --config vitest.edge.config.js --run",
    "test:node": "vitest --config vitest.node.config.js --run"
  },
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "default": "./dist/index.mjs"
    }
  },
  "dependencies": {
    "@ai-toolkit/harness-acp": "workspace:*",
    "@ai-toolkit/provider": "workspace:*",
    "@ai-toolkit/provider-utils": "workspace:*"
  },
  "devDependencies": {
    "@ai-toolkit/test-server": "workspace:*",
    "@types/node": "20.17.24",
    "@khulnasoft/ai-tsconfig": "workspace:*",
    "tsup": "^8",
    "typescript": "5.8.3",
    "zod": "3.25.76"
  },
  "peerDependencies": {
    "zod": "^3.25.76 || ^4.1.8"
  },
  "engines": {
    "node": ">=18"
  },
  "publishConfig": {
    "access": "public"
  },
  "homepage": "https://studio.khulnasoft.com/docs",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/khulnasoft/ai-toolkit.git"
  },
  "bugs": {
    "url": "https://github.com/khulnasoft/ai-toolkit/issues"
  },
  "keywords": ["ai", "acp", "harness", "<harness-name>"]
}
```

### 2. Create the Harness Profile

The profile is a configured harness created via `createACP()` from `@ai-toolkit/harness-acp`:

```typescript
// src/<harness>.ts
import { createACP } from '@ai-toolkit/harness-acp';
import { VERSION } from './version';

/**
 * <HarshName> ACP harness profile (`opencode acp`).
 *
 * Brief description of what the harness does and how to use it.
 */
export const <harness>Harness = createACP({
  harnessId: 'acp-<harness>',
  source: { type: 'npm-simple', packageName: '<cli-package>' },
  executable: '<cli-name>',
  args: ['acp'],
  modelMapping: { type: 'session-model', path: 'modelId' },
  clientApp: { name: 'ai-toolkit/harness-<harness>', version: VERSION },
});
```

Key `createACP()` options:

- **`harnessId`**: Stable kebab-case identifier (e.g. `acp-codex`, `acp-opencode`). Must match `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`.
- **`source`**: How to acquire the ACP implementation in the sandbox:
  - `{ type: 'npm-simple', packageName: '<pkg>', packageVersion?: '<version>' }` — simplest form
  - `{ type: 'npm-locked', packageJson, pnpmLockYaml, pnpmWorkspaceYaml? }` — locked install
  - `{ type: 'install-command', command }` — custom bootstrap command
- **`executable`**: Bare command name installed by the source (no path separators).
- **`args`**: Optional CLI arguments.
- **`modelMapping`**: How `HarnessAgent` passes the model name:
  - `{ type: 'session-config-option', path: 'model' }` — config option path
  - `{ type: 'session-model', path: 'modelId' }` — session model setter
- **`clientApp`**: Client attribution string (used for User-Agent / bridge auth).
- **`forwardEnv`**: Non-credential host env names forwarded into the sandbox.
- **`credentialEnv`**: Host credential env names for credential brokering.
- **`credentialBrokering`**: Maps real host credentials to sandbox-masked request transforms.
- **`permissionModeMapping`**: Maps `HarnessPermissionMode` (`'allow-reads'`, `'allow-edits'`, `'allow-all'`) to ACP session modes/config.
- **`authentication`**: Native ACP authentication method / metadata.
- **`providerAuthentication.gateway.env`**: Declarative gateway environment values.
- **`instructionMapping`**: How to pass instructions to the ACP session.
- **`skillsDirectory`**: Native skills dir (defaults to `.agents/skills`).
- **`hostToolMcpTransport`**: MCP transport for harness-owned tools (`'stdio'` or `'http'`).

### 3. Create version.ts

```typescript
// src/version.ts
declare const __PACKAGE_VERSION__: string | undefined;
export const VERSION: string =
  typeof __PACKAGE_VERSION__ !== 'undefined'
    ? __PACKAGE_VERSION__
    : '0.0.0-test';
```

### 4. Create index.ts

```typescript
// src/index.ts
export { <harness>Harness } from './<harness>';
export { VERSION } from './version';
```

### 5. Add Tests (Optional)

```typescript
// src/[harness-name].test.ts
import { describe, expect, it } from 'vitest';
import { <harness>Harness } from './<harness>';

describe('<harness>Harness', () => {
  it('exposes a stable bootstrap identity', () => {
    expect(<harness>Harness.kind).toBe('acp');
    expect(<harness>Harness.version).toBe('v1');
    expect(<harness>Harness.getBootstrapIdentity()).toContain(
      `harness:${<harness>Harness.harnessId}`,
    );
    expect(<harness>Harness.clientAppId).toContain(
      'ai-toolkit/harness-<harness>',
    );
  });
});
```

### 6. Create tsconfig.json

```json
{
  "extends": "./node_modules/@khulnasoft/ai-tsconfig/ts-library.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "exclude": [
    "dist",
    "build",
    "node_modules",
    "tsup.config.ts"
  ],
  "references": [
    {
      "path": "../../core/provider-utils"
    },
    {
      "path": "../../infrastructure/test-server"
    },
    {
      "path": "../../validation/provider"
    },
    {
      "path": "../harness-acp"
    }
  ]
}
```

### 7. Create tsconfig.build.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": false
  },
  "references": []
}
```

### 8. Create tsup.config.ts

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    define: {
      __PACKAGE_VERSION__: JSON.stringify(
        (await import('./package.json', { with: { type: 'json' } })).default
          .version,
      ),
    },
  },
]);
```

### 9. Create vitest configs

```javascript
// vitest.node.config.js
import { defineConfig } from 'vitest/config';
import packageJson from './package.json';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
```

```javascript
// vitest.edge.config.js
import { defineConfig } from 'vitest/config';
import packageJson from './package.json';

export default defineConfig({
  test: {
    environment: 'edge-runtime',
    include: ['**/*.test.ts', '**/*.test.tsx'],
  },
  define: {
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  },
});
```

### 10. Create turbo.json

```json
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["**/dist/**"]
    }
  }
}
```

### 11. Update References

After creating the package, run:

```bash
pnpm update-references
```

This updates the `references` section in tsconfig.json files across the monorepo.

## Base Harness Package Structure

The base harness package (`packages/providers/harness/`) defines shared contracts:

```
packages/providers/harness/
├── src/
│   ├── index.ts           # Exports Harness interface, HarnessPermissionMode type, error classes
│   ├── version.ts         # Version export
│   └── harness.test.ts    # Tests
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── vitest.node.config.js
├── vitest.edge.config.js
└── turbo.json
```

### src/index.ts (Base Harness)

```typescript
import { AITOOLKITError } from '@ai-toolkit/provider';

/** Permission modes supported across harnesses. */
export type HarnessPermissionMode = 'allow-reads' | 'allow-edits' | 'allow-all';

/** Minimal harness identity shared by all harness packages. */
export interface Harness {
  readonly kind: string;
  readonly harnessId: string;
  getBootstrapIdentity(): string;
}

// Error classes follow the marker pattern from @ai-toolkit/provider
const name = 'AI_HarnessCapabilityUnsupportedError';
const marker = `vercel.ai.error.${name}`;
const symbol = Symbol.for(marker);

export class HarnessCapabilityUnsupportedError extends AITOOLKITError {
  private readonly [symbol] = true;

  constructor({ message, cause }: { message: string; cause?: unknown }) {
    super({ name, message, cause });
  }

  static isInstance(error: unknown): error is HarnessCapabilityUnsupportedError {
    return AITOOLKITError.hasMarker(error, marker);
  }
}

export { VERSION } from './version';
```

### package.json (Base Harness)

The base package only depends on `@ai-toolkit/provider`:

```json
{
  "name": "@ai-toolkit/harness",
  "dependencies": {
    "@ai-toolkit/provider": "workspace:*"
  }
}
```

## Harness Profile Package vs Base Package

| Aspect | Base Harness (`@ai-toolkit/harness`) | Harness Profile (`@ai-toolkit/harness-acp`, `@ai-toolkit/harness-codex`) |
|--------|-------------------------------------|------------------------------------------------------------------------|
| Purpose | Shared contracts and types | Concrete harness configurations |
| Dependencies | `@ai-toolkit/provider` only | `@ai-toolkit/harness-acp`, `@ai-toolkit/provider`, `@ai-toolkit/provider-utils` |
| Key exports | `Harness` interface, `HarnessPermissionMode`, error classes | Pre-configured harness instance via `createACP()` |
| `harnessId` | N/A | Required e.g. `acp-codex`, `acp-opencode` |

## Best Practices

1. **Use workspace dependencies** for internal packages (`workspace:*`)
2. **Follow naming conventions**: `@ai-toolkit/harness-<name>` for profiles, `@ai-toolkit/harness` for the base package
3. **Set `stability` to `alpha`** initially — harness packages are experimental
4. **Set `owners` to `@khulnasoft/ai-toolkit-providers`**
5. **Use `createACP()`** from `@ai-toolkit/harness-acp` for profile packages
6. **Use kebab-case `harnessId`** matching `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
7. **Use `writeFileSync` from `node:fs`** (ESM) instead of `require('fs')` in any capture scripts
8. **Add user agent suffix** using `clientApp` with proper versioning
9. **Follow the error pattern** from AGENTS.md for custom error classes
10. **Add comprehensive tests** that verify the bootstrap identity and harness properties
11. **Support both node and edge runtimes** with separate vitest configs
12. **Use `zod/v4`** imports (`import { z } from 'zod/v4'`) for schema definitions
13. **Export `VERSION`** from `./version.ts` for client attribution
14. **Update references** after adding the package (`pnpm update-references`)
15. **Add a changeset** (`pnpm changeset`) when the package is ready for release

## Checklist

- [ ] Created `package.json` with correct name, dependencies, and exports
- [ ] Created `index.ts` with harness exports
- [ ] Created `<harness>.ts` with `createACP()` configuration
- [ ] Created `version.ts` with version export
- [ ] Created tsconfig.json and tsconfig.build.json with correct references
- [ ] Created `tsup.config.ts` with `__PACKAGE_VERSION__` define
- [ ] Created vitest.node.config.js and vitest.edge.config.js
- [ ] Created `turbo.json` with build outputs
- [ ] Added tests for bootstrap identity
- [ ] Ran `pnpm update-references`
- [ ] Ran `pnpm build` for the package
- [ ] Ran `pnpm test:node` for the package
- [ ] Ran `pnpm type-check` for the package
- [ ] Added changeset (`pnpm changeset`)