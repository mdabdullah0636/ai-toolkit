# apps/studio — Dashboard Platform Plan

A data-dense dashboard platform for the AI Toolkit: gateways, models,
providers, and the registry. Where `apps/www` markets and `apps/docs`
teaches, `apps/studio` _operates_ — searchable, sortable, filterable tables,
KPI cards, and charting over the catalog data the monorepo already owns.

**Assumption:** studio is a read-only dashboard over existing data sources
(static, SSG), shaped as an extensible platform shell (sidebar + filters +
tables) so live metrics, auth, and API ingestion can slot in later. If you
intended a live/ops product instead, tell me and I'll rescope — the shell and
page splits below still apply.

## Stack decisions

- **Next.js 15 App Router** (same as `apps/www`) — consistent with the repo,
  SSG-friendly, API-ready later.
- **Package**: `@ai-toolkit/studio`, workspace auto-globbed by
  `apps/*` in `pnpm-workspace.yaml`; no root `tsconfig.json` ref needed
  (`apps/www` and `apps/docs` aren't referenced there either).
- **Deps**: `next`, `react`, `react-dom`, `lucide-react` only.
  **No chart library** — hand-rolled SVG primitives (sparklines, bars, donut)
  so visuals match the design language exactly.
- **Node-runtime data reads** at build time (like www's `gateway-models.ts`
  `readFileSync`); pages SSG to static HTML.
- **Design system**: reuse the tokens/components established in
  `apps/www` (see `apps/www/REFACTORING-PLAN.md` + commit `310dce7`) — as a
  _reference_, duplicated into studio for now.

## Design system (shared with www, then extended)

Carried over: `--background-100/200/300` surface tokens, `alpha-border` /
`alpha-border-strong`, `.eyebrow`, display-scale titles, teal accent on
near-black, h-16 blurred chrome, `surface-100/200` cards + alpha borders,
numbered `code-block`, `icon-button` tooltips, `page-tabs`.

New dashboard primitives (studio-only, in `components/`):
| Primitive | Purpose |
| --- | --- |
| `kpi-card.tsx` | Stat block: value, delta vs. prev, sparkline, mono label |
| `data-table.tsx` | Sortable, searchable, paginated table w/ row count footer |
| `filter-bar.tsx` | Toolbar of `SegmentedControl` / select / search inputs |
| `status-pill.tsx` | Colored dot + mono uppercase label (active/slow/quiet/…) |
| `chart/*.tsx` | `Sparkline`, `Bars`, `Donut` (SVG, seeded mock data) |
| `sidebar.tsx` | Left nav w-56, section headers, active underline |
| `page-header.tsx` | Eyebrow + title + description + action slot |
| `drawer.tsx` | Detail panel (row click → record detail) |

## Data layer (`lib/`)

Canonical sources (already in-repo):

- `content/gateways-registry/registry.ts` → `Gateway[]` (name, developer,
  packageName, tags, install commands, urls).
- `content/tools-registry/registry.ts` → `Tool[]`.
- `packages/special/gateway/src/gateway-{language,embedding,image}-model-settings.ts`
  → model ids + providers (+ www's `PROVIDER_LABELS` map) — same parse pattern
  as `apps/www/lib/gateway-models.ts`.
- `content/providers/*/` MDX frontmatter → provider names/slugs, joined with
  the model-settings parse for a **provider ↔ capability matrix**.
- Mock **metrics generator** `lib/metrics.ts`: deterministic seeded PRNG at
  build (requests, latency p50/p99, cost, uptime, 30-day trend) so every model
  /gateway has stable dashboard numbers without a backend. Clearly marked as
  seed data.

Files:

```
lib/types.ts          shared types (Gateway, Model, Provider, Tool, Metric, Sample)
lib/gateways.ts       read registry.ts → Gateway[]
lib/tools.ts          read registry.ts → Tool[]
lib/models.ts         parse gateway model-settings + provider labels
lib/providers.ts      parse content/providers frontmatter → capability matrix
lib/templates.ts      templates/showcase data (mirror www lib/templates.ts)
lib/metrics.ts        seeded mock generator
lib/utils.ts          cn() helper (copy from www)
```

## Pages

```
app/layout.tsx            StudioShell chrome (h-16 top bar + w-56 sidebar, drawer on mobile)
app/page.tsx              /        Overview
app/gateways/page.tsx     /gateways
app/models/page.tsx       /models
app/providers/page.tsx    /providers
app/tools/page.tsx        /tools
app/templates/page.tsx    /templates
```

- **Overview `/`**: KPI row (providers, models, gateways, tools; +requests,
  cost, avg latency w/ deltas), a 30-day request `Bars` chart, model ranking
  table (by requests), gateway status list. Links into each section.
- **Gateways `/gateways`**: `DataTable` (gateway, developer, package, tags,
  status, latency, requests) + `FilterBar` (developer, tag, search) + row
  drawer with install commands + `CodeBlock` example.
- **Models `/models`**: model table (id, provider, modality filter: language /
  embedding / image) w/ capability chips, mock latency + cost columns,
  provider group summary cards (counts per provider) — richer version of www's
  `/gateways/models`.
- **Providers `/providers`**: provider cards + capability matrix (reasoning,
  vision, coding, speed…), model counts, gateway usage `Donut`.
- **Tools `/tools`**: `DataTable` over the tools registry (name, package,
  tags, npm link) + search; detail drawer w/ install + code example.
- **Templates `/templates`**: filtered grid (reuse www template data),
  `FilterBar` by framework/tag, live search.

Every page: `PageHeader` (eyebrow, display title, description) + section-tabs
(reuse `page-tabs` pattern) where multi-view.

## Project structure

```
apps/studio/
├── PLAN.md
├── package.json          @ai-toolkit/studio (private), scripts: dev/build/start/lint/type-check
├── tsconfig.json         Next.js config, "@/*": ["./*"] (copy www)
├── next.config.js        copy www
├── postcss.config.js     copy www
├── tailwind.config.js    www tokens + surface/alpha-border colors
├── app/
│   ├── globals.css       tokens (copy www, harmless cleanup)
│   ├── layout.tsx        StudioShell
│   └── {overview…}/*/page.tsx
├── components/           primitives + shell (Design table above)
└── lib/                  data layer (above)
```

## Phases

| Phase             | Scope                                                                                                                                         | Exit criteria                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **S1 Scaffold**   | Create `apps/studio` with www-copied configs (next, tsconfig, postcss, tailwind w/ surface tokens) + minimal `app/` hello                     | `pnpm install`, type-check passes                           |
| **S2 Shell**      | `StudioShell` chrome: h-16 top bar (logo, search input, GitHub), w-56 sidebar (section links + active underline), mobile drawer, `PageHeader` | Layout renders; nav works                                   |
| **S3 Data**       | `lib/types.ts` + readers (registries, model-settings parse, providers frontmatter) + seeded `lib/metrics.ts`                                  | Build-time reads produce typed arrays; unit-smoke via `tsx` |
| **S4 Primitives** | `KpiCard`, `DataTable`, `FilterBar`, `StatusPill`, `chart/*`, `Drawer`                                                                        | Components render on overview with seed data                |
| **S5 Pages**      | Overview, Gateways, Models, Providers, Tools, Templates wired to data + primitives                                                            | All 6 routes SSG; tables sortable/searchable; drawers open  |
| **S6 Polish**     | Empty states, responsive sidebar, row-count footers, prettier on touched files, cleanup                                                       | Lint + build green                                          |
| **S7 Verify**     | From `apps/studio`: `pnpm type-check`, `pnpm lint`, `pnpm build`; confirm routes in build output                                              | All pass                                                    |

## Follow-ups (not in the initial build)

- Extract www+studio shared tokens/components into a `packages/design` (or
  `packages/ui/theme`) package and migrate both — prevents drift.
- Live metrics via Next API routes / a real telemetry ingestion contract.
- Auth guard for studio (read-only public now).
- Command palette (⌘K) across all sections.
- Add `apps/studio` to any root scripts/tooling only if it should build in CI
  (`turbo build` already picks up app `build` scripts automatically).

## Non-goals

- No auth, no live/mutation APIs, no real telemetry ingestion yet.
- No new runtime deps (charts are hand-rolled SVG).
- No changes to `apps/www` or its committed design work in this build.
- No 1:1 clone of studio.khulnasoft.com — the page set is the AI Toolkit
  catalog (gateways/models/providers/tools/templates), not the hosted product.

## Verification

From `apps/studio`: `pnpm type-check` → `pnpm lint` → `pnpm build`.
Format touched files with `pnpm prettier-fix` (repo Prettier baseline is not
clean; only touch this app's files). No changeset required — apps are private
and unpublished.
