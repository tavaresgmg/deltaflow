// Generates both per-harness plugin manifests from one canonical source (Decision 2).
// Codex reads .codex-plugin/plugin.json; Claude Code reads .claude-plugin/plugin.json.
// Never hand-edit the generated files — edit plugins/cairn/plugin.manifest.json and rebuild.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pluginDir = path.join(root, "plugins/cairn");
const canonical = JSON.parse(
  fs.readFileSync(path.join(pluginDir, "plugin.manifest.json"), "utf8"),
);

const { name, version, description, author, homepage, license, keywords, skills, interface: iface } = canonical;

// Codex: name/version/description/author + skills pointer + interface block.
const codex = { name, version, description, author, skills, interface: iface };

// Claude Code: package metadata; skills are discovered under ./skills/ by convention.
const claude = { name, version, description, author, homepage, license, keywords };

function writeJson(rel, obj) {
  const file = path.join(pluginDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
  console.log(`wrote ${path.relative(root, file)}`);
}

writeJson(".codex-plugin/plugin.json", codex);
writeJson(".claude-plugin/plugin.json", claude);

// Marketplace manifests (verified live: Claude reads .claude-plugin/marketplace.json at repo
// root; Codex reads .agents/plugins/marketplace.json). Both written from one shape.
const marketplace = {
  name,
  owner: author,
  plugins: [{ name, source: "./plugins/cairn", description }],
};
function writeRepoJson(rel, obj) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
  console.log(`wrote ${rel}`);
}
writeRepoJson(".claude-plugin/marketplace.json", marketplace);
writeRepoJson(".agents/plugins/marketplace.json", marketplace);

console.log("manifests + marketplaces built from plugins/cairn/plugin.manifest.json");
