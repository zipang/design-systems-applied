# Implementation Plan: T0002 Radix UI Starter — themeable chat demo and UI component library

## Overview

Build `demos/radix-ui-starter`: an exemplary, themeable chat demo backed by a
client-side ELIZA bot, with a `src/components` library that wraps Radix UI and
composes layout from design tokens. Four complete themes ship as separate
`design-tokens.css` files and switch from a header dropdown. Tests cover pure logic
(ELIZA, `clsx`, theme registry) and the theme token contract.

## Architecture Decisions

- **Demos live in `demos/`, not `packages/`.** Move the placeholder and update the
  root docs. `demos/` is the single home for demo applications.
- **Bun-native pipeline.** Use Bun's HTML import flow: `src/server.tsx` serves
  `index.html` via `Bun.serve`; `dev` runs `bun --hot src/server.tsx`; `build` runs
  `bun build`. No Vite.
- **A theme is a full Design System.** Each theme is `themes/<name>/` with
  `DESIGN.md` + `design-tokens.css`, values identical. Shared, theme-agnostic
  `color-variants.css`, `reset.css`, and `utilities.css` live once in `src/styles/`.
- **Theme switching keeps the `:root` contract.** Load all theme stylesheets and
  toggle each `<link>`'s `disabled` property. No `data-theme` selectors, no reflow.
- **Component conventions per spec:** unique tier-prefixed class (`ui-button`),
  stylesheet scoped under that class with native nesting, named states as `is-*`
  classes, class names combined with the internal `clsx()`.
- **Testing scope:** pure logic and contracts only. No DOM component tests; Radix UI
  primitives are tested upstream and our library only adds styling.
- **Tiers:** `base/` (typography), `ui/` (Radix wrappers and UI primitives),
  `layout/` (Container, VStack, HStack, Grid), `chat/` (product components).

## Task List

### Phase 1: Foundation

- [x] **Task 1: Scaffold the demo package and Bun pipeline**
  - Acceptance: `demos/radix-ui-starter/` has `package.json`, `tsconfig.json`,
    `index.html`, `src/server.tsx`, `src/main.tsx`, `src/App.tsx`; `dev` serves a page
    and `build` produces output; React 19 and the needed `@radix-ui/react-*` packages
    installed.
  - Verify: `bun install`; `bun run --cwd demos/radix-ui-starter dev` serves a page;
    `bun run --cwd demos/radix-ui-starter build` succeeds.
  - Files: `demos/radix-ui-starter/{package.json,tsconfig.json,index.html}`,
    `demos/radix-ui-starter/src/{server.tsx,main.tsx,App.tsx}`
  - Depends: None

- [x] **Task 2: Move the placeholder and update root docs and CI**
  - Acceptance: `packages/radix-ui-starter/README.md` moves to
    `demos/radix-ui-starter/README.md`; empty `packages/` removed; root `README.md`
    and `AGENTS.md` layouts say `demos/`; CI covers the demo gates.
  - Verify: `git grep -n "packages/"`; `bun run check`, `bun run typecheck`, `bun test`
    still pass.
  - Files: `.gitignore`, `README.md`, `AGENTS.md`, `.github/workflows/ci.yml`,
    `demos/radix-ui-starter/README.md`
  - Depends: Task 1

- [x] **Task 3: Author the demo rule files and re-scope `follow-the-rules`**
  - Acceptance: `demos/radix-ui-starter/AGENTS.md`, `src/AGENTS.md`, and
    `src/components/AGENTS.md` state the tier rules, class/state conventions, `clsx`,
    token-only CSS, and the component-test exception; `follow-the-rules` resolves the
    nearest `src/AGENTS.md` under the reviewed path.
  - Verify: every rule path cited by `follow-the-rules` exists.
  - Files: `demos/radix-ui-starter/AGENTS.md`,
    `demos/radix-ui-starter/src/AGENTS.md`,
    `demos/radix-ui-starter/src/components/AGENTS.md`,
    `.agents/skills/follow-the-rules/SKILL.md`
  - Depends: Task 1

### Checkpoint: Foundation
- [x] Dev server serves a page; build passes
- [x] Root gates pass; no `packages/` references remain
- [ ] Review with human before building the library

### Phase 2: Core library primitives

- [x] **Task 4: Add the `clsx()` utility**
  - Acceptance: `src/lib/clsx.ts` accepts strings, falsy values, and conditional
    objects; colocated `clsx.test.ts` covers each case.
  - Verify: `bun test`.
  - Files: `demos/radix-ui-starter/src/lib/clsx.ts`,
    `demos/radix-ui-starter/src/lib/clsx.test.ts`
  - Depends: Task 3

- [x] **Task 5: Add `base/Heading` and `base/Text`**
  - Acceptance: both render through tokens, carry `base-heading` / `base-text` scoped
    classes, use `clsx`, and expose the documented variants and `is-*` states.
  - Verify: `bun run check`, `bun run typecheck`; manual render in `App.tsx`.
  - Files: `.../src/components/base/Heading.tsx`, `Heading.css`, `Text.tsx`,
    `Text.css`
  - Depends: Task 4

- [x] **Task 6: Add `layout/` primitives**
  - Acceptance: `Container`, `VStack`, `HStack`, `Grid` render through tokens, with
    `layout-*` scoped classes and `clsx`; no product-named components in `layout/`.
  - Verify: `bun run check`, `bun run typecheck`; manual compose.
  - Files: `.../src/components/layout/{Container,VStack,HStack,Grid}.tsx` and their
    `.css`
  - Depends: Task 4

- [x] **Task 7: Add `ui/Button` and `ui/TextField`**
  - Acceptance: token-only styling, `ui-button` / `ui-field` scoped classes,
    `is-loading` / `is-disabled` / `is-invalid` / `is-readonly` states, `clsx`; the
    TextField wraps a Radix-friendly input with label and error wiring.
  - Verify: `bun run check`, `bun run typecheck`; manual use in `App.tsx`.
  - Files: `.../src/components/ui/{Button,TextField}.tsx` and `.css`
  - Depends: Task 4

- [x] **Task 8: Add `ui/DropdownMenu`**
  - Acceptance: wraps `@radix-ui/react-dropdown-menu`; Radix `data-*` states mirrored
    to `is-open` / `is-disabled` classes; scoped under `ui-dropdown`.
  - Verify: `bun run check`, `bun run typecheck`; manual open/close.
  - Files: `.../src/components/ui/{DropdownMenu,DropdownMenuItem}.tsx` and `.css`
  - Depends: Task 4

- [x] **Task 9: Add `ui/Dialog`**
  - Acceptance: wraps `@radix-ui/react-dialog`; overlay and content token-styled;
    `is-open` state class; focus trap and escape work.
  - Verify: `bun run check`, `bun run typecheck`; manual open/close.
  - Files: `.../src/components/ui/{Dialog,DialogContent}.tsx` and `.css`
  - Depends: Task 4

- [x] **Task 10: Add `ui/Avatar`**
  - Acceptance: wraps `@radix-ui/react-avatar`; fallback token-styled; scoped
    `ui-avatar`.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `.../src/components/ui/{Avatar,AvatarFallback}.tsx` and `.css`
  - Depends: Task 4

- [x] **Task 10b: Add `base/Icon`, SVG assets, and extend `ui/Button`**
  - Acceptance: `base/Icon` renders bundled `.svg` files inline so strokes follow
    `currentColor`; `src/assets/icons/` holds `add.svg` and `send.svg`; `ui/Button`
    supports sizes `sm`/`default`/`lg`, the action variants `success`/`warning`/
    `danger`/`info`, and an optional leading icon.
  - Verify: `bun run check`, `bun run typecheck`, `bun test`, demo build.
  - Files: `.../src/components/base/{Icon.tsx,Icon.css,icons.ts}`,
    `.../src/assets/icons/*.svg`, `.../src/components/ui/Button.{tsx,css}`
  - Depends: Tasks 5, 7

### Checkpoint: Core library
- [x] All primitives render in `App.tsx`; gates pass
- [ ] Manual visual pass before theming

### Phase 3: Themes

- [x] **Task 11: Add shared styles and the theme registry**
  - Acceptance: `src/styles/{color-variants,reset,utilities}.css` are theme-agnostic;
    `src/lib/theme/` provides the theme list, `ThemeProvider`, and `useTheme`, which
    toggle `<link disabled>`; registry logic has tests.
  - Verify: `bun test`, `bun run check`, `bun run typecheck`.
  - Files: `demos/radix-ui-starter/src/styles/*.css`,
    `demos/radix-ui-starter/src/lib/theme/{themes.ts,ThemeProvider.tsx,themes.test.ts}`
  - Depends: Task 4

- [x] **Task 12: Author the reference theme**
  - Acceptance: `themes/reference/{DESIGN.md,design-tokens.css}` with the NatGeo
    values synced from the skill; front matter and stylesheet identical.
  - Verify: contract test (Task 14) once present; manual render.
  - Files: `demos/radix-ui-starter/themes/reference/{DESIGN.md,design-tokens.css}`
  - Depends: Task 11

- [x] **Task 13: Author the Monokai and Dracula themes**
  - Acceptance: both themes define the full required token set and stay legible on
    their own surfaces; each has `DESIGN.md` + `design-tokens.css` with matching
    values.
  - Verify: manual switch + contract test.
  - Files: `demos/radix-ui-starter/themes/{monokai,dracula}/{DESIGN.md,design-tokens.css}`
  - Depends: Task 12

- [x] **Task 14: Author the Gruvbox theme and the contract test**
  - Acceptance: `themes/gruvbox/*` complete; a test asserts every theme defines all
    required tokens and that each `DESIGN.md` matches its `design-tokens.css`.
  - Verify: `bun test`.
  - Files: `demos/radix-ui-starter/themes/gruvbox/{DESIGN.md,design-tokens.css}`,
    `demos/radix-ui-starter/src/lib/theme/contract.test.ts`
  - Depends: Task 13

### Checkpoint: Themes
- [x] Four themes switch instantly from a temporary control
- [x] Contract test passes
- [ ] Manual contrast review of each theme

### Phase 4: ELIZA and the chat UI

- [ ] **Task 15: Implement the ELIZA engine**
  - Acceptance: `eliza.ts` implements keyword ranking, decomposition, reassembly,
    pre/post substitutions, and memory; `doctor-script.ts` holds the DOCTOR script with
    attribution; tests include a conversation from the 1966 paper and the quit path.
  - Verify: `bun test`.
  - Files: `.../src/lib/eliza/{eliza.ts,doctor-script.ts,eliza.test.ts}`
  - Depends: Task 3

- [ ] **Task 16: Add `chat/Message` and `chat/MessageList`**
  - Acceptance: user/bot roles styled with tokens, `is-user` / `is-bot` state classes,
    scoped `chat-message` and `chat-message-list`; uses `base/Text`.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `.../src/components/chat/{Message,MessageList}.tsx` and `.css`
  - Depends: Tasks 5, 15

- [ ] **Task 17: Add `chat/Composer` and `chat/ChatPanel`**
  - Acceptance: composer sends on submit and disables while ELIZA "types";
    ChatPanel owns the message state and scrolls to the latest message; uses
    `ui/Button`, `ui/TextField`.
  - Verify: `bun run check`, `bun run typecheck`; manual send/receive.
  - Files: `.../src/components/chat/{Composer,ChatPanel}.tsx` and `.css`
  - Depends: Tasks 7, 16

- [ ] **Task 18: Add `chat/ChatHeader`, `ThemeSwitcher`, and compose `App`**
  - Acceptance: header contains the theme dropdown and a "new conversation" Dialog;
    switching themes updates the page instantly; `App.tsx` composes layout and chat
    only from library components.
  - Verify: `bun run check`, `bun run typecheck`; manual theme switch and reset.
  - Files: `.../src/components/chat/{ChatHeader,ThemeSwitcher}.tsx` and `.css`,
    `demos/radix-ui-starter/src/App.tsx`
  - Depends: Tasks 9, 11, 17

### Checkpoint: Demo works
- [ ] End-to-end chat works; theme switcher works; quit path works
- [ ] Root gates pass
- [ ] Human review of the demo before polish

### Phase 5: Polish

- [ ] **Task 19: Write the demo README**
  - Acceptance: explains the demo, the component tiers, and the four themes; documents
    install/run and how to add a theme.
  - Verify: `technical-writing` + `follow-the-rules` review.
  - Files: `demos/radix-ui-starter/README.md`,
    `demos/radix-ui-starter/themes/README.md`
  - Depends: Task 18

- [ ] **Task 20: Dogfood and fix**
  - Acceptance: the page is exercised in a real browser (send messages, switch all
    four themes, open dialog, quit); visual defects fixed; no console errors.
  - Verify: `agent-browser` session against the dev server; screenshots.
  - Files: as needed
  - Depends: Task 19

### Checkpoint: Complete
- [ ] All success criteria in `spec.md` met
- [ ] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bun HTML-import dev/build flow differs from expectation | High | Prove it in Task 1 before anything else; fall back to a hand-rolled `Bun.serve` route + `Bun.build` |
| Native CSS nesting unsupported by the bundler | Med | Verify in Task 6; fall back to flat scoped selectors |
| Radix React 19 compatibility | Med | Install and smoke-test one primitive early (Task 7) |
| Classic palettes fail contrast on our token roles | Med | Manual contrast review at the theme checkpoint; adjust accent/text mapping |
| `<link disabled>` toggling inconsistent across browsers | Med | Test all four themes in Task 20; fall back to swapping `href` |
| Demo scope grows past the ticket | Med | Keep to the listed components; new ideas become a new ticket |
| `bun run check` scans the demo and fails on CSS | Low | Biome already formats CSS; fix in the task that introduces the file |

## Open Questions

- Confirm the four theme names shown to users (`Reference`, `Monokai`, `Dracula`,
  `Gruvbox`).
- Confirm the build command for the demo (`bun build src/index.html --outdir dist` vs a
  `Bun.build` script).
- Confirm that component tests stay out of scope permanently (see `spec.md` open
  question 7).
