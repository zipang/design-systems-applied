# Implementation Plan: T0005 Box primitive and the `BoxProperties` token-prop contract

## Overview

Add `base/Box`, a token-driven primitive whose `BoxProperties` interface exposes the box
aspects as enum props (spacing, border, elevation, rounded, background) and whose `as`
prop emits a restricted semantic tag. A pure `boxClassNames(props)` function turns props
into scoped classes, and a drift test keeps that vocabulary in sync with `Box.css`. The
library adopts the primitive in all three modes: `DialogContent` extends `BoxProperties`
and renders a `Box` (inherit + compose), the `Message` bubble composes a `Box`, and the
layout primitives (`HStack`, `VStack`, `Grid`, `Container`) inherit `BoxProperties` and
apply the same class map.

## Architecture Decisions

- **Three adoption modes, one primitive.** *Inherit* = a component's props extend
  `BoxProperties` and it spreads them onto an internal `Box` (callers control the
  surface). *Layout inherit* = a layout primitive extends `BoxProperties` and merges
  `boxClassNames(props)` into its own root class, keeping its element and layout props.
  *Compose* = a component renders a `Box` internally and keeps its `DESIGN.md`-fixed look
  in CSS. `DialogContent` inherits + composes; the layout primitives inherit; `Message`
  composes only.
- **An inheriting component does not hardcode a box aspect it exposes.** `Box.css` and
  the component stylesheet have equal specificity, so a declaration in both makes the
  winner depend on import order. Defaults live in the prop default: `Container` uses
  `px = "lg"` instead of `padding-inline` in `Container.css`.
- **Types live in `box-classes.ts`, re-exported from `Box.tsx`.** The pure module has no
  CSS import, so `box-classes.test.ts` stays pure (component rendering tests are
  omitted; logic tests are not). `Box.tsx` owns the component and re-exports the types.
- **Class-based mapping, CSS owns the token values.** `boxClassNames` emits enum classes
  (`base-box--p-md`); `Box.css` maps each class to exactly one `var(--token)`. No token
  name leaks into TSX and no raw value enters CSS.
- **Source order resolves uniform vs axis.** `p` and `px` have equal specificity, so the
  axis rules are ordered after the uniform rules. Documented in `Box.css`.
- **`border` is width + `borderColor`.** Border colors are not tokens, so `Box` (a
  component) picks the color token, per the skill's rule. Without `borderColor` the
  border uses `currentColor`.
- **Uniform border/rounded by design.** No directional borders and no per-corner radii;
  `ChatHeader`/`Composer`/`Message` keep those in their own CSS.
- **Ref forwarding is required.** `DialogContent` renders `Box` through Radix `Content
  asChild`; Radix passes a ref to the child, so `Box` must forward it.

## Task List

### Phase 1: Foundation

- [ ] **Task 1: Add the pure box model — enums, `BoxProperties`, `boxClassNames`, and its test**
  - Acceptance: `box-classes.ts` defines `BoxSpace`, `BoxRounded`, `BoxElevation`,
    `BoxBorderWidth`, `BoxColor`, and the `BoxProperties` interface exactly as the spec.
    `boxClassNames(props)` returns only the aspect classes (`base-box` is added by the
    component), one class per provided prop, nothing for omitted props, and the axis
    class when both uniform and axis are set. The module imports no CSS.
  - Verify: `bun test box-classes`
  - Files: `src/components/base/box-classes.ts`,
    `src/components/base/box-classes.test.ts`
  - Depends: None

- [ ] **Task 2: Add `Box.css` and the class/CSS drift test**
  - Acceptance: `Box.css` defines every class `boxClassNames` can emit; each rule
    references exactly one token with `var()`; `.base-box` sets `box-sizing: border-box`;
    axis rules follow the uniform rules. The drift test reads `Box.css` and asserts every
    emittable class is present, so the vocabulary cannot diverge from the stylesheet.
  - Verify: `bun test box-classes`
  - Files: `src/components/base/Box.css`,
    `src/components/base/box-classes.test.ts`
  - Depends: Task 1

- [ ] **Task 3: Add the `Box` component**
  - Acceptance: `Box.tsx` exports `Box` (`React.FC<BoxProps>`) and re-exports the enum
    unions and `BoxProperties`. `as` defaults to `div` and is typed to `BoxTag`; `ref` is
    forwarded to the emitted element; `className` is merged with `clsx`; the stylesheet
    import is last. `bun run typecheck` passes.
  - Verify: `bun run check`, `bun run typecheck`
  - Files: `src/components/base/Box.tsx`
  - Depends: Tasks 1, 2

### Checkpoint: Foundation
- [ ] `bun test box-classes` passes (mapping + drift)
- [ ] `bun run check` and `bun run typecheck` pass

### Phase 2: Adoption

- [ ] **Task 4: Make `DialogContent` inherit `BoxProperties` and compose `Box`**
  - Acceptance: `DialogContentProps extends BoxProperties`. `DialogContent` renders
    `DialogPrimitive.Content asChild` wrapping a `Box` with the token defaults
    (`background="surface"`, `border="sm"`, `borderColor="brand-secondary"`,
    `rounded="none"`, `elevation="lg"`, `p="lg"`); any caller box prop overrides the
    default. `Dialog.css` drops the surface declarations from `.ui-dialog` and keeps only
    layout (positioning, flex, gap, width); trigger/overlay/close rules are unchanged.
    `ref` forwarding works, so the dialog still traps focus.
  - Verify: `bun run check`, `bun run typecheck`, `bun test`; browser check of the dialog
    on two themes
  - Files: `src/components/ui/Dialog.tsx`, `src/components/ui/Dialog.css`
  - Depends: Task 3

- [ ] **Task 5: Compose `Box` inside the `Message` bubble**
  - Acceptance: the bubble renders `Box` with
    `background={isEliza ? "surface-alt" : "surface-dark"}`, `py="base"`, `px="lg"`, and
    the existing `chat-message__bubble` class. `Message.css` keeps only the asymmetric
    per-corner radius and the text color for the bubble; no background or padding remains
    on that rule. No `rounded` prop is passed, so `Box` does not fight the corner radius.
  - Verify: `bun run check`, `bun run typecheck`, `bun test`; browser check of the chat
  - Files: `src/components/chat/Message.tsx`, `src/components/chat/Message.css`
  - Depends: Task 3

- [ ] **Task 6: Make the layout primitives inherit `BoxProperties`**
  - Acceptance: `HStackProps`, `VStackProps`, and `GridProps` extend `BoxProperties`;
    each destructures its own props and passes the rest to `boxClassNames`, merged into
    the root `clsx`. Their own `gap`/`align`/`justify`/`wrap`/`columns` behavior is
    unchanged. No box aspect is hardcoded in their CSS.
  - Verify: `bun run check`, `bun run typecheck`; browser check of a padded, bordered
    stack
  - Files: `src/components/layout/HStack.tsx`, `src/components/layout/VStack.tsx`,
    `src/components/layout/Grid.tsx`
  - Depends: Task 3

- [ ] **Task 7: Make `Container` inherit `BoxProperties` and move its padding to a `px` default**
  - Acceptance: `ContainerProps extends BoxProperties`. `Container` defaults `px = "lg"`
    and passes it, with the rest of the box props, to `boxClassNames`. `Container.css`
    drops `padding-inline` and keeps `inline-size` and the `margin-inline: auto`
    centering; the `width` presets are unchanged. A caller-provided `px` overrides the
    default.
  - Verify: `bun run check`, `bun run typecheck`; browser check of a padded container
  - Files: `src/components/layout/Container.tsx`,
    `src/components/layout/Container.css`
  - Depends: Task 3

### Checkpoint: Adoption
- [ ] `DialogContent` accepts box props and its surface comes from `Box`
- [ ] `HStack`, `VStack`, `Grid`, and `Container` accept the full box surface
- [ ] Chat bubbles render through `Box` and keep their asymmetric corners

### Phase 3: Showcase and documentation

- [ ] **Task 8: Add a `Box` section to `ComponentsDemo`**
  - Acceptance: a numbered "Box" section shows all spacing props (`p`, `px`, `py`, and
    `m`/`mx`/`my`), border widths with `borderColor` roles, `elevation`, every `rounded`
    value, every background role, and one example per `as` tag. It uses existing demo
    components and tokens. The later sections are renumbered consistently.
  - Verify: `bun run check`, `bun run typecheck`; browser check
  - Files: `src/components/demo/ComponentsDemo.tsx`,
    `src/components/demo/ComponentsDemo.css`
  - Depends: Task 3

- [ ] **Task 9: Document `Box` and the adoption modes**
  - Acceptance: `base/README.md` gains a `Box` section (prop table + a short example) and
    states the three adoption modes; `components/README.md` lists `Box` under `base/`;
    `components/AGENTS.md` states when a component extends `BoxProperties`, when it
    renders a `Box`, and the "do not hardcode an exposed aspect" rule;
    `layout/README.md` notes that the primitives accept the box aspects and use
    `boxClassNames`. Prose follows the glossary and does not restate the token tables.
  - Verify: `technical-writing` review; `bun run check`
  - Files: `src/components/base/README.md`, `src/components/README.md`,
    `src/components/AGENTS.md`, `src/components/layout/README.md`
  - Depends: Tasks 4, 5, 6, 7

### Checkpoint: Documented
- [ ] `Box` appears in the demo and in the base/README
- [ ] The adoption modes and the "no hardcoded aspect" rule are written in
      `components/AGENTS.md`

### Phase 4: Verification

- [ ] **Task 10: Gates and browser dogfood**
  - Acceptance: `bun run check`, `bun run typecheck`, `bun test`, and the demo build pass.
    In the browser, the Box demo section, the dialog, a padded/bordered layout primitive,
    and both message bubbles render on at least two themes; the dialog still traps focus
    (ref forwarding); the console is clean.
  - Verify: the four commands plus an `agent-browser` pass with screenshots
  - Files: none
  - Depends: Task 9

### Checkpoint: Complete
- [ ] All success criteria in `spec.md` met
- [ ] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `p` and `px` classes have equal specificity | Med | Order axis rules after uniform rules in `Box.css`; document it; the demo shows combined use |
| Radix `asChild` needs a forwarded ref and `Box` drops it | High | `Box` forwards `ref`; verify dialog focus/close in Task 4 and Task 10 |
| `DialogContentProps extends BoxProperties` clashes with a Radix prop name | Low | The wrapper exposes a small custom prop set today; typecheck catches collisions |
| An inheriting component keeps a box aspect hardcoded in its CSS | Med | Move the default into the prop (`Container` `px`); document the rule in `components/AGENTS.md`; verify in Tasks 6-7 |
| Composing `Box` adds a `rounded`/background class that fights chat CSS | Med | Pass no `rounded` prop; keep radius/color scoped in `chat` CSS; verify in Task 5 |
| `box-classes.test.ts` imports `Box.tsx` and pulls in CSS under `bun test` | Med | Keep types in `box-classes.ts`; test imports only that module |
| Demo section renumbering introduces noise | Low | Mechanical renumber in one task; review the diff |
| An enum value drifts from the token list | Med | Drift test reads `Box.css`; the token contract test is unchanged |

## Open Questions

Resolved by the spec review; carried here for reference:

1. Prop names: short (`p`, `px`, `py`, `m`, `mx`, `my`) — recommended.
2. `as` tag set: `div`, `span`, `section`, `article`, `aside`, `header`, `footer`, `nav`,
   `main` — recommended.
3. Font family: `Box` inherits its parent font (composable) — recommended.
4. Canonical skill: document the pattern in the demo docs only — recommended.
5. `border` without `borderColor`: `currentColor` — recommended.
6. `Container` centering vs `mx`: keep `margin-inline: auto`; `mx` is an explicit opt-out
   — recommended.
