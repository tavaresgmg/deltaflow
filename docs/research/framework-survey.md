# Framework Survey

Date: 2026-06-01

This survey captures what Deltaflow should borrow, avoid, or test from current
AI-coding workflow systems. It is not a claim that any tool is bad; the goal is
to extract useful patterns for a brownfield-first workflow.

## Sources Reviewed

- BMAD Method docs and README: https://docs.bmad-method.org/
- BMAD getting started and analysis phase: https://docs.bmad-method.org/tutorials/getting-started/ and https://docs.bmad-method.org/explanation/analysis-phase/
- OpenSpec README and docs: https://github.com/Fission-AI/OpenSpec and https://openspec.dev/
- GitHub Spec Kit docs and README: https://github.github.com/spec-kit/index.html and https://github.com/github/spec-kit
- Superpowers README and selected skills: https://github.com/obra/superpowers
- Open GSD / GSD Pi docs and technical writeups: https://github.com/open-gsd/gsd-pi and https://opengsd.net/products/gsd-core
- Codex official docs/manual for skills, plugins, hooks, AGENTS.md, and plugin packaging.

## BMAD

Useful:

- Strong analysis phase before PRD: brainstorming, research, product brief, PRFAQ.
- Explicit complexity tracks: quick flow vs full method vs enterprise.
- Brownfield guidance: generate project context from existing code and preserve current architecture.
- Role separation helps planning quality: analyst, PM, architect, developer, reviewer.

Risks:

- Too many artifacts for small changes.
- Implementation phases can become ceremony when a card is already clear.
- Tooling is heavier than needed for a single brownfield delta.

Deltaflow take:

- Borrow discovery and question quality.
- Borrow project-context generation for existing systems.
- Do not copy the full PRD/architecture/epic/story stack as the default.

## OpenSpec

Useful:

- Brownfield-first stance.
- Delta specs instead of full-system up-front specification.
- Minimal workflow: propose, apply, archive.
- Specs live beside code and persist beyond one chat session.
- Change folder model is easy to review and archive.

Risks:

- Still creates multiple artifacts per change; small fixes can be over-documented.
- Specs can drift if archive/sync discipline is weak.
- Planning quality depends heavily on the agent reading existing code correctly.

Deltaflow take:

- Adopt delta-based specs as the canonical planning artifact for medium+ changes.
- Make archive/sync explicit.
- Add a router so small work bypasses full spec artifacts.

## Spec Kit

Useful:

- Clear phase separation: Spec -> Plan -> Tasks -> Implement.
- Cross-artifact consistency checks are valuable.
- Templates, presets, extensions, and integrations show a strong distribution model.
- The `analyze`/checklist idea is useful before implementation.

Risks:

- Heavier than needed for routine brownfield work.
- More suited to structured SDD adoption than incremental card work.
- Setup and artifact stack can become the work.

Deltaflow take:

- Borrow phase separation and consistency checks.
- Borrow preset/extension mindset later, after the core flow is proven.
- Do not require all phases for every task.

## Superpowers

Useful:

- Skills-first methodology.
- Strong discipline around brainstorming before coding, planning before execution, and verification before completion.
- Review workflow catches drift early.
- Subagent-driven development preserves context and enables isolated review.

Risks:

- TDD mandate is too rigid for all work.
- Many skills can create invocation and trigger complexity.
- Subagent-per-task is expensive and unnecessary for routine edits.

Deltaflow take:

- Borrow verification-before-completion and review discipline.
- Use subagents only for independent research/review or large task slices.
- Treat TDD as a tool, not a universal law.

## GSD

Useful:

- Durable local state for long-running work.
- Discuss -> Plan -> Execute -> Verify -> Ship loop is simple and memorable.
- State-capture scripts avoid asking the model to rediscover filesystem facts.
- Worktree-aware execution and validation notes are valuable.

Risks:

- CLI/runtime scope can become large quickly.
- Many command surfaces and state files can become another tool to maintain.
- Claude-oriented command patterns do not map perfectly to Codex.

Deltaflow take:

- Borrow durable state and "verify before ship".
- Add deterministic scripts only after repeated prompt-only failures.
- Do not start with a full runtime or TUI.

## Cross-Framework Principles

Keep:

- route by complexity, not by framework ideology;
- research before planning when external truth matters;
- inspect the existing code before proposing architecture;
- produce reviewable intent before multi-file implementation;
- keep proof near the work;
- archive or delete planning artifacts after completion.

Avoid:

- mandatory full PRD for card work;
- full-system spec generation upfront;
- unconditional TDD;
- unconditional subagents;
- duplicate board/task state;
- copying commands instead of defining a native Codex skill surface.

## Deltaflow Differentiator

Deltaflow should be a router and operating loop, not another complete project
management universe. Its value is choosing the lightest workflow that still
protects correctness.

## Research Backlog

- Read each upstream framework's implementation prompts, not only public docs.
- Build a matrix of trigger phrases, artifacts, and stop conditions.
- Run the same 5 brownfield tasks through vanilla Codex, OpenSpec, BMAD Quick
  Flow, Superpowers, and Deltaflow.
- Record artifact count, time to patch, number of corrections, proof quality,
  and cleanup burden.
