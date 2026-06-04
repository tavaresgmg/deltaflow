#!/usr/bin/env bash
set -euo pipefail

DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
BOOTSTRAP="$DIR/hooks/bootstrap.md"
[ -f "$BOOTSTRAP" ] || exit 0

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  ANCHOR="$DIR/scripts/cairn-anchor.mjs"
  node -e '
    const fs = require("node:fs");
    const { execFileSync } = require("node:child_process");
    let source = "startup";
    try { source = JSON.parse(fs.readFileSync(0, "utf8")).source || source; } catch {}
    let text = fs.readFileSync(process.argv[1], "utf8");
    if ((source === "compact" || source === "resume") && fs.existsSync(process.argv[2])) {
      try {
        const anchor = execFileSync("node", [process.argv[2]], { encoding: "utf8" });
        if (anchor.trim()) text += "\n\n" + anchor;
      } catch {}
    }
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: text }
    }));
  ' "$BOOTSTRAP" "$ANCHOR"
else
  cat "$BOOTSTRAP"
fi
