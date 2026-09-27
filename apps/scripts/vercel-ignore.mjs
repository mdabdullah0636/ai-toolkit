import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

const site = process.argv[2];
if (!['docs', 'www', 'studio'].includes(site)) {
  console.error('Usage: vercel-ignore.mjs <docs|www|studio>');
  process.exit(2);
}

// Global changes that always trigger every site deploy.
const GLOBAL =
  /^(apps\/package\.json$|apps\/scripts\/|packages\/|tools\/|content\/|examples\/registry\.json$|package\.json$|pnpm-lock\.yaml$|pnpm-workspace\.yaml$|turbo\.json$|tsconfig.*\.json$|\.github\/)/;

function changedFiles() {
  const result = spawnSync('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    return null;
  }
  return result.stdout
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

const files = changedFiles();
if (files === null || files.length === 0) {
  // No diff parent (first deploy) or empty diff: always deploy.
  process.exit(1);
}

for (const file of files) {
  if (file.startsWith(`apps/${site}/`) || GLOBAL.test(file)) {
    process.exit(1);
  }
}

console.log(`vercel-ignore: no changes affecting apps/${site}; skipping build.`);
process.exit(0);
