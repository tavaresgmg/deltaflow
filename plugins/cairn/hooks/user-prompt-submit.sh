#!/usr/bin/env bash
# Cairn UserPromptSubmit hook — re-injects the resume anchor at the start of each user turn,
# so the active change/tasks survive across turns without relying on model memory (ADR-0003,
# autonomy layer 1). The SessionStart bootstrap already carries routing; this only adds the
# unpredictable live state. Portable across Claude Code and Codex from one script.
set -euo pipefail

# ${CLAUDE_PLUGIN_ROOT} is the cross-harness root var. Claude sets it natively; Codex also
# exposes it. Fall back to this script's own parent when unset (local manual runs).
DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
ANCHOR="$DIR/scripts/cairn-anchor.mjs"
[ -f "$ANCHOR" ] || exit 0

# Emit nothing when there is no active change — cairn-anchor prints empty, so a normal session
# (no .cairn/changes/<slug>/) costs zero tokens per turn. Adoption-gated by that silence.
ANCHOR_TEXT="$(node "$ANCHOR" 2>/dev/null || true)"
[ -n "${ANCHOR_TEXT//[$' \t\r\n']/}" ] || exit 0

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  # Claude Code UserPromptSubmit: JSON with additionalContext (same contract as SessionStart).
  ANCHOR_TEXT="$ANCHOR_TEXT" node -e '
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: process.env.ANCHOR_TEXT }
    }));
  '
else
  # Codex / other: plain text on stdout becomes injected context.
  printf '%s\n' "$ANCHOR_TEXT"
fi
