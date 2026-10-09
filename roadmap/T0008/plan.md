# Implementation Plan: T0008 Normalize the typography token vocabulary

## Overview

Replace the ad-hoc typography names with one normalized vocabulary across the canonical
skill, the DS Visualizer, and the `radix-ui-starter` demo. Removed weights
(`--font-weight-medium`, `--font-weight-semibold`) are replaced by the fixed four-token
set; the middle line-height and letter-spacing values are renamed from `normal` to
`regular`. The visualizer's fixed registry, every theme, and every component stylesheet
are migrated, and four themes' literal `fontWeight`/`lineHeight` values become `var()`
references. Tasks are ordered by dependency (skill → visualizer → demo → verify) with a
checkpoint per phase.

## Architecture Decisions

- **Fixed four-token weight set.** `thin` `400`, `regular` `500`, `bold` `700`, and the
  optional `extrabold` → `var(--font-weight-bold)`. Rationale: one token per typographic
  style; no near-duplicates (`medium`, `semibold`).
- **Usage lives in `DESIGN.md`, not in the token names.** The skill lists tokens; the
  three styles (`base`, `display`, `mono`) define how family, weight, line-height, and
  letter-spacing combine. Rationale: components pick tokens to match a style, so the skill
  tables must not encode per-component usage.
- **"Follow the styles" remap.** UI/mono → `thin`; body/base → `regular`;
  headings/emphasis/display → `bold`. Rationale: keeps the migration a pure vocabulary
  change anchored to the three styles.
- **Rename `normal` → `regular`.** Applies to line-height and letter-spacing so the
  "default middle" value shares one name across all three typography scales. Rationale:
  removes the `normal`/`medium`/`regular` naming split.
- **Themes adopt canonical values.** Every `radix-ui-starter` theme uses `thin 400`,
  `regular 500`, `bold 700`, `extrabold → var(--font-weight-bold)`. Rationale: one shared
  vocabulary; a theme that needs a distinct value is an explicit ask.
- **Front matter is token references.** Theme `fontWeight` and `lineHeight` values use
  `var()` references; `fontFamily` stays a literal stack (it is the source of truth).

## Task List

### Phase 1: Canonical skill

- [ ] **Task 1: Finalize the typography tables in `SKILL.md`**
  - Acceptance: the weight table lists exactly `thin`, `regular`, `bold`, `extrabold`
    (three required; `extrabold` optional → `var(--font-weight-bold)`); the line-height and
    letter-spacing tables use `regular`; descriptions point to the three `DESIGN.md` styles
    and mention no removed name.
  - Verify: read the tables; `grep -nE "font-weight-(medium|semibold)|line-height-normal|letter-spacing-normal"` on the skill returns nothing.
  - Files: `skills/design-system-tokens/SKILL.md`
  - Depends: None

- [ ] **Task 2: Align `references/design-tokens.css`**
  - Acceptance: the weight block matches the canonical values; `--line-height-regular` and
    `--letter-spacing-regular` replace `normal`; the optional fallbacks reference `regular`;
    the comment states the three styles.
  - Verify: cross-read against the spec's value table.
  - Files: `skills/design-system-tokens/references/design-tokens.css`
  - Depends: Task 1

- [ ] **Task 3: Update the `references/DESIGN.md` typography block**
  - Acceptance: `base` uses `var(--font-weight-regular)` + `var(--line-height-regular)`;
    `display` uses `var(--font-weight-bold)`, `var(--line-height-tight)`, and
    `var(--letter-spacing-tight)`; `mono` uses `var(--font-weight-thin)` +
    `var(--line-height-regular)`; prose agrees with the front matter.
  - Verify: parse the front matter; every value resolves to a documented token.
  - Files: `skills/design-system-tokens/references/DESIGN.md`
  - Depends: Task 2

- [ ] **Task 4: Update `references/utilities.css` and `references/reset.css`**
  - Acceptance: weight utilities are `.font-thin` (was `.font-medium`), `.font-regular`,
    `.font-bold`, (keep `.font-extrabold`), and drop `.font-semibold`; `.leading-regular`
    and `.tracking-regular` replace the `normal` variants; the reset consumes
    `--line-height-regular`.
  - Verify: `grep -nE "\.font-(medium|semibold)|leading-normal|tracking-normal|line-height-normal"`.
  - Files: `skills/design-system-tokens/references/utilities.css`,
    `skills/design-system-tokens/references/reset.css`
  - Depends: Task 2

### Checkpoint: Canonical skill
- [ ] No removed name appears under `skills/design-system-tokens/`
- [ ] Human review of the skill diff before spreading the change

### Phase 2: DS Visualizer

- [ ] **Task 5: Migrate the visualizer's contract files**
  - Acceptance: `design-tokens.css` uses the canonical weight block and renamed
    line-height/letter-spacing values; `DESIGN.md` typography matches the reference styles
    (`mono` gains `fontWeight` and `lineHeight`).
  - Verify: `bun test tools/ds-visualizer` passes; the two files agree on every value.
  - Files: `tools/ds-visualizer/design-tokens.css`, `tools/ds-visualizer/DESIGN.md`
  - Depends: Task 2

- [ ] **Task 6: Update the fixed registry**
  - Acceptance: `TOKENS` drops `--font-weight-medium`/`--font-weight-semibold`, adds
    `--font-weight-thin` (required), keeps `extrabold` optional → bold, and renames
    `--line-height-normal`/`--letter-spacing-normal` to `regular`.
  - Verify: `bun test tools/ds-visualizer/src/lib/design-system.test.ts`.
  - Files: `tools/ds-visualizer/src/lib/design-system.ts`
  - Depends: Task 5

- [ ] **Task 7: Sync the embedded default theme**
  - Acceptance: the `DEFAULT_DESIGN_MD` and `DEFAULT_TOKENS_CSS` strings match the files in
    Task 5 byte value-for-value.
  - Verify: `bun test tools/ds-visualizer/src/lib/contract.test.ts`.
  - Files: `tools/ds-visualizer/src/lib/default-theme.ts`
  - Depends: Tasks 5, 6

- [ ] **Task 8: Update the tool's shared stylesheets**
  - Acceptance: `styles/utilities.css` and `styles/reset.css` follow Task 4's end state.
  - Verify: grep for removed class/variable names.
  - Files: `tools/ds-visualizer/src/styles/utilities.css`,
    `tools/ds-visualizer/src/styles/reset.css`
  - Depends: Task 5

- [ ] **Task 9: Migrate the visualizer component styles**
  - Acceptance: `--font-weight-medium` → `--font-weight-thin`;
    `--font-weight-semibold` → `--font-weight-bold`; `--line-height-normal` →
    `--line-height-regular`.
  - Verify: `grep -nE "font-weight-(medium|semibold)|line-height-normal" tools/ds-visualizer/src`.
  - Files: `tools/ds-visualizer/src/components/ui/Button.css`,
    `tools/ds-visualizer/src/components/ui/TextField.css`,
    `tools/ds-visualizer/src/components/editor/Fields.css`,
    `tools/ds-visualizer/src/components/editor/IssuesPanel.css`,
    `tools/ds-visualizer/src/components/editor/FontPicker.css`,
    `tools/ds-visualizer/src/components/base/Text.css`
  - Depends: Task 5

- [ ] **Task 10: Update the preview variable names**
  - Acceptance: the `mono` track's `weightVariable` is `--font-weight-thin`; body/mono
    line-height and letter-spacing variables use `regular`; heading stays bold.
  - Verify: read `Preview.tsx`; `grep -nE "line-height-normal|letter-spacing-normal"`.
  - Files: `tools/ds-visualizer/src/components/preview/Preview.tsx`
  - Depends: Task 5

- [ ] **Task 11: Confirm the visualizer tests**
  - Acceptance: contract, theme-api, validate, and design-system tests pass with no
    expectation edits beyond what Tasks 5–7 already require.
  - Verify: `bun test tools/ds-visualizer`.
  - Files: `tools/ds-visualizer/src/lib/*.test.ts` (adjust only if a test asserts a
    removed name)
  - Depends: Tasks 6, 7

### Checkpoint: DS Visualizer
- [ ] `bun test` green
- [ ] `bun run --cwd tools/ds-visualizer dev` renders with the new vocabulary

### Phase 3: radix-ui-starter demo

- [ ] **Task 12: Migrate the eight theme stylesheets**
  - Acceptance: each `themes/*/design-tokens.css` defines `thin` `400`, `regular` `500`,
    `bold` `700`, `extrabold` → `var(--font-weight-bold)`, and uses `regular` for
    line-height and letter-spacing; no `medium`/`semibold`/`normal` remains.
  - Verify: grep all theme stylesheets for removed names; spot-check values.
  - Files: `demos/radix-ui-starter/themes/{cyan,reference,monokai,gruvbox,dracula,magenta,midnight,paper}/design-tokens.css`
  - Depends: Task 2

- [ ] **Task 13: Update the four `var()`-based theme DESIGN.md files**
  - Acceptance: `--font-weight-semibold` → `--font-weight-bold` and
    `--line-height-normal` → `--line-height-regular`.
  - Verify: grep the four files for removed names.
  - Files: `demos/radix-ui-starter/themes/{reference,monokai,gruvbox,dracula}/DESIGN.md`
  - Depends: Task 12

- [ ] **Task 14: Convert literal theme values to `var()` references**
  - Acceptance: in `cyan`, `magenta`, `midnight`, `paper`, `base` uses
    `var(--font-weight-regular)` + `var(--line-height-regular)`, `display` uses
    `var(--font-weight-bold)` + `var(--line-height-tight)`, and `mono` gains
    `var(--font-weight-thin)` + `var(--line-height-regular)`; no literal `fontWeight` or
    `lineHeight` remains.
  - Verify: `grep -nE '"(400|700|1\.5|1\.2)"' demos/radix-ui-starter/themes`.
  - Files: `demos/radix-ui-starter/themes/{cyan,magenta,midnight,paper}/DESIGN.md`
  - Depends: Task 12

- [ ] **Task 15: Migrate the demo styles and components**
  - Acceptance: `styles/utilities.css` and `styles/reset.css` follow Task 4;
    component styles map medium → thin, semibold → bold, and line-height `normal` →
    `regular`.
  - Verify: grep `demos/radix-ui-starter/src` for removed names.
  - Files: `demos/radix-ui-starter/src/styles/utilities.css`,
    `demos/radix-ui-starter/src/styles/reset.css`,
    `demos/radix-ui-starter/src/components/base/Text.css`,
    `demos/radix-ui-starter/src/components/ui/Button.css`,
    `demos/radix-ui-starter/src/components/ui/TextField.css`,
    `demos/radix-ui-starter/src/components/ui/Avatar.css`,
    `demos/radix-ui-starter/src/components/chat/Message.css`,
    `demos/radix-ui-starter/src/components/chat/TypingIndicator.css`
  - Depends: Task 12

### Checkpoint: Demo
- [ ] `bun run --cwd demos/radix-ui-starter dev` renders each theme
- [ ] No theme front matter declares a literal `fontWeight` or `lineHeight`

### Phase 4: Verification and commit

- [ ] **Task 16: Run the gate and commit**
  - Acceptance: `bun run check`, `bun run typecheck`, and `bun test` pass; the repository
    grep gate returns no source hit; both dev servers show correct typography.
  - Verify:
    `grep -rnE "font-weight-(medium|semibold)|line-height-normal|letter-spacing-normal" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.tmp .`
    returns nothing.
  - Files: none (verification only)
  - Depends: Tasks 1–15

### Checkpoint: Done
- [ ] All success criteria in the spec are checked
- [ ] Human sign-off

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Body weight shifts `400` → `500`, UI shifts `500` → `400` | Med | Visual pass on both dev servers at the demo checkpoint; human sign-off |
| A removed name is missed in a component or theme | Med | Grep gate in Task 16 plus the visualizer contract test |
| Registry drifts from the theme files | High | `contract.test.ts` iterates `TOKENS` and fails on divergence |
| Theme front matter now references tokens the parser ignores | Low | `isIgnoredPath` already covers `typography.*.lineHeight`; confirm in Task 11 |
| Existing uncommitted skill edits conflict with new edits | Low | Build on the current working tree; commit skill, visualizer, and demo in their own commits |
| `dist/` and `.tmp/` still show old names | Low | Both are gitignored; rebuild only if a manual check needs them |

## Open Questions

1. Confirm every `radix-ui-starter` theme adopts the canonical weight scale (thin `400`,
   regular `500`, bold `700`, extrabold → `var(--font-weight-bold)`).
