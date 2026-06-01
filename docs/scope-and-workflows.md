# Scope & Workflows

Cairn is a development workflow router, not a card-only framework.

Cards, issues, screenshots, and bug reports are strong intake signals, but Cairn should also
handle no-card work, greenfield-in-repo work, research, implementation, SDD-style deltas,
cleanup, complexity reduction, and alignment with existing repository patterns.

## Product boundary

| Work type | Cairn behavior | Default artifact |
| --- | --- | --- |
| Simple local task | `direct`: inspect, edit, focused proof, close | none |
| Bug, flake, timeout, broken test | `diagnose`: reproduce/trace/fix/prove | none unless behavior changes |
| Research or tool/library choice | `discovery`: official/current sources, options, recommendation, downside | brief or research note |
| Greenfield feature/module/tool inside a repo | `discovery` or `delta-spec`: define boundary before scaffold | brief/delta/plan |
| SDD/spec-driven change | `delta-spec`: current behavior, proposed behavior, tasks, proof | change folder |
| Cleanup / complexity reduction | `direct` for obvious cleanup; `delta-spec` when behavior or architecture changes | none or delta |
| Align with repo patterns | observe codebase, reuse local conventions, optionally update codebase map | codebase map only if useful |
| Cross-boundary/high-risk work | `tracked-change`: brainstorm, research, plan, tasks, proof, lifecycle decision | durable change folder |

## What Cairn should not become

- A mandatory PRD/story framework for every change.
- A clone of BMAD's full lifecycle.
- A clone of OpenSpec's full CLI/state machine.
- A universal greenfield product generator detached from repo/runtime proof.
- A subagent orchestration product where parallel coding is the default.

## How Cairn wins

- Proportional depth: direct work stays direct; high-risk work gets gates.
- Brownfield fit: repo patterns, current code, tests, and runtime beat generic plans.
- Official-doc research when external truth can change the plan.
- Deterministic helpers for state and checks instead of long repeated prompts.
- Durable memory only where it prevents repeated rediscovery.

## Official-doc implications checked 2026-06-01

- Codex skills use progressive disclosure, so Cairn should keep `SKILL.md` as a small router
  and push details into references/scripts.
- Codex subagents are best for read-heavy exploration, tests, logs, and review; parallel
  write-heavy coding needs disjoint ownership.
- Claude Code hooks are deterministic controls for formatting/blocking/injecting context;
  skills and subagents add workflow behavior but should not be treated as hard gates.
- OpenSpec's agent-compatible JSON/status/instructions model validates the value of small
  read-only state reporters like `cairn-next`.
- BMAD's quick-flow/project-context pattern validates Cairn's scoped codebase maps, but Cairn
  keeps them optional and area-based.
