import { platformRegistry } from './platform';

export type GatewayModelModality = 'language' | 'embedding' | 'image';

export interface GatewayModel {
  id: string;
  provider: string;
  modality: GatewayModelModality;
}

export interface GatewayModelProvider {
  id: string;
  name: string;
  count: number;
}

export function getGatewayModels(): GatewayModel[] {
  return platformRegistry.all({ type: 'model' }).flatMap(record => {
    if (record.type !== 'model') return [];
    return [
      {
        id: record.providerModelId,
        provider: record.providerId.replace(/^provider:/, ''),
        modality: record.modality,
      },
    ];
  });
}

export function getGatewayModelCounts(): Record<GatewayModelModality, number> {
  return getGatewayModels().reduce<Record<GatewayModelModality, number>>(
    (counts, model) => {
      counts[model.modality]++;
      return counts;
    },
    { language: 0, embedding: 0, image: 0 },
  );
}

export function getGatewayModelProviders(): GatewayModelProvider[] {
  const counts = new Map<string, number>();
  for (const model of getGatewayModels()) {
    counts.set(model.provider, (counts.get(model.provider) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([id, count]) => ({
      id,
      name: platformRegistry.get(`provider:${id}`)?.name ?? id,
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
