# apps/www UI Refactoring Plan — ai-sdk.dev/playground design language

Source reference: `https://ai-sdk.dev/playground` (client-rendered SPA, Geist UI).
This plan moves the marketing site closer to that design language without
turning it into an SPA.

## Design signals captured (from the playground shell)

- **Two-tone surface system**: content surfaces `bg-background-100`, raised
  chrome `bg-background-200` (top nav, panel headers). www currently has one
  flat `--background` + near-identical `--card`.
- **Alpha borders**: `border-gray-alpha-400` / `bg-gray-alpha-200` — soft RGBA
  borders instead of a single opaque `--border`.
- **App-shell chrome**: sticky h-16 top nav, w-14 left icon rail with
  tooltip icon buttons (New Chat, History), `w-[260px]` History drawer with
  `translate-x` reveal.
- **Panel anatomy**: `rounded-md` panel, `h-14` header with
  `bg-background-200 backdrop-blur shadow-[...]`, left/right header actions.
- **Numbered code lines**: `data-geist-code-block-line` — mono, line numbers.
- **Icon grammar**: small (14–16px) icons in ~28–32px tooltip buttons.
- **Slim chrome, wide canvas**: `max-w-[1448px]` container on nav.

## Gap analysis (current www)

| ai-sdk.dev                                   | apps/www today                                     |
| -------------------------------------------- | -------------------------------------------------- |
| `background-100` / `background-200` surfaces | flat `--background` + `--card` (indistinguishable) |
| RGBA alpha borders                           | single opaque `--border: 0 0% 18%`                 |
| h-16 sticky chrome with backdrop blur        | h-14 nav, no blur                                  |
| icon rail + drawer app shell                 | static compare card, no shell                      |
| `rounded-md` controls, tooltip icon buttons  | `rounded-lg` buttons, no tooltips                  |
| numbered code-line blocks                    | wrapped `<p>` text, no line numbers                |

## Phases

### Phase 0 — Token layer (foundation)

- `app/globals.css`: add surface tokens while keeping existing vars:
  - `--background-100: 0 0% 8%` (content surfaces), `--background-200: 0 0% 11%`
    (chrome), `--background-300: 0 0% 14%` (hover).
  - Keep `--background: 0 0% 6%` as the page canvas and make `--card` alias
    `--background-100` (remove divergence).
- `tailwind.config.js`: add
  - `colors.surface: { DEFAULT: 'hsl(var(--background-100))', 100/200/300 }`
    (do NOT nest under `background`, which would break `bg-background`).
  - `colors['alpha-border']: 'rgb(255 255 255 / 0.08)'` and
    `colors['alpha-border-strong']: 'rgb(255 255 255 / 0.14)'`.
  - `borderRadius.tooltip`, keep `rounded-md` for controls vs `rounded-xl` for
    cards.

### Phase 1 — Chrome (nav + footer)

- `components/nav.tsx`: `h-14` → `h-16`, `bg-surface-200/80 backdrop-blur`,
  `border-b border-alpha-border-strong`.
- `components/footer.tsx`: top divider to `border-alpha-border`,
  tertiary links → `text-gray-500`-style muted (closer to drawer footer).

### Phase 2 — Rebuild `PlaygroundCompare` as an app-shell mock

- Right sidebar of `/playground` is the top-visual page asset; give it the real
  playground's shell anatomy:
  - Outer `rounded-xl border border-alpha-border-strong bg-surface-100`.
  - Left icon rail `w-10 border-r border-alpha-border` with tooltip icon buttons
    (New Chat `+`, History clock), top-aligned; `title` attr tooltips.
  - Model "panel" columns: `md:grid-cols-2`, each panel `h-12` header
    `bg-surface-200 backdrop-blur shadow-[...]` with mono model label + status
    chip; prompt bar above the columns; response bodies as numbered code lines.
- Move the `Explain / Extract / Haiku` tab row from the muted header into the
  shell (header-strip or rail) — keep the `useState` behavior.
- Reuse existing `comparisons` data; no new data.

### Phase 3 — Reusable primitives

- `components/code-block.tsx`: numbered mono lines
  (`data-geist-code-block-line`-style) with copy button, alpha border.
- `components/icon-button.tsx`: `aria-label` tooltip button primitive
  (28–32px square, hover raise to surface-200).
- Use both inside the compare mock; keep `code-block` SSR-safe (copy =
  `'use client'` or progressive enhancement).

### Phase 4 — Playground landing page restyle

- `app/playground/page.tsx` + `lib/playground.ts`/`components/playground-compare.tsx`:
  - Feature / provider / sample-prompt cards: `bg-card` → `bg-surface-100`,
    `border-border` → `border-alpha-border`, hover → `bg-surface-200`.
  - Capability chips: `bg-muted` → `bg-white/5` alpha style, keep mono caps.
  - CTA panel: surface-100 with alpha top border; primary button unchanged
    (`rounded-lg`, teal).
  - Keep eyebrows and display-scale section titles from the existing pass.

### Phase 5 — (optional) global sweep of catalogs

- Apply the surface system across `resources`, `providers`, `gateways` hubs,
  browsers, and `hero-example`: `bg-card` → `bg-surface-100`, alpha borders,
  `code-block` numbering in hero example. Skip unless Phase 2–4 land clean.

## Non-goals / risks

- **No theme toggle** — www stays dark-only; tokens are dark-tuned.
- **No new font deps** — keep the Geist-first sans stack; don't add
  self-hosted Geist without upstream fonts present.
- **No SPA behavior** — the playground remains an external tool; the mock is
  static, only `toggle` state, no routing/streaming.
- **Keep SSR** — no new client islands beyond existing `playground-compare`.
- Previous committed work (eyebrows, tabs, FAQ, neutral browsers) stays intact;
  this layers the surface system on top.

## Verification

From `apps/www`:

1. `pnpm type-check`
2. `pnpm lint`
3. `pnpm build`
4. `pnpm prettier-fix` on touched files only (repo Prettier baseline is not
   clean on pre-existing files).
