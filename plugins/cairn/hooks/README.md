# Cairn hooks

Autonomy layer 1 (ADR-0003): a single `SessionStart` hook injects `bootstrap.md` so the
agent routes through Cairn before responding — no need to invoke the skill by name.

- `bootstrap.md` — the injected context (kept under ~2k tokens).
- `session-start.sh` — harness-detecting emitter. Uses `${CLAUDE_PLUGIN_ROOT}` (the
  portable plugin-root var). On Claude it emits `SessionStart` `additionalContext` JSON;
  elsewhere (Codex) it emits plain text.

## Registration

- **Claude Code:** `hooks.json` is discovered automatically when the plugin is installed.
- **Codex:** add the hook to the project/user `config.toml`, e.g.

  ```toml
  [[hooks.session_start]]
  command = "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"
  ```

## Validation status

The bootstrap content and the script logic are versioned and locally testable
(`node scripts/validate-cairn.mjs`). The exact per-harness stdout contract and matcher
semantics are confirmed empirically on a live harness — Codex first — as the Phase 1 exit
criterion. Treat the I/O format here as the current best mapping, not a settled fact.
