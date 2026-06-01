# Roadmap

## Phase 0: Repo Seed

- Create repo and plugin scaffold.
- Record framework survey and architecture decision.
- Create first Codex skill.
- Validate plugin structure.

Exit: repo has enough shape to test on real tasks.

## Phase 1: Prompt-Only MVP

- Improve `deltaflow` skill trigger and routing.
- Test against 5 real brownfield cards:
  - one bug;
  - one small feature;
  - one medium multi-file change;
  - one ambiguous product/architecture request;
  - one high-risk auth/data/runtime change.
- Record outcomes in `docs/evals/`.

Exit: router chooses the right mode in at least 4/5 cases without manual skill invocation.

## Phase 2: Minimal Artifacts

- Add templates for brief, delta, plan, and proof.
- Add script to create `.deltaflow/changes/<slug>/` only for `delta-spec` and `tracked-change`.
- Add archive/sync guidance based on OpenSpec lessons.

Exit: medium changes persist intent without creating ceremony for small fixes.

## Phase 3: Deterministic Helpers

- Add state inspection script inspired by GSD.
- Add artifact validation script inspired by Spec Kit consistency checks.
- Add optional web-research checklist for discovery mode.

Exit: repeated mechanical logic is in scripts, not rewritten in prompts.

## Phase 4: Review And Subagents

- Add optional independent review mode.
- Use subagents only for:
  - parallel source research;
  - code review;
  - independent module slices with disjoint files.
- Do not require subagents for small work.

Exit: review improves quality without doubling routine task cost.

## Phase 5: Claude Compatibility

- Generate Claude Code skill/plugin layout from the same source.
- Verify model-invoked skill behavior in Claude.
- Document differences in hooks, commands, and plugin packaging.

Exit: one source workflow, two harness targets.

## Phase 6: Public Readiness

- Add examples.
- Add install guide.
- Add prompt eval cases.
- Add release checklist.
- Publish only after real brownfield usage validates the core assumptions.
