#!/usr/bin/env node

/**
 * Records the current catalog sources and app-owned readers before the
 * platform registry migration.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const OUT_FILE = path.join(ROOT, 'build/platform-inventory.json');
const APPS = ['docs', 'www', 'studio'];

const sourceDefinitions = [
  {
    id: 'gateways',
    kind: 'registry',
    path: 'content/gateways-registry/registry.ts',
    entity: 'Gateway',
    countPattern: /\bslug:\s*['"]/g,
  },
  {
    id: 'tools',
    kind: 'registry',
    path: 'content/tools-registry/registry.ts',
    entity: 'Tool',
    countPattern: /\bslug:\s*['"]/g,
  },
  {
    id: 'templates',
    kind: 'registry',
    path: 'examples/registry.json',
    entity: 'Template',
    countJson: value => value.examples?.length ?? 0,
  },
  {
    id: 'providers',
    kind: 'content',
    path: 'content/providers',
    entity: 'Provider',
    countFiles: true,
  },
  {
    id: 'recipes',
    kind: 'content',
    path: 'content/cookbook',
    entity: 'Recipe',
    countFiles: true,
  },
  {
    id: 'models',
    kind: 'package-source',
    path: 'packages/core/gateway/src',
    entity: 'Model',
    countModelSettings: true,
  },
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function walk(dir, callback) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, callback);
    else callback(fullPath);
  }
}

function countMdxFiles(relativePath) {
  let count = 0;
  walk(path.join(ROOT, relativePath), file => {
    if (file.endsWith('.mdx') && path.basename(file) !== 'index.mdx') count++;
  });
  return count;
}

function countModelSettings(relativePath) {
  let count = 0;
  walk(path.join(ROOT, relativePath), file => {
    if (!file.endsWith('-model-settings.ts')) return;
    count += (read(path.relative(ROOT, file)).match(/^\s*\|\s*'[^']+'/gm) ?? [])
      .length;
  });
  return count;
}

function countSource(source) {
  if (source.countJson) return source.countJson(JSON.parse(read(source.path)));
  if (source.countFiles) return countMdxFiles(source.path);
  if (source.countModelSettings) return countModelSettings(source.path);
  return (read(source.path).match(source.countPattern) ?? []).length;
}

function findAppReaders() {
  const readers = [];
  for (const app of APPS) {
    const appRoot = path.join(ROOT, 'apps', app);
    walk(appRoot, file => {
      if (
        !/\.(ts|tsx)$/.test(file) ||
        file.includes(`${path.sep}.next${path.sep}`)
      )
        return;
      const source = fs.readFileSync(file, 'utf8');
      const imports = [
        ...source.matchAll(
          /(?:from|import\()\s*['"]([^'"]*(?:content\/|examples\/registry|packages\/special\/gateway)[^'"]*)['"]/g,
        ),
      ].map(match => match[1]);
      if (imports.length > 0) {
        readers.push({
          app,
          file: path.relative(ROOT, file).split(path.sep).join('/'),
          imports: [...new Set(imports)].sort(),
        });
      }
    });
  }
  return readers.sort((a, b) => a.file.localeCompare(b.file));
}

function buildInventory() {
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sources: sourceDefinitions.map(source => ({
      id: source.id,
      kind: source.kind,
      path: source.path,
      entity: source.entity,
      count: countSource(source),
    })),
    appReaders: findAppReaders(),
  };
}

function withoutTimestamp(value) {
  const copy = { ...value };
  delete copy.generatedAt;
  return copy;
}

const inventory = buildInventory();
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT_FILE)) {
    console.error(
      `Missing ${path.relative(ROOT, OUT_FILE)}; run pnpm platform-inventory`,
    );
    process.exit(1);
  }
  const committed = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  if (
    JSON.stringify(withoutTimestamp(committed)) !==
    JSON.stringify(withoutTimestamp(inventory))
  ) {
    console.error(
      `${path.relative(ROOT, OUT_FILE)} is stale; run pnpm platform-inventory`,
    );
    process.exit(1);
  }
  console.log(`${path.relative(ROOT, OUT_FILE)} is current`);
} else {
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(inventory, null, 2)}\n`);
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
}
