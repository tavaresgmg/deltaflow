# Cairn Modes

Route: mode/owner/evidence/artifact/proof/residue. Existing state; no card file.

## Context readiness

`context.readiness` (boundary detector: `thin|partial|strong`) grades repo docs (`AGENTS.md`,
tests, `.cairn` maps/specs). Calibrate autonomy — thin context + full autonomy ships subtle
bugs (METR 2025):

- **thin** — no `direct` for non-trivial work; inspect first, declare the gap before mutating,
  write the missing map at close (Principle 9).
- **partial/strong** — proceed; on `partial`, ground claims on code.

## Direct

Use when the request is scoped, local, reversible, and the target files or
commands are obvious after a brief inspection.

Do not use for broad greenfield/scaffold work, new modules with unclear boundaries, or
requests that explicitly say to plan before coding. Use `discovery` or `delta-spec`.

Workflow:

1. Inspect target files and tests.
2. Reuse existing code and maps before inventing a new path.
3. Patch root cause.
4. Run focused proof.
5. Report concise result.

Do not create `.cairn/` artifacts.

## Diagnose

Use when there is a concrete wrong behavior.

Workflow:

1. Reproduce or identify the failing signal.
2. Trace root cause from the observed failure.
3. Reuse existing code and maps before inventing a new path.
4. Patch the minimal owner.
5. Re-run the failing proof and a regression check.

Grade each finding: **Confirmed** (seen in code/log/runtime), **Deduced** (inferred from a
pattern), **Hypothesized** (unverified). Fix the confirmed root cause; never present a
hypothesis as fact (Principle 3).

Escalate to `delta-spec` only if the fix changes intended behavior.

## Discovery

Use when the user has an idea, card, business goal, domain ambiguity, or
architecture uncertainty.

Also use for greenfield-in-repo work when the boundary, scaffold, or success criteria are
not already obvious.

Workflow:

1. Identify the user/job/outcome and disproof path.
2. Search current external sources when market, library, API, pricing, legal,
   or standards facts can change the decision.
3. Inspect current repo docs and code before proposing integration shape.
4. Name the likely reuse/adapt/new decision and the reason.
5. Create or update `.cairn/codebase/<area>.md` only when repeated observation would be costly.
6. Produce a concise brief with options, recommendation, accepted downside,
   and proof strategy. Stop before PRD ceremony unless the change justifies it.

## Delta Spec

Use for medium brownfield changes where reviewers need durable intent.

Workflow:

1. Identify current behavior from code/docs/runtime and repo constraints (`AGENTS.md`, lockfile).
2. Write the proposed behavior delta.
3. Name affected capabilities and contracts.
4. Name the existing owner or pattern to reuse/adapt, or explain why a new one is needed.
5. Create a plan with phases and proof.
6. Implement and update the delta when reality differs.
7. Archive or sync final behavior when done.

Scaffold via `cairn-scaffold.mjs` before mutating; tick `tasks.md` live; no folder first = not
delta-spec.

## Tracked Change

Use when work crosses boundaries:

- auth, permissions, billing, money, persistence, production, customer-visible behavior;
- multi-repo coordination;
- migrations;
- release/deploy work;
- significant architecture changes.

Workflow:

1. Ground on repo constraints (`AGENTS.md`, lockfile, conventions, specs).
2. Scaffold via `cairn-scaffold.mjs` before mutation; tick `tasks.md` live. No folder first = not
   tracked-change.
3. Capture evidence, scope, gates, rollback, proof, and reuse/adapt/new decisions.
4. Infra lens: for deploy/runtime, name env, health/log signal, rollback, and local/no-deploy
   proof before commands.
5. Implement in phases.
6. Verify each boundary.
7. Adversarial review: isolated subagent, writer ≠ reviewer. See `review.md`.
8. Archive/sync after completion.
