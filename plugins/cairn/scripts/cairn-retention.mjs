// Read-only retention reporter for .cairn/changes.
// Prints JSON with completed active changes and their next retention action.
//   node cairn-retention.mjs .cairn/changes
import fs from "node:fs";
import path from "node:path";

const changesRoot = process.argv[2] || ".cairn/changes";

if (!fs.existsSync(changesRoot)) {
  process.stderr.write(`changes root not found: ${changesRoot}\n`);
  process.exit(1);
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function has(dir, rel) {
  return fs.existsSync(path.join(dir, rel));
}

function taskStats(dir) {
  if (!has(dir, "tasks.md")) return { tasks: 0, done: 0, open: 0 };
  const items = read(path.join(dir, "tasks.md"))
    .split("\n")
    .filter((line) => /^\s*-\s*\[[ xX]\]/.test(line));
  return {
    tasks: items.length,
    done: items.filter((line) => /\[[xX]\]/.test(line)).length,
    open: items.filter((line) => /\[ \]/.test(line)).length,
  };
}

function lifecycleDecision(dir) {
  if (!has(dir, "proof.md")) return null;
  const proof = read(path.join(dir, "proof.md"));
  const m = proof.match(/^Lifecycle decision:\s*(sync|delegate|archive|delete)\b\s*(?:[—-]\s*(.*))?$/im);
  if (!m) return null;
  return { type: m[1].toLowerCase(), detail: (m[2] || "").trim() };
}

function activeChangeDirs(root) {
  return fs.readdirSync(root, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && ent.name !== "archive")
    .map((ent) => path.join(root, ent.name));
}

function archiveTarget(root, slug) {
  const day = new Date().toISOString().slice(0, 10);
  return path.join(root, "archive", `${day}-${slug}`);
}

function reportOne(dir) {
  const slug = path.basename(dir);
  const stats = taskStats(dir);
  const decision = lifecycleDecision(dir);
  const completed = stats.tasks > 0 && stats.open === 0;
  const target = archiveTarget(changesRoot, slug);

  let action = "keep-active";
  let reason = "work is not complete";
  if (completed && !decision) {
    action = "needs-lifecycle-decision";
    reason = "completed change has no explicit lifecycle decision";
  } else if (completed && decision?.type === "delete") {
    action = "delete";
    reason = "proof lifecycle decision says delete transient planning";
  } else if (completed && decision) {
    action = "archive";
    reason = `proof lifecycle decision says ${decision.type}`;
  }

  return {
    slug,
    path: dir,
    completed,
    stats,
    lifecycleDecision: decision,
    action,
    reason,
    ...(action === "archive" ? { archiveTarget: target, archiveTargetExists: fs.existsSync(target) } : {}),
  };
}

const changes = activeChangeDirs(changesRoot).map(reportOne);
const actionable = changes.filter((change) => change.action !== "keep-active");

process.stdout.write(JSON.stringify({
  changesRoot,
  archiveRoot: path.join(changesRoot, "archive"),
  changes,
  actionable,
}, null, 2) + "\n");
