# Proof: routing-output-diagnostics

## Docs Grounding

- OpenAI Codex manual fetched 2026-06-02: skills should use explicit instructions and
  `codex exec` is the non-interactive automation path with machine-readable output support.
- Claude Code docs fetched 2026-06-02: subagents and hooks support structured workflow
  automation; Claude docs also emphasize model-specific behavior and fast model routing.

## Commands

- `codex plugin remove cairn@cairn || true` — removed stale local install.
- `codex plugin add cairn@cairn` — installed updated local plugin so Codex evals see the new `SKILL.md`.
- `node --check scripts/eval-autotrigger.mjs && node --check scripts/validate-cairn.mjs && node scripts/validate-cairn.mjs` — passed.
- `node scripts/eval-autotrigger.mjs R5,N2 cairn-route-contract-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 2 --timeout-ms 120000` — passed: R5 `mode=diagnose`, N2 no misfire, 0 diagnostics.
- `node scripts/eval-autotrigger.mjs R11,N7 cairn-route-contract-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 180000` — passed: R11 `mode=delta-spec`, N7 no misfire, 0 diagnostics.
- `node scripts/eval-autotrigger.mjs R14,N8 cairn-route-contract-claude-r14-2.1.159-default --harness claude --jobs 2 --timeout-ms 180000` — passed: R14 `mode=direct`, N8 no misfire, 0 diagnostics.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/routing-output-diagnostics` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed with only low mixed-task-state while archive remained open.
- `git diff --check` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/archive/2026-06-02-routing-output-diagnostics` — passed after archive: 4/4 tasks done, no findings.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed after archive: no active changes or findings.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed after archive: no actionable active changes.

## Lifecycle Decision

Lifecycle decision: sync — durable output contract lives in `SKILL.md`; eval diagnostics live
in `scripts/eval-autotrigger.mjs`; validated route-contract evidence lives in
`docs/evals/results/*.jsonl`; public status lives in `docs/evals/auto-trigger.md`,
`docs/roadmap.md`, and `docs/comparison-and-gaps.md`.
Archived at `.cairn/changes/archive/2026-06-02-routing-output-diagnostics`.
