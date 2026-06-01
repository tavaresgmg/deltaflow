# Deltaflow

Brownfield-first workflow for AI coding agents.

Deltaflow is an experimental Codex plugin/skill set for turning rough ideas, cards,
links, and bug reports into grounded plans, delta specs, implementation, proof, and
cleanup without forcing a heavyweight spec framework on every task.

## Thesis

Most coding-agent workflow frameworks overfit one of two extremes:

- too little structure: chat-only plans rot across sessions and reviewers cannot see intent;
- too much structure: every card becomes a mini product program with excess artifacts.

Deltaflow keeps the useful parts:

- BMAD-style discovery, brainstorming, research, and PRD sharpening;
- OpenSpec-style brownfield deltas and living specs;
- Spec Kit-style phase separation and artifact consistency checks;
- Superpowers/GSD-style execution discipline, review, verification, and durable state.

The first target is Codex. Claude Code compatibility is a roadmap item, not an MVP
requirement.

## Current MVP

```text
plugins/deltaflow/
  .codex-plugin/plugin.json
  skills/deltaflow/SKILL.md
  skills/deltaflow/references/
docs/
  research/framework-survey.md
  architecture/mvp-architecture.md
  roadmap.md
```

## Working Loop

1. Intake an idea, ticket, link, or card.
2. Detect complexity and risk.
3. Choose one mode:
   - direct patch
   - diagnose
   - discovery
   - delta spec
   - full tracked change
4. Create only the artifacts justified by the mode.
5. Implement with fresh proof.
6. Review and archive or clean up.

## Local Validation

```bash
node scripts/validate-deltaflow.mjs
```

## Status

Initial scaffold. The workflow is intentionally narrow until tested against real
brownfield cards.
