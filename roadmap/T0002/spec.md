# Spec: T0002 Radix UI Starter — themeable chat demo and UI component library

## Restate of intent

- **Outcome:** A runnable chat demo under `demos/radix-ui-starter` plus a reusable
  component library that models token-driven, accessible UI on Radix UI. A theme
  switcher in the header swaps between several complete token themes.
- **User:** AI agents first (they need a working reference for wrapping Radix,
  composing layout with tokens, and shipping multiple themes), humans second.
- **Why now:** The token contract is defined and the `follow-the-rules` skill cites
  `src/` conventions, but no implementation exists to prove or teach them.
- **Success:** The dev server shows a working chat; the header switches themes
  instantly; tests and checks pass; every UI element comes from our component library;
  no raw colors, sizes, or radii appear in component CSS.
- **Constraint:** Bun-native toolchain, React + TypeScript, client-side only, no
  backend, no secrets.
- **Out of scope:** Real LLM or backend integration, authentication, persistence,
  other demos (they will live under `demos/` later), a full Radix component gallery,
  and user-authored custom themes.

## Objective

Build `demos/radix-ui-starter`, the canonical reference application for the Design
Systems Applied approach. It features a chat interface backed by a client-side ELIZA
chatbot (Joseph Weizenbaum, MIT, 1966 — public domain algorithm and DOCTOR script).
Radix UI primitives are re-exposed through our own library:

- `src/components/ui/` — Radix UI wrappers and pure UI primitives (Button, TextField,
  DropdownMenu, Dialog, Avatar, and so on). `Button` supports the sizes `sm`,
  `default`, and `lg`, and the variants `primary`, `secondary`, `ghost`, `success`,
  `warning`, `danger`, and `info`, plus an optional leading icon.
- `src/components/base/` — typography primitives (`Heading`, `Text`) that must be used
  instead of raw HTML text tags, plus `Icon`, which renders a bundled SVG file inline
  so its strokes follow `currentColor`. Icons live in `src/assets/icons/` as plain
  `.svg` files; no external icon library.
- `src/components/layout/` — `Container`, `VStack`, `HStack`, `Grid`.
- `src/components/chat/` — product-named components for the demo itself (ChatPanel,
  ChatHeader, ThemeSwitcher, MessageList, Message, Composer, and so on).

The demo is exemplary, not a mockup. It must be tested, documented, and conform to the
project rules, so agents can copy its patterns with confidence.

## Theming

The demo ships **four complete themes**, each a full token set in its own
`design-tokens.css`, written to the same token contract:

1. **Reference** — the default lightweight editorial theme (black, off-white, one
   yellow accent) from `skills/design-system-tokens/references`.
2. **Monokai** — ported to our token set.
3. **Dracula** — ported to our token set.
4. **Gruvbox** — ported to our token set.

A `ThemeSwitcher` (a `ui/DropdownMenu`) in the chat header selects the active theme.
Switching is client-side and instant.

Contract rules for each theme:

- Each theme is a directory `themes/<name>/` with `DESIGN.md` (front matter + prose)
  and `design-tokens.css`. The front matter and the stylesheet hold identical values,
  exactly like the reference theme.
- `color-variants.css`, `reset.css`, and `utilities.css` are theme-agnostic. They live
  once in `src/styles/` and read whatever values the active theme defines with `var()`.
- The theme selection is a runtime choice, not a token. It never appears in a
  `DESIGN.md` front matter.

Porting rules (so the classic palettes stay recognizable):

- Map each palette onto the fixed token roles: background → `surface.*`, foreground →
  `text.*`, primary accent → `brand.*`, and semantic colors → `action.*`.
- Keep the accent readable: on dark themes, text uses the foreground token, not the
  accent. Accent is for highlights, selection, and CTAs.
- Contrast must stay legible on the theme's own surfaces.

## Tech stack

- **Runtime and bundler:** Bun (`Bun.serve` + `Bun.build`, or `bun --hot`) — the repo
  already standardizes on Bun and the `live-debug` command expects `bun --hot`.
- **UI:** React + TypeScript, Radix UI unstyled primitives (`@radix-ui/react-*`).
- **Styling:** plain CSS consuming the design tokens with `var()` only. The demo
  carries its own themes, because the demo is a project that applies the skill.
- **Testing:** `bun test` only. Tests cover pure logic (ELIZA, `clsx`, theme registry)
  and the theme token contract. Component rendering tests are intentionally omitted:
  Radix UI primitives are already well tested upstream, and our library only adds
  styling.

## Commands

Planned (the package owns its scripts; the root keeps the repo-wide gates):

```
Install:    bun install
Dev:        bun run --cwd demos/radix-ui-starter dev     # Bun dev server, HMR
Build:      bun run --cwd demos/radix-ui-starter build
Test:       bun test
Check:      bun run check
Typecheck:  bun run typecheck
```

## Project structure

```
demos/radix-ui-starter/
├── AGENTS.md                      rules for this demo (app-level)
├── README.md                      what the demo shows and how to run it
├── package.json
├── index.html
├── themes/                        one complete Design System per theme
│   ├── reference/                 DESIGN.md + design-tokens.css (default)
│   ├── monokai/                   DESIGN.md + design-tokens.css
│   ├── dracula/                   DESIGN.md + design-tokens.css
│   └── gruvbox/                   DESIGN.md + design-tokens.css
├── src/
│   ├── AGENTS.md                  TypeScript rules for src/
│   ├── main.tsx                   app entry
│   ├── App.tsx                    composes the chat page
│   ├── components/
│   │   ├── AGENTS.md              component rules (tiers, styling, tests)
│   │   ├── base/                  Heading, Text, Icon
│   │   ├── ui/                    Button, TextField, DropdownMenu, Dialog, Avatar...
│   │   ├── layout/                Container, VStack, HStack, Grid
│   │   └── chat/                  ChatPanel, ChatHeader, ThemeSwitcher,
│   │                              MessageList, Message, Composer...
│   ├── assets/
│   │   └── icons/                 add.svg, send.svg
│   ├── lib/
│   │   ├── clsx.ts                internal class-name combiner + clsx.test.ts
│   │   ├── eliza/                 eliza.ts, doctor-script.ts, eliza.test.ts
│   │   └── theme/                 theme registry + useTheme hook
│   └── styles/                    color-variants.css, reset.css, utilities.css
```

The existing `packages/radix-ui-starter/` placeholder moves to
`demos/radix-ui-starter/`. The root `README.md` and `AGENTS.md` layouts change from
`packages/` to `demos/`.

## Code style

Conventions for the demo, to be written into `src/AGENTS.md` and
`src/components/AGENTS.md` (the `follow-the-rules` skill already expects these):

- Arrow-function components only. `React.FC<Props>` for components.
- Mandatory JSDoc on exported symbols. Object parameters use named interfaces.
- DOM element variables use the `Elt` suffix (for example `headerElt`).
- No `any`. `unknown` only at true boundaries, with the boundary stated in JSDoc.
- Comments explain *why* only at non-obvious branches.
- Component tiers: product-named components never in `layout/` or `ui/`; dependencies
  flow downward only (`chat` → `ui`/`layout`/`base`).
- Typography goes through `base/Heading` and `base/Text`; no raw `h1`–`h6` or `p`.
- Logic modules have colocated tests. The stylesheet import is the last import.
  (Component rendering tests are intentionally omitted; Radix primitives are already
  tested upstream and this library only adds styling.)
- Component CSS uses tokens only: `var(--...)`, never raw colors, sizes, or radii.
- **Unique class per component, prefixed by tier.** Every component's root element
  carries exactly one class: `ui-<name>`, `base-<name>`, `layout-<name>`, or
  `chat-<name>` (for example `ui-button`, not `.button`). This prevents clashes between
  common names across the app.
- **Scoped stylesheets.** All rules in a component stylesheet are written inside the
  component's root selector. Use native CSS nesting for states and descendants, so the
  file reads as one block and IDEs can fold it.
- **Class composition with `clsx()`.** Build every `className` value with the internal
  `clsx()` utility (`src/lib/clsx.ts`). Never concatenate strings by hand and never add
  an external class-name library. It accepts strings, falsy values, and conditional
  objects: `clsx("ui-button", { "is-loading": loading })`.
- **Named states as classes.** Every named state of a component has a class scoped
  under its root: `is-<state>` (for example `.ui-button.is-loading`). The stylesheet
  styles these classes, so the state vocabulary is visible on both sides. When Radix
  exposes a state only as a `data-*` attribute, the wrapper mirrors it to the matching
  `is-*` class. Common states: `is-disabled`, `is-loading`, `is-active`, `is-open`,
  `is-selected`, `is-invalid`, `is-readonly`, `is-placeholder`.

Example:

```tsx
import { clsx } from "../../lib/clsx";
import "./Button.css";

interface ButtonProps {
	label: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

/**
 * Token-styled button. Named states are exposed as `is-*` classes.
 */
export const Button: React.FC<ButtonProps> = ({ label, onClick, loading, disabled }) => (
	<button
		type="button"
		className={clsx("ui-button", { "is-loading": loading, "is-disabled": disabled })}
		disabled={disabled || loading}
		aria-busy={loading}
		onClick={onClick}
	>
		{label}
	</button>
);
```

```css
/* Button.css — every rule is scoped under .ui-button */
.ui-button {
	background: var(--color-brand-primary);
	color: var(--color-text-ondark);
	border-radius: var(--rounded-md);
	padding: var(--space-md) var(--space-lg);

	&:hover,
	&:focus-visible {
		background: var(--color-brand-secondary);
	}

	&.is-loading {
		cursor: progress;
	}

	&.is-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
}
```

## Testing strategy

- **ELIZA logic** is pure and tested directly: greeting, reflection, keyword ranking,
  memory, and the quit path, with at least one conversation from the 1966 paper.
- **Theme contract** is tested: every theme defines the full required token set, and
  each theme's `DESIGN.md` front matter matches its `design-tokens.css`.
- **`clsx()`** is a pure utility with its own tests (strings, falsy values, objects).
- **Theme registry logic** (list of themes, active theme, wrapping to default) is
  tested as pure logic.
- Logic modules colocate a `.test.ts`. Component rendering tests are intentionally
  omitted: Radix UI primitives are already tested upstream, and our wrappers only add
  styling.
- New logic starts with a failing test (the `test-driven-development` skill).

## Boundaries

- **Always:** consume tokens with `var()`; keep each theme's `DESIGN.md` and
  `design-tokens.css` values identical; run `bun run check`, `bun run typecheck`, and
  `bun test` before committing; cite `file:line` in reviews.
- **Ask first:** adding runtime dependencies, adding or removing a theme, changing a
  theme's token values, moving code between component tiers, changing the build setup.
- **Never:** commit secrets; add a backend or call a real LLM; write raw colors, sizes,
  or radii in component CSS; add undocumented tokens; use raw `h1`–`h6`/`p`; list the
  theme selection as a design token.

## Success criteria

- [ ] `bun run --cwd demos/radix-ui-starter dev` serves a working chat page.
- [ ] The page is built entirely from `base/`, `ui/`, `layout/`, and `chat/`
      components; no raw text tags appear in pages.
- [ ] The header theme switcher swaps instantly between four complete themes.
- [ ] Every theme defines the same required token set, and each theme's `DESIGN.md`
      matches its `design-tokens.css`.
- [ ] Sending a message appends it and ELIZA replies with a scripted, reflected
      response; the quit path ends the session.
- [ ] Logic modules (ELIZA, `clsx`, theme registry) and the theme token contract have
      passing tests.
- [ ] Every component uses a unique tier-prefixed class, and every component
      stylesheet is scoped under that class.
- [ ] Every named component state has an `is-*` class styled in the component
      stylesheet.
- [ ] `ui/Button` exposes the sizes `sm`/`default`/`lg` and the seven variants, and
      `base/Icon` renders the bundled SVGs in `currentColor` without an icon library.
- [ ] `bun run check`, `bun run typecheck`, and `bun test` pass at the repo root.
- [ ] `follow-the-rules` resolves against the demo's `AGENTS.md` files.
- [ ] `README.md` explains what the demo shows, the themes, and how to run it.

## Open questions

1. React and Radix package versions: pin React 19 and the latest `@radix-ui/react-*`
   ranges? Recommendation: yes, latest stable.
2. Runtime theme switching mechanism: swap the theme `<link>` `href`, or load all
   themes and toggle each `<link>`'s `disabled` property? Recommendation: load all
   theme links and toggle `disabled`. Every theme file keeps its `:root` block, so the
   contract is unchanged, and switching is instant with no reflow or FOUC.
3. Per-theme `DESIGN.md`: full annotated prose for all four, or full front matter with
   brief prose for the classic ports? Recommendation: brief prose for the ports.
4. DOM test environment: `happy-dom` (lighter) vs `jsdom`. Recommendation: `happy-dom`.
5. Should `packages/` be removed entirely once the placeholder moves to `demos/`?
   Recommendation: yes, keep `demos/` as the single home for demos.
6. `follow-the-rules` currently cites root `src/AGENTS.md`; should it cite the demo's
   `src/AGENTS.md` instead? Recommendation: make the skill resolve the nearest
   `src/AGENTS.md` under the reviewed path.
7. Component rendering tests are intentionally omitted, not deferred: Radix UI
   primitives are already tested upstream and this library only wraps them with
   styling. The demo's `AGENTS.md` must state this exception to the `follow-the-rules`
   "one test per source" rule, with that rationale.
