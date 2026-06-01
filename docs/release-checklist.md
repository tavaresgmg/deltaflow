# Release checklist

Run before tagging a version. Publish patterns only after real brownfield usage validates
the core assumptions (roadmap Phase 6).

- [ ] `node scripts/build-manifests.mjs` — regenerate; commit any manifest/marketplace diff.
- [ ] `node scripts/validate-cairn.mjs` passes (files, parity, marketplace drift, YAML safety,
      gate/helper smoke).
- [ ] `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` reports no HIGH
      findings for active release work.
- [ ] Bump `version` in `plugins/cairn/plugin.manifest.json` and rebuild.
- [ ] Install on Codex from the pushed repo: `SessionStart` hook fires, skill loads with no
      YAML errors, auto-fires on a brownfield prompt.
- [ ] Run `docs/evals/auto-trigger.md` on ≥2 models per harness; log fire-rate in that file.
- [ ] Install on Claude Code; confirm marketplace, hooks (SessionStart + PreToolUse), skill,
      and the `cairn-researcher` agent load.
- [ ] Confirm no personal paths or internal artifacts shipped (public-repo hygiene).
- [ ] Tag and push.
