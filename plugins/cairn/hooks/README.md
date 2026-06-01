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
- **Codex:** add the hooks to the project/user `config.toml`, e.g.

  ```toml
  [[hooks.session_start]]
  command = "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh"

  [[hooks.pre_tool_use]]
  command = "node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-guard.mjs"
  ```

## Validation status

The bootstrap content and the script logic are versioned and locally testable
(`node scripts/validate-cairn.mjs`). The exact per-harness stdout contract and matcher
semantics are confirmed empirically on a live harness — Codex first — as the Phase 1 exit
criterion. Treat the I/O format here as the current best mapping, not a settled fact.
