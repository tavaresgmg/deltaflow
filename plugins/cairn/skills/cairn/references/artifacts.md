# Artifact Policy

Create artifacts only when they reduce risk, preserve context, or make review easier. This file
owns when/why; skeletons live in `skills/cairn/templates/`.

## No Artifact

Use for `direct` and most `diagnose` work. No `.cairn/` folder.

## Scaffolding

`discovery`, `delta-spec`, and `tracked-change` create the change folder deterministically:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-scaffold.mjs <mode> <slug>
```

Copies only justified templates into `.cairn/changes/<slug>/` and seeds repo
`.cairn/decision-log.md`. Idempotent; never overwrites live work.

- `discovery` → `brief.md`
- `delta-spec` → `delta.md`, `plan.md`, `tasks.md`, `proof.md`
- `tracked-change` → `brainstorm.md`, `delta.md`, `plan.md`, `tasks.md`, `proof.md`

## Codebase Map

Use when `Observe` keeps rediscovering non-obvious context. Template:
`templates/codebase-map.md`; store at `.cairn/codebase/<area>.md`. Maps are hints: re-check
drift-prone facts.

## Queue

Use `.cairn/queue.md` for mid-work ideas that should not silently enter scope. Template:
`templates/queue.md`. State root owns it: workspace queue for multi-repo, repo queue otherwise.
Caps: `Now` <=3, `Next` <=10, `Later` <=15, `Closed recent` <=10. Triage: do now, enqueue, replace priority, or drop.

## Brainstorm

Use for `tracked-change` or stakes that justify design-before-code. Short on small work; one
question at a time; name the tradeoff. Template: `templates/brainstorm.md`.

## Brief

Use for discovery and ambiguous planning. Template: `templates/brief.md`.

## Delta

Use for medium brownfield behavior changes. Template: `templates/delta.md`.

Use `Semantic Claims` only when drift matters: one behavior, one code path, one proof command.
`cairn-analyze.mjs` checks `code:`, `proof:`, paths, and infers simple `Proposed Behavior`.

## Spec

Use `.cairn/specs/<capability>.md` only for durable behavior. Template: `templates/spec.md`.
Specs use `Semantic Claims`. Read existing specs before durable behavior changes; no specs for
tiny transient fixes.

## Plan

Template: `templates/plan.md`.

## Tasks

Live resume checklist. One verifiable step per line; tick incrementally; append proof.
Template: `templates/tasks.md`.

## Proof

Template: `templates/proof.md`.

## Decision log

Append-only repo `.cairn/decision-log.md`, written during work. One line per load-bearing
decision. Template: `templates/decision-log.md`.

## Retention

- Keep completed specs only if they describe durable product/system behavior.
- On close of `delta-spec` or `tracked-change`, choose lifecycle: sync durable behavior into
  `.cairn/specs/<capability>.md`, delegate, archive, or delete transient planning.
- Archive retained completed changes under `.cairn/changes/archive/<YYYY-MM-DD>-<slug>/`.
- Delete transient plans after completion when code/tests/docs already carry the truth.
- Rotate `decision-log.md` past ~200 lines: move older entries to
  `.cairn/changes/archive/decision-log-<YYYY-MM>.md`, keep the recent tail. The anchor reads only
  the last entries, so the live log stays small.
- Hybrid default: commit durable knowledge (`specs/`, `codebase/`, `docs/`); keep process local
  (`queue.md`, `changes/`, `decision-log.md`, `state/`, `tmp/`, `worktrees/`). Sync durable
  findings at close. User-overridable via `.gitignore`; boundary reports `memoryPolicy`.
- Do not keep execution logs as durable docs. Prefer code, tests, and concise specs over narrative.
- Cleanup is report-first: list stale tmp/worktrees/changes, then remove only by explicit command.
- `cairn-retention.mjs .cairn/changes` reports completed changes and next retention action.
