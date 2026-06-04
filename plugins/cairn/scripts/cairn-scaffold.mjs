// Creates the templates justified by one Cairn mode. Existing files are never overwritten.
//   node cairn-scaffold.mjs <mode> <slug> [cwd]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCairnBoundary } from "./cairn-workspace.mjs";

const TEMPLATES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "skills", "cairn", "templates");

const MODE_TEMPLATES = {
  discovery: ["brief.md"],
  "delta-spec": ["delta.md", "plan.md", "tasks.md", "proof.md"],
  "tracked-change": ["brainstorm.md", "delta.md", "plan.md", "tasks.md", "proof.md"],
};

function fail(msg) {
  process.stderr.write(`${msg}\n`);
  process.exit(1);
}

const mode = process.argv[2];
const slug = process.argv[3];
const cwd = process.argv[4] || process.cwd();

if (!mode || !slug) fail("usage: cairn-scaffold.mjs <mode> <slug> [cwd]");
if (!MODE_TEMPLATES[mode]) {
  fail(`mode "${mode}" does not scaffold a change folder (use discovery | delta-spec | tracked-change)`);
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  fail(`invalid slug "${slug}": use kebab-case (a-z, 0-9, -), no slashes or dots`);
}

const { cairnStateRoot, cairnStateScope } = resolveCairnBoundary(cwd);
if (!cairnStateRoot) fail("no repo or workspace root found; cannot place .cairn state");

const changeDir = path.join(cairnStateRoot, ".cairn", "changes", slug);
fs.mkdirSync(changeDir, { recursive: true });

const created = [];
const skipped = [];

function place(targetPath, templateName, substituteSlug) {
  if (fs.existsSync(targetPath)) {
    skipped.push(path.relative(cairnStateRoot, targetPath));
    return;
  }
  let content = fs.readFileSync(path.join(TEMPLATES_DIR, templateName), "utf8");
  if (substituteSlug) content = content.replaceAll("<slug>", slug);
  fs.writeFileSync(targetPath, content);
  created.push(path.relative(cairnStateRoot, targetPath));
}

for (const template of MODE_TEMPLATES[mode]) {
  place(path.join(changeDir, template), template, true);
}

place(path.join(cairnStateRoot, ".cairn", "decision-log.md"), "decision-log.md", false);

process.stdout.write(
  JSON.stringify({ mode, slug, cairnStateRoot, cairnStateScope, changeDir, created, skipped }, null, 2) + "\n",
);
