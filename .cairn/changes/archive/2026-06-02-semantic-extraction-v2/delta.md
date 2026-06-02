# Delta: semantic-extraction-v2

## Current Behavior

`cairn-analyze.mjs` validates explicit `## Semantic Claims`, but it does not infer useful
signals from ordinary `Proposed Behavior` prose. A behavior delta can mention files,
commands, and behavioral verbs while still omitting checkable claims.

## Proposed Behavior

- Add deterministic inferred semantic checks over `Proposed Behavior`.
- Detect behavior-like prose without explicit claims.
- Detect implicit `code:` and `proof:` candidates in behavior prose and suggest converting
  them into checkable `Semantic Claims`.
- Keep this read-only and heuristic; do not attempt full natural-language understanding.

## Contracts And Boundaries

- No external LLM or NLP dependency.
- No hard block for broad narrative without file/command evidence.
- Keep findings stable, compact, and severity-bearing.

## Semantic Claims

- Cairn analyzer infers missing semantic-claim coverage from behavior prose with change verbs, file refs, and proof command candidates; code: `plugins/cairn/scripts/cairn-analyze.mjs`; proof: `node scripts/validate-cairn.mjs`
- Artifact docs explain inferred semantic checks as heuristic and read-only, not a replacement for explicit claims; code: `plugins/cairn/skills/cairn/references/artifacts.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Parsing arbitrary code semantics.
- Mapping requirements to tasks like full Spec Kit.
- Auto-fixing delta files.
