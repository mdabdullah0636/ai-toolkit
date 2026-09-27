#!/usr/bin/env node

/**
 * Validates package boundaries and the staged domain migration.
 */

import fs from 'fs';
import path from 'path';
import { builtinModules } from 'module';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PACKAGES = path.join(ROOT, 'packages');
const CURRENT_DOMAINS = [
  'foundation',
  'ai',
  'gateway',
  'providers',
  'integrations',
  'ui',
  'mcp',
  'tooling',
  'testing',
  'agents',
  'tools',
  'workflow',
  'memory',
  'context',
  'sandbox',
  'retrieval',
  'evals',
  'observability',
  'security',
];
const FUTURE_DOMAINS = [];
const EXPECTED_DOMAINS = [...CURRENT_DOMAINS, ...FUTURE_DOMAINS];
const NODE_BUILTINS = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`)]);
const PRUNE = new Set(['node_modules', 'dist', '.git', '.next', '.turbo']);
// Test files, dev scripts, and tooling configs execute under Node by design and
// never ship; the runtime-neutral rule (ADR-004) governs shipped source, so they
// are excluded from the builtin scan.
const TEST_PATH =
  /(\.test(-d)?\.tsx?$|[\\/]__tests__[\\/]|[\\/]test[\\/]|[\\/]__fixtures__[\\/]|[\\/]__snapshots__[\\/]|[\\/]scripts[\\/]|\.config\.(js|mjs|cjs|ts)$)/;
const RUNTIME_NEUTRAL_DOMAINS = new Set(['foundation', 'ai']);
// Packages that are ESM-only by design (tsup `format: ['esm']` /
// svelte-package output): no correct `require` target exists, so the
// ADR-006 `require` condition is waived with a standing warning.
const ESM_ONLY_PACKAGES = new Set([
  '@ai-toolkit/rsc',
  '@ai-toolkit/google-vertex',
  '@ai-toolkit/devtools',
  '@ai-toolkit/svelte',
]);
const errors = [];
const warnings = [];
const packages = [];
const discoveredNames = new Map();

const reportError = message => errors.push(message);
const reportWarning = message => warnings.push(message);

function readWorkspaceGlobs() {
  const file = fs.readFileSync(path.join(ROOT, 'pnpm-workspace.yaml'), 'utf8');
  const match = file.match(/^packages:([\s\S]*?)^[a-zA-Z_]/m);
  const block = match ? match[1] : file;
  const globs = [];
  for (const line of block.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      const glob = trimmed
        .slice(2)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      if (glob && !glob.startsWith('#')) globs.push(glob);
    }
  }
  return globs;
}

function globToRegex(glob) {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '\u0000')
    .replace(/\*/g, '[^/]*')
    .replace(/\u0000/g, '.*');
  return new RegExp(`^${escaped}$`);
}

const WORKSPACE_GLOBS = readWorkspaceGlobs();
const WORKSPACE_REGEXES = WORKSPACE_GLOBS.map(glob => ({
  glob,
  regex: globToRegex(glob),
}));

function scanNodeImports(dir, out = new Set()) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (PRUNE.has(entry.name) || entry.name.startsWith('.')) continue;
      scanNodeImports(full, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
      if (TEST_PATH.test(full)) continue;
      let content;
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      // `import type` statements are erased at compile time and carry no
      // runtime dependency, so they never violate runtime-neutrality.
      content = content.replace(/import\s+type\s+[^;]+;/g, '');
      for (const m of content.matchAll(/from\s+['"]((?:node:)?[a-zA-Z0-9_@/-]+)['"]/g)) {
        const spec = m[1];
        if (spec.startsWith('node:') || builtinModules.includes(spec)) out.add(spec);
      }
    }
  }
  return out;
}

function collectPackageNames(root, category) {
  if (!fs.existsSync(root)) return;
  const rootManifestPath = path.join(root, 'package.json');
  if (fs.existsSync(rootManifestPath)) {
    const manifest = readJson(rootManifestPath);
    if (manifest?.name) discoveredNames.set(manifest.name, { category, dir: root });
  }
  const walk = dir => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (PRUNE.has(entry.name) || entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(full, 'package.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = readJson(manifestPath);
        if (manifest?.name) discoveredNames.set(manifest.name, { category, dir: full });
      }
      walk(full);
    }
  };
  walk(root);
}

collectPackageNames(path.join(ROOT, 'apps'), 'apps');
collectPackageNames(path.join(ROOT, 'examples'), 'examples');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    reportError(`Invalid JSON: ${path.relative(ROOT, file)} (${error.message})`);
    return undefined;
  }
}

function collectPackages(dir, domain) {
  if (!fs.existsSync(dir)) return;
  // A domain directory may itself be a package (e.g. packages/mcp).
  const rootManifestPath = path.join(dir, 'package.json');
  if (fs.existsSync(rootManifestPath)) {
    const manifest = readJson(rootManifestPath);
    if (manifest) packages.push({ dir, domain, manifest, manifestPath: rootManifestPath });
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const packageDir = path.join(dir, entry.name);
    if (!entry.isDirectory() || !fs.existsSync(path.join(packageDir, 'package.json'))) continue;
    const manifestPath = path.join(packageDir, 'package.json');
    const manifest = readJson(manifestPath);
    if (manifest) packages.push({ dir: packageDir, domain, manifest, manifestPath });
  }
}

for (const domain of EXPECTED_DOMAINS) {
  const domainDir = path.join(PACKAGES, domain);
  if (!fs.existsSync(domainDir)) {
    // Future domains are not yet implemented - warn instead of error
    if (FUTURE_DOMAINS.includes(domain)) {
      reportWarning(
        `Future domain not yet implemented: packages/${domain} (see architecture/FUTURE_DOMAINS.md)`,
      );
    } else {
      reportError(`Missing domain directory: packages/${domain}`);
    }
  } else if (!fs.statSync(domainDir).isDirectory()) {
    reportError(`Expected directory but found file: packages/${domain}`);
  } else if (!fs.existsSync(path.join(domainDir, 'README.md'))) {
    reportWarning(`Missing README.md in packages/${domain}`);
  }
  collectPackages(domainDir, domain);
}

if (!fs.existsSync(PACKAGES)) reportError(`Missing packages root: packages/`);
else if (!fs.statSync(PACKAGES).isDirectory())
  reportError(`Expected directory but found file: packages/`);
else {
  for (const entry of fs.readdirSync(PACKAGES, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || EXPECTED_DOMAINS.includes(entry.name)) continue;
    if (entry.isDirectory() && fs.existsSync(path.join(PACKAGES, entry.name, 'package.json'))) {
      const packageDir = path.join(PACKAGES, entry.name);
      const manifestPath = path.join(packageDir, 'package.json');
      const manifest = readJson(manifestPath);
      if (manifest)
        packages.push({
          dir: packageDir,
          domain: 'legacy',
          manifest,
          manifestPath,
        });
    }
  }
}

const names = new Map();
for (const pkg of packages) {
  if (!pkg.manifest.name)
    reportError(`Package is missing a name: ${path.relative(ROOT, pkg.manifestPath)}`);
  else if (names.has(pkg.manifest.name))
    reportError(
      `Duplicate package name \"${pkg.manifest.name}\": ${path.relative(ROOT, names.get(pkg.manifest.name))} and ${path.relative(ROOT, pkg.manifestPath)}`,
    );
  else names.set(pkg.manifest.name, pkg.manifestPath);

  if (!pkg.manifest.exports)
    reportError(`Package has no exports map: ${path.relative(ROOT, pkg.dir)}`);
  if (!pkg.manifest.source)
    reportWarning(`Package has no source entry: ${path.relative(ROOT, pkg.dir)}`);

  if (!pkg.manifest.stability)
    reportError(`Package missing stability label: ${path.relative(ROOT, pkg.dir)}`);
  if (!pkg.manifest.owners)
    reportError(`Package missing owners metadata: ${path.relative(ROOT, pkg.dir)}`);

  const relDir = path.relative(ROOT, pkg.dir).split(path.sep).join('/');
  const inWorkspace = WORKSPACE_REGEXES.some(({ regex }) => regex.test(relDir));
  if (!inWorkspace) reportError(`Package dir not matched by any pnpm-workspace glob: ${relDir}`);

  const dependencies = {
    ...pkg.manifest.dependencies,
    ...pkg.manifest.optionalDependencies,
  };
  for (const [dependency] of Object.entries(dependencies)) {
    const target = discoveredNames.get(dependency);
    if (target && target.category !== 'packages')
      reportError(
        `Forbidden dependency direction: ${path.relative(ROOT, pkg.dir)} -> ${dependency} (${target.category})`,
      );
  }

  if (RUNTIME_NEUTRAL_DOMAINS.has(pkg.domain)) {
    for (const dependency of Object.keys(dependencies)) {
      if (NODE_BUILTINS.has(dependency))
        reportError(
          `Runtime-neutral package depends on Node builtin \"${dependency}\": ${path.relative(ROOT, pkg.manifestPath)}`,
        );
    }
    for (const builtin of scanNodeImports(pkg.dir)) {
      reportError(
        `Runtime-neutral package imports Node builtin \"${builtin}\": ${path.relative(ROOT, pkg.dir)}`,
      );
    }
  }

  if (pkg.manifest.exports && typeof pkg.manifest.exports === 'object') {
    const main = pkg.manifest.exports['.'];
    if (main && typeof main === 'object') {
      const keys = Object.keys(main);
      for (const required of ['types', 'import', 'default'])
        if (!keys.includes(required))
          reportError(
            `Exports "." missing condition "${required}": ${path.relative(ROOT, pkg.dir)}`,
          );
      // `require` is required by ADR-006 unless the package is ESM-only by
      // design (no correct CJS target exists). Adding a CJS build to any of
      // these is a maintainer decision; until then the warning stands.
      if (!keys.includes('require')) {
        if (ESM_ONLY_PACKAGES.has(pkg.manifest.name))
          reportWarning(
            `Exports "." missing "require" condition (ESM-only by design): ${path.relative(ROOT, pkg.dir)}`,
          );
        else
          reportError(`Exports "." missing condition "require": ${path.relative(ROOT, pkg.dir)}`);
      }
    }
  }
}

const configs = ['pnpm-workspace.yaml', 'turbo.json', 'tsconfig.json', 'CODEOWNERS'];
for (const config of configs)
  if (!fs.existsSync(path.join(ROOT, config))) reportError(`Missing root config: ${config}`);

// Docs are mirrored: root content/ is canonical (shipped by package prepack
// scripts) and apps/docs/content/ is the derived Geistdocs site tree
// (commit ebc7561). The site tree applies a mechanical migration:
// numeric `NN-` prefixes stripped from every path segment, the leading H1
// title dropped (title renders from frontmatter), code-fence metadata
// rewritten (`filename=` -> `title=`, `highlight=".."` -> `{..}`,
// `env` -> `dotenv`), plus site-only nav files (`**/meta.json`) and the
// site-only `docs/elements/` section. Workflow: edit content/, then mirror
// + transform into apps/docs/content. This check enforces (1) coverage: every
// canonical page has a site counterpart, and (2) freshness: counterparts
// match after normalizing the mechanical transform, so genuine editorial
// drift in either tree surfaces as an error.
function stripNumericPrefix(rel) {
  return rel
    .split('/')
    .map(segment => segment.replace(/^[0-9]+-/, ''))
    .join('/');
}

// Canonicalize the Geistdocs fence-syntax migration back to the content/
// form so only genuine content drift is compared.
function normalizeDocsContent(text) {
  const lines = text.split('\n');
  const out = [];
  let inFrontmatter = false;
  let frontmatterClosed = false;
  let h1Dropped = false;
  for (const line of lines) {
    if (!frontmatterClosed && line.trim() === '---') {
      if (!inFrontmatter) inFrontmatter = true;
      else frontmatterClosed = true;
      out.push(line);
      continue;
    }
    if (frontmatterClosed && !h1Dropped) {
      if (line.trim() === '') {
        out.push(line);
        continue;
      }
      h1Dropped = true;
      if (/^#\s/.test(line)) continue; // site title comes from frontmatter
    }
    const fence = line.match(/^(\s*)```(\w+)(.*)$/);
    if (fence) {
      let [, indent, lang, meta] = fence;
      if (lang === 'dotenv') lang = 'env';
      meta = meta
        .replace(/\btitle=/g, 'filename=')
        .replace(/\bfile=/g, 'filename=')
        .replace(/=\{"([^}"]*)"\}/g, '="$1"')
        .replace(/=\{([^}]*)\}/g, '="$1"')
        .replace(/\{([^}]*)\}/g, 'highlight="$1"')
        .replace(/'/g, '"');
      out.push(`${indent}\`\`\`${lang}${meta}`);
      continue;
    }
    // Site anchor spans (<span id=".." />) have no canonical counterpart.
    if (/^\s*<span id="[^"]*"\s*\/>\s*$/.test(line)) continue;
    out.push(line);
  }
  // Blank-run differences (1 vs 2+ blank lines, often residue from dropped
  // H1/span lines) are insignificant in MDX rendering; collapse them so only
  // real content drift is compared.
  return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

// Site-only files with no canonical counterpart (explicit allowlist).
function isSiteOnlyFile(rel) {
  return rel.endsWith('/meta.json') || rel === 'meta.json' || rel.startsWith('docs/elements/');
}

function collectFiles(dir, base = dir, out = new Map()) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      collectFiles(full, base, out);
    } else {
      out.set(path.relative(base, full).split(path.sep).join('/'), fs.readFileSync(full));
    }
  }
  return out;
}

const contentFiles = collectFiles(path.join(ROOT, 'content'));
const siteContentFiles = collectFiles(path.join(ROOT, 'apps/docs/content'));
// Map canonical path -> site path via numeric-prefix stripping.
const siteByStripped = new Map();
for (const rel of siteContentFiles.keys()) siteByStripped.set(rel, rel);
const contentToSite = new Map();
for (const rel of contentFiles.keys()) contentToSite.set(rel, stripNumericPrefix(rel));
for (const [rel, siteRel] of contentToSite) {
  if (!siteContentFiles.has(siteRel)) {
    if (path.basename(rel) === 'index.mdx')
      reportWarning(`Docs index page has no site counterpart (nav uses meta.json): ${rel}`);
    else reportError(`Docs page missing in apps/docs/content: ${rel} (expected ${siteRel})`);
  } else if (
    normalizeDocsContent(contentFiles.get(rel).toString('utf8')) !==
    normalizeDocsContent(siteContentFiles.get(siteRel).toString('utf8'))
  ) {
    reportError(`Docs mirror content drift (beyond site transform): ${rel} <-> ${siteRel}`);
  }
}
for (const rel of siteContentFiles.keys()) {
  if (isSiteOnlyFile(rel)) continue;
  let covered = false;
  for (const siteRel of contentToSite.values()) {
    if (siteRel === rel) {
      covered = true;
      break;
    }
  }
  if (!covered)
    reportError(`File only in apps/docs/content, missing in canonical content/: ${rel}`);
}

// Example metadata (ADR-009): every examples/<category>/<name>/ dir carries an
// example.json whose name/category match its location; examples/registry.json
// indexes the same set.
const REQUIRED_EXAMPLE_KEYS = [
  'name',
  'title',
  'category',
  'categoryOrder',
  'framework',
  'primaryProvider',
  'description',
  'tags',
];
const examplesRoot = path.join(ROOT, 'examples');
const exampleMetas = new Map();
if (fs.existsSync(examplesRoot)) {
  for (const entry of fs.readdirSync(examplesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules')
      continue;
    const catDir = path.join(examplesRoot, entry.name);
    for (const sub of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (!sub.isDirectory() || sub.name.startsWith('.') || sub.name === 'node_modules') continue;
      const rel = `${entry.name}/${sub.name}`;
      const metaPath = path.join(catDir, sub.name, 'example.json');
      if (!fs.existsSync(metaPath)) {
        reportError(`Example missing example.json: examples/${rel}`);
        continue;
      }
      const meta = readJson(metaPath);
      if (meta === undefined) continue; // parse error already reported
      if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
        reportError(`example.json must be an object: examples/${rel}`);
        continue;
      }
      exampleMetas.set(rel, meta);
      for (const key of REQUIRED_EXAMPLE_KEYS)
        if (!(key in meta)) reportError(`example.json missing "${key}": examples/${rel}`);
      if (meta.name !== sub.name)
        reportError(`example.json name "${meta.name}" mismatches dir: examples/${rel}`);
      if (meta.category !== entry.name)
        reportError(`example.json category "${meta.category}" mismatches dir: examples/${rel}`);
      const order = parseInt(entry.name.split('-')[0], 10);
      if (!Number.isNaN(order) && meta.categoryOrder !== order)
        reportError(
          `example.json categoryOrder ${meta.categoryOrder} mismatches dir: examples/${rel}`,
        );
    }
  }
}

const registryPath = path.join(examplesRoot, 'registry.json');
if (!fs.existsSync(registryPath)) reportError('Missing examples/registry.json');
else {
  const registry = readJson(registryPath);
  if (registry) {
    const indexed = new Set();
    for (const cat of registry.categories || []) {
      for (const name of cat.examples || []) {
        const rel = `${cat.id}/${name}`;
        indexed.add(rel);
        if (!exampleMetas.has(rel))
          reportError(`registry.json lists missing example: examples/${rel}`);
      }
    }
    for (const rel of exampleMetas.keys())
      if (!indexed.has(rel)) reportError(`Example not indexed in registry.json: examples/${rel}`);
  }
}

const codeownersPath = path.join(ROOT, 'CODEOWNERS');
if (fs.existsSync(codeownersPath) && fs.statSync(codeownersPath).isFile()) {
  const rules = fs
    .readFileSync(codeownersPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.match(/^(\S+)/)?.[1])
    .filter(Boolean);

  const patternToRegex = pattern =>
    new RegExp(
      `^${pattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*(\*?)/g, (match, double) => (double ? '.*' : '[^/]*'))
        .replace(/\?/g, '.')}/?$`,
    );

  const coveredByRules = (pattern, ruleSet) =>
    ruleSet.some(rule => patternToRegex(rule.replace(/\/$/, '')).test(pattern));

  for (const domain of EXPECTED_DOMAINS)
    if (!coveredByRules(`packages/${domain}`, rules))
      reportWarning(`CODEOWNERS has no explicit rule for packages/${domain}/`);
}

console.log('\nRepository Structure Validation\n');
console.log(`Packages discovered: ${packages.length}`);
console.log(`Domain packages: ${packages.filter(pkg => pkg.domain !== 'legacy').length}`);
console.log(
  `Legacy packages remaining: ${packages.filter(pkg => pkg.domain === 'legacy').length}\n`,
);

if (errors.length) {
  console.log('Errors:');
  errors.forEach(message => console.log(`  - ${message}`));
}
if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach(message => console.log(`  - ${message}`));
}
if (!errors.length && !warnings.length) console.log('All structure checks passed.');
else if (!errors.length) console.log('No errors; warnings indicate migration work remaining.');
else process.exit(1);
