# Tasks: semantic-extraction-v2

- [x] Add inferred semantic checks to analyzer — proof: `cairn-analyze.mjs` now infers code/proof coverage from `Proposed Behavior`.
- [x] Add validator fixtures/docs for inferred semantic checks — proof: `validate-cairn.mjs` covers implicit-good, missing-proof, missing-code, and missing-ref fixtures; `artifacts.md` updated.
- [x] Reconcile roadmap/gaps and run proof — proof: `docs/roadmap.md`, `docs/comparison-and-gaps.md`, `node scripts/validate-cairn.mjs`, and `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`.
- [x] Archive the completed change — proof: moved to `.cairn/changes/archive/2026-06-02-semantic-extraction-v2`.
