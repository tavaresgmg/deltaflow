# Proof: eval-matrix-next

## Docs Grounding

- OpenAI Codex manual fetched 2026-06-02: skills use progressive disclosure and implicit
  invocation from concise descriptions; `codex exec` is the non-interactive automation path;
  subagents are useful for read-heavy exploration/tests and need caution for write-heavy work.
- Claude Code docs fetched 2026-06-02: subagents preserve main-session context, can use
  faster models such as Haiku, and plugin subagents/skills/hooks have documented boundaries.
- BMAD established-projects docs fetched 2026-06-02: existing projects should clean completed
  planning artifacts, generate project context, and scale method by change size.
- Spec Kit primary GitHub docs fetched 2026-06-02: `/speckit.analyze` is read-only
  cross-artifact consistency/coverage analysis and Spec Kit supports brownfield enhancement.

## Commands

- `node scripts/eval-autotrigger.mjs realistic cairn-realistic-claude-2.1.159-default --harness claude --jobs 4 --timeout-ms 180000` — completed diagnostic run: 14/14 fired, 12/14 routed, 3 timeouts/errors.
- `node scripts/eval-autotrigger.mjs realistic-nofire cairn-realistic-nofire-claude-2.1.159-default --harness claude --jobs 3 --timeout-ms 150000` — passed: 0/6 misfires, 0 errors.
- `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-default --jobs 4 --timeout-ms 150000` — passed: 3/3 fired/routed, 0/3 misfires, 0 errors.
- `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-claude-2.1.159-default --harness claude --jobs 4 --timeout-ms 150000` — diagnostic: 3/3 fired, 2/3 routed, 0/3 misfires, 0 errors.
- `node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-haiku haiku --harness claude --jobs 2 --timeout-ms 120000` — passed: 1/1 fired/routed, 0/1 misfire, 0 errors.
- `node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 2 --timeout-ms 120000` — diagnostic: 1/1 fired, 0/1 routed, 0/1 misfire, 0 errors.
- `node --check scripts/eval-autotrigger.mjs && node --check scripts/validate-cairn.mjs && node scripts/validate-cairn.mjs` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/eval-matrix-next` — passed with only low mixed-task-state while archive/commit remained open.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed with only low mixed-task-state while archive/commit remained open.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — correctly kept the change active before lifecycle/archive.
- `git diff --check` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/archive/2026-06-02-eval-matrix-next` — passed after archive: 4/4 tasks done, no findings.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed after archive: no active changes or findings.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed after archive: no actionable active changes.

## Lifecycle Decision

Lifecycle decision: sync — durable eval behavior lives in `scripts/eval-autotrigger.mjs`,
validated result contracts live in `scripts/validate-cairn.mjs`, current evidence lives in
`docs/evals/results/*.jsonl`, and public status lives in `docs/evals/auto-trigger.md`,
`docs/roadmap.md`, and `docs/comparison-and-gaps.md`.
Archived at `.cairn/changes/archive/2026-06-02-eval-matrix-next`.
