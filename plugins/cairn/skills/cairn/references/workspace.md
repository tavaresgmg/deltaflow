# Workspace (umbrella)

The umbrella model (ADR-0005): one parent folder holds N **independent** repos — not a
monorepo. Each level has one owner. This is the gap no other framework fills.

## Owner per level

| Level | Owns | State |
| --- | --- | --- |
| Parent (umbrella) | scope, cross-repo safety, repo map | `AGENTS.md` + ephemeral `.work/HANDOFF.md` |
| Child repo | its own git, code, tests, build | versioned `.cairn/changes/<slug>/` + ephemeral `.work/last-session` |

`.cairn/` is committed (durable memory); `.work/` is gitignored (ephemeral session/coordination).

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

## Worktrees

Anchor worktrees per child repo (the detector flags `isWorktree` and resolves `mainWorktree`
so state lands in the right place). Do not create a worktree of the umbrella parent.

## Multi-repo tasks

A task spanning 2+ repos is coordinated from the parent `.work/HANDOFF.md` and lands as
**separate PRs per repo** — never one PR across repos. Each child's `.cairn/` records its own
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
