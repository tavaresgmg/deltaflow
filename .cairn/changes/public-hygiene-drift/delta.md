# Delta: public-hygiene-drift

## Current Behavior

The repo has local `.DS_Store` files in several folders and a few docs lines still describe
semantic sync / worked examples as pending even though later changes completed them.

## Proposed Behavior

- Remove local `.DS_Store` files from the workspace.
- Add validation that no `.DS_Store` is tracked.
- Add validation for a small set of stale public-doc phrases that previously drifted.
- Update roadmap and comparison docs to match current evidence.

## Contracts And Boundaries

- Do not add broader prose-policy checks that make normal writing painful.
- Keep validation scoped to concrete regressions already observed.

## Semantic Claims

- Public hygiene validation rejects tracked `.DS_Store` files and stale core-doc phrases; code: `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`
- Comparison and roadmap docs no longer state completed semantic sync or worked examples as pending; code: `docs/comparison-and-gaps.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Full markdown linting.
- Rewriting historical archived change notes.
