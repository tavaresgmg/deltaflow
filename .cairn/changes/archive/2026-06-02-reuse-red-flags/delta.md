# Delta: reuse-red-flags

## Current Behavior

Cairn says to inspect and reuse repo patterns, but the rule is diffuse. The gaps doc still
lists forced reuse and anti-rationalization as open P1 items.

## Proposed Behavior

- Make "reuse before inventing" explicit in `SKILL.md`.
- Add a compact anti-rationalization red-flags table to the framework lessons.
- Keep these as advisory workflow behavior, not deterministic gates.
- Add validator checks so the core rule and reference do not disappear silently.

## Contracts And Boundaries

- Do not add a CLI, hook, MCP server, or extra skill for this.
- Do not make small direct work carry new artifact ceremony.
- Do not claim these rules are mechanically enforced.

## Semantic Claims

- Cairn requires searching existing symbols, helpers, docs, and patterns before adding new code and carrying reuse/adapt/new decisions into higher-risk modes; code: `plugins/cairn/skills/cairn/SKILL.md`, `plugins/cairn/skills/cairn/references/modes.md`; proof: `node scripts/validate-cairn.mjs`
- Cairn documents anti-rationalization red flags for skipped proof, invented helpers, stale cleanup, and docs assumptions; code: `plugins/cairn/skills/cairn/references/framework-lessons.md`; proof: `node scripts/validate-cairn.mjs`
- Gates documentation classifies reuse and anti-rationalization as advisory behavior, not deterministic enforcement; code: `plugins/cairn/skills/cairn/references/gates.md`; proof: `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/reuse-red-flags`

## Out Of Scope

- Full Claude/Codex eval matrix.
- Stop-hook or UserPromptSubmit heuristics.
- Inferred semantic extraction v2.
