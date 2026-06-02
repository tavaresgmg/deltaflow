# Plan: make-cairn-excellent

## Phases

1. Ground direction in current docs and repo evidence.
2. Add lifecycle/codebase-map guidance.
3. Add deterministic scripts for analyze/next-step.
4. Reconcile roadmap/gaps/install/release docs.
5. Validate locally and record residual risks.

## Files/Owners

- `.cairn/changes/make-cairn-excellent/*`: active tracked-change state.
- `plugins/cairn/skills/cairn/references/*`: workflow behavior source.
- `plugins/cairn/scripts/*.mjs`: deterministic helper scripts.
- `scripts/validate-cairn.mjs`: structural validation.
- `docs/*`: product rationale, roadmap, release proof.

## Proof

- Structural validation.
- Script smoke tests on this change folder and fixtures.
- Git diff review for public-doc hygiene.

## Rollback

Use git to revert tracked file changes. New `.cairn/` state is versioned and can be deleted if the direction is rejected.
