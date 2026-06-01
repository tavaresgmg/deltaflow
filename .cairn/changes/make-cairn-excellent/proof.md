# Proof: make-cairn-excellent

## Commands

- `node --check scripts/eval-autotrigger.mjs && node --check plugins/cairn/scripts/cairn-analyze.mjs && node --check plugins/cairn/scripts/cairn-next.mjs` — passed.
- `node scripts/validate-cairn.mjs` — passed: `cairn validation passed (31 files, manifests + marketplaces + SKILL + hooks checked)`.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/make-cairn-excellent` — passed with only LOW findings while active tasks remain.
- `node plugins/cairn/scripts/cairn-next.mjs .cairn/changes/make-cairn-excellent` — passed and reported the next open task.
- `node scripts/eval-autotrigger.mjs realistic cairn-realistic-codex-0.136-default` — passed: 7/7 must-fire fired, 7/7 routed right, 0 collisions, 0 errors.
- `node scripts/eval-autotrigger.mjs nofire cairn-nofire-after-scope-codex-0.136-default` — passed: 0/6 must-not misfires.
- `claude plugin validate plugins/cairn` — passed.
- `claude plugin marketplace add --scope local ./` — passed: marketplace `cairn` declared in local settings.
- `claude plugin install --scope local cairn@cairn` — passed: plugin installed and enabled locally.
- `claude plugin details cairn@cairn` — passed: 1 skill (`cairn`), 1 agent (`cairn-researcher`), 2 hooks (`SessionStart`, `PreToolUse`).
- `claude --print --verbose --include-hook-events --output-format stream-json 'Responda exatamente: CAIRN_SMOKE_OK'` — passed: SessionStart hook fired and injected bootstrap; plugin, skill, and agent visible in the init event.
- `claude --print --verbose --include-hook-events --output-format stream-json 'Use the Write tool to create .tmp/cairn-claude-hook-smoke.txt ...'` — passed: PreToolUse fired and allowed an in-repo write; temp file removed after smoke.
- `claude --print --verbose --include-hook-events --output-format stream-json 'Use the Write tool to create /tmp/cairn-claude-guard-should-block.txt ...'` — passed: PreToolUse fired and blocked the outside-repo write with exit 2; `/tmp/cairn-claude-guard-should-block.txt` absent after smoke.
- `node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-default --jobs 2 --timeout-ms 120000` — passed: Codex v0.136.0, 1/1 must-fire fired/routed, 0/1 must-not misfires.
- `node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000` — passed: Claude Code v2.1.159, 1/1 must-fire fired/routed, 0/1 must-not misfires.
- `.cairn/codebase/eval-harness.md` + `docs/examples/brownfield-card-eval-harness.md` — added as a worked brownfield example; `validate-cairn.mjs` now requires both files.

## Runtime Smoke

- Codex CLI v0.136.0 realistic eval ran live through `codex exec` against generated fixtures.
- Claude Code v2.1.159 live harness ran local marketplace install, component inventory, SessionStart, PreToolUse allow/block, and fast auto-trigger eval.

## Review Notes

- External research was limited to current official or primary repository docs where possible.

## Residual Risk

- Realistic routing and cross-model results are still pending.
- Full-suite Claude Code and cross-model results are still pending.
- `cairn-analyze.mjs` now checks explicit semantic claims, but not inferred semantic drift.
