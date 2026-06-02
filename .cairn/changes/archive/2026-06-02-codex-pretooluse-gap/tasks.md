# Tasks

- [x] Fetch current official Codex manual hooks/plugin sections — proof: `node /Users/tavares/.codex/skills/.system/openai-docs/scripts/fetch-codex-manual.mjs`.
- [x] Run live Codex `exec` smokes for in-repo and outside-repo file changes — proof: `.cairn/changes/codex-pretooluse-gap/proof.md`.
- [x] Harden guard logic for `apply_patch` patch-header paths — proof: `node scripts/validate-cairn.mjs`.
- [x] Correct hook docs and roadmap overclaims — proof: `node scripts/validate-cairn.mjs`.
- [x] Run final validation and archive — proof: `node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/codex-pretooluse-gap`, `git diff --check`.
