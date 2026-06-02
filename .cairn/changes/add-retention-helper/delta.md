# Delta: add-retention-helper

## Current Behavior

Completed change folders remain active after lifecycle close. `cairn-analyze --all` can say
they are clean, but there is no deterministic read-only report that says which completed
changes should be archived or deleted.

## Proposed Behavior

Add `cairn-retention.mjs`, a read-only JSON reporter over `.cairn/changes`, and archive the
already completed retained changes under `.cairn/changes/archive/<date>-<slug>/`.

## Contracts And Boundaries

- The helper is read-only; it never moves or deletes files.
- Archive/delete remains a deliberate versioned file operation after reviewing the report.
- Keep active changes only while work remains open.

## Semantic Claims

- Completed active changes with a lifecycle decision are reported as archive candidates; code: `plugins/cairn/scripts/cairn-retention.mjs`; proof: `node scripts/validate-cairn.mjs`
- Artifact and memory references document the read-only retention helper; code: `plugins/cairn/skills/cairn/references/artifacts.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Auto-moving files from hooks.
- Deleting retained history.
