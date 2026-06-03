// Read-only local integration doctor for Cairn. Reports two kinds of signal, kept distinct:
//  (a) facts checked live here — manifest parity, hook declarations, boundary, CLI presence;
//  (b) per-surface status verdicts that are KNOWN evidence from the roadmap/gates (e.g. Codex
//      preToolUseGuard pending-upstream) — it echoes the project's verified state, it does NOT
//      re-test it at runtime. No model evals, install mutation, hook trust, or publishing.
//   node plugins/cairn/scripts/cairn-doctor.mjs [--json]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.join(path.dirname(new URL(import.meta.url).pathname), "../../.."));
const JSON_MODE = process.argv.includes("--json");

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function readJson(rel) {
  return JSON.parse(read(rel));
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function commandInfo(cmd, versionArgs = ["--version"]) {
  try {
    const pathOut = execFileSync("/usr/bin/env", ["sh", "-lc", `command -v ${cmd}`], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    let version = null;
    try {
      version = execFileSync(cmd, versionArgs, {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout: 10000,
      }).trim().split("\n")[0] || null;
    } catch {
      version = null;
    }
    return { installed: true, path: pathOut, version };
  } catch {
    return { installed: false, path: null, version: null };
  }
}

function manifestParity() {
  try {
    const canonical = readJson("plugins/cairn/plugin.manifest.json");
    const codex = readJson("plugins/cairn/.codex-plugin/plugin.json");
    const claude = readJson("plugins/cairn/.claude-plugin/plugin.json");
    const { name, version, description, author, homepage, license, keywords, skills, interface: iface } = canonical;
    const expectedCodex = { name, version, description, author, skills, interface: iface };
    const expectedClaude = { name, version, description, author, homepage, license, keywords };
    const codexOk = JSON.stringify(codex) === JSON.stringify(expectedCodex);
    const claudeOk = JSON.stringify(claude) === JSON.stringify(expectedClaude);
    return { ok: codexOk && claudeOk, codexOk, claudeOk, version };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function boundary() {
  try {
    const out = execFileSync("node", [path.join(ROOT, "plugins/cairn/scripts/cairn-boundary.mjs")], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 10000,
    });
    const data = JSON.parse(out);
    return {
      ok: Boolean(data.repoRoot || data.workspaceRoot || data.cairnStateRoot),
      repoRoot: data.repoRoot,
      workspaceRoot: data.workspaceRoot,
      workspaceMarker: data.workspaceMarker,
      legacyWorkRoot: data.legacyWorkRoot,
      cairnStateRoot: data.cairnStateRoot,
      cairnStateScope: data.cairnStateScope,
      cairnWorktreeRoot: data.cairnWorktreeRoot,
      cairnTmpRoot: data.cairnTmpRoot,
      cairnWorkspaceDocsRoot: data.cairnWorkspaceDocsRoot,
      memoryPolicy: data.memoryPolicy,
      contextReadiness: data.context?.readiness ?? null,
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function hookDeclarations() {
  try {
    const hooks = JSON.stringify(readJson("plugins/cairn/hooks/hooks.json"));
    return {
      ok: hooks.includes("SessionStart") && hooks.includes("PreToolUse") && hooks.includes("Stop"),
      sessionStart: hooks.includes("hooks/session-start.sh"),
      preToolUseGuard: hooks.includes("cairn-guard.mjs"),
      stopCoherence: hooks.includes("cairn-coherence.mjs"),
    };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function helperScripts() {
  const files = [
    "plugins/cairn/scripts/cairn-boundary.mjs",
    "plugins/cairn/scripts/cairn-guard.mjs",
    "plugins/cairn/scripts/cairn-coherence.mjs",
    "plugins/cairn/scripts/cairn-analyze.mjs",
    "plugins/cairn/scripts/cairn-budget.mjs",
    "plugins/cairn/scripts/cairn-retention.mjs",
    "plugins/cairn/scripts/cairn-doctor.mjs",
  ];
  const present = Object.fromEntries(files.map((f) => [f, exists(f)]));
  return { ok: Object.values(present).every(Boolean), present };
}

function buildReport() {
  const codexCli = commandInfo("codex");
  const claudeCli = commandInfo("claude");
  const shared = {
    manifestParity: manifestParity(),
    hookDeclarations: hookDeclarations(),
    helperScripts: helperScripts(),
    boundary: boundary(),
  };
  const recommendations = [];
  if (!codexCli.installed) recommendations.push("Install Codex CLI before validating Codex behavior.");
  if (!claudeCli.installed) recommendations.push("Install Claude Code before validating Claude behavior.");
  if (!shared.manifestParity.ok) recommendations.push("Run node scripts/build-manifests.mjs to refresh generated plugin manifests.");
  if (!shared.boundary.ok) recommendations.push("Run from inside a repo or marked workspace before relying on boundary-aware guidance.");
  recommendations.push("Keep Codex write-guard status pending-upstream until plugin PreToolUse/apply_patch coverage is live-proven.");

  return {
    name: "cairn-doctor",
    readOnly: true,
    root: ROOT,
    generatedAt: new Date().toISOString(),
    shared,
    // NOTE: surface statuses below mix live-derived (pluginManifest from manifestParity,
    // stopCoherence/sessionStart/preToolUseGuard from hookDeclarations) with KNOWN evidence
    // verdicts that are literals (skillLoading "proven", Codex preToolUseGuard "pending-upstream",
    // writeProtection "advisory") — see docs/architecture/agent-integration-contract.md +
    // references/gates.md. Not probes.
    harnesses: {
      codex: {
        cli: codexCli,
        surfaces: {
          pluginManifest: { status: shared.manifestParity.codexOk ? "strong" : "broken" },
          skillLoading: { status: "proven" },
          sessionStart: { status: "proven" },
          stopCoherence: { status: shared.hookDeclarations.stopCoherence ? "proven" : "broken" },
          preToolUseGuard: { status: "pending-upstream" },
          writeProtection: { status: "advisory" },
        },
      },
      claude: {
        cli: claudeCli,
        surfaces: {
          pluginManifest: { status: shared.manifestParity.claudeOk ? "strong" : "broken" },
          skillLoading: { status: "proven" },
          sessionStart: { status: shared.hookDeclarations.sessionStart ? "strong" : "broken" },
          preToolUseGuard: { status: shared.hookDeclarations.preToolUseGuard ? "strong" : "broken" },
          stopCoherence: { status: shared.hookDeclarations.stopCoherence ? "strong" : "broken" },
          researcherAgent: { status: exists("plugins/cairn/agents/cairn-researcher.md") ? "advisory" : "broken" },
          structuredAutomation: { status: "advisory" },
        },
      },
    },
    recommendations,
  };
}

function renderText(report) {
  const lines = [];
  lines.push("Cairn doctor (read-only)");
  lines.push(`root: ${report.root}`);
  lines.push(`manifest parity: ${report.shared.manifestParity.ok ? "ok" : "check"}`);
  lines.push(`boundary: ${report.shared.boundary.ok ? `${report.shared.boundary.cairnStateScope}:${report.shared.boundary.cairnStateRoot}` : "not detected"}`);
  lines.push("");
  for (const [name, harness] of Object.entries(report.harnesses)) {
    lines.push(`${name}: ${harness.cli.installed ? `installed (${harness.cli.version || harness.cli.path})` : "not found"}`);
    for (const [surface, info] of Object.entries(harness.surfaces)) {
      lines.push(`  - ${surface}: ${info.status}`);
    }
  }
  lines.push("");
  lines.push("recommendations:");
  for (const rec of report.recommendations) lines.push(`  - ${rec}`);
  return lines.join("\n") + "\n";
}

const report = buildReport();
process.stdout.write(JSON_MODE ? JSON.stringify(report, null, 2) + "\n" : renderText(report));
