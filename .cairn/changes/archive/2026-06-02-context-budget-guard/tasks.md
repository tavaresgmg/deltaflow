# Tasks

- [x] Measure current bootstrap/SKILL/reference surfaces — proof: `wc -w plugins/cairn/hooks/bootstrap.md plugins/cairn/skills/cairn/SKILL.md plugins/cairn/skills/cairn/references/*.md`.
- [x] Check current official Codex skill docs for progressive disclosure — proof: `node /Users/tavares/.codex/skills/.system/openai-docs/scripts/fetch-codex-manual.mjs`.
- [x] Add budget reporter and validator hook — proof: `plugins/cairn/scripts/cairn-budget.mjs`, `scripts/validate-cairn.mjs`.
- [x] Compact selected-skill output contract — proof: `plugins/cairn/skills/cairn/SKILL.md`.
- [x] Document budget guard — proof: `docs/architecture/mvp-architecture.md`, `docs/comparison-and-gaps.md`.
- [x] Run final validation and archive — proof: `node plugins/cairn/scripts/cairn-budget.mjs --json`, `node scripts/validate-cairn.mjs`, `node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-codex-0.136-context-budget --jobs 4 --timeout-ms 150000`.
