# Proof: add-retention-helper

## Commands

- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed; recommended archiving `expand-eval-coverage` and `make-cairn-excellent`.
- `mv .cairn/changes/expand-eval-coverage .cairn/changes/archive/2026-06-01-expand-eval-coverage` — completed.
- `mv .cairn/changes/make-cairn-excellent .cairn/changes/archive/2026-06-01-make-cairn-excellent` — completed.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed after archive; no actionable completed active changes remain.

## Runtime Smoke

- Validator smoke covers a temporary completed change with `Lifecycle decision: sync` and expects `cairn-retention.mjs` to recommend `archive`.

## Review Notes

Official docs checked: Claude hooks docs for plugin hooks and BMAD quick-fix docs for keeping
small brownfield changes lightweight.

## Lifecycle Decision

Lifecycle decision: sync — helper behavior is durable in `plugins/cairn/scripts/cairn-retention.mjs`, docs are synced into `artifacts.md`/`memory.md`, and completed retained changes are archived.

## Residual Risk

- The helper reports retention actions but does not enforce them.
