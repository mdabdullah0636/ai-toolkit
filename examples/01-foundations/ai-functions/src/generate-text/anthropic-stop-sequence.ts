import { anthropic } from '@ai-toolkit/anthropic';
import { generateText } from 'ai-toolkit';
import { run } from '../lib/run';

run(async () => {
  const result = await generateText({
    model: anthropic('claude-sonnet-4-0'),
    prompt: 'Write a short story and end it with the word END.',
    stopSequences: ['END'],
  });

  console.log(result.text);
  console.log();
  console.log('Token usage:', result.usage);
  console.log('Finish reason:', result.finishReason);
  console.log(
    'Stop sequence:',
    result.providerMetadata?.anthropic?.stopSequence,
  );
});
