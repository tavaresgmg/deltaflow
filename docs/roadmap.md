# Roadmap

Decisions: `docs/decisions/`. Evidence: `docs/research/`.

Scope: `docs/scope-and-workflows.md`.

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
- [x] Eval scoreboard over JSONL results: current gaps, historical failures, route-contract
  clears, slow cases, and next cheap command (`scripts/eval-scoreboard.mjs`).

Validated on Codex (v0.135.0, gpt-5.5):

- [x] Installs from a marketplace (`.agents/plugins/marketplace.json`, discovered live);
  `installed, enabled`.
- [x] SessionStart hook injects the bootstrap (plain-text branch).
- [x] Skill loads (after fixing an unquoted-colon YAML bug now guarded by validate).
- [x] Auto-fires on a brownfield prompt without being named, routing to `diagnose`.

Still pending:

- [ ] Full auto-trigger suite (12 must-fire + 6 must-not) on ≥2 models per harness; log fire-rate.
- [x] Fast install + auto-trigger pass on Claude Code v2.1.159.
- [x] Incremental P0 matrix runner/result contract with duration metrics.
- [x] Claude Code realistic no-fire subset on v2.1.159 default: 0/6 misfires.
- [x] Second-model fast activation smoke: Claude `haiku` passed; Codex `gpt-5.4-mini`
  fired but did not emit a parseable route mode.
- [x] Route-output contract retest: Codex `gpt-5.4-mini` R5 and Claude default R11 now
  emit parseable expected modes.
- [x] Confirm the Claude Code PreToolUse guard blocks outside-repo writes live.
- [ ] Confirm the PreToolUse guard blocks live on Codex, not only via local smoke.
  Latest v0.136.0 `exec` smoke proved the gap: `apply_patch` outside the repo was blocked by
  sandbox in `workspace-write`, but succeeded under sandbox bypass without a captured
  `PreToolUse` event.

Exit: the skill auto-fires on >=90% of must-fire prompts and routes to the right mode in
>=4/5 real brownfield cards. Codex default suites are strong; Claude realistic default now
shows 14/14 activation, 12/14 routed, and 3 timeouts, so full cross-model exit remains pending.

## Phase 2: File-based layered memory (ADR-0004)

- [x] `.cairn/changes/<slug>/` templates (brainstorm, research, delta, plan, tasks, proof).
- [x] `.cairn/codebase/<area>.md` optional scoped maps for repeated brownfield observation.
- [x] `.cairn/specs/<capability>.md` optional living truth guidance for durable behavior.
- [x] `.cairn/decision-log.md` append-only convention (write during the work).
- [x] `tasks.md` checkbox resume protocol; read-state-first / write-progress-last.
- [x] `cairn-next.mjs` read-only next-step reporter over a change folder.
- [x] `cairn-retention.mjs` read-only reporter for completed active changes and archive/delete actions.
- [x] Worked examples proving that maps reduce repeated observe cost without becoming stale docs.

Exit: medium changes persist intent and resume across sessions without ceremony for small fixes.

## Phase 3: Workspace umbrella (ADR-0005)

- Deterministic boundary detection script (repo owner of cwd; worktree?).
- Parent `HANDOFF.md` + repo map; per-repo `.work/` state; worktrees anchored per repo.
- Cross-repo task coordination (parent `.work/`, separate PRs).

Exit: a task spanning 2+ repos in one workspace is coordinated without touching the wrong repo.

## Phase 4: Deterministic gates + reconciliation

- Deterministic mutation-boundary enforcement via PreToolUse hook (Claude) / command hook
  `exit 2` (Codex when live delivery is proven). Brainstorm and fresh-proof discipline remain
  advisory until a deterministic Stop/UserPromptSubmit heuristic exists.
- [x] Spec<->code reconciliation closeout guidance: sync living spec, delegate to OpenSpec,
  archive, or delete transient planning.
- [x] Spec Kit-style cheap read-only `/analyze` consistency check with severity-bearing
  findings and `--all` active-change scanning.
- [x] Semantic-claim v0 analysis: explicit `## Semantic Claims` must name code/proof and
  existing code refs.
- [x] Claim-backed spec<->code drift check: deltas and living specs validate code refs and
  proof commands; behavior deltas without claims are flagged.
- [x] Completed retained changes archived under `.cairn/changes/archive/<date>-<slug>/`.
- [x] Inferred semantic extraction from behavior prose beyond explicit claims: code/proof
  candidates are accepted as coverage, and missing code/proof/refs become findings.
- [x] Claude Code live hook proof: SessionStart and PreToolUse.
- [ ] Codex live hook proof beyond local smoke. Current result: plugin is installed/enabled,
  Codex docs support plugin-bundled hooks and trust review, but local v0.136.0 `exec` file
  changes did not trigger captured `PreToolUse` events.

Exit: the gates that matter are deterministic, not advisory, with parity across harnesses.

## Phase 5: First-class research stages as subagents (ADR-0006)

- Brainstorm hard-gate; Phase 0 web-research subagent writing reusable `research/<topic>.md`;
  official-docs grounding rule (lockfile version).
- Subagents only for isolated research / adversarial review — never to parallelize coding.

Exit: brainstorm + research + docs improve quality without recreating ceremony on small cards.

## Phase 6: Public readiness

- [x] Install guide for both harnesses (`docs/install.md`), with verified Codex commands.
- [x] Prompt eval fixture (`docs/evals/auto-trigger.md`) with a first logged Codex run.
- [x] Release checklist (`docs/release-checklist.md`).
- [x] Worked example proving codebase maps on a realistic brownfield eval-harness card.
- [x] Realistic routing fixture subset with cards + code + tests on Codex v0.136.0 default.
- [x] Fast cross-harness subset on Codex v0.136.0 and Claude Code v2.1.159.
- [x] Broad no-card/research/cleanup/pattern-alignment eval coverage on Codex, plus a
  Claude Code broad-fast subset.
- [x] P0 matrix subset with duration metrics on Codex default and Claude default.
- [x] Read-only eval scoreboard for choosing the next cheapest useful run.
- [x] Fast second-model subset on Claude `haiku`; Codex `gpt-5.4-mini` activation passed but
  routing output needs work.
- [ ] Same realistic routing subset on >=2 models per harness.
- [ ] Publish patterns only after real brownfield usage validates the core assumptions.
