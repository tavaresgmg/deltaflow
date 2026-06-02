# Cairn hooks

Autonomy layer 1 (ADR-0003): a single `SessionStart` hook injects `bootstrap.md` so the
agent routes through Cairn before responding — no need to invoke the skill by name.

- `bootstrap.md` — the injected context (kept under ~2k tokens).
- `session-start.sh` — harness-detecting emitter. Uses `${CLAUDE_PLUGIN_ROOT}` (the
  portable plugin-root var). On Claude it emits `SessionStart` `additionalContext` JSON;
  elsewhere (Codex) it emits plain text.

Autonomy layer 3 (ADR-0003, Phase 4): a `PreToolUse` hook runs `scripts/cairn-guard.mjs`
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
(`node scripts/validate-cairn.mjs`). Claude Code live hook behavior is confirmed.
Codex `SessionStart` behavior is confirmed through evals, but `PreToolUse` guard
behavior remains an explicit live-harness gap: Codex CLI v0.136.0 `exec` file changes did
not trigger a captured `PreToolUse` event in local smoke, so do not claim Codex mutation
guard parity until that changes.
