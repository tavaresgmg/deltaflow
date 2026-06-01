# Codebase Map: eval harness

## Purpose

Measure whether Cairn fires and routes correctly without being named. The harness is proof
for the autonomy claim; docs and release gates must point to JSONL results, not impressions.

## Entry Points

- `scripts/eval-autotrigger.mjs` runs Codex or Claude Code against temp fixture repos.
- `docs/evals/auto-trigger.md` defines the protocol, cases, and results log.
- `docs/evals/results/*.jsonl` stores per-case rows plus one summary row.
- `scripts/validate-cairn.mjs` checks structural plugin health and selected eval summaries.

## Owners And Boundaries

- Eval fixtures live under `/tmp/cairn-eval-fixture-<label>-<pid>-<case>` and are disposable.
- Result JSONL files under `docs/evals/results/` are durable evidence and can be committed.
- Claude evals load the local plugin with `--plugin-dir plugins/cairn`; they do not rely on a
  manually installed plugin inside the temp fixture.
- Do not change `SKILL.md` trigger text without rerunning at least one must-fire and one
  must-not subset.

## Non-Obvious Rules

- Use realistic cases (`R*`) when routing quality matters; the plain `F*` prompts are useful
  for trigger rate but can understate routing because their fixture is intentionally generic.
- Keep must-not cases in every fast subset; scope expansion is only safe if pure Q&A and
  one-off shell prompts still do not fire.
- The summary row is the validator contract. If docs claim a run, `validate-cairn.mjs` should
  check the matching JSONL summary.
- `diagnose` is not Cairn-unique because other skills may use the same word; use `readCairn`
  and output shape as additional signals.

## Proof Commands

```bash
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-default --jobs 2 --timeout-ms 120000
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000
node scripts/validate-cairn.mjs
```

## Last Verified

2026-06-01 by `node scripts/validate-cairn.mjs` and the fast Codex/Claude JSONL summaries.
