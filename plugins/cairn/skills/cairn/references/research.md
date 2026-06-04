# First-class stages: brainstorm, web research, official docs

The three stages most frameworks treat as afterthoughts are elevated here (Decision 6). They
are lightweight by default and gated by intent — a small card must stay cheap.

## Default-light intent gate

This is the sharp point: decide *whether a card merits each stage* before running it. None of
these fire on small, clear, reversible work.

| Signal in the request | Brainstorm | Web research | Docs grounding |
| --- | --- | --- | --- |
| small/clear/reversible edit, known stack | no | no | no |
| design choice with >1 viable path | yes (short) | maybe | no |
| new/unfamiliar lib, tool, or external API | maybe | yes | yes |
| framework version behavior matters | no | maybe | yes |
| trivial/well-known lib | no | no | no |

When in doubt, prefer the lighter option and escalate only if evidence demands it.

## Brainstorm (hard-gate when stakes warrant)

Design before code. One question at a time. Offer 2-3 approaches, each with a named tradeoff,
then a recommendation. Save `.cairn/changes/<slug>/brainstorm.md` (template in `artifacts.md`).
Scales with stakes — can be three lines on a small change. Use an isolated read-only step when the
harness supports it and the topic would pollute the main context.

## Web research (Phase 0, isolated)

Fires on a technical unknown, a framework/library version question, an external API, or a
build-or-buy choice — never for a trivial lib. Run it in isolation when the harness supports
subagents so only a distilled summary returns. Persist that summary to
`.cairn/changes/<slug>/research/<topic>.md` — local; sync durable findings into `specs/` at close.

Evidence ladder (canonical in Principle 3): live system > repo/code > official docs > primary
web > secondary web.

## Official-docs grounding (always-on rule)

Before coding against a new library or tool, ground on its **official docs at the lockfile
version**, not the newest release. Inspect the repo's lockfile/package manifest directly before
searching docs; if no locked version exists, say so and use current official docs as a bounded
fallback.

Context7 (or similar hosted doc lookup) is an opportunistic shortcut only — never the sole
source, and always reconciled against the locked version.

## Subagent boundary

Subagents are for **isolated research and adversarial review only** — never to parallelize
coding. Parallel code edits across one repo cause conflicts and lost context; keep
implementation single-threaded.
