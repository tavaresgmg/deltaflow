// Read-only consistency check over a .cairn/changes/<slug>/ folder (Spec Kit-style /analyze,
// Phase 4). Reports internal drift without judging intent. Prints JSON; exit 0 always.
//   node cairn-analyze.mjs .cairn/changes/<slug>
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir || !fs.existsSync(dir)) {
  process.stderr.write(`change dir not found: ${dir}\n`);
  process.exit(1);
}
const has = (f) => fs.existsSync(path.join(dir, f));
const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");

const findings = [];
if (has("delta.md") && !has("plan.md")) findings.push("delta.md without plan.md");
if (has("plan.md") && !has("tasks.md")) findings.push("plan.md without tasks.md");

if (has("tasks.md")) {
  const items = read("tasks.md")
    .split("\n")
    .filter((l) => /^\s*-\s*\[[ xX]\]/.test(l));
  const done = items.filter((l) => /\[[xX]\]/.test(l));
  const open = items.filter((l) => /\[ \]/.test(l));
  if (items.length === 0) findings.push("tasks.md has no checkbox items");
  if (done.length > 0 && !has("proof.md")) findings.push("tasks marked done but no proof.md");
  for (const l of done) {
    if (!/proof:/i.test(l)) findings.push(`done task lacks inline proof note: ${l.trim()}`);
  }
  if (open.length === 0 && done.length > 0 && !has("proof.md")) {
    findings.push("all tasks done but proof.md missing");
  }
}

const out = { changeDir: dir, ok: findings.length === 0, findings };
process.stdout.write(JSON.stringify(out, null, 2) + "\n");
