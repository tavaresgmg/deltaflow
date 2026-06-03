// Local structural validation for the Cairn plugin. Run from the repo root:
//   node scripts/validate-cairn.mjs
// Validates everything we can check without a live harness; auto-trigger and hook I/O
// are validated empirically per docs/evals/auto-trigger.md.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel) => JSON.parse(read(rel));
const readJsonlSummary = (rel) => {
  const lines = read(rel).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  return lines.find((row) => row.summary)?.summary;
};
const gitLsFiles = () => execSync("git ls-files", {
  cwd: root,
  stdio: ["ignore", "pipe", "ignore"],
}).toString().split("\n").filter(Boolean);

// An unquoted YAML scalar containing ": " is parsed as a mapping and breaks frontmatter
// loading — a real failure observed on Codex. Scan top-level frontmatter values for it.
function yamlColonCheck(block, label) {
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(\S.*)$/);
    if (!m) continue;
    if (/^["'|>]/.test(m[2])) continue; // quoted or block scalar is safe
    if (/:\s/.test(m[2])) {
      fail(`${label} frontmatter '${m[1]}' has an unquoted colon — invalid YAML; quote the value`);
    }
  }
}

const required = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "docs/research/frameworks.md",
  "docs/research/context-and-portability.md",
  "docs/architecture/mvp-architecture.md",
  "docs/architecture/agent-integration-contract.md",
  "docs/decisions/README.md",
  "docs/roadmap.md",
  "docs/install.md",
  "docs/release-checklist.md",
  "docs/evals/auto-trigger.md",
  "docs/examples/brownfield-card-eval-harness.md",
  "scripts/eval-scoreboard.mjs",
  "plugins/cairn/plugin.manifest.json",
  "plugins/cairn/.codex-plugin/plugin.json",
  "plugins/cairn/.claude-plugin/plugin.json",
  "plugins/cairn/hooks/bootstrap.md",
  "plugins/cairn/hooks/session-start.sh",
  "plugins/cairn/hooks/hooks.json",
  "plugins/cairn/scripts/cairn-boundary.mjs",
  "plugins/cairn/scripts/cairn-workspace.mjs",
  "plugins/cairn/scripts/cairn-guard.mjs",
  "plugins/cairn/scripts/cairn-coherence.mjs",
  "plugins/cairn/scripts/cairn-analyze.mjs",
  "plugins/cairn/scripts/cairn-budget.mjs",
  "plugins/cairn/scripts/cairn-doctor.mjs",
  "plugins/cairn/scripts/cairn-next.mjs",
  "plugins/cairn/scripts/cairn-retention.mjs",
  "plugins/cairn/scripts/cairn-version.mjs",
  "plugins/cairn/scripts/cairn-anchor.mjs",
  "plugins/cairn/scripts/cairn-scaffold.mjs",
  "plugins/cairn/agents/cairn-researcher.md",
  "plugins/cairn/skills/cairn/SKILL.md",
  "plugins/cairn/skills/cairn/references/modes.md",
  "plugins/cairn/skills/cairn/references/review.md",
  "plugins/cairn/skills/cairn/references/artifacts.md",
  "plugins/cairn/skills/cairn/references/memory.md",
  "plugins/cairn/skills/cairn/references/research.md",
  "plugins/cairn/skills/cairn/references/workspace.md",
  "plugins/cairn/skills/cairn/references/gates.md",
  "plugins/cairn/skills/cairn/references/framework-lessons.md",
];

const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
for (const f of missing) fail(`missing required file: ${f}`);

// CLAUDE.md must import AGENTS.md, not duplicate it — one-source dual-harness (Principle 5).
if (!missing.includes("CLAUDE.md") && !read("CLAUDE.md").includes("@AGENTS.md")) {
  fail("CLAUDE.md must import AGENTS.md via @AGENTS.md (one-source dual-harness)");
}

// Everything below needs the files present.
if (!missing.length) {
  const trackedFiles = gitLsFiles();
  for (const file of trackedFiles) {
    if (/(^|\/)\.DS_Store$/.test(file)) {
      fail(`tracked macOS artifact must be removed: ${file}`);
    }
  }
  const scanForDsStore = (dir, rel = "") => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return [];
    }
    const found = [];
    for (const ent of entries) {
      const childRel = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.name === ".git" || ent.name === "node_modules") continue;
      if (ent.name === ".DS_Store") {
        found.push(childRel);
      } else if (ent.isDirectory()) {
        found.push(...scanForDsStore(path.join(dir, ent.name), childRel));
      }
    }
    return found;
  };
  for (const file of scanForDsStore(root)) {
    fail(`local macOS artifact must be removed: ${file}`);
  }
  const staleDocPhrases = [
    {
      file: "docs/comparison-and-gaps.md",
      phrase: "semantic sync pending",
      message: "comparison doc still says semantic sync is pending",
    },
    {
      file: "docs/roadmap.md",
      phrase: "- [ ] Worked examples proving that maps reduce repeated observe cost without becoming stale docs.",
      message: "roadmap still marks worked examples as pending",
    },
  ];
  for (const item of staleDocPhrases) {
    if (read(item.file).includes(item.phrase)) fail(item.message);
  }

  const canonical = readJson("plugins/cairn/plugin.manifest.json");
  const codex = readJson("plugins/cairn/.codex-plugin/plugin.json");
  const claude = readJson("plugins/cairn/.claude-plugin/plugin.json");
  const codexMarketplace = readJson(".agents/plugins/marketplace.json");
  const claudeMarketplace = readJson(".claude-plugin/marketplace.json");

  const nameOk = /^[a-z][a-z0-9-]*$/;
  if (!nameOk.test(canonical.name)) fail(`manifest name not slug-safe: ${canonical.name}`);
  if (/claude|anthropic|codex|openai/i.test(canonical.name)) {
    fail(`manifest name must be harness-neutral: ${canonical.name}`);
  }

  // Codex shape.
  if (codex.name !== "cairn") fail("codex plugin.json name must be cairn");
  if (codex.skills !== "./skills/") fail('codex plugin.json skills must be "./skills/"');
  // Claude shape: package metadata present.
  for (const k of ["license", "homepage", "keywords"]) {
    if (!claude[k]) fail(`claude plugin.json missing ${k}`);
  }

  // Parity: shared fields agree across canonical + both shims.
  for (const k of ["name", "version", "description"]) {
    if (codex[k] !== canonical[k]) fail(`codex.${k} != canonical.${k}`);
    if (claude[k] !== canonical[k]) fail(`claude.${k} != canonical.${k}`);
  }

  // Drift: the shims must equal what build-manifests.mjs would emit from canonical.
  const { name, version, description, author, homepage, license, keywords, skills, interface: iface } = canonical;
  const expectedCodex = { name, version, description, author, skills, interface: iface };
  const expectedClaude = { name, version, description, author, homepage, license, keywords };
  const expectedMarketplace = { name, owner: author, plugins: [{ name, source: "./plugins/cairn", description }] };
  if (JSON.stringify(codex) !== JSON.stringify(expectedCodex)) {
    fail("codex plugin.json is stale — run: node scripts/build-manifests.mjs");
  }
  if (JSON.stringify(claude) !== JSON.stringify(expectedClaude)) {
    fail("claude plugin.json is stale — run: node scripts/build-manifests.mjs");
  }
  if (JSON.stringify(codexMarketplace) !== JSON.stringify(expectedMarketplace)) {
    fail(".agents/plugins/marketplace.json is stale — run: node scripts/build-manifests.mjs");
  }
  if (JSON.stringify(claudeMarketplace) !== JSON.stringify(expectedMarketplace)) {
    fail(".claude-plugin/marketplace.json is stale — run: node scripts/build-manifests.mjs");
  }

  // No directories inside the per-harness manifest dirs (only the manifest/marketplace).
  for (const dir of [".codex-plugin", ".claude-plugin"]) {
    const abs = path.join(root, "plugins/cairn", dir);
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      if (ent.isDirectory()) fail(`${dir}/ must not contain directories: ${ent.name}`);
    }
  }

  // SKILL.md frontmatter.
  const skill = read("plugins/cairn/skills/cairn/SKILL.md");
  const fm = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail("SKILL.md has no frontmatter block");
  } else {
    const block = fm[1];
    yamlColonCheck(block, "SKILL.md");
    const nameLine = block.match(/^name:\s*(.+)$/m);
    if (!nameLine || nameLine[1].trim() !== "cairn") fail("SKILL.md name must be cairn");

    const descLine = block.match(/^description:\s*(.+)$/m);
    if (!descLine) {
      fail("SKILL.md missing description");
    } else {
      const desc = descLine[1].trim();
      if (!/^".*"$/.test(desc)) fail("SKILL.md description must be double-quoted (YAML safety)");
      if (desc.length > 1024) fail(`SKILL.md description too long: ${desc.length} > 1024`);
      const head = desc.slice(0, 250);
      if (!/ALWAYS/.test(head)) fail("SKILL.md description: no directive (ALWAYS) in first 250 chars");
      if (!/build|fix|change|refactor|implement|plan/i.test(head)) {
        fail("SKILL.md description: no trigger verbs in first 250 chars");
      }
      if (!/(do not|skip|not for)/i.test(desc)) fail("SKILL.md description: no negative boundary");
    }
    if (!/^when_to_use:/m.test(block)) fail("SKILL.md missing when_to_use");
  }
  for (const needle of ["Classify", "Proof", "Reuse before inventing", "Mode: <direct|diagnose|discovery|delta-spec|tracked-change>"]) {
    if (!skill.includes(needle)) fail(`SKILL.md missing expected text: ${needle}`);
  }
  const frameworkLessons = read("plugins/cairn/skills/cairn/references/framework-lessons.md");
  for (const needle of ["Anti-Rationalization Red Flags", "Reuse the existing owner"]) {
    if (!frameworkLessons.includes(needle)) {
      fail(`framework-lessons.md missing expected text: ${needle}`);
    }
  }
  const modes = read("plugins/cairn/skills/cairn/references/modes.md");
  if (!modes.includes("reuse/adapt/new")) {
    fail("modes.md missing reuse/adapt/new decision guidance");
  }

  // Hook portability.
  const hook = read("plugins/cairn/hooks/session-start.sh");
  if (!hook.includes("${CLAUDE_PLUGIN_ROOT")) fail("session-start.sh must use ${CLAUDE_PLUGIN_ROOT}");
  if (/\bPLUGIN_ROOT\b/.test(hook.replace(/CLAUDE_PLUGIN_ROOT/g, ""))) {
    fail("session-start.sh uses bare PLUGIN_ROOT (use ${CLAUDE_PLUGIN_ROOT})");
  }
  const hooksJson = readJson("plugins/cairn/hooks/hooks.json");
  const cmd = JSON.stringify(hooksJson);
  if (!cmd.includes("${CLAUDE_PLUGIN_ROOT}") || !cmd.includes("hooks/session-start.sh")) {
    fail("hooks.json must invoke ${CLAUDE_PLUGIN_ROOT} .../hooks/session-start.sh");
  }
  if (!cmd.includes("SessionStart")) fail("hooks.json must register SessionStart");
  if (!cmd.includes("PreToolUse") || !cmd.includes("cairn-guard.mjs")) {
    fail("hooks.json must register PreToolUse -> cairn-guard.mjs");
  }
  if (!cmd.includes("Stop") || !cmd.includes("cairn-coherence.mjs")) {
    fail("hooks.json must register Stop -> cairn-coherence.mjs");
  }

  const integrationContract = read("docs/architecture/agent-integration-contract.md");
  for (const needle of ["Strong", "Proven", "Advisory", "Pending upstream", "cairn-doctor.mjs", "Codex", "Claude Code"]) {
    if (!integrationContract.includes(needle)) fail(`agent integration contract missing expected text: ${needle}`);
  }

  // Doctor smoke test: read-only JSON output should classify both harnesses and key surfaces.
  try {
    const out = execSync("node plugins/cairn/scripts/cairn-doctor.mjs --json", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const d = JSON.parse(out);
    if (d.name !== "cairn-doctor" || d.readOnly !== true) fail("cairn-doctor.mjs did not emit a read-only identity");
    if (!d.harnesses?.codex || !d.harnesses?.claude) fail("cairn-doctor.mjs did not report both harnesses");
    if (d.harnesses.codex.surfaces.preToolUseGuard.status !== "pending-upstream") {
      fail("cairn-doctor.mjs must keep Codex write guard status pending-upstream");
    }
    if (d.harnesses.claude.surfaces.preToolUseGuard.status !== "strong") {
      fail("cairn-doctor.mjs must report Claude PreToolUse guard as strong");
    }
    if (!d.shared?.manifestParity?.ok) fail("cairn-doctor.mjs did not confirm manifest parity");
    if (!d.shared?.boundary?.ok) fail("cairn-doctor.mjs did not confirm boundary detection");
    if (!Array.isArray(d.recommendations)) fail("cairn-doctor.mjs missing recommendations array");
  } catch (e) {
    fail(`cairn-doctor.mjs failed to run: ${e.message}`);
  }

  // Boundary detector smoke test: must emit valid JSON resolving this repo.
  try {
    const out = execSync("node plugins/cairn/scripts/cairn-boundary.mjs", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const b = JSON.parse(out);
    if (!b.isRepo || !b.repoRoot) fail("cairn-boundary.mjs did not resolve repoRoot here");
    if (!b.context || !["thin", "partial", "strong"].includes(b.context.readiness)) {
      fail("cairn-boundary.mjs did not emit a valid context.readiness label");
    }
    if (!["local", "hybrid", "commit"].includes(b.memoryPolicy)) {
      fail("cairn-boundary.mjs did not emit a valid memoryPolicy");
    }
    if (!b.cairnStateRoot || !["repo", "workspace"].includes(b.cairnStateScope)) {
      fail("cairn-boundary.mjs did not emit a valid Cairn state root/scope here");
    }
  } catch (e) {
    fail(`cairn-boundary.mjs failed to run: ${e.message}`);
  }

  // Workspace root smoke test: a marked parent workspace owns Cairn state even when commands
  // run from a child Git repo. Child repos still own Git/build/test, not .cairn state.
  const tmpWorkspace = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-workspace-"));
  const workspace = path.join(tmpWorkspace, "workspace");
  const appRepo = path.join(workspace, "app");
  const apiRepo = path.join(workspace, "api");
  try {
    fs.mkdirSync(path.join(workspace, ".work"), { recursive: true });
    fs.writeFileSync(path.join(workspace, "AGENTS.md"), "# Workspace\n");
    fs.mkdirSync(appRepo, { recursive: true });
    fs.mkdirSync(apiRepo, { recursive: true });
    execSync("git init -q", { cwd: appRepo, stdio: ["ignore", "ignore", "ignore"] });
    execSync("git init -q", { cwd: apiRepo, stdio: ["ignore", "ignore", "ignore"] });
    const fromParent = JSON.parse(execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-boundary.mjs"))} ${JSON.stringify(workspace)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString());
    const fromChild = JSON.parse(execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-boundary.mjs"))} ${JSON.stringify(appRepo)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString());
    if (fromParent.isRepo) fail("workspace boundary marked the parent workspace as a Git repo");
    if (fromParent.workspaceRoot !== workspace || fromParent.cairnStateRoot !== workspace || fromParent.cairnStateScope !== "workspace") {
      fail("workspace boundary did not use the marked parent as Cairn state root");
    }
    if (fromParent.siblingRepos.length !== 2) fail("workspace boundary did not list child repos from parent");
    if (fromParent.memoryPolicy !== "local") fail("workspace boundary did not mark workspace state as local");
    if (fromChild.repoRoot !== appRepo || fromChild.workspaceRoot !== workspace || fromChild.cairnStateRoot !== workspace) {
      fail("workspace boundary from child repo did not resolve parent Cairn state root");
    }
    if (fromChild.cairnStateScope !== "workspace" || fromChild.memoryPolicy !== "local") {
      fail("workspace boundary from child repo did not report workspace/local state");
    }
    const gitParent = path.join(tmpWorkspace, "git-parent");
    const nestedRepo = path.join(gitParent, "nested");
    fs.mkdirSync(path.join(gitParent, ".work"), { recursive: true });
    execSync("git init -q", { cwd: gitParent, stdio: ["ignore", "ignore", "ignore"] });
    fs.mkdirSync(nestedRepo, { recursive: true });
    execSync("git init -q", { cwd: nestedRepo, stdio: ["ignore", "ignore", "ignore"] });
    const nested = JSON.parse(execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-boundary.mjs"))} ${JSON.stringify(nestedRepo)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString());
    if (nested.cairnStateScope !== "repo" || nested.cairnStateRoot !== nestedRepo || nested.workspaceRoot !== null) {
      fail("workspace boundary treated a Git repo parent with .work/ as a marked workspace");
    }
  } catch (e) {
    fail(`workspace boundary smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(tmpWorkspace, { recursive: true, force: true });
  }

  // Guard smoke test: allow inside the repo (exit 0), block outside (exit 2).
  const runGuard = (event) => {
    try {
      execSync(`node plugins/cairn/scripts/cairn-guard.mjs ${JSON.stringify(JSON.stringify(event))}`, {
        cwd: root,
        stdio: ["ignore", "ignore", "ignore"],
      });
      return 0;
    } catch (e) {
      return e.status ?? 1;
    }
  };
  const inside = runGuard({ tool_name: "Edit", tool_input: { file_path: path.join(root, "README.md") }, cwd: root });
  const outside = runGuard({ tool_name: "Edit", tool_input: { file_path: "/tmp/cairn-outside.txt" }, cwd: root });
  const outsidePatch = runGuard({
    tool_name: "apply_patch",
    tool_input: { patch: "*** Begin Patch\n*** Add File: ../cairn-outside.txt\n+blocked\n*** End Patch\n" },
    cwd: root,
  });
  if (inside !== 0) fail(`cairn-guard.mjs blocked an in-repo write (exit ${inside})`);
  if (outside !== 2) fail(`cairn-guard.mjs did not block an out-of-repo write (exit ${outside})`);
  if (outsidePatch !== 2) fail(`cairn-guard.mjs did not block an out-of-repo apply_patch (exit ${outsidePatch})`);

  // Allowlist: harness/agent config (~/.claude) is an intended cross-repo edit, allowed even
  // from inside an adopted repo.
  const allowConfig = runGuard({ tool_name: "Edit", tool_input: { file_path: path.join(os.homedir(), ".claude/CLAUDE.md") }, cwd: root });
  if (allowConfig !== 0) fail(`cairn-guard.mjs blocked an allowlisted ~/.claude edit (exit ${allowConfig})`);

  // Adoption gate: a repo with no .cairn/ is not policed — outside edits pass (mirrors coherence).
  const guardFresh = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-guard-fresh-"));
  try {
    execSync("git init -q", { cwd: guardFresh, stdio: ["ignore", "ignore", "ignore"] });
    const freshOutside = runGuard({ tool_name: "Edit", tool_input: { file_path: "/tmp/cairn-outside.txt" }, cwd: guardFresh });
    if (freshOutside !== 0) fail(`cairn-guard.mjs policed a non-Cairn repo with no .cairn/ (exit ${freshOutside})`);
  } finally {
    fs.rmSync(guardFresh, { recursive: true, force: true });
  }

  // Scaffold smoke test: copies the mode's templates into .cairn/changes/<slug>/, idempotent,
  // seeds the repo-level decision-log, and rejects non-scaffolding modes.
  const scaffoldRepo = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-scaffold-"));
  try {
    execSync("git init -q", { cwd: scaffoldRepo, stdio: ["ignore", "ignore", "ignore"] });
    const runScaffold = (args) =>
      execSync(`node plugins/cairn/scripts/cairn-scaffold.mjs ${args}`, { stdio: ["ignore", "pipe", "ignore"] }).toString();
    const out = JSON.parse(runScaffold(`delta-spec my-slug ${scaffoldRepo}`));
    for (const f of ["delta.md", "plan.md", "tasks.md", "proof.md"]) {
      if (!fs.existsSync(path.join(scaffoldRepo, ".cairn/changes/my-slug", f))) {
        fail(`cairn-scaffold.mjs did not create ${f}`);
      }
    }
    if (!fs.existsSync(path.join(scaffoldRepo, ".cairn/decision-log.md"))) {
      fail("cairn-scaffold.mjs did not seed .cairn/decision-log.md");
    }
    if (out.created.length !== 5) fail(`cairn-scaffold.mjs created ${out.created.length} files, expected 5`);
    const rerun = JSON.parse(runScaffold(`delta-spec my-slug ${scaffoldRepo}`));
    if (rerun.created.length !== 0) fail(`cairn-scaffold.mjs re-run was not idempotent (created ${rerun.created.length})`);
    let rejectedMode = 0;
    try { runScaffold(`direct nope ${scaffoldRepo}`); } catch { rejectedMode = 1; }
    if (rejectedMode !== 1) fail("cairn-scaffold.mjs did not reject a non-scaffolding mode");
  } catch (e) {
    fail(`scaffold smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(scaffoldRepo, { recursive: true, force: true });
  }

  const guardWorkspaceTmp = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-guard-workspace-"));
  const guardWorkspace = path.join(guardWorkspaceTmp, "workspace");
  const guardChild = path.join(guardWorkspace, "app");
  const guardSibling = path.join(guardWorkspace, "api");
  try {
    fs.mkdirSync(path.join(guardWorkspace, ".work"), { recursive: true });
    fs.mkdirSync(path.join(guardWorkspace, ".cairn"), { recursive: true }); // workspace adopted Cairn → guard active
    fs.mkdirSync(guardChild, { recursive: true });
    fs.mkdirSync(guardSibling, { recursive: true });
    execSync("git init -q", { cwd: guardChild, stdio: ["ignore", "ignore", "ignore"] });
    execSync("git init -q", { cwd: guardSibling, stdio: ["ignore", "ignore", "ignore"] });
    const parentState = runGuard({
      tool_name: "Edit",
      tool_input: { file_path: path.join(guardWorkspace, ".cairn/changes/demo/tasks.md") },
      cwd: guardChild,
    });
    const childState = runGuard({
      tool_name: "Edit",
      tool_input: { file_path: path.join(guardChild, ".cairn/changes/demo/tasks.md") },
      cwd: guardChild,
    });
    const siblingWrite = runGuard({
      tool_name: "Edit",
      tool_input: { file_path: path.join(guardSibling, "README.md") },
      cwd: guardChild,
    });
    const shellChildState = runGuard({
      tool_name: "Bash",
      tool_input: { command: "mkdir -p .cairn/changes/demo" },
      cwd: guardChild,
    });
    const shellParentState = runGuard({
      tool_name: "Bash",
      tool_input: { command: "mkdir -p ../.cairn/changes/demo" },
      cwd: guardChild,
    });
    const shellReadonly = runGuard({
      tool_name: "Bash",
      tool_input: { command: "find . -name .cairn -print" },
      cwd: guardChild,
    });
    if (parentState !== 0) fail(`cairn-guard.mjs blocked workspace parent .cairn state (exit ${parentState})`);
    if (childState !== 2) fail(`cairn-guard.mjs allowed child repo .cairn under a marked workspace (exit ${childState})`);
    if (siblingWrite !== 2) fail(`cairn-guard.mjs allowed sibling repo mutation from child cwd (exit ${siblingWrite})`);
    if (shellChildState !== 2) fail(`cairn-guard.mjs allowed shell-created child repo .cairn under a marked workspace (exit ${shellChildState})`);
    if (shellParentState !== 0) fail(`cairn-guard.mjs blocked shell-created parent workspace .cairn state (exit ${shellParentState})`);
    if (shellReadonly !== 0) fail(`cairn-guard.mjs blocked read-only shell inspection of .cairn (exit ${shellReadonly})`);
  } catch (e) {
    fail(`workspace guard smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(guardWorkspaceTmp, { recursive: true, force: true });
  }

  // Coherence Stop-hook smoke test: incoherent (declared tracked-change, no change folder in a
  // fresh repo) blocks once (exit 2); coherent and guarded cases pass (exit 0).
  const runCoherence = (event) => {
    try {
      execSync(`node plugins/cairn/scripts/cairn-coherence.mjs ${JSON.stringify(JSON.stringify(event))}`, {
        cwd: root,
        stdio: ["ignore", "ignore", "ignore"],
      });
      return 0;
    } catch (e) {
      return e.status ?? 1;
    }
  };
  const freshRepo = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-coh-"));
  try {
    execSync("git init -q", { cwd: freshRepo, stdio: ["ignore", "ignore", "ignore"] });
    const declared = "Mode: tracked-change\n\nWork done.";
    // Blast-radius gate: a repo with no .cairn/ stays silent even on a declared mode.
    const notAdopted = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: freshRepo });
    if (notAdopted !== 0) fail(`cairn-coherence.mjs nagged a non-Cairn repo (no .cairn/) (exit ${notAdopted})`);
    // Adopt Cairn (the .cairn/ dir exists) but no change folder yet → declared mode blocks once.
    fs.mkdirSync(path.join(freshRepo, ".cairn"), { recursive: true });
    const incoherent = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: freshRepo });
    if (incoherent !== 2) fail(`cairn-coherence.mjs did not block a declared mode with no change folder (exit ${incoherent})`);
    const looped = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: freshRepo, stop_hook_active: true });
    if (looped !== 0) fail(`cairn-coherence.mjs did not respect stop_hook_active (exit ${looped})`);
    const directMode = runCoherence({ hook_event_name: "Stop", last_assistant_message: "Mode: direct\n\nFixed.", cwd: freshRepo });
    if (directMode !== 0) fail(`cairn-coherence.mjs blocked a non-folder mode (direct) (exit ${directMode})`);
    // Claude Code path: no last_assistant_message, read the Mode line from a transcript tail.
    const transcript = path.join(freshRepo, "transcript.jsonl");
    fs.writeFileSync(transcript, [
      JSON.stringify({ type: "user", message: { role: "user", content: "do the migration" } }),
      JSON.stringify({ type: "assistant", message: { role: "assistant", content: [{ type: "text", text: "Mode: tracked-change\n\nStarting." }] } }),
    ].join("\n") + "\n");
    const viaTranscript = runCoherence({ hook_event_name: "Stop", transcript_path: transcript, cwd: freshRepo });
    if (viaTranscript !== 2) fail(`cairn-coherence.mjs did not read declared mode from transcript tail (exit ${viaTranscript})`);
    // Folder present: coherent, passes.
    fs.mkdirSync(path.join(freshRepo, ".cairn/changes/demo"), { recursive: true });
    const coherent = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: freshRepo });
    if (coherent !== 0) fail(`cairn-coherence.mjs blocked when a change folder exists (exit ${coherent})`);
  } catch (e) {
    fail(`cairn-coherence.mjs smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(freshRepo, { recursive: true, force: true });
  }

  const cohWorkspaceTmp = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-coh-workspace-"));
  const cohWorkspace = path.join(cohWorkspaceTmp, "workspace");
  const cohChild = path.join(cohWorkspace, "app");
  const cohSibling = path.join(cohWorkspace, "api");
  try {
    fs.mkdirSync(path.join(cohWorkspace, ".work"), { recursive: true });
    fs.mkdirSync(cohChild, { recursive: true });
    fs.mkdirSync(cohSibling, { recursive: true });
    execSync("git init -q", { cwd: cohChild, stdio: ["ignore", "ignore", "ignore"] });
    execSync("git init -q", { cwd: cohSibling, stdio: ["ignore", "ignore", "ignore"] });
    const declared = "Mode: tracked-change\n\nWork done.";
    // Parent not adopted yet and no misplaced child state: stays silent.
    const workspaceNotAdopted = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: cohChild });
    if (workspaceNotAdopted !== 0) fail(`cairn-coherence.mjs nagged a clean non-adopted workspace (exit ${workspaceNotAdopted})`);
    // Misplaced child .cairn in a marked workspace is always a declared-mode error.
    fs.mkdirSync(path.join(cohChild, ".cairn"), { recursive: true });
    const misplacedChildState = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: cohChild });
    if (misplacedChildState !== 2) fail(`cairn-coherence.mjs did not block misplaced child .cairn in workspace (exit ${misplacedChildState})`);
    const directMisplacedChildState = runCoherence({ hook_event_name: "Stop", last_assistant_message: "Mode: direct\n\nDone.", cwd: cohChild });
    if (directMisplacedChildState !== 2) fail(`cairn-coherence.mjs did not block misplaced child .cairn on direct close (exit ${directMisplacedChildState})`);
    fs.rmSync(path.join(cohChild, ".cairn"), { recursive: true, force: true });
    fs.mkdirSync(path.join(cohWorkspace, ".cairn"), { recursive: true });
    const workspaceIncoherent = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: cohChild });
    if (workspaceIncoherent !== 2) fail(`cairn-coherence.mjs did not check parent workspace .cairn changes (exit ${workspaceIncoherent})`);
    fs.mkdirSync(path.join(cohWorkspace, ".cairn/changes/demo"), { recursive: true });
    const workspaceCoherent = runCoherence({ hook_event_name: "Stop", last_assistant_message: declared, cwd: cohChild });
    if (workspaceCoherent !== 0) fail(`cairn-coherence.mjs blocked coherent parent workspace state (exit ${workspaceCoherent})`);
  } catch (e) {
    fail(`workspace coherence smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(cohWorkspaceTmp, { recursive: true, force: true });
  }

  // Version resolver smoke test: must emit valid JSON with a found[] array.
  try {
    const out = execSync("node plugins/cairn/scripts/cairn-version.mjs nonexistent-pkg", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const v = JSON.parse(out);
    if (!Array.isArray(v.found)) fail("cairn-version.mjs did not emit a found[] array");
  } catch (e) {
    fail(`cairn-version.mjs failed to run: ${e.message}`);
  }

  // Context budget report: keeps always-on bootstrap and progressive references from bloating.
  try {
    const out = execSync("node plugins/cairn/scripts/cairn-budget.mjs --json", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const budget = JSON.parse(out);
    if (!budget.ok) fail("cairn-budget.mjs reported context budget findings");
    const bootstrap = budget.surfaces.find((row) => row.name === "bootstrap");
    if (!bootstrap || bootstrap.alwaysOn !== true) {
      fail("cairn-budget.mjs missing always-on bootstrap surface");
    }
    if (!budget.aggregates.some((row) => row.name === "whole-skill-package")) {
      fail("cairn-budget.mjs missing whole-skill-package aggregate");
    }
  } catch (e) {
    fail(`cairn-budget.mjs failed to run: ${e.message}`);
  }

  // State helpers smoke test: must emit valid JSON on a minimal change folder.
  const tmp = fs.mkdtempSync(path.join(fs.realpathSync("/tmp"), "cairn-validate-"));
  try {
    const change = path.join(tmp, ".cairn/changes/demo");
    fs.mkdirSync(change, { recursive: true });
    fs.writeFileSync(path.join(change, "delta.md"), "# Delta\n");
    fs.writeFileSync(path.join(change, "plan.md"), "# Plan\n");
    fs.writeFileSync(path.join(change, "tasks.md"), "# Tasks\n\n- [ ] step\n");
    fs.writeFileSync(path.join(change, "proof.md"), "# Proof\n\nPending final run.\n");
    const analyzeOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(change)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const analyze = JSON.parse(analyzeOut);
    if (!Array.isArray(analyze.findings)) fail("cairn-analyze.mjs did not emit findings[]");
    const goodSemantic = path.join(tmp, ".cairn/changes/good-semantic");
    fs.mkdirSync(goodSemantic, { recursive: true });
    fs.writeFileSync(path.join(goodSemantic, "delta.md"), [
      "# Delta",
      "",
      "## Semantic Claims",
      "",
      "- Demo behavior is implemented; code: `README.md`; proof: `node scripts/validate-cairn.mjs`",
      "",
    ].join("\n"));
    const goodOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(goodSemantic)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const good = JSON.parse(goodOut);
    if (good.findings.some((f) => f.code?.startsWith("SEMANTIC_"))) {
      fail("cairn-analyze.mjs flagged a valid semantic claim");
    }
    const badSemantic = path.join(tmp, ".cairn/changes/bad-semantic");
    fs.mkdirSync(badSemantic, { recursive: true });
    fs.writeFileSync(path.join(badSemantic, "delta.md"), [
      "# Delta",
      "",
      "## Semantic Claims",
      "",
      "- Missing implementation reference; code: `missing/path.js`",
      "",
    ].join("\n"));
    const badOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(badSemantic)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const bad = JSON.parse(badOut);
    if (!bad.findings.some((f) => f.code === "SEMANTIC_REF_MISSING")) {
      fail("cairn-analyze.mjs did not flag a missing semantic code reference");
    }
    if (!bad.findings.some((f) => f.code === "SEMANTIC_CLAIM_WITHOUT_PROOF")) {
      fail("cairn-analyze.mjs did not flag a semantic claim without proof");
    }
    const implicitGood = path.join(tmp, ".cairn/changes/implicit-good");
    fs.mkdirSync(implicitGood, { recursive: true });
    fs.writeFileSync(path.join(implicitGood, "delta.md"), [
      "# Delta",
      "",
      "## Proposed Behavior",
      "",
      "- Add CSV escaping behavior in `plugins/cairn/scripts/cairn-analyze.mjs`.",
      "- Validate it with `node scripts/validate-cairn.mjs`.",
      "",
    ].join("\n"));
    const implicitGoodOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(implicitGood)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const implicitGoodJson = JSON.parse(implicitGoodOut);
    if (implicitGoodJson.findings.some((f) => /^SEMANTIC_|^INFERRED_/.test(f.code || ""))) {
      fail("cairn-analyze.mjs flagged implicit behavior prose with code and proof coverage");
    }
    const implicitMissingProof = path.join(tmp, ".cairn/changes/implicit-missing-proof");
    fs.mkdirSync(implicitMissingProof, { recursive: true });
    fs.writeFileSync(path.join(implicitMissingProof, "delta.md"), [
      "# Delta",
      "",
      "## Proposed Behavior",
      "",
      "- Add CSV escaping behavior in `plugins/cairn/scripts/cairn-analyze.mjs`.",
      "",
    ].join("\n"));
    const missingProofOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(implicitMissingProof)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const missingProof = JSON.parse(missingProofOut);
    if (!missingProof.findings.some((f) => f.code === "INFERRED_BEHAVIOR_WITHOUT_PROOF")) {
      fail("cairn-analyze.mjs did not flag implicit behavior with code refs but no proof");
    }
    const implicitMissingCode = path.join(tmp, ".cairn/changes/implicit-missing-code");
    fs.mkdirSync(implicitMissingCode, { recursive: true });
    fs.writeFileSync(path.join(implicitMissingCode, "delta.md"), [
      "# Delta",
      "",
      "## Proposed Behavior",
      "",
      "- Add CSV escaping behavior and validate it with `node scripts/validate-cairn.mjs`.",
      "",
    ].join("\n"));
    const missingCodeOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(implicitMissingCode)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const missingCode = JSON.parse(missingCodeOut);
    if (!missingCode.findings.some((f) => f.code === "INFERRED_BEHAVIOR_WITHOUT_CODE")) {
      fail("cairn-analyze.mjs did not flag implicit behavior with proof but no code refs");
    }
    const implicitMissingRef = path.join(tmp, ".cairn/changes/implicit-missing-ref");
    fs.mkdirSync(implicitMissingRef, { recursive: true });
    fs.writeFileSync(path.join(implicitMissingRef, "delta.md"), [
      "# Delta",
      "",
      "## Proposed Behavior",
      "",
      "- Add CSV escaping behavior in `missing/path.mjs`.",
      "- Validate it with `node scripts/validate-cairn.mjs`.",
      "",
    ].join("\n"));
    const missingRefOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} ${JSON.stringify(implicitMissingRef)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const missingRef = JSON.parse(missingRefOut);
    if (!missingRef.findings.some((f) => f.code === "INFERRED_SEMANTIC_REF_MISSING")) {
      fail("cairn-analyze.mjs did not flag missing inferred code reference");
    }
    const specRoot = path.join(tmp, ".cairn/specs");
    fs.mkdirSync(specRoot, { recursive: true });
    fs.writeFileSync(path.join(specRoot, "bad-spec.md"), [
      "# Spec: Bad",
      "",
      "## Semantic Claims",
      "",
      "- Missing implementation reference; code: `missing/spec-code.js`; proof: `node scripts/validate-cairn.mjs`",
      "",
    ].join("\n"));
    const badSpecOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-analyze.mjs"))} --spec-root ${JSON.stringify(specRoot)} ${JSON.stringify(change)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const badSpec = JSON.parse(badSpecOut);
    if (!badSpec.findings.some((f) => f.code === "SEMANTIC_REF_MISSING" && /missing\/spec-code\.js/.test(f.message))) {
      fail("cairn-analyze.mjs did not flag a missing semantic code reference in a living spec");
    }
    const nextOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-next.mjs"))} ${JSON.stringify(change)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const next = JSON.parse(nextOut);
    if (!next.next?.code) fail("cairn-next.mjs did not emit next.code");
    fs.writeFileSync(path.join(change, "tasks.md"), "# Tasks\n\n- [x] step — proof: demo\n");
    fs.writeFileSync(path.join(change, "proof.md"), [
      "# Proof",
      "",
      "## Lifecycle Decision",
      "",
      "Lifecycle decision: sync — demo",
      "",
    ].join("\n"));
    const retentionOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-retention.mjs"))} ${JSON.stringify(path.join(tmp, ".cairn/changes"))}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const retention = JSON.parse(retentionOut);
    if (!retention.actionable?.some((item) => item.slug === "demo" && item.action === "archive")) {
      fail("cairn-retention.mjs did not recommend archiving a completed change with lifecycle decision");
    }
    const retentionApplyOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-retention.mjs"))} ${JSON.stringify(path.join(tmp, ".cairn/changes"))} --apply --slug demo`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const retentionApply = JSON.parse(retentionApplyOut);
    if (!retentionApply.applied?.some((item) => item.slug === "demo" && item.applied && item.action === "archive")) {
      fail("cairn-retention.mjs --apply did not archive a completed change with lifecycle decision");
    }
    if (fs.existsSync(change)) fail("cairn-retention.mjs --apply left the active change folder in place");
    if (!fs.existsSync(path.join(tmp, ".cairn/changes/archive"))) {
      fail("cairn-retention.mjs --apply did not create an archive root");
    }
    const collision = path.join(tmp, ".cairn/changes/collision");
    fs.mkdirSync(collision, { recursive: true });
    fs.writeFileSync(path.join(collision, "tasks.md"), "# Tasks\n\n- [x] step — proof: demo\n");
    fs.writeFileSync(path.join(collision, "proof.md"), "# Proof\n\nLifecycle decision: archive — demo\n");
    const collisionTarget = path.join(tmp, ".cairn/changes/archive", `${new Date().toISOString().slice(0, 10)}-collision`);
    fs.mkdirSync(collisionTarget, { recursive: true });
    try {
      execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-retention.mjs"))} ${JSON.stringify(path.join(tmp, ".cairn/changes"))} --apply --slug collision`, {
        cwd: root,
        stdio: ["ignore", "pipe", "ignore"],
      });
      fail("cairn-retention.mjs --apply did not refuse an archive target collision");
    } catch {
      // expected
    }
    const incomplete = path.join(tmp, ".cairn/changes/incomplete");
    fs.mkdirSync(incomplete, { recursive: true });
    fs.writeFileSync(path.join(incomplete, "tasks.md"), "# Tasks\n\n- [ ] step\n");
    fs.writeFileSync(path.join(incomplete, "proof.md"), "# Proof\n\nLifecycle decision: archive — demo\n");
    try {
      execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-retention.mjs"))} ${JSON.stringify(path.join(tmp, ".cairn/changes"))} --apply --slug incomplete`, {
        cwd: root,
        stdio: ["ignore", "pipe", "ignore"],
      });
      fail("cairn-retention.mjs --apply did not refuse an incomplete change");
    } catch {
      // expected
    }
  } catch (e) {
    fail(`state helper smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  // Eval docs must not claim recorded proof without matching JSONL summaries.
  const evalExpectations = [
    {
      file: "docs/evals/results/cairn-realistic-codex-0.136-default.jsonl",
      cases: 7,
      mustFire: 7,
      mustFire_fired: 7,
      mustFire_routedRight: 7,
    },
    {
      // Strongest realistic proof: full 14-case suite, all fired and routed (2026-06-02).
      file: "docs/evals/results/cairn-realistic-codex-0.136-default-full.jsonl",
      harness: "codex",
      cases: 14,
      mustFire: 14,
      mustFire_fired: 14,
      mustFire_routedRight: 14,
      mustNot: 0,
      mustNot_misfired: 0,
      errors: 0,
    },
    {
      // Small-model floor: haiku does the work but skips the Mode: contract on R5/R11.
      file: "docs/evals/results/cairn-p0-matrix-claude-2.1.160-haiku.jsonl",
      harness: "claude",
      model: "haiku",
      cases: 6,
      mustFire: 3,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 3,
      mustNot_misfired: 0,
      errors: 0,
    },
    {
      file: "docs/evals/results/cairn-nofire-after-scope-codex-0.136-default.jsonl",
      cases: 6,
      mustNot: 6,
      mustNot_misfired: 0,
    },
    {
      file: "docs/evals/results/cairn-fast-codex-0.136-default.jsonl",
      harness: "codex",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
    },
    {
      file: "docs/evals/results/cairn-fast-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
    },
    {
      file: "docs/evals/results/cairn-broad-codex-0.136-default.jsonl",
      harness: "codex",
      cases: 13,
      mustFire: 7,
      mustFire_fired: 7,
      mustFire_routedRight: 7,
      mustNot: 6,
      mustNot_misfired: 0,
    },
    {
      file: "docs/evals/results/cairn-broad-fast-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 5,
      mustFire: 2,
      mustFire_fired: 2,
      mustFire_routedRight: 2,
      mustNot: 3,
      mustNot_misfired: 0,
    },
    {
      file: "docs/evals/results/cairn-realistic-nofire-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 6,
      mustNot: 6,
      mustNot_misfired: 0,
      errors: 0,
    },
    {
      file: "docs/evals/results/cairn-realistic-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 14,
      mustFire: 14,
      mustFire_fired: 14,
      mustFire_routedRight: 12,
      errors: 3,
    },
    {
      file: "docs/evals/results/cairn-p0-matrix-codex-0.136-default.jsonl",
      harness: "codex",
      cases: 6,
      mustFire: 3,
      mustFire_fired: 3,
      mustFire_routedRight: 3,
      mustNot: 3,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-p0-matrix-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 6,
      mustFire: 3,
      mustFire_fired: 3,
      mustFire_routedRight: 2,
      mustNot: 3,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-fast-claude-2.1.159-haiku.jsonl",
      harness: "claude",
      model: "haiku",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-fast-codex-0.136-gpt-5.4-mini.jsonl",
      harness: "codex",
      model: "gpt-5.4-mini",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 0,
      mustNot: 1,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini.jsonl",
      harness: "codex",
      model: "gpt-5.4-mini",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-route-contract-claude-2.1.159-default.jsonl",
      harness: "claude",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-route-contract-claude-r14-2.1.159-default.jsonl",
      harness: "claude",
      cases: 2,
      mustFire: 1,
      mustFire_fired: 1,
      mustFire_routedRight: 1,
      mustNot: 1,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-p0-matrix-codex-0.136-context-budget.jsonl",
      harness: "codex",
      cases: 6,
      mustFire: 3,
      mustFire_fired: 3,
      mustFire_routedRight: 3,
      mustNot: 3,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-p0-matrix-codex-0.136-gpt-5.4-mini.jsonl",
      harness: "codex",
      model: "gpt-5.4-mini",
      cases: 6,
      mustFire: 3,
      mustFire_fired: 3,
      mustFire_routedRight: 3,
      mustNot: 3,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-realistic-codex-0.136-gpt-5.4-mini.jsonl",
      harness: "codex",
      model: "gpt-5.4-mini",
      cases: 14,
      mustFire: 14,
      mustFire_fired: 13,
      mustFire_routedRight: 12,
      mustNot: 0,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
    {
      file: "docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps.jsonl",
      harness: "codex",
      model: "gpt-5.4-mini",
      cases: 4,
      mustFire: 2,
      mustFire_fired: 2,
      mustFire_routedRight: 2,
      mustNot: 2,
      mustNot_misfired: 0,
      errors: 0,
      requiredKeys: ["totalDurationMs", "maxDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds"],
    },
  ];
  for (const expected of evalExpectations) {
    if (!fs.existsSync(path.join(root, expected.file))) {
      fail(`missing eval result claimed by docs: ${expected.file}`);
      continue;
    }
    try {
      const summary = readJsonlSummary(expected.file);
      if (!summary) {
        fail(`eval result has no summary row: ${expected.file}`);
        continue;
      }
      for (const key of expected.requiredKeys || []) {
        if (!(key in summary)) {
          fail(`eval result ${expected.file} missing summary key: ${key}`);
        }
      }
      for (const [key, value] of Object.entries(expected)) {
        if (["file", "requiredKeys"].includes(key)) continue;
        if (summary[key] !== value) {
          fail(`eval result ${expected.file} expected ${key}=${value}, got ${summary[key]}`);
        }
      }
    } catch (e) {
      fail(`eval result is not valid JSONL: ${expected.file}: ${e.message}`);
    }
  }

  // Eval scoreboard smoke test: must summarize historical/current state without hand-reading JSONL.
  try {
    const out = execSync("node scripts/eval-scoreboard.mjs --json", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const scoreboard = JSON.parse(out);
    if (!Array.isArray(scoreboard.rows) || scoreboard.rows.length < 10) {
      fail("eval-scoreboard.mjs emitted too few rows");
    }
    if (!Array.isArray(scoreboard.p0Ids) || scoreboard.p0Ids.join(",") !== "R5,R10,R11,N2,N7,N11") {
      fail("eval-scoreboard.mjs has the wrong p0Ids contract");
    }
    if (!Array.isArray(scoreboard.missingCoverage) || !scoreboard.missingCoverage.some((gap) => gap.includes("fewer than two"))) {
      fail("eval-scoreboard.mjs did not report second-model coverage gaps");
    }
    if (!Array.isArray(scoreboard.slowCases) || !scoreboard.slowCases.some((row) => row.nearTimeout)) {
      fail("eval-scoreboard.mjs did not surface near-timeout slow cases");
    }
    if (!scoreboard.nextCommand?.command?.includes("eval-autotrigger.mjs")) {
      fail("eval-scoreboard.mjs did not emit a next eval command");
    }
    if (scoreboard.nextCommand?.command?.includes("realistic-gaps-rerun") && !scoreboard.nextCommand.command.includes("R14")) {
      fail("eval-scoreboard.mjs focused rerun must include timeout diagnostics such as R14");
    }
    const nextLabel = scoreboard.nextCommand?.command?.match(/eval-autotrigger\.mjs\s+\S+\s+([^\s]+)/)?.[1];
    if (!nextLabel || fs.existsSync(path.join(root, "docs/evals/results", `${nextLabel}.jsonl`))) {
      fail("eval-scoreboard.mjs next command must use a fresh immutable result label");
    }
    const claudeP0 = scoreboard.rows.find((row) => row.label === "cairn-p0-matrix-claude-2.1.159-default");
    if (!claudeP0?.clearedRoutingMissIds?.includes("R11")) {
      fail("eval-scoreboard.mjs did not mark Claude R11 as cleared by route-contract retest");
    }
    const codexMiniFast = scoreboard.rows.find((row) => row.label === "cairn-fast-codex-0.136-gpt-5.4-mini");
    if (!codexMiniFast?.clearedRoutingMissIds?.includes("R5")) {
      fail("eval-scoreboard.mjs did not mark Codex mini R5 as cleared by route-contract retest");
    }
    const codexMiniRealistic = scoreboard.rows.find((row) => row.label === "cairn-realistic-codex-0.136-gpt-5.4-mini");
    if (!codexMiniRealistic?.clearedFireMissIds?.includes("R9") || !codexMiniRealistic?.clearedRoutingMissIds?.includes("R14")) {
      fail("eval-scoreboard.mjs did not mark Codex mini realistic gaps as cleared by focused route-contract retest");
    }
    if (!scoreboard.missingCoverage?.includes("codex: fewer than two passing realistic must-fire models")) {
      fail("eval-scoreboard.mjs must keep full Codex realistic coverage pending after focused retest");
    }
    const realisticClaude = scoreboard.rows.find((row) => row.label === "cairn-realistic-claude-2.1.159-default");
    if (!realisticClaude?.timeoutIds?.includes("R3") || !realisticClaude?.timeoutIds?.includes("R6") || !realisticClaude?.timeoutIds?.includes("R7")) {
      fail("eval-scoreboard.mjs did not recompute Claude realistic timeout ids");
    }
  } catch (e) {
    fail(`eval-scoreboard.mjs failed to run: ${e.message}`);
  }

  const evalScript = read("scripts/eval-autotrigger.mjs");
  const evalDocs = read("docs/evals/auto-trigger.md");
  for (const needle of ["p0-matrix", "infra-lens", "answerText", "answerTail", "totalDurationMs", "slowCases", "fireMissIds", "routingMissIds", "diagnosticIds", "timeoutIds", "--out", "--dry-run", "--overwrite"]) {
    if (!evalScript.includes(needle)) {
      fail(`eval runner missing expected matrix support: ${needle}`);
    }
    if (!evalDocs.includes(needle)) {
      fail(`eval docs missing expected matrix support: ${needle}`);
    }
  }
  for (const id of ["R8", "R9", "R10", "R11", "R12", "R13", "R14", "N7", "N8", "N9", "N10", "N11", "N12"]) {
    if (!new RegExp(`id:\\s*["']${id}["']`).test(evalScript)) {
      fail(`eval runner missing broad-scope case ${id}`);
    }
    if (!new RegExp(`\\|\\s*${id}\\s*\\|`).test(evalDocs)) {
      fail(`eval docs missing broad-scope case ${id}`);
    }
  }
  for (const id of ["I1", "I2", "I3"]) {
    if (!new RegExp(`id:\\s*["']${id}["']`).test(evalScript)) {
      fail(`eval runner missing infra-lens case ${id}`);
    }
    if (!new RegExp(`\\|\\s*${id}\\s*\\|`).test(evalDocs)) {
      fail(`eval docs missing infra-lens case ${id}`);
    }
  }
  try {
    const help = execSync("node scripts/eval-autotrigger.mjs --help", {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
    }).toString();
    if (!help.includes("--out docs/evals/results/<label>.jsonl")) {
      fail("eval runner --help missing explicit --out usage");
    }
    if (!help.includes("--overwrite")) {
      fail("eval runner --help missing explicit --overwrite usage");
    }
    if (!help.includes("--dry-run")) {
      fail("eval runner --help missing explicit --dry-run usage");
    }
  } catch (e) {
    fail(`eval runner --help failed: ${e.message}`);
  }
  const expectEvalArgFailure = (cmd, expectedText) => {
    try {
      execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
      fail(`eval runner accepted invalid args: ${cmd}`);
    } catch (e) {
      const text = `${e.stdout || ""}${e.stderr || ""}`;
      if (!text.includes(expectedText)) {
        fail(`eval runner invalid-arg output missing '${expectedText}' for: ${cmd}`);
      }
    }
  };
  expectEvalArgFailure("node scripts/eval-autotrigger.mjs R5,N2 --unknown", "unknown option");
  expectEvalArgFailure("node scripts/eval-autotrigger.mjs R5,N2 --harness codex", "missing label");
  expectEvalArgFailure("node scripts/eval-autotrigger.mjs R5,N2 --out docs/evals/results/--out.jsonl", "invalid --out filename");
  expectEvalArgFailure("node scripts/eval-autotrigger.mjs R5,N2 --out /tmp/cairn-bad.jsonl", "--out must stay under docs/evals/results");
  const overwriteProbeRel = `docs/evals/results/validate-overwrite-probe-${process.pid}.jsonl`;
  const overwriteProbeAbs = path.join(root, overwriteProbeRel);
  try {
    fs.writeFileSync(overwriteProbeAbs, "{\"summary\":{\"label\":\"validate-overwrite-probe\"}}\n");
    expectEvalArgFailure(`node scripts/eval-autotrigger.mjs R5 --dry-run --out ${overwriteProbeRel}`, "output already exists");
  } finally {
    fs.rmSync(overwriteProbeAbs, { force: true });
  }

  // Researcher agent frontmatter.
  const agent = read("plugins/cairn/agents/cairn-researcher.md");
  const agentFm = agent.match(/^---\n([\s\S]*?)\n---/);
  if (!agentFm || !/^name:\s*cairn-researcher\s*$/m.test(agentFm[1])) {
    fail("cairn-researcher.md missing name: cairn-researcher in frontmatter");
  } else {
    yamlColonCheck(agentFm[1], "cairn-researcher.md");
  }
}

if (errors.length) {
  console.error("cairn validation FAILED:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`cairn validation passed (${required.length} files, manifests + marketplaces + SKILL + hooks checked)`);
