#!/usr/bin/env node

/**
 * Splits the root tsconfig.json references into per-domain tsconfig files.
 *
 * The root tsconfig.json contains ~65 references across all domains
 * (core, providers, adapters, etc.). This script groups them by domain
 * and generates separate tsconfig.<domain>.json files for targeted type checking.
 *
 * Usage:
 *   node tools/scripts/split-ts-references.mjs          Print split plan (dry-run)
 *   node tools/scripts/split-ts-references.mjs --write  Write tsconfig files to disk
 *   node tools/scripts/split-ts-references.mjs --domain providers  Split specific domain
 *
 * Run with: pnpm split-ts-references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const DOMAIN_FILTER = args.find(a => a.startsWith('--domain='))?.split('=')[1] ?? null;

const DOMAIN_MAP = {
  'packages/core': 'core',
  'packages/providers': 'providers',
  'packages/adapters': 'adapters',
  'packages/special': 'special',
  'packages/validation': 'validation',
  'packages/infrastructure': 'infrastructure',
  'packages/ui': 'ui',
  'packages/mcp': 'mcp',
  'examples': 'examples',
};

function getDomain(refPath) {
  for (const [prefix, domain] of Object.entries(DOMAIN_MAP)) {
    if (refPath.startsWith(prefix + '/') || refPath === prefix) return domain;
  }
  return 'other';
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function main() {
  const tsconfigPath = path.join(ROOT, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    console.error('tsconfig.json not found at root');
    process.exit(1);
  }

  const tsconfig = readJson(tsconfigPath);
  if (!tsconfig || !Array.isArray(tsconfig.references)) {
    console.error('tsconfig.json has no references array');
    process.exit(1);
  }

  const byDomain = {};
  for (const ref of tsconfig.references) {
    const domain = getDomain(ref.path);
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(ref);
  }

  const domains = DOMAIN_FILTER ? [DOMAIN_FILTER] : Object.keys(byDomain).sort();

  console.log('\nSplit TS References\n');
  console.log(`Total references: ${tsconfig.references.length}`);
  console.log(`Domains: ${domains.length}`);
  if (WRITE) console.log('Mode: write');
  else console.log('Mode: dry-run');
  console.log('');

  for (const domain of domains) {
    const refs = byDomain[domain];
    const filename = `tsconfig.${domain}.json`;
    const filepath = path.join(ROOT, filename);

    const output = {
      references: refs.map(r => ({ path: r.path })),
      include: [],
      compilerOptions: {},
    };

    const json = JSON.stringify(output, null, 2) + '\n';

    console.log(`${domain}/`);
    console.log(`  File: ${filename}`);
    console.log(`  References: ${refs.length}`);
    for (const ref of refs) console.log(`    - ${ref.path}`);

    if (WRITE) {
      fs.writeFileSync(filepath, json);
    }
  }

  if (WRITE) {
    console.log(`\nWrote ${domains.length} tsconfig file(s) to ${ROOT}`);
  } else {
    console.log(`\nRun with --write to create these files.`);
  }
}

main();
