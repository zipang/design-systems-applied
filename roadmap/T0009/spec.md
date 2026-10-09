# Spec: T0009 Rename the DS Visualizer tool to Theme Editor

## Restate of intent

- **Outcome:** Rename the `tools/ds-visualizer/` tool to `theme-editor` everywhere it is
  identified: directory, workspace package name, root launch scripts, and user-facing
  strings. Behavior is unchanged.
- **User:** The developer or agent who launches the tool and reads its docs.
- **Why now:** The tool is now a full theme editor, not a read-only visualizer, so the
  old name is stale and misleading.
- **Success:** `tools/theme-editor/` exists with package `@tools/theme-editor`; the root
  `theme-editor` and `theme-editor:dev` scripts launch it; `bun run check`,
  `bun run typecheck`, and `bun test` pass; no `ds-visualizer` or `visualizer` reference
  remains in active code or docs.
- **Constraint:** Behavior is unchanged. The fixed token contract and the
  `data-ds-preview` / `--ds-*` API names are not the tool name and stay as they are.
- **Out of scope:** Renaming the `radix-ui-starter` demo; renaming design-system tokens;
  rewriting historical tickets under `roadmap/T0001`–`T0008`.

## Objective

Rename the tool, its package, its scripts, and its user-facing labels.

### Naming decisions

| Concern | Old | New |
|---|---|---|
| Directory | `tools/ds-visualizer/` | `tools/theme-editor/` |
| Package | `@tools/ds-visualizer` | `@tools/theme-editor` |
| Tool title | DS Visualizer | Theme Editor |
| Wordmark | `DS·VISUALIZER` | `THEME EDITOR` |
| Default theme name | `DS Visualizer Default` | `Theme Editor Default` |
| Server banner | `DS visualizer running at …` | `Theme editor running at …` |

- The `[data-ds-preview]` scope and `--ds-*` variables mean "Design System", not
  "visualizer"; they are unchanged.
- Historical tickets (`roadmap/T0001`–`T0008`) keep their original wording as a record.

## Tech Stack

Unchanged: Bun workspaces, React + Radix UI, token-only CSS, Biome, TypeScript.

## Commands

```
Install:    bun install
Check:      bun run check
Typecheck:  bun run typecheck
Test:       bun test
Launch:     bun run theme-editor        # plain start
Dev:        bun run theme-editor:dev    # hot reload
```

## Code Style

- Tabs, LF, UTF-8, max line 100 (`.editorconfig`, `biome.jsonc`).
- The directory move uses `git mv` so history is preserved.
- Docs follow the project glossary and the `technical-writing` skill.

## Testing Strategy

- `bun run check`, `bun run typecheck`, and `bun test` must pass after the move; the
  workspace rename is reflected in `bun.lock` by `bun install`.
- Launch both root scripts and confirm the server responds at `http://localhost:3000/`.
- Grep gate:
  `grep -rniE "ds-visualizer|[^a-z]visualizer" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.tmp --exclude-dir=roadmap .`
  returns nothing.

## Boundaries

- **Always:** move with `git mv`; update every workspace path (`package.json`,
  `tsconfig.json`, `bun.lock`); keep the tool behaving identically.
- **Ask first:** renaming the demo or the token API (`data-ds-preview`, `--ds-*`).
- **Never:** leave a stale `tools/ds-visualizer` path; rewrite historical tickets.

## Success Criteria

- [ ] `tools/ds-visualizer/` no longer exists; `tools/theme-editor/` holds the tool.
- [ ] The package is named `@tools/theme-editor`.
- [ ] `bun run theme-editor` and `bun run theme-editor:dev` launch the tool.
- [ ] No `ds-visualizer` or `visualizer` reference remains in active code or docs.
- [ ] `bun run check`, `bun run typecheck`, and `bun test` pass.

## Open Questions

None.
