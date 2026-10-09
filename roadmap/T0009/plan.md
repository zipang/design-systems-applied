# Implementation Plan: T0009 Rename the DS Visualizer tool to Theme Editor

## Overview

Rename the tool from `ds-visualizer` to `theme-editor` in one mechanical pass: move the
directory, rename the workspace package, rewire the root scripts and TypeScript exclude,
refresh the lockfile, then update every user-facing string and doc. Nothing about the
tool's behavior or the Design System contract changes. Tasks are ordered so the workspace
is never left in a broken state: move and rewire first, then strings, then docs, then
verify.

## Architecture Decisions

- **`git mv` the directory.** Preserves history and keeps the diff readable.
- **Package `@tools/theme-editor`.** Matches the new directory name; the workspace glob
  `tools/*` picks it up without a root config change.
- **Keep the Design System API names.** `[data-ds-preview]` and `--ds-*` describe the
  previewed Design System, not the tool, so they are unchanged. This avoids a needless
  CSS/attribute migration.
- **Leave historical tickets as-is.** `roadmap/T0001`–`T0008` are a record; rewriting them
  would falsify history.
- **Hand-edit `bun.lock`.** The workspace path and package name appear in three places;
  edit them directly rather than regenerating, so unrelated in-progress lockfile edits are
  not flushed into the commit.

## Task List

### Phase 1: Move and rewire the workspace

- [x] **Task 1: Move the directory and rename the package**
  - Acceptance: `tools/ds-visualizer/` is moved to `tools/theme-editor/`; the package's
    `name` is `@tools/theme-editor`.
  - Verify: `git status` shows renames; `bun run --cwd tools/theme-editor typecheck` runs.
  - Files: `tools/ds-visualizer/` → `tools/theme-editor/`,
    `tools/theme-editor/package.json`
  - Depends: None

- [x] **Task 2: Update the root wiring**
  - Acceptance: root `package.json` scripts (`theme-editor`, `theme-editor:dev`,
    `typecheck`) point at `tools/theme-editor`; root `tsconfig.json` excludes
    `tools/theme-editor`; `bun.lock` workspace entry and package index use the new path and
    name.
  - Verify: `bun install` reports no lockfile drift; `bun run typecheck` passes.
  - Files: `package.json`, `tsconfig.json`, `bun.lock`
  - Depends: Task 1

### Checkpoint: Workspace
- [x] `bun run typecheck` passes from the root

### Phase 2: User-facing strings and docs

- [x] **Task 3: Rename the tool's user-facing strings**
  - Acceptance: the server banner, `index.html` title, toolbar wordmark, default theme
    name, the tool's `DESIGN.md`/`design-tokens.css` headers, and the internal comments no
    longer say "visualizer"; the default theme is named `Theme Editor Default`; the
    embedded `default-theme.ts` strings match the on-disk files.
  - Verify: grep for `visualizer` under `tools/theme-editor/src` and the tool root;
    `bun test tools/theme-editor`.
  - Files: `tools/theme-editor/src/server.tsx`,
    `tools/theme-editor/src/components/editor/Toolbar.tsx`,
    `tools/theme-editor/index.html`, `tools/theme-editor/DESIGN.md`,
    `tools/theme-editor/design-tokens.css`,
    `tools/theme-editor/src/lib/default-theme.ts`,
    `tools/theme-editor/src/lib/theme-store.ts`, `tools/theme-editor/src/App.tsx`,
    `tools/theme-editor/src/components/editor/SettingsCog.tsx`
  - Depends: Task 1

- [x] **Task 4: Update the tool's docs**
  - Acceptance: the tool `README.md` title and commands use `theme-editor`;
    `AGENTS.md`, `src/AGENTS.md`, and `src/components/AGENTS.md` use the new path and name.
  - Verify: grep for `ds-visualizer` / `DS Visualizer` under `tools/theme-editor`.
  - Files: `tools/theme-editor/README.md`, `tools/theme-editor/AGENTS.md`,
    `tools/theme-editor/src/AGENTS.md`, `tools/theme-editor/src/components/AGENTS.md`
  - Depends: Task 1

### Checkpoint: Naming
- [x] No `ds-visualizer` or `visualizer` reference in active code or docs

### Phase 3: Verification

- [x] **Task 5: Verify and commit**
  - Acceptance: `bun install`, `bun run check`, `bun run typecheck`, and `bun test` pass;
    both `bun run theme-editor` and `bun run theme-editor:dev` serve the app; the grep gate
    is clean.
  - Verify:
    `grep -rniE "ds-visualizer|[^a-z]visualizer" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.tmp --exclude-dir=roadmap .`
    returns nothing.
  - Files: none (verification only)
  - Depends: Tasks 1–4

### Checkpoint: Done
- [x] All success criteria in the spec are checked
- [x] Human sign-off

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| A workspace path is missed | High | Grep for `ds-visualizer`/`visualizer`; `bun install` + `typecheck` catch stale paths |
| Lockfile hand-edit drifts from `bun install` | Med | Run `bun install` and confirm it makes no change |
| The rename flushes unrelated lockfile edits | Low | Stage only the rename; verify `git diff --cached` before committing |
| `data-ds-preview` accidentally renamed | Med | Explicit out-of-scope note; grep confirms it is untouched |

## Open Questions

None.
