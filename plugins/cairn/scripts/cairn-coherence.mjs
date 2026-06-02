// End-of-turn coherence check (Phase 16). Used as a Stop hook on both Codex and Claude Code:
// if the turn declared `Mode: tracked-change|delta-spec` but no `.cairn/changes/<slug>/`
// folder exists under the repo, surface a one-shot corrective (exit 2 + stderr) so the agent
// scaffolds before closing — the deterministic signal gates.md reserved. Never a hard gate:
// guarded by stop_hook_active so it nudges once, then lets the turn close.
// Blast-radius gate: a Stop hook fires in every session on every project. To avoid nagging
// unrelated repos, it stays silent unless the repo has ALREADY adopted Cairn (a `.cairn/` dir
// exists). A brand-new repo's first change is covered by the prose contract, not this hook.
//   node cairn-coherence.mjs '{"last_assistant_message":"Mode: tracked-change\n...","cwd":"..."}'
// Reads the harness Stop event as JSON on stdin (or argv[2] for testing). Exit 2 = block-once.
import fs from "node:fs";
import path from "node:path";
import { resolveCairnBoundary } from "./cairn-workspace.mjs";

// Only these two modes contract a durable change folder (modes.md). direct/diagnose/discovery
// do not, so declaring them must never trip the check.
const MODE_RE = /^\s*Mode:\s*(tracked-change|delta-spec)\b/im;

// Has the repo adopted Cairn? A `.cairn/` dir means specs/changes/decision-log live here, so a
// declared mode without a change folder is a real gap. No `.cairn/` = don't nag this project.
function hasCairnDir(root) {
  try {
    return fs.statSync(path.join(root, ".cairn")).isDirectory();
  } catch {
    return false;
  }
}

// A non-empty change folder = any directory under .cairn/changes/ other than archive/.
function hasChangeFolder(root) {
  const dir = path.join(root, ".cairn", "changes");
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return false;
  }
  return entries.some((e) => e.isDirectory() && e.name !== "archive");
}

// Codex Stop delivers last_assistant_message directly. Claude Code delivers transcript_path
// (JSONL); tail it for the last assistant turn. Best-effort: degrade to "" when unreadable.
function lastAssistantText(event) {
  if (typeof event.last_assistant_message === "string" && event.last_assistant_message) {
    return event.last_assistant_message;
  }
  const tpath = event.transcript_path;
  if (typeof tpath !== "string" || !tpath) return "";
  let raw;
  try {
    raw = fs.readFileSync(tpath, "utf8");
  } catch {
    return "";
  }
  const lines = raw.split("\n").filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    let row;
    try {
      row = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    const msg = row.message || row;
    const role = row.type || msg.role;
    if (role !== "assistant") continue;
    const content = msg.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      const text = content
        .filter((p) => p && (p.type === "text" || typeof p.text === "string"))
        .map((p) => p.text || "")
        .join("\n");
      if (text) return text;
    }
  }
  return "";
}

const raw = process.argv[2] ?? fs.readFileSync(0, "utf8");
let event = {};
try {
  event = JSON.parse(raw || "{}");
} catch {
  event = {};
}

// Defensive: only act on Stop; never loop (stop_hook_active is set on a stop-induced continue).
const name = event.hook_event_name;
if ((name && !/^stop$/i.test(name)) || event.stop_hook_active === true) {
  process.exit(0);
}

const text = lastAssistantText(event);
const cwd = event.cwd || process.cwd();
const boundary = resolveCairnBoundary(cwd);
const root = boundary.cairnStateRoot;
if (!root) process.exit(0); // not in a repo/workspace — nothing to check
if (boundary.cairnStateScope === "workspace" && boundary.repoRoot && hasCairnDir(boundary.repoRoot)) {
  process.stderr.write(
    `Cairn coherence: ${path.join(boundary.repoRoot, ".cairn")} is inside a child repo of marked workspace ${root}. ` +
      `Move Cairn state under ${path.join(root, ".cairn")} before closing.\n`,
  );
  process.exit(2);
}

const m = text.match(MODE_RE);
if (!m) process.exit(0);

if (!hasCairnDir(root)) process.exit(0); // project hasn't adopted Cairn — don't nag unrelated projects
if (hasChangeFolder(root)) process.exit(0);

process.stderr.write(
  `Cairn coherence: this turn declared Mode: ${m[1]} but no .cairn/changes/<slug>/ exists under ${root}. ` +
    `Scaffold it before mutating (modes.md), tick tasks.md live — or, if this was read-only/Q&A, ignore and close again.\n`,
);
process.exit(2);
