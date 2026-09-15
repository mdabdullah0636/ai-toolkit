#!/usr/bin/env node

/**
 * Verifies dependency contracts between harness packages and the harness adapter.
 *
 * The harness hierarchy must follow these rules:
 *
 *   @ai-toolkit/harness          (base contracts)  — provider only, NO harness-acp
 *   @ai-toolkit/harness-acp      (adapter)          — provider + provider-utils, NO per-agent harnesses
 *   @ai-toolkit/harness-<agent>  (profiles)         — harness-acp + provider + provider-utils, NO other harness-<agent>
 *
 * Run with: pnpm verify-harness-adapter-deps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PROVIDERS_DIR = path.join(ROOT, 'packages', 'providers');

const HARNESS_BASE = '@ai-toolkit/harness';
const HARNESS_ADAPTER = '@ai-toolkit/harness-acp';
const HARNESS_REQUIRED_DEPS = ['@ai-toolkit/provider', '@ai-toolkit/provider-utils'];
const HARNESS_BASE_REQUIRED_DEPS = ['@ai-toolkit/provider'];
const HARNESS_ADAPTER_REQUIRED_DEPS = [
  '@ai-toolkit/provider',
  '@ai-toolkit/provider-utils',
];
// Per-agent harness profile packages (e.g. harness-claude-code, harness-pi, …)
// Excludes base (@ai-toolkit/harness) and adapter (@ai-toolkit/harness-acp).
const isHarnessProfile = name =>
  name.startsWith('@ai-toolkit/harness-') &&
  name !== HARNESS_BASE &&
  name !== HARNESS_ADAPTER;

const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return undefined;
  }
}

function getHarnessPackages() {
  const packages = [];
  if (!fs.existsSync(PROVIDERS_DIR)) return packages;
  for (const entry of fs.readdirSync(PROVIDERS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('harness')) continue;
    const dir = path.join(PROVIDERS_DIR, entry.name);
    const pkgPath = path.join(dir, 'package.json');
    if (!fs.existsSync(pkgPath)) continue;
    const manifest = readJson(pkgPath);
    if (!manifest || !manifest.name) continue;
    packages.push({
      name: manifest.name,
      dir,
      manifest,
      dependencies: {
        ...manifest.dependencies,
        ...manifest.optionalDependencies,
      },
    });
  }
  return packages;
}

function hasDependency(pkg, targetName) {
  return Object.keys(pkg.dependencies).includes(targetName);
}

function validate(packages) {
  for (const pkg of packages) {
    if (pkg.name === HARNESS_BASE) {
      if (hasDependency(pkg, HARNESS_ADAPTER)) {
        errors.push(
          `${HARNESS_BASE} must NOT depend on ${HARNESS_ADAPTER} (it is the base layer; adapter depends on it, not vice versa)`,
        );
      }
      for (const dep of HARNESS_BASE_REQUIRED_DEPS) {
        if (!hasDependency(pkg, dep)) {
          errors.push(
            `${HARNESS_BASE} must depend on ${dep}`,
          );
        }
      }
      const agentDeps = Object.keys(pkg.dependencies).filter(isHarnessProfile);
      if (agentDeps.length > 0) {
        errors.push(
          `${HARNESS_BASE} must NOT depend on per-agent harness profiles: ${agentDeps.join(', ')}`,
        );
      }
    }

    if (pkg.name === HARNESS_ADAPTER) {
      for (const dep of HARNESS_ADAPTER_REQUIRED_DEPS) {
        if (!hasDependency(pkg, dep)) {
          errors.push(
            `${HARNESS_ADAPTER} must depend on ${dep}`,
          );
        }
      }
      const agentDeps = Object.keys(pkg.dependencies).filter(isHarnessProfile);
      if (agentDeps.length > 0) {
        errors.push(
          `${HARNESS_ADAPTER} must NOT depend on per-agent harness profiles (prevents circular deps): ${agentDeps.join(', ')}`,
        );
      }
      if (hasDependency(pkg, HARNESS_BASE)) {
        errors.push(
          `${HARNESS_ADAPTER} must NOT depend on ${HARNESS_BASE} directly (use provider/provider-utils for contracts)`,
        );
      }
    }

    if (isHarnessProfile(pkg.name)) {
      if (!hasDependency(pkg, HARNESS_ADAPTER)) {
        errors.push(
          `${pkg.name} must depend on ${HARNESS_ADAPTER} (per-agent harness profiles go through the ACP adapter)`,
        );
      }
      for (const dep of HARNESS_REQUIRED_DEPS) {
        if (!hasDependency(pkg, dep)) {
          errors.push(
            `${pkg.name} must depend on ${dep}`,
          );
        }
      }
      const otherProfileDeps = Object.keys(pkg.dependencies).filter(
        n => isHarnessProfile(n) && n !== pkg.name,
      );
      if (otherProfileDeps.length > 0) {
        errors.push(
          `${pkg.name} must NOT depend on other harness profiles: ${otherProfileDeps.join(', ')}`,
        );
      }
    }
  }
}

function printReport(packages) {
  console.log('\nHarness Adapter Dependency Verification\n');
  console.log(`Harness packages found: ${packages.length}\n`);

  for (const pkg of packages) {
    const deps = Object.keys(pkg.dependencies).sort();
    console.log(`  ${pkg.name}`);
    console.log(`    dependencies: ${deps.join(', ') || '(none)'}`);
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (errors.length) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('\nFix the dependency structure above.');
    process.exit(1);
  } else {
    console.log('\n✅ All harness adapter dependency checks passed.');
  }
}

const packages = getHarnessPackages();
if (packages.length === 0) {
  console.error('No harness packages found in packages/providers/');
  process.exit(1);
}

validate(packages);
printReport(packages);
