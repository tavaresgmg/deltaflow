# Delta: eval-matrix-next

## Current Behavior

Cairn has strong Codex default eval evidence and fast cross-harness proof, but the roadmap
still lacks broader Claude realistic/no-fire coverage and a second-model signal per harness.

## Proposed Behavior

- Record an incremental eval matrix run without changing Cairn's trigger description.
- Add durable JSONL proof for Claude realistic/no-fire default coverage.
- Add fast second-model proof for Codex and Claude if the local harness accepts the model.
- Update docs/validation only for runs that completed with summary rows.

## Contracts And Boundaries

- Do not tune `SKILL.md` in this change; that would invalidate prior trigger comparisons.
- Do not claim the full matrix is complete unless all promised harness/model suites pass.
- Keep failed/unsupported model attempts in proof, not as success claims.

## Semantic Claims

- New eval matrix result files have complete JSONL summary rows and are validated before docs claim them; code: `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`
- The roadmap distinguishes newly proven incremental matrix coverage from still-pending full multi-model suites; code: `docs/roadmap.md`, `docs/evals/auto-trigger.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Changing routing prompts or skill activation text.
- Full semantic extraction v2.
- Codex live PreToolUse proof.
