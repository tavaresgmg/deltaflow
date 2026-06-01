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
  changes/<slug>/
    brainstorm.md          # tracked-change / when stakes warrant design-before-code
    research/<topic>.md     # distilled, reusable research summary (committed = memory)
    brief.md                # discovery
    delta.md                # ADDED / MODIFIED / REMOVED behavior
    plan.md                 # phases, files/owners, proof, rollback
    tasks.md                # [ ] / [x] checkboxes, updated live
    proof.md                # commands + results
  decision-log.md           # append-only, one line per decision, written DURING the work
```

`.cairn/` is committed — research summaries and decisions are reusable memory. The umbrella
workspace's ephemeral `.work/` layer (Phase 3) is separate and gitignored.

## Resume protocol

- **Read state first.** Before acting on existing work, read `tasks.md` and the relevant tail
  of `decision-log.md`. Do not re-derive a plan that already exists.
- **Write progress last, but incrementally.** Tick `tasks.md` as each step is verified — never
  batch all checkboxes at the end. A killed session must leave accurate state.
- **One verifiable step per task line.** `- [ ] step` → `- [x] step — proof: <cmd/result>`.

## decision-log.md

Append-only. One line per load-bearing decision, written when made, never rewritten:

```text
2026-06-01 — chose X over Y because <evidence>; tradeoff: <named downside>
```

It records *why*, not *what happened*. No narrative logs — code, tests, and specs carry the rest.

## Hygiene

Retention rules live in `artifacts.md`: keep specs that describe durable behavior; archive or
delete transient plans after completion; never leave stale clutter. Memory is a hint, not
authority — revalidate drift-prone external facts before acting on a recalled summary.
