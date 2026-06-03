# Changelog

Notable changes to Cairn, newest first. Format follows
[Keep a Changelog](https://keepachangelog.com). Cairn is experimental and pre-1.0, so the surface
(modes, hooks, manifests) may still change between minor versions.

Tagged releases: https://github.com/tavaresgmg/cairn/releases

## [Unreleased]

## [0.1.3] — 2026-06-02

Adds per-turn routing context, deterministic scaffolding, and a single-owner docs pass.

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

[Unreleased]: https://github.com/tavaresgmg/cairn/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.3
[0.1.2]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.2
[0.1.1]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.1
[0.1.0]: https://github.com/tavaresgmg/cairn/releases/tag/v0.1.0
