# Plan: public-hygiene-drift

## Phases

1. Add narrow validation for tracked macOS artifacts and stale public-doc phrases.
2. Remove local `.DS_Store` files.
3. Update current docs to reflect completed work.
4. Validate, archive the change, commit, and push.

## Files/Owners

- `scripts/validate-cairn.mjs` owns structural/public hygiene checks.
- `docs/comparison-and-gaps.md` and `docs/roadmap.md` own public status text.

## Proof

- `node scripts/validate-cairn.mjs`
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes`
- `git diff --check`

## Rollback

Revert the commit. `.DS_Store` files are ignored local artifacts and do not need rollback.
