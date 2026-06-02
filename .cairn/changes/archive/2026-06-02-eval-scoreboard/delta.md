# Delta

## Proposed Behavior

Cairn should not require manually reading many JSONL files to know eval status. A read-only
scoreboard must summarize eval coverage, failures, slow cases, missing coverage, and the next
cheap command to run: code: `scripts/eval-scoreboard.mjs`; proof:
`node scripts/eval-scoreboard.mjs --json`.

Docs and validation must treat the scoreboard as the operational eval surface so future
roadmap decisions use deterministic summaries instead of ad hoc interpretation: code:
`.cairn/codebase/eval-harness.md`, `docs/evals/auto-trigger.md`,
`scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.

## Semantic Claims

- The scoreboard reads `docs/evals/results/*.jsonl` summaries and emits rows, failures, missing coverage, slow cases, and `nextCommand`; code: `scripts/eval-scoreboard.mjs`; proof: `node scripts/eval-scoreboard.mjs --json`.
- The main validator fails if the scoreboard cannot produce a `nextCommand` and missing coverage list; code: `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
