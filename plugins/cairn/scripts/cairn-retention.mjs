// Retention reporter/apply helper for .cairn/changes.
// Default is read-only:
//   node cairn-retention.mjs .cairn/changes
// Apply only deterministic completed-change cleanup:
//   node cairn-retention.mjs .cairn/changes --apply --slug <slug>
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
let changesRoot = ".cairn/changes";
let apply = false;
let applyAll = false;
let slugFilter = null;
let allowDelete = false;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--apply") {
    apply = true;
  } else if (arg === "--all") {
    applyAll = true;
  } else if (arg === "--slug") {
    slugFilter = args[i + 1];
    i += 1;
  } else if (arg === "--delete") {
    allowDelete = true;
  } else if (!arg.startsWith("--")) {
    changesRoot = arg;
  } else {
    process.stderr.write(`unknown arg: ${arg}\n`);
    process.exit(2);
  }
}

if (apply && !applyAll && !slugFilter) {
  process.stderr.write("--apply requires --slug <slug> or --all\n");
  process.exit(2);
}

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

function applyOne(change) {
  if (!change.completed) return { slug: change.slug, applied: false, error: "change is incomplete" };
  if (change.action === "needs-lifecycle-decision") {
    return { slug: change.slug, applied: false, error: "missing lifecycle decision" };
  }
  if (change.action === "keep-active") return { slug: change.slug, applied: false, error: "no retention action" };
  if (change.action === "delete" && !allowDelete) {
    return { slug: change.slug, applied: false, error: "delete requires explicit --delete" };
  }
  if (change.action === "delete") {
    fs.rmSync(change.path, { recursive: true, force: false });
    return { slug: change.slug, applied: true, action: "delete" };
  }
  if (change.action === "archive") {
    if (change.archiveTargetExists) return { slug: change.slug, applied: false, error: `archive target exists: ${change.archiveTarget}` };
    fs.mkdirSync(path.dirname(change.archiveTarget), { recursive: true });
    fs.renameSync(change.path, change.archiveTarget);
    return { slug: change.slug, applied: true, action: "archive", target: change.archiveTarget };
  }
  return { slug: change.slug, applied: false, error: `unsupported action: ${change.action}` };
}

const changes = activeChangeDirs(changesRoot).map(reportOne);
const actionable = changes.filter((change) => change.action !== "keep-active");
let applied = [];

if (apply) {
  const targets = changes.filter((change) => applyAll || change.slug === slugFilter);
  if (!targets.length) {
    process.stderr.write(slugFilter ? `no active change found for slug: ${slugFilter}\n` : "no active changes found\n");
    process.exit(1);
  }
  applied = targets.map(applyOne);
}

const afterChanges = apply ? activeChangeDirs(changesRoot).map(reportOne) : changes;
const afterActionable = afterChanges.filter((change) => change.action !== "keep-active");

process.stdout.write(JSON.stringify({
  changesRoot,
  archiveRoot: path.join(changesRoot, "archive"),
  changes: afterChanges,
  actionable: afterActionable,
  ...(apply ? { applied } : {}),
}, null, 2) + "\n");

if (applied.some((item) => !item.applied)) process.exit(1);
