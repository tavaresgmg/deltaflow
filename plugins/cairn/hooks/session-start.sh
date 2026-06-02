#!/usr/bin/env bash
# Cairn SessionStart hook — injects the routing bootstrap (ADR-0003, autonomy layer 1).
# Portable across Claude Code and Codex from one script. The exact stdout contract per
# harness is verified empirically (Phase 1 exit), so this stays minimal and dependency-free.
set -euo pipefail

# ${CLAUDE_PLUGIN_ROOT} is the cross-harness root var used by this package. Claude sets it
# natively; Codex also exposes it for compatibility. Fall back to this script's own parent
# when unset (e.g. local manual runs).
DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
BOOTSTRAP="$DIR/hooks/bootstrap.md"
[ -f "$BOOTSTRAP" ] || exit 0

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  # Claude Code SessionStart: emit JSON with additionalContext. node ships with both repos.
  node -e '
    const fs = require("node:fs");
    const text = fs.readFileSync(process.argv[1], "utf8");
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text }
    }));
  ' "$BOOTSTRAP"
else
  # Codex / other: plain text on stdout becomes injected context.
  cat "$BOOTSTRAP"
fi
