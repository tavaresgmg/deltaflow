# Proof

## Eval Results

- `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 4 --timeout-ms 150000` - passed: 3/3 must-fire routed, 0/3 must-not misfires, 0 errors.
- `node scripts/eval-autotrigger.mjs realistic cairn-realistic-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 4 --timeout-ms 180000` - diagnostic: 13/14 must-fire fired, 12/14 routed, 0 errors/timeouts; R9/R14 diagnostic gaps.
- `node scripts/eval-autotrigger.mjs N10,N12,R9,R14 cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps gpt-5.4-mini --jobs 4 --timeout-ms 180000` - passed: 2/2 must-fire routed, 0/2 must-not misfires, 0 errors.

## Validation

- `node --check scripts/eval-scoreboard.mjs` - passed.
- `node scripts/eval-scoreboard.mjs` - passed; active failure remains only Claude realistic default, and Codex full realistic rerun remains pending.
- `node scripts/validate-cairn.mjs` - passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/codex-mini-p0-proof` - passed after tasks completed.

## Lifecycle Decision

Lifecycle decision: archive - results are recorded, docs and validator are synced, and the remaining Codex realistic full rerun is represented as future eval debt rather than active work in this change.
