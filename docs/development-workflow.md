# Cairn Development Workflow

Owner: this file owns how Cairn evolves as a product. Runtime agent behavior still lives in
`plugins/cairn/skills/cairn/references/`; roadmap owns next cycles; research docs own evidence.

Use this loop for non-trivial changes to Cairn itself, especially skill routing, methodology,
hooks, workspace state, specs, evals, release posture, or public claims. Small typo/docs fixes can
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
6. **Implementation.** Patch the smallest owner surface. Prefer docs/evals/reference edits over new
   hooks/scripts/skills unless deterministic evidence proves prose is insufficient. If a side-idea
   appears, triage it into now, enqueue, replace priority, or drop.
7. **Proof.** Run local structural checks first, then focused eval dry-runs, then real-model evals
   only when a release/public claim needs them. `cairn-analyze.mjs` checks coherence; it does not
   replace executable proof.
8. **Close and sync.** Reconcile durable learnings into the right owner: roadmap for next work,
   `docs/research/evolution-radar.md` for source ledger updates, `docs/research/frameworks.md` for
   framework-specific findings, principles only for durable rules, plugin references only for agent
   operations, and eval docs/results only for measured behavior.

## Research Lenses

Pick the smallest useful aperture. Typical lanes:

- agent frameworks and harness capabilities;
- empirical AI software-development evidence;
- DevEx, productivity, and measurement frameworks;
- Lean, Agile, XP, Kanban, Scrum, and product-shaping methods;
- strategy and situational-awareness methods;
- architecture, ADRs, operability, security, and incident learning;
- context engineering, memory, long-horizon agents, and eval methodology.

The output is not a literature review. The output is a decision that can be implemented, verified,
and revised when the state of practice changes.
