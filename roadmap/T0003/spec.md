# Spec: T0003 Page layout shell, scrollable body, and collapsible site navigation

## Restate of intent

- **Outcome:** A reusable page shell for `demos/radix-ui-starter`. `PageLayout` fills the
  viewport; a `PageHeader` and `PageFooter` stay pinned while `PageBody` scrolls. A
  `SiteNavigationHeader` placed in the header collapses on scroll-down and returns on
  scroll-up, so the body gains space. The chat and components pages are rebuilt on it.
- **User:** AI agents first — they need an exemplary pattern for app-shell layout and
  scroll-aware headers. Humans second.
- **Why now:** The demo currently relies on a `min-height` flex column and the whole
  window scrolls. That does not model a real app shell and cannot pin a header/footer.
- **Success:** On every page, the shell is exactly viewport-tall, the header/footer do
  not move, only the body scrolls, and the site nav collapses/returns with scroll. All
  gates pass and the patterns stay token-only.
- **Constraint:** No new runtime dependencies. Styling consumes the fixed token set.
- **Out of scope:** Site-wide footer content, mobile drawers, horizontal scroll,
  window-based sticky headers, and changing the token contract.

## Objective

Add a fifth group of layout primitives to `src/components/layout/` and a small scroll
logic module to `src/lib/scroll/`:

- `PageLayout` — the shell. Renders `<main class="layout-page">` as a CSS grid with
  rows `auto minmax(0, 1fr) auto`, `block-size: 100vh` then `100dvh`, and
  `overflow: hidden`. It creates the body scroll ref and provides it through
  `PageScrollContext`.
- `PageHeader` — `<header class="layout-page-header">`, grid row 1, page-scoped (not a
  banner landmark).
- `PageBody` — `<article class="layout-page-body">`, grid row 2, the scroll container.
  Attaches the provided scroll ref.
- `PageFooter` — `<footer class="layout-page-footer">`, grid row 3.
- `SiteNavigationHeader` — a wrapper for the primary navigation. It collapses its own
  height (`grid-template-rows: 1fr` → `0fr`) when the body is scrolled down and expands
  on scroll-up. It carries `is-hidden`, and sets `inert` + `aria-hidden` while hidden.

`PageLayout` is `<main>`; children self-position by grid row, so slots are optional and
order-independent. A `<header>`/`<footer>` inside `<main>` is page-scoped, which is the
intended meaning. `PageHeader` being a `<header>` means `ChatHeader` (also `<header>`)
lives inside `PageBody` (`<article>`) as the article's header, pinned with
`position: sticky`.

Scroll detection ports the well-known pattern from `react-headroom` and
`use-scroll-direction` (both MIT): a passive scroll listener compares the current offset
to the previous one, ignores movement under a threshold, and reports a direction that
changes only on a reversal. The pure decision logic is separated and unit-tested; the
hook stays thin. `SiteNavigationHeader` prefers the `PageBody` ref from context and falls
back to `window`, so it also works outside a `PageLayout`.

## Page refactor

`App` becomes the shell composer: it renders `PageLayout` with `PageHeader` →
`SiteNavigationHeader` → `AppNav` (Chat/Components switch and `ThemeSwitcher`), and
switches between the two pages. Each page renders a fragment of regions:

- `chat/ChatPage` — `PageBody` (a sticky `ChatHeader` and `MessageList`) and a
  `PageFooter` (`Composer`).
- `demo/ComponentsPage` — `PageBody` (`ComponentsDemo`).

Chat state moves from `ChatPanel` into a `chat/useChat` hook owned by `ChatPage`.
`ChatPanel` and its stylesheet are removed; `MessageList` no longer wraps its content in
`ScrollArea` because `PageBody` is the scroller.

## Code style

All root, demo, `src/`, and `src/components/` rules apply. In particular:

- Arrow-function components; `React.FC<Props>`; mandatory JSDoc; `Elt` suffix.
- Token-only CSS; unique tier-prefixed root class; stylesheet scoped under it; native
  nesting; `is-*` states; `clsx()` for class composition.
- No raw `h1`–`h6` or `p`.
- Logic modules colocate tests. Hooks are React, not separately unit-tested; the pure
  scroll decision function is.

Class names: the shell is `layout-page` (not `layout-page-layout`, a deliberate choice);
children are `layout-page-header`, `layout-page-body`, `layout-page-footer`, and
`layout-site-navigation`.

## Testing strategy

- `lib/scroll/direction.ts` is pure and tested: direction flips only past the threshold;
  jitter under the threshold keeps the previous direction; `shouldHideHeader` is true
  only when scrolling down below the top.
- No DOM tests for the wrappers (same documented exception as T0002).
- Browser dogfood on both pages and several themes covers pinning, collapse, focus, and
  reduced motion.

## Boundaries

- **Always:** consume tokens with `var()`; run `bun run check`, `bun run typecheck`, and
  `bun test` before committing.
- **Ask first:** adding runtime dependencies, changing token values, changing the shell's
  landmark structure.
- **Never:** add raw colors, sizes, or radii; add undocumented tokens; nest a `<header>`
  inside a `<header>`.

## Success criteria

- [x] `PageLayout` is exactly viewport-tall on all pages and themes.
- [x] `PageHeader` and `PageFooter` stay pinned; only `PageBody` scrolls.
- [x] `SiteNavigationHeader` collapses on scroll-down and returns on scroll-up, and is
      always visible at the top.
- [x] Hidden navigation controls are not focusable (`inert`).
- [x] Chat and components pages are rebuilt on the shell; chat still works end to end.
- [x] `ChatHeader` is the `<article>`'s `<header>` and stays pinned above the messages.
- [x] Scroll decision logic has passing tests; all gates pass.
- [x] `prefers-reduced-motion` disables the collapse transition.
