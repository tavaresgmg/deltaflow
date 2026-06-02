# Tasks: public-hygiene-drift

- [x] Add public hygiene/drift validation — proof: `scripts/validate-cairn.mjs` checks tracked `.DS_Store` and observed stale public-doc phrases.
- [x] Remove local `.DS_Store` files and update public docs — proof: `find . -name .DS_Store -delete`; comparison/roadmap updated.
- [x] Run validation/analyze/diff checks — proof: `node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`, `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes`, `git diff --check`, and `find . -name .DS_Store -print` passed after proof update.
- [ ] Archive the completed change.
- [ ] Commit and push.
