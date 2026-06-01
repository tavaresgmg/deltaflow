---
name: cairn
description: Use for brownfield software work from a card, issue, link, rough idea, bug report, feature request, refactor, or planning request when Codex should automatically choose the right depth of brainstorming, research, delta spec, plan, implementation, proof, review, and archive without the user naming each step.
---

# Cairn

Cairn routes brownfield work to the lightest workflow that still protects
correctness. It is not a spec ceremony. It is a decision loop.

## Trigger

Use this skill when the user asks to:

- build, change, fix, refactor, plan, investigate, or implement work in an existing repo;
- start from a card, issue, ticket, link, screenshot, bug report, or rough idea;
- brainstorm or plan before coding;
- create specs or requirements for an existing system;
- work autonomously but with evidence and proof.

Do not use for pure Q&A with no local/software workflow, simple shell commands,
or tasks already covered by a more specific active skill.

## Quick Start

1. **Observe.** Identify cwd, repo root, owner boundary, relevant instructions,
   existing docs/specs, code paths, and available proof commands.
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
