// Read-only next-step reporter for a .cairn/changes/<slug> folder.
// It is intentionally small: it reports the next missing artifact or open task, not intent.
//   node cairn-next.mjs .cairn/changes/<slug>
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  process.stderr.write(`change dir not found: ${dir || ""}\n`);
  process.exit(1);
}

const has = (rel) => fs.existsSync(path.join(dir, rel));
const read = (rel) => fs.readFileSync(path.join(dir, rel), "utf8");

function tasks() {
  if (!has("tasks.md")) return [];
  return read("tasks.md")
    .split("\n")
    .map((line, index) => ({ line, index: index + 1 }))
    .filter((item) => /^\s*-\s*\[[ xX]\]/.test(item.line));
}

function next() {
  if (!has("brief.md") && !has("delta.md") && !has("plan.md")) {
    return { code: "CLASSIFY_AND_CAPTURE_INTENT", action: "classify the mode and write brief.md or delta.md if the mode justifies state" };
  }
  if (has("delta.md") && !has("plan.md")) {
    return { code: "WRITE_PLAN", action: "write plan.md for the delta before implementation" };
  }
  if (has("plan.md") && !has("tasks.md")) {
    return { code: "WRITE_TASKS", action: "write tasks.md with one verifiable checkbox per step" };
  }
  const items = tasks();
  const open = items.find((item) => /\[ \]/.test(item.line));
  if (open) {
    return { code: "DO_OPEN_TASK", action: open.line.trim(), file: path.join(dir, "tasks.md"), line: open.index };
  }
  if (items.length > 0 && !has("proof.md")) {
    return { code: "WRITE_PROOF", action: "write proof.md before claiming completion" };
  }
  if (has("proof.md") && /pending final run/i.test(read("proof.md"))) {
    return { code: "RUN_FINAL_PROOF", action: "run final proof and replace pending proof notes" };
  }
  if (has("delta.md")) {
    if (has("proof.md") && /^Lifecycle decision:\s*(sync|delegate|archive|delete)\b/im.test(read("proof.md"))) {
      return { code: "READY_TO_CLOSE", action: "review proof, residual risk, and close the work" };
    }
    return { code: "LIFECYCLE_DECISION", action: "sync durable behavior to .cairn/specs, delegate to existing spec system, archive, or delete transient planning" };
  }
  return { code: "READY_TO_CLOSE", action: "review proof, residual risk, and close the work" };
}

process.stdout.write(JSON.stringify({ changeDir: dir, next: next() }, null, 2) + "\n");
