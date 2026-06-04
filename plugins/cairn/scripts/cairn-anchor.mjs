import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const emitArg = args.find((arg) => arg.startsWith("--emit="));
const emitMode = emitArg ? emitArg.slice("--emit=".length) : null;
const MAX_OPEN_TASKS = 5;
const MAX_LINE_CHARS = 140;
const MIN_PROMPT_GAP = 3;

function trimLine(text) {
  return text.length > MAX_LINE_CHARS ? text.slice(0, MAX_LINE_CHARS - 1) + "…" : text;
}

export function repoRoot(cwd = process.cwd()) {
  try {
    return execSync("git rev-parse --show-toplevel", { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString().trim();
  } catch {
    return cwd;
  }
}

function taskLines(dir) {
  const file = path.join(dir, "tasks.md");
  if (!fs.existsSync(file)) return { open: [], done: 0, total: 0 };
  const items = fs.readFileSync(file, "utf8").split("\n").filter((l) => /^\s*-\s*\[[ xX]\]/.test(l));
  const open = items.filter((l) => /\[ \]/.test(l)).map((l) => l.trim());
  return { open, done: items.length - open.length, total: items.length };
}

export function renderAnchor(anchor) {
  if (!anchor) return "";
  const lines = [
    "## Cairn resume anchor",
    `Active change: ${anchor.slug} (${anchor.tasks.done}/${anchor.tasks.total} tasks done)`,
  ];
  if (anchor.tasks.open.length) {
    lines.push("Open tasks (resume here):", ...anchor.tasks.open.slice(0, MAX_OPEN_TASKS).map(trimLine));
    const omitted = anchor.tasks.open.length - MAX_OPEN_TASKS;
    if (omitted > 0) lines.push(`Open tasks omitted: ${omitted}`);
  }
  if (anchor.decisions.length) {
    lines.push("Recent decisions:", ...anchor.decisions.map((d) => `- ${trimLine(d)}`));
  }
  lines.push("Re-read tasks.md and the decision-log tail before acting.");
  return lines.join("\n") + "\n";
}

export function buildAnchor({ root = repoRoot(), changesRoot = path.join(root, ".cairn/changes") } = {}) {
  const change = activeChange(changesRoot);
  return change
    ? { slug: change.slug, tasks: taskLines(change.abs), decisions: recentDecisions(root) }
    : null;
}

function activeChange(changesRoot) {
  if (!fs.existsSync(changesRoot)) return null;
  const dirs = fs.readdirSync(changesRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "archive")
    .map((e) => {
      const abs = path.join(changesRoot, e.name);
      return { slug: e.name, abs, mtime: fs.statSync(abs).mtimeMs };
    });
  if (!dirs.length) return null;
  return dirs.sort((a, b) => b.mtime - a.mtime)[0];
}

function recentDecisions(root, n = 3) {
  const file = path.join(root, ".cairn/decision-log.md");
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, "utf8").split("\n").map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .slice(-n);
}

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function parseInput(text) {
  try {
    return text.trim() ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function sha(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function cachePath(input) {
  const cwd = input.cwd || process.cwd();
  const session = input.session_id || `cwd:${cwd}`;
  return path.join(os.tmpdir(), "cairn-anchor", `${sha(`${session}\0${cwd}`).slice(0, 32)}.json`);
}

function activeSlug(anchorText) {
  return anchorText.match(/^Active change:\s+(\S+)/m)?.[1] || "unknown";
}

function writePolicyResult(result) {
  if (emitMode === "plain") {
    if (result.emit) process.stdout.write(result.context);
    return;
  }
  if (emitMode === "claude") {
    if (result.emit) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: result.context },
      }));
    }
    return;
  }
  process.stdout.write(JSON.stringify(result) + "\n");
}

function runPromptAnchorPolicy() {
  const input = parseInput(readStdin());
  const root = repoRoot(input.cwd || process.cwd());
  const text = renderAnchor(buildAnchor({ root }));
  const file = cachePath(input);

  if (!text.trim()) {
    try {
      fs.rmSync(file, { force: true });
    } catch {}
    writePolicyResult({ emit: false, reason: "inactive" });
    return;
  }

  const slug = activeSlug(text);
  const hash = sha(text);

  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {}

  const emittedHash = previous?.emittedHash || previous?.hash || null;
  const turnsSinceEmit = Number.isInteger(previous?.turnsSinceEmit)
    ? previous.turnsSinceEmit + 1
    : 0;
  const firstAnchor = !previous || !emittedHash;
  const switchedSlug = previous?.slug && previous.slug !== slug;
  const unchanged = previous?.slug === slug && emittedHash === hash;
  const shouldEmit = firstAnchor || switchedSlug || (!unchanged && turnsSinceEmit >= MIN_PROMPT_GAP);

  function remember(state) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({
      slug,
      emittedHash: state.emittedHash,
      turnsSinceEmit: state.turnsSinceEmit,
      updatedAt: new Date().toISOString(),
    }) + "\n");
  }

  if (!shouldEmit) {
    remember({ emittedHash, turnsSinceEmit });
    writePolicyResult({
      emit: false,
      reason: unchanged ? "unchanged" : "paced",
      slug,
      hash,
      emittedHash,
      turnsSinceEmit,
    });
    return;
  }

  remember({ emittedHash: hash, turnsSinceEmit: 0 });
  writePolicyResult({
    emit: true,
    reason: firstAnchor ? "active" : switchedSlug ? "active-change-switched" : "prompt-gap",
    slug,
    hash,
    context: text,
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (emitMode) {
    runPromptAnchorPolicy();
    process.exit(0);
  }

  const root = repoRoot();
  process.stdout.write(renderAnchor(buildAnchor({ root })));
}
