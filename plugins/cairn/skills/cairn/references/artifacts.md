# Artifact Policy

Cairn creates artifacts only when they reduce risk, preserve context across sessions, or make
review easier. This policy owns *when and why* each artifact exists; the skeletons live as files in
`skills/cairn/templates/` and are copied in deterministically — one owner each, no prose duplicate.

## No Artifact

Use for `direct` and most `diagnose` work. No `.cairn/` folder.

## Scaffolding

`discovery`, `delta-spec`, and `tracked-change` create the change folder deterministically:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-scaffold.mjs <mode> <slug>
```

It copies only the templates that mode justifies into `.cairn/changes/<slug>/` and seeds the
repo-level `.cairn/decision-log.md`. Idempotent — never overwrites live work. Per mode:

- `discovery` → `brief.md`
- `delta-spec` → `delta.md`, `plan.md`, `tasks.md`, `proof.md`
- `tracked-change` → `brainstorm.md`, `delta.md`, `plan.md`, `tasks.md`, `proof.md`

## Codebase Map

Use on demand when `Observe` keeps rediscovering the same non-obvious brownfield context. Never for
obvious repos or small direct work. Template: `templates/codebase-map.md`; store at
`.cairn/codebase/<area>.md`, scoped by area, not whole repo. Treat maps as hints: re-check
drift-prone facts before acting; update only when it prevents future rediscovery.

## Brainstorm

Use for `tracked-change` or whenever stakes justify design-before-code (ADR-0006). Short on small
work; one question at a time; name the tradeoff. Template: `templates/brainstorm.md`.

## Brief

Use for discovery and ambiguous planning. Template: `templates/brief.md`.

## Delta

Use for medium brownfield behavior changes. Template: `templates/delta.md`.

Use `Semantic Claims` only when drift would matter: one behavior claim, one code path, one proof
command. `cairn-analyze.mjs` checks `code:`, `proof:`, and existing paths, and infers simple
coverage from `Proposed Behavior`. Explicit claims remain preferred for durable behavior.

## Spec

Use `.cairn/specs/<capability>.md` only for durable behavior. Template: `templates/spec.md`.
Specs use `Semantic Claims` so `cairn-analyze.mjs` can check code/proof refs. Read existing specs
before changing a durable capability; no specs for tiny transient fixes.

## Plan

Template: `templates/plan.md`.

## Tasks

Live checklist for resume (see `memory.md`). One verifiable step per line; tick incrementally;
append the proof when a step is done. Template: `templates/tasks.md`.

## Proof

Template: `templates/proof.md`.

## Decision log

Append-only, repo-level `.cairn/decision-log.md`, written during the work. One line per
load-bearing decision; never rewritten. Template: `templates/decision-log.md`.

## Retention

- Keep completed specs only if they describe durable product/system behavior.
- On close of `delta-spec` or `tracked-change`, make one explicit lifecycle decision: sync durable
  behavior into `.cairn/specs/<capability>.md`, delegate to the repo's existing spec system,
  archive the change folder, or delete transient planning.
- Archive retained completed changes under `.cairn/changes/archive/<YYYY-MM-DD>-<slug>/`.
- Delete transient plans after completion when code/tests/docs already carry the truth.
- Rotate `decision-log.md` past ~200 lines: move older entries to
  `.cairn/changes/archive/decision-log-<YYYY-MM>.md`, keep the recent tail. The anchor reads only
  the last entries, so the live log stays small.
- Commit policy is hybrid by default: commit durable knowledge (`specs/`, `codebase/`, `docs/`);
  keep process local and gitignored (`changes/`, `decision-log.md`, `state/`, `tmp/`,
  `worktrees/`). At close, sync durable findings into committed docs so they survive.
  User-overridable per repo via `.gitignore` (presets in `install.md`); the boundary detector
  reports the effective `memoryPolicy` so the choice is read, not guessed.
- Do not keep execution logs as durable docs. Prefer code, tests, and concise specs over narrative.
- Cleanup is report-first: list stale tmp/worktrees/changes, then remove only by explicit command.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` reports completed active changes
  and the next retention action (read-only; move/archive/delete deliberately after reviewing JSON).
