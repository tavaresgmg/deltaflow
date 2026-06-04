# Review

Code generation is cheap; a wrong change that passes tests is expensive. Current AI delivery
evidence lives in `docs/RESEARCH.md` (repo-only); review, proof, and context are treated as load-bearing
bottlenecks. Review is proportional like everything in Cairn: scales with risk, never skipped, and
asks "what is wrong here?" not "does it look fine?".

## What review catches that proof does not

Proof answers *does it work*. Review answers *is it the right change, well-made, and safe*:
intent match, boundary/contract correctness, edge cases, security and input handling, and
collateral damage outside the touched owner.

## Ladder (by mode)

- **direct / diagnose** — self-review the diff before proof: matches intent, stays in the
  owner boundary, handles the obvious edge, leaks no secret or unvalidated input. In-head, cheap.
- **delta-spec** — review the diff against `delta.md` and the named contracts; spawn an
  isolated reviewer subagent when the change touches a trust, data, or auth edge.
- **tracked-change** — mandatory isolated adversarial review: a separate subagent checks the
  diff against `delta.md` and every boundary (writer ≠ reviewer). Review only — never
  parallelize the coding. Record findings under `Review Notes` (`artifacts.md`).

## Honesty in review

A reviewer that rubber-stamps is worse than none. Default skeptical: hunt the bug, the missing
case, the broken contract. If a real look finds nothing, say so plainly. Never present an
unreviewed change as reviewed.

## Subagent panel

Use a panel only for deep methodology/design or high-risk cross-boundary work. Split agents by
distinct lenses, keep them read-only unless write scopes are disjoint, and reconcile conflicts in the
main thread. Required output: lens, source, claim attacked, evidence, recommendation, accepted
downside. Record the decision and accepted downside; do not paste transcripts into durable docs.
