# Roadmap

Decisions: `docs/decisions/`. Evidence: `docs/research/`.

## Phase 0: Seed + research + decisions — DONE

- Repo and plugin scaffold; rename to Cairn; MIT license; public-repo hygiene.
- Two multi-agent research passes (frameworks + harness/context), ~2M tokens, verified.
- Six ADRs recording the load-bearing decisions and their tradeoffs.

Exit (met): repo has shape and a grounded design to build the MVP from.

## Phase 1: Autonomous portable skill (MVP)

Built and locally validated:

- [x] Directive, front-loaded `description` + bilingual `when_to_use` (ADR-0003).
- [x] SessionStart bootstrap hook — one harness-detecting bash script using
  `${CLAUDE_PLUGIN_ROOT}` (`plugins/cairn/hooks/`), both branches tested.
- [x] Canonical `plugin.manifest.json` + `build-manifests.mjs` emitting both
  `.codex-plugin` and `.claude-plugin` manifests.
- [x] `validate-cairn.mjs` extended: file set, manifest parity, build-drift, `description`
  <=1024 + directive + negative boundary, no dirs in manifest dirs, hook portability.
- [x] Auto-trigger eval fixture: 12 must-fire (pt-BR/en) + 6 must-not-fire + protocol
  (`docs/evals/auto-trigger.md`).

Pending (needs a live harness — Codex first):

- [ ] Install on Codex, then Claude Code; confirm the bootstrap injects and the skill loads.
- [ ] Run the auto-trigger suite on >=2 models per harness; log fire-rate.
- [ ] Confirm per-harness SessionStart stdout contract (the I/O mapping is current best guess).

Exit: the skill auto-fires on >=90% of must-fire prompts and routes to the right mode in
>=4/5 real brownfield cards, validated on Codex first.

## Phase 2: File-based layered memory (ADR-0004)

- `.cairn/changes/<slug>/` templates (brainstorm, research, delta, plan, tasks, proof).
- `.cairn/decision-log.md` append-only convention (write during the work).
- `tasks.md` checkbox resume protocol; read-state-first / write-progress-last.

Exit: medium changes persist intent and resume across sessions without ceremony for small fixes.

## Phase 3: Workspace umbrella (ADR-0005)

- Deterministic boundary detection script (repo owner of cwd; worktree?).
- Parent `HANDOFF.md` + repo map; per-repo `.work/` state; worktrees anchored per repo.
- Cross-repo task coordination (parent `.work/`, separate PRs).

Exit: a task spanning 2+ repos in one workspace is coordinated without touching the wrong repo.

## Phase 4: Deterministic gates + reconciliation

- Correctness gates via PreToolUse hook (Claude) / command hook `exit 2` (Codex): no skipping
  brainstorm, fresh proof before `done`, boundary enforcement.
- Spec<->code reconciliation step (close the OpenSpec drift gap ourselves).
- Spec Kit-style cheap read-only `/analyze` consistency check.

Exit: the gates that matter are deterministic, not advisory, with parity across harnesses.

## Phase 5: First-class research stages as subagents (ADR-0006)

- Brainstorm hard-gate; Phase 0 web-research subagent writing reusable `research/<topic>.md`;
  official-docs grounding rule (lockfile version).
- Subagents only for isolated research / adversarial review — never to parallelize coding.

Exit: brainstorm + research + docs improve quality without recreating ceremony on small cards.

## Phase 6: Public readiness

- Examples, install guide, prompt eval cases, release checklist.
- Publish patterns only after real brownfield usage validates the core assumptions.
