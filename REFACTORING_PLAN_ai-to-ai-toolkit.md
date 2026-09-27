# Refactoring Plan: `ai` → `@ai-toolkit/ai` (ai-toolkit)

> Target: `packages/core/ai` (`ai` on npm) → scoped `@ai-toolkit/ai`
> Codemod: `packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts:3`
> Status: **Phase 1 partially landed** (`package.json` name updated, most references still on `ai`)

## 1. Objective

Rename the core SDK package from unscoped `ai` to scoped `@ai-toolkit/ai` (referred to by user as `ai-toolkit`) and, optionally, rename the directory `packages/core/ai` → `packages/core/ai-toolkit` for symmetry. Aligns with ADR-012 / `architecture/domain-mapping.md` and repository-wide move to `@ai-toolkit/*` scope.

Two naming interpretations:

- **Interpretation A (implemented)**: npm name `@ai-toolkit/ai`, directory stays `packages/core/ai` (suffix matches dir). This is what `packages/core/ai/package.json:2` now declares.
- **Interpretation B (user literal)**: npm name `ai-toolkit` (unscoped) or `@ai-toolkit/ai-toolkit`, directory `packages/core/ai-toolkit`. Requires extra decision — not recommended (breaks `@ai-toolkit/*` consistency, see `architecture/domain-mapping.md`).

**Recommendation: proceed with A** — `@ai-toolkit/ai` — and keep directory `packages/core/ai` unless product wants `ai-toolkit` as public alias (then add re-export package, not rename dir).

## 2. Current State (git dirty)

Evidence `git diff -- packages/core/ai/package.json:1`:

```diff
-  "name": "ai",
+  "name": "@ai-toolkit/ai",
```

`packages/core/ai/package.json:39` also added `default` export conditions per ADR-006.

`git diff --stat` shows ~80 files already migrated in `examples/01-foundations/ai-functions/**` (e.g. `examples/01-foundations/ai-functions/package.json:48` `ai`→`@ai-toolkit/ai` and `import { generateText } from 'ai'` → `@ai-toolkit/ai` in `.ts` files). Root still dirty, not committed.

Remaining scope still on `ai`:

- `2811` matches for `from 'ai'` (all `import ... from 'ai'`, `export ... from 'ai'`, `import('ai')`, `require('ai')`) — `rg -n "from ['\"]ai" --glob '!node_modules':2811`
- `206` files contain static `from 'ai'` imports (subset) — `rg -l "from ['\"]ai['\"/]|from ['\"]ai/":206`
- `16` `package.json` files still reference `"ai": "workspace:*"` / `"ai": "6.0.45"` via `rg -l '"ai":' --glob 'package.json':16` (examples, adapters, providers, `apps/www/package.json:13`, `packages/ui/elements/package.json:40`, etc.) — note many `packages/providers/*/package.json:70` use keyword `"ai"` not dependency, must filter.
- `tsconfig.json:4` still references `"path": "packages/core/ai"` (root + ~10 example `tsconfig.json` files, see `examples/04-tools/playground/tsconfig.json:33`, `examples/02-framework-integration/next/tsconfig.json:34`)
- `pnpm-lock.yaml:78` `version: link:../../packages/core/ai`, `1901: packages/core/ai:` — regenerated on `pnpm install`
- Docs: `AGENTS.md:21` table row `packages/core/ai | Main SDK package (ai on npm)`, `AGENTS.md:79` `Run these from within ... (e.g. packages/core/ai)`, `AGENTS.md:114` `Import From: ai`, `architecture/domain-mapping.md` (ai row), `CODEOWNERS:6` `packages/core/ai/ @khulnasoft/ai-toolkit-core`, `content/docs/**` links to `github.com/.../packages/core/ai/src/...`
- Codemod fixtures: `packages/special/codemod/src/test/__testfixtures__/**/*.ts` intentionally keep `from 'ai'` as input fixtures — **exclude from bulk rewrite** (see §4)

## 3. Inventory (quantified)

| Category                      | Count                                | Examples                                                                                                                                                                |
| ----------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package dir files             | 520                                  | `packages/core/ai/src/**`, `internal/index.ts:1`, `test/index.ts:1`, `tsup.config.ts:1`, `internal.d.ts:1`, `AGENTS.md:1`                                               |
| Dependent `package.json` deps | ~35 workspace:\* + 16 version-pinned | `packages/adapters/react/package.json:40`, `packages/providers/openai/package.json:88`, `examples/02-framework-integration/next/package.json:14`                        |
| Import specifiers             | 2811 occurrences, 206 files          | `packages/special/devtools/examples/basic/index.ts:1`, `apps/www/components/hero-example.tsx:1`, `content/docs/**/*.mdx` code blocks                                    |
| TS references                 | 12                                   | `tsconfig.json:4`, `examples/**/tsconfig.json`, `packages/special/gateway` etc.                                                                                         |
| Workspace / tooling           | 4                                    | `pnpm-workspace.yaml:3` (glob `packages/core/*` — no change needed for dir rename), `pnpm-lock.yaml`, `CODEOWNERS`, `turbo.json` (domain tasks, no filter on `ai` name) |
| Documentation                 | ~20 MDX                              | `apps/docs/content/docs/04-ai-toolkit-ui/21-transport.mdx:163`, `MIGRATION_PLAN.md:151`                                                                                 |

## 4. Strategy

Use the **existing codemod** `packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts:3` which maps:

```ts
sourceMapping:14
  ai: '@ai-toolkit/ai',
  'ai/test': '@ai-toolkit/ai/test',
  'ai/internal': '@ai-toolkit/ai/internal',
```

It handles `ImportDeclaration`, `ExportNamedDeclaration`, `ExportAllDeclaration`, dynamic `import()`, and `require()` — covers all 2811 matches.

**Directory rename decision**: _Do not_ rename `packages/core/ai` → `packages/core/ai-toolkit` in this phase unless product confirms. The scoped name suffix is `ai` (`@ai-toolkit/ai`), so dir `ai` is correct. If symmetry with `ai-toolkit` literal is required, perform `git mv packages/core/ai packages/core/ai-toolkit` and update `pnpm-workspace.yaml` (no-op, glob covers) + all `tsconfig.json` paths. Keep as separate Phase 2 to limit blast radius.

Exclude from codemod:

- `packages/special/codemod/src/test/__testfixtures__/**` — these are test inputs; updating `.input.ts` would break fixture pairs. Only update `.output.ts` expectation if needed.
- `tools/create-ai-sdk/**` keywords array `tools/create-ai-sdk/package.json:14` `"ai"` — keyword, not package name, keep.

## 5. Phased Execution

### Phase 0 — Preparation (already done)

- [x] Add `default` export condition per ADR-006 `packages/core/ai/package.json:39`
- [x] Change `name` to `@ai-toolkit/ai` `packages/core/ai/package.json:2`
- [x] Create codemod + fixtures `packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts:1`, `.../__testfixtures__/rename-ai-to-ai-toolkit.{input,output}.ts:1`

### Phase 1 — Core metadata (1 PR, low risk)

1. `packages/core/ai/package.json:2` — already done, commit.
2. `AGENTS.md:21` `packages/core/ai | Main SDK package (ai on npm)` → `packages/core/ai | Main SDK package (@ai-toolkit/ai on npm)`
3. `AGENTS.md:79` `(e.g., packages/core/ai)` — keep or clarify `(e.g., packages/core/ai — npm @ai-toolkit/ai)`
4. `AGENTS.md:114` `Import From: ai` → `@ai-toolkit/ai` (and `AGENTS.md:117` Error classes)
5. `AGENTS.md:214` `Core (ai)` → `Core (@ai-toolkit/ai)`; diagram `ai ──▶` → `@ai-toolkit/ai ──▶`
6. `CODEOWNERS:6` `packages/core/ai/ @khulnasoft/ai-toolkit-core` — keep (path unchanged)
7. `packages/core/ai` path → keep, but `architecture/domain-mapping.md` table `ai` → `@ai-toolkit/ai`
8. `packages/core/ai/AGENTS.md:10` code blocks `from 'ai'` → `from '@ai-toolkit/ai'` (4 blocks)
9. `packages/core/ai/README.md:5` badge `npm/v/ai-toolkit` already points to `ai-toolkit` — verify; `pnpm add ai-toolkit` references may need `@ai-toolkit/ai`

### Phase 2 — Monorepo dependents (1 PR, mechanical)

Run codemod + manual `package.json` edits:

```bash
# dry-run first
npx jscodeshift -t packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts --dry --print \
  examples packages/adapters packages/providers packages/ui apps/www content

# apply (excludes fixtures)
pnpm exec jscodeshift -t packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts \
  --extensions ts,tsx,js,mdx --parser tsx \
  examples/01-foundations/ai-functions/src packages/adapters packages/providers packages/ui apps/www content --ignore-pattern="**/__testfixtures__/**"
```

Manual edits:

- `package.json` deps: `rg -l '"ai":\s*"workspace:\*"'` → `"@ai-toolkit/ai": "workspace:*"` (adapters `vue:41`, `svelte:57`, `rsc:47`, `react:40`, `elements:40`, `mcp:??`, etc.)
- Pinned examples: `"ai": "6.0.45"` → `"@ai-toolkit/ai": "6.0.45"` (16 files, `examples/03-integrations/next-openai-upstash-rate-limits/package.json:16` etc.) — or bump to `workspace:*` for internal examples.
- `tsconfig.json` refs: `tsconfig.json:4` `packages/core/ai` → keep (dir unchanged). If dir rename, update all `examples/**/tsconfig.json:33` paths.
- `apps/www/package.json:13`, `examples/04-tools/playground/package.json:49`
- Keywords: leave `packages/*/package.json:70` `"ai"` keyword — not a dependency, keep for npm search.

Post-edit: `pnpm install` → regenerates `pnpm-lock.yaml:78`, `pnpm update-references` → validates `tsconfig.json` references.

### Phase 3 — Directory rename (only if Interpretation B approved)

```bash
git mv packages/core/ai packages/core/ai-toolkit
# update
# - tsconfig.json:4  path: packages/core/ai-toolkit
# - all examples/**/tsconfig.json paths
# - architecture/domain-mapping.md table
# - CODEOWNERS path
# - pnpm-workspace.yaml:3  (glob already covers, but document)
# - tools/scripts/* inventory baseline
pnpm update-references && pnpm install
```

Impact: touches 520 files' relative imports internally — but internal imports use relative paths, not `ai`, so low risk; `tsup.config.ts:1`, `internal.d.ts:1`, `test.d.ts:1` unchanged. Biggest cost is CI cache invalidation.

### Phase 4 — Docs & release

- `content/docs/**/*.mdx` code examples `from 'ai'` → `from '@ai-toolkit/ai'` (manual search `content/docs: ~400` hits)
- `apps/docs` MDX components
- Changeset: `pnpm changeset` — select `@ai-toolkit/ai` (and `@ai-toolkit/codemod` if bumping codemod), **minor** (breaking import path) — requires maintainer approval per `AGENTS.md:256`
- Publish: `ai` → deprecated, add `npm deprecate ai "use @ai-toolkit/ai"` or keep `ai` as re-export shim `packages/ai` → `packages/core/ai` (see `architecture/domain-mapping.md` legacy re-export) for 6-month grace.

## 6. Verification

```bash
pnpm validate-structure  # checks ADR-006 exports, ADR-007 owners, layer rules
pnpm types:check         # tsc --build (root tsconfig.json:4)
pnpm build:core          # turbo build:core → tsup packages/core/ai:1
pnpm test:core           # vitest node + edge per packages/core/ai:32
pnpm publint             # export map validity
# manual
rg -n "from ['\"]ai['\"]" --glob '!**/__testfixtures__/**' | wc -l  # expect 0
rg -n '"ai":\s*"workspace' --glob 'package.json' | wc -l            # expect 0
```

## 7. Risks & Mitigations

| Risk                                 | Mitigation                                                                                                                         |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Users still `import from 'ai'` break | Keep `ai` npm package as 1-line re-export for 6mo; codemod `rename-ai-to-ai-toolkit` already published in `@ai-toolkit/codemod:61` |
| Fixture tests break                  | Exclude `__testfixtures__` from bulk codemod; update only `rename-ai-to-ai-toolkit.output.ts`                                      |
| `pnpm-lock.yaml` churn (1901)        | Single `pnpm install` after Phase 2; commit lockfile alone in same PR                                                              |
| Keywords confused with package name  | Do not replace `"ai"` in `keywords` arrays (`packages/providers/*/package.json:70` etc.)                                           |
| Directory rename invalidates caches  | Do Phase 3 separately, after all imports migrated                                                                                  |

## 8. Rollback

- Revert `packages/core/ai/package.json:2` to `"ai"` and `pnpm install`.
- Revert codemod commit (git revert). No data migration.
- Keep `ai` on npm — no deprecation until 100% migrated.

## 9. Timeline

- Phase 1: 1 day (docs + package.json, already 80% done)
- Phase 2: 2–3 days (codemod run + review 206 files, 16 package.json, 12 tsconfigs)
- Phase 3: 1 day if approved (dir rename + CI)
- Phase 4: 2 days (docs + changeset + release)

Total: **~1 week** with 2 PRs (Phase 1+2 together, Phase 3 separate).

## 10. Immediate Next Actions

- [ ] Confirm Interpretation A vs B with `@khulnasoft/ai-toolkit-core` owners `packages/core/ai/package.json:115`
- [ ] Approve codemod exclusion list
- [ ] Run `npx jscodeshift ... --dry` and open draft PR for Phase 2
- [ ] `pnpm changeset` (minor) + `pnpm validate-structure`

---

_Generated from live inventory: `packages/core/ai/package.json:2`, `tsconfig.json:4`, `pnpm-workspace.yaml:3`, `packages/special/codemod/src/codemods/v6/rename-ai-to-ai-toolkit.ts:3`, `AGENTS.md:21`._
