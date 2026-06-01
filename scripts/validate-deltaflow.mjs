import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "README.md",
  "AGENTS.md",
  "docs/research/framework-survey.md",
  "docs/architecture/mvp-architecture.md",
  "docs/roadmap.md",
  "plugins/deltaflow/.codex-plugin/plugin.json",
  "plugins/deltaflow/skills/deltaflow/SKILL.md",
  "plugins/deltaflow/skills/deltaflow/references/modes.md",
  "plugins/deltaflow/skills/deltaflow/references/artifacts.md",
  "plugins/deltaflow/skills/deltaflow/references/framework-lessons.md",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing required files:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "plugins/deltaflow/.codex-plugin/plugin.json"), "utf8"),
);

if (manifest.name !== "deltaflow") {
  console.error("plugin.json name must be deltaflow");
  process.exit(1);
}

if (manifest.skills !== "./skills/") {
  console.error('plugin.json skills must be "./skills/"');
  process.exit(1);
}

const skill = fs.readFileSync(
  path.join(root, "plugins/deltaflow/skills/deltaflow/SKILL.md"),
  "utf8",
);

for (const needle of ["name: deltaflow", "description:", "Classify", "Proof"]) {
  if (!skill.includes(needle)) {
    console.error(`deltaflow skill missing expected text: ${needle}`);
    process.exit(1);
  }
}

console.log("deltaflow validation passed");
