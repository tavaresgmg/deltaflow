# Delta: make-cairn-excellent

## Current Behavior

Cairn has strong MVP routing, artifact policy, boundary guard, auto-trigger evals, and a minimal `cairn-analyze.mjs`. It does not yet provide durable codebase maps, living specs/archive lifecycle, or a deterministic next-step reporter.

## Proposed Behavior

### ADDED

- `.cairn/codebase/<area>.md` becomes the optional durable map for non-obvious brownfield knowledge.
- `.cairn/specs/<capability>.md` becomes optional living truth when a change lands and the behavior should remain documented.
- `.cairn/changes/archive/<date>-<slug>/` becomes the retained location for completed change folders that should keep rationale/proof.
- `cairn-next.mjs` reports the next missing action for a change folder.
- `cairn-analyze.mjs` reports structured findings with severity instead of plain strings.

### MODIFIED

- Artifact and memory references explain codebase maps and lifecycle retention.
- Roadmap/gaps reflect current Codex eval evidence and the new P0 implementation path.
- Validation includes new scripts and key reference checks.

## Contracts And Boundaries

- No new CLI package yet.
- Scripts stay read-only unless explicitly named otherwise.
- Small direct work must still avoid `.cairn/` ceremony.
- OpenSpec projects should delegate to OpenSpec instead of duplicating its full lifecycle.

## Semantic Claims

- The eval harness supports Codex and Claude Code runs with per-case timing and harness metadata; code: `scripts/eval-autotrigger.mjs`; proof: `node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000`
- The validator checks committed eval summaries and required worked-example artifacts; code: `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`
- The eval harness map and worked example define the durable owner/proof path for fast cross-harness eval work; code: `.cairn/codebase/eval-harness.md`; proof: `node scripts/validate-cairn.mjs`

## Out Of Scope

- Publishing a public release.
- Running Claude Code live evals if the harness is unavailable.
- Creating a large multi-agent orchestration engine.
