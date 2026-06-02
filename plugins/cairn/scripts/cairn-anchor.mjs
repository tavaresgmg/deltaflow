// Read-only resume anchor for long-context survival. Emits a compact, schema-fixed summary
// of the active change so it can be re-injected after compaction/resume (the SessionStart
// hook appends it when source is "compact" or "resume"). Concise by design (Principle 8):
// active change, open tasks, recent decisions — the unpredictable state, nothing the model
// can reconstruct for free.
//
//   node cairn-anchor.mjs [--json] [--changes <dir>]
// Prints nothing (exit 0) when there is no active change, so the hook injects no noise.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const changesArgIdx = args.findIndex((a) => a === "--changes");

function repoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", { cwd: process.cwd(), stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim();
  } catch {
    return process.cwd();
  }
}

const root = repoRoot();
const changesRoot = changesArgIdx >= 0 ? path.resolve(args[changesArgIdx + 1]) : path.join(root, ".cairn/changes");

function activeChange() {
  if (!fs.existsSync(changesRoot)) return null;
  const dirs = fs.readdirSync(changesRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "archive")
    .map((e) => {
      const abs = path.join(changesRoot, e.name);
      return { slug: e.name, abs, mtime: fs.statSync(abs).mtimeMs };
    });
  if (!dirs.length) return null;
  // Most recently touched active change is the one a resumed session cares about.
  return dirs.sort((a, b) => b.mtime - a.mtime)[0];
}

function taskLines(dir) {
  const file = path.join(dir, "tasks.md");
  if (!fs.existsSync(file)) return { open: [], done: 0, total: 0 };
  const items = fs.readFileSync(file, "utf8").split("\n").filter((l) => /^\s*-\s*\[[ xX]\]/.test(l));
  const open = items.filter((l) => /\[ \]/.test(l)).map((l) => l.trim());
  return { open, done: items.length - open.length, total: items.length };
}

function recentDecisions(n = 3) {
  const file = path.join(root, ".cairn/decision-log.md");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .slice(-n);
}

const change = activeChange();
const anchor = change
  ? { slug: change.slug, tasks: taskLines(change.abs), decisions: recentDecisions() }
  : null;

if (asJson) {
  process.stdout.write(JSON.stringify({ active: Boolean(anchor), anchor }, null, 2) + "\n");
} else if (anchor) {
  const lines = [
    "## Cairn resume anchor",
    `Active change: ${anchor.slug} (${anchor.tasks.done}/${anchor.tasks.total} tasks done)`,
  ];
  if (anchor.tasks.open.length) {
    lines.push("Open tasks (resume here):", ...anchor.tasks.open);
  }
  if (anchor.decisions.length) {
    const trim = (d) => (d.length > 140 ? d.slice(0, 139) + "…" : d);
    lines.push("Recent decisions:", ...anchor.decisions.map((d) => `- ${trim(d)}`));
  }
  lines.push("Re-read tasks.md and the decision-log tail before acting.");
  process.stdout.write(lines.join("\n") + "\n");
}
