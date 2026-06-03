# Memory & Resume

File-based state, not harness native memory. Goal: persist intent/resume while staying cheap.

## What state each mode creates

Default-light: ceremony scales with mode.

| Mode | State |
| --- | --- |
| `direct` | none |
| `diagnose` | none (escalate if the fix changes intended behavior) |
| `discovery` | a brief — inline if tiny, else `.cairn/changes/<slug>/brief.md` |
| `delta-spec` | `.cairn/changes/<slug>/` with `delta.md`, `plan.md`, `tasks.md`, `proof.md` |
| `tracked-change` | same, plus `brainstorm.md` and `research/<topic>.md` as needed |

`<slug>` is kebab-case from card/intent. Templates are in `artifacts.md`.

## Layout

```text
.cairn/
  codebase/<area>.md     # optional non-obvious repo map
  specs/<capability>.md  # optional living truth for durable behavior
  docs/<topic>.md         # durable workspace docs
  queue.md                # local priority queue: Now/Next/Later/Closed recent
  state/HANDOFF.md        # active cross-repo map/sequence/blockers
  tmp/                    # scratch; report-first cleanup
  worktrees/<repo>/<slug>/ # linked worktrees
  changes/<slug>/
    brainstorm.md          # tracked-change / when stakes warrant design-before-code
    research/<topic>.md     # distilled research summary (local; sync durable bits at close)
    brief.md                # discovery
    delta.md                # ADDED / MODIFIED / REMOVED behavior
    plan.md                 # phases, files/owners, proof, rollback
    tasks.md                # [ ] / [x] checkboxes, updated live
    proof.md                # commands + results
  changes/archive/<date-slug>/
                            # retained completed changes, not active work
  decision-log.md           # append-only, one line per decision, written DURING the work
```

Hybrid policy: commit durable knowledge (`specs/`, `codebase/`, `docs/`); keep process local
(`queue.md`, `changes/`, `decision-log.md`, `state/`, `tmp/`, `worktrees/`). See `artifacts.md`.

## Codebase maps

Use `.cairn/codebase/<area>.md` when repeated observations are costly: entry points, boundaries,
non-obvious commands, data/control/auth edges, proof commands.

No mandatory maps or stale essays. Recheck drift-prone facts: clients, routes, schemas, env vars,
owners, deploy/runtime state, versions.

## Resume protocol

- **Read state first.** Existing work: read `tasks.md` + log tail; non-trivial work: scan
  `.cairn/queue.md` top items. Do not re-derive an existing plan.
- **Write progress incrementally.** Tick `tasks.md` as each step is verified; never batch all at
  the end. A killed session must leave accurate state.
- **One verifiable step per task line.** `- [ ] step` → `- [x] step — proof: <cmd/result>`.
- **Compaction/resume anchor.** Claude SessionStart appends read-only active change/open
  tasks/recent decisions when `source` is `compact|resume`. Anchor is a pointer; still re-read
  `tasks.md`. Codex resumes from disk.

## decision-log.md

Append-only repo log for load-bearing decisions. Records *why*; code/tests/specs carry the rest.
Template + retention owned by `artifacts.md`.

## Hygiene

Retention is owned by `artifacts.md`. Memory is a hint, not authority; revalidate drift-prone
external facts.

Learn from failure: if context was missing/wrong/stale, update the owner doc at close, not just code.
