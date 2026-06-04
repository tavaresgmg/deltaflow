# Methodology

The Cairn methodology is **Cairn Proofflow**: Evidence-Routed Development for AI-assisted
software work.

Short definition: route every software task to the lightest workflow that can still protect
correctness, then close it with proof and context reconciliation.

Cairn the product implements the method for AI coding agents. The method itself is broader: it is
the operating model behind the plugin, the mode ladder, the artifact policy, and the enforcement
boundary.

The deeper rationale, source translation, and comparative analysis live in
`docs/METHODOLOGY_DEEP_DIVE.md`.

## Name

**Cairn Proofflow** is the public method name.

- **Cairn**: a deliberate pile of stones that marks a path through ambiguous terrain. The method
  should leave just enough durable markers for the next traveler, not build a wall around every
  task.
- **Proof**: no claim of completion without a fresh check, source, or runtime signal.
- **Flow**: work should move in small, reviewable batches through explicit states, not accumulate in
  hidden plans, stale specs, or oversized agent diffs.

**Evidence-Routed Development** is the working category: route by evidence, risk, and ownership
instead of ritual, prompt confidence, or framework habit.

## Thesis

AI coding tools make first drafts cheap. They do not make integration, review, runtime truth,
security, ownership, or product intent cheap. If a workflow optimizes only for generation speed, it
creates larger batches, weaker review, stale specs, context rot, and false confidence.

Evidence-Routed Development structures the whole change lifecycle:

```text
orient -> route -> shape -> build -> prove -> reconcile -> learn
```

That full lifecycle is what the method names.

The runtime shorthand remains:

```text
Observe -> Classify -> Act -> Verify -> Close
```

The method is not "more planning". It is a routing discipline:

- spend almost nothing when the change is small, local, reversible, and obvious;
- spend enough when risk, ambiguity, ownership, or user impact rises;
- turn durable learning into the correct owner before the next session forgets it;
- enforce only facts the harness can observe.

The stance is practical: the codebase, runtime, tests, users, and current docs are the world; the
model's explanation is only a hypothesis about that world. The method earns trust by checking the
hypothesis, not by sounding coherent.

## What Pain It Solves

| Pain | Failure mode | Cairn response |
| --- | --- | --- |
| AI speed creates review debt | large unreviewable diffs, confident wrong answers | small modes, proportional review, proof before done |
| Brownfield context is implicit | agent invents architecture or misses local patterns | observe first, reuse before invent, codebase maps when rediscovery is costly |
| Spec systems drift | proposals, specs, code, and tests tell different stories | delta/spec/code/proof reconciliation at close |
| Prompt text is weak evidence | regex routing and prompt heuristics create false gates | structured signals before text matching |
| Workflow tools sprawl | user must pick among frameworks, slash commands, skills | one router skill, lazy references, minimal always-on context |
| Agents lose state | compaction and session resume drop live obligations | file-backed `.cairn` state, anchor injection, tasks/proof logs |
| "Done" becomes narrative | agent says fixed without executable proof | fresh proof command plus explicit residual risk |
| Methodology becomes theater | named framework creates documents but no safer outcome | method docs must map to owners, proof, and explicit force/check/guide mechanisms |

## How The Method Evolves

The operational loop for changing Cairn lives in `docs/DEVELOPMENT.md`. This section is only the
acceptance bar for changing the method.

New doctrine must pass five tests:

- it starts from a repeated failure, user friction, dogfood incident, proof gap, or external shift;
- it says what gets better for the user or reviewer;
- it translates source lanes into `borrow / adapt / avoid / defer` instead of copying a framework;
- it names the smallest owner or mechanism that can carry the change;
- it survives the contrary case and closes with proof or an explicit deferral.

New doctrine is not accepted because it is elegant. It is accepted when it explains a real failure,
improves a real workflow, or prevents a repeatable class of harm with less total ceremony than the
alternatives.

## Source Translation

This table is synthesis, not the source ledger. Dated sources and links live in `docs/RESEARCH.md`
Part 3.

| Source lane | Borrow | Adapt | Avoid |
| --- | --- | --- | --- |
| OpenSpec / OPSX | proposal/change/spec/archive lifecycle; filesystem state; verify before archive | use delta/spec lifecycle only when risk justifies it | slash-first operation, fixed spec ceremony for small work, unreconciled spec drift |
| Spec Kit | phase separation and read-only consistency analysis | `cairn-close.mjs` checks drift without claiming runtime proof | greenfield-first flow, many manual commands, pretending analysis proves behavior |
| BMAD | discovery, decision logs, quick-vs-full pressure | use phases and evidence, not personas | role theater, mandatory PRDs, step-file bloat |
| Superpowers / GSD | bootstrap, proof discipline, subagent review, file-backed state | use hooks/scripts for narrow structural facts | universal hard-gates, ephemeral TODO as durable memory, command explosion |
| Agile principles | working software, customer value, simplicity, regular adjustment | proof and user outcome beat documentation volume | treating "agile" as permission to skip design or proof |
| Kanban | explicit workflow, WIP control, flow improvement | `.cairn/queue.md`, small batches, active residue management | building a project-management board inside Cairn |
| XP / YAGNI | simple design, test feedback, no presumptive features | no speculative hooks/scripts/skills without observed need | using YAGNI to neglect malleability, tests, or cleanup |
| DORA / METR / SPACE / DevEx | AI amplifies system quality; productivity needs balanced evidence | improve review, proof, feedback loops, flow, and context quality before claiming speed | one-metric productivity theater, benchmark-only claims |
| Lean / OODA / Cynefin / ADRs / Popper | observe-orient loops, proportionality, jidoka, decision records, falsification | route by risk and evidence; record why only when it matters | philosophy as ornament without operational consequences |
| Scrum / Definition of Done / SRE postmortems | single goal, explicit done, blameless learning | objective + owner + proof + context update for each durable change | sprint/event ritual, postmortem with no system change |

## Principles In The Method

The canonical principles live in `docs/PRINCIPLES.md`. In method terms they form six forces:

| Force | Principles | Operational meaning |
| --- | --- | --- |
| Proportion | Proportional depth, token economy | small work stays small; detail loads only when useful |
| Grounding | Brownfield first, evidence first, reuse before invent | inspect the real system before inventing structure |
| Ownership | One source -> both harnesses, no stale artifacts, compounding context | every fact has one durable owner and a closeout path |
| Honesty | Honest determinism boundary, structured signals before text matching | never call prose a gate; route by observable state where possible |
| Challenge | Adversarial by default | a decision is not strong until its contrary case has been checked |
| Portability | One source -> both harnesses, token economy | method survives Codex and Claude differences without duplicated truth |

Principles should change rarely. If a proposed principle cannot change behavior, proof, or
artifact ownership, it is not a principle yet.

## Lifecycle

### 1. Orient

Find the live shape of the work: cwd, repo root, owner boundary, git state, local instructions,
existing maps/specs/tests, active `.cairn` state, user-visible risk, and available proof.

Output: enough context to name the owner and the risk. No artifact for tiny work.

Question: "What is true before I touch anything?"

### 2. Route

Pick exactly one mode:

- `direct`: small, clear, reversible.
- `diagnose`: concrete wrong behavior.
- `discovery`: ambiguity, research, product/domain uncertainty, unclear greenfield.
- `delta-spec`: medium brownfield behavior change.
- `tracked-change`: high-risk, multi-phase, cross-boundary, customer-visible, migrations, release.

Output: mode plus why it is the lowest safe ceremony.

Question: "What is the cheapest workflow that still catches the real risk?"

### 3. Shape

Decide what must exist before mutation: no artifact, repro notes, brief, delta, plan, brainstorm,
tasks, proof, codebase map, or living spec.

Output: only the artifacts the route justifies. If a durable mode is selected, scaffold before
mutation and tick `tasks.md` live.

Question: "What must exist before mutation so review and resume are honest?"

### 4. Build

Implement the smallest root-cause change in the canonical owner. Reuse existing patterns. If the
system contradicts the plan, update the plan/delta instead of pretending the original plan still
matches reality.

Output: code/docs/config changes with bounded scope.

Question: "What is the smallest owner-level change that makes the intended behavior true?"

### 5. Prove

Run proof proportional to risk:

- focused syntax/unit checks for small local edits;
- repro plus regression for bugs;
- integration/runtime/browser/smoke for boundaries;
- adversarial review for high-risk or cross-boundary work;
- `cairn-close.mjs` for change-folder coherence, never as a substitute for executable proof.

Output: command/source and result. No "done" without fresh proof.

Question: "What evidence would make a skeptical reviewer believe this is closed?"

### 6. Reconcile

Compare intended behavior, implementation, tests, docs, specs, and residue. Choose one lifecycle
action: sync, delegate, archive, or delete.

Output: no stale artifacts. Durable learning lands in `docs/`, `.cairn/specs/`,
`.cairn/codebase/`, `AGENTS.md`, or the relevant code/test owner.

Question: "What story will remain after this working folder is gone?"

### 7. Learn

If the agent was surprised, repeated work, hit a missing context, or found a misleading map, update
the context owner. This is the compounding-context loop.

Output: the next session should not relearn the same fact.

Question: "What context was missing, misleading, or too expensive to rediscover?"

## Artifacts By Intent

| Intent | Artifact | Why it exists | When to delete or sync |
| --- | --- | --- | --- |
| Immediate safe edit | none | avoid ceremony | nothing to retain |
| Failure analysis | repro/proof notes | preserve cause and verification | delete unless the failure teaches durable context |
| Ambiguous idea | `brief.md` or decision note | compare options before building | sync decision or delete |
| Brownfield behavior delta | `delta.md`, `plan.md`, `tasks.md`, `proof.md` | keep intent, execution, and proof aligned | sync durable behavior or archive |
| High-risk/cross-boundary work | full tracked change | preserve scope, rollback, proof, review, decisions | archive or sync durable facts |
| Repeated rediscovery | `.cairn/codebase/<area>.md` | make hidden local knowledge cheap next time | keep while accurate; update on surprise |
| Durable behavior | `.cairn/specs/<capability>.md` | living truth beyond one change | keep current or delegate to existing spec system |
| Side idea | `.cairn/queue.md` | prevent silent scope expansion | close/drop/replace when priority changes |

## Mechanisms: Force, Check, Guide

Not every useful mechanism can force behavior. Cairn only calls something deterministic when the
harness or script can observe and enforce it.

| Mechanism | Effect | Level |
| --- | --- | --- |
| `SKILL.md` router | development tasks start with a mode | guide: model-invoked |
| SessionStart bootstrap | Cairn routing is visible without manual invocation | force: harness surface, proven where installed |
| `cairn-workspace.mjs` | repo/state root facts are shared by hooks and scaffold | check: internal fact source |
| `cairn-scaffold.mjs` | durable modes get a folder before mutation | force when invoked |
| `cairn-coherence.mjs` Stop hook | declared durable mode without change folder gets one continuation nudge | force: adopted repos only |
| `cairn-guard.mjs` PreToolUse hook | blocks file mutations outside active repo root where supported | force: Claude; Codex parity pending |
| `cairn-anchor.mjs` | resume context injects only on structural state change/cadence | force: local policy for hook payload |
| `cairn-close.mjs` | change folders expose lifecycle/claim/proof drift | check: read-only |
| `validate-cairn.mjs` | manifests, hooks, skill surfaces, and minimal workflow smoke stay coherent | check: CI/dev validation |
| closeout discipline | surprises update the correct context owner | check: proof `Context learned` plus `cairn-close` finding; stronger mechanism deferred |

Rule: promote a behavior from advisory to deterministic only when there is a stable structural signal
and a narrow failure it can prevent. Otherwise keep it as method guidance plus proof.

## Claims And Evidence Bar

| Claim | Evidence required | Status |
| --- | --- | --- |
| Cairn has a distinct methodology | named thesis, lifecycle, source translation, adversarial review | documented and adversarially reviewed; still needs more public dogfood cases |
| Proportional routing reduces ceremony | real cases where `direct` stayed small and risky work escalated | partially proved by dogfood; public evidence pending |
| Brownfield ownership improves safety | examples where owner/boundary checks prevented wrong-surface changes | partially proved in workspace and hook dogfood |
| Force/check/guide split prevents overclaim | mechanism map plus validator/close proof | documented and structurally checked; harness parity remains per architecture ledger |
| `Learn` declares a context owner | closeout records context owner plus learned fact, or explicit `none`/`deferred` | now checked by proof template and `cairn-close`; compounding impact unmeasured |
| Cairn improves productivity | balanced dogfood/user/runtime evidence, not only speed | not claimed yet |

## Measuring Real Value

Do not measure Cairn by number of files, prompts, tokens, or smoke passes alone. The method should be
judged by balanced signals:

| Dimension | Good signal | Bad signal |
| --- | --- | --- |
| Decision quality | mode choice matches risk and owner | everything becomes `direct` or `tracked-change` |
| Proof quality | proof is named before close and covers the boundary | proof is a narrow check supporting a broad claim |
| Flow | changes stay small, reviewable, and resumable | WIP grows through hidden side quests |
| Context compounding | repeated surprises become maps/specs/docs/hooks | same rediscovery repeats across sessions |
| Cognitive load | user can predict why Cairn chose a path | method vocabulary hides the actual decision |
| Stability | fewer stale specs, release surprises, and cross-repo footguns | more artifacts but same mistakes |
| Portability | Codex and Claude behavior differ only where harnesses differ | duplicated shims drift |

Dogfood and runtime proof are reality checks. User trust is earned when the method reduces
rediscovery and closes risk without adding ritual.

## Scenarios

### Tiny local fix

Route: `direct`.

The target is obvious after inspection. No `.cairn` artifact. Patch the owner, run focused proof,
report result and residual risk. Creating a spec here is waste.

Example: remove an unused comment from a script and run `node --check` or the repo validator.

### Failing export test

Route: `diagnose`.

Reproduce the failure, grade findings as confirmed/deduced/hypothesized, fix the confirmed root
cause, rerun failing proof and regression. Escalate only if intended behavior changes.

Example: an export test fails because CSV escaping diverges from an existing helper. Reuse the
helper; do not invent a second escaping path.

### New behavior in an existing module

Route: `delta-spec`.

Read current behavior, write the proposed delta, name affected contracts, scaffold before mutation,
implement, update delta when reality differs, prove, then sync/archive/delete.

Example: change prompt-anchor cadence. The durable behavior is "inject only on structural state
change/cadence", so proof must include payload size and repeated-turn suppression.

### Behavior-preserving refactor

Route: `direct`, `delta-spec`, or `tracked-change` by blast radius.

The intended behavior must remain unchanged. Name the preserved contract, keep the diff inside the
owner boundary, and run proof that would catch regression. Escalate when the refactor crosses module,
auth, persistence, generated-code, or public API boundaries.

Example: replace duplicated parsing helpers with an existing shared helper. Proof is the affected
unit/integration suite plus a diff review that no behavior contract changed.

### Multi-repo auth change

Route: `tracked-change`.

Confirm workspace and child repo ownership, branch/worktree strategy, rollback, proof per repo,
and external mutation gates. Handoff coordinates across repos but never replaces child-repo proof.

Example: auth change touching API and frontend. Parent workspace owns coordination; each child repo
owns its git state, tests, runtime smoke, and PR/release proof.

### Methodology change to Cairn itself

Route: `tracked-change`.

Use `docs/DEVELOPMENT.md`: preflight, research aperture, source translation, design pressure,
smallest owner edit, proof, close sync. Public claims require current source proof.

Example: this methodology change used a tracked change, source translation, subagent research,
canonical doc synthesis, adversarial review, and structural validation instead of directly editing
runtime hooks.

## Failure Tests

A new rule, artifact, or mechanism should be rejected or revised when any of these are true:

- It would have made the last small safe task slower without catching a real risk.
- It depends on the model remembering prose instead of a structural signal, proof, or owner file.
- It creates a second owner for a fact already owned by code, tests, docs, specs, or maps.
- It cannot say what evidence would prove it helped.
- Its best defense is "other methodologies do this".
- Its failure mode is worse than the problem it solves.

This is the Popper test for Cairn doctrine: every rule must be allowed to lose.

## Anti-Patterns

- A plan created after implementation and presented as if it guided the work.
- A spec that survives but no longer matches code/tests.
- A hook that claims to enforce a natural-language behavior it cannot observe.
- A regex over user prompt text treated as a deterministic route.
- A new script created because it feels symmetric, not because repeated production logic exists.
- A subagent used to parallelize coding instead of isolating research or review.
- A benchmark result used as proof that real brownfield work is safe.
- A "quick" change that silently crosses auth, persistence, billing, production, or repo boundary.

## What Makes Cairn Distinct

Cairn is not a spec framework and not an agent swarm. It is a **method router with an honesty
boundary**.

Its differentiator is the combination:

- proportional modes instead of one workflow;
- brownfield-first ownership before design;
- file-backed state without making every task a ceremony;
- explicit split between advisory method and deterministic gates;
- token economy as a first-class design constraint;
- closeout that reconciles code, specs, proof, and context.

The method succeeds when a user can predict why Cairn chose a path, a reviewer can see what evidence
closed the risk, and the next session inherits less confusion than the previous one.

It fails when the user sees a ritual instead of leverage.

## Current Open Gaps

The live backlog stays in `docs/ROADMAP.md`. The methodology-facing gaps are:

- more public dogfood cases, especially multi-repo work;
- stronger proof taxonomy for broad claims;
- better `Learn` enforcement if the new proof check is not enough;
- Codex write-guard parity proof;
- lightweight repo-map support when brownfield rediscovery repeats;
- subagent protocol proof before stronger orchestration.
