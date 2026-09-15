#!/usr/bin/env node

/**
 * Inspects the architecture: outputs the package registry, dependency graph,
 * layer classification, and capability matrix.
 *
 * Run with: pnpm arch:inspect
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PACKAGES_DIR = path.join(ROOT, 'packages');

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

function getPackageLayer(domain, sub) {
  if (domain === 'special' || domain === 'core' || domain === 'validation') {
    const mapping = LAYER_BY_DOMAIN[domain];
    return mapping[sub] || (domain === 'core' ? 'runtime' : domain === 'validation' ? 'foundation' : 'experience');
  }
  return LAYER_BY_DOMAIN[domain] || 'unknown';
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

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

const EXCEPTIONS = new Set([
  'rsc:provider',
  'devtools:foundation',
  'khulnasoft:provider',
  'mcp:runtime',
]);

function collectPackages() {
  const result = [];
  const domainDirs = ['core', 'providers', 'adapters', 'mcp', 'special', 'validation', 'infrastructure', 'ui'];

  for (const domain of domainDirs) {
    const domainDir = path.join(PACKAGES_DIR, domain);
    if (!fs.existsSync(domainDir)) continue;

    // Check if the domain dir itself is a package
    const rootManifest = path.join(domainDir, 'package.json');
    if (fs.existsSync(rootManifest)) {
      const manifest = readJson(rootManifest);
      if (manifest && manifest.name) {
        result.push({
          name: manifest.name,
          dir: path.relative(PACKAGES_DIR, domainDir),
          domain,
          sub: null,
          layer: getPackageLayer(domain, domain),
          stability: manifest.stability || 'missing',
          owners: manifest.owners || [],
          published: !manifest.private,
          dependencies: { ...manifest.dependencies, ...manifest.optionalDependencies },
        });
      }
    }

    for (const entry of fs.readdirSync(domainDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || !entry.isDirectory()) continue;
      const fullDir = path.join(domainDir, entry.name);
      const manifestPath = path.join(fullDir, 'package.json');
      if (!fs.existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      if (!manifest || !manifest.name) continue;

      result.push({
        name: manifest.name,
        dir: path.relative(PACKAGES_DIR, fullDir),
        domain,
        sub: entry.name,
        layer: getPackageLayer(domain, entry.name),
        stability: manifest.stability || 'missing',
        owners: manifest.owners || [],
        published: !manifest.private,
        dependencies: { ...manifest.dependencies, ...manifest.optionalDependencies },
      });
    }
  }
  return result;
}

function loadCapabilityMatrix() {
  const matrixPath = path.join(ROOT, 'build', 'capability-matrix.json');
  if (fs.existsSync(matrixPath)) {
    return JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  }
  return null;
}

function main() {
  const packages = collectPackages();
  const matrix = loadCapabilityMatrix();
  const nameToPkg = new Map(packages.map(p => [p.name, p]));

  console.log('\n=== AI TOOLKIT Architecture Inspection ===\n');

  // Summary
  console.log(`Total packages: ${packages.length}`);
  const byLayer = {};
  const byDomain = {};
  const byStability = {};
  for (const pkg of packages) {
    (byLayer[pkg.layer] = byLayer[pkg.layer] || []).push(pkg.name);
    (byDomain[pkg.domain] = byDomain[pkg.domain] || []).push(pkg.name);
    const stab = pkg.stability || 'missing';
    (byStability[stab] = byStability[stab] || []).push(pkg.name);
  }

  console.log('\nBy layer:');
  for (const [layer, names] of Object.entries(byLayer).sort()) {
    console.log(`  ${layer} (${names.length}): ${names.sort().join(', ')}`);
  }

  console.log('\nBy domain:');
  for (const [domain, names] of Object.entries(byDomain).sort()) {
    console.log(`  ${domain} (${names.length})`);
  }

  console.log('\nBy stability:');
  for (const [stab, names] of Object.entries(byStability).sort()) {
    console.log(`  ${stab} (${names.length})`);
  }

  // Missing metadata
  const missingStability = packages.filter(p => !p.stability || p.stability === 'missing');
  const missingOwners = packages.filter(p => !p.owners || p.owners.length === 0);
  if (missingStability.length > 0) {
    console.log(`\nPackages missing stability: ${missingStability.map(p => p.name).join(', ')}`);
  }
  if (missingOwners.length > 0) {
    console.log(`Packages missing owners: ${missingOwners.map(p => p.name).join(', ')}`);
  }

  // Cross-layer dependencies
  console.log('\n--- Cross-layer dependency violations ---');
  const violations = [];
  for (const pkg of packages) {
    for (const [depName] of Object.entries(pkg.dependencies)) {
      const dep = nameToPkg.get(depName);
      if (!dep) continue;
      if (pkg.layer === dep.layer) continue; // intra-layer is fine

      const allowed = ALLOWED_DEPS[pkg.layer];
      if (!allowed) continue;

      // Check for documented exception
      const exceptionKey = `${pkg.name.replace('@ai-toolkit/', '')}:${dep.layer}`;
      if (EXCEPTIONS.has(exceptionKey)) continue;

      if (!allowed.includes(dep.layer)) {
        violations.push({ from: pkg, to: dep, depName });
      }
    }
  }
  if (violations.length === 0) {
    console.log('None.');
  } else {
    for (const { from, to } of violations) {
      console.log(`  ${from.name} (${from.layer}) -> ${to.name} (${to.layer})`);
    }
  }

  // Capability matrix summary
  if (matrix) {
    console.log('\n--- Capability matrix (from build/capability-matrix.json) ---');
    console.log(`Providers with capabilities: ${matrix.providers.length}`);
    for (const [cap, providerList] of Object.entries(matrix.capabilities)) {
      if (providerList.length > 0) {
        console.log(`  ${cap}: ${providerList.join(', ')}`);
      }
    }
    console.log(`\nGateway models: ${matrix.gatewayModels?.total || 0}`);
    console.log('Run "pnpm arch:capabilities" to regenerate. Run "pnpm arch:deps" for full dependency direction validation.');
  } else {
    console.log('\nCapability matrix not generated. Run "pnpm arch:capabilities" first.');
  }

  console.log('\n=== End inspection ===\n');
}

main();
