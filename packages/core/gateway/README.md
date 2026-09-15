# AI TOOLKIT - Gateway Provider

The Gateway provider for the [AI TOOLKIT](https://studio.khulnasoft.com/docs) allows the use of a wide variety of AI models and providers.

## Setup

The Gateway provider is available in the `@ai-toolkit/gateway` module. You can install it with

```bash
npm i @ai-toolkit/gateway
```

## Provider Instance

You can import the default provider instance `gateway` from `@ai-toolkit/gateway`:

```ts
import { gateway } from '@ai-toolkit/gateway';
```

## Example

```ts
import { gateway } from '@ai-toolkit/gateway';
import { generateText } from 'ai-toolkit';

const { text } = await generateText({
  model: gateway('xai/grok-3-beta'),
  prompt:
    'Tell me about the history of the San Francisco Mission-style burrito.',
});
```

## Documentation

Please check out the [AI TOOLKIT documentation](https://studio.khulnasoft.com/docs) for more information.
