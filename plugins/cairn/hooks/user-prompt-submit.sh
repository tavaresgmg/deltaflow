#!/usr/bin/env bash
# Cairn UserPromptSubmit hook — injects the resume anchor only when active-change state
# appears or changes. It does not inspect prompt text; structural state beats word matching.
set -euo pipefail

# ${CLAUDE_PLUGIN_ROOT} is the cross-harness root var. Claude sets it natively; Codex also
# exposes it. Fall back to this script's own parent when unset (local manual runs).
DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
POLICY="$DIR/scripts/cairn-anchor-policy.mjs"
[ -f "$POLICY" ] || exit 0

HOOK_INPUT="$(cat || true)"

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  printf '%s' "$HOOK_INPUT" | node "$POLICY" --emit=claude 2>/dev/null || true
else
  printf '%s' "$HOOK_INPUT" | node "$POLICY" --emit=plain 2>/dev/null || true
fi
