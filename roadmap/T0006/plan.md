# Implementation Plan: T0006 Common HTML props for the base and layout components

## Overview

Add `acceptCommonProps()` and the `CommonProps` type in `src/lib/common-props.ts`. Then
make every base and layout component extend `CommonProps` and forward
`acceptCommonProps(rest)` to its root element. The helper keeps a curated set of common
HTML attributes and drops everything else, so component-owned props cannot leak onto the
DOM. This fixes the dialog's dangling `aria-labelledby` and lets tests, Radix, and
assistive technology reach the elements.

## Architecture Decisions

- **One filter, one list.** `COMMON_ATTRIBUTES` names the curated keys. `acceptCommonProps`
  adds the `aria-*`, `data-*`, and `on*` families. No component keeps its own allowlist.
- **Filter at the element boundary.** Each component destructures its own props and
  spreads `acceptCommonProps(rest)`. The helper drops `undefined` values, so an absent
  prop emits no attribute.
- **`className` and `style` stay component-owned.** Excluding `style` keeps the
  token-only styling rule. `className` is merged by the component.
- **The type mirrors the runtime.** `CommonProps` intersects the picked named attributes,
  the event handlers, the aria attributes, and a `data-*` index signature. A caller
  cannot type-check an attribute the filter would drop.
- **`Icon` keeps its a11y.** `Icon` spreads the common props first, then its own role and
  `aria-label`, so the label wins.
- **`Box` uses the filter too.** `Box` is the Radix `asChild` target; the curated set
  keeps `role`, `aria-*`, and `data-*`. The browser check confirms the dialog still works.

## Task List

### Phase 1: The helper

- [x] **Task 1: Add `acceptCommonProps` and its test**
  - Acceptance: `src/lib/common-props.ts` exports `COMMON_ATTRIBUTES`, `CommonProps`, and
    `acceptCommonProps`. The function keeps every named attribute, every `aria-*` and
    `data-*` key, and every `on*` handler. It drops `className`, `style`, `children`,
    unknown keys, and keys with an `undefined` value. The module imports no CSS.
  - Verify: `bun test common-props`
  - Files: `src/lib/common-props.ts`, `src/lib/common-props.test.ts`
  - Depends: None

### Checkpoint: Helper
- [x] `bun test common-props` passes
- [x] `bun run typecheck` passes

### Phase 2: Base tier

- [x] **Task 2: Add `CommonProps` to `Heading`, `Text`, and `Icon`**
  - Acceptance: each props interface extends `CommonProps`; each component destructures
    its own props and spreads `acceptCommonProps(rest)`. `Icon` spreads the common props
    before its a11y attributes. An `id` and a `data-*` attribute reach the element.
  - Verify: `bun run typecheck`; browser check of an `id` on a heading
  - Files: `src/components/base/Heading.tsx`, `src/components/base/Text.tsx`,
    `src/components/base/Icon.tsx`
  - Depends: Task 1

- [x] **Task 3: Route `Box` through `acceptCommonProps`**
  - Acceptance: `BoxProps` extends `BoxProperties` and `CommonProps`; `Box` spreads
    `acceptCommonProps(rest)` onto the element. The dialog still renders with
    `role="dialog"` and a working focus trap.
  - Verify: `bun run typecheck`; browser check of the dialog role
  - Files: `src/components/base/Box.tsx`
  - Depends: Task 1

### Checkpoint: Base tier
- [x] Base components accept and forward the common props
- [x] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 3: Layout tier

- [x] **Task 4: Add `CommonProps` to the layout primitives**
  - Acceptance: `HStackProps`, `VStackProps`, `GridProps`, and `ContainerProps` extend
    `CommonProps`; each spreads `acceptCommonProps(rest)`. Their box aspects and layout
    props are unchanged.
  - Verify: `bun run typecheck`; browser check of a `data-*` attribute on a stack
  - Files: `src/components/layout/HStack.tsx`, `src/components/layout/VStack.tsx`,
    `src/components/layout/Grid.tsx`, `src/components/layout/Container.tsx`
  - Depends: Task 1

- [x] **Task 5: Add `CommonProps` to the page-shell components**
  - Acceptance: `PageLayoutProps`, `PageHeaderProps`, `PageBodyProps`,
    `PageFooterProps`, and `SiteNavigationHeaderProps` extend `CommonProps`; each spreads
    `acceptCommonProps(rest)`. `PageBody` keeps its scroll ref. `SiteNavigationHeader`
    keeps its `inert` and `aria-hidden` on the inner element.
  - Verify: `bun run typecheck`; browser check of the shell
  - Files: `src/components/layout/PageLayout.tsx`,
    `src/components/layout/PageHeader.tsx`, `src/components/layout/PageBody.tsx`,
    `src/components/layout/PageFooter.tsx`,
    `src/components/layout/SiteNavigationHeader.tsx`
  - Depends: Task 1

### Checkpoint: Layout tier
- [x] Every layout component accepts and forwards the common props
- [x] The page shell and scroll behaviour still work

### Phase 4: Documentation and verification

- [x] **Task 6: Document the common-props rule**
  - Acceptance: `src/components/AGENTS.md` states that a component extends `CommonProps`
    and forwards `acceptCommonProps(rest)`, and lists the curated set and the exclusions.
    `src/lib/README.md`, if it exists, notes the helper, or the rule lives in
    `components/AGENTS.md` only.
  - Verify: `technical-writing` review; `bun run check`
  - Files: `src/components/AGENTS.md`
  - Depends: Tasks 2-5

- [x] **Task 7: Gates and browser dogfood**
  - Acceptance: `bun run check`, `bun run typecheck`, `bun test`, and the demo build
    pass. In the browser, the dialog exposes `role="dialog"` and a resolvable
    `aria-labelledby`, an injected `id` and `data-*` reach base and layout elements, and
    the console is clean on two themes.
  - Verify: the four commands plus an `agent-browser` pass
  - Files: none
  - Depends: Task 6

### Checkpoint: Complete
- [x] All success criteria in `spec.md` met
- [x] Ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `CommonProps` type is not assignable when spread onto an intrinsic element | Med | Build the type from React's own attribute interfaces; `bun run typecheck` catches it |
| Radix passes a `style` through `asChild` that the filter drops | Med | Confirm the dialog in the browser (Task 3, Task 7); add a named key only if needed |
| A component already spreads an unfiltered rest object | Low | Replace every `{...rest}` with `{...acceptCommonProps(rest)}` |
| `Icon`'s a11y attributes are overridden by a caller | Low | Spread the common props first, then the computed role and label |
| The `data-*` index signature clashes with a named prop | Low | Named props do not use the `data-`, `aria-`, or `on` prefixes |

## Open Questions

1. `Box` filter vs full forwarding: use the curated filter and confirm the dialog.
   Recommended.
2. Page-shell components: include them for consistency. Recommended.
