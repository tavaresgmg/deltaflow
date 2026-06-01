import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "README.md",
  "AGENTS.md",
  "docs/research/framework-survey.md",
  "docs/architecture/mvp-architecture.md",
  "docs/roadmap.md",
  "plugins/cairn/.codex-plugin/plugin.json",
  "plugins/cairn/skills/cairn/SKILL.md",
  "plugins/cairn/skills/cairn/references/modes.md",
  "plugins/cairn/skills/cairn/references/artifacts.md",
  "plugins/cairn/skills/cairn/references/framework-lessons.md",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing required files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "plugins/cairn/.codex-plugin/plugin.json"), "utf8"),
);

if (manifest.name !== "cairn") {
  console.error("plugin.json name must be cairn");
  process.exit(1);
}

if (manifest.skills !== "./skills/") {
  console.error('plugin.json skills must be "./skills/"');
  process.exit(1);
}

const skill = fs.readFileSync(
  path.join(root, "plugins/cairn/skills/cairn/SKILL.md"),
  "utf8",
);

for (const needle of ["name: cairn", "description:", "Classify", "Proof"]) {
  if (!skill.includes(needle)) {
    console.error(`cairn skill missing expected text: ${needle}`);
    process.exit(1);
  }
}

console.log("cairn validation passed");
