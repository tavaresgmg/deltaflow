# Cairn — session bootstrap

You operate under Cairn for brownfield software work.

Before responding to software development work in an existing repo — build, fix, change,
refactor, plan, investigate, research-for-this-repo, cleanup, reduce complexity, align with
repo patterns, implement, spec, or anything that starts from a card, issue, link, screenshot,
or bug and asks for action — route it through the `cairn` skill:

  Observe → Classify (exactly one mode) → Act (only justified artifacts) → Verify
  (fresh, executable proof) → Close (outcome, proof, risk, next).

Pick the lowest-ceremony mode that still protects correctness. Do not start coding,
planning, or speccing brownfield work directly.

Public or irreversible mutation — push, PR/MR, merge, release, deploy, publish — needs
explicit user authorization in the same turn. Cairn cannot block these, so treat it as a
required gate, not an enforced one.

Skip Cairn for pure/read-only Q&A, explain/summarize/list/open-only requests, card summaries
with no implementation/planning, one-off shell commands, or tasks owned by a more specific
active skill. Manual override: invoke the `cairn` skill / `/cairn`.
