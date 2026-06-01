// Deterministic boundary detection (ADR-0005). Read-only: run BEFORE any mutation to
// confirm which repo owns the cwd, whether it is a linked worktree, and whether it sits
// inside an umbrella workspace with sibling repos. Prints JSON.
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
}

process.stdout.write(JSON.stringify(result, null, 2) + "\n");
