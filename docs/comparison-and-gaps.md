# Comparison Snapshot

This is a short competitive snapshot, not an operating manual and not a roadmap. Historical
research lives in `docs/research/frameworks.md`; next work lives in `docs/roadmap.md`; current
agent behavior lives in `plugins/cairn/skills/cairn/references/`.

## Current Position

| Dimension | Cairn state | Owner |
| --- | --- | --- |
| Activation | SessionStart bootstrap plus directive skill description; runtime anchor injection is state-change gated. | `hooks/`, `SKILL.md`, `references/gates.md` |
| Modes | Five proportional modes from `direct` to `tracked-change`. | `references/modes.md` |
| Artifacts | Optional change folders, specs, codebase maps, and retention rules. | `references/artifacts.md` |
| Workspace | Umbrella parent workspace with deterministic boundary/state-root detection. | `references/workspace.md` |
| Consistency analysis | `cairn-analyze.mjs` reports change-folder drift; it does not execute proof. | `references/gates.md` |
| Evaluation state | Scoreboard owns active eval gaps and next commands. | `scripts/eval-scoreboard.mjs` |

## What Cairn Borrows

- BMAD: quick-vs-full judgment and discovery before costly implementation.
- OpenSpec: delta language, explicit archive/sync lifecycle, and spec/code reconciliation.
- Spec Kit: consistency analysis as a read-only check before close.
- Superpowers: small always-on bootstrap, proof discipline, and review pressure.
- GSD: deterministic state capture, without adopting duplicate project state.

## Current Gaps

These are intentionally tracked in one place: `docs/roadmap.md`.

- Strong dogfood proof of final sync: spec/code/proof/retention on a real task.
- A demonstrated quick-vs-full story from real usage, not just prose.
- Clearer explanation of what `cairn-analyze.mjs` covers and what it cannot prove.
- Real multi-repo dogfood proof using the workspace contract.
- Broader eval proof only after the core operating story is easy to explain.

## Where Cairn Is Distinct

- Default-light routing: small local work stays small.
- One source builds both Codex and Claude plugin surfaces.
- Workspace ownership is explicit; parent workflow state and child repo code are separate.
- Determinism is labeled honestly: scripts/hooks enforce narrow facts; prose handles judgment.

Do not add a new framework layer from this file. If a gap becomes actionable, update
`docs/roadmap.md` or the relevant `references/*.md` owner.
