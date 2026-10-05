# Implementation Plan: T0003 Page layout shell, scrollable body, and collapsible site navigation

## Overview

Add a composable app-shell to the Radix UI starter demo: `PageLayout` (viewport-tall
grid), pinned `PageHeader`/`PageFooter`, a scrollable `PageBody`, and a
`SiteNavigationHeader` that collapses on scroll-down. Rebuild the chat and components
pages on the shell. Test the pure scroll-direction logic.

## Architecture Decisions

- **Landmark structure:** `main > { header, article, footer }`. `PageLayout` is `<main>`;
  `PageHeader` is `<header>`, `PageBody` is `<article>`, `PageFooter` is `<footer>`.
  Header/footer inside `main` are page-scoped, not `banner`/`contentinfo`.
- **No nested headers:** `ChatHeader` cannot live inside the `PageHeader` `<header>`.
  It becomes the `<article>`'s `<header>`, pinned with `position: sticky`.
- **Compound, self-positioning regions:** each region sets its own `grid-row`, so slots
  are optional and order-independent.
- **Scroll source is the body:** `PageLayout` owns the ref and shares it through
  `PageScrollContext`; `PageBody` attaches it, `SiteNavigationHeader` reads it (window
  fallback outside `PageLayout`).
- **Port the library pattern:** direction detection follows `react-headroom` and
  `use-scroll-direction` (MIT), with the pure reducer separated for testing.
- **Collapse via grid rows:** `grid-template-rows: 1fr` → `0fr` on an `overflow: hidden`
  inner. Degrades to an instant toggle if unsupported; reset disables it under reduced
  motion.
- **Chat state in a hook:** `chat/useChat` owns the conversation; `ChatPage` composes the
  regions. `ChatPanel` is removed.

## Task List

### Phase 1: Scroll logic

- [x] **Task 1: Add the pure scroll direction reducer and tests**
  - Acceptance: `nextScrollDirection(previousTop, top, previous, threshold)` returns the
    previous direction for sub-threshold movement and flips on reversal;
    `shouldHideHeader(direction, top)` is true only for `down` below the top. Colocated
    tests cover jitter, both directions, and the top boundary.
  - Verify: `bun test`.
  - Files: `src/lib/scroll/direction.ts`, `src/lib/scroll/direction.test.ts`
  - Depends: None

- [x] **Task 2: Add the scroll hooks**
  - Acceptance: `useScrollDirection(target?, { threshold })` subscribes passively,
    re-renders only on a flip, and falls back to `window` when `target` is null;
    `useHideOnScroll` returns the boolean the nav needs. JSDoc credits the source
    libraries.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `src/lib/scroll/useScrollDirection.ts`
  - Depends: Task 1

### Phase 2: Layout components

- [x] **Task 3: Add `PageLayout` and the scroll context**
  - Acceptance: renders `<main class="layout-page">` as a `100vh`/`100dvh` grid with
    `overflow: hidden`; provides the body ref through `PageScrollContext`.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `src/components/layout/PageLayout.tsx`, `PageLayout.css`,
    `src/components/layout/page-scroll.ts`
  - Depends: Task 2

- [x] **Task 4: Add `PageHeader`, `PageBody`, and `PageFooter`**
  - Acceptance: `<header>`/`<article>`/`<footer>` with `layout-page-*` classes, correct
    grid rows; `PageBody` attaches the context ref and scrolls with a token-styled
    scrollbar.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `src/components/layout/{PageHeader,PageBody,PageFooter}.tsx` and `.css`
  - Depends: Task 3

- [x] **Task 5: Add `SiteNavigationHeader`**
  - Acceptance: collapses via `grid-template-rows` and `is-hidden`, slides its inner
    with `translateY(-100%)`, and sets `inert` + `aria-hidden` while hidden; uses the
    body scroll ref when present.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `src/components/layout/SiteNavigationHeader.tsx`, `.css`
  - Depends: Tasks 2, 3

### Phase 3: Rebuild the pages

- [x] **Task 6: Extract `demo/AppNav` and `chat/useChat`; pin `ChatHeader`**
  - Acceptance: `AppNav` renders the `<nav>` with the view switch and `ThemeSwitcher`;
    `useChat` owns messages/draft/attachment/pending/finished and send/reset/attach;
    `ChatHeader` is `position: sticky` with an opaque token background.
  - Verify: `bun run check`, `bun run typecheck`.
  - Files: `src/components/demo/AppNav.tsx`, `AppNav.css`,
    `src/components/chat/useChat.ts`, `src/components/chat/ChatHeader.css`
  - Depends: Task 4

- [x] **Task 7: Add `ChatPage` and `ComponentsPage`; rewrite `App`; drop `ChatPanel`**
  - Acceptance: `App` renders the shell and switches pages; `ChatPage` composes
    `PageBody`/`PageFooter`; `ComponentsPage` composes `PageBody`; `MessageList` no
    longer uses `ScrollArea`; `ChatPanel` and its CSS are deleted; `ComponentsDemo` no
    longer renders `<main>`.
  - Verify: `bun run check`, `bun run typecheck`, `bun test`, demo build.
  - Files: `src/components/chat/ChatPage.tsx`,
    `src/components/demo/ComponentsPage.tsx`, `src/App.tsx`, `src/App.css`,
    `src/components/chat/MessageList.tsx`, `.css`,
    `src/components/demo/ComponentsDemo.tsx`
  - Depends: Tasks 5, 6

### Phase 4: Docs and verification

- [x] **Task 8: Update the rule docs**
  - Acceptance: `src/components/AGENTS.md` lists the new layout components and
    `lib/scroll`; the demo `AGENTS.md` tree mentions the shell.
  - Verify: `technical-writing` + `follow-the-rules` review.
  - Files: `docs/AGENTS.md` files
  - Depends: Task 7

- [x] **Task 9: Gates and browser dogfood**
  - Acceptance: `bun run check`, `bun run typecheck`, `bun test`, and the demo build
    pass; in the browser the shell is viewport-tall, header/footer stay pinned, only the
    body scrolls, the nav collapses/returns, hidden controls are unfocusable, and the
    console is clean on several themes.
  - Verify: commands + `agent-browser` screenshots.
  - Files: none
  - Depends: Task 8

### Checkpoint: Complete
- [x] All success criteria in `spec.md` met

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `grid-template-rows` animation unsupported | Low | Toggle still works instantly; no transition |
| Sticky header overlaps scrolled messages | Med | Opaque `--color-surface` background; positioned element paints above static content |
| `useChat` extraction regresses the chat | Med | Re-verify send, receive, reset, attach, and quit in the browser |
| Body ref not set when the nav mounts | Low | Hook reads the ref inside the effect; ref set before effects run |
| Nav inside `<main>` drops the banner landmark | Low | Accepted for an app shell; `nav` remains a landmark |
