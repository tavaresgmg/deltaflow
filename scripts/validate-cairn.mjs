// Local structural validation for the Cairn plugin. Run from the repo root:
//   node scripts/validate-cairn.mjs
// Validates everything we can check without a live harness; auto-trigger and hook I/O
// are validated empirically per docs/evals/auto-trigger.md (Phase 1 exit).
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel) => JSON.parse(read(rel));

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
  "docs/research/framework-survey.md",
  "docs/research/frameworks.md",
  "docs/research/context-and-portability.md",
  "docs/architecture/mvp-architecture.md",
  "docs/decisions/README.md",
  "docs/roadmap.md",
  "docs/install.md",
  "docs/release-checklist.md",
  "docs/evals/auto-trigger.md",
  "plugins/cairn/plugin.manifest.json",
  "plugins/cairn/.codex-plugin/plugin.json",
  "plugins/cairn/.claude-plugin/plugin.json",
  "plugins/cairn/hooks/bootstrap.md",
  "plugins/cairn/hooks/session-start.sh",
  "plugins/cairn/hooks/hooks.json",
  "plugins/cairn/scripts/cairn-boundary.mjs",
  "plugins/cairn/scripts/cairn-guard.mjs",
  "plugins/cairn/scripts/cairn-analyze.mjs",
  "plugins/cairn/scripts/cairn-next.mjs",
  "plugins/cairn/scripts/cairn-version.mjs",
  "plugins/cairn/agents/cairn-researcher.md",
  "plugins/cairn/skills/cairn/SKILL.md",
  "plugins/cairn/skills/cairn/references/modes.md",
  "plugins/cairn/skills/cairn/references/artifacts.md",
  "plugins/cairn/skills/cairn/references/memory.md",
  "plugins/cairn/skills/cairn/references/research.md",
  "plugins/cairn/skills/cairn/references/workspace.md",
  "plugins/cairn/skills/cairn/references/gates.md",
  "plugins/cairn/skills/cairn/references/framework-lessons.md",
];

const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
for (const f of missing) fail(`missing required file: ${f}`);

// Everything below needs the files present.
if (!missing.length) {
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
  for (const needle of ["Classify", "Proof"]) {
    if (!skill.includes(needle)) fail(`SKILL.md missing expected text: ${needle}`);
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

  // Boundary detector smoke test: must emit valid JSON resolving this repo.
  try {
    const out = execSync("node plugins/cairn/scripts/cairn-boundary.mjs", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const b = JSON.parse(out);
    if (!b.isRepo || !b.repoRoot) fail("cairn-boundary.mjs did not resolve repoRoot here");
  } catch (e) {
    fail(`cairn-boundary.mjs failed to run: ${e.message}`);
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
  if (inside !== 0) fail(`cairn-guard.mjs blocked an in-repo write (exit ${inside})`);
  if (outside !== 2) fail(`cairn-guard.mjs did not block an out-of-repo write (exit ${outside})`);

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
    const nextOut = execSync(`node ${JSON.stringify(path.join(root, "plugins/cairn/scripts/cairn-next.mjs"))} ${JSON.stringify(change)}`, {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString();
    const next = JSON.parse(nextOut);
    if (!next.next?.code) fail("cairn-next.mjs did not emit next.code");
  } catch (e) {
    fail(`state helper smoke test failed: ${e.message}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
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
