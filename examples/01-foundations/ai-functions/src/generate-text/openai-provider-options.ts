import {
  openai,
  type OpenAIChatLanguageModelOptions,
} from '@ai-toolkit/openai';
import { generateText } from 'ai-toolkit';
import { run } from '../lib/run';

run(async () => {
  const { text, usage } = await generateText({
    model: openai.chat('gpt-4o'),
    prompt: 'Invent a new holiday and describe its traditions.',
    providerOptions: {
      openai: {
        logitBias: {},
        logprobs: 1,
        user: '<user_id>',
        maxCompletionTokens: 100,
        store: false,
        serviceTier: 'auto',
        strictJsonSchema: false,
        textVerbosity: 'medium',
        promptCacheKey: '<prompt_cache_key>',
        safetyIdentifier: '<safety_identifier>',
        // @ts-expect-error
        invalidOption: null,
      } satisfies OpenAIChatLanguageModelOptions,
    },
  });

  console.log(text);
  console.log();
  console.log('Usage:', usage);
});
