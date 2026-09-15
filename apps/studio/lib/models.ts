import { metricFor } from './metrics';
import { platformRegistry } from './platform';
import type { Metric } from './types';

export type Modality = 'language' | 'embedding' | 'image';

export interface ModelEntry {
  id: string;
  provider: string;
  providerName: string;
  modality: Modality;
  capabilities: string[];
}

function getGatewayModels(): ModelEntry[] {
  return platformRegistry.all({ type: 'model' }).flatMap(record => {
    if (record.type !== 'model') return [];
    const provider = record.providerId.replace(/^provider:/, '');
    const providerRecord = platformRegistry.get(record.providerId);
    return [
      {
        id: record.providerModelId,
        provider,
        providerName: providerRecord?.name ?? provider,
        modality: record.modality,
        capabilities: record.capabilities,
      },
    ];
  });
}

export { getGatewayModels };

export function getModelCounts(): Record<Modality, number> {
  return getGatewayModels().reduce<Record<Modality, number>>(
    (counts, model) => {
      counts[model.modality]++;
      return counts;
    },
    { language: 0, embedding: 0, image: 0 },
  );
}

export function getModelProviders(): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const model of getGatewayModels()) {
    counts.set(model.providerName, (counts.get(model.providerName) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getModelMetrics(id: string): Metric {
  return metricFor(`model:${id}`);
}

export function providerModalityDistribution(): {
  name: string;
  count: number;
}[] {
  return getModelProviders();
}
