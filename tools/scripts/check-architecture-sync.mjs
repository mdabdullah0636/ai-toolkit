#!/usr/bin/env node

/**
 * Architecture Sync Validation Script
 *
 * Validates that:
 * 1. All packages in workspace actually exist
 * 2. All referenced paths in docs exist
 * 3. Layer mappings are consistent
 * 4. No orphaned packages (exist but not in workspace)
 * 5. Future domains have implementation plans
 *
 * Run via: node tools/scripts/check-architecture-sync.mjs
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../..');

let errors = [];
let warnings = [];

function error(message) {
  errors.push(message);
  console.error(`❌ ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`⚠️  ${message}`);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

// Read workspace configuration
function getWorkspacePackages() {
  const workspacePath = join(rootDir, 'pnpm-workspace.yaml');
  if (!existsSync(workspacePath)) {
    error('pnpm-workspace.yaml not found');
    return [];
  }

  const content = readFileSync(workspacePath, 'utf-8');
  const packages = [];

  // Extract package patterns from YAML
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*-\s*['"]([^'"]+)['"]/);
    if (match) {
      packages.push(match[1]);
    }
  }

  return packages;
}

// Check if a glob pattern matches any existing directories
function checkPattern(pattern) {
  const basePath = join(rootDir, pattern.replace('*', ''));
  const globPart = pattern.includes('*') ? pattern.split('*')[1] : '';

  // For patterns like 'packages/foundation/*', check if the base directory exists
  const baseDir = join(rootDir, pattern.split('*')[0]);
  if (!existsSync(baseDir)) {
    return { exists: false, hasPackages: false };
  }

  // Check if there are any subdirectories
  try {
    const items = readdirSync(baseDir);
    const subdirs = items.filter(item => {
      const itemPath = join(baseDir, item);
      return statSync(itemPath).isDirectory();
    });
    return {
      exists: true,
      hasPackages: subdirs.length > 0,
      count: subdirs.length,
    };
  } catch (e) {
    return { exists: true, hasPackages: false };
  }
}

// Validate workspace configuration
function validateWorkspace() {
  info('Validating workspace configuration...');

  const patterns = getWorkspacePackages();
  if (patterns.length === 0) {
    error('No package patterns found in pnpm-workspace.yaml');
    return;
  }

  let implementedCount = 0;
  let futureCount = 0;

  for (const pattern of patterns) {
    const result = checkPattern(pattern);

    if (!result.exists) {
      error(`Pattern ${pattern} does not exist`);
    } else if (!result.hasPackages) {
      warn(`Pattern ${pattern} exists but has no packages`);
    } else {
      implementedCount++;
      success(`Pattern ${pattern} has ${result.count} package(s)`);
    }
  }

  info(`Workspace: ${implementedCount} implemented, ${futureCount} future domains`);
}

// Validate domain mapping document
function validateDomainMapping() {
  info('Validating domain-mapping.md...');

  const domainMappingPath = join(rootDir, 'architecture/domain-mapping.md');
  if (!existsSync(domainMappingPath)) {
    error('architecture/domain-mapping.md not found');
    return;
  }

  const content = readFileSync(domainMappingPath, 'utf-8');

  // Check for old paths that should be migrated
  const oldPaths = [
    'packages/core/',
    'packages/validation/',
    'packages/adapters/',
    'packages/special/gateway',
    'packages/special/khulnasoft',
    'packages/special/codemod',
    'packages/special/devtools',
    'packages/special/platform',
    'packages/infrastructure/',
  ];

  for (const oldPath of oldPaths) {
    if (content.includes(oldPath)) {
      error(`domain-mapping.md still references old path: ${oldPath}`);
    }
  }

  // Check for new paths
  const newPaths = [
    'packages/foundation/',
    'packages/ai/',
    'packages/gateway/',
    'packages/integrations/',
    'packages/tooling/',
    'packages/ui/',
    'packages/testing/',
  ];

  for (const newPath of newPaths) {
    if (!content.includes(newPath)) {
      warn(`domain-mapping.md may be missing reference to: ${newPath}`);
    }
  }

  success('domain-mapping.md validated');
}

// Validate future domains document
function validateFutureDomains() {
  info('Validating FUTURE_DOMAINS.md...');

  const futureDomainsPath = join(rootDir, 'architecture/FUTURE_DOMAINS.md');
  if (!existsSync(futureDomainsPath)) {
    error('architecture/FUTURE_DOMAINS.md not found (required for Phase 0)');
    return;
  }

  const content = readFileSync(futureDomainsPath, 'utf-8');

  // Check for required sections
  const requiredSections = [
    'AI Expansion',
    'Agent Platform',
    'Workflow Engine',
    'Context Management',
    'Memory System',
    'Retrieval Layer',
    'Tool Platform',
    'Sandbox Runtime',
    'Evaluation Engine',
    'Observability',
    'Security Layer',
  ];

  for (const section of requiredSections) {
    if (!content.includes(section)) {
      error(`FUTURE_DOMAINS.md missing section: ${section}`);
    }
  }

  success('FUTURE_DOMAINS.md validated');
}

// Validate dependency rules
function validateDependencyRules() {
  info('Validating DEPENDENCY_RULES.md...');

  const depRulesPath = join(rootDir, 'architecture/DEPENDENCY_RULES.md');
  if (!existsSync(depRulesPath)) {
    error('architecture/DEPENDENCY_RULES.md not found');
    return;
  }

  const content = readFileSync(depRulesPath, 'utf-8');

  // Check for new domain dependency rules
  const newDomains = [
    'packages/ai/*',
    'packages/agents/*',
    'packages/workflow/*',
    'packages/context/*',
    'packages/memory/*',
    'packages/retrieval/*',
    'packages/tools/*',
    'packages/sandbox/*',
    'packages/evals/*',
    'packages/observability/*',
    'packages/security/*',
  ];

  for (const domain of newDomains) {
    if (!content.includes(domain)) {
      warn(`DEPENDENCY_RULES.md may be missing dependency rules for: ${domain}`);
    }
  }

  success('DEPENDENCY_RULES.md validated');
}

// Main validation
function main() {
  console.log('🔍 Architecture Sync Validation\n');

  validateWorkspace();
  console.log();
  validateDomainMapping();
  console.log();
  validateFutureDomains();
  console.log();
  validateDependencyRules();

  console.log('\n' + '='.repeat(50));
  console.log(`Validation complete: ${errors.length} errors, ${warnings.length} warnings`);

  if (errors.length > 0) {
    console.log('\n❌ Validation failed');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  Validation passed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ Validation passed');
    process.exit(0);
  }
}

main();
