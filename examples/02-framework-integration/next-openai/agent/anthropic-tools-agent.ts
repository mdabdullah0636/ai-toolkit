import { weatherTool } from '@/tool/weather-tool';
import { anthropic } from '@ai-toolkit/anthropic';
import { InferAgentUIMessage, ToolLoopAgent } from 'ai-toolkit';

export const anthropicToolsAgent = new ToolLoopAgent({
  model: anthropic('claude-haiku-4-5'),
  tools: {
    weather: weatherTool,
  },
});

export type AnthropicToolsAgentMessage = InferAgentUIMessage<
  typeof anthropicToolsAgent
>;
