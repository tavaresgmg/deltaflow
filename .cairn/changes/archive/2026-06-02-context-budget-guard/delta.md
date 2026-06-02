# Delta

## Proposed Behavior

Cairn should keep its always-on and progressive-disclosure context surfaces small by default.
The bootstrap, `SKILL.md`, each reference file, all references, and the whole skill package
must have explicit word/character budgets checked during validation: code:
`plugins/cairn/scripts/cairn-budget.mjs`, `scripts/validate-cairn.mjs`; proof:
`node scripts/validate-cairn.mjs`.

The selected `SKILL.md` should avoid large literal output templates when a compact contract
is enough: code: `plugins/cairn/skills/cairn/SKILL.md`; proof:
`node plugins/cairn/scripts/cairn-budget.mjs --json`.

Docs must record that token/context reduction is a validated product property, not just a
style preference: code: `docs/architecture/mvp-architecture.md`,
`docs/comparison-and-gaps.md`; proof: `node scripts/validate-cairn.mjs`.

## Semantic Claims

- The budget reporter emits JSON for all budgeted context surfaces and fails on budget findings; code: `plugins/cairn/scripts/cairn-budget.mjs`; proof: `node plugins/cairn/scripts/cairn-budget.mjs --json`.
- The main validator fails if the context budget reporter fails or omits the always-on bootstrap/whole-package aggregate; code: `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
- The selected `SKILL.md` output contract keeps the required mode prefix while removing repeated literal templates; code: `plugins/cairn/skills/cairn/SKILL.md`; proof: `node scripts/validate-cairn.mjs`.
