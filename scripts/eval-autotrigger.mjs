// Real auto-trigger evaluation harness (not vanity metrics). Runs each prompt through
// `codex exec --sandbox read-only` in a neutral fixture repo, then measures honest signals:
// did Cairn actually engage (read its files / route via a Cairn-unique mode), did it pick the
// right mode, and did the native Codex `analyze` skill collide. Writes JSONL + a summary.
//
//   node scripts/eval-autotrigger.mjs <subset> <label> [model]
//     subset: "all" | "fire" | "nofire" | comma-separated ids (F1,N2,...)
//     label:  output file name under docs/evals/results/<label>.jsonl
//     model:  optional, passed to codex exec -m
//
// Detection is deliberately multi-signal and conservative; the report is honest about
// ambiguity (diagnose is shared with the native analyze skill, so it is not Cairn-unique).
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = process.cwd();
const FIXTURE = "/tmp/cairn-eval-fixture";
const PER_CASE_TIMEOUT_MS = 150000;

const CASES = [
  // must-fire (expectMode = acceptable modes; first is primary)
  { id: "F1", lang: "en", expectFire: true, expectMode: ["diagnose"], prompt: "Fix the login redirect bug in this repo." },
  { id: "F2", lang: "en", expectFire: true, expectMode: ["tracked-change", "delta-spec"], prompt: "Refactor the payments module to drop the legacy gateway." },
  { id: "F3", lang: "en", expectFire: true, expectMode: ["delta-spec"], prompt: "Here's the Jira card — implement the CSV export feature." },
  { id: "F4", lang: "en", expectFire: true, expectMode: ["diagnose", "direct"], prompt: "This screenshot shows a broken table layout, can you sort it out?" },
  { id: "F5", lang: "en", expectFire: true, expectMode: ["discovery", "tracked-change"], prompt: "Plan how we'd add multi-tenant support before we touch any code." },
  { id: "F6", lang: "en", expectFire: true, expectMode: ["diagnose"], prompt: "Investigate why the nightly job started timing out last week." },
  { id: "F7", lang: "en", expectFire: true, expectMode: ["delta-spec", "discovery"], prompt: "Write a spec for the new notifications service in this codebase." },
  { id: "F8", lang: "pt", expectFire: true, expectMode: ["delta-spec"], prompt: "Implementa esse card de exportação de relatório aqui no projeto." },
  { id: "F9", lang: "pt", expectFire: true, expectMode: ["diagnose"], prompt: "Corrige o bug de cálculo de imposto nesse repositório." },
  { id: "F10", lang: "pt", expectFire: true, expectMode: ["delta-spec", "tracked-change"], prompt: "Refatora esse módulo de autenticação que tá uma bagunça." },
  { id: "F11", lang: "pt", expectFire: true, expectMode: ["diagnose"], prompt: "Investiga por que esse endpoint começou a dar 500 em produção." },
  { id: "F12", lang: "pt", expectFire: true, expectMode: ["discovery", "tracked-change"], prompt: "Antes de codar, planeja como a gente migra pro novo ORM." },
  // must-not-fire
  { id: "N1", lang: "en", expectFire: false, expectMode: [], prompt: "What's the difference between a process and a thread?" },
  { id: "N2", lang: "en", expectFire: false, expectMode: [], prompt: "Run `git status` and show me the output." },
  { id: "N3", lang: "en", expectFire: false, expectMode: [], prompt: "What does the SOLID acronym stand for?" },
  { id: "N4", lang: "pt", expectFire: false, expectMode: [], prompt: "Qual a capital da Austrália?" },
  { id: "N5", lang: "pt", expectFire: false, expectMode: [], prompt: "Roda `npm test` e me mostra o resultado." },
  { id: "N6", lang: "en", expectFire: false, expectMode: [], prompt: "Explain how OAuth2 authorization code flow works in general." },
];

function setupFixture() {
  fs.rmSync(FIXTURE, { recursive: true, force: true });
  fs.mkdirSync(path.join(FIXTURE, "src"), { recursive: true });
  fs.writeFileSync(path.join(FIXTURE, "README.md"), "# Demo service\n\nSmall internal tool.\n");
  fs.writeFileSync(path.join(FIXTURE, "package.json"), '{ "name": "demo", "version": "1.0.0" }\n');
  fs.writeFileSync(path.join(FIXTURE, "src/calc.js"), "export function soma(a, b) { return a - b; }\n");
  fs.writeFileSync(path.join(FIXTURE, "src/payments.js"), "export function charge() { return legacyGateway(); }\n");
  fs.writeFileSync(path.join(FIXTURE, "src/export.js"), "export function toCsv(rows) { return rows; }\n");
  execFileSync("git", ["init", "-q"], { cwd: FIXTURE });
  execFileSync("git", ["add", "-A"], { cwd: FIXTURE });
  execFileSync("git", ["-c", "user.email=e@e.com", "-c", "user.name=e", "commit", "-qm", "seed"], { cwd: FIXTURE });
}

const UNIQUE = ["delta-spec", "tracked-change"]; // modes exclusive to Cairn (analyze lacks these)

// Extract the mode the AGENT chose from its classification prose — not the modes listed in the
// printed SKILL.md table (which would otherwise always match).
function extractMode(log) {
  const patterns = [
    /classif\w*[^.\n]{0,40}?\b(delta-spec|tracked-change|discovery|diagnose|direct)\b/i,
    /\bmod[eo]\b[^.\n]{0,40}?\b(delta-spec|tracked-change|discovery|diagnose|direct)\b/i,
    /\bas\s+`?(delta-spec|tracked-change|discovery|diagnose|direct)`?/i,
    /\b(delta-spec|tracked-change|discovery|diagnose|direct)\s+mode\b/i,
  ];
  for (const p of patterns) {
    const m = log.match(p);
    if (m) return m[1].toLowerCase();
  }
  return null;
}

function detect(log) {
  const readCairn = /plugins\/cache\/cairn|skills\/cairn\/(SKILL|references)|\.cairn\/changes/i.test(log);
  const collidedAnalyze = /skills\/analyze|\.agents\/skills\//i.test(log);
  const modeDetected = extractMode(log);
  const uniqueMode = UNIQUE.includes(modeDetected);
  const outputShape = /Done\/Blocked|Bloqueado:|Proof:[\s\S]{0,400}Risk:[\s\S]{0,200}Next:/i.test(log);
  const firedStrong = readCairn || modeDetected !== null || outputShape;
  return { firedStrong, readCairn, modeDetected, uniqueMode, outputShape, collidedAnalyze };
}

function runCase(c, model) {
  const args = ["exec", "--sandbox", "read-only"];
  if (model) args.push("-m", model);
  args.push(c.prompt);
  const res = spawnSync("codex", args, { cwd: FIXTURE, timeout: PER_CASE_TIMEOUT_MS, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
  const log = (res.stdout || "") + "\n" + (res.stderr || "");
  let status = "ok";
  if (res.signal) status = "timeout";
  else if (res.error) status = "error";
  const sig = detect(log);
  const fireCorrect = sig.firedStrong === c.expectFire;
  const modeCorrect = !c.expectFire ? null : c.expectMode.includes(sig.modeDetected);
  return { ...c, status, ...sig, fireCorrect, modeCorrect, logLen: log.length };
}

// main
const subsetArg = process.argv[2] || "all";
const label = process.argv[3] || "run";
const model = process.argv[4] || null;
let subset = CASES;
if (subsetArg === "fire") subset = CASES.filter((c) => c.expectFire);
else if (subsetArg === "nofire") subset = CASES.filter((c) => !c.expectFire);
else if (subsetArg !== "all") {
  const ids = subsetArg.split(",").map((s) => s.trim());
  subset = CASES.filter((c) => ids.includes(c.id));
}

setupFixture();
const outDir = path.join(ROOT, "docs/evals/results");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${label}.jsonl`);
fs.writeFileSync(outFile, ""); // fresh

const results = [];
for (const c of subset) {
  const r = runCase(c, model);
  results.push(r);
  fs.appendFileSync(outFile, JSON.stringify(r) + "\n");
  console.log(`${r.id} [${r.status}] fired=${r.firedStrong} (expect ${c.expectFire}) mode=${r.modeDetected} ok=${r.fireCorrect}${c.expectFire ? ` modeOk=${r.modeCorrect}` : ""} collideAnalyze=${r.collidedAnalyze}`);
}

const fires = results.filter((r) => r.expectFire);
const nofires = results.filter((r) => !r.expectFire);
const summary = {
  label,
  model: model || "default",
  cases: results.length,
  mustFire: fires.length,
  mustFire_fired: fires.filter((r) => r.firedStrong).length,
  mustFire_routedRight: fires.filter((r) => r.modeCorrect).length,
  mustNot: nofires.length,
  mustNot_misfired: nofires.filter((r) => r.firedStrong).length,
  collidedAnalyze: results.filter((r) => r.collidedAnalyze).length,
  errors: results.filter((r) => r.status !== "ok").length,
};
fs.appendFileSync(outFile, JSON.stringify({ summary }) + "\n");
console.log("\nSUMMARY", JSON.stringify(summary, null, 2));
