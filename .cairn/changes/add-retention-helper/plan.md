# Plan: add-retention-helper

## Phases

1. Add read-only retention reporter and validation smoke.
2. Document retention usage in Cairn references.
3. Run the reporter and archive completed retained changes.
4. Validate analyzer/validator/diff and push.

## Files/Owners

- `plugins/cairn/scripts/cairn-retention.mjs` owns retention reporting.
- `scripts/validate-cairn.mjs` owns smoke validation.
- `plugins/cairn/skills/cairn/references/artifacts.md` and `memory.md` own usage guidance.

## Proof

- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes`
- `node scripts/validate-cairn.mjs`
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes`
- `git diff --check`

## Rollback

Revert the commit; archived folders are normal git moves and can be moved back if needed.
