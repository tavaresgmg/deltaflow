# Tasks: make-cairn-excellent

- [x] Establish tracked-change state — proof: `.cairn/changes/make-cairn-excellent/*` created.
- [x] Ground roadmap against current Codex/Claude/OpenSpec/BMAD/Spec Kit/Superpowers evidence — proof: Codex manual fetched current; Exa fetched Claude Code, OpenSpec, BMAD, Spec Kit, Superpowers primary docs; 3 subagents returned read-only findings.
- [x] Add codebase map and spec/archive lifecycle guidance — proof: updated `artifacts.md`, `memory.md`, `gates.md`, and `modes.md`.
- [x] Implement stronger `cairn-analyze.mjs` — proof: `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/make-cairn-excellent` emitted structured severity findings.
- [x] Implement `cairn-next.mjs` — proof: `node plugins/cairn/scripts/cairn-next.mjs .cairn/changes/make-cairn-excellent` returned next open task.
- [x] Reconcile docs and validation — proof: updated README, roadmap, comparison/gaps, release checklist, architecture, eval docs, and `validate-cairn.mjs`.
- [x] Run fresh proof and record results — proof: `node --check ...`, `node scripts/validate-cairn.mjs`, `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/make-cairn-excellent`, and `node plugins/cairn/scripts/cairn-next.mjs .cairn/changes/make-cairn-excellent` passed.
- [x] Run realistic routing eval subset on at least one Codex model — proof: `node scripts/eval-autotrigger.mjs realistic cairn-realistic-codex-0.136-default` returned 7/7 fired, 7/7 routedRight, 0 collisions, 0 errors.
- [x] Check over-trigger after scope expansion — proof: `node scripts/eval-autotrigger.mjs nofire cairn-nofire-after-scope-codex-0.136-default` returned 0/6 must-not misfires.
- [x] Add development-workflow scope beyond cards — proof: updated `SKILL.md`, `README.md`, `docs/scope-and-workflows.md`, and architecture docs.
- [x] Add semantic-claim analyzer v0 — proof: `validate-cairn.mjs` includes good/bad semantic fixtures for `cairn-analyze.mjs`.
- [x] Validate Claude Code install/hooks/eval — proof: `claude plugin validate plugins/cairn`, local marketplace install, `claude plugin details cairn@cairn`, live SessionStart/PreToolUse smokes, and `node scripts/eval-autotrigger.mjs R5,N2 ... --harness claude` passed.
- [x] Add faster cross-harness eval support — proof: `scripts/eval-autotrigger.mjs` supports `--harness codex|claude`, `--jobs`, per-case `durationMs`, `harnessVersion`, and isolated per-case fixtures.
- [x] Add a worked brownfield example and use it to test codebase maps — proof: added `.cairn/codebase/eval-harness.md`, `docs/examples/brownfield-card-eval-harness.md`, and required them in `validate-cairn.mjs`.
- [ ] Extend `cairn-analyze.mjs` from artifact/lifecycle checks toward semantic spec-code drift.
