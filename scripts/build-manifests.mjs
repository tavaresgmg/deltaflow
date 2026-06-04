import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pluginDir = path.join(root, "plugins/cairn");
const canonical = JSON.parse(
  fs.readFileSync(path.join(pluginDir, "plugin.manifest.json"), "utf8"),
);

const { name, version, description, author, homepage, license, keywords, skills, interface: iface } = canonical;

const codex = { name, version, description, author, skills, interface: iface };
const claude = { name, version, description, author, homepage, license, keywords };

function writeJson(rel, obj) {
  const file = path.join(pluginDir, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
  console.log(`wrote ${path.relative(root, file)}`);
}

writeJson(".codex-plugin/plugin.json", codex);
writeJson(".claude-plugin/plugin.json", claude);

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
