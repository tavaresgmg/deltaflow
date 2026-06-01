// Local structural validation for the Cairn plugin. Run from the repo root:
//   node scripts/validate-cairn.mjs
// Validates everything we can check without a live harness; auto-trigger and hook I/O
// are validated empirically per docs/evals/auto-trigger.md (Phase 1 exit).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const fail = (msg) => errors.push(msg);
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const readJson = (rel) => JSON.parse(read(rel));

const required = [
  "README.md",
  "AGENTS.md",
  "docs/research/framework-survey.md",
  "docs/research/frameworks.md",
  "docs/research/context-and-portability.md",
  "docs/architecture/mvp-architecture.md",
  "docs/decisions/README.md",
  "docs/roadmap.md",
  "docs/evals/auto-trigger.md",
  "plugins/cairn/plugin.manifest.json",
  "plugins/cairn/.codex-plugin/plugin.json",
  "plugins/cairn/.claude-plugin/plugin.json",
  "plugins/cairn/hooks/bootstrap.md",
  "plugins/cairn/hooks/session-start.sh",
  "plugins/cairn/hooks/hooks.json",
  "plugins/cairn/skills/cairn/SKILL.md",
  "plugins/cairn/skills/cairn/references/modes.md",
  "plugins/cairn/skills/cairn/references/artifacts.md",
  "plugins/cairn/skills/cairn/references/framework-lessons.md",
];

const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
for (const f of missing) fail(`missing required file: ${f}`);

// Everything below needs the files present.
if (!missing.length) {
  const canonical = readJson("plugins/cairn/plugin.manifest.json");
  const codex = readJson("plugins/cairn/.codex-plugin/plugin.json");
  const claude = readJson("plugins/cairn/.claude-plugin/plugin.json");

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
  if (JSON.stringify(codex) !== JSON.stringify(expectedCodex)) {
    fail("codex plugin.json is stale — run: node scripts/build-manifests.mjs");
  }
  if (JSON.stringify(claude) !== JSON.stringify(expectedClaude)) {
    fail("claude plugin.json is stale — run: node scripts/build-manifests.mjs");
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
    const nameLine = block.match(/^name:\s*(.+)$/m);
    if (!nameLine || nameLine[1].trim() !== "cairn") fail("SKILL.md name must be cairn");

    const descLine = block.match(/^description:\s*(.+)$/m);
    if (!descLine) {
      fail("SKILL.md missing description");
    } else {
      const desc = descLine[1].trim();
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
  if (!cmd.includes("${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh")) {
    fail("hooks.json must invoke ${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh");
  }
  if (!cmd.includes("SessionStart")) fail("hooks.json must register SessionStart");
}

if (errors.length) {
  console.error("cairn validation FAILED:");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}
console.log(`cairn validation passed (${required.length} files, manifests + SKILL + hooks checked)`);
