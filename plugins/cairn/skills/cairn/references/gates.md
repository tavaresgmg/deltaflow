# Gates & Reconciliation

A gate is only worth claiming if it's enforced, not requested. Prose in `AGENTS.md` is
advisory; only hooks and scripts enforce. This file is explicit about which is which.

## Deterministic (enforced by hooks/scripts)

- **Mutation boundary guard** — `scripts/cairn-guard.mjs`, wired as a PreToolUse hook on
  `Edit|Write|MultiEdit|NotebookEdit`. Blocks (exit 2) any file mutation whose target is
  outside the active repo root — the main multi-repo footgun. Override:
  `CAIRN_ALLOW_CROSS_REPO=1`.
- **Consistency check** — `scripts/cairn-analyze.mjs .cairn/changes/<slug>` reports internal
  drift in a change folder with severity-bearing findings. It can also scan active changes with
  `--all .cairn/changes`. Read-only; run it before claiming a change is complete.

## Advisory (not deterministically enforceable)

These depend on natural-language activity, not tool calls, so they cannot be hard-gated
without false positives. They live in `AGENTS.md` / `SKILL.md` as required behavior:

- Brainstorm before code when stakes warrant (ADR-0006).
- Fresh, executable proof before saying "done".
- Research external truth early when it can change the plan.
- Reuse existing symbols, helpers, docs, specs, and repo patterns before creating a new path.
- Check anti-rationalization red flags before closing work that skipped proof, reuse, cleanup,
  research, or planning.

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

The guard *logic* is harness-neutral and unit-tested. The PreToolUse wiring uses Claude's
hook contract; the Codex command-hook contract (stdin shape, `exit 2` semantics) is mapped in
`hooks/README.md` and confirmed empirically on a live harness (same caveat as SessionStart).
