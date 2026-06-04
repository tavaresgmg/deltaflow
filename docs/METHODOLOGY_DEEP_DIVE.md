# Methodology Deep Dive

This document is the analytical foundation for **Cairn Proofflow**. The concise method lives in
`docs/METHODOLOGY.md`; operational change workflow lives in `docs/DEVELOPMENT.md`; dated source
ledger lives in `docs/RESEARCH.md`; runtime behavior lives in `plugins/cairn/skills/cairn/references/`.

This file explains why the method exists, how sources were translated, where Cairn is stronger or
weaker than alternatives, and which mechanisms are worth forcing.

## Core Thesis

AI coding tools reduce the cost of proposing code. They do not reduce, by the same amount, the cost
of understanding a brownfield system, preserving ownership boundaries, proving behavior, reviewing
change, or carrying context across sessions.

That changes the bottleneck. The scarce resource is no longer first-draft code. The scarce resources
are:

- **orientation**: knowing what is true before changing it;
- **ownership**: knowing which file, repo, spec, doc, or person owns the concern;
- **proof**: knowing which evidence would convince a skeptical reviewer;
- **review**: catching the wrong abstraction, missing boundary, or false claim;
- **context reconciliation**: leaving the next session less confused.

Cairn Proofflow is therefore a routing method. It does not ask "which framework should this task use?"
first. It asks:

```text
What is the smallest workflow that still protects the scarce resource at risk?
```

## Methodology Requirements

A methodology for AI-assisted software work is worth naming only if it changes behavior under
pressure. Cairn uses these requirements:

| Requirement | Why it matters | Cairn interpretation |
| --- | --- | --- |
| Pain-derived | Imported frameworks create theater when no local pain exists. | Start from repeated failure, user friction, dogfood incident, proof gap, or external shift. |
| Proportional | One workflow cannot fit typo fixes and multi-repo auth changes. | Route to the lowest safe mode. |
| Brownfield-first | Most real value happens inside existing systems with hidden constraints. | Observe owners and reuse patterns before proposing architecture. |
| Falsifiable | A rule that cannot lose becomes doctrine. | Every rule needs a failure test and a named downside. |
| Mechanism-aware | Prose does not enforce natural-language behavior. | Split mechanisms into guide, check, and force. |
| Token-cheap | Always-on context competes with the task itself. | Keep the skill small; lazy-load references and durable docs. |
| Portable | Codex and Claude Code differ in hooks, memory, and subagents. | One source of truth; degrade honestly by harness. |

## Source Translation

The method borrows pressure, not ceremony. Each source is translated through Cairn constraints:
brownfield-first, proportional, token-cheap, evidence-first, portable, and honest about enforcement.

### Agent And SDD Systems

| Source | Useful pressure | Cairn borrow/adapt | Avoid |
| --- | --- | --- | --- |
| [OpenSpec / OPSX](https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md) | Actions, filesystem changes, verify/sync/archive, parallel change handling. | Delta/spec/archive ideas for medium/high-risk work; `cairn-close` as a lighter consistency and archive check. | Slash-first operation and fixed spec ceremony for small work. |
| [Spec Kit](https://github.github.com/spec-kit/) | Spec -> Plan -> Tasks -> Implement and cross-artifact analysis. | Phase separation and consistency checking when ambiguity is high. | Greenfield-first bias and many manual commands for ordinary brownfield work. |
| [BMAD](https://docs.bmad-method.org/) | Guided workflows, planning depth that adapts to complexity, specialized agents. | Research/discovery discipline and decision logs. | Personas, mandatory PRDs, and role theater. |
| Superpowers / GSD | Bootstrap, verification discipline, file-backed state, subagent review. | Session bootstrap, proof before done, isolated review, durable local state. | Universal hard gates, command explosion, and treating ephemeral TODOs as durable memory. |
| [Codex customization](https://developers.openai.com/codex/concepts/customization#next-step) | Build in layers: AGENTS, hooks/linters, plugins/skills, MCP, subagents. | Use hooks only for observable rules; plugin/skill for reusable workflow; subagents for noisy or specialized work. | Treating subagents as a default swarm or hooks as complete enforcement. |
| [Codex hooks](https://developers.openai.com/codex/hooks) | Lifecycle events can add context or block supported operations. | Use `SessionStart`, `UserPromptSubmit`, `Stop`, and `PreToolUse` where structural signals exist. | Claiming hooks intercept all tool paths or can enforce prose. |
| Claude Code subagents | Fresh isolated context, foreground/background delegation, forked context, focused tool permissions. | Use subagents for research, logs, tests, and adversarial review. | Parallel coding by default; subagents do not share enough context for tightly coupled changes. |
| [LangGraph](https://langchain-ai.github.io/langgraph/concepts/multi_agent/) / [AutoGen](https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/index.html) / [CrewAI Flows](https://docs.crewai.com/concepts/flows) | Explicit graph/state/edge models, human feedback, memory, orchestration. | Useful contrast for future automation when a workflow becomes repeatable and typed. | Building a workflow engine before Cairn has repeated deterministic state transitions. |
| [Aider](https://aider.chat/docs/usage.html) / [SWE-agent](https://swe-agent.com/latest/) | Repo-aware editing, file selection, autonomous issue solving, benchmark discipline. | Respect narrow context selection and benchmark humility. | Treating benchmark success as proof of safe brownfield methodology. |

### Engineering, Product, Ops, And Organization

| Source | Useful pressure | Cairn borrow/adapt | Avoid |
| --- | --- | --- | --- |
| Agile principles | Working software, simplicity, sustainable pace, reflection. | Proof and user outcome beat document volume. | Using "agile" to skip design, tests, or proof. |
| XP / YAGNI | Simple design, feedback, no speculative features. | No new hooks/scripts/skills without observed need. | Using YAGNI to avoid cleanup or malleability. |
| Kanban | Explicit workflow, WIP limits, flow improvement. | Mode ladder, visible active changes, queue for side ideas. | Turning Cairn into a project-management board. |
| Toyota Production System | Jidoka, just-in-time, kaizen. | Stop on real abnormality; update context after surprise. | Manufacturing ritual copied into software docs. |
| [Shape Up](https://basecamp.com/shapeup) | Shape before build, appetite, risk/rabbit-hole hunting, no infinite backlog. | Use appetite/rabbit-hole thinking for discovery and tracked changes. | Six-week cycles or betting tables inside Cairn. |
| [Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/) | Understand before assuming; define problem; test small. | Supports `discovery` when the problem is unclear. | Mandatory discover/define/develop/deliver ceremony for clear code changes. |
| [Jobs To Be Done](https://www.christenseninstitute.org/theory/jobs-to-be-done/) | Users hire products to make progress in circumstances with functional, social, and emotional forces. | For product/DX work, ask what progress the change unlocks before building. | Inventing user motivation without source material. |
| [Lean Startup](https://theleanstartup.com/principles) | Build-measure-learn, validated learning, pivot/persevere. | Dogfood methodology changes as experiments; separate speed from value. | MVP theater for local repo fixes. |
| Domain-Driven Design / [bounded context](https://martinfowler.com/bliki/BoundedContext.html) | Model meaning is bounded; context maps expose relationships. | Repo/workspace/owner boundaries; one owner per concern. | Big upfront domain modeling for small local changes. |
| [Wardley Mapping](https://www.wardleymaps.com/faqs/what-is-wardley-mapping) | Situational awareness, value chains, evolution, build-vs-buy pressure. | Discovery lens for landscape, dependency, and strategy. | Mandatory maps for every decision. |
| [Team Topologies](https://teamtopologies.com/key-concepts) | Fast flow, team cognitive load, enabling/platform/stream roles, interaction modes. | Subagents as enabling/review roles; platform scripts as thin internal platform. | Agent swarms that increase coordination load. |
| [Theory of Constraints](https://www.tocinstitute.org/theory-of-constraints.html) | Optimize the system constraint, not every local step. | Focus on review, proof, orientation, and context as the likely bottlenecks. | Optimizing generation throughput while review/proof is idle or overloaded. |
| [SRE postmortems](https://sre.google/sre-book/postmortem-culture/) | Incidents recur without formal learning and follow-up actions. | `Learn`: surprise updates docs/specs/maps/hooks. | Postmortem ritual without owner changes. |
| [Continuous Delivery](https://dora.dev/capabilities/continuous-delivery/) / [test automation](https://dora.dev/capabilities/test-automation/) | Keep software deployable, prioritize fast feedback, reliable automated tests, and low-risk release. | Proof strategy should match deployability and claim scope. | Calling a local syntax check sufficient for release/runtime claims. |
| [OWASP threat modeling](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) | Ask what is being built, what can go wrong, what to do, and whether the job is good enough. | Use for auth, data, security, MCP, multi-agent, and customer-visible trust boundaries. | Full STRIDE sessions for low-risk internal edits. |
| [DORA/Westrum culture](https://dora.dev/devops-capabilities/cultural/generative-organizational-culture/) | Good information is timely, usable, and answers receiver questions; failure leads to inquiry. | Agent output should surface bad news, proof gaps, and risk early. | Punishing the messenger with verbose defensive narratives. |
| SPACE / DevEx | Productivity needs balanced signals; cognitive load and feedback loops matter. | Evaluate decision quality, proof quality, flow, context compounding, cognitive load, and stability. | One-number productivity claims. |

## Operational Lens Matrix

| Observed pain | Allowed lens | Maximum artifact | Allowed enforcement | Ceremony risk |
| --- | --- | --- | --- | --- |
| Requirements or user progress unclear | JTBD, Double Diamond, Lean Startup, Shape Up | `brief.md` or tracked-change brainstorm | guide/check only; source-backed decision | invented user motivation or endless discovery |
| Scope is growing or side quests appear | Shape Up, Kanban, TOC | `.cairn/queue.md`, appetite note, tasks trim | check via tasks/proof; no hook | board/process creep |
| Wrong repo/module/owner risk | DDD bounded context, Team Topologies, Wardley | delta/tracked plan with owner map | owner-boundary preflight, guard where supported | big upfront mapping |
| Auth/data/security/trust boundary | OWASP threat modeling, SRE, DORA CD | delta/tracked threat notes and proof plan | adversarial review; possible hook only for structural fact | full STRIDE on small edits |
| Failing or surprising workflow | SRE postmortem, TPS kaizen, Westrum/DORA | proof `Context learned`, owner doc/spec/hook candidate | `cairn-close` check today; stronger only after repeat | blameless report with no system change |
| Proof too narrow for claim | Continuous Delivery, test automation, SPACE/DevEx | proof taxonomy note in `proof.md` | close/review check; tests own truth | over-testing tiny local edits |
| Long/noisy research or logs | Team Topologies enabling mode, Claude/Codex subagent docs | subagent summary in review/proof notes | panel protocol; read-only by default | swarm coordination debt |
| Parallel changes or release coordination | OpenSpec/OPSX, Kanban, CD | tracked change, lifecycle decision, archive/delete closeout | `cairn-close` checks | spec/archive ceremony for single-file work |

## Mechanism Backlog

| Candidate | Pain | Level now | Evidence required | Next step |
| --- | --- | --- | --- | --- |
| Proof taxonomy checker | Broad claim supported by narrow command. | guide/check | 3+ dogfood cases where proof scope was misleading. | Add proof-scope fields before close enforcement. |
| Stronger `Learn` enforcement | Repeated surprises not becoming context. | check | `cairn-close` findings or dogfood showing `Context learned` is gamed or omitted. | Current owner+fact format; revisit after use. |
| Lightweight repo map | Brownfield rediscovery costs too much. | guide | Same area rediscovered across sessions or tasks. | Add `.cairn/codebase/<area>.md` first; automate later. |
| Subagent output schema | Deep reviews return essays or conflicts. | guide/check | Repeated panels with unmergeable findings. | Require lens/source/claim/evidence/recommendation/downside in docs. |
| Codex write guard parity | PreToolUse/apply_patch/unified exec incomplete. | force pending | Live proof in installed Codex plugin path. | Keep architecture status pending. |
| Multi-repo sync contract | Parent/child repo proof can drift. | guide/check | Real multi-repo dogfood with missed owner/proof. | Dogfood before template or hook. |
| Agentic/MCP threat model | MCP/agent runtime adds new trust edges. | reject for now | Cairn ships or depends on richer MCP/agent runtime behavior. | Use OWASP lens manually when trust boundary appears. |

## What Makes Cairn Different

Cairn is a **method router with an honesty boundary**.

The differentiator is not that it has artifacts. OpenSpec, Spec Kit, BMAD, Superpowers, and GSD all
have artifacts. The differentiator is the combination:

- route before ceremony;
- brownfield ownership before design;
- source translation before framework import;
- file-backed state without forcing every task into a spec system;
- explicit guide/check/force levels;
- subagents as isolation, not swarm default;
- proof and context reconciliation as closeout requirements;
- token economy as a product constraint.

## Where Others Are Better

| Alternative | Where it is superior | Cairn response |
| --- | --- | --- |
| OpenSpec / OPSX | Rich spec lifecycle, parallel change archive, mature spec sync mental model. | Use its lifecycle pressure when durable behavior changes; stay lighter for ordinary work. |
| Spec Kit | Broad ecosystem, many integrations, extension/preset marketplace, strong spec-first story. | Do not compete as a spec platform; compete as a proportional brownfield router. |
| BMAD | Rich planning/story workflow and explicit role separation for product-heavy work. | Borrow discovery discipline; avoid personas and PRD-heavy default. |
| Superpowers / GSD | Strong bootstrap/verifier culture and aggressive workflow chaining. | Borrow proof and state discipline; keep gates structural and narrower. |
| LangGraph / AutoGen / CrewAI | Better for typed long-running orchestration and explicit agent graph state. | Defer until Cairn has repeated state transitions worth automating. |
| Aider / SWE-agent | Better as coding/issue-solving agents with repo edit loops and benchmarks. | Cairn is not the coding agent; it is the workflow method around coding agents. |

## Lifecycle Under Pressure

The method's seven-step lifecycle is not a phase lock. It is a set of questions that should shrink
or expand with risk.

| Step | Question | Mechanism today | Overprocess check |
| --- | --- | --- | --- |
| Orient | What is true before mutation? | Repo/docs/spec/test inspection and owner-boundary preflight. | If the target is obvious and local, stop observing. |
| Route | What is the lowest safe mode? | `SKILL.md` mode ladder. | If the route cannot name a specific risk, it is too heavy. |
| Shape | What artifact makes review/resume honest? | Scaffold for durable modes, no artifact for tiny work. | If an artifact will not be read at close, do not create it. |
| Build | What smallest owner-level change makes behavior true? | Brownfield reuse and owner boundaries. | If a new abstraction is not needed now, defer. |
| Prove | What evidence convinces a skeptic? | Focused commands, runtime smoke, source proof, adversarial review. | Do not use a narrow check for a broad claim. |
| Reconcile | What must sync/archive/delete? | `cairn-close`, lifecycle decision, archive/delete apply. | No stale work folders pretending to be living truth. |
| Learn | What surprise should not repeat? | `Context learned: none|owner:<path>|deferred:<reason>` plus `cairn-close` check. | If nothing surprised the agent, say `none`; do not invent learning. |

## Subagent Policy

Subagents are valuable because they isolate context and perspective. They are dangerous when they
create coordination debt.

Use subagents for:

- external research lanes;
- adversarial review;
- log/test-output summarization;
- isolated domain inspection;
- alternative design critique.

Avoid subagents for:

- tightly coupled implementation where shared context matters;
- file edits with overlapping ownership;
- decisions the main agent has not framed;
- replacing local proof;
- creating "consensus" from agents that all read the same weak premise.

The default model is **main agent owns the change; subagents lend lenses**.

## Mechanism Promotion Ladder

Every new methodology rule starts as a hypothesis. It moves only when evidence supports a stronger
level:

```text
language -> checklist -> close check -> hook -> CI/release gate
```

Promotion criteria:

- the failure is repeated or high-blast-radius;
- the signal is structural, not prompt-text guesswork;
- the mechanism has a narrow owner;
- false positives are understood;
- the mechanism improves total flow, not just local strictness.

Demotion criteria:

- it slows small safe work without catching real risk;
- it creates duplicate owners;
- it cannot be validated locally;
- it depends on a harness behavior not proven in the target environment;
- it turns user intent into a hidden workflow tax.

## Tradeoffs Accepted

| Tradeoff | Why accepted |
| --- | --- |
| Less complete than full spec platforms | Completeness is not the bottleneck for small brownfield work. |
| Some behavior remains advisory | Forcing unobservable prose would be dishonest. |
| More local state than pure chat | File-backed state survives compaction and supports proof. |
| Less autonomous than agent swarms | Review and ownership are bottlenecks; swarms can amplify drift. |
| Slower start for high-risk work | High-risk work needs orientation before mutation. |
| No productivity claim yet | Current evidence supports proof/flow discipline, not measured speedup claims. |

## Evaluation Strategy

Owned by `docs/METHODOLOGY.md` (Measuring Real Value + Claims And Evidence Bar): judge Cairn by
balanced signals — route correctness, proof quality by boundary, stale-artifact findings, resume
quality, review catches, dogfood-to-owner updates, cognitive load — never smoke-pass rate alone.
Dogfood and runtime proof are the reality checks; user trust is the final acceptance signal.

## Scenario Matrix

Route examples are owned by `docs/METHODOLOGY.md` (Scenarios) and
`plugins/cairn/skills/cairn/references/modes.md`. This file keeps only the cross-cutting lens
matrices above, not per-task route examples.

## Open Methodology Questions

- Should Cairn add a stronger checker for `Learn`, or is proof-note review enough?
- Should multi-repo dogfood produce a living spec for workspace coordination?
- Should source-ledger refresh cadence be explicit, or only task-triggered?
- Should subagent review get focused harness proof before any stronger automation?
- Which real dogfood and harness proof can support public methodology claims without overfitting to prompts?

The answer to each should come from dogfood, harness proof, or repeated user friction, not symmetry with
other frameworks.
