# Research: competitor-and-harness-scan

## Sources Checked

- OpenAI Codex manual fetched 2026-06-01: skills, subagents, plugins, hooks.
- Claude Code changelog and docs fetched 2026-06-01.
- OpenSpec docs fetched 2026-06-01.
- BMAD Method docs/GitHub fetched 2026-06-01.
- GitHub Spec Kit docs fetched 2026-06-01.
- Superpowers docs/GitHub fetched 2026-06-01.

## Findings

- Codex skills use progressive disclosure: metadata first, `SKILL.md` only when selected, references/scripts only when needed. Skill descriptions must be concise, front-loaded, and scoped.
- Codex subagents are explicitly useful for read-heavy exploration, test/log analysis, and summarization. Parallel write-heavy work raises coordination cost.
- Codex plugin hooks are command-based, can be bundled with plugins, and support `SessionStart`, `PreToolUse`, `UserPromptSubmit`, `Stop`, and subagent events.
- Claude Code skills can run in subagents with `context: fork`, and Claude docs explicitly frame hooks as deterministic automation for formatting, blocking, notification, and context injection.
- Claude Code skill docs warn about skill description budget and recommend concise descriptions with keywords first; this supports keeping Cairn as one compact router plus references.
- Claude Code is moving aggressively toward dynamic workflows, background agents, worktree handling, lean prompts, plugin discovery, and auto mode. Cairn should not try to beat that by adding a heavier orchestrator.
- OpenSpec's strongest current primitives are `specs/` as living truth, `changes/` as proposals, `archive`, `status --json`, `instructions --json`, `verify`, workspaces, context stores, and agent-compatible JSON commands.
- BMAD's strength is broad lifecycle guidance, specialized agents, planning tracks, `bmad-help`, quick flow, and generated project context. Its risk is artifact/process weight, especially for small brownfield tasks.
- Spec Kit's strongest idea for Cairn is read-only cross-artifact analysis with severity, coverage, and token-efficient loading.
- Superpowers' strongest idea is explicit brainstorm/design-before-code plus subagent execution/review loops. Its risk for Cairn is mandatory gate cost on small work.

## Cairn Implications

- Keep one primary router skill. Split only after real usage proves a stable subflow.
- Add deterministic scripts where state can be inspected cheaply: next-step, analyze, stale changes, archive/spec checks.
- Store reusable context in concise `.cairn/codebase/*.md` maps rather than pushing everything into `SKILL.md`.
- Prefer read-only reporters over mutating CLIs until repeated manual actions prove the need.
- Add severity and coverage to `cairn-analyze.mjs`, but keep it scoped and fast.
- Position Cairn as a development workflow router, not a card-only system: cards are one intake source; no-card tasks, greenfield-in-repo, research, cleanup, SDD, and repo-pattern alignment all route through the same mode ladder.
- Add faster eval support by making fixtures process-isolated and result writes atomic, so subsets can run in parallel without corrupting evidence.
