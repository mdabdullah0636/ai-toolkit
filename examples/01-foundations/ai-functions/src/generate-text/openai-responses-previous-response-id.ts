import { openai, OpenAIResponsesProviderOptions } from '@ai-toolkit/openai';
import { generateText } from 'ai-toolkit';
import { run } from '../lib/run';

run(async () => {
  const result1 = await generateText({
    model: openai.responses('gpt-4o-mini'),
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  const result2 = await generateText({
    model: openai.responses('gpt-4o-mini'),
    prompt: 'Summarize in 2 sentences',
    providerOptions: {
      openai: {
        previousResponseId: result1.providerMetadata?.openai
          .responseId as string,
      } satisfies OpenAIResponsesProviderOptions,
    },
  });

  console.log(result2.text);
});
