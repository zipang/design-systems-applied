# Implementation Plan: T0001 Repository coherence, skill packaging, and token-contract tooling

## Overview

Repair the documentation/implementation gaps found in the code review so the
repository is coherent and usable: make the core skill discoverable, add the rule
files the review skills depend on, reconcile the design-token docs with the shipped
CSS, stand up a real toolchain gate, complete the README, and specify the dual-file
contract validator. Tasks are ordered by dependency and grouped into phases with
checkpoints.

## Architecture Decisions

- **Proxy skill, not symlink.** Canonical skill stays at `skills/design-system-tokens/`
  (distributable). `.agents/skills/design-system-tokens/SKILL.md` is a pointer proxy
  with only `name`/`description` front matter. Rationale: loader symlink traversal is
  unconfirmed, symlinks are not portable to Windows, and a copy would duplicate the
  token contract we are trying to keep single-sourced.
- **Canonical stylesheet name is `design-tokens.css`.** Rename
  `references/styles.css` → `references/design-tokens.css` and update all references.
  Rationale: matches the term used in `SKILL.md`, `README.md`, and `color-variants.css`.
- **Two token classes.** (a) Front-matter-mapped tokens (`colors.*`, `rounded.*`,
  `spacing.*`, `border.*`, `typography.*.fontFamily`); (b) stylesheet-only scalar
  tokens (`--font-size-*`, `--font-weight-*`, `--line-height-*`,
  `--letter-spacing-*`, `--font-size-base`). The mapping/validation rules must state
  this explicitly so empty "Token path" cells stop contradicting rule 257.
- **Rounded model:** all five `rounded.*` tokens are required (`none` = `0`,
  `full` = `9999px`; `sm`/`md`/`lg` are design choices). Validation rule 258 is
  amended: optional tokens fall back to a `var()` reference *or* a documented literal
  (required by `elevation`, whose defaults are `none`).
- **Preset rule scope:** rule 261 applies to consuming projects. The self-contained
  reference stylesheet may inline `--elevation-*`/`--border-*`; this exception is
  documented instead of implied.

## Task List

### Phase 1: Foundation — packaging and workflow scaffolding

- [x] **Task 1: Add the `design-system-tokens` proxy skill**
  - Acceptance: `.agents/skills/design-system-tokens/SKILL.md` exists; `name` equals
    the directory name; body points to `skills/design-system-tokens/SKILL.md`; no token
    tables are duplicated; skill appears in the loader list after a session restart.
  - Verify: restart session, confirm `design-system-tokens` in available skills; then
    load it and confirm the canonical file is read.
  - Files: `.agents/skills/design-system-tokens/SKILL.md`
  - Depends: None

- [x] **Task 2: Scaffold the `roadmap/` ticket workflow**
  - Acceptance: `roadmap/T0001/spec.md` and `roadmap/T0001/plan.md` exist and match the
    skill templates; README glossary defines "Ticket"; the `/spec`, `/plan`,
    `/implement` commands' paths resolve.
  - Verify: manual check of command paths against the directory tree.
  - Files: `roadmap/T0001/spec.md`, `roadmap/T0001/plan.md`, `README.md`
  - Depends: None

- [x] **Task 3: Create the root `AGENTS.md` and re-scope `follow-the-rules`**
  - Acceptance: root `AGENTS.md` documents project context and workflow; the
    `src/AGENTS.md` / `src/components/AGENTS.md` references are removed from
    `follow-the-rules` and replaced with the root rules plus the
    `design-system-tokens` rules until a real `src/` exists.
  - Verify: every rule path cited by `follow-the-rules` exists on disk.
  - Files: `AGENTS.md`, `.agents/skills/follow-the-rules/SKILL.md`
  - Depends: None

### Checkpoint: Foundation
- [x] Proxy skill loads after restart
- [x] No dangling path in commands or `follow-the-rules`
- [x] Review with human before proceeding

### Phase 2: Reconcile `design-system-tokens` docs with implementation

- [x] **Task 4: Unify the stylesheet name on `design-tokens.css`**
  - Acceptance: `references/styles.css` renamed to `references/design-tokens.css`; all
    references updated (`SKILL.md` §1 and §9, `DESIGN.md`, `color-variants.css`,
    `reset.css`, `utilities.css` comments, `README.md`).
  - Verify: `grep -rn "styles.css"` returns no stale references (except intentional
    historical notes).
  - Files: `skills/design-system-tokens/**`, `README.md`
  - Depends: None

- [x] **Task 5: Fix the rounded token model**
  - Acceptance: required flags agree between `SKILL.md` and `DESIGN.md` (all five
    required); `rounded.full` is `9999px` everywhere; validation rule 258 amended to
    allow documented literal defaults.
  - Verify: cross-read the rounded tables and `design-tokens.css`; values match.
  - Files: `skills/design-system-tokens/SKILL.md`,
    `skills/design-system-tokens/references/DESIGN.md`,
    `skills/design-system-tokens/references/design-tokens.css`
  - Depends: Task 4

- [x] **Task 6: Resolve the typography mapping**
  - Acceptance: `--font-size-base` is documented as a required stylesheet-only token;
    the mapping rule and validation rules 257/258 distinguish the two token classes;
    the empty "Token path" cells are explained (stylesheet-only).
  - Verify: no token emitted by `design-tokens.css` is undocumented; rules are
    internally consistent.
  - Files: `skills/design-system-tokens/SKILL.md`,
    `skills/design-system-tokens/references/DESIGN.md`
  - Depends: Task 4

- [x] **Task 7: Scope the elevation/border preset rule**
  - Acceptance: rule 261 states it governs consuming projects; the reference
    stylesheet documents its self-contained inline exception; no implied contradiction
    remains.
  - Verify: read rule 261 and the stylesheet header together.
  - Files: `skills/design-system-tokens/SKILL.md`,
    `skills/design-system-tokens/references/design-tokens.css`
  - Depends: Task 4

### Checkpoint: Contract coherence
- [x] No doc statement contradicts a shipped reference
- [x] Manual review of the full skill by human

### Phase 3: Functional toolchain

- [x] **Task 8: Add the root toolchain gate**
  - Acceptance: root `package.json` with `check`, `typecheck`, `test`, `format`
    scripts; Biome installed; `biome.jsonc` schema resolves and excludes nested
    `node_modules` (`!**/node_modules`); `bun run check` passes.
  - Verify: `bun install && bun run check && bun run typecheck`.
  - Files: `package.json`, `bun.lock`, `biome.jsonc`
  - Depends: None

- [x] **Task 9: Repair dangling skill references**
  - Acceptance: `typescript-best-practices` no longer references the missing `use-bun`
    skill (or a `use-bun` skill is added); the `planning-and-task-breakdown`
    `definition-of-done.md` link resolves; `refactor` drops the unrecognized
    `disable-model-invocation` field.
  - Verify: every path/reference cited across `.agents/skills` exists.
  - Files: `.agents/skills/typescript-best-practices/SKILL.md`,
    `.agents/skills/planning-and-task-breakdown/SKILL.md`,
    `.agents/skills/refactor/SKILL.md`,
    `.agents/references/definition-of-done.md` (new, if link kept)
  - Depends: None

### Checkpoint: Toolchain
- [x] `bun run check` and `bun run typecheck` pass
- [x] No dangling references across skills/commands

### Phase 4: Content and repository hygiene

- [x] **Task 10: Complete the README**
  - Acceptance: truncated line 32 finished; Colors/Typography/Space/Shapes sections
    written; mapping example corrected to `--color-brand-primary`; glossary updated for
    the proxy-skill layout and "Ticket"; typos fixed.
  - Verify: `follow-the-rules` + `technical-writing` review; glossary terms used
    consistently.
  - Files: `README.md`
  - Depends: Tasks 2, 6

- [x] **Task 11: Repository hygiene**
  - Acceptance: root `.gitignore`; `LICENSE`; `.opencode/.gitignore` no longer ignores
    itself (remove the `.gitignore` line) so ignore rules are committed; CI workflow
    runs `bun install && bun run check`.
  - Verify: `git check-ignore` for `.opencode/node_modules`; CI file syntax valid;
    `git status` shows the ignore file as trackable.
  - Files: `.gitignore`, `LICENSE`, `.opencode/.gitignore`, `.github/workflows/ci.yml`
  - Depends: Task 8

- [x] **Task 12: Fix the radix-ui-starter placeholder text**
  - Acceptance: typos fixed; the README explicitly marks the package as a planned
    placeholder and links to its future ticket.
  - Verify: manual proofread.
  - Files: `packages/radix-ui-starter/README.md`
  - Depends: None

### Checkpoint: Release-ready
- [x] README complete and accurate
- [x] CI green
- [x] Human sign-off

### Phase 5: Specify the validator (implementation deferred)

- [ ] **Task 13: Write the dual-file validator specification**
  - Acceptance: a follow-up ticket references a written spec for a CLI that parses
    `DESIGN.md` front matter and `design-tokens.css`, validates the mapping tables and
    fallbacks, and reports drift; includes exit codes and a `--fix`/sync mode.
  - Verify: human review of the spec.
  - Files: `roadmap/T0002/spec.md` (new)
  - Depends: Tasks 4-7

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Proxy description drifts from canonical skill | Med | Keep proxy description minimal; add the pair to the validator spec (Task 13) |
| Loader does not discover the proxy path | High | Verify by session restart in Task 1 before other work; fall back to `.opencode/skills/` or a symlink if needed |
| Renaming `styles.css` breaks external links | Low | Repo is pre-release; update all internal refs and commit as one change |
| `bun`/Biome unavailable on contributors' machines | Med | Document install in README and CI; keep commands standard |
| Token-model rule changes are subjective | Med | Record decisions in this plan; human reviews at the contract checkpoint |
| radix starter and validator overflow T0001 | Med | Split into T0002/T0003 as noted in spec Open Questions |

## Open Questions

- Confirm `packages/radix-ui-starter` becomes `T0002` (separate ticket).
- Confirm the validator becomes `T0003` (spec in T0001, code in T0003).
- Confirm re-scoping `follow-the-rules` away from `src/*` rule files (Task 3).
