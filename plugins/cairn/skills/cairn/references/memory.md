# Memory & Resume

File-based, git-versioned state (ADR-0004) — not any harness's native memory. The point is
to persist intent and resume across sessions, while staying cheap on small work.

## What state each mode creates

Default-light: ceremony scales with the mode, never the other way around.

| Mode | State |
| --- | --- |
| `direct` | none |
| `diagnose` | none (escalate if the fix changes intended behavior) |
| `discovery` | a brief — inline if tiny, else `.cairn/changes/<slug>/brief.md` |
| `delta-spec` | `.cairn/changes/<slug>/` with `delta.md`, `plan.md`, `tasks.md`, `proof.md` |
| `tracked-change` | same, plus `brainstorm.md` and `research/<topic>.md` as needed |

`<slug>` is kebab-case from the card or intent (`csv-export`, `fix-tax-calc`). Templates for
each file are in `artifacts.md`.

## Layout

```text
.cairn/
  codebase/<area>.md     # optional non-obvious repo map; scoped and revalidated
  specs/<capability>.md  # optional living truth for durable behavior
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

Commit policy is hybrid: durable knowledge (`specs/`, `codebase/`) committed; process
(`changes/`, `decision-log.md`) local/gitignored. `.work/` is always gitignored. See `artifacts.md`.

## Codebase maps

Use `.cairn/codebase/<area>.md` when repeated observations are expensive or error-prone:
entry points, boundaries, non-obvious commands, data/control/auth edges, and proof commands.

Do not make maps mandatory. Do not turn them into stale architecture essays. Before relying on
a map, verify facts that can drift: generated clients, routes, schemas, env vars, owners,
deploy/runtime state, and versions.

## Resume protocol

- **Read state first.** Before acting on existing work, read `tasks.md` and the relevant tail
  of `decision-log.md`. Do not re-derive a plan that already exists.
- **Write progress last, but incrementally.** Tick `tasks.md` as each step is verified — never
  batch all checkboxes at the end. A killed session must leave accurate state.
- **One verifiable step per task line.** `- [ ] step` → `- [x] step — proof: <cmd/result>`.
- **Compaction/resume re-injects an anchor.** On Claude, the SessionStart hook appends a
  read-only resume anchor (`cairn-anchor.mjs`: active change, open tasks, recent decisions)
  when `source` is `compact` or `resume`, so the active route survives a compaction. The
  anchor is a pointer — still re-read `tasks.md` before acting. (Codex has no anchor injection;
  resume re-reads on-disk `tasks.md`/`decision-log.md`.)

## decision-log.md

Append-only, repo-level, written when each load-bearing decision is made, never rewritten. Records
*why*, not *what happened* — code, tests, and specs carry the rest. Template + retention owned by
`artifacts.md`.

## Hygiene

Retention is owned by `artifacts.md` (lifecycle decision at close, archive/sync/delete,
`cairn-retention.mjs`). Memory is a hint, not authority — revalidate drift-prone external facts
before acting on a recalled summary.

Learn from failure (Principle 9): when work reveals context was missing, wrong, or stale,
update the owning context doc (codebase map, spec, `AGENTS.md`) at close — not just the code.
