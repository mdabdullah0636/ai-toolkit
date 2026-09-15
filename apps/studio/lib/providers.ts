import { platformRegistry } from './platform';
import type { ProviderCatalogEntry } from './types';

const providerCategories: { id: string; title: string }[] = [
  { id: 'ai-toolkit', title: 'AI Toolkit providers' },
  { id: 'openai-compatible', title: 'OpenAI-compatible providers' },
  { id: 'community', title: 'Community providers' },
  { id: 'adapters', title: 'Framework adapters' },
  { id: 'observability', title: 'Observability' },
  { id: 'gateway-model', title: 'Gateway model providers' },
];

export function getProviders(): ProviderCatalogEntry[] {
  return platformRegistry.all({ type: 'provider' }).flatMap(record => {
    if (record.type !== 'provider') return [];
    const category = providerCategories.find(
      item => item.id === record.category,
    );
    return [
      {
        slug: record.slug,
        name: record.name,
        description: record.description,
        category: record.category,
        categoryTitle: category?.title ?? record.category,
      },
    ];
  });
}

export function getProviderCategoryTitles(): { id: string; title: string }[] {
  return providerCategories;
}
