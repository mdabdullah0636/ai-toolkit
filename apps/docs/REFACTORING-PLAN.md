# apps/docs UI Refactoring Plan — Geistdocs design, layout, and components

> Supersede note: this plan originally recommended Track A (consume the
> published `@vercel/geistdocs` package). The project has since moved to
> Track B — the runtime is vendored as `@vercel/geistdocs` in
> `packages/special/ai-docs` (byte-identical to upstream 1.26.1 plus the
> ai-docs rebrand; see that package's README for the sync policy). The design,
> layout, and adapter guidance below still applies; read `@vercel/geistdocs`
> below as `@vercel/geistdocs` and `Geistdocs*` symbols as `AiDocs*`.

Source reference: `@vercel/geistdocs@1.26.1` (Apache-2.0,
`github.com/vercel/geistdocs`, package `packages/geistdocs`). This is the
package-backed Fumadocs runtime that powers `ai-sdk.dev`, the Vercel docs
sites, shop, and turborepo documentation. `apps/docs` in this repo already
holds Geistdocs-native content and a Geistdocs source config; this plan lands
the rendering app, design language, layout shell, and component layer on top of
that content so `@ai-toolkit/docs` matches the Geistdocs look and behavior.

## 1. What `@vercel/geistdocs` is

A **package-backed docs runtime** built on Fumadocs (`fumadocs-core 16.2.2`,
`fumadocs-ui 16.2.2`, `fumadocs-mdx 14.0.4`). The npm package ships:

- `styles.css` / `theme.css` — the **Geist design layer** (tokens, typography
  utilities, material surfaces, Fumadocs token remapping, Shiki palette,
  sidebar/toc/mobile chrome) importing Tailwind v4, `fumadocs-ui/css/{shadcn,preset}.css`,
  and `tw-animate-css`.
- `dist/layout`, `dist/navbar`, `dist/sidebar`, `dist/footer`,
  `dist/home-layout`, `dist/mobile-docs-bar`, `dist/pages/docs`,
  `dist/controls`, `dist/config`, `dist/source`, `dist/source-config`,
  `dist/mdx`, `dist/shiki-theme`, `dist/versions`.
- `dist/routes/{chat,search,search-export,llms,sitemap,agents,mcp,not-found}`
  and `dist/proxy`, `dist/next` (`createGeistdocs`) — Search, Ask AI (AI SDK
  v6), `llms.txt`, per-page `.mdx`, `sitemap.md`, `agents.md`,
  `/.well-known/mcp.json`, RSS, OG, smart 404s, and `.md`/`.mdx` request
  negotiation.
- `dist/components/*` — Geist UI primitives (`button`, `badge`, `card`,
  `input`, `dialog`, `drawer`, `sheet`, `dropdown-menu`, `tooltip`, `kbd`,
  `switch`, `spinner`, `sonner`, `collapsible`, `tabs`-adjacent, …) and docs
  composites (`callout`, `code-block`, `code-block-tabs`, `copy-prompt`,
  `mermaid`, `video`, `theme-aware-image`, `command-prompt`, …).
- a full Next.js App Router **template** (`template/`) showing the thin local
  adapter pattern an app must copy.

### The app-side architecture (template pattern)

Local app stays thin; the package owns shared behavior (**"do not copy
package internals"**). Files an app must own:

```
geistdocs.tsx                            site facts (title, logo, nav, github, ai prompt, suggestions, siteId)
lib/geistdocs/config.tsx                 defineConfig({...}) — the single config surface
lib/geistdocs/source.ts                  createSource({docs, config}) → typed Fumadocs source
components/geistdocs/provider.tsx        GeistdocsProvider + Analytics/SpeedInsights
components/geistdocs/docs-layout.tsx     GeistdocsDocsLayout (max-w-[1448px] bg-background-200)
components/geistdocs/mdx-components.tsx  createMdxComponents(...) + local content components
app/[lang]/layout.tsx                    Navbar + Footer + structural html
app/[lang]/docs/layout.tsx               DocsLayout(tree)
app/[lang]/docs/[[...slug]]/page.tsx     createDocsPage(...)
proxy.ts                                 createProxy(...) — .md/.mdx negotiation
app/api/{search,chat}/route.ts           createSearchRoute / createChatRoute
app/[lang]/{llms.txt,llms.mdx,sitemap.md,agents.md,.well-known/mcp.json,rss.xml}/route.ts
next.config.ts                           createGeistdocs(...)
```

## 2. Design system analysis (what we are adopting)

### Tokens (`theme.css`)

- **Theme-aware OKLCH Geist scale**, switched by `.dark` on `<html>`: `--ds-background-100/200`
  (content surface = near-white→black, chrome surface = one step off),
  full `--ds-gray-*`/`gray-alpha-*` 100–1000 scales (alpha = rgba borders at
  steps 200/400/500), and accent scales `blue`, `red`, `amber`, `green`,
  `teal`, `purple`, `pink` (accent-on-dark uses **900**, text uses **1000**).
- Tailwind remaps `--color-*` to `var(--ds-*)` via `@theme inline`, so classes
  like `bg-background-200`, `text-gray-1000 leftovers`, `border-gray-alpha-400`
  work and are theme-aware; `@custom-variant dark (&:is(.dark *))`.
- **Radius**: xs 2 / sm 4 / md 6 / lg 8 / xl 12 / 2xl 16 — controls use
  `rounded-md` (6px), cards/panels `rounded-lg`/`xl`, docs container radius
  `--radius: 0.625rem`.
- **Shadows**: `--ds-shadow-2xs…2xl` plus _border-composed_ tokens
  `--ds-shadow-border(-small/medium/large)`, `tooltip`, `menu`, `modal`,
  `fullscreen`; utility **material-\*** surfaces = `box-shadow` (hairline border
  `rgba(0,0,0,.08)` / dark `rgba(255,255,255,.145)`) + `bg-background-100` +
  radius. Focus ring = `0 0 0 2px background-100, 0 0 0 4px blue-900/700`.
- **Breakpoints**: sm 401 / md 601 / lg 961 / xl 1200 / 2xl 1400 px; sidebar
  desktop starts at 961px.

### Typography utilities

`text-heading-72/64/56/48/40/32/24/20/16/14` (Geist, font-weight 450, tight
negative tracking, `strong` → gray-900), `text-label-16/14/13/12` (+ mono
variants), `text-copy-20/18/16/14`, `text-button-16/14/12`. Prose mapping:
`.prose` h1→heading-32, h2→heading-24, h3→heading-20, h4→heading-16,
h5/h6→heading-14; the docs page title (`#nd-page h1`) → `text-heading-40 tracking-tighter`.

### Shiki / code

`geistShikiTheme` (exported from `source-config`) — Geist token palette mapped
to `--ds-*`; `pre` is replaced by the package `CodeBlock` (numbered mono lines,
copy button, tabs via `CodeBlockTabs`).

### Layout anatomy

- **Navbar** (`dist/navbar` + `internal/navbar/navbar-shell`): `sticky top-0
z-40 h-16 bg-background-200`, container `max-w-[1448px]`, bottom divider is a
  scroll-triggered `shadow-[0_1px_0_0_var(--ds-gray-alpha-400)]` (borderless on
  home routes until scroll, hidden while menus open). Left: logo (`ml-4`) +
  `navbarVariant: "oss"|"standard"` desktop menu; right: Search button
  (`h-10`→`h-8 w-[150px]` with `⌘K` kbd), **Ask AI** outline button, **GitHub**
  icon button, hamburger mobile menu. All smaller utility buttons 28–32px with
  tooltips.
- **Sidebar** (`dist/sidebar`): `w-[300px]`, `pt-14`, sticky under the navbar
  (`--fd-docs-row-1: 4rem`), scroll-fade mask, hidden scrollbar. **Two modes**:
  - `"sections"` — two-pane flyover: root pane = docs _sections_ (Docs /
    Providers / Cookbook), clicking one slides to that section's tree with a
    Back header (the ai-sdk.dev pattern).
  - `"tree"` — single tree.
  - Rows `h-9 rounded-md`, selected = `bg-gray-200`, hover = `bg-gray-alpha-100`,
    labels `text-button-14`, sep labels `text-label-13`, disclosure = 16px
    chevrons in `size-8` buttons; `badge` pill `text-button-12`; mobile = left
    `Sheet` w/ `h-16` "Browse" header.
- **Docs layout** (`GeistdocsDocsLayout` → Fumadocs `DocsLayout`):
  `--fd-docs-row-1: 4rem`, container `max-w-[1448px] bg-background-200`,
  `<main class="contents">`; Fumadocs nav/search/theme switches disabled (the
  package supplies its own in the navbar); sidebar not collapsible. Fumadocs
  tokens remapped to Geist (`--color-fd-*` → `--ds-*`).
- **Docs page** (`createDocsPage`): Geist heading title, TOC (hidden
  scrollbar + fade), **page actions** — Edit on GitHub, Copy Page, View as
  Markdown, Ask AI, Scroll-to-top; feedback widget (`siteId`); last-modified;
  `full` frontmatter for edge-to-edge pages; `MobileDocsBar` on top on mobile.
- **Footer** (`dist/footer`): full-width Geist footer.

### MDX components

`createMdxComponents(components)` composes:

- `fumadocs-ui/mdx` defaults (incl. `Tabs`/`Tab`, `Callout`/`Note`),
- `pre → CodeBlock`, `a` → localized link (Geist style, `text-gray-1000 no-underline`),
- `Callout(Container/Title/Description)`, `CodeBlockTabs(…|List|Trigger|Tab)`,
  `TypeTable`, `CopyPrompt`, `Mermaid`, `Video` (react-player),
- then **app-supplied** components — for this repo's content:
  `Browser`, `Check`, `Cross`, `GithubLink`, `InstallPackages`,
  `OfficialModelCards`, `CommunityModelCards`, `PreviewSwitchProviders`,
  `QuickstartFrameworkCards`, `Snippet`, `Templates` (539 real usages of
  `Snippet`, 534 `Check`/`Note`, 323 `Cross`, 110 `Tabs`, 16 `Browser`).

### Frontmatter / meta schemas (`geistdocsFrontmatterSchema` / `geistdocsMetaSchema`)

- Docs frontmatter: `title`, `description`, `icon`, `full`, `_openapi`,
  `badge`, `product`, `navTitle`, `url`, `type`
  (`conceptual|guide|reference|troubleshooting|integration|overview`),
  `prerequisites[]`, `related[]`, `summary`, `lastModified`, `internal`,
  `noindex`, `tags[]`, `keywords[]`, `canonical`, `excludeFrom[]`
  (`chat|llms|search|sitemap`).
- `meta.json`: `title`, `pages[]` (order + `---Section---` separators), `root`,
  `defaultOpen`, `icon`, `description`.
- `defineGeistdocsSourceConfig()` adds the Geist Shiki theme, `lastModified`,
  mermaid remark, and processed-markdown postprocessing to Fumadocs MDX.

### Config surface (`defineConfig`)

`title`, `logo`, `logoHref`, `basePath`, `nav[]` (links + full-width
dropdowns), `navbarVariant: "oss"|"standard"`, `navbarOssProducts[]`,
`navbarActiveProduct`, `navbarGithub`, `github{owner,repo,branch,editPath}`,
`content: [{id,label,dir,route}]` (route families → sidebar sections +
markdown inference), `siteUrl`, `siteId` (feedback/analytics),
`translations`, `defaultLanguage`, `versions`, `feedback`, `search`,
`pageActions`, `ai{prompt,suggestions,retrieval,eveAgent,footer}`,
`agent{product,api,mcp,links,instructions}` (→ `agents.md` + MCP manifest),
`footer`.

### Constraints (published package)

`next ^16.3.3`, `react/dom ^19.2.3`, `tailwindcss ^4.1.17`, Node ≥ 20.9; ships
AI SDK v6 (`ai` ^6, `@ai-sdk/react` ^3). It pins Transformed deps exactly.

## 3. Current state of `@ai-toolkit/docs`

- `apps/docs` is **content-only**: `content/{docs,providers,cookbook}/*.mdx`
  (+ `gateways-registry`, `tools-registry` data), `source.config.ts`,
  `tsconfig.json`, a stub `package.json`. **No app/ dir, no layout, no
  components, no rendering.**
- `source.config.ts` already imports `defineGeistdocsSourceConfig`,
  `geistdocsFrontmatterSchema`, `geistdocsMetaSchema`, `geistShikiTheme` — but
  from `'source-config'` (a de-branded rename of
  `@vercel/geistdocs/source-config`, commit `8311b9f`). No such package is
  installed, so the collection config cannot resolve today.
- Content uses Geistdocs-native frontmatter (`title`/`description` + the
  composites above) and **has no `meta.json` files**, so sidebar order/labels
  are unmanaged. Folders carry `00-`/`01-` numeric prefixes.
- Repo baseline: www/studio are Next 15 + React 18 + Tailwind v3; root pins
  `next 15.0.7` (devDep), Node v24, pnpm 10.

## 4. Gap analysis

| Geistdocs (package)                               | apps/docs today                         |
| ------------------------------------------------- | --------------------------------------- |
| Next 16 + React 19 + Tailwind v4 stack            | no renderer (repo baseline Next 15/TW3) |
| `@vercel/geistdocs` runtime (Apache-2.0)          | renamed to `source-config`, unresolved  |
| Navbar h-16 `bg-background-200` + Ask AI + search | absent                                  |
| 300px sections/tree sidebar + mobile Sheet        | absent                                  |
| Docs layout `max-w-[1448px] bg-background-200`    | absent                                  |
| `--ds-*` OKLCH theme-aware tokens + typography    | absent (www uses HSL dark-only tokens)  |
| Fumadocs-token remap + Shiki Geist theme          | no build                                |
| MDX composites + 12 app content components        | references but no registry              |
| `meta.json` sidebar metadata                      | missing                                 |
| Search, Ask AI, `llms.txt`, `.mdx`, proxy         | absent                                  |

## 5. Decision: how to take the dependency

**Recommendation — Track A: package-backed, rebranded alias.** Keep the
published runtime but consume it under a neutral import so the fork's
de-branding holds and the content's `source-config` import keeps working:

1. Add `"@vercel/geistdocs": "^1.26.1"` to `apps/docs` deps (`--save-exact`),
   and alias the schema rail: `"source-config": "npm:@vercel/geistdocs@1.26.1"`
   won't remap subpaths, so instead fix `apps/docs/source.config.ts` to import
   from `@vercel/geistdocs/source-config` (one-line revert of `8311b9f`), or
   alias with `pnpm.overrides`/a `source-config` re-export shim package if
   keeping the neutral name is mandatory.
2. Copy the package `template/` app structure verbatim into `apps/docs` as the
   app skeleton (thin adapters only), then overlay this repo's content and
   content components.
3. Upstream already runs this exact shape; upgrades come by bumping the package
   (avoids 3k lines of copied, forked UI per Vercel's own migration). License
   (Apache-2.0) permits this.

**Track B (fallback): fully vendored fork.** Mirror `vercel/geistdocs` into
`packages/special/geistdocs` (de-branded), keep the `source-config` name.
Largest effort, full control, forks the runtime. Only choose this if Track A's
`@vercel/*` names are prohibited outright.

**Track C (not recommended): hand-rolled re-implementation** of tokens +
layout + components (the approach used for www/studio). Doubles maintenance,
loses Search/Ask AI/`.mdx` routing/feedback unless re-implemented. Only the
token layer (phase 6) is worth doing locally.

## 6. Phased plan (Track A)

### Phase 0 — Dependency & scaffolding

- `apps/docs/package.json`: add `@vercel/geistdocs@1.26.1` (exact),
  `next@^16.3.3`, `react@^19.2`, `react-dom@^19.2`, `tailwindcss@^4.1`,
  `@tailwindcss/postcss`, `fumadocs-core/ui/mdx` (peer-pinned by the package),
  `ai` v6 + `@ai-sdk/react` (Ask AI), `zod` (schema), `lucide-react`.
  Keep private, add `dev/build/start/lint/type-check` scripts.
- Revert `apps/docs/source.config.ts` import to
  `@vercel/geistdocs/source-config` (keeps collections + Shiki theme).
- Copy `template/` structure: `app/`, `components/geistdocs/`,
  `lib/geistdocs/`, `proxy.ts`, `next.config.ts` (wrap `createGeistdocs`,
  enable `cacheComponents` + `partialPrefetching`), `postcss.config.mjs`,
  `tsconfig.json` (Next 16 + `@/*` paths).
- `pnpm install`, update root tsconfig.json refs if `apps/*` are aggregated.

### Phase 1 — Design tokens & base styles

- `app/styles/geistdocs.css`: `@import "tailwindcss";`
  `@import "fumadocs-ui/css/shadcn.css"; @import "fumadocs-ui/css/preset.css";
@import "tw-animate-css"; @import "@vercel/geistdocs/theme.css";`
  (do NOT re-`@source` the package — `theme.css` already does).
- `app/global.css` imports geistdocs.css; keep **both light and dark** via
  `next-themes` `ThemeProvider` (package is theme-aware; `www` is dark-only,
  docs is not).
- Wire `mono`/`sans` Geist font variables in `app/[lang]/layout.tsx`
  (`template/lib/geistdocs/fonts.ts`).

### Phase 2 — Site config & content wiring

- `geistdocs.tsx`: `title = "AI TOOLKIT Documentation"`; `logo` (AI TOOLKIT
  wordmark, `text-gray-1000 text-lg font-semibold tracking-[-3%]`-style);
  `github = { owner: "xeondesk", repo: "ai-toolkit", branch: "main",
editPath: "apps/docs/content/{path}" }`; `nav = [Docs, Cookbook, Providers]
  - GitHub`; Ask AI `prompt`+`suggestions`; `siteId = "ai-toolkit-docs"`;
`siteUrl` from env.
- `lib/geistdocs/config.tsx`: `defineConfig({ content: [
{ id: "docs", label: "Docs", dir: "content/docs", route: "/docs" },
{ id: "providers", label: "Providers", dir: "content/providers", route: "/providers" },
{ id: "cookbook", label: "Cookbook", dir: "content/cookbook", route: "/cookbook" } ] })`
  → powers the **sections-mode** sidebar switcher and markdown inference.
- `lib/geistdocs/source.ts`: `createSource` for the three collections.
- **Sidebar metadata**: add `meta.json` per content folder (`pages` arrays,
  `root: true` on top-level, `---Section---` separators) so the tree matches
  upstream ai-sdk.dev ordering and labels; drop reliance on numeric prefixes.

### Phase 3 — Layout shell

- `app/[lang]/layout.tsx`: `Navbar` + `Footer` inside `GeistdocsProvider`;
  h-16 chrome, `max-w-[1448px]` container, scroll divider, Search/Ask AI/GitHub
  action cluster (all package-provided).
- `app/[lang]/docs/layout.tsx` → `components/geistdocs/docs-layout.tsx`
  (`GeistdocsDocsLayout`, `max-w-[1448px] bg-background-200`,
  `sidebarMode: "sections"`).
- Provider component wires `GeistdocsProvider`, `@vercel/analytics/next`,
  `@vercel/speed-insights/next`, `ThemeProvider` (docs supports light+dark).

### Phase 4 — Docs page, actions, AI-readable routes

- `app/[lang]/docs/[[...slug]]/page.tsx`: `createDocsPage` (TOC, OG,
  `renderTop` → `MobileDocsBar`).
- `proxy.ts`: `createProxy` with markdownRoutes for `/docs`, `/providers`,
  `/cookbook` → `/[lang]/llms.mdx/*path`.
- Routes: `llms.txt`, `llms.mdx`, `sitemap.md`, `agents.md`,
  `/.well-known/mcp.json`, `rss.xml` + `app/api/search|chat/route.ts`, smart
  not-found, `robots.ts`/`sitemap.ts` (package helpers). Skip OG images/versions
  unless upstream parity is required.

### Phase 5 — Content components (`components/geistdocs/mdx-components.tsx`)

`createMdxComponents({ ... })` registering the app-owned components the
content actually uses (fence-safe scan): `Note(Tabs,Tab,Callout)`,
`Snippet` (512 usages), `Check`/`Cross` (457/323), `GithubLink`, `Browser`,
`Templates` (`type="starter-kits|feature-exploration|frameworks|generative-ui|security"`),
`OfficialModelCards`/`CommunityModelCards` (provider registry),
`PreviewSwitchProviders`, `QuickstartFrameworkCards`, `InstallPackages`.
Port these as thin local components (they are ai-sdk.dev content components,
not package exports). Confirm no other tag (e.g. `MyUIMessage`) leaks from code
fences.

### Phase 6 — Parquet with www/studio (optional)

- Promote the Geist token layer (step 1 tokens) into a shared
  `packages/design` (or vendor `theme.css` into www/studio) so the three apps
  stop drifting. Do **not** retro-apply the full layout to www/studio —
  their shells are intentionally different.

## 7. Target file tree

```
apps/docs/
├── geistdocs.tsx                      site facts (title, logo, nav, github, ai, siteId)
├── next.config.ts                     createGeistdocs + cacheComponents
├── postcss.config.mjs / tsconfig.json / package.json
├── proxy.ts                           createProxy (markdown negotiation)
├── app/
│   ├── global.css, styles/geistdocs.css
│   ├── [lang]/layout.tsx              Navbar + Footer + GeistdocsProvider
│   ├── [lang]/docs/layout.tsx         DocsLayout(tree)
│   ├── [lang]/docs/[[...slug]]/page.tsx   createDocsPage
│   ├── [lang]/{llms.txt,llms.mdx,sitemap.md,agents.md,.well-known/mcp.json,rss.xml}/route.ts
│   ├── api/{search,chat}/route.ts
│   └── [lang]/[...not-found]/route.ts
├── components/geistdocs/{provider,docs-layout,mdx-components}.tsx
├── lib/geistdocs/{config.tsx,source.ts,fonts.ts,i18n.ts,site-url.ts,...}
├── content/{docs,providers,cookbook}/...   (unchanged + new meta.json files)
└── source.config.ts                    (import fixed)
```

## 8. Non-goals / risks

- **No vendored fork** of the runtime unless Track A is blocked (see §5).
- **www/studio stay untouched** except an optional shared-token extraction.
- **No dark-only constraint**: docs gets the full theme-aware Geist scheme
  (light + dark), unlike www/studio.
- **No custom Fumadocs layout hacks**: keep
  `nav/searchToggle/themeSwitch: disabled`, sidebar `collapsible: false`,
  `tabMode: "auto"` exactly as the package layout does.
- **Risk: stack divergence.** Next 16/React 19/TW4 in apps/docs vs Next
  15/React 18/TW3 elsewhere; isolate via per-app deps, and confirm
  `turbo build --filter=docs` in CI. Node ≥ 20.9 (repo already on 22/24).
- **Risk:** the package pins exact fumadocs/next peer versions — record
  resolved versions in the lockfile; don't dedupe against repo-wide next 15.
- **Risk:** `@vercel/analytics`/`@vercel/speed-insights` add non-workspace
  deps — acceptable for the docs deploy; make them optional behind the
  `siteId`/Vercel env checks.
- **No changeset** — the app is private/unpublished (same as www/studio).

## 9. Verification

From `apps/docs`:

1. `pnpm install` then `pnpm exec fumadocs dev` (or `pnpm dev`) — collections
   build from `source.config.ts`.
2. `pnpm type-check` — Next 16 + `@vercel/geistdocs` types resolve.
3. `pnpm lint`.
4. `pnpm build` — confirm SSG output includes `/docs`, `/providers`,
   `/cookbook` trees, `llms.txt`, `sitemap.md`, `agents.md`.
5. Smoke: dark/light toggle, sections sidebar flyover, `/docs` TOC + page
   actions (Edit/Copy/Markdown), `/docs/<page>.mdx` returns `text/markdown`,
   search dialog `⌘K`, Ask AI prompt, mobile sidebar Sheet.
6. `pnpm prettier-fix` on this app's files only (repo Prettier baseline is not
   clean on pre-existing files).
