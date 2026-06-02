# Tasks

- [x] Inspect current parser and failure mode — proof: `node scripts/eval-autotrigger.mjs --help` previously treated `--help` as a subset and failed after subset selection.
- [x] Add strict parser and explicit `--out` support — proof: `scripts/eval-autotrigger.mjs`.
- [x] Update eval docs/codebase map — proof: `docs/evals/auto-trigger.md`, `.cairn/codebase/eval-harness.md`.
- [x] Sync hook root-var docs with current official plugin docs — proof: `plugins/cairn/hooks/README.md`, `docs/research/context-and-portability.md`.
- [x] Run final validation and archive — proof: `node --check scripts/eval-autotrigger.mjs`, parser negative smokes, `node scripts/eval-autotrigger.mjs N2 --out docs/evals/results/cairn-parser-smoke-codex-0.136-default.jsonl --jobs 1 --timeout-ms 120000`, `node scripts/validate-cairn.mjs`.
