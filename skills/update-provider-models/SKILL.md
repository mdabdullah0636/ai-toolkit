# Update Provider Models

This skill guides you through adding new models to an existing provider package.

## Overview

When AI providers release new models, you need to update the model ID types and potentially add new options or capabilities.

## Step 1: Update Model IDs

Model IDs are defined in the options file for each model type.

**Location**: `packages/<provider>/src/chat/<provider>-chat-options.ts`

### Adding a New Model ID

```typescript
// Before
export type OpenAIChatModelId =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | (string & {});

// After - add new model
export type OpenAIChatModelId =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-5' // New model
  | 'gpt-5-mini' // New model
  | (string & {});
```

### Model ID Conventions

1. **Include dated versions** when available:

   ```typescript
   | 'gpt-4o'
   | 'gpt-4o-2024-08-06'
   | 'gpt-4o-2024-11-20'
   ```

2. **Use the `(string & {})` pattern** to allow custom model IDs while providing autocomplete for known models.

3. **Group related models** together in the type definition.

## Step 2: Update Model-Specific Options

If the new model has unique capabilities, add new options:

```typescript
export const <provider>ChatLanguageModelOptions = lazySchema(() =>
  zodSchema(
    z.object({
      // Existing options...

      // New option for reasoning models
      reasoningEffort: z.enum(['low', 'medium', 'high']).optional(),

      // New option for specific models
      webSearch: z.boolean().optional(),
    }),
  ),
);
```

## Step 3: Handle Model-Specific Behavior

Some models require special handling in the language model implementation.

### Example: Reasoning Models

```typescript
// In the language model implementation
private get isReasoningModel(): boolean {
  return (
    this.settings.forceReasoning ||
    this.modelId.startsWith('o1') ||
    this.modelId.startsWith('o3') ||
    this.modelId.startsWith('o4')
  );
}

// Use in request building
if (this.isReasoningModel) {
  // Apply reasoning-specific parameters
  body.reasoning_effort = providerOptions?.reasoningEffort ?? 'medium';
}
```

### Example: System Message Handling

Different models may handle system messages differently:

```typescript
private get systemMessageMode(): 'system' | 'developer' | 'remove' {
  // Check for explicit override
  if (this.settings.systemMessageMode) {
    return this.settings.systemMessageMode;
  }

  // Reasoning models use 'developer' role
  if (this.isReasoningModel) {
    return 'developer';
  }

  return 'system';
}
```

## Step 4: Update Documentation

Update the provider documentation in `content/providers/`:

```mdx
## Models

### Chat Models

| Model         | Description                     |
| ------------- | ------------------------------- |
| `gpt-4o`      | Most capable model              |
| `gpt-4o-mini` | Smaller, faster model           |
| `gpt-5`       | **New** - Next generation model |
```

## Step 5: Add Tests for New Models

Create tests that verify the new model works correctly:

```typescript
describe('gpt-5 model', () => {
  const model = provider.chat('gpt-5');

  it('should send correct model in request', async () => {
    prepareJsonResponse({ content: '' });

    await model.doGenerate({ prompt: TEST_PROMPT });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: 'gpt-5',
    });
  });

  it('should support new reasoning option', async () => {
    prepareJsonResponse({ content: '' });

    await model.doGenerate({
      prompt: TEST_PROMPT,
      providerOptions: {
        openai: { reasoningEffort: 'high' },
      },
    });

    expect(await server.calls[0].requestBodyJson).toMatchObject({
      model: 'gpt-5',
      reasoning_effort: 'high',
    });
  });
});
```

## Step 6: Update Other Model Types (if applicable)

Don't forget to update other model types if the provider added new models:

- **Embedding models**: `src/embedding/<provider>-embedding-options.ts`
- **Image models**: `src/image/<provider>-image-options.ts`
- **Speech models**: `src/speech/<provider>-speech-options.ts`
- **Transcription models**: `src/transcription/<provider>-transcription-options.ts`

## Common Scenarios

### Adding a Model Family

When a provider releases a new model family (e.g., GPT-5):

1. Add all variants to the model ID type
2. Check if new options are needed
3. Check if special handling is required
4. Add tests for each variant

### Adding Model Capabilities

When existing models gain new capabilities:

1. Add new options to the options schema
2. Update request building logic
3. Update response parsing if needed
4. Add tests for the new capability

### Deprecating Models

When models are deprecated:

1. Add `@deprecated` JSDoc comments
2. Consider adding console warnings
3. Update documentation

```typescript
export type OpenAIChatModelId =
  | 'gpt-4o'
  /** @deprecated Use gpt-4o instead */
  | 'gpt-4-vision-preview'
  | (string & {});
```

## Checklist

- [ ] Updated model ID type
- [ ] Added new options (if needed)
- [ ] Updated language model implementation (if needed)
- [ ] Added tests for new models
- [ ] Updated documentation
- [ ] Added changeset (`pnpm changeset`)
