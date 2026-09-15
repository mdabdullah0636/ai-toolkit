#!/usr/bin/env node

/**
 * Generates a machine-readable capability matrix from provider source code.
 *
 * Scans each provider's `-provider.ts` interface to detect supported model
 * types (LanguageModelV3, EmbeddingModelV3, ImageModelV3, etc.) and maps
 * them to ModelCapability categories. Also reads gateway model settings
 * files for the full model catalog.
 *
 * Output: build/capability-matrix.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PACKAGES = path.join(ROOT, 'packages');
const OUT_FILE = path.join(ROOT, 'build', 'capability-matrix.json');

const MODEL_TYPE_TO_CAPABILITY = {
  LanguageModelV3: 'chat',
  EmbeddingModelV3: 'embedding',
  ImageModelV3: 'image',
  SpeechModelV3: 'speech',
  TranscriptionModelV3: 'speech',
  RerankingModelV3: 'reranker',
  VideoModelV3: 'video',
};

const ALL_CAPABILITIES = [
  'chat', 'vision', 'embedding', 'speech', 'audio',
  'reasoning', 'image', 'video', 'reranker', 'moderation', 'ocr', 'translation',
];

const GATEWAY_MODEL_ID_FILES = [
  'gateway-language-model-settings.ts',
  'gateway-embedding-model-settings.ts',
  'gateway-image-model-settings.ts',
];

// Packages that are not providers (UI, tooling, infrastructure, etc.)
const SKIP_PACKAGES = new Set([
  '@ai-toolkit/test-server',
  '@ai-toolkit/devtools',
  '@ai-toolkit/codemod',
  '@ai-toolkit/platform',
  '@ai-toolkit/design',
  '@ai-toolkit/elements',
  '@ai-toolkit/shadcn-ui',
  '@ai-toolkit/react',
  '@ai-toolkit/rsc',
  '@ai-toolkit/vue',
  '@ai-toolkit/angular',
  '@ai-toolkit/svelte',
  '@ai-toolkit/langchain',
  '@ai-toolkit/llamaindex',
  '@ai-toolkit/mcp',
  '@ai-toolkit/capabilities',
  '@ai-toolkit/provider',
  '@ai-toolkit/valibot',
  'ai-toolkit',
]);

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function getProviderDirs() {
  const dirs = [];

  // Scan all provider packages
  const providersDir = path.join(PACKAGES, 'providers');
  if (fs.existsSync(providersDir)) {
    for (const entry of fs.readdirSync(providersDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || !entry.isDirectory()) continue;
      dirs.push(path.join(providersDir, entry.name));
    }
  }

  // Include gateway (now in core)
  const gatewayDir = path.join(PACKAGES, 'core', 'gateway');
  if (fs.existsSync(gatewayDir)) dirs.push(gatewayDir);

  // Include special packages (khulnasoft, etc.)
  const specialDir = path.join(PACKAGES, 'special');
  if (fs.existsSync(specialDir)) {
    for (const entry of fs.readdirSync(specialDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || !entry.isDirectory()) continue;
      dirs.push(path.join(specialDir, entry.name));
    }
  }

  // Include openai-compatible (hub provider)
  const ocDir = path.join(providersDir, 'openai-compatible');
  if (!dirs.some(d => d === ocDir) && fs.existsSync(ocDir)) dirs.push(ocDir);

  return dirs;
}

function findProviderSource(dir) {
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) return null;

  const entries = fs.readdirSync(srcDir);
  // Prefer *-provider.ts (but not test files)
  const providerTs = entries.find(e => e.endsWith('-provider.ts') && !e.endsWith('.test.ts'));
  if (providerTs) return path.join(srcDir, providerTs);

  // Fall back to index.ts
  const indexTs = path.join(srcDir, 'index.ts');
  if (fs.existsSync(indexTs)) return indexTs;

  return null;
}

function detectCapabilitiesFromSource(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const capabilities = new Set();

  for (const [modelType, capability] of Object.entries(MODEL_TYPE_TO_CAPABILITY)) {
    // Match patterns like ": LanguageModelV3" or "=> LanguageModelV3" or "(modelId): LanguageModelV3"
    const pattern = new RegExp(`[:\(]\\s*${modelType}\\b`, 'g');
    if (pattern.test(content)) {
      capabilities.add(capability);
    }
  }

  return [...capabilities].sort();
}

function extractGatewayModels() {
  const models = [];
  const gatewaySrc = path.join(PACKAGES, 'core', 'gateway', 'src');
  if (!fs.existsSync(gatewaySrc)) return models;

  for (const file of GATEWAY_MODEL_ID_FILES) {
    const filePath = path.join(gatewaySrc, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    // Find the type declaration (export type Gateway... = ...)
    const typeMatch = content.match(/export type Gateway\w+\s*=[^;]*;/);
    if (!typeMatch) continue;

    // Extract model ID strings
    const idMatches = [...typeMatch[0].matchAll(/'([^']+)'/g)];
    const modality = file.includes('language') ? 'language'
      : file.includes('embedding') ? 'embedding'
      : file.includes('image') ? 'image'
      : 'unknown';

    for (const m of idMatches) {
      const [providerSlug, modelSlug] = m[1].split('/');
      models.push({
        id: m[1],
        provider: providerSlug,
        model: modelSlug,
        modality,
      });
    }
  }
  return models;
}

function buildCapabilityMatrix() {
  const providers = [];
  const providerDirs = getProviderDirs();

  for (const dir of providerDirs) {
    const manifest = readJson(path.join(dir, 'package.json'));
    if (!manifest || !manifest.name) continue;

    // Skip non-provider packages
    if (SKIP_PACKAGES.has(manifest.name)) continue;

    const providerFile = findProviderSource(dir);
    const relDir = path.relative(PACKAGES, dir).split(path.sep).join('/');

    if (!providerFile) {
      providers.push({
        name: manifest.name,
        dir: relDir,
        capabilities: [],
        source: null,
      });
      continue;
    }

    const capabilities = detectCapabilitiesFromSource(providerFile);
    providers.push({
      name: manifest.name,
      dir: relDir,
      capabilities,
      source: path.relative(ROOT, providerFile).split(path.sep).join('/'),
    });
  }

  const gatewayModels = extractGatewayModels();

  // Build capability summary
  const matrix = {};
  for (const capability of ALL_CAPABILITIES) {
    matrix[capability] = providers
      .filter(p => p.capabilities.includes(capability))
      .map(p => p.name)
      .sort();
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    providers: providers.sort((a, b) => a.name.localeCompare(b.name)),
    capabilities: matrix,
    gatewayModels: {
      total: gatewayModels.length,
      byProvider: gatewayModels.reduce((acc, m) => {
        acc[m.provider] = (acc[m.provider] || 0) + 1;
        return acc;
      }, {}),
      byModality: gatewayModels.reduce((acc, m) => {
        acc[m.modality] = (acc[m.modality] || 0) + 1;
        return acc;
      }, {}),
    },
  };
}

function main() {
  const matrix = buildCapabilityMatrix();

  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });

  if (process.argv.includes('--check')) {
    if (!fs.existsSync(OUT_FILE)) {
      console.error(`Missing ${path.relative(ROOT, OUT_FILE)}; run pnpm arch:capabilities`);
      process.exit(1);
    }
    const committed = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
    const same =
      JSON.stringify(committed.providers) === JSON.stringify(matrix.providers) &&
      JSON.stringify(committed.capabilities) === JSON.stringify(matrix.capabilities) &&
      JSON.stringify(committed.gatewayModels) === JSON.stringify(matrix.gatewayModels);
    if (!same) {
      console.error(`Stale capability matrix: ${path.relative(ROOT, OUT_FILE)} is out of date. Run \`pnpm arch:capabilities\` and commit.`);
      process.exit(1);
    }
    console.log(`Capability matrix is fresh (${matrix.providers.length} providers, ${Object.values(matrix.capabilities).flat().length} capability entries).`);
    return;
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(matrix, null, 2) + '\n');

  console.log('\nCapability Matrix\n');
  console.log(`Providers scanned: ${matrix.providers.length}`);
  console.log('');
  for (const [capability, providerList] of Object.entries(matrix.capabilities)) {
    if (providerList.length > 0) {
      console.log(`${capability} (${providerList.length}): ${providerList.join(', ')}`);
    }
  }
  console.log(`\nGateway models: ${matrix.gatewayModels.total}`);
  console.log(`Wrote ${path.relative(ROOT, OUT_FILE)}`);
}

main();
