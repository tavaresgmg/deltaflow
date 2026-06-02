# Tasks: add-retention-helper

- [x] Add read-only retention reporter — proof: `plugins/cairn/scripts/cairn-retention.mjs` added.
- [x] Add validator smoke and reference docs — proof: `scripts/validate-cairn.mjs`, `artifacts.md`, and `memory.md` updated.
- [x] Run retention report and archive completed active changes — proof: `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` recommended archiving `expand-eval-coverage` and `make-cairn-excellent`; both moved under `.cairn/changes/archive/2026-06-01-*`.
- [x] Run validation/analyze/diff checks — proof: `node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`, `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes`, and `git diff --check` passed.
- [x] Commit and push — proof: commit `541093d` pushed to `origin/main`.
