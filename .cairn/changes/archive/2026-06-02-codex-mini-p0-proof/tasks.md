# Tasks

- [x] Run Codex `gpt-5.4-mini` P0 matrix - proof: `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 4 --timeout-ms 150000`.
- [x] Run Codex `gpt-5.4-mini` realistic diagnostic - proof: `node scripts/eval-autotrigger.mjs realistic cairn-realistic-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 4 --timeout-ms 180000`.
- [x] Run focused Codex `gpt-5.4-mini` route-contract retest - proof: `node scripts/eval-autotrigger.mjs N10,N12,R9,R14 cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps gpt-5.4-mini --jobs 4 --timeout-ms 180000`.
- [x] Update eval docs and validator - proof: `node scripts/validate-cairn.mjs`.
- [x] Run final validation and archive - proof: `node scripts/validate-cairn.mjs`.
