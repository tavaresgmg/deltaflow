// UserPromptSubmit anchor policy. It deliberately ignores the prompt text: text matching is
// advisory at best, while active-change state and anchor hash are structural signals.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildAnchor, renderAnchor, repoRoot } from "./cairn-anchor.mjs";

const emitArg = process.argv.find((arg) => arg.startsWith("--emit="));
const emitMode = emitArg ? emitArg.slice("--emit=".length) : "json";

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

function cacheDir() {
  return process.env.CAIRN_ANCHOR_STATE_DIR || path.join(os.tmpdir(), "cairn-anchor-policy");
}

function cachePath(input) {
  const cwd = input.cwd || process.cwd();
  const session = input.session_id || `cwd:${cwd}`;
  return path.join(cacheDir(), `${sha(`${session}\0${cwd}`).slice(0, 32)}.json`);
}

function activeSlug(anchorText) {
  return anchorText.match(/^Active change:\s+(\S+)/m)?.[1] || "unknown";
}

const input = parseInput(readStdin());
const root = repoRoot(input.cwd || process.cwd());
const text = renderAnchor(buildAnchor({ root }));

function writeResult(result) {
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

if (!text.trim()) {
  writeResult({ emit: false, reason: "inactive" });
  process.exit(0);
}

const slug = activeSlug(text);
const hash = sha(text);
const file = cachePath(input);

let previous = null;
try {
  previous = JSON.parse(fs.readFileSync(file, "utf8"));
} catch {}

if (previous?.slug === slug && previous?.hash === hash) {
  writeResult({ emit: false, reason: "unchanged", slug, hash });
  process.exit(0);
}

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify({ slug, hash, updatedAt: new Date().toISOString() }) + "\n");
writeResult({ emit: true, slug, hash, context: text });
