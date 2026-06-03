// Read-only scoreboard over docs/evals/results/*.jsonl.
// Summarizes coverage, historical failures, current gaps, slow cases, and the next cheap command to run.
// Usage:
//   node scripts/eval-scoreboard.mjs [--json]
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, "docs/evals/results");
const P0_IDS = ["R5", "R10", "R11", "N2", "N7", "N11"];

function readRun(file) {
  const text = fs.readFileSync(file, "utf8").trim();
  if (!text) return { summary: null, cases: [] };
  const rows = text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const summary = [...rows].reverse().find((row) => row.summary)?.summary || null;
  return {
    summary,
    cases: rows.filter((row) => !row.summary),
  };
}

function inferHarness(summary, cases, label) {
  if (summary?.harness) return { value: summary.harness, inferred: false };
  const fromCases = cases.find((row) => row.harness)?.harness;
  if (fromCases) return { value: fromCases, inferred: false };
  if (label.includes("claude")) return { value: "claude", inferred: true };
  if (label.includes("codex")) return { value: "codex", inferred: true };
  return { value: "unknown", inferred: true };
}

function inferModel(summary, cases, label) {
  if (summary?.model) return { value: summary.model, inferred: false };
  const fromCases = cases.find((row) => row.model)?.model;
  if (fromCases) return { value: fromCases, inferred: false };
  if (label.includes("gpt-5.4-mini")) return { value: "gpt-5.4-mini", inferred: true };
  if (label.includes("haiku")) return { value: "haiku", inferred: true };
  return { value: "default", inferred: true };
}

function variant(label = "") {
  if (label.includes("context-budget")) return "context-budget";
  if (label.includes("route-contract")) return "route-contract";
  if (label.includes("baseline")) return "baseline";
  if (label.includes("nofire-after-scope")) return "nofire-after-scope";
  if (label.includes("on-clean")) return "on-clean";
  return "default";
}

function runType(label = "") {
  if (label.includes("route-contract")) return "route-contract";
  if (label.includes("p0-matrix")) return "p0-matrix";
  if (label.includes("infra-lens")) return "infra-lens";
  if (label.includes("realistic-nofire") || label.includes("nofire-after-scope")) return "realistic-nofire";
  if (label.includes("realistic")) return "realistic";
  if (label.includes("broad")) return "broad";
  if (label.includes("fast")) return "fast";
  if (label.includes("baseline")) return "baseline";
  return "other";
}

function hasSummaryPass(summary) {
  if (!summary) return false;
  const mustFire = summary.mustFire || 0;
  const mustNot = summary.mustNot || 0;
  return (summary.errors || 0) === 0
    && (!mustFire || summary.mustFire_fired >= mustFire)
    && (!mustFire || summary.mustFire_routedRight >= mustFire)
    && (!mustNot || summary.mustNot_misfired === 0);
}

function caseIds(cases) {
  return cases.map((row) => row.id).filter(Boolean);
}

function sortedIds(ids) {
  return [...ids].sort((a, b) => {
    const pa = a.match(/^([A-Z]+)(\d+)$/);
    const pb = b.match(/^([A-Z]+)(\d+)$/);
    if (pa && pb && pa[1] === pb[1]) return Number(pa[2]) - Number(pb[2]);
    return a.localeCompare(b);
  });
}

function idsEqual(a, b) {
  const aa = sortedIds(a);
  const bb = sortedIds(b);
  return aa.length === bb.length && aa.every((id, index) => id === bb[index]);
}

function rerunNumber(label = "") {
  const match = label.match(/-rerun-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function derivedIds(summaryIds, cases, predicate) {
  if (Array.isArray(summaryIds)) return summaryIds;
  return cases.filter(predicate).map((row) => row.id).filter(Boolean);
}

function slowCases(summary, cases) {
  if (Array.isArray(summary?.slowCases)) return summary.slowCases;
  return cases
    .filter((row) => Number.isFinite(row.durationMs))
    .sort((a, b) => b.durationMs - a.durationMs)
    .slice(0, 3)
    .map((row) => ({ id: row.id, durationMs: row.durationMs }));
}

function totalDuration(summary, cases) {
  if (Number.isFinite(summary?.totalDurationMs)) return summary.totalDurationMs;
  const durations = cases.map((row) => row.durationMs).filter(Number.isFinite);
  return durations.length ? durations.reduce((sum, value) => sum + value, 0) : null;
}

function maxDuration(summary, cases) {
  if (Number.isFinite(summary?.maxDurationMs)) return summary.maxDurationMs;
  const durations = cases.map((row) => row.durationMs).filter(Number.isFinite);
  return durations.length ? Math.max(...durations) : null;
}

function score(run, file) {
  const fallbackLabel = path.basename(file, ".jsonl");
  const summary = run.summary || {};
  const cases = run.cases || [];
  const label = summary.label || fallbackLabel;
  const harness = inferHarness(summary, cases, label);
  const model = inferModel(summary, cases, label);
  const type = runType(label);
  const mustFire = summary.mustFire ?? cases.filter((row) => row.expectFire === true).length;
  const mustNot = summary.mustNot ?? cases.filter((row) => row.expectFire === false).length;
  const fired = summary.mustFire_fired ?? cases.filter((row) => row.expectFire === true && row.fireCorrect === true).length;
  const routed = summary.mustFire_routedRight ?? cases.filter((row) => row.expectFire === true && row.modeCorrect === true).length;
  const misfired = summary.mustNot_misfired ?? cases.filter((row) => row.expectFire === false && row.fireCorrect === false).length;
  const timeoutIds = derivedIds(summary.timeoutIds, cases, (row) => row.status === "timeout");
  const fireMissIds = derivedIds(summary.fireMissIds, cases, (row) => row.expectFire === true && row.fireCorrect === false);
  const routingMissIds = derivedIds(summary.routingMissIds, cases, (row) => row.expectFire === true && row.modeCorrect === false);
  const diagnosticIds = derivedIds(summary.diagnosticIds, cases, (row) => row.status !== "ok" || row.fireCorrect === false || row.modeCorrect === false);
  const clearedIds = type === "route-contract"
    ? cases
      .filter((row) => row.expectFire === true && row.status === "ok" && row.fireCorrect === true && row.modeCorrect === true)
      .map((row) => row.id)
      .filter(Boolean)
    : [];
  const errors = summary.errors ?? cases.filter((row) => row.status && row.status !== "ok").length;
  const failures = [];
  if (errors > 0) failures.push("errors");
  if (timeoutIds.length) failures.push("timeout");
  if (mustFire && fired < mustFire) failures.push("fire");
  if (mustFire && routed < mustFire) failures.push("route");
  if (mustNot && misfired > 0) failures.push("misfire");
  const ids = caseIds(cases);
  const p0IdsValid = type !== "p0-matrix" || ids.length === 0 || idsEqual(ids, P0_IDS);
  if (!p0IdsValid) failures.push("p0-ids");
  return {
    file: path.relative(ROOT, file),
    label,
    rerunNumber: rerunNumber(label),
    type,
    variant: variant(label),
    harness: harness.value,
    harnessInferred: harness.inferred,
    harnessVersion: summary.harnessVersion || null,
    model: model.value,
    modelInferred: model.inferred,
    cases: summary.cases ?? cases.length,
    ids,
    p0IdsValid,
    mustFire,
    mustFire_fired: fired,
    mustFire_routedRight: routed,
    mustNot,
    mustNot_misfired: misfired,
    errors,
    timeoutMs: summary.timeoutMs || null,
    totalDurationMs: totalDuration(summary, cases),
    maxDurationMs: maxDuration(summary, cases),
    slowCases: slowCases(summary, cases),
    fireMissIds,
    routingMissIds,
    diagnosticIds,
    timeoutIds,
    clearedIds,
    fireRate: mustFire ? fired / mustFire : null,
    routeRate: mustFire ? routed / mustFire : null,
    misfireRate: mustNot ? misfired / mustNot : null,
    failures,
    pass: failures.length === 0,
    summaryPass: hasSummaryPass(run.summary),
  };
}

function routeContractClears(rows) {
  const cleared = new Map();
  for (const row of rows) {
    if (row.type !== "route-contract") continue;
    const ids = row.clearedIds.length ? row.clearedIds : (row.pass ? row.ids : []);
    for (const id of ids) {
      const key = `${row.harness}:${row.model}:${id}`;
      cleared.set(key, Math.max(cleared.get(key) ?? -1, row.rerunNumber ?? 0));
    }
  }
  return cleared;
}

function attachClearedState(rows) {
  const cleared = routeContractClears(rows);
  const clearsRow = (row, id) => (cleared.get(`${row.harness}:${row.model}:${id}`) ?? -1) >= (row.rerunNumber ?? 0);
  return rows.map((row) => {
    const clearedFireMissIds = row.fireMissIds.filter((id) => clearsRow(row, id));
    const unclearedFireMissIds = row.fireMissIds.filter((id) => !clearsRow(row, id));
    const clearedRoutingMissIds = row.routingMissIds.filter((id) => clearsRow(row, id));
    const unclearedRoutingMissIds = row.routingMissIds.filter((id) => !clearsRow(row, id));
    const clearedTimeoutIds = row.timeoutIds.filter((id) => clearsRow(row, id));
    const unclearedTimeoutIds = row.timeoutIds.filter((id) => !clearsRow(row, id));
    const activeFailures = row.failures.filter((failure) => {
      if (failure === "fire") return unclearedFireMissIds.length > 0 || row.fireMissIds.length === 0;
      if (failure === "route") return unclearedRoutingMissIds.length > 0 || row.routingMissIds.length === 0;
      if (failure === "timeout") return unclearedTimeoutIds.length > 0 || row.timeoutIds.length === 0;
      if (failure === "errors" && row.errors === row.timeoutIds.length) return unclearedTimeoutIds.length > 0 || row.timeoutIds.length === 0;
      return true;
    });
    const control = row.type === "baseline" || row.variant === "on-clean";
    return {
      ...row,
      clearedFireMissIds,
      unclearedFireMissIds,
      clearedRoutingMissIds,
      unclearedRoutingMissIds,
      clearedTimeoutIds,
      unclearedTimeoutIds,
      activeFailures: control ? [] : activeFailures,
      activePass: control || activeFailures.length === 0,
    };
  });
}

function loadRows() {
  const rows = fs.readdirSync(RESULTS_DIR)
    .filter((name) => name.endsWith(".jsonl"))
    .sort()
    .map((name) => {
      const file = path.join(RESULTS_DIR, name);
      const run = readRun(file);
      if (!run.summary && !run.cases.length) return null;
      return score(run, file);
    })
    .filter(Boolean);
  return attachClearedState(rows);
}

function percent(value) {
  if (value == null) return "-";
  return `${Math.round(value * 100)}%`;
}

function compactRow(row) {
  const inferred = row.harnessInferred || row.modelInferred ? "*" : " ";
  const active = row.activeFailures.join(",") || "ok";
  return [
    row.label.padEnd(52),
    `${row.harness}${inferred}`.padEnd(7),
    row.model.padEnd(13),
    row.type.padEnd(16),
    String(row.cases).padStart(2),
    percent(row.fireRate).padStart(4),
    percent(row.routeRate).padStart(4),
    percent(row.misfireRate).padStart(4),
    String(row.errors).padStart(2),
    row.maxDurationMs == null ? "     -" : `${Math.round(row.maxDurationMs / 1000)}s`.padStart(6),
    active,
  ].join("  ");
}

function coverage(rows) {
  const byHarnessModel = {};
  for (const row of rows) {
    if (row.type === "baseline") continue;
    const key = `${row.harness}:${row.model}`;
    byHarnessModel[key] ||= { harness: row.harness, model: row.model, types: new Set(), pass: true, inferred: false };
    byHarnessModel[key].types.add(row.type);
    byHarnessModel[key].pass &&= row.activePass;
    byHarnessModel[key].inferred ||= row.harnessInferred || row.modelInferred;
  }
  return Object.values(byHarnessModel).map((item) => ({
    ...item,
    types: [...item.types].sort(),
  }));
}

function globalSlowCases(rows) {
  return rows.flatMap((row) => row.slowCases.map((item) => ({
    label: row.label,
    harness: row.harness,
    model: row.model,
    id: item.id,
    durationMs: item.durationMs,
    timeoutMs: row.timeoutMs,
    nearTimeout: row.timeoutMs ? item.durationMs >= row.timeoutMs * 0.8 : false,
  }))).sort((a, b) => b.durationMs - a.durationMs).slice(0, 8);
}

function missingCoverage(rows) {
  const gaps = [];
  for (const harness of ["codex", "claude"]) {
    const modelsWithP0 = new Set(rows
      .filter((row) => row.harness === harness && row.type === "p0-matrix" && row.variant === "default" && row.activePass)
      .map((row) => row.model));
    if (modelsWithP0.size < 2) gaps.push(`${harness}: fewer than two passing p0-matrix models`);
    const realisticModels = new Set(rows
      .filter((row) => row.harness === harness && row.type === "realistic" && row.pass)
      .map((row) => row.model));
    if (realisticModels.size < 2) gaps.push(`${harness}: fewer than two passing realistic must-fire models`);
    const nofireModels = new Set(rows
      .filter((row) => row.harness === harness && row.type === "realistic-nofire" && row.activePass)
      .map((row) => row.model));
    if (nofireModels.size < 1) gaps.push(`${harness}: no passing realistic-nofire suite recorded`);
  }
  return gaps;
}

function resultFileExists(label) {
  return fs.existsSync(path.join(RESULTS_DIR, `${label}.jsonl`));
}

function nextAvailableLabel(base) {
  if (!resultFileExists(base)) return base;
  for (let i = 1; i < 100; i += 1) {
    const candidate = `${base}-rerun-${i}`;
    if (!resultFileExists(candidate)) return candidate;
  }
  throw new Error(`could not find available result label for ${base}`);
}

function nextCommand(rows) {
  const codexMiniP0 = rows.find((row) => row.harness === "codex" && row.model !== "default" && row.type === "p0-matrix" && row.activePass);
  if (!codexMiniP0) {
    const label = nextAvailableLabel("cairn-p0-matrix-codex-0.136-gpt-5.4-mini");
    return {
      reason: "Codex has no passing second-model p0-matrix; this is cheaper than the full realistic suite.",
      command: `node scripts/eval-autotrigger.mjs p0-matrix ${label} gpt-5.4-mini --jobs 4 --timeout-ms 150000`,
    };
  }
  const codexMiniRealistic = rows.find((row) => row.harness === "codex" && row.model !== "default" && row.type === "realistic");
  if (codexMiniRealistic && !codexMiniRealistic.activePass) {
    const missIds = sortedIds(new Set([
      ...codexMiniRealistic.fireMissIds,
      ...codexMiniRealistic.unclearedRoutingMissIds,
      ...codexMiniRealistic.unclearedTimeoutIds,
    ]));
    const repeatedTimeout = rows.some((row) => row.harness === "codex"
      && row.model === codexMiniRealistic.model
      && row.type === "route-contract"
      && row.timeoutIds.some((id) => missIds.includes(id)));
    const subset = repeatedTimeout
      ? missIds.join(",")
      : sortedIds(new Set([...missIds, "N10", "N12"])).join(",");
    const label = nextAvailableLabel("cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps");
    const timeoutMs = repeatedTimeout ? 240000 : 180000;
    const sandbox = repeatedTimeout ? " --sandbox workspace-write" : "";
    const jobs = repeatedTimeout ? 1 : 4;
    return {
      reason: `Codex second-model realistic suite has focused diagnostic debt (${missIds.join(",")}); ${repeatedTimeout ? "avoid another broad near-miss rerun and isolate only the timed-out case in a writable temp sandbox." : "retest only those gaps plus near-misses before rerunning the full suite."}`,
      command: `node scripts/eval-autotrigger.mjs ${subset} ${label} gpt-5.4-mini --jobs ${jobs} --timeout-ms ${timeoutMs}${sandbox}`,
    };
  }
  const label = nextAvailableLabel("cairn-realistic-codex-0.136-gpt-5.4-mini");
  return {
    reason: "Next remaining roadmap proof is realistic routing on a second model per harness.",
    command: `node scripts/eval-autotrigger.mjs realistic ${label} gpt-5.4-mini --jobs 4 --timeout-ms 180000`,
  };
}

const rows = loadRows();
const failures = rows.filter((row) => !row.pass);
const activeFailures = rows.filter((row) => !row.activePass);
const report = {
  ok: activeFailures.length === 0,
  rows,
  failures,
  activeFailures,
  coverage: coverage(rows),
  missingCoverage: missingCoverage(rows),
  slowCases: globalSlowCases(rows),
  nextCommand: nextCommand(rows),
  p0Ids: P0_IDS,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log("label                                                 harness  model          type              n  fire route miss err   slow  status");
  for (const row of rows) console.log(compactRow(row));
  console.log("\nHistorical failures:", failures.length ? failures.map((row) => row.label).join(", ") : "none");
  console.log("Active failures:", activeFailures.length ? activeFailures.map((row) => row.label).join(", ") : "none");
  console.log("Missing coverage:", report.missingCoverage.length ? report.missingCoverage.join("; ") : "none");
  console.log("Slowest:", report.slowCases.map((row) => `${row.id}/${row.harness}/${row.model} ${Math.round(row.durationMs / 1000)}s${row.nearTimeout ? " near-timeout" : ""}`).join(", ") || "none");
  console.log("Next:", report.nextCommand.command);
  console.log("Why:", report.nextCommand.reason);
}
