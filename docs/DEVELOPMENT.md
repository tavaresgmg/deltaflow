# Cairn Development Workflow

Owner: this file owns how Cairn evolves as a product. `docs/METHODOLOGY.md` owns the named method
and lifecycle synthesis. Runtime agent behavior still lives in
`plugins/cairn/skills/cairn/references/`; roadmap owns next cycles; research docs own evidence.

Use this loop for non-trivial changes to Cairn itself, especially skill routing, methodology,
hooks, workspace state, specs, release posture, or public claims. Small typo/docs fixes can
stay direct.

## Loop

1. **State preflight.** Confirm repo root, branch, remote, dirty files, existing worktrees, active
   `.cairn/changes/<slug>/`, `.cairn/queue.md` top items, open tasks, latest decision-log entries,
   and whether local plugin installs/releases are in scope. Use `git status --short --branch`
   before mutation.
2. **Problem frame.** Write the hypothesis, user pain, owner surface, expected artifact, and named
   downside. If the wrong assumption changes public effect, release, cost, or safety, ask first.
3. **Research aperture.** For methodology or agent-behavior changes, choose 2-4 lenses before
   deciding. At least one lens must be **non-agent** unless the task is purely harness-specific.
   Rotate sources so Cairn does not keep re-reading the same competitor set. This research aperture
   is a state of practice check, not a standing literature review.
4. **Evidence translation.** Convert sources into a short `borrow / adapt / avoid / defer` table.
   Do not paste frameworks wholesale. Name the state of practice, the local constraint, and why the
   Cairn choice differs.
5. **Design pressure.** Brainstorm 2-3 options, pick one, name the tradeoff, then run an
   adversarial challenge and a disproof path. If the counter-case wins, change the plan.
6. **Implementation.** Patch the smallest owner surface. Prefer docs/reference edits over new
   hooks/scripts/skills unless deterministic evidence proves prose is insufficient. If a side-idea
   appears, triage it into now, enqueue, replace priority, or drop.
7. **Proof.** Run local structural checks first, then focused harness/runtime smokes when the
   change touches activation or hooks. `cairn-close.mjs` checks coherence; it does not replace
   executable proof.
8. **Close and sync.** Reconcile durable learnings into the right owner: roadmap for next work,
   `docs/RESEARCH.md` for source-ledger and framework findings, principles only for durable rules,
   and plugin references only for agent operations.

## Research Lenses

Pick the smallest useful aperture. Typical lanes:

- agent frameworks and harness capabilities;
- empirical AI software-development evidence;
- DevEx, productivity, and measurement frameworks;
- Lean, Agile, XP, Kanban, Scrum, and product-shaping methods;
- strategy and situational-awareness methods;
- architecture, ADRs, operability, security, and incident learning;
- context engineering, memory, and long-horizon agents.

The output is not a literature review. The output is a decision that can be implemented, verified,
and revised when the state of practice changes.

## Deep Methodology Audit

Use this rarely: when the task is to challenge the method itself, not just evolve one behavior.

Minimum bar:

- 6-8 source lanes, with at least half non-agent;
- a coverage matrix of covered, deferred, and intentionally ignored lanes;
- a subagent panel split by lens, not by overlapping implementation;
- a claims/evidence bar that separates proven, partial, unmeasured, and not-claimed;
- an explicit mechanism backlog: guide, check, force, or reject;
- no runtime hook/script unless the audit proves a repeated structural failure.

## Subagent Panel Protocol

For deep methodology or high-risk design work:

- frame the main thesis and immediate local task before spawning agents;
- give each subagent a distinct lens and read-only scope unless a disjoint patch is intentional;
- ask for source-backed `borrow / adapt / avoid / defer`, not broad essays;
- require output fields: lens, source, claim attacked, evidence, recommendation, and accepted
  downside;
- reconcile conflicts in the main thread with named evidence and accepted downside;
- record only decisions and useful findings in durable docs; keep transcripts out of public docs.
