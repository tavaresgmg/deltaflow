# Proof: expand-eval-coverage

## Commands

- `node scripts/eval-autotrigger.mjs broad cairn-broad-codex-0.136-default --jobs 4 --timeout-ms 180000` — passed: Codex v0.136.0, 7/7 must-fire fired, 7/7 routed right, 0/6 must-not misfires, 0 collisions, 0 errors.
- `node scripts/eval-autotrigger.mjs R8,R9,N7,N9,N10 cairn-broad-fast-claude-2.1.159-default --harness claude --jobs 4 --timeout-ms 150000` — passed: Claude Code v2.1.159, 2/2 must-fire fired, 2/2 routed right, 0/3 must-not misfires, 0 collisions, 0 errors.
- `node --check scripts/eval-autotrigger.mjs && node --check scripts/validate-cairn.mjs` — passed.
- `node scripts/validate-cairn.mjs` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed after adding `plan.md`.
- `git diff --check` — passed.

## Runtime Smoke

- Codex broad subset found real boundary regressions first: N7/N8/N9 misfired and R13 timed out.
- After updating `SKILL.md` and `hooks/bootstrap.md`, reinstalling the local Codex plugin, and increasing broad timeout, the broad subset passed cleanly.
- Claude broad-fast subset validated the same read-only/card-summary/conceptual-research boundary on Claude.

## Review Notes

Official docs research is in `research/official-docs.md`.

## Lifecycle Decision

Lifecycle decision: sync — durable eval inventory and results are synced into
`docs/evals/auto-trigger.md`, drift checks into `scripts/validate-cairn.mjs`, and trigger
boundary behavior into `plugins/cairn/skills/cairn/SKILL.md` plus
`plugins/cairn/hooks/bootstrap.md`.

## Residual Risk

- Full cross-model and Claude broad-scope suite remain separate work.
