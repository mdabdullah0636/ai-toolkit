import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import gatewayRegistry from '../../../../content/gateways-registry/registry';
import toolRegistry from '../../../../content/tools-registry/registry';
import type { Gateway } from '../../../../content/gateways-registry/registry';
import type { Tool } from '../../../../content/tools-registry/registry';
import type {
  GatewayRecord,
  ModelModality,
  ModelRecord,
  PlatformLink,
  PlatformRecordUnion,
  PlatformRegistrySnapshot,
  ProviderRecord,
  RecipeRecord,
  TemplateRecord,
  ToolRecord,
} from '../src/index';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const GENERATED_AT = '2026-09-14T00:00:00.000Z';
const SOURCE_DATE = '2026-09-14';
const GITHUB_ROOT = 'https://github.com/khulnasoft/ai-toolkit/tree/main';
const providerCategoryIds: Record<string, string> = {
  '01-ai-toolkit-providers': 'ai-toolkit',
  '02-openai-compatible-providers': 'openai-compatible',
  '03-community-providers': 'community',
  '04-adapters': 'adapters',
  '05-observability': 'observability',
};
const { gateways } = gatewayRegistry as unknown as {
  gateways: Gateway[];
};
const { tools } = toolRegistry as unknown as { tools: Tool[] };

function dirname(filePath: string): string {
  return resolve(filePath, '..');
}

function sourcePath(filePath: string): string {
  return relative(ROOT, filePath).split('\\').join('/');
}

function linksFrom(values: Record<string, string | undefined>): PlatformLink[] {
  return Object.entries(values)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, href]) => ({ label, href }));
}

function baseRecord(input: {
  id: string;
  type: PlatformRecordUnion['type'];
  slug: string;
  name: string;
  description: string;
  tags?: string[];
  links?: PlatformLink[];
  source: { path: string; kind: 'content' | 'registry' | 'package-source' };
}) {
  return {
    id: input.id,
    type: input.type,
    slug: input.slug,
    name: input.name,
    description: input.description,
    status: 'active' as const,
    tags: input.tags ?? [],
    links: input.links ?? [],
    source: input.source,
    updatedAt: SOURCE_DATE,
  };
}

function gatewayRecord(gateway: Gateway): GatewayRecord {
  return {
    ...baseRecord({
      id: `gateway:${gateway.slug}`,
      type: 'gateway',
      slug: gateway.slug,
      name: gateway.name,
      description: gateway.description,
      tags: gateway.tags,
      links: linksFrom({
        docs: gateway.docsUrl,
        apiKey: gateway.apiKeyUrl,
        website: gateway.websiteUrl,
        npm: gateway.npmUrl,
      }),
      source: {
        path: 'content/gateways-registry/registry.ts',
        kind: 'registry',
      },
    }),
    developer: gateway.developer,
    packageName: gateway.packageName,
    installCommands: gateway.installCommand,
    codeExample: gateway.codeExample,
  };
}

function toolRecord(tool: Tool): ToolRecord {
  return {
    ...baseRecord({
      id: `tool:${tool.slug}`,
      type: 'tool',
      slug: tool.slug,
      name: tool.name,
      description: tool.description,
      tags: tool.tags,
      links: linksFrom({
        docs: tool.docsUrl,
        apiKey: tool.apiKeyUrl,
        website: tool.websiteUrl,
        npm: tool.npmUrl,
      }),
      source: { path: 'content/tools-registry/registry.ts', kind: 'registry' },
    }),
    packageName: tool.packageName,
    installCommands: tool.installCommand,
    codeExample: tool.codeExample,
  };
}

function templates(): TemplateRecord[] {
  const registry = JSON.parse(
    readFileSync(join(ROOT, 'examples/registry.json'), 'utf8'),
  ) as {
    examples: Array<{
      name: string;
      title: string;
      framework: string;
      category: string;
      categoryOrder: number;
      primaryProvider: string | null;
      description: string;
      tags: string[];
      path: string;
    }>;
  };

  return registry.examples.map(template => ({
    ...baseRecord({
      id: `template:${template.name}`,
      type: 'template',
      slug: template.name,
      name: template.title,
      description: template.description,
      tags: template.tags,
      links: [{ label: 'github', href: `${GITHUB_ROOT}/${template.path}` }],
      source: { path: 'examples/registry.json', kind: 'registry' },
    }),
    framework: template.framework,
    category: template.category,
    categoryOrder: template.categoryOrder,
    primaryProviderId: template.primaryProvider
      ? `provider:${template.primaryProvider}`
      : null,
    sourcePath: template.path,
  }));
}

function frontmatter(source: string, field: string): string | undefined {
  const value = source.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1];
  return value?.trim().replace(/^['"]|['"]$/g, '');
}

function contentFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const filePath = join(root, entry.name);
    if (entry.isDirectory()) return contentFiles(filePath);
    return entry.name.endsWith('.mdx') && entry.name !== 'index.mdx'
      ? [filePath]
      : [];
  });
}

function duplicateProviderSlugs(root: string): Set<string> {
  const slugs = new Map<string, number>();
  for (const filePath of contentFiles(root)) {
    const slug = filePath
      .replace(/\.mdx$/, '')
      .split('/')
      .pop()!
      .replace(/^\d+-/, '');
    slugs.set(slug, (slugs.get(slug) ?? 0) + 1);
  }
  return new Set(
    [...slugs.entries()].filter(([, count]) => count > 1).map(([slug]) => slug),
  );
}

function providers(): ProviderRecord[] {
  const root = join(ROOT, 'content/providers');
  const duplicateSlugs = duplicateProviderSlugs(root);
  return contentFiles(root).map(filePath => {
    const slug = filePath
      .replace(/\.mdx$/, '')
      .split('/')
      .pop()!
      .replace(/^\d+-/, '');
    const categoryDirectory = filePath.split('/').at(-2) ?? '';
    const category = providerCategoryIds[categoryDirectory] ?? 'other';
    const source = readFileSync(filePath, 'utf8');
    const providerSlug = duplicateSlugs.has(slug)
      ? `${category}/${slug}`
      : slug;
    return {
      ...baseRecord({
        id: `provider:${providerSlug}`,
        type: 'provider',
        slug,
        name: frontmatter(source, 'title') ?? slug,
        description: frontmatter(source, 'description') ?? '',
        source: { path: sourcePath(filePath), kind: 'content' },
      }),
      category,
      capabilities: [],
    };
  });
}

function models(): ModelRecord[] {
  const root = join(ROOT, 'packages/core/gateway/src');
  const files: Array<[ModelModality, string]> = [
    ['language', 'gateway-language-model-settings.ts'],
    ['embedding', 'gateway-embedding-model-settings.ts'],
    ['image', 'gateway-image-model-settings.ts'],
  ];

  return files.flatMap(([modality, fileName]) => {
    const filePath = join(root, fileName);
    const source = readFileSync(filePath, 'utf8');
    return [...source.matchAll(/^\s*\|\s*'([^']+)'/gm)].map(match => {
      const provider = match[1].split('/')[0];
      return {
        ...baseRecord({
          id: `model:${provider}/${modality}/${match[1].slice(provider.length + 1)}`,
          type: 'model',
          slug: match[1],
          name: match[1],
          description: `${modality} model available through the AI TOOLKIT gateway.`,
          source: { path: sourcePath(filePath), kind: 'package-source' },
        }),
        providerId: `provider:${provider}`,
        providerModelId: match[1],
        modality,
        capabilities: [],
      };
    });
  });
}

function recipes(): RecipeRecord[] {
  const root = join(ROOT, 'content/cookbook');
  return contentFiles(root).map(filePath => {
    const source = readFileSync(filePath, 'utf8');
    const slug = filePath
      .replace(/\.mdx$/, '')
      .split('/')
      .pop()!
      .replace(/^\d+-/, '');
    const category =
      filePath.split('/').at(-2)?.replace(/^\d+-/, '') ?? 'guides';
    const description = frontmatter(source, 'description') ?? '';
    return {
      ...baseRecord({
        id: `recipe:${category}/${slug}`,
        type: 'recipe',
        slug,
        name: frontmatter(source, 'title') ?? slug,
        description,
        source: { path: sourcePath(filePath), kind: 'content' },
      }),
      category,
      contentPath: sourcePath(filePath),
      readTimeMinutes: Math.max(1, Math.ceil(source.split(/\s+/).length / 200)),
    };
  });
}

function generate(): PlatformRegistrySnapshot {
  const providerRecords = providers();
  const modelRecords = models();
  const knownProviders = new Set(providerRecords.map(record => record.id));

  for (const model of modelRecords) {
    if (knownProviders.has(model.providerId)) continue;
    providerRecords.push({
      ...baseRecord({
        id: model.providerId,
        type: 'provider',
        slug: model.providerId.replace('provider:', ''),
        name: model.providerId.replace('provider:', ''),
        description: 'Provider represented by gateway model metadata.',
        source: {
          path: 'packages/core/gateway/src',
          kind: 'package-source',
        },
      }),
      category: 'gateway-model',
      capabilities: [],
    });
    knownProviders.add(model.providerId);
  }

  return {
    schemaVersion: 1,
    registryVersion: 'source-baseline-v1',
    generatedAt: GENERATED_AT,
    records: [
      ...providerRecords,
      ...modelRecords,
      ...gateways.map(gatewayRecord),
      ...tools.map(toolRecord),
      ...templates(),
      ...recipes(),
    ],
  };
}

const output = join(ROOT, 'build/platform-registry.json');
mkdirSync(resolve(output, '..'), { recursive: true });
writeFileSync(output, `${JSON.stringify(generate(), null, 2)}\n`);
console.log(`Wrote ${sourcePath(output)}`);
