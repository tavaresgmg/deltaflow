# Workflow

Order for non-trivial work.

## Start

- Boundary: repo/state roots, policy, worktree.
- Git: `git status --short --branch`, remotes, branch, worktrees, divergence, user changes;
  prefer `cairn/<slug>` in `.cairn/worktrees/<repo>/<slug>`.
- Read instructions, specs, maps, queue top (`.cairn/queue.md`), tests, patterns, `tasks.md`,
  log tail before edits.

## Middle

- Brainstorm paths: options, tradeoff/downside, adversarial challenge, disproof path.
- Research official/primary sources; use lockfile version for deps.
- Plan owners, contracts, proof, rollback, reuse/adapt/new.
- Specs: read `.cairn/specs/`; use `Semantic Claims` only when truth outlives the change folder.
- Side-idea: triage before scope expansion — now, enqueue, replace priority, or drop.

## Close

Review, prove, reconcile delta/code/tests/specs/queue, record `sync|delegate|archive|delete`,
run `cairn-close.mjs .cairn/changes/<slug>`. Truth: code/tests/specs/maps/docs.
