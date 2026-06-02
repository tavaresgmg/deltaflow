# Delta

## Proposed Behavior

Cairn must not claim Codex `PreToolUse` mutation-guard parity until live file-change
events are proven. The guard still supports `apply_patch` events when they are delivered:
code: `plugins/cairn/scripts/cairn-guard.mjs`; proof: `node scripts/validate-cairn.mjs`.

Docs must use current Codex hook config shape and trust language:
code: `plugins/cairn/hooks/README.md`, `docs/install.md`, `docs/roadmap.md`,
`plugins/cairn/skills/cairn/references/gates.md`; proof: `node scripts/validate-cairn.mjs`.

## Semantic Claims

- `apply_patch` targets outside the repo are blocked by the guard logic when the event includes patch headers; code: `plugins/cairn/scripts/cairn-guard.mjs`; proof: `node scripts/validate-cairn.mjs`.
- Codex docs now describe plugin-bundled hooks, trust review, and current TOML event names without claiming live guard parity; code: `plugins/cairn/hooks/README.md`, `docs/install.md`; proof: `node scripts/validate-cairn.mjs`.
