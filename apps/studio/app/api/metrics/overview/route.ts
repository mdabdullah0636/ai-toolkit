import { NextResponse } from 'next/server';
import snapshot from '../../../../../../build/platform-registry.json';
import {
  createPlatformApi,
  PlatformRegistry,
  type PlatformRegistrySnapshot,
} from '@ai-toolkit/platform';
import { getMetricsProvider } from '@/lib/metrics-provider';

const handle = createPlatformApi(
  new PlatformRegistry(snapshot as PlatformRegistrySnapshot),
  { getMetrics: counts => getMetricsProvider().overview(counts) },
);

export const revalidate = 60;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = await handle({
    pathname: '/api/platform/v1/metrics/overview',
    searchParams: url.searchParams,
  });
  const body = response.body as { metrics?: unknown };
  return NextResponse.json(body.metrics ?? response.body, {
    status: response.status,
    headers: response.headers,
  });
}
