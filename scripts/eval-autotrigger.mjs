// Real auto-trigger evaluation harness (not vanity metrics). Runs each prompt through
// `codex exec --sandbox read-only` in a neutral fixture repo, then measures honest signals:
// did Cairn actually engage (read its files / route via a Cairn-unique mode), did it pick the
// right mode, and did the native Codex `analyze` skill collide. Writes JSONL + a summary.
//
//   node scripts/eval-autotrigger.mjs <subset> <label> [model]
//     subset: "all" | "fire" | "nofire" | "realistic" | comma-separated ids (F1,N2,R1,...)
//     label:  output file name under docs/evals/results/<label>.jsonl
//     model:  optional, passed to codex exec -m
//
// Detection is deliberately multi-signal and conservative; the report is honest about
// ambiguity (diagnose is shared with the native analyze skill, so it is not Cairn-unique).
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = process.cwd();
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

const REALISTIC_CASES = [
  {
    id: "R1",
    lang: "en",
    expectFire: true,
    expectMode: ["delta-spec", "direct"],
    prompt: "Implement the card in CARD-csv-export.md in this repo.",
  },
  {
    id: "R2",
    lang: "pt",
    expectFire: true,
    expectMode: ["diagnose"],
    prompt: "Corrige o bug descrito em CARD-tax-bug.md e valida com os testes locais.",
  },
  {
    id: "R3",
    lang: "en",
    expectFire: true,
    expectMode: ["delta-spec", "tracked-change"],
    prompt: "Refactor the auth module according to CARD-auth-refactor.md, but plan before editing.",
  },
  {
    id: "R4",
    lang: "en",
    expectFire: true,
    expectMode: ["discovery", "tracked-change"],
    prompt: "Plan the migration described in CARD-orm-migration.md before touching code.",
  },
  {
    id: "R5",
    lang: "pt",
    expectFire: true,
    expectMode: ["diagnose", "direct"],
    prompt: "Investiga por que `npm test` falha nesse fixture e propõe o menor conserto.",
  },
  {
    id: "R6",
    lang: "en",
    expectFire: true,
    expectMode: ["direct", "discovery", "delta-spec"],
    prompt: "Create a new webhook processor module in this repo from scratch. Plan the smallest safe path before coding.",
  },
  {
    id: "R7",
    lang: "en",
    expectFire: true,
    expectMode: ["discovery", "tracked-change", "delta-spec"],
    prompt: "Design a new multi-tenant billing subsystem in this repo from scratch. Do not code yet; research risks, boundaries, rollback, and proof first.",
  },
];

function setupFixture(realistic = false, caseId = null) {
  fs.rmSync(FIXTURE, { recursive: true, force: true });
  fs.mkdirSync(path.join(FIXTURE, "src"), { recursive: true });
  fs.writeFileSync(path.join(FIXTURE, "README.md"), "# Demo service\n\nSmall internal tool.\n");
  fs.writeFileSync(path.join(FIXTURE, "package.json"), JSON.stringify({
    name: "demo",
    version: "1.0.0",
    type: "module",
    scripts: { test: "node --test" },
  }, null, 2) + "\n");
  const shouldSeedCalcBug = !realistic || ["R2", "R5"].includes(caseId);
  fs.writeFileSync(path.join(FIXTURE, "src/calc.js"), `export function soma(a, b) { return ${shouldSeedCalcBug ? "a - b" : "a + b"}; }\n`);
  fs.writeFileSync(path.join(FIXTURE, "src/payments.js"), "export function charge() { return legacyGateway(); }\n");
  fs.writeFileSync(path.join(FIXTURE, "src/export.js"), "export function toCsv(rows) { return rows; }\n");
  if (realistic) {
    fs.mkdirSync(path.join(FIXTURE, "test"), { recursive: true });
    fs.writeFileSync(path.join(FIXTURE, "src/auth.js"), [
      "export function canAccess(user, resource) {",
      "  if (!user) return false;",
      "  return user.role === 'admin' || resource.ownerId === user.id;",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "test/calc.test.js"), [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { soma } from '../src/calc.js';",
      "",
      "test('soma adds two values', () => {",
      "  assert.equal(soma(2, 3), 5);",
      "});",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "CARD-csv-export.md"), [
      "# Card: CSV Export",
      "",
      "Add `toCsv(rows)` support in `src/export.js`.",
      "",
      "Acceptance:",
      "- returns a header row from object keys;",
      "- escapes commas and quotes;",
      "- preserves row order.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "CARD-tax-bug.md"), [
      "# Card: Tax Calculation Bug",
      "",
      "`src/calc.js` has a regression: `soma(2, 3)` returns `-1`.",
      "Reproduce with `npm test`, fix root cause, then rerun the failing test.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "CARD-auth-refactor.md"), [
      "# Card: Auth Refactor",
      "",
      "Refactor `src/auth.js` so access decisions are explicit and testable.",
      "Do not change behavior: admins keep access; owners keep access; anonymous users do not.",
      "Plan first because this module is a security boundary.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "CARD-orm-migration.md"), [
      "# Card: ORM Migration",
      "",
      "Plan a migration from raw SQL helpers to a new ORM.",
      "No code edits yet. Identify boundaries, data risks, tests, rollback, and proof.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(FIXTURE, "src/webhooks.js"), [
      "// Intentionally empty placeholder for R6 greenfield-in-repo routing.",
      "",
    ].join("\n"));
  }
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
const safeLabel = label.replace(/[^a-zA-Z0-9_.-]/g, "-");
const FIXTURE = path.join("/tmp", `cairn-eval-fixture-${safeLabel}-${process.pid}`);
let subset = CASES;
if (subsetArg === "fire") subset = CASES.filter((c) => c.expectFire);
else if (subsetArg === "nofire") subset = CASES.filter((c) => !c.expectFire);
else if (subsetArg === "realistic") subset = REALISTIC_CASES;
else if (subsetArg !== "all") {
  const ids = subsetArg.split(",").map((s) => s.trim());
  subset = [...CASES, ...REALISTIC_CASES].filter((c) => ids.includes(c.id));
}

const outDir = path.join(ROOT, "docs/evals/results");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${label}.jsonl`);
const outTmp = path.join(outDir, `.${label}.${process.pid}.tmp`);
fs.writeFileSync(outTmp, ""); // fresh, promoted only after summary is written

const results = [];
for (const c of subset) {
  setupFixture(/^R/.test(c.id), c.id);
  const r = runCase(c, model);
  results.push(r);
  fs.appendFileSync(outTmp, JSON.stringify(r) + "\n");
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
fs.appendFileSync(outTmp, JSON.stringify({ summary }) + "\n");
fs.renameSync(outTmp, outFile);
console.log("\nSUMMARY", JSON.stringify(summary, null, 2));
