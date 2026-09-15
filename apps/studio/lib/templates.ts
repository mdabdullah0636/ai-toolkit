import { platformRegistry } from './platform';
import type { TemplateEntry } from './types';

const GITHUB_ROOT = 'https://github.com/khulnasoft/ai-toolkit/tree/main';

export function getTemplates(): TemplateEntry[] {
  return platformRegistry.all({ type: 'template' }).flatMap(record => {
    if (record.type !== 'template') return [];
    return [
      {
        name: record.slug,
        title: record.name,
        category: record.category,
        categoryOrder: record.categoryOrder,
        framework: record.framework,
        primaryProvider:
          record.primaryProviderId?.replace(/^provider:/, '') ?? null,
        description: record.description,
        tags: record.tags,
        path: record.sourcePath,
        githubUrl: `${GITHUB_ROOT}/${record.sourcePath}`,
      },
    ];
  });
}

export const frameworkLabels: Record<string, string> = {
  nextjs: 'Next.js',
  react: 'React',
  vue: 'Vue',
  nuxt: 'Nuxt',
  angular: 'Angular',
  svelte: 'Svelte',
  nest: 'NestJS',
  express: 'Express',
  fastify: 'Fastify',
  hono: 'Hono',
  node: 'Node.js',
  'multi-provider': 'Multi-provider',
  'nextjs-full-stack': 'Next.js',
};

export function getTemplateFrameworks(): string[] {
  return Array.from(
    new Set(getTemplates().map(template => template.framework)),
  );
}
