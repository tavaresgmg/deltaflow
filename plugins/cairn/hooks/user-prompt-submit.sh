#!/usr/bin/env bash
set -euo pipefail

DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
ANCHOR="$DIR/scripts/cairn-anchor.mjs"
[ -f "$ANCHOR" ] || exit 0

HOOK_INPUT="$(cat || true)"

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  printf '%s' "$HOOK_INPUT" | node "$ANCHOR" --emit=claude 2>/dev/null || true
else
  printf '%s' "$HOOK_INPUT" | node "$ANCHOR" --emit=plain 2>/dev/null || true
fi
