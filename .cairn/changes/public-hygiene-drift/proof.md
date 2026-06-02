# Proof: public-hygiene-drift

## Commands

- `find . -name .DS_Store -delete` — removed local ignored macOS artifacts.
- `find . -name .DS_Store -print` — passed with no output.
- `node --check scripts/validate-cairn.mjs && node scripts/validate-cairn.mjs` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed after proof update.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed.
- `git diff --check` — passed.

## Runtime Smoke

Not applicable; docs/validation-only change.

## Review Notes

Official docs context: OpenSpec archive keeps completed change folders under dated archive
paths; BMAD quick-fix supports small direct hygiene changes without full method ceremony.

## Lifecycle Decision

Lifecycle decision: sync — durable hygiene checks live in `scripts/validate-cairn.mjs`; public
status corrections live in `docs/comparison-and-gaps.md` and `docs/roadmap.md`.

## Residual Risk

- Validation intentionally checks only observed stale phrases, not arbitrary doc truth.
