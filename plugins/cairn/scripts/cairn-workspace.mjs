import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function gitRoot(cwd) {
  return git("rev-parse --show-toplevel", cwd);
}

function mainWorktreeFor(repoRoot) {
  if (!repoRoot) return null;
  const commonDir = git("rev-parse --git-common-dir", repoRoot);
  if (!commonDir) return repoRoot;
  const abs = path.isAbsolute(commonDir) ? commonDir : path.resolve(repoRoot, commonDir);
  return path.basename(abs) === ".git" ? path.dirname(abs) : repoRoot;
}

function isGitRepoDir(dir) {
  return fs.existsSync(path.join(dir, ".git"));
}

export function childGitRepos(dir) {
  const repos = [];
  try {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const child = path.join(dir, ent.name);
      if (isGitRepoDir(child)) repos.push(child);
    }
  } catch {
    /* unreadable directory */
  }
  return repos;
}

function dirExists(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function workspaceMarker(dir) {
  if (isGitRepoDir(dir)) return false;
  if (dirExists(path.join(dir, ".cairn"))) return "cairn";
  if (dirExists(path.join(dir, ".work"))) return "work-legacy";
  if (fs.existsSync(path.join(dir, "AGENTS.md")) && childGitRepos(dir).length >= 2) return "agents-child-repos";
  return null;
}

function findMarkedWorkspace(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    if (workspaceMarker(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

// Owner boundary used by the guard, coherence, and scaffold hooks. Returns only the
// three fields those consumers read; richer workspace facts are computed on demand.
export function resolveCairnBoundary(cwd = process.cwd()) {
  const start = path.resolve(cwd);
  const repoRoot = gitRoot(start);
  const mainWorktree = repoRoot ? mainWorktreeFor(repoRoot) : null;
  const searchStart = mainWorktree ? path.dirname(mainWorktree) : start;
  const workspaceRoot = findMarkedWorkspace(searchStart);

  return {
    repoRoot,
    cairnStateRoot: workspaceRoot || repoRoot || null,
    cairnStateScope: workspaceRoot ? "workspace" : repoRoot ? "repo" : "none",
  };
}

export function isInside(absFile, absRoot) {
  const rel = path.relative(absRoot, absFile);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export function isInsideCairnState(absFile, cairnStateRoot) {
  if (!cairnStateRoot) return false;
  return isInside(absFile, path.join(cairnStateRoot, ".cairn"));
}

export function hasCairnDir(root) {
  if (!root) return false;
  try {
    return fs.statSync(path.join(root, ".cairn")).isDirectory();
  } catch {
    return false;
  }
}
