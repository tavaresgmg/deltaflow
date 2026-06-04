# Changelog

Notable changes to Cairn, newest first. Format follows
[Keep a Changelog](https://keepachangelog.com). Cairn is experimental and pre-1.0, so the surface
(modes, hooks, manifests) may still change between minor versions.

Tagged releases: https://github.com/tavaresgmg/cairn/releases

## [Unreleased]

## [0.1.15] — 2026-06-04

Documentation and methodology pass: skill↔methodology alignment fixes plus an
adversarially-filtered evidence/clarity audit (no runtime behavior change).

### Fixed
- Aligned the user-facing mode tables with the deterministic scaffold: `delta-spec` now lists
  `delta, plan, tasks, proof` (was `brief, delta, plan, proof`) in `SKILL.md` and `README.md`.
- Corrected an overclaim in `docs/ARCHITECTURE.md`: `validate-cairn.mjs` caps the always-on
  bootstrap surface only, not `SKILL.md`/`references` — kept small by progressive disclosure
  (honest determinism boundary, Principle 6).
- Corrected the inverted Cynefin analogy and softened the OODA equivalence in `docs/PRINCIPLES.md`.
- Refreshed stale OpenSpec evidence: `/opsx:sync` has been default since v1.4.0 (2026-06-01), so the
  "no native reconciliation command" claim and the `1.3.x` version label in `docs/RESEARCH.md` were
  wrong; fixed both and added a dated `docs/DECISIONS.md` addendum. Added the METR RCT citation.
- Removed the stale `v0.1.13 is Latest` line from `docs/ROADMAP.md`; `CHANGELOG.md` is the sole
  release-history owner.

### Changed
- `scripts/validate-cairn.mjs` now guards all 10 skill templates in `required[]` (was 6), so
  deleting any documented template fails validation.
- Tightened `docs/METHODOLOGY.md`: the differentiator and mechanisms sections point to their
  `METHODOLOGY_DEEP_DIVE.md` owner, and the proportional-routing claim cites the real dogfood
  locator and names its structural gap.
- `references/review.md` marks `docs/RESEARCH.md` as repo-only (self-contained runtime).

## [0.1.14] — 2026-06-04

### Changed
- Reduced the runtime helper surface for the operational-core pass: `UserPromptSubmit` policy and
  anchor rendering now share `cairn-anchor.mjs`, so there is one owner for resume-anchor text,
  cadence, and cache behavior.
- Collapsed change-folder closeout into `cairn-close.mjs`, which validates lifecycle/proof/context
  consistency and can archive/delete a verified local change with `--apply`.
- Reworked `scripts/validate-cairn.mjs` around the minimal core: scaffold, close, anchor, hooks,
  and manifest parity.

### Removed
- Removed `cairn-anchor-policy.mjs`, `cairn-next.mjs`, and `cairn-version.mjs`. The first was
  merged into `cairn-anchor.mjs`; the others were convenience helpers that did not enforce a
  unique methodology invariant.
- Removed the local eval suite (`docs/evals/`, `eval-autotrigger.mjs`, `eval-scoreboard.mjs`) and
  the non-minimal helper scripts `cairn-analyze.mjs`, `cairn-retention.mjs`, `cairn-budget.mjs`,
  `cairn-boundary.mjs`, and `cairn-doctor.mjs`.
- Removed the packaged `cairn-researcher` agent. Research remains a method stage, but Cairn no
  longer ships a separate agent component.

## [0.1.13] — 2026-06-03

### Fixed
- The installed plugin no longer points at repo-only `docs/` files that don't ship with it.
  `SKILL.md` and `references/framework-lessons.md` cited `docs/PRINCIPLES.md` (a dead path for
  installed users, since only `plugins/cairn/` ships). The runtime is now self-contained:
  principles are noted as repo-only, and maintainer comments in `cairn-doctor.mjs` /
  `hooks/session-start.sh` are explicitly attributed to the repo. No runtime behavior changed.

## [0.1.12] — 2026-06-03

### Changed
- Documentation consolidated into canonical top-level files under `docs/`: `PRINCIPLES.md`,
  `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `DEVELOPMENT.md`, `RESEARCH.md`, `INSTALL.md`
  (plus `evals/`). Applies Cairn's own proportional-depth philosophy to its own docs.
- The six per-file ADRs (`docs/decisions/`) collapsed into a single `docs/DECISIONS.md`; the
  "ADR" term is retired in favor of numbered decisions. Code/hook/reference comments updated
  from `ADR-000X` to `Decision N`.
- `docs/architecture/mvp-architecture.md` → `docs/ARCHITECTURE.md`, absorbing the agent
  integration contract (as a Harness status section) and the worked example (as an Appendix).
- `docs/research/{frameworks,context-and-portability,evolution-radar}.md` merged into
  `docs/RESEARCH.md`; `docs/install.md` + `docs/release-checklist.md` merged into `docs/INSTALL.md`.

### Removed
- `docs/comparison-and-gaps.md` and `docs/scope-and-workflows.md` — content re-homed to the
  owners above; routing now lives in `SKILL.md` + `references/modes.md`.

### Notes
- `scripts/validate-cairn.mjs` updated to the new canonical doc set (required files, content
  checks, stale-phrase guards). Structural validation passes; no plugin runtime behavior changed.

## [0.1.11] — 2026-06-03

### Changed
- Clarified the current workspace-state standard: `.cairn/` is the active owner for handoff,
  docs, tmp, research artifacts, and worktrees.
- ADR-0005 now explicitly marks old `.work/` implementation details as superseded by the
  current `.cairn/` layout.
- ADR-0006 and framework research notes now point Phase 0 research artifacts at `.cairn/`
  instead of the historical `.work/` convention.

### Notes
- `.work/` remains mentioned only as legacy migration input, compatibility coverage, changelog,
  or historical ADR context.

## [0.1.6] — 2026-06-03

### Added
- Local priority queue support: `.cairn/queue.md` now owns mid-work ideas and follow-ups that
  should not silently expand the active scope.
- Queue template with `Now`, `Next`, `Later`, and `Closed recent` sections plus origin, area,
  priority, status, decision, and proof fields.
- `priority-queue` eval fixtures (`Q1-Q5`) cover side-idea triage, deferred enqueue, priority
  replacement, close marking, and conceptual backlog no-fire behavior.

### Changed
- Non-trivial workflow preflight now scans queue top items; close reconciles queue state alongside
  delta/code/tests/specs.
- Cairn now asks for triage before scope expansion: do now, enqueue, replace priority, or drop.
- Hybrid memory policy docs include `.cairn/queue.md` as local process state by default.

### Known residuals
- Queue behavior has structural and dry-run eval coverage only; real-model adherence remains a
  future `priority-queue` eval run.

## [0.1.5] — 2026-06-03

### Changed
- Workspace guidance now prefers branch + worktree for non-trivial mutations, with explicit
  preflight checks for boundary, cleanliness, remotes, existing worktrees, base branch, and
  local-vs-remote divergence.
- Cairn workspace ownership moves from `.work/` to `.cairn/`: new handoff, docs, tmp, and
  worktree state use `.cairn/state`, `.cairn/docs`, `.cairn/tmp`, and `.cairn/worktrees`, while
  `.work/` remains legacy migration input.

## [0.1.4] — 2026-06-03

### Changed
- `UserPromptSubmit` anchor injection is now state-change gated: it ignores prompt text, emits only
  when active-change state appears or changes, and dedupes repeated anchors by session/cwd + hash.
- Session bootstrap reduced to the minimum routing contract, and principles now make structured
  signals before text matching explicit.
- Documentation ownership tightened: `comparison-and-gaps.md` is now a short snapshot, roadmap owns
  gap closure, ADR-0004 explicitly marks the old versioned-change-folder rule as superseded, and
  `cairn-close.mjs` is documented as consistency analysis rather than executable proof.

## [0.1.3] — 2026-06-02

Adds per-turn routing context, deterministic scaffolding, and a single-owner docs pass.

Compatibility note: this section describes the tagged v0.1.3 behavior. Current `Unreleased`
changes replace unconditional per-turn anchor emission with state-change-gated anchor emission.

### Added
- `UserPromptSubmit` hook (`hooks/user-prompt-submit.sh`): re-injects the resume anchor (active change,
  open tasks, recent decisions) at the start of each turn, so routing state survives without relying on
  model memory. Silent and zero-token when no `.cairn/changes/<slug>/` is active. Claude emits
  `additionalContext` JSON; Codex/other emits plain stdout. Reuses `cairn-anchor.mjs`.
- Deterministic scaffolding: `cairn-scaffold.mjs` copies only the templates a mode justifies into
  `.cairn/changes/<slug>/` and seeds the repo-level `decision-log.md` (idempotent). Artifact skeletons now
  live as files in `skills/cairn/templates/`, one owner each.

### Changed
- Boundary guard acts only in repos that adopted Cairn (a `.cairn/` dir exists) and allowlists the agent
  config dirs (`~/.claude`, `~/.codex`), so it no longer blocks edits outside the active repo in
  un-adopted projects. Adoption check shared via `cairn-workspace.mjs` `hasCairnDir`.

### Docs
- Single-owner cleanup: each fact owned by one doc. Roadmap is forward-looking only (shipped history lives
  here); ADR-restating duplication in `mvp-architecture.md` collapsed to pointers; harness-status copy
  points to `agent-integration-contract.md`; orphan roadmap "Phase N" references removed from hooks/scripts.
  Honest-determinism labels relabeled in `PRINCIPLES.md`; Output Style demoted to a pointer to Principle 8.

### Known residuals
- Codex `UserPromptSubmit` per-turn delivery mirrors the proven `SessionStart` plain-text path but is not
  yet live-verified on Codex.
- Codex `PreToolUse` mutation-guard parity still pending. The upstream `apply_patch` hook fix
  (openai/codex PR #18391) and current Codex docs list `apply_patch` as a `PreToolUse` target, but local
  runtime delivery via the installed plugin is not yet confirmed; the guard logic itself is validated locally.

## [0.1.2] — 2026-06-02

First release promoted to **Latest**; v0.1.0 and v0.1.1 remain pre-release milestone markers.
Hardens workspace state placement and eval safety.

### Added
- Shared workspace boundary resolver with `cairnStateRoot` / `cairnStateScope`, so a marked parent
  workspace owns `.cairn/` state.
- Validation coverage for parent-workspace, isolated-repo, guard, shell-scaffold, and coherence cases.
- Immutable eval-output safeguards plus `--dry-run` / `--overwrite`, `infra-lens` fixtures, and recorded
  Codex `gpt-5.4-mini` reruns.

### Changed
- Guard and Stop-hook coherence now block child-repo `.cairn` state inside a marked workspace, including
  common shell scaffold commands.
- Synced install/version docs and release manifests to 0.1.2.

### Fixed
- No longer false-positives on ordinary Git repos that merely contain a local `.work/`.

### Known residuals
- Codex plugin-bundled PreToolUse enforcement still depends on Codex hook loading/trust behavior; the
  guard script itself is validated locally.
- Small-model / latency eval debt remains recorded, especially R14 on `gpt-5.4-mini`.

## [0.1.1] — 2026-06-02 (pre-release)

Builds on v0.1.0.

### Added
- End-of-turn coherence Stop hook (`plugins/cairn/scripts/cairn-coherence.mjs`): if a turn declares
  `Mode: tracked-change|delta-spec` but no `.cairn/changes/<slug>/` exists, it blocks the close once
  (exit 2) to force scaffolding. One-shot, `stop_hook_active`-guarded.
- Blast-radius gate: the hook stays silent unless the repo has already adopted Cairn (a `.cairn/` dir
  exists), so it never nags unrelated projects.
- Codex `Stop` parity, live-proven: fires and honors `exit 2`, passing
  `last_assistant_message` / `cwd` / `transcript_path` / `stop_hook_active`.

### Notes
- Two deterministic hooks now run on both harnesses: PreToolUse mutation guard + Stop coherence hook.
- Open: real-model eval runs; Codex PreToolUse guard parity still pending.

## [0.1.0] — 2026-06-02 (pre-release)

First tagged milestone. Experimental.

### Added
- Five proportional modes — `direct`, `diagnose`, `discovery`, `delta-spec`, `tracked-change` — each
  producing only the artifacts it justifies.
- Auto-activation via a SessionStart bootstrap (no need to invoke it by name).
- One source → both harnesses: a single canonical manifest generates the Codex and Claude Code plugins.
- Deterministic PreToolUse boundary guard that blocks writes outside the active repo.
- Ten principles driving every decision, including honest determinism and adversarial-by-default.

### Status
- Built and locally validated (`node scripts/validate-cairn.mjs`); verified live on Codex CLI `0.136.0`
  and Claude Code `2.1.159`.
- Pre-release because real-model eval runs (≥2 models per harness) were not yet published, and Codex live
  PreToolUse enforcement needs manual hook registration until the upstream `plugin_hooks` flag is GA.

[Unreleased]: https://github.com/tavaresgmg/cairn/compare/v0.1.11...HEAD
[0.1.11]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.11
[0.1.6]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.6
[0.1.5]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.5
[0.1.4]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.4
[0.1.3]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.3
[0.1.2]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.2
[0.1.1]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.1
[0.1.0]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.0
