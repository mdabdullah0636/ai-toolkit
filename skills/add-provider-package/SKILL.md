# Add Provider Package

This skill guides you through creating a new AI provider package for the AI Toolkit monorepo.

## Package Structure

Every provider package follows this structure:

```
packages/<provider-name>/
├── src/
│   ├── index.ts                           # Main exports
│   ├── <provider>-provider.ts             # Provider factory
│   ├── <provider>-provider.test.ts        # Provider tests
│   ├── version.ts                         # Version export
│   ├── chat/
│   │   ├── <provider>-chat-language-model.ts
│   │   ├── <provider>-chat-language-model.test.ts
│   │   ├── <provider>-chat-options.ts
│   │   └── __fixtures__/                  # Test fixtures
│   ├── embedding/ (optional)
│   ├── image/ (optional)
│   ├── speech/ (optional)
│   └── transcription/ (optional)
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
  "name": "@ai-toolkit/<provider-name>",
  "version": "0.0.1",
  "license": "Apache-2.0",
  "sideEffects": false,
  "stability": "beta",
  "owners": ["@khulnasoft/ai-toolkit-providers"],
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "source": "./src/index.ts",
  "files": ["dist/**/*", "src", "CHANGELOG.md", "README.md"],
  "scripts": {
    "build": "pnpm clean && tsup --tsconfig tsconfig.build.json",
    "build:watch": "pnpm clean && tsup --watch",
    "clean": "del-cli dist *.tsbuildinfo",
    "lint": "eslint \"./**/*.ts*\"",
    "type-check": "tsc --build",
    "test": "pnpm test:node && pnpm test:edge",
    "test:node": "vitest --config vitest.node.config.js --run",
    "test:edge": "vitest --config vitest.edge.config.js --run"
  },
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "dependencies": {
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
  "keywords": ["ai", "sdk", "<provider-name>"]
}
```

### 2. Create the Provider Factory

The provider factory creates instances of your provider with configuration:

```typescript
// src/<provider>-provider.ts
import {
  LanguageModelV3,
  ProviderV3,
} from '@ai-toolkit/provider';
import {
  FetchFunction,
  loadApiKey,
  loadOptionalSetting,
  withoutTrailingSlash,
  withUserAgentSuffix,
} from '@ai-toolkit/provider-utils';
import { <Provider>ChatLanguageModel } from './chat/<provider>-chat-language-model';
import { <Provider>ChatModelId } from './chat/<provider>-chat-options';
import { VERSION } from './version';

export interface <Provider>Provider extends ProviderV3 {
  (modelId: <Provider>ChatModelId): LanguageModelV3;
  languageModel(modelId: <Provider>ChatModelId): LanguageModelV3;
  chat(modelId: <Provider>ChatModelId): LanguageModelV3;
}

export interface <Provider>ProviderSettings {
  baseURL?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  fetch?: FetchFunction;
}

export function create<Provider>(
  options: <Provider>ProviderSettings = {},
): <Provider>Provider {
  const baseURL =
    withoutTrailingSlash(
      loadOptionalSetting({
        settingValue: options.baseURL,
        environmentVariableName: '<PROVIDER>_BASE_URL',
      }),
    ) ?? 'https://api.<provider>.com/v1';

  const getHeaders = () =>
    withUserAgentSuffix(
      {
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: '<PROVIDER>_API_KEY',
          description: '<Provider>',
        })}`,
        ...options.headers,
      },
      `ai-toolkit/<provider>/${VERSION}`,
    );

  const createChatModel = (modelId: <Provider>ChatModelId) =>
    new <Provider>ChatLanguageModel(modelId, {
      provider: '<provider>.chat',
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const provider = function (modelId: <Provider>ChatModelId) {
    return createChatModel(modelId);
  };

  provider.specificationVersion = 'v3' as const;
  provider.languageModel = createChatModel;
  provider.chat = createChatModel;

  return provider as <Provider>Provider;
}

export const <provider> = create<Provider>();
```

### 3. Create Model Options

Define the model IDs and provider-specific options:

```typescript
// src/chat/<provider>-chat-options.ts
import { InferSchema, lazySchema, zodSchema } from '@ai-toolkit/provider-utils';
import { z } from 'zod/v4';

export type <Provider>ChatModelId =
  | '<model-1>'
  | '<model-2>'
  | (string & {});

export const <provider>ChatLanguageModelOptions = lazySchema(() =>
  zodSchema(
    z.object({
      // Provider-specific options
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      // Add more as needed
    }),
  ),
);

export type <Provider>ChatLanguageModelOptions = InferSchema<
  typeof <provider>ChatLanguageModelOptions
>;
```

### 4. Implement the Language Model

See existing implementations like `packages/openai/src/chat/openai-chat-language-model.ts` for the full pattern. Key interfaces to implement:

- `doGenerate()` - For non-streaming completions
- `doStream()` - For streaming completions

### 5. Create tsconfig files

```json
// tsconfig.json
{
  "extends": "./node_modules/@khulnasoft/ai-tsconfig/ts-library.json",
  "compilerOptions": {
    "composite": true,
    "rootDir": "src",
    "outDir": "dist"
  },
  "exclude": ["dist", "build", "node_modules", "tsup.config.ts", "internal.d.ts"],
  "references": [
    {
      "path": "../../core/provider-utils"
    },
    {
      "path": "../../validation/provider"
    },
    {
      "path": "../../infrastructure/test-server"
    }
  ]
}
```

```json
// tsconfig.build.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": false
  },
  "references": []
}
```

### 6. Update References

After creating the package, run:

```bash
pnpm update-references
```

This updates the `references` section in tsconfig.json files across the monorepo.

### 7. Add Tests

Use the `@ai-toolkit/test-server` package to create mock API responses:

```typescript
import { createTestServer } from '@ai-toolkit/test-server/with-vitest';

const server = createTestServer({
  'https://api.<provider>.com/v1/chat/completions': {},
});

// Use server.urls to set mock responses
server.urls['https://api.<provider>.com/v1/chat/completions'].response = {
  type: 'json-value',
  body: {
    /* mock response */
  },
};
```

## Best Practices

1. **Use workspace dependencies** for internal packages (`workspace:*`)
2. **Follow naming conventions**: `@ai-toolkit/<provider-name>`
3. **Implement provider metadata** for provider-specific response data
4. **Add comprehensive tests** with fixtures for API responses
5. **Support both node and edge runtimes** with separate vitest configs
6. **Use `loadApiKey` and `loadOptionalSetting`** for configuration
7. **Add user agent suffix** using `withUserAgentSuffix`
