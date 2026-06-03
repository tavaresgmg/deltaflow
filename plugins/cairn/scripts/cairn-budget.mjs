// Read-only context budget report for Cairn's always-on and progressively-loaded surfaces.
// Usage:
//   node plugins/cairn/scripts/cairn-budget.mjs [--json]
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SURFACES = [
  { name: "bootstrap", file: "plugins/cairn/hooks/bootstrap.md", maxWords: 220, maxChars: 1400, alwaysOn: true },
  { name: "skill", file: "plugins/cairn/skills/cairn/SKILL.md", maxWords: 1100, maxChars: 7200, alwaysOn: false },
  { name: "references/artifacts", file: "plugins/cairn/skills/cairn/references/artifacts.md", maxWords: 700, maxChars: 4500, alwaysOn: false },
  { name: "references/workflow", file: "plugins/cairn/skills/cairn/references/workflow.md", maxWords: 420, maxChars: 3000, alwaysOn: false },
  { name: "references/framework-lessons", file: "plugins/cairn/skills/cairn/references/framework-lessons.md", maxWords: 450, maxChars: 3200, alwaysOn: false },
  { name: "references/gates", file: "plugins/cairn/skills/cairn/references/gates.md", maxWords: 550, maxChars: 3800, alwaysOn: false },
  { name: "references/memory", file: "plugins/cairn/skills/cairn/references/memory.md", maxWords: 650, maxChars: 4200, alwaysOn: false },
  { name: "references/modes", file: "plugins/cairn/skills/cairn/references/modes.md", maxWords: 600, maxChars: 3900, alwaysOn: false },
  { name: "references/research", file: "plugins/cairn/skills/cairn/references/research.md", maxWords: 550, maxChars: 3700, alwaysOn: false },
  { name: "references/review", file: "plugins/cairn/skills/cairn/references/review.md", maxWords: 320, maxChars: 2100, alwaysOn: false },
  { name: "references/workspace", file: "plugins/cairn/skills/cairn/references/workspace.md", maxWords: 400, maxChars: 2800, alwaysOn: false },
];

const AGGREGATES = [
  { name: "all-references", prefix: "references/", maxWords: 4000, maxChars: 26000 },
  { name: "whole-skill-package", maxWords: 5200, maxChars: 34000 },
];

function countText(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    chars: text.length,
    words,
    approxTokens: Math.ceil(text.length / 4),
  };
}

function surfaceReport(surface) {
  const abs = path.join(ROOT, surface.file);
  const text = fs.readFileSync(abs, "utf8");
  const counts = countText(text);
  const findings = [];
  if (counts.words > surface.maxWords) {
    findings.push({
      severity: "HIGH",
      code: "SURFACE_WORD_BUDGET_EXCEEDED",
      message: `${surface.file} has ${counts.words} words; budget is ${surface.maxWords}`,
    });
  }
  if (counts.chars > surface.maxChars) {
    findings.push({
      severity: "HIGH",
      code: "SURFACE_CHAR_BUDGET_EXCEEDED",
      message: `${surface.file} has ${counts.chars} chars; budget is ${surface.maxChars}`,
    });
  }
  return { ...surface, ...counts, findings };
}

function aggregateReport(name, rows, limits) {
  const counts = rows.reduce((acc, row) => ({
    chars: acc.chars + row.chars,
    words: acc.words + row.words,
    approxTokens: acc.approxTokens + row.approxTokens,
  }), { chars: 0, words: 0, approxTokens: 0 });
  const findings = [];
  if (counts.words > limits.maxWords) {
    findings.push({
      severity: "HIGH",
      code: "AGGREGATE_WORD_BUDGET_EXCEEDED",
      message: `${name} has ${counts.words} words; budget is ${limits.maxWords}`,
    });
  }
  if (counts.chars > limits.maxChars) {
    findings.push({
      severity: "HIGH",
      code: "AGGREGATE_CHAR_BUDGET_EXCEEDED",
      message: `${name} has ${counts.chars} chars; budget is ${limits.maxChars}`,
    });
  }
  return { name, ...counts, ...limits, findings };
}

const surfaces = SURFACES.map(surfaceReport);
const aggregates = AGGREGATES.map((agg) => {
  const rows = agg.prefix ? surfaces.filter((row) => row.name.startsWith(agg.prefix)) : surfaces;
  return aggregateReport(agg.name, rows, agg);
});
const findings = [...surfaces.flatMap((row) => row.findings), ...aggregates.flatMap((row) => row.findings)];
const report = {
  ok: findings.length === 0,
  surfaces,
  aggregates,
  findings,
};

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const row of surfaces) {
    console.log(`${row.name}: ${row.words} words, ${row.chars} chars, ~${row.approxTokens} tokens`);
  }
  for (const row of aggregates) {
    console.log(`${row.name}: ${row.words} words, ${row.chars} chars, ~${row.approxTokens} tokens`);
  }
  if (findings.length) {
    console.error("\nFindings:");
    for (const finding of findings) console.error(`- ${finding.code}: ${finding.message}`);
  }
}

if (findings.length) process.exit(1);
