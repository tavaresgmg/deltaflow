# Plan: expand-eval-coverage

## Phases

1. Add representative broad-scope R/N cases and fixture context.
2. Run Codex broad subset and fix any boundary regressions.
3. Run a smaller Claude broad-fast subset for cross-harness confidence.
4. Update docs, validator, proof, and close lifecycle.

## Files/Owners

- `scripts/eval-autotrigger.mjs` owns cases, fixtures, subsets, and JSONL output.
- `docs/evals/auto-trigger.md` owns the public eval protocol and result log.
- `scripts/validate-cairn.mjs` owns doc/result/case drift checks.
- `plugins/cairn/skills/cairn/SKILL.md` and `plugins/cairn/hooks/bootstrap.md` own trigger boundaries.

## Proof

- `node scripts/eval-autotrigger.mjs broad cairn-broad-codex-0.136-default --jobs 4 --timeout-ms 180000`
- `node scripts/eval-autotrigger.mjs R8,R9,N7,N9,N10 cairn-broad-fast-claude-2.1.159-default --harness claude --jobs 4 --timeout-ms 150000`
- `node scripts/validate-cairn.mjs`
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`
- `git diff --check`

## Rollback

Revert this change's commits; no persisted runtime or external state is required except local
Codex plugin reinstall, which can be repeated from the current repo.
