import { openai } from '@ai-toolkit/openai';
import { generateText, stepCountIs, tool } from 'ai-toolkit';
import { z } from 'zod';
import { weatherTool } from '../tools/weather-tool';
import { run } from '../lib/run';

run(async () => {
  const { text } = await generateText({
    model: openai('gpt-4o'),
    tools: {
      weather: weatherTool,
      cityAttractions: tool({
        inputSchema: z.object({ city: z.string() }),
      }),
    },
    activeTools: [], // disable all tools
    stopWhen: stepCountIs(5),
    prompt:
      'What is the weather in San Francisco and what attractions should I visit?',
  });

  console.log(text);
});
