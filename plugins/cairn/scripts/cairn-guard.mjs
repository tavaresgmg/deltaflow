// Deterministic mutation-boundary gate (ADR-0005, Phase 4). Used as a PreToolUse hook:
// blocks file mutations whose target is outside the active repo (the #1 multi-repo footgun).
// Reads the harness tool event as JSON on stdin (or argv[2] for testing); exit 2 = block.
//   node cairn-guard.mjs '{"tool_name":"Edit","tool_input":{"file_path":"..."},"cwd":"..."}'
// Override with CAIRN_ALLOW_CROSS_REPO=1.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const MUTATORS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit", "apply_patch"]);

function repoRoot(cwd) {
  try {
    return execSync("git rev-parse --show-toplevel", {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function decide(event) {
  if (!MUTATORS.has(event.tool_name)) return { allow: true };
  const files = targetFiles(event);
  if (!files.length) return { allow: true };
  if (process.env.CAIRN_ALLOW_CROSS_REPO === "1") return { allow: true };
  const cwd = event.cwd || process.cwd();
  const root = repoRoot(cwd);
  if (!root) return { allow: true }; // not in a repo — nothing to guard
  for (const file of files) {
    const abs = path.resolve(cwd, file);
    const rel = path.relative(root, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) {
      return {
        allow: false,
        reason: `Cairn boundary guard: ${abs} is outside the active repo (${root}). Confirm the target repo, or set CAIRN_ALLOW_CROSS_REPO=1 to override.`,
      };
    }
  }
  return { allow: true };
}

function targetFiles(event) {
  const input = event.tool_input || {};
  const direct = [
    input.file_path,
    input.notebook_path,
    input.path,
  ].filter(Boolean);
  const patch = input.patch || input.content || input.input || "";
  if (typeof patch !== "string") return direct;
  const patchFiles = [];
  for (const line of patch.split("\n")) {
    const m = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/)
      || line.match(/^\*\*\* Move to: (.+)$/);
    if (m) patchFiles.push(m[1].trim());
  }
  return [...direct, ...patchFiles];
}

const raw = process.argv[2] ?? fs.readFileSync(0, "utf8");
let event = {};
try {
  event = JSON.parse(raw || "{}");
} catch {
  event = {};
}
const d = decide(event);
if (!d.allow) {
  process.stderr.write(d.reason + "\n");
  process.exit(2);
}
process.exit(0);
