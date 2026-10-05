# Implementation Plan: T0004 Theme contrast layer (`ui-theme-overrides.css`) and palette rework

## Overview

Add a generated, per-theme `ui-theme-overrides.css` that exposes a `--color-on-*`
variable for every colored role, then make the UI components consume it. A generator
computes each variable from the theme's own text colors with WCAG contrast, so a poor
palette cannot break a variant. The eight themes are reworked to a measurable AA bar for
contrast and a normalized type scale.

## Architecture Decisions

- **Derived, not tokens.** `--color-on-*` never enters `DESIGN.md` front matter or the
  fixed token list. It is a generated companion, like `color-variants.css`, but per
  theme.
- **Source of truth for generation is `DESIGN.md` front matter.** The generator parses it
  with `yaml`, the same way `contract.test.ts` does.
- **Selection rule:** for each role, choose the higher WCAG contrast of
  `colors.text.base` and `colors.text.ondark`; tie goes to `ondark`.
- **Pure core + thin writer.** `renderThemeOverrides(theme)` returns the file text so a
  drift test can compare without touching disk. The writer overwrites the eight files.
- **Components keep a fallback.** `var(--color-on-primary, var(--color-text-ondark))`, so
  the library still works when a theme has no generated file.
- **Rework is data-only.** Fix a palette only where a contrast check fails. Keep each
  theme recognizable. Type sizes live only in `design-tokens.css`, so normalizing them
  does not change the contract.
- **Contrast targets:** 4.5:1 for base, muted, ondark, and every `--color-on-*`; 3:1 for
  the `brand.secondary` UI border.

## Task List

### Phase 1: Contrast math and generator

- [ ] **Task 1: Add the pure color-contrast module and its tests**
  - Acceptance: a module exposes hex parsing, WCAG relative luminance, and the contrast
    ratio. Tests cover black/white (21:1), a known mid pair, and the 4.5 boundary.
  - Verify: `bun test tools/color-contrast.test.ts`
  - Files: `tools/color-contrast.ts`, `tools/color-contrast.test.ts`
  - Depends: None

- [ ] **Task 2: Add the generator and the `generate:themes` script**
  - Acceptance: `renderThemeOverrides(theme)` reads the front-matter colors, emits the
    nine `--color-on-*` variables with a "generated, do not edit" header, and is
    deterministic. A `generate:themes` script writes every theme's file. An unparseable
    role color fails with a clear message.
  - Verify: `bun run generate:themes`; inspect one file.
  - Files: `tools/generate-theme-overrides.ts`, `package.json`
  - Depends: Task 1

- [ ] **Task 3: Generate the eight files and add the drift test**
  - Acceptance: every theme has `themes/<name>/ui-theme-overrides.css`; a test asserts
    the committed file equals `renderThemeOverrides(theme)` for every theme; the token
    contract test also asserts each theme has the file.
  - Verify: `bun run generate:themes && bun test`
  - Files: `demos/radix-ui-starter/themes/*/ui-theme-overrides.css`,
    `tools/generate-theme-overrides.test.ts`,
    `demos/radix-ui-starter/src/lib/theme/contract.test.ts`
  - Depends: Task 2

### Checkpoint: Foundation
- [ ] The generator is deterministic and the drift test passes for all themes
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 2: Theme rework to the AA bar

- [ ] **Task 4: Add the contrast and type-scale tests (expected red)**
  - Acceptance: a test asserts every theme's base/muted/ondark meet 4.5:1, the
    `brand.secondary` border meets 3:1, and every `--color-on-*` meets 4.5:1. A second
    test asserts every theme uses the same non-decreasing `--font-size-*` scale. Both
    run over the discovered themes. They may fail until Tasks 5-8 land.
  - Verify: `bun test` (records the current failures as the rework list)
  - Files: `tools/generate-theme-overrides.test.ts`,
    `demos/radix-ui-starter/src/lib/theme/type-scale.test.ts`
  - Depends: Task 3

- [ ] **Task 5: Rework `paper` and `midnight`**
  - Acceptance: both themes pass the contrast and type-scale tests; palettes change only
    where a check fails; `DESIGN.md` and `design-tokens.css` stay identical.
  - Verify: `bun run generate:themes && bun test`
  - Files: `themes/{paper,midnight}/{DESIGN.md,design-tokens.css,ui-theme-overrides.css}`
  - Depends: Task 4

- [ ] **Task 6: Rework `cyan` and `magenta`**
  - Acceptance: both themes pass the contrast and type-scale tests; palettes stay
    recognizable.
  - Verify: `bun run generate:themes && bun test`
  - Files: `themes/{cyan,magenta}/{DESIGN.md,design-tokens.css,ui-theme-overrides.css}`
  - Depends: Task 4

- [ ] **Task 7: Rework `reference` and `monokai`**
  - Acceptance: both themes pass the contrast and type-scale tests; palettes stay
    recognizable.
  - Verify: `bun run generate:themes && bun test`
  - Files: `themes/{reference,monokai}/{DESIGN.md,design-tokens.css,ui-theme-overrides.css}`
  - Depends: Task 4

- [ ] **Task 8: Rework `dracula` and `gruvbox`**
  - Acceptance: both themes pass the contrast and type-scale tests; palettes stay
    recognizable.
  - Verify: `bun run generate:themes && bun test`
  - Files: `themes/{dracula,gruvbox}/{DESIGN.md,design-tokens.css,ui-theme-overrides.css}`
  - Depends: Task 4

### Checkpoint: Themes
- [ ] All eight themes pass the contrast and type-scale tests
- [ ] The drift test still passes after every regeneration

### Phase 3: Wire the layer into the app

- [ ] **Task 9: Inject the overrides in `themes.ts` and `ThemeProvider`**
  - Acceptance: each theme carries its overrides text; the provider injects the tokens
    first and the overrides second, so `--color-on-*` resolves at runtime. Switching
    themes updates both.
  - Verify: `bun run check`, `bun run typecheck`; browser check on two themes.
  - Files: `src/lib/theme/themes.ts`, `src/lib/theme/ThemeProvider.tsx`
  - Depends: Task 3

- [ ] **Task 10: Consume `--color-on-*` in `Button`**
  - Acceptance: `primary`, `accent`, `success`, `warning`, `danger`, and `info` use their
    `--color-on-*` with a fallback; `secondary` and `ghost` keep `--color-text`. No
    hardcoded foreground remains on a colored variant.
  - Verify: `bun run check`; browser check of all variants on a light and a dark theme.
  - Files: `src/components/ui/Button.css`
  - Depends: Task 9

- [ ] **Task 11: Consume `--color-on-*` in `Avatar`, `Composer`, and `Message`**
  - Acceptance: the Avatar fallback uses `--color-on-secondary`; the composer send
    button and the user bubble use `--color-on-dark`; each keeps a fallback.
  - Verify: `bun run check`; browser check.
  - Files: `src/components/ui/Avatar.css`, `src/components/chat/Composer.css`,
    `src/components/chat/Message.css`
  - Depends: Task 9

### Checkpoint: Wired
- [ ] No component hardcodes a foreground on a colored background
- [ ] Variants are legible on every theme in the browser

### Phase 4: Docs and verification

- [ ] **Task 12: Update the docs**
  - Acceptance: the theme docs describe `ui-theme-overrides.css` and the `--color-on-*`
    layer; the demo `AGENTS.md` tree lists the new file; `components/README.md` notes the
    on-color contract for `Button`/`Avatar`; the canonical
    `skills/design-system-tokens/SKILL.md` documents the derived layer as a reusable
    pattern without changing the fixed list.
  - Verify: `technical-writing` review; `bun run check`.
  - Files: `demos/radix-ui-starter/AGENTS.md`, `demos/radix-ui-starter/README.md`,
    `src/components/README.md`, `skills/design-system-tokens/SKILL.md`,
    `roadmap/T0004/spec.md`
  - Depends: Tasks 5-11

- [ ] **Task 13: Gates and browser dogfood**
  - Acceptance: `bun run check`, `bun run typecheck`, `bun test`, and the demo build
    pass. In the browser, every Button variant, the Avatar, the send button, and the user
    bubble are legible on all eight themes; the console is clean.
  - Verify: commands plus an `agent-browser` pass with screenshots.
  - Files: none
  - Depends: Task 12

### Checkpoint: Complete
- [ ] All success criteria in `spec.md` met
- [ ] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| A role color is not a plain hex (for example `color-mix`) | High | Parse hex and common formats; fail with a clear message and fix the theme value in Task 4-8 |
| An optional role (for example `brand.tertiary`) is missing in a theme | Med | Skip the variable or emit a documented fallback; the drift test follows the same rule |
| A classic theme cannot reach 4.5:1 without losing its identity | Med | Adjust only the failing role; prefer darkening or lightening over hue changes |
| Type-scale normalization changes the demo's look | Med | Normalize to the token steps; visually check in Task 13 |
| Generated files drift after a palette edit | Low | Drift test fails `bun test`; regenerate in the same task |
| Runtime injection order breaks the cascade | Low | Inject tokens then overrides in one provider update; verify on two themes in Task 9 |

## Open Questions

1. Optional roles: should the generator skip `--color-on-tertiary` when a theme omits
   `colors.brand.tertiary`, or emit a fallback to `--color-on-primary`? Recommendation:
   skip, and document it.
2. `surface.alt` bubbles use `--color-text` on a light surface; is a dedicated
   `--color-on-alt` needed? Recommendation: no, the base-text contrast check covers it.
