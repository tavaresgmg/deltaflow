# Proof

- Official Codex manual fetched 2026-06-02 with `openai-docs` helper. Relevant facts:
  skills use progressive disclosure; the initial skills list includes name, description, and
  path; descriptions should be concise, scoped, and front-loaded; full `SKILL.md` loads only
  after selection.
- `wc -w plugins/cairn/hooks/bootstrap.md plugins/cairn/skills/cairn/SKILL.md plugins/cairn/skills/cairn/references/*.md`
  before edit showed: bootstrap 135 words, SKILL 903 words, whole set 3823 words.
- `plugins/cairn/skills/cairn/SKILL.md` output-shape block compacted while preserving
  `Mode: <direct|diagnose|discovery|delta-spec|tracked-change>`.
- `node plugins/cairn/scripts/cairn-budget.mjs --json` — passed. Current report:
  bootstrap 135 words / ~240 tokens; SKILL 890 words / ~1607 tokens; whole package 3810
  words / ~6593 tokens; no findings.
- `node scripts/validate-cairn.mjs` — passed.
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/context-budget-guard` —
  passed before archive.
- `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-context-budget --jobs 4 --timeout-ms 150000`
  — passed on Codex v0.136.0 default: 3/3 must-fire fired, 3/3 routed right, 0/3
  must-not misfires, 0 errors.

Lifecycle decision: archive - Durable behavior lives in `plugins/cairn/scripts/cairn-budget.mjs`,
`scripts/validate-cairn.mjs`, `plugins/cairn/skills/cairn/SKILL.md`,
`docs/architecture/mvp-architecture.md`, `docs/comparison-and-gaps.md`, and
`docs/evals/auto-trigger.md`.
