# Delta

## Proposed Behavior

Cairn should treat the Codex `gpt-5.4-mini` P0 matrix run, realistic diagnostic run, and
focused route-contract retest as durable evidence, not only as untracked JSONL files. The
eval results must be logged in docs and checked by `scripts/validate-cairn.mjs`.

## Semantic Claims

- The Codex `gpt-5.4-mini` P0 matrix result is committed and validated with 3/3 must-fire routed, 0/3 must-not misfires, and no errors; code: `docs/evals/results/cairn-p0-matrix-codex-0.136-gpt-5.4-mini.jsonl`, `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
- The Codex `gpt-5.4-mini` realistic diagnostic result and focused route-contract retest are committed and validated; code: `docs/evals/results/cairn-realistic-codex-0.136-gpt-5.4-mini.jsonl`, `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps.jsonl`, `scripts/eval-scoreboard.mjs`, `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
- The eval docs and roadmap record the second-model Codex P0 pass and realistic diagnostic state without claiming full realistic coverage is complete; code: `docs/evals/auto-trigger.md`, `docs/roadmap.md`; proof: `node scripts/validate-cairn.mjs`.
