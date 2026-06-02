# Brainstorm: make-cairn-excellent

## Problem / Intent

Evolve Cairn from a validated MVP into a sharper brownfield workflow router that can compete with heavier frameworks by being smaller, more deterministic, and cheaper in context.

## Options

1. Copy competitor lifecycle features broadly.
   Tradeoff: fast parity language, but likely bloats Cairn and weakens the "default-light" thesis.
2. Add only durable brownfield primitives missing from Cairn.
   Tradeoff: less flashy, but improves real work: codebase maps, living specs/archive, better analyze/next-step checks.
3. Build a large orchestration layer now.
   Tradeoff: powerful on paper, but premature without more real brownfield examples.

## Chosen Direction

Option 2. Make Cairn excellent through small deterministic primitives:

- persisted codebase maps for non-obvious repo knowledge;
- specs/archive lifecycle so deltas do not rot;
- read-only consistency and next-step scripts;
- current-doc research that informs roadmap without becoming ceremony.

## Open Questions

- Whether Claude Code live install/hook behavior can be validated in this local environment.
- Which realistic brownfield card should become the public worked example.
