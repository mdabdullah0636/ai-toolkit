import { platformRegistry } from './platform';

export interface Template {
  name: string;
  title: string;
  category: string;
  categoryOrder: number;
  framework: string;
  primaryProvider: string | null;
  description: string;
  tags: string[];
  path: string;
  githubUrl: string;
}

export interface TemplateCategory {
  id: string;
  order: number;
  title: string;
  description: string;
  templates: Template[];
}

const GITHUB_ROOT = 'https://github.com/khulnasoft/ai-toolkit/tree/main';

const categoryMetadata: Record<string, Omit<TemplateCategory, 'templates'>> = {
  '01-foundations': {
    id: '01-foundations',
    order: 1,
    title: 'Foundations',
    description:
      'Core SDK concepts and basic server integrations without a specific framework.',
  },
  '02-framework-integration': {
    id: '02-framework-integration',
    order: 2,
    title: 'Framework Integration',
    description:
      'Framework-specific apps: Next.js, React, Angular, Vue, Nuxt, NestJS, and LangChain.',
  },
  '03-integrations': {
    id: '03-integrations',
    order: 3,
    title: 'Integrations',
    description:
      'Provider, observability, security, and protocol integrations.',
  },
  '04-tools': {
    id: '04-tools',
    order: 4,
    title: 'Tools',
    description: 'Developer tools and interactive playgrounds.',
  },
};

export function getTemplateCategories(): TemplateCategory[] {
  const templates = getAllTemplates();
  return Object.values(categoryMetadata)
    .sort((a, b) => a.order - b.order)
    .map(category => ({
      ...category,
      templates: templates.filter(
        template => template.category === category.id,
      ),
    }));
}

export function getAllTemplates(): Template[] {
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
