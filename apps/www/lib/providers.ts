import { platformRegistry } from './platform';

export type ProviderCategoryId =
  | 'ai-toolkit'
  | 'openai-compatible'
  | 'community'
  | 'adapters'
  | 'observability';

export interface Provider {
  slug: string;
  name: string;
  description: string;
  filename: string;
}

export interface ProviderCategory {
  id: ProviderCategoryId;
  docsSlug: string;
  dir: string;
  eyebrow: string;
  title: string;
  description: string;
}

export const providerCategories: ProviderCategory[] = [
  {
    id: 'ai-toolkit',
    docsSlug: 'ai-toolkit-providers',
    dir: '01-ai-toolkit-providers',
    eyebrow: 'AI TOOLKIT PROVIDERS',
    title: 'First-party providers.',
    description:
      'Model providers maintained by the AI TOOLKIT team. Connect to OpenAI, Anthropic, Google, Amazon Bedrock, and more with a single consistent interface.',
  },
  {
    id: 'openai-compatible',
    docsSlug: 'openai-compatible-providers',
    dir: '02-openai-compatible-providers',
    eyebrow: 'OPENAI-COMPATIBLE PROVIDERS',
    title: 'Drop-in OpenAI-compatible providers.',
    description:
      'Wire any OpenAI-compatible endpoint into the AI TOOLKIT — self-hosted, managed, and everything in between.',
  },
  {
    id: 'community',
    docsSlug: 'community-providers',
    dir: '03-community-providers',
    eyebrow: 'COMMUNITY PROVIDERS',
    title: 'Providers built by the community.',
    description:
      'Community-maintained providers for models and platforms beyond the first-party set, all through the same primitives.',
  },
  {
    id: 'adapters',
    docsSlug: 'adapters',
    dir: '04-adapters',
    eyebrow: 'FRAMEWORK ADAPTERS',
    title: 'Use your favorite frameworks.',
    description:
      'Adapters that bridge LangChain and LlamaIndex to the AI TOOLKIT so you can combine ecosystems in one app.',
  },
  {
    id: 'observability',
    docsSlug: 'observability',
    dir: '05-observability',
    eyebrow: 'OBSERVABILITY',
    title: 'Trace, monitor, and evaluate.',
    description:
      'Instrument every generation with tracing, logging, evals, and analytics from the tools your team already uses.',
  },
];

export function getProviderCategory(categoryId: ProviderCategoryId) {
  return providerCategories.find(category => category.id === categoryId);
}

export function getProviders(categoryId: ProviderCategoryId): Provider[] {
  return platformRegistry.all({ type: 'provider' }).flatMap(record => {
    if (record.type !== 'provider' || record.category !== categoryId) return [];
    return [
      {
        slug: record.slug,
        name: record.name,
        description: record.description,
        filename: record.source.path.split('/').pop() ?? `${record.slug}.mdx`,
      },
    ];
  });
}

export function getProviderCategoriesWithCounts() {
  return providerCategories.map(category => ({
    ...category,
    count: getProviders(category.id).length,
  }));
}
