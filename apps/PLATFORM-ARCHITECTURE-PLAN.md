# Platform Architecture Plan

## One platform, one domain model, one registry, one API boundary, multiple experiences

Status: proposed architecture plan. This document extends the workspace
consolidation in `apps/RESTRUCTURE-PLAN.md`; it does not repeat the Next,
React, Tailwind, or Vercel migration work described there.

## 1. Executive decision

Treat `apps/` as one platform product with three presentation experiences:

| Experience | Primary job                                                        | Existing app  |
| ---------- | ------------------------------------------------------------------ | ------------- |
| Learn      | Explain the SDK, providers, APIs, and recipes                      | `apps/docs`   |
| Discover   | Help developers compare providers, gateways, tools, and templates  | `apps/www`    |
| Operate    | Let maintainers inspect the catalog, health, and usage projections | `apps/studio` |

The experiences remain independently routable and deployable, but they stop
owning catalog data. A shared platform layer owns the domain model, registry,
queries, validation, and API contract. The sites own only route composition,
content rendering, interaction, and experience-specific projections.

Target dependency direction:

```text
source declarations + content
             |
             v
      @ai-toolkit/platform
       (registry + queries
          + contracts)
             |
       +-----+-----+
       |           |
       v           v
 platform API   build-time adapters
       |           |
       +-----+-----+
             |
       docs / www / studio
```

The API route is the only network boundary. Server-rendered pages may use the
platform query API directly for static generation, but browser code and
external consumers use the versioned platform API rather than importing files
or app-local `lib` modules.

## 2. Current-state findings

The workspace package consolidation is already present: `apps/package.json`
owns the three sites and the workspace contains `- 'apps'`. The remaining
problem is architectural duplication.

### 2.1 Domain logic is app-owned

- `apps/www/lib/gateway-models.ts` and `apps/studio/lib/models.ts` both parse
  model IDs from TypeScript source with regular expressions.
- Both apps maintain their own provider label maps and provider presentation
  categories.
- `apps/www/lib/providers.ts` and `apps/studio/lib/providers.ts` independently
  parse provider MDX frontmatter.
- `apps/www/lib/gateways.ts` and `apps/studio/lib/gateways.ts` wrap the same
  root registry with different category and metric behavior.
- Tools, templates, recipes, showcase entries, and search indexes are composed
  separately in each experience.

### 2.2 There is no single registry contract

Current sources are split across:

- `content/gateways-registry/registry.ts`
- `content/tools-registry/registry.ts`
- `examples/registry.json`
- `content/providers/**` MDX frontmatter
- `packages/special/gateway/src/*-model-settings.ts`
- `apps/docs/content/**` and its normalized copy of content

These sources can remain long-form authoring inputs during migration, but none
should be read directly by an experience after the platform package is
adopted.

### 2.3 The API boundary is experience-local

`apps/studio/app/api/metrics/overview/route.ts` is currently the only
catalog-adjacent API route. It computes counts by importing Studio readers.
Docs has search/chat routes owned by AiDocs, but those are not a catalog API.
There is therefore no stable API contract for providers, models, gateways,
tools, templates, or content documents.

### 2.4 Content has two physical trees

Root `content/**` is consumed by WWW and Studio. `apps/docs/content/**` is a
normalized Geistdocs tree. The normalization script and structure validator
currently keep them aligned. The target is one canonical content source and a
generated docs adapter, not two authoring trees.

## 3. Target platform boundaries

### 3.1 `@ai-toolkit/platform`

Recommended location: `packages/special/platform`.

Responsibilities:

- Define canonical source schemas, stable IDs, and API DTOs.
- Load or consume the generated registry data.
- Validate referential integrity and required metadata.
- Produce a versioned, serializable registry snapshot.
- Expose read-only domain queries over the registry snapshot.
- Define query filters, pagination, sorting, and projection types.
- Provide a framework-neutral request handler used by the one Next API route.
- Keep metrics as a separate provider/projection joined by stable entity IDs.

This package must expose no React, Next, Tailwind, or app route code. It is the
application-facing boundary and is safe for build scripts, Node server code,
and API handlers. It must not parse source text at request time.

### 3.3 The one API boundary

Create one canonical route family under a dedicated platform API deployment:

```text
/api/platform/v1/catalog
/api/platform/v1/catalog/providers
/api/platform/v1/catalog/models
/api/platform/v1/catalog/gateways
/api/platform/v1/catalog/tools
/api/platform/v1/catalog/templates
/api/platform/v1/catalog/recipes
/api/platform/v1/catalog/search
/api/platform/v1/metrics/overview
```

The deployment owns the stable `api.ai-toolkit.dev` host and imports the
framework-neutral handler from `@ai-toolkit/platform`. Docs, WWW, and Studio
must not host catalog API copies.

Rules for the boundary:

- Responses use explicit `v1` DTOs; internal registry objects are never
  serialized accidentally.
- Every list endpoint supports stable IDs, cursor or bounded page pagination,
  deterministic ordering, and an `updatedAt` or registry version.
- Search accepts a normalized query and returns entity type, ID, title, and
  canonical links; each experience maps those links locally.
- Metrics are optional and separately marked as live, seeded, or unavailable.
- Mutation endpoints are out of scope for the first version. Registry updates
  continue through reviewed source changes and generation.
- Add cache headers and ETags after the response shapes stabilize.

## 4. Canonical domain model

Use stable IDs and references rather than display names as joins.

```text
Provider
  1 --- * Model
  1 --- * ProviderIntegration

Gateway
  * --- * Model

Tool
Template
Recipe
ContentDocument
  all carry canonical URLs, tags, ownership, lifecycle, and source metadata
```

Minimum shared entities:

| Entity           | Canonical identity                 | Required data                                                        |
| ---------------- | ---------------------------------- | -------------------------------------------------------------------- |
| Provider         | `provider:<slug>`                  | slug, name, description, category, docs URL, lifecycle, capabilities |
| Model            | `model:<provider>/<modality>/<id>` | provider ID, provider model ID, modality, capabilities, lifecycle    |
| Gateway          | `gateway:<slug>`                   | name, developer, package, tags, install commands, links, examples    |
| Tool             | `tool:<slug>`                      | package, tags, install commands, links, examples                     |
| Template         | `template:<name>`                  | title, framework, provider IDs, tags, source path, links             |
| Recipe           | `recipe:<category>/<slug>`         | title, description, tags, read time, content path                    |
| Content document | `content:<family>/<slug>`          | family, locale, source path, canonical route, frontmatter            |

Shared metadata should include `status`, `source`, `owner`, `createdAt`,
`updatedAt`, and `links`. Presentation-only fields such as eyebrow copy,
table columns, chart colors, and sidebar grouping stay in experience adapters.

Do not put seeded metrics, page hrefs, or translated UI labels into the core
entity records. They are projections or experience concerns.

## 5. One registry and source-of-truth policy

### Phase 1 source policy

Keep current authoring files where maintainers already edit them, but add
explicit registry schemas and a generator:

| Current source                   | Migration treatment                                                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Gateway/tool registry TypeScript | Move canonical metadata to `content/platform/**`; preserve data with platform schema validation                              |
| Gateway model settings           | Export machine-readable model metadata from the gateway package, then generate catalog records; never regex-parse TS in apps |
| Provider MDX frontmatter         | Parse once in the registry generator; docs body remains content, frontmatter becomes catalog metadata                        |
| `examples/registry.json`         | Validate and generate Template records                                                                                       |
| Cookbook MDX                     | Parse index metadata once; generate Recipe records and retain MDX for Docs rendering                                         |
| `apps/docs/content/**`           | Replace with generated build output or a symlink-free generated adapter; no hand edits                                       |

The generator writes a versioned artifact such as
`build/platform-registry.json` and a typed module for static consumers. The
artifact includes a source manifest and validation diagnostics. CI fails on
duplicate IDs, broken references, missing canonical URLs, or divergent docs
coverage.

### Phase 2 source policy

Keep registry-owned metadata in the canonical `content/platform/**` tree and
make provider/model/tool/gateway/template files declarative there. Keep
long-form MDX bodies in their existing content families but reference them by
`contentId`.

### Non-negotiable rule

An app may add a view model, but it may not add a second canonical Provider,
Model, Gateway, Tool, Template, or Recipe type.

## 6. Experience responsibilities

### Docs: Learn

- Render the canonical content documents through Geistdocs.
- Resolve provider/model/tool cards through platform queries.
- Keep AiDocs search, chat, Markdown, and MCP routes as docs-runtime concerns.
- Do not become the owner of catalog metadata merely because it renders it.

### WWW: Discover

- Use platform queries for provider, gateway, model, tool, template, and recipe
  directories.
- Own marketing copy, public navigation, comparison layouts, and external
  links.
- Replace direct filesystem readers in `lib/` with platform adapters.

### Studio: Operate

- Use the same catalog records and query filters as WWW.
- Add dashboard-only projections for status, metrics, counts, and tables.
- Move `/api/metrics/overview` behind the canonical metrics API contract.
- Keep authentication, live telemetry providers, and operational controls out
  of the platform package.

All three may define local view models, but each view model must be derived
from a platform DTO and must retain the canonical entity ID.

## 7. Migration phases

### P0: Contract and inventory

- Freeze new app-local catalog types and readers.
- Add a machine-readable inventory of current entities and source paths.
- Reserve the stable `api.ai-toolkit.dev` host for the dedicated platform API
  deployment.
- Write contract tests for current counts, IDs, and representative records.

Exit: the inventory lists every current registry and every app import that
reads it directly.

### P1: Platform package and registry

- Add `packages/special/platform` with schemas, canonical types, source
  adapters, generator, query functions, DTOs, and validation commands.
- Export model metadata from `packages/special/gateway` or generate it as part
  of that package's build; remove regex parsing from the apps.
- Generate the first snapshot without changing page output.

Exit: `pnpm validate-structure` and registry validation pass; generated data
has stable IDs and matches current app counts.

### P2: Query and contract hardening

- Define typed list/detail/search queries and DTO mappers in
  `packages/special/platform`; internal registry records are not API records.
- Add fixtures and contract tests for filters, pagination, links, and missing
  optional metadata.

Exit: a single query returns the records currently assembled independently by
WWW and Studio.

### P3: API boundary

- Implement `/api/platform/v1` with the shared handler.
- Add OpenAPI or an equivalent generated contract from the DTO schemas.
- Migrate Studio metrics overview to the shared metrics contract.
- Add cache/version headers and an explicit registry version.

Exit: one route family serves catalog and metrics data; no second catalog API
exists in another site.

### P4: Experience migration

Migrate in this order:

1. Studio readers and search index, because its domain tables expose the most
   duplication.
2. WWW provider/gateway/model/resource readers.
3. Docs provider/model/tool cards and content metadata adapters.

Keep route URLs and visual behavior stable. Delete each app-local reader only
after its replacement has a focused test and the app no longer imports the
source registry.

Exit: `apps/{docs,www,studio}` contain no direct imports from
`content/*-registry`, `examples/registry.json`, or gateway model-settings
files.

### P5: Canonical content and cleanup

- Make one content tree authoritative.
- Generate the Docs Geistdocs tree and remove hand-maintained duplicates.
- Retire duplicated provider label maps, category maps, and registry types.
- Update `apps/README.md`, architecture indexes, and contributor guidance.
- Add CI checks that reject new app-local canonical entities/readers.

Exit: a registry change updates all three experiences from one source and the
old normalization/coverage mechanism is either replaced by generation checks
or removed.

## 8. Testing and validation

Required checks:

- Registry schema and referential-integrity tests.
- Snapshot/count compatibility tests during migration.
- API contract tests for every v1 collection and error shape.
- Query tests for filtering, sorting, pagination, and stable IDs.
- One focused smoke test per experience proving the same entity ID resolves to
  the same canonical record.
- `pnpm --filter @ai-toolkit/apps type-check` and the three site builds.
- A structural check preventing app imports of registry source files.

Operational checks after API deployment:

- API response includes registry version and cache metadata.
- Empty and stale metrics states render correctly.
- API failure does not break static Docs or WWW pages; they use the generated
  snapshot for build-time rendering.
- Studio can switch from seeded metrics to a live provider without changing
  catalog DTOs or page contracts.

## 9. Risks and decisions to preserve

| Risk                                               | Mitigation                                                             |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| API becomes a bottleneck for static sites          | Server pages use shared queries/snapshot; browser calls use the API    |
| Registry package becomes a dumping ground          | Keep content rendering, metrics, and UI projections outside it         |
| Model metadata drifts from gateway behavior        | Gateway package owns machine-readable model declarations               |
| Docs normalization remains a hidden second source  | Generate it from canonical content and validate generated output       |
| WWW and Studio need different fields               | Use additive DTO projections, not forked entity types                  |
| Live metrics contaminate catalog data              | Separate metrics provider and join by stable entity ID                 |
| Independent Vercel deploys complicate API location | Separate logical API contract from initial route host; use one handler |

## 10. Definition of done

The restructuring is complete when:

1. A single registry snapshot contains every provider, model, gateway, tool,
   template, recipe, and content reference.
2. A single canonical domain model and query package is imported by all three
   experiences.
3. A single versioned API route family serves browser and external consumers.
4. No app parses registry source files or maintains canonical catalog types.
5. Docs, WWW, and Studio can evolve their layouts and workflows independently
   without changing the registry or API contract.
6. A source change is validated once and appears consistently in all three
   experiences.
