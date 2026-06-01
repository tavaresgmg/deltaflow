# Research: official docs for eval coverage

Fetched 2026-06-01.

## Signals

- OpenAI Codex manual says skills use progressive disclosure: Codex sees name,
  description, and path first, then loads full `SKILL.md` only after selection. It also says
  implicit invocation depends on concise descriptions with clear scope and boundaries.
- OpenAI Codex manual says subagents help keep noisy exploration/tests/logs out of the main
  thread, and cautions against parallel write-heavy workflows unless ownership is clear.
- OpenAI developer docs search surfaced the eval guidance that useful eval suites should be
  representative of behavior that matters and checked before becoming long-term tests.
- Claude Code changelog/docs show active plugin/hook/skill evolution, including plugin hook
  path fixes, hook output fields, skill/agent hook support, and plugin-discovered hooks.
- Claude hooks docs classify plugin `hooks/hooks.json` as a shareable hook location while the
  plugin is enabled.
- BMAD quick-fix docs support the same product boundary: small brownfield bug fixes and
  refactors should use a small direct path, not the full method.

## Implication For This Change

Expand evals with representative must-fire and must-not prompts before changing trigger text.
Cover rough no-card work, research-in-repo, cleanup, simplification, repo-pattern alignment,
and read-only near-misses. Keep the runner fast and parallel; do not add a new CLI or heavy
framework surface.
