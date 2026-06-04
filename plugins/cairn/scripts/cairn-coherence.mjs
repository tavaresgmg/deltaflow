// Stop hook: if a durable mode was declared without `.cairn/changes/<slug>/`, nudge once.
//   node cairn-coherence.mjs '{"last_assistant_message":"Mode: tracked-change\n...","cwd":"..."}'
import fs from "node:fs";
import path from "node:path";
import { resolveCairnBoundary, hasCairnDir } from "./cairn-workspace.mjs";

const MODE_RE = /^\s*Mode:\s*(tracked-change|delta-spec)\b/im;

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

const name = event.hook_event_name;
if ((name && !/^stop$/i.test(name)) || event.stop_hook_active === true) {
  process.exit(0);
}

const text = lastAssistantText(event);
const cwd = event.cwd || process.cwd();
const boundary = resolveCairnBoundary(cwd);
const root = boundary.cairnStateRoot;
if (!root) process.exit(0);
if (boundary.cairnStateScope === "workspace" && boundary.repoRoot && hasCairnDir(boundary.repoRoot)) {
  process.stderr.write(
    `Cairn coherence: ${path.join(boundary.repoRoot, ".cairn")} is inside a child repo of marked workspace ${root}. ` +
      `Move Cairn state under ${path.join(root, ".cairn")} before closing.\n`,
  );
  process.exit(2);
}

const m = text.match(MODE_RE);
if (!m) process.exit(0);

if (!hasCairnDir(root)) process.exit(0);
if (hasChangeFolder(root)) process.exit(0);

process.stderr.write(
  `Cairn coherence: this turn declared Mode: ${m[1]} but no .cairn/changes/<slug>/ exists under ${root}. ` +
    `Scaffold it before mutating (modes.md), tick tasks.md live — or, if this was read-only/Q&A, ignore and close again.\n`,
);
process.exit(2);
