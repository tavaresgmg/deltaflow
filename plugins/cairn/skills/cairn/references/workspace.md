# Workspace (umbrella)

The umbrella model (ADR-0005): one parent folder holds N **independent** repos, not a monorepo.
Each level has one owner.

## Owner per level

| Level | Owns | State |
| --- | --- | --- |
| Marked workspace | scope, cross-repo safety, repo map, workflow state | `AGENTS.md`, `.work/HANDOFF.md`, workspace `.cairn/` |
| Child repo | git, code, tests, build, runtime | repo-local `.cairn/` only when no marked parent exists |

A marked workspace is a non-repo parent with `.work/`, or `AGENTS.md` plus multiple immediate
child Git repos. If `cairnStateScope` is `"workspace"`, scaffold all Cairn state under
`cairnStateRoot/.cairn/`, never under a child repo. Child repos still own code, Git, build,
tests, runtime, commits, and PRs.

Repo-local Cairn state follows that repo's `.gitignore`. Workspace Cairn state is local by
default because the parent is not the Git owner; `.work/` remains ephemeral active state.

## Boundary check

Before any mutation:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-boundary.mjs
```

Key fields:

- `repoRoot`: code, Git, build, and tests.
- `cairnStateRoot`: `.cairn/changes/<slug>/`, specs, decision-log, workflow state.
- `cairnStateScope`: `workspace` means `repoRoot/.cairn/**` is wrong.
- `siblingRepos`: independent repos under the workspace/umbrella.

## Branches & worktrees

One change <-> one branch. `delta-spec` and `tracked-change` run on `cairn/<slug>`; `direct` and
`diagnose` may stay on the current branch for trivial reversible fixes.

Use a worktree only to isolate a risky long change or to run independent tasks that must not
share one working tree. Anchor it under `<workspace>/.work/worktrees/<repo>.<slug>` — not as a
repo sibling, which the umbrella detector would miscount as another repo. The detector resolves
`mainWorktree`; in a marked workspace, `.cairn/` state still lands in the parent workspace.
Never make a worktree of the parent.

## Multi-repo tasks

A task spanning 2+ repos is coordinated from the parent workspace and lands as **separate
PRs/MRs per repo**, never one across repos. Parent `.cairn/changes/<slug>/` records workflow
state; `.work/HANDOFF.md` records active handoff, repo map, sequencing, and blockers. Do not
create duplicate child `.cairn/changes/<slug>/` folders when `cairnStateScope` is `workspace`.

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
