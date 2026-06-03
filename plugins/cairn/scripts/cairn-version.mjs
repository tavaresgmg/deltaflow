// Resolve the LOCKFILE version of a dependency (Decision 6: ground docs on the locked version,
// not the newest). Read-only; scans common lockfiles in the repo. Prints JSON.
//   node cairn-version.mjs <package> [dir]
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const pkg = process.argv[2];
const startCwd = process.argv[3] || process.cwd();
if (!pkg) {
  process.stderr.write("usage: cairn-version.mjs <package> [dir]\n");
  process.exit(1);
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function repoRoot(cwd) {
  try {
    return execSync("git rev-parse --show-toplevel", { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return cwd;
  }
}

const root = repoRoot(startCwd);
const exists = (f) => fs.existsSync(path.join(root, f));
const rd = (f) => fs.readFileSync(path.join(root, f), "utf8");
const found = [];

if (exists("package-lock.json")) {
  try {
    const j = JSON.parse(rd("package-lock.json"));
    const v = j.packages?.[`node_modules/${pkg}`]?.version || j.dependencies?.[pkg]?.version;
    if (v) found.push({ version: v, source: "package-lock.json" });
  } catch {
    /* malformed lockfile — skip */
  }
}
if (exists("requirements.txt")) {
  const m = rd("requirements.txt").match(new RegExp(`^${escapeRe(pkg)}\\s*==\\s*([\\w.\\-]+)`, "mi"));
  if (m) found.push({ version: m[1], source: "requirements.txt" });
}
if (exists("go.mod")) {
  const m = rd("go.mod").match(new RegExp(`(?:^|\\s)${escapeRe(pkg)}\\s+v([\\w.\\-]+)`, "m"));
  if (m) found.push({ version: "v" + m[1], source: "go.mod" });
}
if (exists("Cargo.lock")) {
  const m = rd("Cargo.lock").match(new RegExp(`name = "${escapeRe(pkg)}"\\nversion = "([^"]+)"`, "m"));
  if (m) found.push({ version: m[1], source: "Cargo.lock" });
}
for (const lf of ["yarn.lock", "pnpm-lock.yaml", "Gemfile.lock"]) {
  if (exists(lf)) {
    const m = rd(lf).match(new RegExp(`${escapeRe(pkg)}[@ :"']?[^\\n]*?([0-9]+\\.[0-9]+\\.[0-9]+)`));
    if (m) found.push({ version: m[1], source: lf });
  }
}

process.stdout.write(JSON.stringify({ package: pkg, repoRoot: root, found }, null, 2) + "\n");
