export type PlatformEntityType =
  | 'provider'
  | 'model'
  | 'gateway'
  | 'tool'
  | 'template'
  | 'recipe'
  | 'content';

export type PlatformStatus = 'active' | 'deprecated' | 'draft';

export interface PlatformLink {
  label: string;
  href: string;
}

export interface PlatformSource {
  path: string;
  kind: 'content' | 'registry' | 'package-source' | 'generated';
}

export interface PlatformRecord {
  id: string;
  type: PlatformEntityType;
  slug: string;
  name: string;
  description: string;
  status: PlatformStatus;
  tags: string[];
  links: PlatformLink[];
  source: PlatformSource;
  updatedAt: string;
}

export interface ProviderRecord extends PlatformRecord {
  type: 'provider';
  category: string;
  capabilities: string[];
}

export type ModelModality = 'language' | 'embedding' | 'image';

export interface ModelRecord extends PlatformRecord {
  type: 'model';
  providerId: string;
  providerModelId: string;
  modality: ModelModality;
  capabilities: string[];
}

export interface GatewayRecord extends PlatformRecord {
  type: 'gateway';
  developer: string;
  packageName: string;
  installCommands: Record<'pnpm' | 'npm' | 'yarn' | 'bun', string>;
  codeExample: string;
}

export interface ToolRecord extends PlatformRecord {
  type: 'tool';
  packageName: string;
  installCommands: Record<'pnpm' | 'npm' | 'yarn' | 'bun', string>;
  codeExample: string;
}

export interface TemplateRecord extends PlatformRecord {
  type: 'template';
  category: string;
  categoryOrder: number;
  framework: string;
  primaryProviderId: string | null;
  sourcePath: string;
}

export interface RecipeRecord extends PlatformRecord {
  type: 'recipe';
  category: string;
  contentPath: string;
  readTimeMinutes: number;
}

export interface ContentRecord extends PlatformRecord {
  type: 'content';
  family: string;
  locale: string;
  contentPath: string;
  canonicalPath: string;
}

export type PlatformRecordUnion =
  | ProviderRecord
  | ModelRecord
  | GatewayRecord
  | ToolRecord
  | TemplateRecord
  | RecipeRecord
  | ContentRecord;

export interface PlatformRegistrySnapshot {
  schemaVersion: 1;
  registryVersion: string;
  generatedAt: string;
  records: PlatformRecordUnion[];
}

export interface RegistryIssue {
  code: 'duplicate-id' | 'invalid-id' | 'missing-reference';
  recordId?: string;
  message: string;
}

export interface PlatformQuery {
  type?: PlatformEntityType;
  search?: string;
  tags?: string[];
  limit?: number;
}

export interface SearchResult {
  type: PlatformEntityType;
  id: string;
  name: string;
  description: string;
}

const MAX_LIMIT = 100;

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function matches(record: PlatformRecordUnion, query: PlatformQuery): boolean {
  if (query.type && record.type !== query.type) return false;

  if (query.tags?.some(tag => !record.tags.includes(tag))) return false;

  if (query.search) {
    const needle = normalize(query.search);
    const haystack = normalize(
      [record.id, record.name, record.description, ...record.tags].join(' '),
    );
    if (!haystack.includes(needle)) return false;
  }

  return true;
}

export function validateRegistry(
  snapshot: PlatformRegistrySnapshot,
): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const ids = new Set<string>();

  for (const record of snapshot.records) {
    if (ids.has(record.id)) {
      issues.push({
        code: 'duplicate-id',
        recordId: record.id,
        message: `Duplicate platform record ID: ${record.id}`,
      });
    }
    ids.add(record.id);

    if (!record.id.startsWith(`${record.type}:`)) {
      issues.push({
        code: 'invalid-id',
        recordId: record.id,
        message: `Record ID must start with ${record.type}:`,
      });
    }
  }

  for (const record of snapshot.records) {
    if (record.type !== 'model' || ids.has(record.providerId)) continue;
    issues.push({
      code: 'missing-reference',
      recordId: record.id,
      message: `Model references missing provider: ${record.providerId}`,
    });
  }

  return issues;
}

export class PlatformRegistry {
  readonly version: string;

  private readonly records: PlatformRecordUnion[];

  constructor(snapshot: PlatformRegistrySnapshot) {
    const issues = validateRegistry(snapshot);
    if (issues.length > 0) {
      throw new Error(issues.map(issue => issue.message).join('\n'));
    }

    this.version = snapshot.registryVersion;
    this.records = snapshot.records
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  list(query: PlatformQuery = {}): PlatformRecordUnion[] {
    const limit = Math.min(Math.max(query.limit ?? MAX_LIMIT, 1), MAX_LIMIT);
    return this.records
      .filter(record => matches(record, query))
      .slice(0, limit);
  }

  all(query: Omit<PlatformQuery, 'limit'> = {}): PlatformRecordUnion[] {
    return this.records.filter(record => matches(record, query));
  }

  get(id: string): PlatformRecordUnion | undefined {
    return this.records.find(record => record.id === id);
  }

  search(query: string, limit = 20): SearchResult[] {
    return this.list({ search: query, limit }).map(record => ({
      type: record.type,
      id: record.id,
      name: record.name,
      description: record.description,
    }));
  }
}

export interface PlatformApiRequest {
  pathname: string;
  searchParams: URLSearchParams;
}

export interface PlatformApiResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
}

export interface PlatformMetricsCounts {
  providers: number;
  models: number;
  gateways: number;
  tools: number;
}

export interface PlatformApiOptions {
  getMetrics?: (counts: PlatformMetricsCounts) => unknown | Promise<unknown>;
}

function entityType(value: string | null): PlatformEntityType | undefined {
  const types: PlatformEntityType[] = [
    'provider',
    'model',
    'gateway',
    'tool',
    'template',
    'recipe',
    'content',
  ];
  return value && types.includes(value as PlatformEntityType)
    ? (value as PlatformEntityType)
    : undefined;
}

function apiQuery(request: PlatformApiRequest): PlatformQuery {
  const rawLimit = Number(request.searchParams.get('limit') ?? 50);
  return {
    type: entityType(request.searchParams.get('type')),
    search: request.searchParams.get('q') ?? undefined,
    tags: request.searchParams.getAll('tag'),
    limit: Number.isFinite(rawLimit) ? rawLimit : 50,
  };
}

function collectionType(pathname: string): PlatformEntityType | undefined {
  const match = pathname.match(/\/catalog\/([^/]+)$/);
  const pluralTypes: Record<string, PlatformEntityType> = {
    providers: 'provider',
    models: 'model',
    gateways: 'gateway',
    tools: 'tool',
    templates: 'template',
    recipes: 'recipe',
    content: 'content',
  };
  return pluralTypes[match?.[1] ?? ''] ?? entityType(match?.[1] ?? null);
}

export function createPlatformApi(
  registry: PlatformRegistry,
  options: PlatformApiOptions = {},
) {
  const headers = {
    'cache-control': 'public, max-age=60, s-maxage=300',
    etag: `"${registry.version}"`,
    'x-platform-registry-version': registry.version,
  };

  return async function handle(
    request: PlatformApiRequest,
  ): Promise<PlatformApiResponse> {
    if (!request.pathname.startsWith('/api/platform/v1/')) {
      return { status: 404, body: { error: 'Not found' }, headers };
    }

    if (request.pathname.endsWith('/search')) {
      return {
        status: 200,
        body: {
          version: registry.version,
          results: registry.search(
            request.searchParams.get('q') ?? '',
            Number(request.searchParams.get('limit') ?? 20),
          ),
        },
        headers,
      };
    }

    if (request.pathname.endsWith('/metrics/overview')) {
      if (!options.getMetrics) {
        return { status: 404, body: { error: 'Metrics unavailable' }, headers };
      }
      const records = registry.all();
      const counts: PlatformMetricsCounts = {
        providers: records.filter(record => record.type === 'provider').length,
        models: records.filter(record => record.type === 'model').length,
        gateways: records.filter(record => record.type === 'gateway').length,
        tools: records.filter(record => record.type === 'tool').length,
      };
      return {
        status: 200,
        body: {
          version: registry.version,
          metrics: await options.getMetrics(counts),
        },
        headers,
      };
    }

    const type = collectionType(request.pathname);
    if (type) {
      return {
        status: 200,
        body: {
          version: registry.version,
          records: registry.list({ ...apiQuery(request), type }),
        },
        headers,
      };
    }

    if (request.pathname.endsWith('/catalog')) {
      return {
        status: 200,
        body: {
          version: registry.version,
          records: registry.list(apiQuery(request)),
        },
        headers,
      };
    }

    return { status: 404, body: { error: 'Not found' }, headers };
  };
}
