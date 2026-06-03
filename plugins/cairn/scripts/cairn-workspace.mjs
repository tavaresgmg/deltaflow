import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export function git(args, cwd) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

export function gitRoot(cwd) {
  return git("rev-parse --show-toplevel", cwd);
}

export function mainWorktreeFor(repoRoot) {
  if (!repoRoot) return null;
  const commonDir = git("rev-parse --git-common-dir", repoRoot);
  if (!commonDir) return repoRoot;
  const abs = path.isAbsolute(commonDir) ? commonDir : path.resolve(repoRoot, commonDir);
  return path.basename(abs) === ".git" ? path.dirname(abs) : repoRoot;
}

export function isLinkedWorktree(repoRoot) {
  if (!repoRoot) return false;
  const dotGit = path.join(repoRoot, ".git");
  try {
    return fs.statSync(dotGit).isFile();
  } catch {
    return false;
  }
}

export function isGitRepoDir(dir) {
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

export function hasWorkspaceMarker(dir) {
  if (isGitRepoDir(dir)) return false;
  try {
    if (fs.statSync(path.join(dir, ".work")).isDirectory()) return true;
  } catch {
    /* no .work marker */
  }
  return fs.existsSync(path.join(dir, "AGENTS.md")) && childGitRepos(dir).length >= 2 && !isGitRepoDir(dir);
}

export function findMarkedWorkspace(startDir) {
  let current = path.resolve(startDir);
  while (true) {
    if (hasWorkspaceMarker(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export function resolveCairnBoundary(cwd = process.cwd()) {
  const start = path.resolve(cwd);
  const repoRoot = gitRoot(start);
  const mainWorktree = repoRoot ? mainWorktreeFor(repoRoot) : null;
  const isRepo = Boolean(repoRoot);

  const workspaceSearchStart = mainWorktree ? path.dirname(mainWorktree) : start;
  const workspaceRoot = findMarkedWorkspace(workspaceSearchStart);
  const siblingBase = workspaceRoot || (mainWorktree ? path.dirname(mainWorktree) : null);
  const siblingRepos = siblingBase ? childGitRepos(siblingBase) : [];
  const repoForComparison = mainWorktree || repoRoot;
  const siblingReposExcludingCurrent = siblingRepos.filter((repo) => repo !== repoForComparison);

  const cairnStateRoot = workspaceRoot || repoRoot || null;
  const cairnStateScope = workspaceRoot ? "workspace" : repoRoot ? "repo" : "none";

  return {
    cwd: start,
    isRepo,
    repoRoot,
    isWorktree: isLinkedWorktree(repoRoot),
    mainWorktree,
    workspaceRoot,
    umbrellaRoot: siblingRepos.length >= 2 ? siblingBase : null,
    siblingRepos: siblingReposExcludingCurrent,
    cairnStateRoot,
    cairnStateScope,
    stateRootReason: workspaceRoot ? "marked-workspace-parent" : repoRoot ? "repo-root" : "none",
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

// Has this root adopted Cairn? A `.cairn/` dir means specs/changes/decision-log live here.
// Shared blast-radius gate: hooks policing a project only act once it adopted Cairn.
export function hasCairnDir(root) {
  if (!root) return false;
  try {
    return fs.statSync(path.join(root, ".cairn")).isDirectory();
  } catch {
    return false;
  }
}
