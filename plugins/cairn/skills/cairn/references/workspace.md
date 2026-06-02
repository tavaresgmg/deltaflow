# Workspace (umbrella)

The umbrella model (ADR-0005): one parent folder holds N **independent** repos — not a
monorepo. Each level has one owner. This is the gap no other framework fills.

## Owner per level

| Level | Owns | State |
| --- | --- | --- |
| Parent (umbrella) | scope, cross-repo safety, repo map | `AGENTS.md` + ephemeral `.work/HANDOFF.md` |
| Child repo | its own git, code, tests, build | committed `.cairn/specs`+`codebase/`, local `.cairn/changes/` + ephemeral `.work/` |

Commit policy is hybrid: durable `.cairn/specs`+`codebase/` committed; `.cairn/changes/` and
`decision-log` local; `.work/` gitignored (see `artifacts.md`).

## Boundary check before any mutation

Never mutate based on assumption about which repo you're in. Run the deterministic detector
first:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-boundary.mjs
```

It reports `repoRoot`, `isWorktree`, `mainWorktree`, `umbrellaRoot`, `siblingRepos`, and a
`context` block (readiness signals — see `modes.md`) as JSON. Confirm `repoRoot` is the
intended target before editing, committing, or running build or test commands. If
`umbrellaRoot` is set, you are in a multi-repo workspace — be explicit about which child
you're touching.

## Branches & worktrees

One change ↔ one branch. `delta-spec` and `tracked-change` run on `cairn/<slug>` (same slug as
`.cairn/changes/<slug>/`), branched from the default; `direct`/`diagnose` may stay on the current
branch when the fix is trivial and reversible.

Use a worktree only to isolate a risky long change or to run independent tasks that must not
share one working tree. Anchor it under `<workspace>/.worktrees/<repo>.<slug>` — not as a repo
sibling, which the umbrella detector would miscount as another repo. The detector resolves
`mainWorktree`, so `.cairn/` state lands in the real repo. Never make a worktree of the umbrella
parent.

Close: open a PR/MR from `cairn/<slug>` (with authorization — see `gates.md`), then
`git worktree remove` and prune the branch. The worktree is disposable; the memory it produced
is not.

## Multi-repo tasks

A task spanning 2+ repos is coordinated from the parent `.work/HANDOFF.md` and lands as
**separate PRs/MRs per repo** — never one across repos. Each child's `.cairn/` records its own
slice; the parent handoff records the cross-repo intent and sequencing.

## Templates

```md
# HANDOFF — <workspace>

## Goal (cross-repo)

## Repo map
- <repo>: <role> — <branch/worktree>

## Sequencing
1. <repo>: <step>

## Open / blocked
```
