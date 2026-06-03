# Cairn hooks

Autonomy layer 1 (ADR-0003): a single `SessionStart` hook injects `bootstrap.md` so the
agent routes through Cairn before responding — no need to invoke the skill by name.

- `bootstrap.md` — the injected context (kept compact and budgeted).
- `session-start.sh` — harness-detecting emitter. Uses `${CLAUDE_PLUGIN_ROOT}` as the
  cross-harness root var. Claude sets it natively; Codex has native `${PLUGIN_ROOT}` and
  also exposes `${CLAUDE_PLUGIN_ROOT}` for compatibility. On Claude it emits `SessionStart`
  `additionalContext` JSON; elsewhere (Codex) it emits plain text.

Autonomy layer 1 (state-change): a `UserPromptSubmit` hook runs `user-prompt-submit.sh`, which
uses `cairn-anchor-policy.mjs` to inject the resume anchor only when active-change state appears
or changes. It ignores prompt text: no regex or keyword matching is used for runtime policy.
Silent (exit 0, zero tokens) when no `.cairn/changes/<slug>/` is active or the same anchor was
already emitted for the session. Same emitter contract as `session-start.sh`: Claude emits
`additionalContext` JSON; Codex/other emits plain stdout.

Autonomy layer 3 (ADR-0003): a `PreToolUse` hook runs `scripts/cairn-guard.mjs`
on file-mutating tools and blocks (exit 2) writes outside the active repo. Logic is
harness-neutral and unit-tested; see `skills/cairn/references/gates.md`.

## Registration

- **Claude Code:** `hooks.json` is discovered automatically when the plugin is installed
  (both `SessionStart` and `PreToolUse`).
- **Codex:** installed/enabled plugins can bundle lifecycle hooks through the default
  `hooks/hooks.json` path. Non-managed hooks still require review/trust in `/hooks`;
  automation can use `--dangerously-bypass-hook-trust` only after the hook source is
  externally vetted.

  If you wire hooks manually instead of using the plugin bundle, use the current Codex
  TOML shape:

  ```toml
  [[hooks.SessionStart]]
  matcher = "startup|resume|clear|compact"

  [[hooks.SessionStart.hooks]]
  type = "command"
  command = "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"

  [[hooks.PreToolUse]]
  matcher = "Edit|Write|MultiEdit|NotebookEdit|apply_patch"

  [[hooks.PreToolUse.hooks]]
  type = "command"
  command = "node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-guard.mjs"
  ```

## Validation status

The bootstrap content and the script logic are versioned and locally testable
(`node scripts/validate-cairn.mjs`), including smoke tests of both `user-prompt-submit.sh`
branches, silent-when-idle behavior, dedupe, and re-emission after anchor changes. Claude Code live hook behavior is confirmed.
Codex `SessionStart`/`Stop` behavior is confirmed through evals.

Codex `PreToolUse` guard delivery remains an explicit live-harness gap. Upstream has since fixed
`apply_patch` hook emission (openai/codex PR #18391) and current Codex docs list `apply_patch` as a
`PreToolUse` target, but local runtime delivery via the installed plugin is not yet confirmed — so
do not claim Codex mutation-guard parity until an interactive run shows the guard firing. (Note: the
Codex hook system is enabled by the `hooks` feature flag and reads the plugin-bundled `hooks.json`;
inline `[[hooks.PreToolUse]]` in a `config.toml` conflicts with the `hooks = true` flag.)
