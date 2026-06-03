# Evolution Radar

Owner: living source ledger for Cairn product evolution. `docs/research/frameworks.md` remains the
agent-framework comparison; this file keeps the broader state of practice in view.

Update when a Cairn change relies on external methodology, current AI evidence, or a competitor
signal. Keep entries short and dated. Each review should produce `borrow / adapt / avoid / defer`,
not a new ceremony by default.

## Aperture Rule

For methodology changes, choose 2-4 lanes and include at least one non-agent lane. Rotate lanes
across changes unless fresh evidence makes the same lane load-bearing again.

## Source Ledger

| Lane | Source | Last review | Cairn use |
| --- | --- | --- | --- |
| AI delivery evidence | [DORA 2025 State of AI-assisted Software Development](https://dora.dev/research/2025/dora-report/) | 2026-06-03 | Treat AI as an amplifier of system quality; improve context, proof, and workflow before claiming speed. |
| AI productivity evidence | [METR early-2025 experienced OSS developer study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | 2026-06-03 | Keep real brownfield proof and human review central; do not trust benchmark-like evals alone. |
| DevEx measurement | [SPACE framework](https://queue.acm.org/detail.cfm?id=3454124) | 2026-06-03 | Avoid one-metric productivity theater; evaluate satisfaction, performance, activity, collaboration, and flow only when useful. |
| Agile principles | [Agile Manifesto principles](https://agilemanifesto.org/principles) | 2026-06-03 | Keep working software/proof, simplicity, sustainable pace, and regular reflection as constraints. |
| Flow systems | [The Kanban Guide](https://kanbanguides.org/the-kanban-guide/) | 2026-06-03 | Use explicit workflow definitions and flow signals; do not create a heavyweight board inside Cairn. |
| Product shaping | [Shape Up](https://basecamp.com/shapeup) | 2026-06-03 | Borrow appetite, shaping, and no-infinite-backlog pressure; adapt to small tracked changes. |
| Situational awareness | [Wardley Mapping FAQ](https://www.wardleymaps.com/faqs/what-is-wardley-mapping) | 2026-06-03 | Use mapping as a discovery lens for landscape/user/dependency clarity, not as a required artifact. |
| Agent design | [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 2026-06-03 | Prefer simple workflows before agent swarms; add orchestration only when proof shows the simpler loop fails. |
| Agent planning/evals | [OpenAI Cookbook: PLANS.md for multi-hour problem solving](https://developers.openai.com/cookbook/articles/codex_exec_plans) | 2026-06-03 | Use self-contained plans for long work; keep eval/proof tied to actual task outcomes. |
| Framework competitors | [Cairn framework comparison](frameworks.md) | 2026-06-03 | Treat BMAD/OpenSpec/Spec Kit/Superpowers as one lane, not the boundary of research. |

## Translation Template

Use this in the active change or decision log when a source matters:

| Source | Borrow | Adapt | Avoid | Defer |
| --- | --- | --- | --- | --- |
| `<source>` | `<what transfers cleanly>` | `<what needs Cairn constraints>` | `<what would add ceremony or false certainty>` | `<what needs real dogfood/eval first>` |

## Open Watchlist

- Whether 2026 AI productivity studies reverse, narrow, or confirm the 2025 brownfield caution.
- Whether Codex/Claude add deterministic skill-routing or richer hook context that makes current
  Stop/PreToolUse compromises stale.
- Whether context-engineering evidence changes the current "lazy references over one huge skill"
  budget rule.
- Whether real multi-repo Cairn dogfood exposes coordination pressure that docs/evals cannot catch.
