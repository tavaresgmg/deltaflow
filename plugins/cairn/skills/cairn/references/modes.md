# Cairn Modes

## Direct

Use when the request is scoped, local, reversible, and the target files or
commands are obvious after a brief inspection.

Workflow:

1. Inspect target files and tests.
2. Patch root cause.
3. Run focused proof.
4. Report concise result.

Do not create `.cairn/` artifacts.

## Diagnose

Use when there is a concrete wrong behavior.

Workflow:

1. Reproduce or identify the failing signal.
2. Trace root cause from the observed failure.
3. Patch the minimal owner.
4. Re-run the failing proof and a regression check.

Escalate to `delta-spec` only if the fix changes intended behavior.

## Discovery

Use when the user has an idea, card, business goal, domain ambiguity, or
architecture uncertainty.

Workflow:

1. Identify the user/job/outcome and disproof path.
2. Search current external sources when market, library, API, pricing, legal,
   or standards facts can change the decision.
3. Inspect current repo docs and code before proposing integration shape.
4. Produce a concise brief with options, recommendation, accepted downside,
   and proof strategy.

Borrow from BMAD's analysis phase, but stop before PRD ceremony unless the
change is large enough to justify it.

## Delta Spec

Use for medium brownfield changes where reviewers need durable intent.

Workflow:

1. Identify current behavior from code/docs/runtime.
2. Write the proposed behavior delta.
3. Name affected capabilities and contracts.
4. Create a plan with phases and proof.
5. Implement and update the delta when reality differs.
6. Archive or sync final behavior when done.

Borrow from OpenSpec's delta model.

## Tracked Change

Use when work crosses boundaries:

- auth, permissions, billing, money, persistence, production, customer-visible behavior;
- multi-repo coordination;
- migrations;
- release/deploy work;
- significant architecture changes.

Workflow:

1. Create durable change folder.
2. Capture evidence, scope, gates, rollback, and proof strategy.
3. Implement in phases.
4. Verify each boundary.
5. Archive/sync after completion.

This mode can later delegate to OpenSpec or another formal framework if the
repo already uses one.
