import { claudeCodeHarness } from '@ai-toolkit/harness-claude-code';
import { clineHarness } from '@ai-toolkit/harness-cline';
import { codexHarness } from '@ai-toolkit/harness-codex';
import { cursorHarness } from '@ai-toolkit/harness-cursor';
import { grokBuildHarness } from '@ai-toolkit/harness-grok-build';
import { opencodeHarness } from '@ai-toolkit/harness-opencode';
import { piHarness } from '@ai-toolkit/harness-pi';
console.log(
  claudeCodeHarness.harnessId,
  '->',
  claudeCodeHarness.getBootstrapIdentity(),
);
console.log(clineHarness.harnessId, '->', clineHarness.getBootstrapIdentity());
console.log(codexHarness.harnessId, '->', codexHarness.getBootstrapIdentity());
console.log(
  cursorHarness.harnessId,
  '->',
  cursorHarness.getBootstrapIdentity(),
);
console.log(
  grokBuildHarness.harnessId,
  '->',
  grokBuildHarness.getBootstrapIdentity(),
);
console.log(
  opencodeHarness.harnessId,
  '->',
  opencodeHarness.getBootstrapIdentity(),
);
console.log(piHarness.harnessId, '->', piHarness.getBootstrapIdentity());
