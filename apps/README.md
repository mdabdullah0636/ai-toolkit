# apps — AI TOOLKIT websites

Single pnpm workspace package (`@ai-toolkit/apps`) hosting the three AI TOOLKIT
sites as sub-build directories. Each site keeps its own `next.config.*`,
`tsconfig.json`, `postcss.config.*`, and Tailwind setup so it stays
independently deployable to Vercel.

| Site   | Dir           | Stack                                                             | Routes                                                            | Vercel root dir |
| ------ | ------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------- | --------------- |
| Docs   | `apps/docs`   | Next 16 · React 19 · Tailwind v4 · Fumadocs / `@vercel/geistdocs` | `/[lang]/{docs,providers,cookbook}`, llms/agents/rss/api          | `apps/docs`     |
| www    | `apps/www`    | Next 16 · React 19 · Tailwind v4 · `@ai-toolkit/design`           | `/`, `/providers`, `/gateways`, `/resources/*`, `/playground`     | `apps/www`      |
| Studio | `apps/studio` | Next 16 · React 19 · Tailwind v4 · `@ai-toolkit/design`           | `/`, `/gateways`, `/models`, `/providers`, `/tools`, `/templates` | `apps/studio`   |

## Commands (run from repo root or `apps/`)

```bash
pnpm --filter @ai-toolkit/apps dev            # all three sites: docs :3000, www :3001, studio :3002
pnpm --filter @ai-toolkit/apps dev:docs       # single site on :3000 (also dev:www, dev:studio; PORT=xxx to override)
pnpm --filter @ai-toolkit/apps build          # all three (sequential)
pnpm --filter @ai-toolkit/apps build:docs     # single site (also build:www, build:studio)
pnpm --filter @ai-toolkit/apps start          # production servers (docs :3000, www :3001, studio :3002)
pnpm --filter @ai-toolkit/apps start:www      # single production server on :3000 (also start:docs, start:studio)
pnpm --filter @ai-toolkit/apps type-check
pnpm --filter @ai-toolkit/apps lint
pnpm --filter @ai-toolkit/apps clean
```

> Dev/start scripts spawn `next` with the working directory set to each site dir,
> matching how the sites resolve the repo-root `content/**` via `process.cwd()`.

> `next build` writes `.next/` inside each site dir, so Vercel project root
> directories stay at `apps/docs`, `apps/www`, `apps/studio`.

## Deploying to Vercel

Each site is its own Vercel project (`vercel.json` per site):

- build: `cd ../.. && pnpm turbo build --filter=@ai-toolkit/apps^... && pnpm --filter @ai-toolkit/apps run build:<site>`
- ignore: `node ../../apps/scripts/vercel-ignore.mjs <site>` (skips the build
  when only unrelated files changed)

Before running a single-site build, the workspace packages the site depends on
must be built (`pnpm turbo build --filter=@ai-toolkit/apps^...` does this). The
root `turbo build` handles ordering automatically for umbrella deploys.

## Notes

- Docs content lives in `apps/docs/content/**` (derived Geistdocs tree with
  `meta.json`); www/studio read the canonical `content/**` at the repo root.
  `tools/scripts/validate-structure.mjs` enforces coverage between them.
- `@ai-toolkit/design` ships the shared tokens + primitives for www/studio as a
  Tailwind v4 `@theme` preset (see `packages/ui/design/src/globals.css`).
