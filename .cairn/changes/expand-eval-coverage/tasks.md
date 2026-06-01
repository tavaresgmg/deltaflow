# Tasks: expand-eval-coverage

- [x] Add broader R/N eval cases and fixture files — proof: added R8-R14 and N7-N12 in `scripts/eval-autotrigger.mjs`.
- [x] Run a fast broad-scope subset on Codex — proof: `node scripts/eval-autotrigger.mjs broad cairn-broad-codex-0.136-default --jobs 4 --timeout-ms 180000` returned 7/7 fired, 7/7 routed, 0/6 misfires.
- [x] Update docs and validator for the new result — proof: `docs/evals/auto-trigger.md` logs Codex broad + Claude broad-fast; `validate-cairn.mjs` checks summaries and case IDs.
- [x] Run validation/analyze/diff checks — proof: `node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`, and `git diff --check` passed after adding `plan.md`.
- [x] Commit and push — proof: commit `b458962` pushed to `origin/main`.
