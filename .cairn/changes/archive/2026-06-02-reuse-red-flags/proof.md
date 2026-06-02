# Proof: reuse-red-flags

## Commands

- `node --check scripts/validate-cairn.mjs && node scripts/validate-cairn.mjs` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/reuse-red-flags` — first run correctly flagged missing `plan.md` and placeholder proof; fixed in this change folder.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/reuse-red-flags` — passed after adding `plan.md` and proof content; only low mixed-task-state note remained while archive/commit was still open.
- `git diff --check` — passed.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — before archive, correctly kept the change active until the archive task was closed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/archive/2026-06-02-reuse-red-flags` — passed after archive: 4/4 tasks done, no findings.
- `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` — passed: no active changes or findings.
- `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` — passed after archive: no actionable active changes.

## Docs Grounding

- OpenAI Codex manual fetched 2026-06-02: skills use progressive disclosure and concise,
  front-loaded descriptions; subagents are best for read-heavy exploration, tests, triage,
  and summarization, with caution for parallel write-heavy work.
- Claude Code official docs fetched 2026-06-02: subagents are useful for isolated context
  and plugin hooks/skills are supported, but plugin subagent permissions and hooks have
  documented boundaries.

## Lifecycle Decision

Lifecycle decision: sync — durable behavior lives in `SKILL.md`, `references/modes.md`,
`references/framework-lessons.md`, and `references/gates.md`; gap status lives in
`docs/comparison-and-gaps.md`; drift protection lives in `scripts/validate-cairn.mjs`.
Archived at `.cairn/changes/archive/2026-06-02-reuse-red-flags`.
