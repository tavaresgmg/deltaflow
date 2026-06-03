# Workflow

Order for non-trivial work.

## Start

- Boundary: repo/state roots, policy, worktree.
- Git: `git status --short --branch`, remotes, branch, worktrees, divergence, user changes;
  prefer `cairn/<slug>` in `.cairn/worktrees/<repo>/<slug>`.
- Read instructions, specs, maps, tests, patterns, `tasks.md`, log tail before edits.

## Middle

- Brainstorm paths: options, tradeoff/downside, adversarial challenge, disproof path.
- Research official/primary sources; use lockfile version for deps.
- Plan owners, contracts, proof, rollback, reuse/adapt/new.
- Specs: read `.cairn/specs/`; use `Semantic Claims` only when truth outlives the change folder.

## Close

Review, prove, reconcile delta/code/tests/specs, record `sync|delegate|archive|delete`, run
`cairn-analyze.mjs` (`--spec-root` if external). Truth: code/tests/specs/maps/docs.
