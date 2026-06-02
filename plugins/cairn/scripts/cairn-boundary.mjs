// Deterministic boundary detection (ADR-0005). Read-only: run BEFORE any mutation to
// confirm which repo owns the cwd, whether it is a linked worktree, and whether it sits
// inside an umbrella workspace with sibling repos. Also reports context readiness so the
// model can calibrate autonomy to how well the repo is documented (Principle 9 / METR 2025:
// high autonomy in thin-context repos ships subtle bugs). Prints JSON.
//   node ${CLAUDE_PLUGIN_ROOT}/scripts/cairn-boundary.mjs [dir]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const start = process.argv[2] || process.cwd();

function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

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

const repoRoot = git("rev-parse --show-toplevel", start);
const result = { cwd: start, isRepo: Boolean(repoRoot), repoRoot };

if (repoRoot) {
  // A linked worktree has .git as a file (gitdir pointer), not a directory.
  const dotGit = path.join(repoRoot, ".git");
  result.isWorktree = fs.existsSync(dotGit) && fs.statSync(dotGit).isFile();

  // The common dir resolves to the main worktree's repo, even from a linked worktree.
  let mainWorktree = repoRoot;
  const commonDir = git("rev-parse --git-common-dir", repoRoot);
  if (commonDir) {
    const abs = path.isAbsolute(commonDir) ? commonDir : path.resolve(repoRoot, commonDir);
    if (path.basename(abs) === ".git") mainWorktree = path.dirname(abs);
  }
  result.mainWorktree = mainWorktree;

  // Umbrella heuristic: the parent dir holds >=2 git repos (siblings), not a monorepo.
  const parent = path.dirname(mainWorktree);
  const siblings = [];
  try {
    for (const ent of fs.readdirSync(parent, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const dir = path.join(parent, ent.name);
      if (fs.existsSync(path.join(dir, ".git"))) siblings.push(dir);
    }
  } catch {
    /* parent unreadable — treat as no umbrella */
  }
  if (siblings.length >= 2) {
    result.umbrellaRoot = parent;
    result.siblingRepos = siblings.filter((d) => d !== mainWorktree);
  } else {
    result.umbrellaRoot = null;
    result.siblingRepos = [];
  }

  result.context = contextReadiness(repoRoot);
}

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
