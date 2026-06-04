// PreToolUse hook: blocks mutating files outside the active Cairn repo/workspace. Exit 2 = block.
//   node cairn-guard.mjs '{"tool_name":"Edit","tool_input":{"file_path":"..."},"cwd":"..."}'
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { childGitRepos, hasCairnDir, isInside, isInsideCairnState, resolveCairnBoundary } from "./cairn-workspace.mjs";

const FILE_MUTATORS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit", "apply_patch"]);
const SHELL_MUTATORS = new Set(["Bash", "Shell", "exec_command"]);
const ALLOWLIST = [path.join(os.homedir(), ".claude"), path.join(os.homedir(), ".codex")];

function decide(event) {
  const isFileMutation = FILE_MUTATORS.has(event.tool_name);
  const isShellMutation = SHELL_MUTATORS.has(event.tool_name);
  if (!isFileMutation && !isShellMutation) return { allow: true };
  const files = isShellMutation ? shellMutationTargets(event) : targetFiles(event);
  if (!files.length) return { allow: true };
  if (process.env.CAIRN_ALLOW_CROSS_REPO === "1") return { allow: true };
  const cwd = event.cwd || process.cwd();
  const boundary = resolveCairnBoundary(cwd);
  const root = boundary.repoRoot;
  const stateRoot = boundary.cairnStateRoot;
  const childRepoCairnRoots = boundary.cairnStateScope === "workspace" && stateRoot
    ? childGitRepos(stateRoot).map((repo) => path.join(repo, ".cairn"))
    : [];
  if (!root && !stateRoot) return { allow: true };
  const adopted = hasCairnDir(stateRoot) || hasCairnDir(root) || childRepoCairnRoots.length > 0;
  if (!adopted) return { allow: true };
  for (const file of files) {
    const abs = path.resolve(cwd, file);
    if (ALLOWLIST.some((dir) => isInside(abs, dir))) continue;
    if (childRepoCairnRoots.some((cairnRoot) => isInside(abs, cairnRoot))) {
      return {
        allow: false,
        reason: `Cairn boundary guard: ${abs} targets a child repo .cairn/ inside a marked workspace. Use ${path.join(stateRoot, ".cairn")} for Cairn state.`,
      };
    }
    if (isInsideCairnState(abs, stateRoot)) continue;
    if (root && isInside(abs, root)) continue;
    if (!root && stateRoot && isInside(abs, stateRoot)) continue;
    if (root) {
      return {
        allow: false,
        reason: `Cairn boundary guard: ${abs} is outside the active repo (${root}). Confirm the target repo, or set CAIRN_ALLOW_CROSS_REPO=1 to override.`,
      };
    }
    return {
      allow: false,
      reason: `Cairn boundary guard: ${abs} is outside the active workspace (${stateRoot}). Confirm the target workspace, or set CAIRN_ALLOW_CROSS_REPO=1 to override.`,
    };
  }
  return { allow: true };
}

function targetFiles(event) {
  const input = event.tool_input || {};
  const direct = [
    input.file_path,
    input.notebook_path,
    input.path,
  ].filter(Boolean);
  const patch = input.patch || input.content || input.input || "";
  if (typeof patch !== "string") return direct;
  const patchFiles = [];
  for (const line of patch.split("\n")) {
    const m = line.match(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/)
      || line.match(/^\*\*\* Move to: (.+)$/);
    if (m) patchFiles.push(m[1].trim());
  }
  return [...direct, ...patchFiles];
}

function shellMutationTargets(event) {
  const input = event.tool_input || {};
  const command = [input.command, input.cmd, input.script].find((value) => typeof value === "string") || "";
  if (!command.includes(".cairn")) return [];
  const targets = [];
  for (const line of command.split(/\n|&&|\|\|/)) {
    const redirs = [...line.matchAll(/(?:^|\s)(?:>|>>|2>|&>)\s*(['"]?)([^'"\s;&|]+)\1/g)];
    targets.push(...redirs.map((m) => m[2]));

    const tokens = tokenizeShell(line);
    for (let i = 0; i < tokens.length; i++) {
      const name = path.basename(tokens[i]);
      if (["mkdir", "touch", "rm", "rmdir"].includes(name)) {
        targets.push(...nonOptionArgs(tokens.slice(i + 1)));
      } else if (["cp", "mv", "rsync", "install", "ln"].includes(name)) {
        const args = nonOptionArgs(tokens.slice(i + 1));
        if (args.length) targets.push(args[args.length - 1]);
      } else if (name === "tee") {
        targets.push(...nonOptionArgs(tokens.slice(i + 1)));
      }
    }
  }
  return targets.filter((target) => target.includes(".cairn"));
}

function tokenizeShell(line) {
  const tokens = [];
  for (const m of line.matchAll(/"([^"]*)"|'([^']*)'|([^\s]+)/g)) {
    tokens.push((m[1] ?? m[2] ?? m[3]).replace(/[;|&]+$/g, ""));
  }
  return tokens.filter(Boolean);
}

function nonOptionArgs(tokens) {
  return tokens.filter((token) => token && !token.startsWith("-") && !["sudo", "command", "env"].includes(token));
}

const raw = process.argv[2] ?? fs.readFileSync(0, "utf8");
let event = {};
try {
  event = JSON.parse(raw || "{}");
} catch {
  event = {};
}
const d = decide(event);
if (!d.allow) {
  process.stderr.write(d.reason + "\n");
  process.exit(2);
}
process.exit(0);
