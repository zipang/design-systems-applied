# Spec: T0001 Repository coherence, skill packaging, and token-contract tooling

## Objective

Make the `design-systems-applied` repository internally coherent and usable by AI
agents, then close the documentation/implementation gaps found in the code review.

The repository's purpose is to document a Design System contract and distribute the
`design-system-tokens` skill plus the surrounding agent workflow. Today:

- The core skill (`skills/design-system-tokens/SKILL.md`) is **not discoverable** by
  the skill loader, because skills are only discovered under `.agents/skills/`.
- `follow-the-rules` references rule files that do not exist.
- The ticket workflow commands reference a `roadmap/` directory that does not exist.
- `typescript-best-practices` references bun scripts and a `use-bun` skill that do not
  exist.
- The README and the `design-system-tokens` skill contradict the shipped CSS references
  in several places (stylesheet name, rounded tokens, type-scale mapping, preset rule).
- Repository hygiene gaps: no root `package.json`, no lint gate, no root `.gitignore`,
  no `LICENSE`, no CI, a self-ignoring `.opencode/.gitignore`, and a placeholder
  `packages/radix-ui-starter` with no implementation.

Success means: an agent opening this repository can load the core skill, follow the
rules, run the checks, and trust that the docs match the files.

## Tech Stack

- **Markdown** for skills, commands, rules, docs.
- **CSS** for design-token references and presets (plain CSS custom properties).
- **Bun** as the planned task runner and test runner.
- **Biome** as the planned formatter/linter for JS/JSON/CSS.
- No application framework. `packages/radix-ui-starter` is a planned React + Radix UI
  demonstration project (separate ticket, see Open Questions).

## Commands

Planned (Task 8 introduces the root `package.json`; the commands do not exist yet):

```
Install:    bun install
Check:      bun run check      # biome check .
Typecheck:  bun run typecheck  # bunx tsc --noEmit
Test:       bun test
Format:     bun run format     # biome format --write .
```

Until Task 8 lands, verification is manual (`git diff`, file inspection, session
restart to confirm skill discovery).

## Project Structure

```
.agents/skills/<name>/SKILL.md   → agent skills discovered by opencode
.opencode/commands/*.md          → slash commands
.opencode/skills/<name>/SKILL.md → alternate skill discovery path (unused today)
skills/design-system-tokens/     → canonical, distributable copy of the core skill
roadmap/TXXXX/{spec,plan}.md     → tickets (this file)
tools/                           → token contract validator/sync CLI (planned)
packages/radix-ui-starter/       → end-to-end demo (planned, separate ticket)
```

Decision: the canonical `design-system-tokens` skill stays at `skills/` so it can be
copied into other projects. A **proxy** `SKILL.md` at
`.agents/skills/design-system-tokens/SKILL.md` points to it, rather than a symlink
(symlink traversal by the loader is unconfirmed and symlinks are not portable to
Windows). The proxy duplicates no token content; it only carries `name`/`description`
and an instruction to read the canonical file.

## Code Style

- Formatting: tabs, LF, UTF-8, max line 100 (`.editorconfig`, `biome.jsonc`).
- Markdown prose follows the project glossary (`README.md`) and the
  `technical-writing` skill.
- CSS: tokens only through `var()`; no raw values in component CSS.
- Front matter for skills: only `name` and `description` are recognized by the loader
  (confirmed in opencode docs). Unknown fields are ignored.

Example (proxy skill front matter):

```markdown
---
name: design-system-tokens
description: The Design System is a dual-file contract (DESIGN.md + design-tokens.css) of fixed design tokens exposed as CSS variables. Use to create or update token values, or document their usage to create components.
---

Read `skills/design-system-tokens/SKILL.md` from the repository root and follow it in full.
```

## Testing Strategy

This repository is documentation plus a planned CSS/tooling contract. Testing is:

- **Contract checks** (planned in `tools/`): parse `DESIGN.md` YAML front matter and
  `design-tokens.css`, assert every token maps and every value matches.
- **Lint/format gate**: `bun run check` over `**` excluding `node_modules`, `.opencode`.
- **Discovery check**: after adding the proxy skill, restart the session and confirm
  `design-system-tokens` appears in the skill tool list.
- **Manual doc review**: use the `follow-the-rules` and `technical-writing` skills for
  markdown changes.

## Boundaries

- **Always:** keep `DESIGN.md` front matter and `design-tokens.css` values identical;
  run the check gate before commits; cite `file:line` in reviews; update both the
  canonical skill and any proxy when the description changes.
- **Ask first:** renaming shipped reference files, restructuring `skills/` vs
  `.agents/skills/`, adding dependencies, changing CI config, splitting work into a
  new ticket.
- **Never:** commit secrets; duplicate token content into the proxy; add the
  `--elevation-*`/`--border-*` tokens outside their preset or the self-contained
  reference; introduce undocumented tokens.

## Success Criteria

- [ ] `design-system-tokens` is discoverable as a skill after a session restart.
- [ ] Every skill/command reference resolves to an existing file (no dangling refs).
- [ ] No documentation statement contradicts a shipped reference file (stylesheet
      name, rounded tokens, type scale, preset rule).
- [ ] A single `bun run check` gate exists and passes.
- [ ] The root README is complete and its token-mapping example is correct.
- [ ] The `roadmap/` workflow and its templates exist.
- [ ] Repository hygiene: `.gitignore`, `LICENSE`, non-self-ignoring
      `.opencode/.gitignore`, and a CI workflow.
- [ ] A validator/sync tool design exists for the dual-file contract (implementation
      may be a follow-up ticket).

## Open Questions

1. `packages/radix-ui-starter` is a full end-to-end demo. Should it be its own ticket
   (`T0002`) rather than a phase of T0001? Recommendation: yes, separate ticket.
2. Should the `tools/` validator/sync CLI be implemented in T0001, or specified here
   and implemented in a dedicated ticket? Recommendation: specify here, implement in
   its own ticket.
3. Should `follow-the-rules` keep pointing at `src/AGENTS.md` and
   `src/components/AGENTS.md` (which assume an application layout this repo does not
   have), or be re-scoped to the root `AGENTS.md` plus the design-system skill?
   Recommendation: re-scope; reintroduce `src/*` rule files when a real `src/` exists.
