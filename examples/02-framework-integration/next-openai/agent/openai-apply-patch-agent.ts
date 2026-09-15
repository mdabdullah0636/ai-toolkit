import { openai, OpenAIResponsesProviderOptions } from '@ai-toolkit/openai';
import { ToolLoopAgent, InferAgentUIMessage } from 'ai-toolkit';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { createApplyPatchExecutor } from '@/lib/apply-patch-file-editor';

// Create workspace directory
const workspaceRoot = path.join(process.cwd(), 'workspace');

// Ensure workspace directory exists
async function ensureWorkspaceExists() {
  try {
    await fs.mkdir(workspaceRoot, { recursive: true });
  } catch (error) {}
}

ensureWorkspaceExists();

export const openaiApplyPatchAgent = new ToolLoopAgent({
  model: openai.responses('gpt-5.1'),
  tools: {
    apply_patch: openai.tools.applyPatch({
      execute: createApplyPatchExecutor(workspaceRoot),
    }),
  },
  providerOptions: {
    openai: {
      reasoningEffort: 'medium',
      reasoningSummary: 'detailed',
    } satisfies OpenAIResponsesProviderOptions,
  },
});

export type OpenAIApplyPatchMessage = InferAgentUIMessage<
  typeof openaiApplyPatchAgent
>;
