#!/usr/bin/env bash
# Cairn SessionStart hook — injects the routing bootstrap (Decision 3, autonomy layer 1).
# Portable across Claude Code and Codex from one script. The exact stdout contract per
# harness is verified empirically (see docs/evals/auto-trigger.md), so this stays minimal and
# dependency-free.
set -euo pipefail

# ${CLAUDE_PLUGIN_ROOT} is the cross-harness root var used by this package. Claude sets it
# natively; Codex also exposes it for compatibility. Fall back to this script's own parent
# when unset (e.g. local manual runs).
DIR="${CLAUDE_PLUGIN_ROOT:-"$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"}"
BOOTSTRAP="$DIR/hooks/bootstrap.md"
[ -f "$BOOTSTRAP" ] || exit 0

if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]; then
  # Claude Code SessionStart: emit JSON with additionalContext. node ships with both repos.
  # On compact/resume, append the read-only resume anchor (active change state) so the active
  # route survives compaction. Codex has no equivalent injection; resume there re-reads the
  # on-disk tasks.md/decision-log.md.
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
  # Codex / other: plain text on stdout becomes injected context.
  cat "$BOOTSTRAP"
fi
