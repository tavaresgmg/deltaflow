# Tasks: reuse-red-flags

- [x] Add reuse-before-inventing and anti-rationalization guidance — proof: `SKILL.md`, `modes.md`, `framework-lessons.md`, and `gates.md` updated.
- [x] Add validation for the new workflow guardrails — proof: `scripts/validate-cairn.mjs` checks the core reuse rule and red-flags reference.
- [x] Reconcile gap docs and run proof — proof: `docs/comparison-and-gaps.md` updated; `node --check scripts/validate-cairn.mjs && node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/reuse-red-flags`, and `git diff --check` passed.
- [x] Archive the completed change — proof: moved to `.cairn/changes/archive/2026-06-02-reuse-red-flags`.
