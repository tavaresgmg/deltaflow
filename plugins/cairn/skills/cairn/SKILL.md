---
name: cairn
description: "Routes software development work in or around a repo/workspace to the lightest safe workflow that still protects correctness. ALWAYS invoke for build, change, fix, refactor, plan, investigate, research, cleanup, reduce complexity, align with repo patterns, spec, implement, greenfield-in-repo work, or any card/issue/ticket/link/screenshot/bug/rough idea (pt-BR: implementar, criar, corrigir, refatorar, ajustar, planejar, pesquisar, investigar, limpar, reduzir complexidade, analisar). Skip pure Q&A, one-off shell commands, or tasks owned by a more specific active skill."
when_to_use: |
  Fire when the user says (en): build/change/fix/refactor/plan/research/investigate this;
  implement this card/issue/ticket; here's a bug/link/screenshot; brainstorm before
  coding; write a spec; clean this up; reduce complexity; align this with repo patterns;
  create a new module/tool/feature in this repo; work this repo/workspace.
  (pt-BR): "implementa/cria/corrige/refatora/ajusta isso"; "esse card/bug/ticket";
  "investiga/analisa esse problema"; "pesquisa"; "planeja antes de codar"; "cria spec";
  "limpa/reduz complexidade"; "alinha com o padrao do repo"; "trabalha nesse repo".
  Do NOT fire for: pure Q&A with no repo work, one-off shell commands, or work owned
  by a more specific active skill.
---

# Cairn

Cairn routes software development work to the lightest workflow that still protects
correctness. It is not card-only and it is not a spec ceremony. It is a decision loop.

Brownfield is the default posture whenever a repo exists: inspect the current system,
reuse patterns, and fit changes into the owner boundary. Greenfield work is supported
when it is development work in or for a repo/workspace, but it starts in `discovery` or
`tracked-change` when the wrong scaffold would be costly.

A SessionStart bootstrap routes work here before you respond — you do not need to
be invoked by name. Manual override: invoke the `cairn` skill / `/cairn`.

## Quick Start

1. **Observe.** Identify cwd, repo root, owner boundary, relevant instructions,
   existing docs/specs, code paths, and available proof commands. Before any mutation in
   a multi-repo workspace, run the boundary detector (see `references/workspace.md`).
2. **Classify.** Pick exactly one mode from the table below.
3. **Act.** Produce only the artifacts justified by that mode.
4. **Verify.** Run proof proportional to risk.
5. **Close.** Report outcome, proof, residual risk, and next action.

## Modes

| Mode | Use when | Artifact |
| --- | --- | --- |
| `direct` | small clear reversible change with obvious target; not broad greenfield/scaffold | none unless useful |
| `diagnose` | concrete failure, bug, flake, slowness | repro notes and proof |
| `discovery` | ambiguous idea, research, greenfield/scaffold, product/domain/architecture uncertainty | brief or decision note |
| `delta-spec` | medium brownfield behavior change | brief, delta, plan, proof |
| `tracked-change` | multi-phase, high-risk, cross-boundary, customer-visible | durable change folder |

If unsure between two modes, choose the lower ceremony mode unless auth, data,
money, production, public/customer impact, or multi-repo coordination is involved.
When the user explicitly asks to plan before coding, or asks for a new module/tool/feature
from scratch with unclear boundaries, choose `discovery` or `delta-spec`, not `direct`.

## Mode Details

Read these references only when needed:

- `references/modes.md` for detailed mode selection and workflow steps.
- `references/artifacts.md` for artifact templates and retention rules.
- `references/research.md` for the brainstorm / web-research / docs-grounding stages.
- `references/memory.md` for the `.cairn/` state layout and the resume protocol.
- `references/workspace.md` for the umbrella model and boundary detection.
- `references/gates.md` for what is deterministically enforced vs advisory, and reconciliation.
- `references/framework-lessons.md` for what Cairn borrows and avoids.

## Required Behavior

- Brownfield first: inspect the current system before proposing architecture.
- Not card-only: route rough ideas, no-card tasks, greenfield-in-repo, research, cleanup,
  simplification, implementation, SDD/spec work, and repo-pattern alignment through the same
  proportional mode ladder.
- Evidence first: do not invent IDs, dates, owners, card facts, API behavior, or runtime status.
- Research first when external truth can change the plan. Brainstorm, web research, and
  official-docs grounding are first-class but intent-gated (see `references/research.md`):
  skip them on small clear work; ground new libs on the lockfile version, not the newest.
- Use subagents only for isolated research or adversarial review — never to parallelize coding.
- Ask only when a wrong assumption changes path, risk, owner, cost, public effect, or outcome.
- Do not create PRD/spec/plan artifacts for small direct work.
- Do not implement before discovery when the request is vague and the wrong thing could be built.
- Do not impose TDD universally. Use tests proportional to risk and local patterns.
- Resume from state: on existing `.cairn/changes/<slug>/` work, read `tasks.md` and the
  `decision-log.md` tail before acting; tick `tasks.md` incrementally, not at the end.
- Before saying done, provide fresh proof and run `cairn-analyze.mjs` on any change folder.
- A PreToolUse guard blocks writes outside the active repo; do not work around it without
  confirming the target repo is intended.

## Output Shape

For small work:

```text
Done/Blocked: ...
Proof: ...
Risk: ...
Next: ...
```

For planning work:

```text
Mode: ...
Why: ...
Facts: ...
Open questions: ...
Plan: ...
Proof strategy: ...
```

For incomplete work, name the blocker and the next concrete action.
