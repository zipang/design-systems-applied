# Spec: T0007 Design token visualizer — Bun + Radix rewrite

## Restate of intent

- **Outcome:** A first-class `tools/ds-visualizer/` application (Bun + React + Radix UI)
  that reads, edits, previews, and saves our dual-file Design System contract
  (`DESIGN.md` + `design-tokens.css`). It reaches feature parity with the Tailwind/shadcn
  `ds-visualizer`, but every element is built from our own components and every style
  consumes a design token.
- **User:** The design-system author or agent who creates and tunes a theme's tokens and
  needs to see them applied live before committing the two contract files.
- **Why now:** The current visualizer contradicts the contract it edits. It renders itself
  with Tailwind and styled shadcn components, so it can neither demonstrate nor validate
  the Applied Design System approach.
- **Success:** Every old panel and interaction has a counterpart in the rewrite; every
  fixed token category is editable with live preview, derived values, and validation;
  `DESIGN.md` and `design-tokens.css` open from and save to disk through a Bun server;
  the tool ships zero Tailwind and zero raw style values; the old app's behavior is
  captured as notes, screenshots, and CSS under the ticket before the rebuild starts.
- **Constraint:** Bun runtime and bundler; component library copied from `radix-ui-starter`;
  token-only CSS; the fixed token list from the core skill; reference clone confined to the
  gitignored `.tmp/ds-visualizer/`.
- **Out of scope:** Extracting a shared workspace UI package; changing the fixed token
  contract or the core skill; touching the existing demos; deploying or publishing the tool.

## Objective

Rewrite the `ds-visualizer` as an in-repo, first-class tool that eats our own dog food.

The reference app is a single ~2,060-line `App.tsx` built on Vite, Tailwind CSS, and
styled shadcn/Radix components. It edits a free-form `--ds-*` theme, persists it to
`localStorage`, and exports a `design-system.css`. The rewrite keeps its interaction model
and replaces its model, styling, and delivery:

| Concern | Old `ds-visualizer` | T0007 rewrite |
|---|---|---|
| Runtime / bundler | Vite, npm/pnpm | Bun (`bun --hot`, `bun build index.html`) |
| Styling | Tailwind v4 + shadcn theme | Token-only CSS, our components |
| Components | Styled shadcn/Radix + MUI + many libs | Our `base`/`ui`/`layout` tiers copied from `radix-ui-starter` |
| Token model | Free-form `--ds-*`, arbitrary scales | Fixed Design System token list (sections 2–7 of the core skill) |
| Files | One CSS export | `DESIGN.md` front matter + `design-tokens.css`, read/written on disk |
| Persistence | `localStorage` + download | Bun server read/save endpoints (server is the source of truth) |

### Parity inventory (old → rewrite)

| Old feature (App.tsx) | Rewrite target |
|---|---|
| Top bar: wordmark, loaded-file badge, Token guide, Load CSS, Export CSS, Reset | Toolbar: project path + dirty/saved badge, Token reference, Open project, Save, Export, Reset |
| Left dot navigation (Type, Color, Spacing, Shape, Components) with active scaling and smooth scroll | Same section navigation, styled from tokens |
| Typography: Headings / Body / Mono tabs; font family picker (Google/System/Adobe, categories, search, lazy load), base size, ratio, steps, line height, weight; editable sample text; computed `rem` rows | Typography: `base`/`display`/`mono` families, the `xs`→`display` scale, weights, line heights, letter spacing; editable sample rows with computed values and an optional scale generator that writes the fixed stylesheet variables |
| Color: Palette (Brand, Action, …) with native color pickers; Usage panels over `surface` variants with WCAG contrast badges and brand/action button samples | Colors: `brand`, `action`, `text`, `surface`; color pickers; usage panels over `surface.base/alt/dark/card` with contrast badges; derived `muted`/`active` variants shown |
| Spacing: base, type (geo/arith), ratio, steps; scale bars; visual preview squares | Spacing: the fixed `xs`→`xxl` scale plus `base`, base always `1rem`; scale bars and preview |
| Shape: border radius steps with previews; elevation levels with blur/spread/y/opacity | Shapes: fixed `rounded` presets, `border` widths (with preset pickers), `elevation` sm/md/lg (with preset pickers) |
| Components: Buttons / Containers / Cards gallery | Components gallery: buttons, containers, cards, form controls built from our components over the edited tokens |
| Token guide modal (CSS variable reference) | Token reference: the fixed path ↔ CSS variable mapping and validation status |
| `localStorage` persistence, inline editable text, contrast badges, footer, back-to-top | Kept where useful; server persistence replaces `localStorage` |

## Tech Stack

- **Runtime / bundler:** Bun. Dev via `bun --hot src/server.tsx`; production via
  `bun build index.html --outdir dist` (mirrors `demos/radix-ui-starter`).
- **UI:** React 19 and Radix UI primitives (`@radix-ui/react-dialog`,
  `react-dropdown-menu`, `react-tabs`, `react-scroll-area`, `react-label`,
  `react-avatar`, `react-popover`/`react-select` as needed, `react-slot`). Versions align
  with `demos/radix-ui-starter` where possible.
- **Language:** TypeScript, strict, `noUncheckedIndexedAccess`.
- **Parsing:** `yaml` (already a root dependency) for `DESIGN.md` front matter.
- **No** Tailwind, no shadcn, no MUI, no class-variance-authority, no external CSS-in-JS.
- **Tool styles:** a self-hosted `DESIGN.md` + `design-tokens.css` (+
  `ui-theme-overrides.css`) for the tool's own chrome, copied in spirit from
  `demos/radix-ui-starter/themes/reference`.

## Commands

```
Install:      bun install                                   # from the repo root (workspaces)
Dev:          bun run --cwd tools/ds-visualizer dev
Build:       bun run --cwd tools/ds-visualizer build
Typecheck:   bun run typecheck                              # root script, extended below
Check:       bun run check                                  # biome
Test:        bun test
```

Root wiring changes:

- `package.json` → `workspaces` adds `"tools/*"`; `typecheck` adds
  `bun run --cwd tools/ds-visualizer typecheck`.
- `tsconfig.json` → `exclude` adds `tools/ds-visualizer` (it has its own `tsconfig.json`,
  like the demo).

## Project Structure

```
tools/ds-visualizer/
├── DESIGN.md                 # the tool's own Design System (source of truth)
├── design-tokens.css         # the tool's own tokens as CSS variables
├── ui-theme-overrides.css    # theme contrast overrides (see T0004)
├── index.html                # HTML entrypoint
├── tsconfig.json             # standalone config with @components/@lib/@styles aliases
├── package.json              # @tools/ds-visualizer workspace package
├── AGENTS.md                 # package rules (mirrors the demo's AGENTS.md)
├── README.md                 # what the tool is and how to run it
└── src/
    ├── server.tsx            # Bun server: HTML import + /api read/save endpoints
    ├── main.tsx              # React entrypoint
    ├── App.tsx               # shell: toolbar, section nav, preview area
    ├── components/
    │   ├── base/             # copied from radix-ui-starter (Box, Heading, Text, Icon)
    │   ├── ui/               # copied + new (Button, TextField, Dialog, Tabs, …)
    │   ├── layout/           # copied (Container, HStack, VStack, Grid, page shell)
    │   ├── editor/           # token editors (ColorEditor, ScaleEditor, FontPicker, …)
    │   └── preview/          # preview surfaces (Typography, Colors, Spacing, Shapes, Components)
    ├── lib/                  # pure logic, colocated tests
    │   ├── design-system.ts  # DesignSystem model, defaults, path ↔ variable mapping
    │   ├── parse-design-md.ts / serialize-design-md.ts
    │   ├── parse-tokens-css.ts / serialize-tokens-css.ts
    │   ├── validate.ts       # section 10 validation rules
    │   ├── scale.ts          # type/spacing scale math
    │   ├── contrast.ts       # WCAG contrast (reuse tools/color-contrast.ts if suitable)
    │   ├── common-props.ts   # copied helper (T0006)
    │   └── clsx.ts           # copied helper
    └── styles/               # shared, theme-agnostic stylesheets
```

Reference material (not committed to the tool):

```
.tmp/ds-visualizer/                 # gitignored clone of github.com/zipang/ds-visualizer
roadmap/T0007/reference/
├── inventory.md                    # feature inventory + behavioral notes
├── screenshots/                    # agent-browser captures per section
└── captured-css/                   # computed styles / CSS rules per section
```

## Code Style

The tool inherits `demos/radix-ui-starter/src/AGENTS.md` and `src/components/AGENTS.md`
verbatim (arrow functions, `import type * as React`, mandatory JSDoc, named interfaces for
object params, `Elt` suffix, no `any`, `clsx()` for class names, stylesheet import last).
The component tier rules apply unchanged: token-only CSS, `var(--token)` only, one
`is-*` class per state, scoped stylesheets.

```tsx
import type * as React from "react";
import { clsx } from "@lib/clsx";
import "./ColorSwatch.css";

interface ColorSwatchProps {
	color: string;
	onChange: (next: string) => void;
	label: string;
}

/**
 * Token-styled color swatch. Clicking it opens the native color picker and reports
 * the chosen value; the swatch itself never writes a raw color into CSS.
 */
export const ColorSwatch: React.FC<ColorSwatchProps> = ({ color, onChange, label }) => (
	<label className="ui-color-swatch" style={{ ["--swatch" as string]: color }}>
		<span className="ui-color-swatch__chip" />
		<input
			type="color"
			value={color}
			aria-label={label}
			onChange={(event) => onChange(event.currentTarget.value)}
		/>
	</label>
);
```

```css
/* ColorSwatch.css — every rule is scoped under .ui-color-swatch */
.ui-color-swatch {
	display: flex;
	gap: var(--space-xs);

	& .ui-color-swatch__chip {
		background: var(--swatch);
		border: var(--border-sm) solid var(--color-surface-dark);
		border-radius: var(--rounded-sm);
	}
}
```

The single permitted inline value is a CSS variable *set from data* (the edited color),
as above. Every other value comes from `var()`.

## Testing Strategy

- **Unit tests (`src/lib/*.test.ts`):** parsing and serializing `DESIGN.md` front matter
  and `design-tokens.css` round-trips to the same text; the path ↔ variable mapping
  follows the skill's tables; validation reports section 10 violations (undocumented
  token, missing token, wrong fallback, `.base` drop); scale math and contrast are exact.
- **Server tests:** the read/save endpoints reject paths outside the allowed project root,
  return the parsed model, and write both files atomically.
- **Contract test:** the tool's own `DESIGN.md` and `design-tokens.css` pass the same
  validator and stay identical in values.
- **Component rendering tests stay omitted** — same documented exception as
  `demos/radix-ui-starter` (`roadmap/T0002/spec.md`).
- **Gates:** `bun run check`, `bun run typecheck`, `bun test`, and the tool build pass.
  Visual parity is checked with `agent-browser` against the reference screenshots.

## Boundaries

- **Always:** edit token values in `DESIGN.md` front matter and `design-tokens.css`
  together and keep them identical; consume tokens with `var()`; keep the token list
  fixed; colocate tests next to logic; run the gates before committing.
- **Ask first:** adding any runtime dependency; adding a workspace or root config change
  beyond the two listed; adding a token to the contract; extending the server API surface.
- **Never:** add Tailwind, shadcn, or a CSS-in-JS runtime; introduce raw colors, sizes, or
  radii in component CSS; commit the `.tmp/ds-visualizer/` clone or any external asset;
  write files outside the user-selected project root.

## Success Criteria

- [ ] `.tmp/ds-visualizer/` is cloned and `roadmap/T0007/reference/` holds the feature
      inventory, per-section screenshots, and captured CSS.
- [ ] `tools/ds-visualizer/` runs with `bun run --cwd tools/ds-visualizer dev` and builds
      with `build`; root `workspaces`, `typecheck`, and `tsconfig` are wired.
- [ ] The tool has its own `DESIGN.md` + `design-tokens.css` and passes the contract
      validator; the previewed theme is scoped so it never overrides tool chrome.
- [ ] Every fixed token category is editable with live preview and derived values:
      typography (families, size scale, weights, line heights, letter spacing), colors
      (brand, action, text, surface) with derived `muted`/`active` variants, spacing
      (`xs`–`xxl`, `base` = `1rem`), shapes (`rounded`, `border`, `elevation` presets).
- [ ] The Components gallery, contrast badges, token reference, and section navigation
      from the old app have counterparts.
- [ ] A project's `DESIGN.md` and `design-tokens.css` can be opened and saved through the
      Bun server, with validation errors surfaced before save.
- [ ] No Tailwind, shadcn, MUI, or raw style values exist in the tool; component library
      files are copied from `radix-ui-starter` and remain token-only.
- [ ] `bun run check`, `bun run typecheck`, `bun test`, and the tool build pass.

## Open Questions

1. **Chrome vs. preview scoping.** Recommendation: the tool's own tokens live on `:root`;
   the edited theme is applied to a container via a `data-preview` scope (or inline CSS
   custom properties), so the two never collide. Confirm this is acceptable.
2. **Default theme source.** Recommendation: seed the editor from the tool's own
   `DESIGN.md` or a `demos/radix-ui-starter/themes/reference` copy, not the old app's
   `INIT` values.
3. **Server surface and safety.** Recommendation: `GET /api/theme?path=…` and
   `POST /api/theme` constrained to a project root selected at launch; reject traversal
   and symlink escapes. Port and root discovery (`--root` flag or cwd) to be decided.
4. **Scale generator.** The fixed tokens are values; the old app computed scales from
   ratio + steps. Recommendation: keep the generator as an input helper, but always write
   the explicit fixed `--font-size-*` / `--space-*` variables.
5. **Font picker providers.** Recommendation: ship Google Fonts (lazy-loaded) and system
   fonts; drop the non-functional Adobe tab or keep it documented as out of scope.
6. **Does `localStorage` stay?** Recommendation: server is the source of truth; keep
   `localStorage` only as unsaved-draft recovery.
