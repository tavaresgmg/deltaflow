// Local structural validation for the minimal Cairn plugin core.
//   node scripts/validate-cairn.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel) => JSON.parse(read(rel));

const required = [
  "README.md",
  "AGENTS.md",
  "CLAUDE.md",
  "docs/PRINCIPLES.md",
  "docs/ARCHITECTURE.md",
  "docs/ROADMAP.md",
  "docs/DECISIONS.md",
  "docs/DEVELOPMENT.md",
  "docs/RESEARCH.md",
  "docs/INSTALL.md",
  "plugins/cairn/plugin.manifest.json",
  "plugins/cairn/.codex-plugin/plugin.json",
  "plugins/cairn/.claude-plugin/plugin.json",
  "plugins/cairn/hooks/bootstrap.md",
  "plugins/cairn/hooks/session-start.sh",
  "plugins/cairn/hooks/user-prompt-submit.sh",
  "plugins/cairn/hooks/hooks.json",
  "plugins/cairn/scripts/cairn-anchor.mjs",
  "plugins/cairn/scripts/cairn-close.mjs",
  "plugins/cairn/scripts/cairn-coherence.mjs",
  "plugins/cairn/scripts/cairn-guard.mjs",
  "plugins/cairn/scripts/cairn-scaffold.mjs",
  "plugins/cairn/scripts/cairn-workspace.mjs",
  "plugins/cairn/skills/cairn/SKILL.md",
  "plugins/cairn/skills/cairn/references/modes.md",
  "plugins/cairn/skills/cairn/references/workflow.md",
  "plugins/cairn/skills/cairn/references/review.md",
  "plugins/cairn/skills/cairn/references/artifacts.md",
  "plugins/cairn/skills/cairn/references/memory.md",
  "plugins/cairn/skills/cairn/references/research.md",
  "plugins/cairn/skills/cairn/references/workspace.md",
  "plugins/cairn/skills/cairn/references/gates.md",
  "plugins/cairn/skills/cairn/references/framework-lessons.md",
  "plugins/cairn/skills/cairn/templates/brainstorm.md",
  "plugins/cairn/skills/cairn/templates/brief.md",
  "plugins/cairn/skills/cairn/templates/codebase-map.md",
  "plugins/cairn/skills/cairn/templates/decision-log.md",
  "plugins/cairn/skills/cairn/templates/delta.md",
  "plugins/cairn/skills/cairn/templates/plan.md",
  "plugins/cairn/skills/cairn/templates/proof.md",
  "plugins/cairn/skills/cairn/templates/queue.md",
  "plugins/cairn/skills/cairn/templates/spec.md",
  "plugins/cairn/skills/cairn/templates/tasks.md",
  "scripts/build-manifests.mjs",
  "scripts/validate-cairn.mjs",
  ".claude-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
];

const removed = [
  "docs/evals",
  "scripts/eval-autotrigger.mjs",
  "scripts/eval-scoreboard.mjs",
  "plugins/cairn/scripts/cairn-analyze.mjs",
  "plugins/cairn/scripts/cairn-anchor-policy.mjs",
  "plugins/cairn/scripts/cairn-boundary.mjs",
  "plugins/cairn/scripts/cairn-budget.mjs",
  "plugins/cairn/scripts/cairn-doctor.mjs",
  "plugins/cairn/scripts/cairn-next.mjs",
  "plugins/cairn/scripts/cairn-retention.mjs",
  "plugins/cairn/scripts/cairn-version.mjs",
  "plugins/cairn/agents/cairn-researcher.md",
];

for (const f of required) {
  if (!fs.existsSync(path.join(root, f))) fail(`missing required file: ${f}`);
}
for (const f of removed) {
  if (fs.existsSync(path.join(root, f))) fail(`removed surface still exists: ${f}`);
}

function yamlColonCheck(block, label) {
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(\S.*)$/);
    if (!m) continue;
    if (/^["'|>]/.test(m[2])) continue;
    if (/:\s/.test(m[2])) fail(`${label} frontmatter '${m[1]}' has an unquoted colon`);
  }
}

function sameJson(a, b) {
  return JSON.stringify(a, null, 2) === JSON.stringify(b, null, 2);
}

function run(cmd, options = {}) {
  return execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"], ...options }).toString();
}

if (!errors.length) {
  if (!read("CLAUDE.md").includes("@AGENTS.md")) {
    fail("CLAUDE.md must import AGENTS.md via @AGENTS.md");
  }

  for (const file of [
    "scripts/build-manifests.mjs",
    "scripts/validate-cairn.mjs",
    "plugins/cairn/scripts/cairn-anchor.mjs",
    "plugins/cairn/scripts/cairn-close.mjs",
    "plugins/cairn/scripts/cairn-coherence.mjs",
    "plugins/cairn/scripts/cairn-guard.mjs",
    "plugins/cairn/scripts/cairn-scaffold.mjs",
    "plugins/cairn/scripts/cairn-workspace.mjs",
  ]) {
    try {
      run(`node --check ${JSON.stringify(file)}`);
    } catch (e) {
      fail(`node --check failed for ${file}: ${e.stderr || e.message}`);
    }
  }

  const canonical = readJson("plugins/cairn/plugin.manifest.json");
  const { name, version, description, author, homepage, license, keywords, skills, interface: iface } = canonical;
  const expectedCodex = { name, version, description, author, skills, interface: iface };
  const expectedClaude = { name, version, description, author, homepage, license, keywords };
  if (!sameJson(readJson("plugins/cairn/.codex-plugin/plugin.json"), expectedCodex)) {
    fail("codex plugin.json is stale; run node scripts/build-manifests.mjs");
  }
  if (!sameJson(readJson("plugins/cairn/.claude-plugin/plugin.json"), expectedClaude)) {
    fail("claude plugin.json is stale; run node scripts/build-manifests.mjs");
  }

  const expectedMarketplace = {
    name,
    owner: author,
    plugins: [{ name, source: "./plugins/cairn", description }],
  };
  for (const rel of [".claude-plugin/marketplace.json", ".agents/plugins/marketplace.json"]) {
    if (!sameJson(readJson(rel), expectedMarketplace)) {
      fail(`${rel} is stale; run node scripts/build-manifests.mjs`);
    }
  }

  const skill = read("plugins/cairn/skills/cairn/SKILL.md");
  const fm = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) {
    fail("SKILL.md missing frontmatter");
  } else {
    yamlColonCheck(fm[1], "SKILL.md");
    if (!/^name:\s*cairn\s*$/m.test(fm[1])) fail("SKILL.md name must be cairn");
    const desc = fm[1].match(/^description:\s*(.+)$/m)?.[1]?.trim() || "";
    if (!/^".*"$/.test(desc)) fail("SKILL.md description must be double-quoted");
    if (!/ALWAYS/.test(desc.slice(0, 250))) fail("SKILL.md description must front-load ALWAYS");
  }
  for (const needle of ["Classify", "Proof", "Mode: <direct|diagnose|discovery|delta-spec|tracked-change>"]) {
    if (!skill.includes(needle)) fail(`SKILL.md missing ${needle}`);
  }

  const hooks = JSON.stringify(readJson("plugins/cairn/hooks/hooks.json"));
  for (const needle of [
    "SessionStart",
    "hooks/session-start.sh",
    "UserPromptSubmit",
    "hooks/user-prompt-submit.sh",
    "PreToolUse",
    "cairn-guard.mjs",
    "Stop",
    "cairn-coherence.mjs",
  ]) {
    if (!hooks.includes(needle)) fail(`hooks.json missing ${needle}`);
  }

  const bootstrap = read("plugins/cairn/hooks/bootstrap.md");
  if (bootstrap.length > 1400) fail("bootstrap is too large");
  if (!bootstrap.includes("Observe") || !bootstrap.includes("Verify fresh proof")) {
    fail("bootstrap missing core loop");
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cairn-min-"));
  try {
    execSync("git init -q", { cwd: tmp, stdio: ["ignore", "ignore", "ignore"] });

    const scaffold = JSON.parse(run(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-scaffold.mjs"))} tracked-change mini ${JSON.stringify(tmp)}`));
    for (const rel of [
      ".cairn/changes/mini/brainstorm.md",
      ".cairn/changes/mini/delta.md",
      ".cairn/changes/mini/plan.md",
      ".cairn/changes/mini/tasks.md",
      ".cairn/changes/mini/proof.md",
    ]) {
      if (!fs.existsSync(path.join(tmp, rel))) fail(`scaffold did not create ${rel}`);
    }
    if (!fs.existsSync(path.join(tmp, ".cairn/decision-log.md"))) fail("scaffold did not seed decision-log.md");
    const createdChangeFiles = scaffold.created.filter((rel) => rel.startsWith(".cairn/changes/mini/"));
    if (createdChangeFiles.length !== 5) fail("scaffold should create five tracked-change files");

    const change = path.join(tmp, ".cairn/changes/mini");
    fs.writeFileSync(path.join(change, "tasks.md"), "# Tasks\n\n- [x] step — proof: demo\n");
    fs.writeFileSync(path.join(change, "delta.md"), [
      "# Delta",
      "",
      "## Semantic Claims",
      "",
      "- Demo docs exist; code: `README.md`; proof: `node scripts/validate-cairn.mjs`",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(change, "proof.md"), [
      "# Proof",
      "",
      "## Commands",
      "",
      "- demo — passed",
      "",
      "## Lifecycle Decision",
      "",
      "Lifecycle decision: archive — demo",
      "",
      "## Context Learned",
      "",
      "Context learned: none",
      "",
    ].join("\n"));

    const close = JSON.parse(run(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-close.mjs"))} ${JSON.stringify(change)}`));
    if (close.verify?.verdict !== "verified") fail("cairn-close.mjs did not verify a complete change");

    const applied = JSON.parse(run(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-close.mjs"))} ${JSON.stringify(change)} --apply`));
    if (!applied.applied?.applied || applied.applied.action !== "archive") {
      fail("cairn-close.mjs --apply did not archive a verified change");
    }

    fs.mkdirSync(path.join(tmp, ".cairn/changes/anchor"), { recursive: true });
    fs.writeFileSync(path.join(tmp, ".cairn/changes/anchor/tasks.md"), "- [ ] open step\n");
    const anchor = run(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-anchor.mjs"))}`, { cwd: tmp });
    if (!anchor.includes("Active change: anchor")) fail("cairn-anchor.mjs did not emit active change");
  } catch (e) {
    fail(`minimal workflow smoke failed: ${e.stderr || e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

if (errors.length) {
  console.error("cairn validation FAILED:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`cairn validation passed (${required.length} files, minimal core checked)`);
