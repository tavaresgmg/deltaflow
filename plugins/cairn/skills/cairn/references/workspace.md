# Workspace (umbrella)

ADR-0005: one parent folder can hold N independent repos; not a monorepo. Each level has one owner.

- Marked workspace: owns scope, cross-repo safety, repo map, workflow state:
  `AGENTS.md`, `.cairn/state/HANDOFF.md`, `.cairn/docs/`, `.cairn/worktrees/`.
- Child repo: owns Git, code, tests, build, runtime, commits, PRs. Repo-local `.cairn/` only
  when no marked parent exists.

A marked workspace is a non-repo parent with `.cairn/`, legacy `.work/`, or `AGENTS.md` plus
multiple immediate child Git repos. If `cairnStateScope=workspace`, scaffold state under
`cairnStateRoot/.cairn/`, never under a child repo. `.work/` is legacy input; new state goes only
under `.cairn/`.

## Boundary check

Before mutation:

```bash
node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-boundary.mjs
```

Key fields:

- `repoRoot`: code/Git/build/tests owner.
- `cairnStateRoot`: `.cairn/changes/<slug>/`, specs, decision-log.
- `cairnWorktreeRoot`: `.cairn/worktrees/`.
- `cairnTmpRoot`: `.cairn/tmp/`.
- `cairnStateScope=workspace`: `repoRoot/.cairn/**` is wrong.
- `legacyWorkRoot`: old `.work/` root, if present.
- `siblingRepos`: independent repos in the umbrella.

## Branches & worktrees

Default for non-trivial mutation: **branch + worktree**. Current tree is allowed only for tiny
`direct`/`diagnose` fixes when clean and no user work can mix in.

Preflight before creating/reusing: boundary output; `git status --short --branch`; remotes; current
branch; `git worktree list`; fetch/prune; base (`origin/main`, `origin/master`, or upstream);
local-vs-remote divergence. If dirty, behind, ambiguous, or slug exists, choose reuse/new slug.

Use branch `cairn/<slug>` and worktree path `.cairn/worktrees/<repo>/<slug>`, not a repo sibling.
Attach existing branch or create from checked base. Detector resolves `mainWorktree`; workspace
state still lands in the parent. Never make a worktree of the parent.

## Multi-repo tasks

Tasks spanning 2+ repos are parent-coordinated and land as separate PRs/MRs per child repo.
`.cairn/state/HANDOFF.md` records map/sequence/blockers; it never replaces Cairn state. If
`cairnStateScope=workspace`, parent `.cairn/changes/<slug>/` owns state; child duplicates are
wrong. If `repo`, each touched child owns its `.cairn/changes/<slug>`.

## Dogfood proof contract

One real task across 2+ child repos. Show: boundary output; `.cairn/state/HANDOFF.md` map;
correct state owner; no duplicate child state; separate branch/worktree/proof/PR per child; one
lifecycle decision. Use handoff, change folder, repo proofs.

## HANDOFF template

```md
# HANDOFF - <workspace>
## Goal
## Repo map
- <repo>: <role> — <branch/worktree>
## Sequencing
1. <repo>: <step>
## Open / blocked
```
