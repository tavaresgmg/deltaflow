# Roadmap

Decisions: `docs/decisions/`. Evidence: `docs/research/`.

## Phase 0: Seed + research + decisions — DONE

- Repo and plugin scaffold; rename to Cairn; MIT license; public-repo hygiene.
- Two multi-agent research passes (frameworks + harness/context), ~2M tokens, verified.
- Six ADRs recording the load-bearing decisions and their tradeoffs.

Exit (met): repo has shape and a grounded design to build the MVP from.

## Phase 1: Autonomous portable skill (MVP)

- Rewrite the `cairn` `description` to be directive + front-loaded + negative boundary (ADR-0003).
- SessionStart bootstrap hook (one bash script, harness-detecting, `${CLAUDE_PLUGIN_ROOT}`).
- Generate both manifests (`.codex-plugin` + `.claude-plugin`) from one canonical source; add
  `.claude-plugin/plugin.json` (currently missing).
- Extend `validate-cairn.mjs` with a parity check (both manifests agree; `description` <=1024;
  trigger words in first ~250 chars; no dirs inside the plugin manifest dirs).
- Auto-trigger evals: >=10 pt-BR/en prompts that MUST fire + >=5 near-misses that MUST NOT,
  on Opus and Sonnet, inspecting whether the Skill tool was called.

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
