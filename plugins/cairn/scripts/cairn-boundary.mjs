// Deterministic boundary detection (ADR-0005). Read-only: run BEFORE any mutation to
// confirm which repo owns the cwd, whether it is a linked worktree, and whether it sits
// inside an umbrella workspace with sibling repos. Also reports context readiness so the
// model can calibrate autonomy to how well the repo is documented (Principle 9 / METR 2025:
// high autonomy in thin-context repos ships subtle bugs). Prints JSON.
//   node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-boundary.mjs [dir]
import fs from "node:fs";
import path from "node:path";
import { resolveCairnBoundary } from "./cairn-workspace.mjs";

const start = process.argv[2] || process.cwd();

const existsAny = (root, names) => names.some((n) => fs.existsSync(path.join(root, n)));

const countMd = (dir) => {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length;
  } catch {
    return 0;
  }
};

function hasTests(root) {
  if (existsAny(root, ["test", "tests", "__tests__", "spec", "pytest.ini", "tox.ini", "conftest.py"])) return true;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    if (pkg.scripts && pkg.scripts.test) return true;
  } catch {
    /* no/invalid package.json */
  }
  return false;
}

// Deterministic context-readiness signal. Facts only (which docs exist); the model decides
// how much to lean on them. The label is a conservative heuristic, not a precise score.
function contextReadiness(root) {
  const signals = {
    agents: existsAny(root, ["AGENTS.md", "CLAUDE.md"]),
    readme: existsAny(root, ["README.md", "README", "README.rst", "README.txt"]),
    tests: hasTests(root),
    codebaseMaps: countMd(path.join(root, ".cairn/codebase")),
    specs: countMd(path.join(root, ".cairn/specs")),
  };
  const score = [signals.agents, signals.readme, signals.tests, signals.codebaseMaps > 0, signals.specs > 0]
    .filter(Boolean).length;
  return { ...signals, readiness: score >= 4 ? "strong" : score >= 2 ? "partial" : "thin" };
}

// The local-vs-versioned choice IS the repo's .gitignore — read it, don't invent a config.
// local = whole .cairn/ ignored; hybrid = process (changes/decision-log) ignored; commit = none.
function memoryPolicy(root) {
  let lines;
  try {
    lines = fs.readFileSync(path.join(root, ".gitignore"), "utf8")
      .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  } catch {
    return "commit";
  }
  if (lines.some((l) => l === ".cairn" || l === ".cairn/" || l === ".cairn/*")) return "local";
  if (lines.some((l) => /^\.cairn\/(changes|decision-log)/.test(l))) return "hybrid";
  return "commit";
}

const result = resolveCairnBoundary(start);
const repoRoot = result.repoRoot;

if (repoRoot) {
  result.context = contextReadiness(repoRoot);
} else if (result.cairnStateRoot) {
  result.context = contextReadiness(result.cairnStateRoot);
}

if (result.cairnStateRoot) result.stateContext = contextReadiness(result.cairnStateRoot);
result.memoryPolicy = result.cairnStateScope === "workspace" ? "local" : repoRoot ? memoryPolicy(repoRoot) : "local";

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
