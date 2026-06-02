# Gates & Reconciliation

A gate is only worth claiming if it's enforced, not requested. Prose in `AGENTS.md` is
advisory; only hooks and scripts enforce. This file is explicit about which is which.

## Deterministic (enforced by hooks/scripts)

- **Mutation boundary guard** — `scripts/cairn-guard.mjs`, wired as a PreToolUse hook on
  `Edit|Write|MultiEdit|NotebookEdit|apply_patch`. Blocks (exit 2) any file mutation
  event whose target is outside the active repo root — the main multi-repo footgun. Override:
  `CAIRN_ALLOW_CROSS_REPO=1`.
- **Consistency check** — `scripts/cairn-analyze.mjs .cairn/changes/<slug>` reports internal
  drift in a change folder with severity-bearing findings. It can also scan active changes with
  `--all .cairn/changes`. For a finished change it emits a `verify` verdict
  (completeness/coherence/proof → `verified`|`incomplete`|`drift`) — the spec→code loop closure,
  aggregated from the findings, never running the proof commands. Read-only; run before
  claiming a change is complete.

## Advisory (not deterministically enforceable)

These depend on natural-language activity, not tool calls, so they cannot be hard-gated
without false positives. They live in `AGENTS.md` / `SKILL.md` as required behavior:

- Brainstorm before code when stakes warrant (ADR-0006).
- Fresh, executable proof before saying "done".
- Review the diff proportional to risk before proof (`review.md`): intent, boundaries, edges,
  security. Proof says it works; review says it is right and safe.
- Research external truth early when it can change the plan.
- Reuse existing symbols, helpers, docs, specs, and repo patterns before creating a new path.
- Check anti-rationalization red flags before closing work that skipped proof, reuse, cleanup,
  research, or planning.
- Public or irreversible mutation needs explicit same-turn authorization: push, PR/MR, merge,
  release, deploy, publish, or any team/customer-facing or destructive action. Cairn sees no
  tool call for these, so they cannot be hard-gated — required behavior, not an enforced gate.

Do not pretend these are gates. If a deterministic signal becomes available later (e.g. a
Stop-hook heuristic that checks for a recent proof command), promote it then.

## Spec ↔ code reconciliation

OpenSpec-style delta drift is by-design and has no native command in 2026, so Cairn does it
explicitly. When a `delta.md` exists and code has moved:

1. Read `delta.md` proposed behavior and the affected capabilities/contracts.
2. Compare against current code and tests (the live source of truth).
3. List drift: behavior in code not in the delta, and vice versa.
4. Sync — update `delta.md` to match reality, or fix code to match intent; record the choice
   in `.cairn/decision-log.md`.
5. Re-run `cairn-analyze.mjs` to confirm the folder is internally consistent.
6. On close, sync durable behavior into `.cairn/specs/<capability>.md`, delegate to an existing
   spec system such as OpenSpec, archive the change folder, or delete transient planning.

## Cross-harness parity & validation status

The guard *logic* is harness-neutral and unit-tested, including `apply_patch` patch-header
paths. Claude Code live wiring is confirmed. Codex hook docs support plugin-bundled hooks,
`apply_patch` matchers, trust review, and `exit 2` blocking, but local Codex CLI v0.136.0
`exec` smoke did not deliver a captured `PreToolUse` event for file changes. Treat Codex
mutation guard parity as pending, not proven.
