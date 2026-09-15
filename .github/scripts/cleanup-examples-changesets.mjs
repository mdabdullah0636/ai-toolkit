/**
 * `changeset version` updates the version and adds a changelog file in
 * the example apps, but we don't want to do that. So this script reverts
 * any "version" field changes and deletes the `CHANGELOG.md` file.
 *
 * Source: https://github.com/TooTallNate/nx.js/blob/main/.github/scripts/cleanup-examples.mjs
 */

import {
  readFileSync,
  writeFileSync,
  unlinkSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { fileURLToPath } from 'url';
import { join } from 'path';

function cleanup(app, url) {
  const appPath = join(fileURLToPath(url), app);

  if (!statSync(appPath).isDirectory()) return;

  console.log('Cleaning up', appPath);

  const packageJsonPath = join(appPath, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = '0.0.0';
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  try {
    const changelogPath = join(appPath, 'CHANGELOG.md');
    console.log('Deleting', changelogPath);
    unlinkSync(changelogPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

// examples are categorized: examples/<category>/<name>/
const examplesUrl = new URL('../../examples/', import.meta.url);
const examplesDir = fileURLToPath(examplesUrl);
for (const category of readdirSync(examplesDir)) {
  if (category.startsWith('.')) continue;
  const categoryDir = join(examplesDir, category);
  if (!statSync(categoryDir).isDirectory()) continue;
  const categoryUrl = new URL(`${category}/`, examplesUrl);
  for (const app of readdirSync(categoryDir)) {
    if (app.startsWith('.')) continue;
    cleanup(app, categoryUrl);
  }
}

// next test server
cleanup(
  '.',
  new URL('../../packages/adapters/rsc/tests/e2e/next-server', import.meta.url),
);
