// Read-only consistency check over Cairn state (Spec Kit-style /analyze, but lighter).
// Prints JSON; exit 0 when analysis succeeds, even when findings exist.
//   node cairn-analyze.mjs .cairn/changes/<slug>
//   node cairn-analyze.mjs --all .cairn/changes
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const all = args.includes("--all");
const specRootArg = args.findIndex((a) => a === "--spec-root");
const specRoot = specRootArg >= 0 ? args[specRootArg + 1] : ".cairn/specs";
const target = args.filter((a, i) => {
  if (a === "--all") return false;
  if (specRootArg >= 0 && (i === specRootArg || i === specRootArg + 1)) return false;
  return true;
})[0];

if (!target || !fs.existsSync(target)) {
  process.stderr.write(`change dir not found: ${target || ""}\n`);
  process.exit(1);
}

function repoRoot() {
  try {
    return execSync("git rev-parse --show-toplevel", {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
  } catch {
    return process.cwd();
  }
}

const root = repoRoot();

function finding(severity, code, message, file = null) {
  return { severity, code, message, ...(file ? { file } : {}) };
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function has(dir, rel) {
  return fs.existsSync(path.join(dir, rel));
}

function textHasMeaningfulContent(text) {
  const stripped = text
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n")
    .trim();
  return stripped.length > 0 && !/^pending\b/i.test(stripped.replace(/[-*\s]+/g, ""));
}

function taskStats(dir) {
  if (!has(dir, "tasks.md")) return null;
  const items = read(path.join(dir, "tasks.md"))
    .split("\n")
    .filter((l) => /^\s*-\s*\[[ xX]\]/.test(l));
  return {
    items,
    done: items.filter((l) => /\[[xX]\]/.test(l)),
    open: items.filter((l) => /\[ \]/.test(l)),
  };
}

function referencedPaths(markdown) {
  const refs = new Set();
  const re = /`([^`]+)`/g;
  let m;
  while ((m = re.exec(markdown))) {
    const value = m[1].trim();
    if (!value || value.startsWith("http")) continue;
    if (value.includes(" ") || value.includes("<") || value.includes(">")) continue;
    if (!path.isAbsolute(value) && !value.startsWith("./") && !value.startsWith("../") && !value.includes("/")) continue;
    if (/[*?[\]{}]/.test(value)) continue;
    refs.add(value);
  }
  return [...refs];
}

function section(markdown, title) {
  const lines = markdown.split("\n");
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${title}\\s*$`, "i").test(line.trim()));
  if (start < 0) return "";
  const out = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line)) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

function semanticClaims(markdown) {
  const body = section(markdown, "Semantic Claims");
  if (!body) return [];
  return body
    .split("\n")
    .map((line, index) => ({ line: line.trim(), index }))
    .filter((item) => item.line.startsWith("- "))
    .map((item) => {
      const text = item.line.slice(2).trim();
      const code = [...text.matchAll(/code:\s*`([^`]+)`/gi)].map((m) => m[1].trim());
      const proof = [...text.matchAll(/proof:\s*`([^`]+)`/gi)].map((m) => m[1].trim());
      return { text, code, proof, index: item.index };
    });
}

function analyzeOne(dir) {
  const abs = path.resolve(dir);
  const findings = [];

  if (has(abs, "delta.md") && !has(abs, "plan.md")) {
    findings.push(finding("HIGH", "DELTA_WITHOUT_PLAN", "delta.md exists without plan.md", path.join(abs, "delta.md")));
  }
  if (has(abs, "plan.md") && !has(abs, "tasks.md")) {
    findings.push(finding("HIGH", "PLAN_WITHOUT_TASKS", "plan.md exists without tasks.md", path.join(abs, "plan.md")));
  }

  const stats = taskStats(abs);
  if (stats) {
    if (stats.items.length === 0) {
      findings.push(finding("HIGH", "TASKS_EMPTY", "tasks.md has no checkbox items", path.join(abs, "tasks.md")));
    }
    if (stats.done.length > 0 && !has(abs, "proof.md")) {
      findings.push(finding("HIGH", "DONE_WITHOUT_PROOF", "tasks are marked done but proof.md is missing", path.join(abs, "tasks.md")));
    }
    for (const line of stats.done) {
      if (!/proof:/i.test(line)) {
        findings.push(finding("MEDIUM", "DONE_TASK_LACKS_INLINE_PROOF", `done task lacks inline proof note: ${line.trim()}`, path.join(abs, "tasks.md")));
      }
    }
    if (stats.open.length > 0 && stats.done.length > 0) {
      findings.push(finding("LOW", "MIXED_TASK_STATE", "tasks.md has both completed and open work; resume from open items", path.join(abs, "tasks.md")));
    }
  }

  if (has(abs, "proof.md")) {
    const proof = read(path.join(abs, "proof.md"));
    if (!textHasMeaningfulContent(proof)) {
      findings.push(finding("MEDIUM", "PROOF_EMPTY", "proof.md has no meaningful proof content", path.join(abs, "proof.md")));
    }
    if (/pending final run/i.test(proof)) {
      findings.push(finding("LOW", "PROOF_PENDING", "proof.md still says final proof is pending", path.join(abs, "proof.md")));
    }
  }

  for (const rel of ["plan.md", "delta.md"]) {
    if (!has(abs, rel)) continue;
    const content = read(path.join(abs, rel));
    const refs = referencedPaths(content);
    for (const ref of refs) {
      const targetPath = path.isAbsolute(ref) ? ref : path.join(root, ref);
      if (!fs.existsSync(targetPath)) {
        findings.push(finding("LOW", "REFERENCED_PATH_MISSING", `referenced path does not exist: ${ref}`, path.join(abs, rel)));
      }
    }
    if (rel === "delta.md") {
      for (const claim of semanticClaims(content)) {
        if (claim.code.length === 0) {
          findings.push(finding("HIGH", "SEMANTIC_CLAIM_WITHOUT_CODE", `semantic claim lacks code reference: ${claim.text}`, path.join(abs, rel)));
        }
        if (claim.proof.length === 0) {
          findings.push(finding("MEDIUM", "SEMANTIC_CLAIM_WITHOUT_PROOF", `semantic claim lacks proof command: ${claim.text}`, path.join(abs, rel)));
        }
        for (const ref of claim.code) {
          const targetPath = path.isAbsolute(ref) ? ref : path.join(root, ref);
          if (!fs.existsSync(targetPath)) {
            findings.push(finding("HIGH", "SEMANTIC_REF_MISSING", `semantic claim references missing code: ${ref}`, path.join(abs, rel)));
          }
        }
      }
    }
  }

  const allDone = stats && stats.items.length > 0 && stats.open.length === 0;
  if (allDone && has(abs, "delta.md")) {
    const proof = has(abs, "proof.md") ? read(path.join(abs, "proof.md")) : "";
    if (!/^Lifecycle decision:\s*(sync|delegate|archive|delete)\b/im.test(proof)) {
      findings.push(finding(
        "MEDIUM",
        "DONE_DELTA_WITHOUT_LIFECYCLE_DECISION",
        "all tasks are done for a delta change, but proof.md has no explicit Lifecycle decision: sync|delegate|archive|delete",
        path.join(abs, "delta.md"),
      ));
    }
  }

  if (has(abs, "delta.md") && !fs.existsSync(path.resolve(root, specRoot))) {
    findings.push(finding("LOW", "SPEC_ROOT_MISSING", `spec root does not exist: ${specRoot}`, specRoot));
  }

  const activeAgeDays = Math.floor((Date.now() - fs.statSync(abs).mtimeMs) / 86400000);
  if (activeAgeDays >= 14 && stats?.open?.length) {
    findings.push(finding("LOW", "STALE_ACTIVE_CHANGE", `active change has open tasks and is ${activeAgeDays} days old`, abs));
  }

  return {
    changeDir: dir,
    ok: !findings.some((f) => ["CRITICAL", "HIGH"].includes(f.severity)),
    findings,
    stats: stats ? { tasks: stats.items.length, done: stats.done.length, open: stats.open.length } : { tasks: 0, done: 0, open: 0 },
  };
}

function activeChangeDirs(changesRoot) {
  return fs.readdirSync(changesRoot, { withFileTypes: true })
    .filter((ent) => ent.isDirectory() && ent.name !== "archive")
    .map((ent) => path.join(changesRoot, ent.name));
}

if (all) {
  const changes = activeChangeDirs(target).map(analyzeOne);
  const findings = changes.flatMap((c) => c.findings.map((f) => ({ changeDir: c.changeDir, ...f })));
  process.stdout.write(JSON.stringify({
    changesRoot: target,
    ok: !findings.some((f) => ["CRITICAL", "HIGH"].includes(f.severity)),
    changes,
    findings,
  }, null, 2) + "\n");
} else {
  process.stdout.write(JSON.stringify(analyzeOne(target), null, 2) + "\n");
}
