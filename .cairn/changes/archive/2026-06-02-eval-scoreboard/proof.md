# Proof

## Commands

- `node --check scripts/eval-scoreboard.mjs` - passed.
- `node scripts/eval-scoreboard.mjs` - passed; emitted historical failures, active failure,
  missing coverage, slow cases, and next command.
- `node scripts/eval-scoreboard.mjs --json` - passed; emitted rows, activeFailures,
  missingCoverage, slowCases, nextCommand, and p0Ids.
- `node scripts/validate-cairn.mjs` - passed.

## Key Result

Next cheapest useful eval:

```bash
node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 4 --timeout-ms 150000
```

Active eval debt remains visible: `cairn-realistic-claude-2.1.159-default` has R3/R6/R7
timeouts and an uncleared R3 route miss. This change only adds the scoreboard and validation
surface; it does not claim the broader eval matrix is complete.

## Lifecycle Decision

Lifecycle decision: archive - scoreboard behavior is implemented, documented, validated, and
the change folder has no remaining active task.
