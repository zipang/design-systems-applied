# Implementation Plan: T0007 Design token visualizer — Bun + Radix rewrite

## Overview

Build `tools/ds-visualizer/` as a Bun-served, token-styled React + Radix UI application
that reads, edits, previews, and saves our dual-file Design System contract. The work
starts by reproducing the old `ds-visualizer` as a reference (clone, screenshots, captured
CSS, feature inventory), then scaffolds the workspace, copies our component library, builds
the pure contract logic (model, parse, serialize, validate), adds the Bun file API, and
finally assembles the preview sections and editors as vertical slices. The old app's
panels map onto our fixed token categories; its Tailwind/shadcn styling is dropped entirely.

## Architecture Decisions

- **First-class `tools/` workspace package.** `tools/ds-visualizer/` becomes a workspace
  next to `demos/*`. Root `workspaces` gains `"tools/*"`; root `typecheck` gains the
  package; root `tsconfig.json` excludes it so it owns its standalone config.
- **Bun all the way.** Dev via `bun --hot src/server.tsx`, production via
  `bun build index.html --outdir dist`, mirroring `demos/radix-ui-starter`.
- **Component library copied, not shared.** Copy the `base`, `ui`, and `layout` tiers and
  the `lib` helpers (T0006 `common-props`, `clsx`) from `radix-ui-starter`. A shared package
  is explicitly out of scope; extraction can be a later ticket.
- **The tool owns a Design System; the edited theme is scoped.** The tool's chrome consumes
  its own `tools/ds-visualizer/DESIGN.md` + `design-tokens.css`. The edited theme is
  serialized to CSS, its `:root` selector rewritten to `[data-ds-preview]`, and injected so
  only the preview subtree consumes it. Chrome and preview never collide.
- **Contract logic is pure and tested.** `src/lib/` holds the `DesignSystem` model, the
  path↔variable mapping from the core skill's tables, `DESIGN.md` front-matter parsing,
  `design-tokens.css` parsing, and the section 10 validator. No React, no DOM.
- **Server is the source of truth.** A small Bun API reads and writes `DESIGN.md` and
  `design-tokens.css` under a user-selected project directory. Only those two filenames are
  touched; traversal and symlink escapes are rejected. `localStorage` is draft recovery only.
- **Fixed list, editable values.** Token *names* are fixed; the editor changes values. Scale
  generators (ratio/steps) are input helpers that always emit the explicit fixed variables.
- **Vertical slices.** Each preview section (typography, colors, spacing, shapes,
  components) lands as an editable, previewable slice, not as separate model-then-UI passes.

## Task List

### Phase 1: Reference and foundation

- [ ] **Task 1: Capture the reference app's behavior**
  - Acceptance: `ds-visualizer` is cloned into `.tmp/ds-visualizer/` and running; `agent-browser`
    captures per-section screenshots and the computed CSS rules for the toolbar, nav, and the
    Type/Color/Spacing/Shape/Components sections. `roadmap/T0007/reference/inventory.md`
    records every control, state, and interaction, plus any panel missing from the spec's
    parity table. Clone and captures stay out of version control except the notes/screenshots.
  - Verify: reference app served locally and inspected; `inventory.md` cross-checked against
    `src/app/App.tsx`; screenshots open and match the running app.
  - Files: `.tmp/ds-visualizer/` (gitignored), `roadmap/T0007/reference/inventory.md`,
    `roadmap/T0007/reference/screenshots/`, `roadmap/T0007/reference/captured-css/`
  - Depends: None

- [ ] **Task 2: Wire the workspace and the tool package manifest**
  - Acceptance: root `package.json` `workspaces` includes `"tools/*"` and `typecheck` runs the
    new package; root `tsconfig.json` excludes `tools/ds-visualizer`; the package has its own
    `package.json` (`@tools/ds-visualizer`, `dev`/`build`/`typecheck` scripts) and `tsconfig.json`
    with the `@components`, `@lib`, and `@styles` aliases. `bun install` succeeds.
  - Verify: `bun install`; `bun run typecheck` resolves the package (empty for now)
  - Files: `package.json`, `tsconfig.json`, `tools/ds-visualizer/package.json`,
    `tools/ds-visualizer/tsconfig.json`
  - Depends: None

- [ ] **Task 3: Add the Bun server, HTML entry, and React shell**
  - Acceptance: `bun run --cwd tools/ds-visualizer dev` serves a page that renders the app
    shell; `bun run --cwd tools/ds-visualizer build` produces `dist/`. The server uses the HTML
    import and exposes a placeholder `/api/theme` route. No Tailwind; styles connect via a
    token stylesheet import.
  - Verify: dev server in `agent-browser`; the build command succeeds
  - Files: `tools/ds-visualizer/index.html`, `tools/ds-visualizer/src/server.tsx`,
    `tools/ds-visualizer/src/main.tsx`, `tools/ds-visualizer/src/App.tsx`,
    `tools/ds-visualizer/src/styles/index.css`
  - Depends: Task 2

- [ ] **Task 4: Add the tool's own Design System**
  - Acceptance: `DESIGN.md` and `design-tokens.css` define the full fixed token list and stay
    identical in values; `ui-theme-overrides.css` carries the theme contrast layer (per T0004);
    a `styles/reset.css` consumes the tokens. The files pass the core skill's validation rules.
  - Verify: manual comparison of front matter and stylesheet; spot-check against
    `skills/design-system-tokens/SKILL.md` tables
  - Files: `tools/ds-visualizer/DESIGN.md`, `tools/ds-visualizer/design-tokens.css`,
    `tools/ds-visualizer/ui-theme-overrides.css`, `tools/ds-visualizer/src/styles/reset.css`
  - Depends: Task 2

- [ ] **Task 5: Copy the lib helpers and the base tier**
  - Acceptance: `clsx`, `common-props` (+ their tests), and `Box`, `Heading`, `Text`, `Icon`
    (+ CSS, `icons.ts`) are copied and import cleanly under the aliases. No raw style values.
  - Verify: `bun test`; `bun run typecheck`; a temporary page renders each base component
  - Files: `tools/ds-visualizer/src/lib/**`, `tools/ds-visualizer/src/components/base/**`
  - Depends: Task 4

- [ ] **Task 6: Copy the UI and layout tiers**
  - Acceptance: `Button`, `TextField`, `Dialog`, `DropdownMenu`, `ScrollArea`
    (+ CSS) and `Container`, `HStack`, `VStack`, `Grid`, and the page shell (+ CSS, helpers)
    are copied and token-only. A Tabs wrapper is added for the editor tabs.
  - Verify: `bun run typecheck`; a temporary page renders the shell and the overlays
  - Files: `tools/ds-visualizer/src/components/ui/**`,
    `tools/ds-visualizer/src/components/layout/**`
  - Depends: Task 5

### Checkpoint: Foundation
- [ ] The tool builds and renders copied components under its own tokens
- [ ] `bun run check`, `bun run typecheck`, and `bun test` pass
- [ ] Task 1 reference notes exist and any gaps are folded back into the spec/plan

### Phase 2: Contract core (pure logic)

- [ ] **Task 7: Model the Design System contract**
  - Acceptance: `design-system.ts` exports the `DesignSystem` type, defaults derived from the
    fixed list, and the complete path↔CSS-variable mapping (including `.base`-drop and
    stylesheet-only tokens). A test asserts every documented token has a mapping and no
    undocumented token is representable.
  - Verify: `bun test design-system`
  - Files: `tools/ds-visualizer/src/lib/design-system.ts`,
    `tools/ds-visualizer/src/lib/design-system.test.ts`
  - Depends: Task 4

- [ ] **Task 8: Parse and serialize `DESIGN.md` front matter**
  - Acceptance: parsing a `DESIGN.md` yields a `DesignSystem`; serializing it reproduces the
    front matter with merged parent paths and preserved prose untouched. Unknown keys are
    reported, not silently kept. Round-trip test on the reference `DESIGN.md`.
  - Verify: `bun test parse-design-md`
  - Files: `tools/ds-visualizer/src/lib/parse-design-md.ts`,
    `tools/ds-visualizer/src/lib/serialize-design-md.ts`,
    `tools/ds-visualizer/src/lib/parse-design-md.test.ts`
  - Depends: Task 7

- [ ] **Task 9: Parse and serialize `design-tokens.css`**
  - Acceptance: parsing a stylesheet yields token values plus stylesheet-only entries;
    serializing writes a single `:root` block with optional-token fallbacks preserved.
    Round-trip test on a reference `design-tokens.css`; `:root` can be rewritten to
    `[data-ds-preview]` for scoped injection.
  - Verify: `bun test parse-tokens-css`
  - Files: `tools/ds-visualizer/src/lib/parse-tokens-css.ts`,
    `tools/ds-visualizer/src/lib/serialize-tokens-css.ts`,
    `tools/ds-visualizer/src/lib/parse-tokens-css.test.ts`
  - Depends: Task 7

- [ ] **Task 10: Validate the contract**
  - Acceptance: `validate.ts` reports each section 10 rule (undocumented token, missing
    required token, non-required default mismatch, front-matter/stylesheet value mismatch,
    variants wrongly declared as tokens). Tests cover one passing and one failing case per
    rule.
  - Verify: `bun test validate`
  - Files: `tools/ds-visualizer/src/lib/validate.ts`,
    `tools/ds-visualizer/src/lib/validate.test.ts`
  - Depends: Tasks 7-9

### Checkpoint: Contract core
- [ ] Parse → serialize round-trips are byte-stable for the reference files
- [ ] Validation flags every seeded violation and passes a clean contract
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 3: Server

- [ ] **Task 11: Add the theme read/save API**
  - Acceptance: `GET /api/theme?dir=<project>` returns the parsed model plus both file
    contents; `POST /api/theme` validates and writes `DESIGN.md` and `design-tokens.css`
    together. Requests for any other filename, or paths escaping the selected directory
    (traversal or symlink), are rejected with a clear error. Handler logic is unit-tested.
  - Verify: `bun test server`; manual `curl` against dev server
  - Files: `tools/ds-visualizer/src/server.tsx`,
    `tools/ds-visualizer/src/lib/theme-api.ts`,
    `tools/ds-visualizer/src/lib/theme-api.test.ts`
  - Depends: Tasks 8-10

### Checkpoint: Server
- [ ] A repo theme round-trips through the API unchanged
- [ ] Path-safety tests fail closed
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 4: Preview and editors (vertical slices)

- [ ] **Task 12: Add the app shell and scoped preview host**
  - Acceptance: the shell renders the toolbar, the section navigation, and a preview host.
    The edited theme is serialized, its selector rewritten to `[data-ds-preview]`, and
    injected so only the preview subtree is affected; tool chrome is unchanged. A smoke page
    proves the two token sets coexist.
  - Verify: `agent-browser` side-by-side check; `bun run typecheck`; `bun test`
  - Files: `tools/ds-visualizer/src/App.tsx`,
    `tools/ds-visualizer/src/components/layout/**`,
    `tools/ds-visualizer/src/components/editor/PreviewHost.tsx`,
    `tools/ds-visualizer/src/lib/apply-preview.ts`
  - Depends: Tasks 6, 11

- [ ] **Task 13: Typography slice**
  - Acceptance: previews for `base`/`display`/`mono` families, the `xs`→`display` scale,
    weights, line heights, and letter spacing; the font picker (Google lazy-loaded + system,
    search and category filters) and an optional scale generator that writes explicit fixed
    variables. Editable sample rows show computed `rem`.
  - Verify: `agent-browser` comparison with Task 1 captures; `bun run typecheck`; `bun test`
  - Files: `tools/ds-visualizer/src/components/preview/TypographyPreview.*`,
    `tools/ds-visualizer/src/components/editor/FontPicker.*`,
    `tools/ds-visualizer/src/lib/scale.ts`, `tools/ds-visualizer/src/lib/scale.test.ts`
  - Depends: Task 12

- [ ] **Task 14: Colors slice**
  - Acceptance: `brand`, `action`, `text`, and `surface` groups with color pickers; usage
    panels over `surface.base/alt/dark/card` with WCAG contrast badges; derived
    `muted`/`active` variants shown; brand/action button samples.
  - Verify: `agent-browser` comparison; `bun test contrast`
  - Files: `tools/ds-visualizer/src/components/preview/ColorsPreview.*`,
    `tools/ds-visualizer/src/components/editor/ColorSwatch.*`,
    `tools/ds-visualizer/src/lib/contrast.ts`, `tools/ds-visualizer/src/lib/contrast.test.ts`
  - Depends: Task 12

- [ ] **Task 15: Spacing slice**
  - Acceptance: the fixed `xs`→`xxl` scale plus `base` (`1rem`) with scale bars and a visual
    preview; a generator (geometric or linear) that writes explicit fixed `--space-*` values.
  - Verify: `agent-browser` comparison; `bun test`
  - Files: `tools/ds-visualizer/src/components/preview/SpacingPreview.*`,
    `tools/ds-visualizer/src/components/editor/ScaleEditor.*`
  - Depends: Task 12

- [ ] **Task 16: Shapes slice**
  - Acceptance: `rounded` presets, `border` widths, and `elevation` sm/md/lg with previews,
    editable values, and preset pickers (elevation and border presets from the core skill).
  - Verify: `agent-browser` comparison; `bun test`
  - Files: `tools/ds-visualizer/src/components/preview/ShapesPreview.*`,
    `tools/ds-visualizer/src/components/editor/PresetPicker.*`
  - Depends: Task 12

- [ ] **Task 17: Components gallery slice**
  - Acceptance: buttons, containers, and cards built from our components over the edited
    tokens, covering variants, sizes, and states from the reference app.
  - Verify: `agent-browser` comparison; `bun run typecheck`
  - Files: `tools/ds-visualizer/src/components/preview/ComponentsPreview.*`
  - Depends: Tasks 13-16

### Checkpoint: Preview and editors
- [ ] Each section edits and previews live without touching tool chrome
- [ ] Visual parity with Task 1 captures for all five sections
- [ ] Section state survives switching and is ready for save
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 5: Actions and reference

- [ ] **Task 18: Open, save, export, and reset**
  - Acceptance: a project directory can be opened and loaded; Save writes both contract files
    through the API and clears the dirty state; validation errors block save and are shown;
    Export downloads the two files; Reset restores the tool's default theme. A dirty/saved
    badge reflects state.
  - Verify: `agent-browser` end-to-end open → edit → save → reload; `bun test`
  - Files: `tools/ds-visualizer/src/components/editor/Toolbar.tsx`,
    `tools/ds-visualizer/src/lib/theme-api.ts`,
    `tools/ds-visualizer/src/lib/download.ts`
  - Depends: Task 11, Tasks 13-17

- [ ] **Task 19: Token reference panel**
  - Acceptance: a modal lists the fixed path↔CSS-variable mapping with the current value and
    validation status, replacing the old Token guide modal.
  - Verify: `agent-browser` check; `bun run typecheck`
  - Files: `tools/ds-visualizer/src/components/editor/TokenReference.*`
  - Depends: Tasks 7, 10, 18

### Phase 6: Documentation and verification

- [ ] **Task 20: Document the package**
  - Acceptance: `tools/ds-visualizer/AGENTS.md` mirrors the demo's TypeScript and component
    rules; `README.md` states what the tool is, how to run it, and its contract/model scope;
    root `README.md` and `AGENTS.md` list the new tool.
  - Verify: `technical-writing` review; `bun run check`
  - Files: `tools/ds-visualizer/AGENTS.md`, `tools/ds-visualizer/README.md`, `README.md`,
    `AGENTS.md`
  - Depends: Tasks 1-19

- [ ] **Task 21: Dogfood and parity pass**
  - Acceptance: `agent-browser` walks every section on the tool's own theme and on a second
    theme; open/save round-trips a real repo theme; the console is clean; the parity checklist
    against Task 1 captures passes; `bun run check`, `bun run typecheck`, `bun test`, and the
    build all pass.
  - Verify: the four commands plus an `agent-browser` pass
  - Files: none
  - Depends: Task 20

### Phase 7: Reference fidelity (Typography and beyond)

- [x] **Task 22: Capture the running reference**
  - Acceptance: the original `ds-visualizer` runs locally and per-section screenshots
    (Headings/Body/Mono tabs, the settings cog popover, the font picker modal, Colors
    Palette/Usage, Components Buttons/Containers/Cards, full page) are saved under
    `roadmap/T0007/reference/screenshots/`.
  - Verify: screenshots open and match the running app
  - Files: `roadmap/T0007/reference/screenshots/`
  - Depends: Task 1

- [ ] **Task 23: Add a Tabs primitive and a single settings cog**
  - Acceptance: `ui/Tabs` renders the reference tab bar (uppercase labels, active
    underline). `editor/SettingsCog` replaces the multiple `<details>` panels with one cog
    button per section/track that opens a popover titled with the track name and a close
    control.
  - Verify: `bun run typecheck`; browser check of the popover
  - Files: `tools/ds-visualizer/src/components/ui/Tabs.tsx` (+ CSS),
    `tools/ds-visualizer/src/components/editor/SettingsCog.tsx` (+ CSS)
  - Depends: Task 22

- [ ] **Task 24: Port the font catalog and the font picker modal**
  - Acceptance: `lib/fonts.ts` holds the Google and system catalogs and a lazy loader;
    `editor/FontPicker` is a modal with provider tabs (Google/System/Adobe-disabled),
    category filters (All/Serif/Sans/Display/Mono/Script), search, preview text, and a
    two-column card grid that applies on click.
  - Verify: `agent-browser` comparison with the reference font picker
  - Files: `tools/ds-visualizer/src/lib/fonts.ts`, `src/components/editor/FontPicker.tsx`
    (+ CSS)
  - Depends: Task 23

- [ ] **Task 25: Rebuild Typography to match the reference**
  - Acceptance: Headings/Body/Mono tabs; one cog per track opening Font Family (with a
    browse button), Base Size, Scale Ratio, Steps, Line Height, and Weight; a meta row
    (`family · ×ratio · N steps · lh`); sample rows with a label + computed `rem` on the
    left, the sample on the right, dividers, and inline-editable text.
  - Verify: screenshot comparison with `ref-typo-*.png`
  - Files: `src/components/preview/Preview.tsx`, `src/components/preview/Preview.css`,
    `src/components/editor/EditableText.tsx` (+ CSS)
  - Depends: Tasks 23-24

- [ ] **Task 26: Add Palette/Usage and Components tabs**
  - Acceptance: Colors has Palette/Usage tabs; Components has Buttons/Containers/Cards
    tabs, matching the reference composition.
  - Verify: screenshot comparison with `ref-colors-usage.png`, `ref-components-*.png`
  - Files: `src/components/preview/Preview.tsx`, `src/components/preview/Preview.css`
  - Depends: Task 25

- [ ] **Task 27: Gates and visual dogfood**
  - Acceptance: `bun run check`, `bun run typecheck`, `bun test`, and the build pass; a
    fresh `agent-browser` pass matches the reference screenshots and the console is clean.
  - Verify: the four commands plus an `agent-browser` pass
  - Files: none
  - Depends: Task 26

### Checkpoint: Complete
- [ ] All success criteria in `spec.md` met
- [ ] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| The old app hides panels not covered by the spec's parity table | Med | Task 1 inventories every control first; fold gaps into `spec.md` before Phase 2 |
| Scoped preview tokens leak into the tool chrome | High | Preview CSS selector rewritten to `[data-ds-preview]`; smoke-tested in Task 12 before sections |
| `DESIGN.md` round-trip loses prose or reorders merged paths | Med | Serialize only the front matter; byte-stable round-trip test against the reference file |
| Server path handling allows escaping the project dir | High | Fixed filenames, `realpath` containment check, explicit failing tests in Task 11 |
| Component copy drags demo-specific chat code | Low | Copy only `base`/`ui`/`layout` and `lib` helpers; review imports in Tasks 5-6 |
| Scale generators emit values outside the fixed token list | Med | Generators write only the fixed `--font-size-*`/`--space-*` variables; validator blocks the rest |
| Bun HTML-import build diverges from the demo | Low | Mirror `radix-ui-starter` scripts and `index.html` exactly in Task 3 |

## Open Questions

- Chrome vs. preview scoping: `[data-ds-preview]` attribute scope is the proposed mechanism;
  confirm over inline custom properties on the preview root.
- Default theme seed: the tool's own `DESIGN.md` vs. a `demos/radix-ui-starter/themes/reference`
  copy. Recommended: the tool's own.
- Server root discovery: explicit `--root` flag vs. a project directory entered in the UI.
- Adobe Fonts: drop or document as out of scope (the reference tab is non-functional).
- `localStorage`: keep only as unsaved-draft recovery, or drop entirely.
