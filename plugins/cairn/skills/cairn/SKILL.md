---
name: cairn
description: Routes brownfield software work to the lightest safe workflow that still protects correctness. ALWAYS invoke when the user wants to build, change, fix, refactor, plan, investigate, spec, or implement in an existing repo, or starts from a card, issue, ticket, link, screenshot, bug report, or rough idea (pt-BR: implementar, criar, corrigir, refatorar, ajustar, planejar, investigar, analisar; card, bug, tarefa). Do not start coding, planning, or speccing brownfield work directly without routing through Cairn first. Skip only for pure Q&A with no repo work, one-off shell commands, or tasks owned by a more specific active skill.
when_to_use: |
  Fire when the user says (en): build/change/fix/refactor/plan/investigate this;
  implement this card/issue/ticket; here's a bug/link/screenshot; brainstorm before
  coding; write a spec for an existing system; work this repo.
  (pt-BR): "implementa/cria/corrige/refatora/ajusta isso"; "esse card/bug/ticket";
  "investiga/analisa esse problema"; "planeja antes de codar"; "cria spec pra esse
  sistema"; "trabalha nesse repo".
  Do NOT fire for: pure Q&A with no repo work, one-off shell commands, or work owned
  by a more specific active skill.
---

# Cairn

Cairn routes brownfield work to the lightest workflow that still protects
correctness. It is not a spec ceremony. It is a decision loop.

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
| `direct` | small clear reversible change | none unless useful |
| `diagnose` | concrete failure, bug, flake, slowness | repro notes and proof |
| `discovery` | ambiguous idea, product/domain/architecture uncertainty | brief or decision note |
| `delta-spec` | medium brownfield behavior change | brief, delta, plan, proof |
| `tracked-change` | multi-phase, high-risk, cross-boundary, customer-visible | durable change folder |

If unsure between two modes, choose the lower ceremony mode unless auth, data,
money, production, public/customer impact, or multi-repo coordination is involved.

## Mode Details

Read these references only when needed:

- `references/modes.md` for detailed mode selection and workflow steps.
- `references/artifacts.md` for artifact templates and retention rules.
- `references/memory.md` for the `.cairn/` state layout and the resume protocol.
- `references/workspace.md` for the umbrella model and boundary detection.
- `references/framework-lessons.md` for what Cairn borrows and avoids.

## Required Behavior

- Brownfield first: inspect the current system before proposing architecture.
- Evidence first: do not invent IDs, dates, owners, card facts, API behavior, or runtime status.
- Research first when external truth can change the plan.
- Ask only when a wrong assumption changes path, risk, owner, cost, public effect, or outcome.
- Do not create PRD/spec/plan artifacts for small direct work.
- Do not implement before discovery when the request is vague and the wrong thing could be built.
- Do not use subagents by default. Use them only for independent research, review, or disjoint implementation slices.
- Do not impose TDD universally. Use tests proportional to risk and local patterns.
- Resume from state: on existing `.cairn/changes/<slug>/` work, read `tasks.md` and the
  `decision-log.md` tail before acting; tick `tasks.md` incrementally, not at the end.
- Before saying done, provide fresh proof.

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
