// Validate and close one Cairn change folder. Read-only by default; --apply archives/deletes.
//   node cairn-close.mjs .cairn/changes/<slug>
//   node cairn-close.mjs .cairn/changes/<slug> --apply [--delete]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const allowDelete = args.includes("--delete");
const target = args.find((arg) => !arg.startsWith("--"));

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
const changeDir = path.resolve(target);
const slug = path.basename(changeDir);
const changesRoot = path.dirname(changeDir);

function read(rel) {
  return fs.readFileSync(path.join(changeDir, rel), "utf8");
}

function has(rel) {
  return fs.existsSync(path.join(changeDir, rel));
}

function finding(severity, code, message, file = null) {
  return { severity, code, message, ...(file ? { file } : {}) };
}

function taskStats() {
  if (!has("tasks.md")) return { items: [], done: [], open: [] };
  const items = read("tasks.md")
    .split("\n")
    .filter((line) => /^\s*-\s*\[[ xX]\]/.test(line));
  return {
    items,
    done: items.filter((line) => /\[[xX]\]/.test(line)),
    open: items.filter((line) => /\[ \]/.test(line)),
  };
}

function proofText() {
  return has("proof.md") ? read("proof.md") : "";
}

function lifecycleDecision(text = proofText()) {
  const m = text.match(/^Lifecycle decision:\s*(sync|delegate|archive|delete)\b\s*(?:[—-]\s*(.*))?$/im);
  if (!m) return null;
  return { type: m[1].toLowerCase(), detail: (m[2] || "").trim() };
}

function contextLearned(text = proofText()) {
  return text.match(/^Context learned:\s*(.+)$/im)?.[1]?.trim() || null;
}

function textHasMeaning(text) {
  const stripped = text
    .split("\n")
    .filter((line) => !/^\s*#/.test(line))
    .join("\n")
    .trim();
  return stripped.length > 0 && !/^pending\b/i.test(stripped.replace(/[-*\s]+/g, ""));
}

function referencedPaths(markdown) {
  const refs = new Set();
  for (const match of markdown.matchAll(/`([^`]+)`/g)) {
    const value = match[1].trim();
    if (!value || value.startsWith("http")) continue;
    if (value.includes(" ") || value.includes("<") || value.includes(">")) continue;
    if (!path.isAbsolute(value) && !value.startsWith("./") && !value.startsWith("../") && !value.includes("/")) continue;
    if (/[*?[\]{}]/.test(value)) continue;
    refs.add(value);
  }
  return [...refs];
}

function resolveRef(ref) {
  const candidates = [];
  if (path.isAbsolute(ref)) {
    candidates.push(ref);
  } else if (ref.startsWith("./") || ref.startsWith("../")) {
    candidates.push(path.resolve(changeDir, ref));
  } else {
    const changeRef = ref.match(/^\.cairn\/changes\/[^/]+\/?(.*)$/);
    if (changeRef) {
      candidates.push(changeRef[1] ? path.join(changeDir, changeRef[1]) : changeDir);
    }
    candidates.push(path.join(root, ref));
  }
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
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
  return section(markdown, "Semantic Claims")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => {
      const text = line.slice(2).trim();
      return {
        text,
        code: [...text.matchAll(/code:\s*`([^`]+)`/gi)].map((m) => m[1].trim()),
        proof: [...text.matchAll(/proof:\s*`([^`]+)`/gi)].map((m) => m[1].trim()),
      };
    });
}

function analyze() {
  const findings = [];
  const stats = taskStats();

  if (has("delta.md") && !has("plan.md")) {
    findings.push(finding("HIGH", "DELTA_WITHOUT_PLAN", "delta.md exists without plan.md", path.join(changeDir, "delta.md")));
  }
  if (has("plan.md") && !has("tasks.md")) {
    findings.push(finding("HIGH", "PLAN_WITHOUT_TASKS", "plan.md exists without tasks.md", path.join(changeDir, "plan.md")));
  }
  if (has("tasks.md") && stats.items.length === 0) {
    findings.push(finding("HIGH", "TASKS_EMPTY", "tasks.md has no checkbox items", path.join(changeDir, "tasks.md")));
  }
  if (stats.done.length > 0 && !has("proof.md")) {
    findings.push(finding("HIGH", "DONE_WITHOUT_PROOF", "tasks are marked done but proof.md is missing", path.join(changeDir, "tasks.md")));
  }
  for (const line of stats.done) {
    if (!/proof:/i.test(line)) {
      findings.push(finding("MEDIUM", "DONE_TASK_LACKS_INLINE_PROOF", `done task lacks inline proof note: ${line.trim()}`, path.join(changeDir, "tasks.md")));
    }
  }
  if (stats.done.length > 0 && stats.open.length > 0) {
    findings.push(finding("LOW", "MIXED_TASK_STATE", "tasks.md has both completed and open work", path.join(changeDir, "tasks.md")));
  }

  const proof = proofText();
  if (has("proof.md") && !textHasMeaning(proof)) {
    findings.push(finding("MEDIUM", "PROOF_EMPTY", "proof.md has no meaningful proof content", path.join(changeDir, "proof.md")));
  }
  if (/pending final run/i.test(proof)) {
    findings.push(finding("LOW", "PROOF_PENDING", "proof.md still says final proof is pending", path.join(changeDir, "proof.md")));
  }

  for (const rel of ["plan.md", "delta.md"]) {
    if (!has(rel)) continue;
    const markdown = read(rel);
    for (const ref of referencedPaths(markdown)) {
      const targetPath = resolveRef(ref);
      if (!fs.existsSync(targetPath)) {
        findings.push(finding("LOW", "REFERENCED_PATH_MISSING", `referenced path does not exist: ${ref}`, path.join(changeDir, rel)));
      }
    }
    if (rel === "delta.md") {
      for (const claim of semanticClaims(markdown)) {
        if (claim.code.length === 0) {
          findings.push(finding("HIGH", "SEMANTIC_CLAIM_WITHOUT_CODE", `semantic claim lacks code reference: ${claim.text}`, path.join(changeDir, rel)));
        }
        if (claim.proof.length === 0) {
          findings.push(finding("MEDIUM", "SEMANTIC_CLAIM_WITHOUT_PROOF", `semantic claim lacks proof command: ${claim.text}`, path.join(changeDir, rel)));
        }
        for (const ref of claim.code) {
          const targetPath = resolveRef(ref);
          if (!fs.existsSync(targetPath)) {
            findings.push(finding("HIGH", "SEMANTIC_REF_MISSING", `semantic claim references missing code: ${ref}`, path.join(changeDir, rel)));
          }
        }
      }
    }
  }

  const allDone = stats.items.length > 0 && stats.open.length === 0;
  const decision = lifecycleDecision(proof);
  if (allDone && has("delta.md") && !decision) {
    findings.push(finding("MEDIUM", "LIFECYCLE_DECISION_MISSING", "completed durable change has no Lifecycle decision", path.join(changeDir, "proof.md")));
  }
  if (allDone && has("delta.md")) {
    const learned = contextLearned(proof);
    if (!learned) {
      findings.push(finding("MEDIUM", "CONTEXT_LEARNED_MISSING", "completed durable change has no Context learned", path.join(changeDir, "proof.md")));
    } else if (/^<|none\|owner:path\|deferred:reason/i.test(learned)) {
      findings.push(finding("MEDIUM", "CONTEXT_LEARNED_PLACEHOLDER", "proof.md still has placeholder Context learned value", path.join(changeDir, "proof.md")));
    } else if (learned.startsWith("owner:")) {
      const body = learned.slice("owner:".length).trim();
      const [ref, fact = ""] = body.split(/\s+[-—]\s+/, 2);
      if (!fact.trim()) {
        findings.push(finding("LOW", "CONTEXT_LEARNED_FACT_MISSING", "Context learned owner entries should include the learned fact after a dash", path.join(changeDir, "proof.md")));
      }
      if (ref && !fs.existsSync(path.isAbsolute(ref) ? ref : path.join(root, ref))) {
        findings.push(finding("LOW", "CONTEXT_LEARNED_OWNER_MISSING", `Context learned owner path does not exist: ${ref}`, path.join(changeDir, "proof.md")));
      }
    } else if (learned !== "none" && !learned.startsWith("deferred:")) {
      findings.push(finding("LOW", "CONTEXT_LEARNED_FORMAT", `Context learned should be none, owner:<path> - <fact>, or deferred:<reason>: ${learned}`, path.join(changeDir, "proof.md")));
    }
  }

  const blocking = findings.some((item) => ["HIGH", "MEDIUM"].includes(item.severity));
  return {
    changeDir: path.relative(root, changeDir) || changeDir,
    ok: true,
    findings,
    stats: { tasks: stats.items.length, done: stats.done.length, open: stats.open.length },
    lifecycleDecision: decision,
    verify: {
      completeness: stats.items.length > 0 && stats.open.length === 0,
      coherence: !findings.some((item) => item.severity === "HIGH"),
      proof: has("proof.md") && textHasMeaning(proof) && !/pending final run/i.test(proof),
      verdict: blocking ? (stats.open.length ? "incomplete" : "drift") : (stats.open.length ? "incomplete" : "verified"),
    },
  };
}

function archiveTarget() {
  const day = new Date().toISOString().slice(0, 10);
  return path.join(changesRoot, "archive", `${day}-${slug}`);
}

function applyLifecycle(report) {
  if (report.verify.verdict !== "verified") return { applied: false, error: `not verified: ${report.verify.verdict}` };
  const decision = report.lifecycleDecision;
  if (!decision) return { applied: false, error: "missing lifecycle decision" };
  if (decision.type === "delete") {
    if (!allowDelete) return { applied: false, error: "delete requires --delete" };
    fs.rmSync(changeDir, { recursive: true, force: false });
    return { applied: true, action: "delete" };
  }
  const targetPath = archiveTarget();
  if (fs.existsSync(targetPath)) return { applied: false, error: `archive target exists: ${targetPath}` };
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.renameSync(changeDir, targetPath);
  return { applied: true, action: "archive", target: targetPath };
}

const report = analyze();
const applied = apply ? applyLifecycle(report) : null;
process.stdout.write(JSON.stringify({ ...report, ...(apply ? { applied } : {}) }, null, 2) + "\n");
if (apply && !applied.applied) process.exit(1);
