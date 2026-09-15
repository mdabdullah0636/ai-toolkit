import { NextResponse } from 'next/server';
import snapshot from '../../../../../../../build/platform-registry.json';
import { createPlatformApi, PlatformRegistry } from '@ai-toolkit/platform';
import type { PlatformRegistrySnapshot } from '@ai-toolkit/platform';
import { getMetricsProvider } from '@/lib/metrics-provider';

const registry = new PlatformRegistry(snapshot as PlatformRegistrySnapshot);
const handle = createPlatformApi(registry, {
  getMetrics: counts => getMetricsProvider().overview(counts),
});

export const revalidate = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = await handle({
    pathname: url.pathname,
    searchParams: url.searchParams,
  });

  return NextResponse.json(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
