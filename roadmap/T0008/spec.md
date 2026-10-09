# Spec: T0008 Normalize the typography token vocabulary

## Restate of intent

- **Outcome:** Replace the current typography names with one normalized vocabulary. Font
  weights collapse to a fixed set of four (three required plus one optional); the middle
  line-height and letter-spacing values are renamed from `normal` to `regular`. Every
  consumer — the canonical skill, the DS Visualizer, and the `radix-ui-starter` demo —
  uses the same names, and the visualizer's fixed registry matches the skill.
- **User:** The design-system author or agent who creates and tunes a theme, and any
  consumer that copies the `design-system-tokens` skill into a project.
- **Why now:** The current weight scale (`regular`, `medium`, `semibold`, `bold`,
  `extrabold`) does not map onto the three typographic styles (`base`, `display`, `mono`),
  and it mixes two names (`normal`, `medium`) for the same "default" idea. The visualizer's
  registry and several component stylesheets are already drifting from the skill.
- **Success:** One typography vocabulary across the repository; no reference to a removed
  token remains; `bun run check`, `bun run typecheck`, and `bun test` pass; the reference
  `DESIGN.md` demonstrates how the three styles use the weights.
- **Constraint:** The token list stays fixed. `DESIGN.md` front matter and
  `design-tokens.css` stay identical in value. Component CSS consumes tokens with `var()`
  only.
- **Out of scope:** Font families and sizes; colors, spacing, shapes, elevation; adding
  typography tokens beyond the fixed set; publishing the tool or the demo.

## Objective

Normalize the typography tokens and migrate every consumer.

### Font weights — fixed set

| Token | Value | Required | Role |
|---|---|---|---|
| `--font-weight-thin` | `400` | Y | `mono` — UI chrome |
| `--font-weight-regular` | `500` | Y | `base` — body text |
| `--font-weight-bold` | `700` | Y | `display` — headings |
| `--font-weight-extrabold` | `var(--font-weight-bold)` | N | optional emphasis |

Removed: `--font-weight-medium`, `--font-weight-semibold`.

### Line heights and letter spacing — rename the middle value

| Old | New |
|---|---|
| `--line-height-normal` | `--line-height-regular` |
| `--letter-spacing-normal` | `--letter-spacing-regular` |

The optional `relaxed` and `wide` tokens fall back to the renamed `regular` value.

### Usage is defined by the typographic styles

The skill lists the tokens; how they are combined is defined by the three styles in
`DESIGN.md`:

```yaml
typography:
  base:    { fontFamily: base,    fontWeight: var(--font-weight-regular), lineHeight: var(--line-height-regular) }
  display: { fontFamily: display, fontWeight: var(--font-weight-bold), lineHeight: var(--line-height-tight), letterSpacing: var(--letter-spacing-tight) }
  mono:    { fontFamily: mono,    fontWeight: var(--font-weight-thin), lineHeight: var(--line-height-regular) }
```

### Migration mapping for existing usages

Component usage follows the styles:

| Current | Becomes | Reason |
|---|---|---|
| `--font-weight-medium` (buttons, labels, UI) | `--font-weight-thin` | mono / UI style |
| `--font-weight-regular` (body) | `--font-weight-regular` (value `400` → `500`) | base style |
| `--font-weight-semibold` (titles, emphasis) | `--font-weight-bold` | display / emphasis |

Utility classes mirror the fixed set: `.font-thin`, `.font-regular`, `.font-bold`,
`.font-extrabold`, plus `.leading-regular` and `.tracking-regular`.

### Contract compliance for theme front matter

The four themes `cyan`, `magenta`, `midnight`, and `paper` declare literal `fontWeight`
(`"400"`, `"700"`) and `lineHeight` (`"1.5"`, `"1.2"`) values in their `DESIGN.md`. The
contract requires `fontWeight`, `lineHeight`, and `letterSpacing` values to reference
existing preset CSS variables. This ticket converts those literals to `var()` references
as part of the migration:

| Field | Old literal | New reference |
|---|---|---|
| `base.fontWeight` | `"400"` | `var(--font-weight-regular)` |
| `base.lineHeight` | `"1.5"` | `var(--line-height-regular)` |
| `display.fontWeight` | `"700"` | `var(--font-weight-bold)` |
| `display.lineHeight` | `"1.2"` | `var(--line-height-tight)` |

The `mono` style gains the same references as the other themes
(`var(--font-weight-thin)` and `var(--line-height-regular)`). `fontFamily` values stay
literal: the family stack is the source of truth in the front matter.

## Tech Stack

Unchanged: Markdown (skill, docs, tickets), plain CSS (token references and component
styles), TypeScript + React + Radix (visualizer and demo), Bun + Biome for the check gate.

## Commands

```
Install:    bun install
Check:      bun run check
Typecheck:  bun run typecheck
Test:       bun test
Format:     bun run format
```

## Code Style

- Tabs, LF, UTF-8, max line 100 (`.editorconfig`, `biome.jsonc`).
- TypeScript follows `tools/ds-visualizer/src/AGENTS.md` and
  `demos/radix-ui-starter/src/AGENTS.md` (arrow functions, mandatory JSDoc, named
  interfaces).
- CSS consumes tokens via `var()`; no raw values in component styles.
- `DESIGN.md` and `design-tokens.css` stay identical in value.

## Testing Strategy

- `bun test`: the visualizer's contract tests iterate the fixed `TOKENS` registry, so they
  fail when the registry and the theme files diverge; `tests/repo.test.ts` guards the skill
  layout.
- Grep gate: `grep -rn -E "font-weight-(medium|semibold)|line-height-normal|letter-spacing-normal"`
  returns no source hits (excluding `dist/` and `.tmp/`).
- `bun run check` and `bun run typecheck` for formatting and types.
- Manual visual pass on both dev servers (`tools/ds-visualizer`, `demos/radix-ui-starter`).

## Boundaries

- **Always:** edit a token value in both `DESIGN.md` and `design-tokens.css`; update the
  visualizer registry (`tools/ds-visualizer/src/lib/design-system.ts`) when the fixed set
  changes; run the check gate before committing.
- **Ask first:** changing value semantics beyond a rename (for example a theme that should
  keep a lighter body weight); touching `dist/` or `.tmp/`.
- **Never:** add an undocumented token; leave a reference to a removed token; write raw
  colors, sizes, or weights in component CSS; commit secrets.

## Success Criteria

- [ ] The skill documents exactly four font weights (three required, one optional).
- [ ] `--line-height-regular` and `--letter-spacing-regular` are documented and used.
- [ ] No file references `--font-weight-medium`, `--font-weight-semibold`,
      `--line-height-normal`, or `--letter-spacing-normal` (excluding `dist/`, `.tmp/`).
- [ ] The visualizer registry, its `DESIGN.md`, and its `design-tokens.css` agree.
- [ ] The `radix-ui-starter` themes and component styles use the new names.
- [ ] No theme front matter declares a literal `fontWeight` or `lineHeight`; all such
      values are `var()` references.
- [ ] `bun run check`, `bun run typecheck`, and `bun test` pass.

## Open Questions

1. Every `radix-ui-starter` theme adopts the canonical weight scale (thin `400`, regular
   `500`, bold `700`, extrabold → `var(--font-weight-bold)`). Confirm no theme should keep
   a distinct value.
