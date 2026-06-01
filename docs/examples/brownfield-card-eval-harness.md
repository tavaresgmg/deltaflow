# Worked Example: Brownfield Eval Harness Card

## Input

Card: "Cairn says it supports Claude Code and faster evals, but the eval harness is Codex-only
and slow. Add a cheap cross-harness smoke that proves one must-fire and one must-not case on
both Codex and Claude."

## Observe

Read first:

- `.cairn/codebase/eval-harness.md` for the eval owner map.
- `scripts/eval-autotrigger.mjs` for runner shape and detection signals.
- `docs/evals/auto-trigger.md` for protocol and result log.
- `scripts/validate-cairn.mjs` for release-time checks.

The map removes repeated rediscovery: it names temp fixture ownership, result-file ownership,
the reason for `R*` realistic cases, and why must-not cases must stay in fast subsets.

## Classify

Mode: `delta-spec`

Why: medium brownfield behavior change touching a script, validation, docs, and committed
evidence. It is not a simple direct edit because the claim crosses two harnesses.

## Act

Changes made in this example:

- Add `--harness codex|claude`, `--jobs`, `durationMs`, and `harnessVersion` to
  `scripts/eval-autotrigger.mjs`.
- Keep fixtures isolated per process/label/case so parallel cases cannot share state.
- Record fast Codex and Claude JSONL summaries under `docs/evals/results/`.
- Make `validate-cairn.mjs` fail if docs claim key eval proof but the JSONL summary is missing
  or mismatched.
- Update roadmap/install/eval docs to distinguish fast cross-harness proof from the still-open
  full matrix.

## Verify

```bash
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-default --jobs 2 --timeout-ms 120000
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000
node --check scripts/eval-autotrigger.mjs && node --check scripts/validate-cairn.mjs
node scripts/validate-cairn.mjs
node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/make-cairn-excellent
git diff --check
```

Expected proof:

- Codex fast subset: 1/1 must-fire fired and routed, 0/1 must-not misfires.
- Claude fast subset: 1/1 must-fire fired and routed, 0/1 must-not misfires.
- `validate-cairn.mjs` passes and checks the JSONL summaries.

## Cleanup

Keep the codebase map because it captures non-obvious ownership and proof boundaries. Keep
the JSONL results as durable evidence. Do not keep raw Claude/Codex transcript logs unless a
failure needs investigation.
