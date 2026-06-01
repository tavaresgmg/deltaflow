# Delta: expand-eval-coverage

## Current Behavior

The realistic eval subset covers seven must-fire cases and the nofire subset covers six
generic must-not cases. It proves basic card, bug, refactor, planning, failing-test, and
greenfield routing, but it does not yet stress the broader product scope documented in
`docs/scope-and-workflows.md`.

## Proposed Behavior

Add representative eval cases for:

- no-card local implementation;
- research grounded in this repo;
- cleanup and complexity reduction;
- repo-pattern alignment;
- read-only code explanation as a must-not near-miss;
- general research unrelated to repo work as a must-not near-miss;
- broad product brainstorming without a repo target as a must-not near-miss.

## Contracts And Boundaries

- Do not change `SKILL.md` trigger text in this cut.
- Keep `scripts/eval-autotrigger.mjs` as the runner; no new CLI or framework.
- Every recorded docs result must have a matching JSONL summary checked by
  `scripts/validate-cairn.mjs`.

## Semantic Claims

- The eval runner contains broader realistic R-cases and N-cases for the documented non-card workflow scope; code: `scripts/eval-autotrigger.mjs`; proof: `node scripts/validate-cairn.mjs`
- The eval docs log the expanded broad-scope subset result; code: `docs/evals/auto-trigger.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Full matrix on two models per harness.
- Trigger-text retuning.
- Claude full realistic suite.
