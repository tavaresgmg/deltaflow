# Spec: Workflow Router

## Behavior

Cairn routes software development work to the lightest workflow that still protects
correctness. It is not card-only: cards, no-card tasks, bug diagnosis, cleanup, research,
greenfield-in-repo work, SDD/spec deltas, and repo-pattern alignment all use the same mode
ladder.

Modes are proportional:

- `direct` for small, clear, reversible work.
- `diagnose` for concrete failures.
- `discovery` for ambiguity, research, and uncertain greenfield/scaffold work.
- `delta-spec` for medium brownfield behavior changes.
- `tracked-change` for multi-phase, high-risk, cross-boundary, or customer-visible work.

## Semantic Claims

- The skill tells agents Cairn is not card-only and lists no-card, greenfield, research, cleanup, SDD/spec, and repo-pattern alignment triggers; code: `plugins/cairn/skills/cairn/SKILL.md`; proof: `node scripts/validate-cairn.mjs`
- The public scope doc explains the same proportional mode ladder beyond cards; code: `docs/scope-and-workflows.md`; proof: `node scripts/validate-cairn.mjs`
- The analyzer validates explicit semantic claims against code refs and proof commands; code: `plugins/cairn/scripts/cairn-analyze.mjs`; proof: `node scripts/validate-cairn.mjs`

## Last Verified

2026-06-01 by `node scripts/validate-cairn.mjs`.
