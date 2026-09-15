#!/usr/bin/env node

/**
 * Validates cross-layer dependency direction per architecture/DEPENDENCY_RULES.md.
 * Validates both package.json dependencies and TypeScript/JavaScript import statements.
 * Run with: pnpm arch:deps (or: node tools/scripts/check-dependency-direction.mjs)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PACKAGES = path.join(ROOT, 'packages');

const PRUNE = new Set(['node_modules', 'dist', '.git', '.next', '.turbo', 'coverage']);
// Test files execute under Node by design and are excluded from import scanning
// to avoid false positives from test-only cross-layer imports.
const TEST_PATH =
  /(\.test(-d)?\.tsx?$|[\\/]__tests__[\\/]|[\\/]test[\\/]|[\\/]__fixtures__[\\/]|[\\/]__snapshots__[\\/]|[\\/]scripts[\\/]|\.config\.(js|mjs|cjs|ts)$)/;

const LAYER_BY_DOMAIN = {
  core: {
    'ai-toolkit': 'runtime',
    'provider-utils': 'runtime',
    runtime: 'foundation',
    gateway: 'runtime',
  },
  validation: {
    provider: 'foundation',
    capabilities: 'foundation',
    valibot: 'runtime',
  },
  providers: 'provider',
  mcp: 'protocol',
  special: {
    devtools: 'experience',
    codemod: 'experience',
    khulnasoft: 'gateway',
    platform: 'experience',
  },
  adapters: 'integration',
  ui: 'experience',
  infrastructure: 'infrastructure',
};

const ALLOWED_DEPS = {
  foundation: [],
  runtime: ['foundation', 'provider'],
  provider: ['foundation', 'runtime'],
  protocol: ['foundation'],
  gateway: ['foundation', 'runtime', 'protocol'],
  integration: ['runtime', 'protocol', 'foundation'],
  experience: ['runtime', 'gateway', 'integration', 'foundation'],
  infrastructure: [],
};

// Known legitimate exceptions (documented in DEPENDENCY_RULES.md)
const EXCEPTIONS = new Set([
  // RSC server components need direct provider access
  'rsc:provider',
  // Devtools uses provider directly for its UI
  'devtools:foundation',
  // Gateway packages depend on specific providers for delegation
  'khulnasoft:provider',
  // MCP protocol implementation needs shared HTTP/schema utilities
  // from provider-utils (Phase 3 target: move protocol-relevant utilities to Foundation)
  'mcp:runtime',
]);

const LAYER_ORDER = {
  foundation: 0,
  runtime: 1,
  provider: 1.5,
  protocol: 2,
  gateway: 3,
  integration: 5,
  experience: 6,
  infrastructure: 7,
};

const errors = [];
const warnings = [];
const packages = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function getPackageLayer(dir, manifest) {
  const relDir = path.relative(PACKAGES, dir);
  const parts = relDir.split(path.sep);
  const domain = parts[0];

  if (domain === 'special') {
    const sub = parts[1];
    return LAYER_BY_DOMAIN.special[sub] || 'experience';
  }
  if (domain === 'core') {
    const sub = parts[1];
    return LAYER_BY_DOMAIN.core[sub] || 'runtime';
  }
  if (domain === 'validation') {
    const sub = parts[1];
    return LAYER_BY_DOMAIN.validation[sub] || 'foundation';
  }
  return LAYER_BY_DOMAIN[domain] || 'runtime';
}

function scanPackages() {
  for (const domain of Object.keys(LAYER_BY_DOMAIN)) {
    const domainDir = path.join(PACKAGES, domain);
    if (!fs.existsSync(domainDir)) continue;

    // A domain directory may itself be a package (e.g. packages/mcp)
    const rootManifestPath = path.join(domainDir, 'package.json');
    if (fs.existsSync(rootManifestPath)) {
      const manifest = readJson(rootManifestPath);
      if (manifest && manifest.name) {
        packages.push({
          name: manifest.name,
          dir: domainDir,
          domain,
          layer: getPackageLayer(domainDir, manifest),
          dependencies: {
            ...manifest.dependencies,
            ...manifest.optionalDependencies,
          },
        });
      }
    }

    for (const entry of fs.readdirSync(domainDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(domainDir, entry.name);
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(full, 'package.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = readJson(manifestPath);
        if (!manifest) continue;
        packages.push({
          name: manifest.name || path.basename(full),
          dir: full,
          domain,
          layer: getPackageLayer(full, manifest),
          dependencies: {
            ...manifest.dependencies,
            ...manifest.optionalDependencies,
          },
        });
      }
    }
  }
}

function scanSourceImports(dir, out = new Set()) {
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
      scanSourceImports(full, out);
    } else if (/\.(ts|tsx|mjs|js|jsx)$/.test(entry.name)) {
      if (TEST_PATH.test(full)) continue;
      let content;
      try {
        content = fs.readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      // Strip import type statements — erased at compile time, no runtime dep
      content = content.replace(/import\s+type\s+[^;]*;/g, '');
      // Strip comments to avoid false positives from example imports in JSDoc
      content = stripComments(content);
      for (const m of content.matchAll(
        /from\s+['"]([^'"]+)['"]/g,
      )) {
        out.add(m[1]);
      }
      // Also capture dynamic imports: import('...')
      for (const m of content.matchAll(
        /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      )) {
        out.add(m[1]);
      }
    }
  }
  return out;
}

function stripComments(code) {
  // Remove block comments (/* ... */) including multi-line
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove line comments (// ...)
  code = code.replace(/\/\/.*$/gm, '');
  return code;
}

function resolveWorkspaceImport(spec, allPackageNames) {
  // Match direct package imports: @ai-toolkit/foo or @ai-toolkit/foo/deep
  const match = spec.match(/^(@ai-toolkit\/[a-z0-9-]+)(?:\/|$)/);
  if (match && allPackageNames.has(match[1])) {
    return match[1];
  }
  return null;
}

function validate() {
  const nameToPkg = new Map(packages.map(p => [p.name, p]));
  const allPackageNames = new Set(nameToPkg.keys());

  for (const pkg of packages) {
    // 1. Validate package.json dependencies
    for (const depName of Object.keys(pkg.dependencies)) {
      const dep = nameToPkg.get(depName);
      if (!dep) continue; // external dependency, skip

      // Intra-layer dependencies are always allowed
      if (pkg.layer === dep.layer) continue;

      // Check for exception (package:layer format)
      const exceptionKey = `${pkg.name.replace('@ai-toolkit/', '')}:${dep.layer}`;
      if (EXCEPTIONS.has(exceptionKey)) continue;

      const allowed = ALLOWED_DEPS[pkg.layer];
      if (!allowed) {
        errors.push(`Unknown layer for ${pkg.name}: ${pkg.layer}`);
        continue;
      }

      if (!allowed.includes(dep.layer)) {
        errors.push(
          `FORBIDDEN (package.json): ${pkg.name} (${pkg.layer}) -> ${dep.name} (${dep.layer}). Allowed: [${allowed.join(', ')}]`,
        );
      }
    }

    // 2. Validate TypeScript/JavaScript import statements
    const imports = scanSourceImports(pkg.dir, new Set());
    for (const spec of imports) {
      const resolved = resolveWorkspaceImport(spec, allPackageNames);
      if (!resolved) continue;

      const dep = nameToPkg.get(resolved);
      if (!dep) continue;

      // Intra-layer dependencies are always allowed
      if (pkg.layer === dep.layer) continue;

      // Check for exception (package:layer format)
      const exceptionKey = `${pkg.name.replace('@ai-toolkit/', '')}:${dep.layer}`;
      if (EXCEPTIONS.has(exceptionKey)) continue;

      const allowed = ALLOWED_DEPS[pkg.layer];
      if (!allowed) continue; // unknown layer, skip (reported in package.json validation)

      if (!allowed.includes(dep.layer)) {
        errors.push(
          `FORBIDDEN (import): ${pkg.name} (${pkg.layer}) imports ${resolved} (${dep.layer}). Allowed: [${allowed.join(', ')}]`,
        );
      }
    }
  }
}

function printReport() {
  console.log('\nDependency Direction Validation\n');
  console.log(`Packages scanned: ${packages.length}`);
  console.log('');

  const byLayer = {};
  for (const pkg of packages) {
    if (!byLayer[pkg.layer]) byLayer[pkg.layer] = [];
    byLayer[pkg.layer].push(pkg.name);
  }
  for (const layer of Object.keys(LAYER_ORDER).sort(
    (a, b) => LAYER_ORDER[a] - LAYER_ORDER[b],
  )) {
    if (byLayer[layer]) {
      console.log(`${layer} (${byLayer[layer].length}):`);
      for (const name of byLayer[layer].sort()) console.log(`  - ${name}`);
    }
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('\nThese require resolution. See DEPENDENCY_RULES.md for options.');
    process.exit(1);
  } else {
    console.log('\nAll dependency direction checks passed.');
  }
}

scanPackages();
validate();
printReport();
