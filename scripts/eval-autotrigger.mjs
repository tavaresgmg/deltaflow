// Real auto-trigger evaluation harness (not vanity metrics). Runs each prompt through
// Codex or Claude Code in a neutral fixture repo, then measures honest signals:
// did Cairn actually engage (read its files / route via a Cairn-unique mode), did it pick the
// right mode, and did the native Codex `analyze` skill collide. Writes JSONL + a summary.
//
//   node scripts/eval-autotrigger.mjs <subset> <label> [model] [--harness codex|claude] [--jobs N]
//   node scripts/eval-autotrigger.mjs <subset> --out docs/evals/results/<label>.jsonl [--model MODEL]
//     subset: "all" | "fire" | "nofire" | "realistic" | "p0-matrix" | "infra-lens" | comma-separated ids
//     label:  output file name under docs/evals/results/<label>.jsonl
//     model:  optional, passed to codex exec -m or claude --model
//
// Detection is deliberately multi-signal and conservative; the report is honest about
// ambiguity (diagnose is shared with the native analyze skill, so it is not Cairn-unique).
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

const ROOT = process.cwd();
const PLUGIN_DIR = path.join(ROOT, "plugins/cairn");
const DEFAULT_TIMEOUT_MS = 150000;
const RESULTS_DIR = path.join(ROOT, "docs/evals/results");

const USAGE = `Usage:
  node scripts/eval-autotrigger.mjs <subset> <label> [model] [--harness codex|claude] [--jobs N] [--timeout-ms MS]
  node scripts/eval-autotrigger.mjs <subset> --out docs/evals/results/<label>.jsonl [--model MODEL]

Subsets:
  all | fire | nofire | realistic | realistic-nofire | broad | p0-matrix | infra-lens | comma-separated ids

Options:
  --harness codex|claude
  --jobs N
  --timeout-ms MS
  --label LABEL
  --model MODEL
  --out docs/evals/results/<label>.jsonl
  --dry-run
  --overwrite`;

function failCli(err) {
  console.error(err?.message || String(err));
  process.exit(1);
}

process.on("uncaughtException", failCli);
process.on("unhandledRejection", failCli);

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
  {
    id: "R8",
    lang: "pt",
    expectFire: true,
    expectMode: ["direct", "delta-spec"],
    prompt: "No card: add input normalization to the CSV export path in this repo and validate the local tests.",
  },
  {
    id: "R9",
    lang: "en",
    expectFire: true,
    expectMode: ["discovery", "delta-spec"],
    prompt: "Research whether this repo should adopt Vitest instead of node:test. Use current docs and the local package state; do not edit files.",
  },
  {
    id: "R10",
    lang: "en",
    expectFire: true,
    expectMode: ["direct", "delta-spec"],
    prompt: "Clean up duplicated CSV escaping logic across this repo without changing behavior.",
  },
  {
    id: "R11",
    lang: "en",
    expectFire: true,
    expectMode: ["delta-spec", "tracked-change"],
    prompt: "Simplify the auth permission logic without changing behavior; plan first because this is a security boundary.",
  },
  {
    id: "R12",
    lang: "en",
    expectFire: true,
    expectMode: ["direct", "delta-spec"],
    prompt: "Add an invoice formatter that follows the existing formatter pattern in this repo. Do not introduce a new framework.",
  },
  {
    id: "R13",
    lang: "en",
    expectFire: true,
    expectMode: ["discovery", "delta-spec"],
    prompt: "Create a new background job runner module in this repo from scratch. First inspect existing scripts and define the smallest safe scaffold.",
  },
  {
    id: "R14",
    lang: "en",
    expectFire: true,
    expectMode: ["direct", "delta-spec"],
    prompt: "Align the export module with the repo's existing error-handling pattern and prove behavior did not change.",
  },
];

const REALISTIC_MUST_NOT_CASES = [
  {
    id: "N7",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "Explain what `src/auth.js` does. Do not propose changes.",
  },
  {
    id: "N8",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "Open package.json and tell me the test script.",
  },
  {
    id: "N9",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "Summarize CARD-csv-export.md only; do not implement it.",
  },
  {
    id: "N10",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "Research what OAuth2 PKCE is in general; no repo changes.",
  },
  {
    id: "N11",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "Run npm test and paste the output. Do not investigate or fix failures.",
  },
  {
    id: "N12",
    lang: "en",
    realistic: true,
    expectFire: false,
    expectMode: [],
    prompt: "What cleanup strategy would you use for a messy codebase in general?",
  },
];

const INFRA_LENS_CASES = [
  {
    id: "I1",
    lang: "en",
    realistic: true,
    expectFire: true,
    expectMode: ["diagnose", "tracked-change", "discovery"],
    prompt: "Investigate the deployment failure in OPS-rollback.md and plan the smallest rollback/proof path. Do not deploy.",
  },
  {
    id: "I2",
    lang: "en",
    realistic: true,
    expectFire: true,
    expectMode: ["diagnose", "direct", "delta-spec"],
    prompt: "Fix the Dockerfile/start-script mismatch in this repo and name the local proof command you would run.",
  },
  {
    id: "I3",
    lang: "en",
    expectFire: false,
    expectMode: [],
    prompt: "Explain Docker healthchecks in general. Do not inspect this repo.",
  },
];

const ALL_CASES = [...CASES, ...REALISTIC_CASES, ...REALISTIC_MUST_NOT_CASES, ...INFRA_LENS_CASES];
const P0_MATRIX_IDS = ["R5", "R10", "R11", "N2", "N7", "N11"];
const DIAGNOSTIC_LOG_BYTES = 1200;

function selectCases(ids) {
  return ALL_CASES.filter((c) => ids.includes(c.id));
}

function setupFixture(fixture, realistic = false, caseId = null) {
  fs.rmSync(fixture, { recursive: true, force: true });
  fs.mkdirSync(path.join(fixture, "src"), { recursive: true });
  fs.writeFileSync(path.join(fixture, "README.md"), "# Demo service\n\nSmall internal tool.\n");
  fs.writeFileSync(path.join(fixture, "package.json"), JSON.stringify({
    name: "demo",
    version: "1.0.0",
    type: "module",
    scripts: { test: "node --test" },
  }, null, 2) + "\n");
  const shouldSeedCalcBug = !realistic || ["R2", "R5"].includes(caseId);
  fs.writeFileSync(path.join(fixture, "src/calc.js"), `export function soma(a, b) { return ${shouldSeedCalcBug ? "a - b" : "a + b"}; }\n`);
  fs.writeFileSync(path.join(fixture, "src/payments.js"), "export function charge() { return legacyGateway(); }\n");
  fs.writeFileSync(path.join(fixture, "src/export.js"), [
    "function escapeCsv(value) {",
    "  return String(value).replaceAll('\"', '\"\"');",
    "}",
    "",
    "export function toCsv(rows) {",
    "  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');",
    "  return rows;",
    "}",
    "",
  ].join("\n"));
  if (realistic) {
    fs.mkdirSync(path.join(fixture, "test"), { recursive: true });
    fs.mkdirSync(path.join(fixture, "src/formatters"), { recursive: true });
    fs.mkdirSync(path.join(fixture, "src/jobs"), { recursive: true });
    fs.writeFileSync(path.join(fixture, "src/auth.js"), [
      "export function canAccess(user, resource, action = 'read') {",
      "  if (!user) {",
      "    return false;",
      "  }",
      "  if (user.role === 'admin') {",
      "    return true;",
      "  }",
      "  if (action === 'read' && resource.ownerId === user.id) {",
      "    return true;",
      "  }",
      "  if (action === 'write' && resource.ownerId === user.id && !resource.locked) {",
      "    return true;",
      "  }",
      "  return false;",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/errors.js"), [
      "export class AppError extends Error {",
      "  constructor(code, message) {",
      "    super(message);",
      "    this.code = code;",
      "  }",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/reports.js"), [
      "function escapeCsv(value) {",
      "  return String(value).replaceAll('\"', '\"\"');",
      "}",
      "",
      "export function reportRowsToCsv(rows) {",
      "  if (!Array.isArray(rows)) throw new TypeError('rows must be an array');",
      "  return rows.map((row) => Object.values(row).map(escapeCsv).join(',')).join('\\n');",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/formatters/date.js"), [
      "export function formatDate(value) {",
      "  return new Intl.DateTimeFormat('en-US').format(new Date(value));",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/formatters/number.js"), [
      "export function formatNumber(value) {",
      "  return new Intl.NumberFormat('en-US').format(value);",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/jobs/README.md"), "# Jobs\n\nNo runner yet.\n");
    fs.writeFileSync(path.join(fixture, "test/calc.test.js"), [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { soma } from '../src/calc.js';",
      "",
      "test('soma adds two values', () => {",
      "  assert.equal(soma(2, 3), 5);",
      "});",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "test/export.test.js"), [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { toCsv } from '../src/export.js';",
      "",
      "test('toCsv preserves row order', () => {",
      "  assert.deepEqual(toCsv([{ name: 'Ana' }]), [{ name: 'Ana' }]);",
      "});",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "test/auth.test.js"), [
      "import test from 'node:test';",
      "import assert from 'node:assert/strict';",
      "import { canAccess } from '../src/auth.js';",
      "",
      "test('admins and owners can read', () => {",
      "  assert.equal(canAccess({ role: 'admin' }, { ownerId: 'u2' }), true);",
      "  assert.equal(canAccess({ id: 'u1', role: 'user' }, { ownerId: 'u1' }), true);",
      "});",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "CARD-csv-export.md"), [
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
    fs.writeFileSync(path.join(fixture, "CARD-tax-bug.md"), [
      "# Card: Tax Calculation Bug",
      "",
      "`src/calc.js` has a regression: `soma(2, 3)` returns `-1`.",
      "Reproduce with `npm test`, fix root cause, then rerun the failing test.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "CARD-auth-refactor.md"), [
      "# Card: Auth Refactor",
      "",
      "Refactor `src/auth.js` so access decisions are explicit and testable.",
      "Do not change behavior: admins keep access; owners keep access; anonymous users do not.",
      "Plan first because this module is a security boundary.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "CARD-orm-migration.md"), [
      "# Card: ORM Migration",
      "",
      "Plan a migration from raw SQL helpers to a new ORM.",
      "No code edits yet. Identify boundaries, data risks, tests, rollback, and proof.",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/webhooks.js"), [
      "export function validateWebhook(payload) {",
      "  return Boolean(payload && payload.type);",
      "}",
      "",
    ].join("\n"));
    fs.writeFileSync(path.join(fixture, "src/audit.js"), [
      "export function audit(event) {",
      "  return { ...event, recordedAt: new Date().toISOString() };",
      "}",
      "",
    ].join("\n"));
    if (/^I[12]$/.test(caseId || "")) {
      fs.mkdirSync(path.join(fixture, "scripts"), { recursive: true });
      fs.writeFileSync(path.join(fixture, "Dockerfile"), [
        "FROM node:22-alpine",
        "WORKDIR /app",
        "COPY package.json ./",
        "CMD [\"npm\", \"start\"]",
        "",
      ].join("\n"));
      fs.writeFileSync(path.join(fixture, "docker-compose.yml"), [
        "services:",
        "  app:",
        "    build: .",
        "    command: npm start",
        "",
      ].join("\n"));
      fs.writeFileSync(path.join(fixture, "scripts/deploy.sh"), [
        "#!/usr/bin/env sh",
        "set -eu",
        "docker compose up --build app",
        "",
      ].join("\n"));
      fs.writeFileSync(path.join(fixture, "OPS-rollback.md"), [
        "# Ops: deploy rollback",
        "",
        "Latest deploy failed after the app image rolled out.",
        "The container exits immediately with `npm ERR! Missing script: start`.",
        "Do not deploy from the eval fixture. Identify the likely owner, rollback path, and proof.",
        "",
      ].join("\n"));
    }
  }
  execFileSync("git", ["init", "-q"], { cwd: fixture });
  execFileSync("git", ["add", "-A"], { cwd: fixture });
  execFileSync("git", ["-c", "user.email=e@e.com", "-c", "user.name=e", "commit", "-qm", "seed"], { cwd: fixture });
}

const UNIQUE = ["delta-spec", "tracked-change"]; // modes exclusive to Cairn (analyze lacks these)

// Extract the mode the AGENT chose from its classification prose — not the modes listed in the
// printed SKILL.md table (which would otherwise always match).
function extractMode(log) {
  const patterns = [
    /^Mode:\s*`?(direct|diagnose|discovery|delta-spec|tracked-change)`?\b/im,
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

function detect(fullLog, answerText) {
  const readCairn = /plugins\/cache\/cairn|skills\/cairn\/(SKILL|references)|\.cairn\/changes|Launching skill: cairn:cairn|"skill"\s*:\s*"cairn:cairn"/i.test(fullLog);
  const collidedAnalyze = /skills\/analyze|\.agents\/skills\//i.test(fullLog);
  const modeDetected = extractMode(answerText);
  const uniqueMode = UNIQUE.includes(modeDetected);
  const outputShape = /Done\/Blocked|Bloqueado:|Proof:[\s\S]{0,400}Risk:[\s\S]{0,200}Next:/i.test(answerText);
  const firedStrong = readCairn || modeDetected !== null || outputShape;
  return { firedStrong, readCairn, modeDetected, uniqueMode, outputShape, collidedAnalyze };
}

function diagnosticFor(c, sig, status, log, answerText) {
  const reasons = [];
  if (sig.firedStrong !== c.expectFire) reasons.push("fire-mismatch");
  if (c.expectFire && !c.expectMode.includes(sig.modeDetected)) reasons.push("route-mismatch");
  if (status !== "ok") reasons.push(status);
  if (!reasons.length) return null;
  return {
    reasons,
    expectedMode: c.expectMode,
    modeDetected: sig.modeDetected,
    answerTail: answerText.slice(-DIAGNOSTIC_LOG_BYTES),
    logTail: log.slice(-DIAGNOSTIC_LOG_BYTES),
  };
}

function harnessVersion(harness) {
  try {
    if (harness === "claude") return execFileSync("claude", ["--version"], { encoding: "utf8" }).trim();
    return execFileSync("codex", ["--version"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function spawnCapture(command, args, opts) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: opts.cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, opts.timeout);
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, error, signal: null, status: null });
    });
    child.on("close", (status, signal) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, error: null, signal: timedOut ? "timeout" : signal, status });
    });
  });
}

function textFromContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part.text === "string") return part.text;
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function extractAnswerText(stdout, harness) {
  if (harness !== "claude") return stdout || "";
  const fragments = [];
  for (const line of (stdout || "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      if (typeof event.result === "string") fragments.push(event.result);
      if (event.message?.role === "assistant") {
        const text = textFromContent(event.message.content);
        if (text) fragments.push(text);
      }
      if (event.type === "assistant") {
        const text = textFromContent(event.content || event.message?.content);
        if (text) fragments.push(text);
      }
    } catch {
      // Ignore non-JSON progress lines.
    }
  }
  return fragments.join("\n");
}

async function runCase(c, { harness, model, timeoutMs, safeLabel }) {
  const fixture = path.join("/tmp", `cairn-eval-fixture-${safeLabel}-${process.pid}-${c.id}`);
  setupFixture(fixture, c.realistic || /^R/.test(c.id), c.id);
  const args = ["exec", "--sandbox", "read-only"];
  let command = "codex";
  let commandArgs = args;
  if (harness === "claude") {
    command = "claude";
    commandArgs = ["--print", "--verbose", "--include-hook-events", "--output-format", "stream-json", "--plugin-dir", PLUGIN_DIR];
    if (model) commandArgs.push("--model", model);
    commandArgs.push(c.prompt);
  } else {
    if (model) commandArgs.push("-m", model);
    commandArgs.push(c.prompt);
  }
  const started = Date.now();
  const res = await spawnCapture(command, commandArgs, { cwd: fixture, timeout: timeoutMs });
  const durationMs = Date.now() - started;
  const log = (res.stdout || "") + "\n" + (res.stderr || "");
  const answerText = extractAnswerText(res.stdout || "", harness);
  let status = "ok";
  if (res.signal) status = "timeout";
  else if (res.error) status = "error";
  const sig = detect(log, answerText);
  const fireCorrect = sig.firedStrong === c.expectFire;
  const modeCorrect = !c.expectFire ? null : c.expectMode.includes(sig.modeDetected);
  const diagnostic = diagnosticFor(c, sig, status, log, answerText);
  fs.rmSync(fixture, { recursive: true, force: true });
  return { ...c, harness, model: model || "default", status, durationMs, ...sig, fireCorrect, modeCorrect, logLen: log.length, ...(diagnostic ? { diagnostic } : {}) };
}

function parseArgs(argv) {
  const opts = { harness: "codex", jobs: 1, timeoutMs: DEFAULT_TIMEOUT_MS };
  const positional = [];
  let explicitLabel = null;
  let explicitModel = null;
  let explicitOut = null;
  let help = false;
  const requireValue = (arg, value) => {
    if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
    return value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") help = true;
    else if (arg === "--harness") opts.harness = requireValue(arg, argv[++i]);
    else if (arg.startsWith("--harness=")) opts.harness = arg.split("=", 2)[1];
    else if (arg === "--jobs") opts.jobs = Number(requireValue(arg, argv[++i]));
    else if (arg.startsWith("--jobs=")) opts.jobs = Number(arg.split("=", 2)[1]);
    else if (arg === "--timeout-ms") opts.timeoutMs = Number(requireValue(arg, argv[++i]));
    else if (arg.startsWith("--timeout-ms=")) opts.timeoutMs = Number(arg.split("=", 2)[1]);
    else if (arg === "--label") explicitLabel = requireValue(arg, argv[++i]);
    else if (arg.startsWith("--label=")) explicitLabel = arg.split("=", 2)[1];
    else if (arg === "--model") explicitModel = requireValue(arg, argv[++i]);
    else if (arg.startsWith("--model=")) explicitModel = arg.split("=", 2)[1];
    else if (arg === "--out") explicitOut = requireValue(arg, argv[++i]);
    else if (arg.startsWith("--out=")) explicitOut = arg.split("=", 2)[1];
    else if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--overwrite") opts.overwrite = true;
    else if (arg.startsWith("--")) throw new Error(`unknown option: ${arg}\n\n${USAGE}`);
    else positional.push(arg);
  }
  if (help) return { help: true };
  if (positional.length > 3) throw new Error(`too many positional arguments: ${positional.slice(3).join(" ")}\n\n${USAGE}`);
  if (explicitLabel && positional[1]) throw new Error("use either positional <label> or --label, not both");
  if (explicitModel && positional[2]) throw new Error("use either positional [model] or --model, not both");
  if (explicitOut && positional[1]) throw new Error("use either positional <label> or --out, not both");
  if (!["codex", "claude"].includes(opts.harness)) throw new Error(`invalid --harness: ${opts.harness}`);
  if (!Number.isInteger(opts.jobs) || opts.jobs < 1) throw new Error(`invalid --jobs: ${opts.jobs}`);
  if (!Number.isInteger(opts.timeoutMs) || opts.timeoutMs < 1000) throw new Error(`invalid --timeout-ms: ${opts.timeoutMs}`);
  const outFile = explicitOut ? resolveOutFile(explicitOut) : null;
  if (!explicitLabel && !positional[1] && !outFile) {
    throw new Error(`missing label: pass positional <label>, --label, or --out\n\n${USAGE}`);
  }
  const label = explicitLabel || positional[1] || path.basename(outFile, ".jsonl");
  if (!/^[a-zA-Z0-9_.-]+$/.test(label) || label.startsWith(".") || label.startsWith("-")) {
    throw new Error(`invalid label: ${label}; use only letters, numbers, dot, underscore, and dash, and do not start with dot or dash`);
  }
  return { ...opts, subsetArg: positional[0] || "all", label, model: explicitModel || positional[2] || null, outFile };
}

function resolveOutFile(value) {
  if (!value.endsWith(".jsonl")) throw new Error(`--out must end with .jsonl: ${value}`);
  const abs = path.resolve(ROOT, value);
  const rel = path.relative(RESULTS_DIR, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`--out must stay under docs/evals/results: ${value}`);
  }
  if (path.basename(abs).startsWith(".") || path.basename(abs).startsWith("-")) {
    throw new Error(`invalid --out filename: ${value}`);
  }
  return abs;
}

async function runPool(subset, opts, onResult) {
  const queue = [...subset];
  const workers = Array.from({ length: Math.min(opts.jobs, queue.length) }, async () => {
    while (queue.length) {
      const c = queue.shift();
      const r = await runCase(c, opts);
      onResult(r);
    }
  });
  await Promise.all(workers);
}

function promoteOutput(outTmp, outFile, overwrite) {
  if (overwrite) {
    fs.renameSync(outTmp, outFile);
    return;
  }
  try {
    fs.copyFileSync(outTmp, outFile, fs.constants.COPYFILE_EXCL);
    fs.unlinkSync(outTmp);
  } catch (e) {
    fs.rmSync(outTmp, { force: true });
    if (e.code === "EEXIST") {
      throw new Error(`output already exists: ${path.relative(ROOT, outFile)}; use a fresh label or pass --overwrite`);
    }
    throw e;
  }
}

// main
const { subsetArg, label, model, harness, jobs, timeoutMs, outFile: parsedOutFile, dryRun, overwrite, help } = parseArgs(process.argv.slice(2));
if (help) {
  console.log(USAGE);
  process.exit(0);
}
const safeLabel = label.replace(/[^a-zA-Z0-9_.-]/g, "-");
let subset = CASES;
if (subsetArg === "fire") subset = CASES.filter((c) => c.expectFire);
else if (subsetArg === "nofire") subset = CASES.filter((c) => !c.expectFire);
else if (subsetArg === "realistic") subset = REALISTIC_CASES;
else if (subsetArg === "realistic-nofire") subset = REALISTIC_MUST_NOT_CASES;
else if (subsetArg === "p0-matrix") subset = selectCases(P0_MATRIX_IDS);
else if (subsetArg === "infra-lens") subset = INFRA_LENS_CASES;
else if (subsetArg === "broad") subset = [
  ...REALISTIC_CASES.filter((c) => ["R8", "R9", "R10", "R11", "R12", "R13", "R14"].includes(c.id)),
  ...REALISTIC_MUST_NOT_CASES,
];
else if (subsetArg !== "all") {
  const ids = subsetArg.split(",").map((s) => s.trim());
  subset = selectCases(ids);
  if (!subset.length) {
    throw new Error(`subset selected no cases: ${subsetArg}`);
  }
}

const outDir = RESULTS_DIR;
fs.mkdirSync(outDir, { recursive: true });
const outFile = parsedOutFile || path.join(outDir, `${label}.jsonl`);
if (!overwrite && fs.existsSync(outFile)) {
  throw new Error(`output already exists: ${path.relative(ROOT, outFile)}; use a fresh label or pass --overwrite`);
}
if (dryRun) {
  console.log(JSON.stringify({
    label,
    subset: subset.map((c) => c.id),
    harness,
    model: model || "default",
    outFile: path.relative(ROOT, outFile),
    overwrite: Boolean(overwrite),
  }, null, 2));
  process.exit(0);
}
const outTmp = path.join(outDir, `.${path.basename(outFile, ".jsonl")}.${process.pid}.tmp`);
fs.writeFileSync(outTmp, ""); // fresh, promoted only after summary is written

const results = [];
const version = harnessVersion(harness);
await runPool(subset, { harness, model, jobs, timeoutMs, safeLabel }, (r) => {
  results.push(r);
  fs.appendFileSync(outTmp, JSON.stringify(r) + "\n");
  console.log(`${r.id} [${r.status}] ${r.durationMs}ms fired=${r.firedStrong} (expect ${r.expectFire}) mode=${r.modeDetected} ok=${r.fireCorrect}${r.expectFire ? ` modeOk=${r.modeCorrect}` : ""} collideAnalyze=${r.collidedAnalyze}`);
});

const fires = results.filter((r) => r.expectFire);
const nofires = results.filter((r) => !r.expectFire);
const durations = results.map((r) => r.durationMs);
const sortedSlow = [...results].sort((a, b) => b.durationMs - a.durationMs).slice(0, 3);
const summary = {
  label,
  harness,
  harnessVersion: version,
  model: model || "default",
  jobs,
  timeoutMs,
  cases: results.length,
  mustFire: fires.length,
  mustFire_fired: fires.filter((r) => r.firedStrong).length,
  mustFire_routedRight: fires.filter((r) => r.modeCorrect).length,
  mustNot: nofires.length,
  mustNot_misfired: nofires.filter((r) => r.firedStrong).length,
  collidedAnalyze: results.filter((r) => r.collidedAnalyze).length,
  errors: results.filter((r) => r.status !== "ok").length,
  totalDurationMs: durations.reduce((sum, value) => sum + value, 0),
  maxDurationMs: durations.length ? Math.max(...durations) : 0,
  slowCases: sortedSlow.map((r) => ({ id: r.id, durationMs: r.durationMs })),
  fireMissIds: results.filter((r) => !r.fireCorrect).map((r) => r.id),
  routingMissIds: fires.filter((r) => !r.modeCorrect).map((r) => r.id),
  diagnosticIds: results.filter((r) => r.diagnostic).map((r) => r.id),
  timeoutIds: results.filter((r) => r.status === "timeout").map((r) => r.id),
};
fs.appendFileSync(outTmp, JSON.stringify({ summary }) + "\n");
promoteOutput(outTmp, outFile, overwrite);
console.log("\nSUMMARY", JSON.stringify(summary, null, 2));
