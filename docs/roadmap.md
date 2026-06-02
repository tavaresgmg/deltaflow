# Roadmap

Principles: `docs/PRINCIPLES.md` (canonical). Decisions: `docs/decisions/`.
Evidence: `docs/research/`. Scope: `docs/scope-and-workflows.md`.

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
  initially fired without a parseable route mode, then passed route-contract and P0 retests.
- [x] Route-output contract retest: Codex `gpt-5.4-mini` R5 and Claude default R11 now
  emit parseable expected modes.
- [x] Codex `gpt-5.4-mini` P0 matrix: 3/3 must-fire routed, 0/3 must-not misfires.
- [x] Codex `gpt-5.4-mini` realistic diagnostic run: 13/14 fired, 12/14 routed, 0 timeouts;
  focused R9/R14 route-contract retest passed.
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
- [x] Fast second-model subset on Claude `haiku`; Codex `gpt-5.4-mini` P0 matrix passed.
- [ ] Same realistic routing subset on >=2 models per harness. Codex `gpt-5.4-mini`
  diagnostic gaps were cleared by focused retest, but the full realistic rerun is still pending.
- [ ] Publish patterns only after real brownfield usage validates the core assumptions.

## Phase 7: Token economy / concise comms (Principle 8) — NEXT

The cheapest, highest-frequency lever: every turn pays. Adapts the "caveman" concise-output
technique (JuliusBrussee/caveman, wilpel/caveman-compression) without extreme compression.

- [x] `Output Style` section in `SKILL.md` (extends existing `Output Shape`, reusing the owner):
  caveman `full` for agent output — fragments ok, active voice, present tense, one idea per
  line. Hard exceptions: security warnings, irreversible confirmations, public artifacts,
  numbers/IDs/dates/paths. Budget green after edit (skill 7032/7200 chars).
- [~] `cairn-budget.mjs` already counts the whole `SKILL.md` as one budgeted surface; per-section
  granularity skipped as over-engineering. If `SKILL.md` later overflows its char cap, push the
  Output Style block to a `references/output-style.md` lazy reference then.
- [x] Concise-comms red flag added to `framework-lessons.md` ("More words make the answer safer"
  -> cut filler, keep numbers/IDs/safety/inference steps).
- [ ] Eval: measure mean output tokens per routed turn before/after on the existing fixtures;
  log the delta. No accuracy regression on the auto-trigger + route-contract suites. (Needs a
  real-model run — deferred to the next eval cycle.)

Exit: routed turns drop measurable output tokens with zero routing/accuracy regression, and
the concision rule never fires on a safety/public surface.

## Phase 8: Harness capability adoption (Principle 5, graceful fallback)

Best feature of each harness, documented asymmetry. Claims verified against official docs on
2026-06-02 (`code.claude.com/docs/en/hooks`, `/skills`, `/settings`; `developers.openai.com/codex/hooks`,
`/plugins/build`; `github.com/openai/codex` PRs/releases). Verdicts below are CONFIRMED unless noted.

### Capability matrix (verified — encode supported set in `build-manifests.mjs`)

| Capability | Claude Code | Codex | Cairn use |
| --- | --- | --- | --- |
| Hide inactive skills from model | `skillOverrides`: `on`/`name-only`/`user-invocable-only`/`off` ✓ | none -> noop | shrink system prompt: expose only active-route skill |
| Cheapest-point prompt gating | `UserPromptExpansion` (block, per-command matcher) ✓ | `UserPromptSubmit` (block/augment, **no matcher** — fires on every prompt) ✓ | block/augment before inference tokens |
| Survive compaction | `PreCompact` (block, `auto`/`manual`) + `SessionStart` `source:"compact"` + `reloadSkills` ✓ | SQLite memory (v0.135.0) ✓ | snapshot active route + in-flight proof |
| Inject route identity into subagents | `SubagentStart` `additionalContext` ✓ (**cannot block**; block via `SubagentStop`) | none -> parent-prompt fallback | route constraints at spawn, not via parent prompt |
| Plugin-bundled hooks | yes ✓ | `hooks/hooks.json` + `PLUGIN_ROOT`/`PLUGIN_DATA` ✓ **behind `plugin_hooks` feature flag** (PR #19705) | zero-config distribution |
| Per-route tool restriction | skill `disallowed-tools` (+ `allowed-tools`) ✓ | `PreToolUse` `updatedInput` rewrite ✓ (**`apply_patch` may not fire** — Issue #17794) | static permission enforcement per mode |

REFUTED / corrected by the verification pass:
- `continueOnBlock` (PostToolUse) — not in official docs. Dropped. (`updatedToolOutput` is real.)
- `SubagentStart` does **not** support `decision:"block"`; use `additionalContext`, block via `SubagentStop`.
- `--output-schema` works in `codex exec` but **not** `codex exec resume` (open issues #14343, #22998).

- [x] Confirm each row against official docs; confabulated rows dropped (see REFUTED above).
- [ ] `PreCompact`/SessionStart-`compact` route-state snapshot + reload (Claude) — fixes
  post-compaction continuity loss. Codex fallback: persist route to `.cairn/` (SQLite is internal).
- [ ] `skillOverrides: user-invocable-only` to hide inactive skills (Claude); measure
  system-prompt token drop via `/context all`. Codex: noop.
- [ ] `SubagentStart` `additionalContext` route-identity injection (Claude); parent-prompt on Codex.
- [ ] Each adopted capability degrades to a documented noop on the harness that lacks it; parity
  asymmetries recorded in the matrix, validated by `validate-cairn.mjs`.

Exit: each harness uses its best available lever; no capability hard-fails on the other; the
matrix is the single source for what is real vs aspirational.

### Root cause found for the long-standing Codex live-PreToolUse gap

The Phase 1/Phase 4 pending item ("Codex live PreToolUse proof beyond local smoke") has a
verified two-part cause, not a Cairn bug:
1. **`plugin_hooks` feature flag** — plugin-bundled hooks were not loaded at runtime until PR
   #19705/#19778, and remain behind the `plugin_hooks` flag. Without it, a plugin cannot enforce
   `PreToolUse`; the user must register the hook manually in `~/.codex/hooks.json`.
2. **`apply_patch` hook gap** — Issue #17794: file-write ops sometimes do not fire
   `PreToolUse`/`PostToolUse`, which is exactly what the boundary guard needs to intercept.

- [ ] Re-test Codex live PreToolUse once `plugin_hooks` is confirmed GA (check `config.schema.json`
  on `openai/codex` main). Until then, document the manual-registration fallback in `install.md`.
- [ ] Track Issue #17794; the boundary guard's write-block on Codex is best-effort until it lands.

## Phase 9: Consolidation / redundancy cleanup (Principle 7 + 8)

`roadmap.md`, `comparison-and-gaps.md`, and `scope-and-workflows.md` overlap on "what Cairn
has / how it wins". Drift risk across three surfaces.

- [x] `PRINCIPLES.md` is the only home for principles; README thesis, `scope` "How Cairn wins",
  and `framework-lessons` Design Rules reduced to pointers.
- [x] `comparison-and-gaps.md` keeps the competitive matrix; added ECC/caveman + a concise-output
  dimension, pointed principles to `PRINCIPLES.md`.
- [x] Re-ran `cairn-budget.mjs` — green; `framework-lessons` shrank (324->310 words).
- [x] Checked for stale archived-change refs in public docs — none load-bearing (only dated eval
  logs, which are valid proof). No removal needed.

Exit (met): each principle fact lives once in `PRINCIPLES.md`; `cairn-budget.mjs` green;
validate passes (37 files).

## Sequencing (next cycle)

All four selected. Order by cost/impact, each behind the default-light intent gate:

1. **Phase 7** first — cheapest, every turn benefits, low risk, measurable.
2. **Phase 9 (partial)** alongside — fold principles into `PRINCIPLES.md` while editing those
   files anyway; avoids touching them twice.
3. **Phase 8** after `[confirm]` pass — gated on verifying the feature claims are real.
4. **Phase 6 eval gaps** continuous — re-run after any `description`/mode/Output-Style change to
   catch regressions; close the >=2-models-per-harness and Claude second-model P0 debt.
