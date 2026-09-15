import { metricFor } from './metrics';
import { platformRegistry } from './platform';
import type { Metric } from './types';

export interface Gateway {
  slug: string;
  name: string;
  developer: string;
  description: string;
  packageName: string;
  tags?: string[];
  apiKeyEnvName?: string;
  installCommand: Record<'pnpm' | 'npm' | 'yarn' | 'bun', string>;
  codeExample: string;
  docsUrl?: string;
  apiKeyUrl?: string;
  websiteUrl?: string;
  npmUrl?: string;
}

export type GatewayStatus = 'operational' | 'degraded' | 'quiet';

export interface GatewayRow extends Gateway {
  status: GatewayStatus;
  metrics: Metric;
}

function getGateways(): Gateway[] {
  return platformRegistry.all({ type: 'gateway' }).map(record => {
    if (record.type !== 'gateway') throw new Error('Expected gateway record');
    const links = Object.fromEntries(
      record.links.map(link => [link.label, link.href]),
    );
    return {
      slug: record.slug,
      name: record.name,
      developer: record.developer,
      description: record.description,
      packageName: record.packageName,
      tags: record.tags,
      installCommand: record.installCommands,
      codeExample: record.codeExample,
      docsUrl: links.docs,
      apiKeyUrl: links.apiKey,
      websiteUrl: links.website,
      npmUrl: links.npm,
      apiKeyEnvName: undefined,
    };
  });
}

export const gateways = getGateways();

export function statusFromUptime(uptimePct: number): GatewayStatus {
  if (uptimePct >= 99.9) return 'operational';
  if (uptimePct >= 98.5) return 'degraded';
  return 'quiet';
}

export function getGatewayRows(): GatewayRow[] {
  return gateways.map(gateway => {
    const metrics = metricFor(gateway.slug);
    return {
      ...gateway,
      status: statusFromUptime(metrics.uptimePct),
      metrics,
    };
  });
}

export function getGatewayDevelopers(): string[] {
  return Array.from(new Set(gateways.map(gateway => gateway.developer))).sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getGatewayTags(): string[] {
  return Array.from(
    new Set(gateways.flatMap(gateway => gateway.tags ?? [])),
  ).sort((a, b) => a.localeCompare(b));
}
