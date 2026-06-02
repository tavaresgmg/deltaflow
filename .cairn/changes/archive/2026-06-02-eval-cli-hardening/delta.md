# Delta

## Proposed Behavior

The eval runner must fail before starting Codex or Claude when it receives unknown flags,
ambiguous label/model forms, unsafe labels, or output paths outside `docs/evals/results`.
It must support explicit script-friendly output with `--out docs/evals/results/<label>.jsonl`:
code: `scripts/eval-autotrigger.mjs`; proof: `node scripts/validate-cairn.mjs`.

Eval docs must show the strict parser contract so future P0 runs do not accidentally create
bad JSONL artifacts such as `--out.jsonl`: code: `docs/evals/auto-trigger.md`,
`.cairn/codebase/eval-harness.md`; proof: `node scripts/validate-cairn.mjs`.

Hook docs must name the current Codex/Claude root env vars accurately while preserving the
cross-harness `${CLAUDE_PLUGIN_ROOT}` package convention: code:
`plugins/cairn/hooks/README.md`, `plugins/cairn/hooks/session-start.sh`,
`docs/architecture/mvp-architecture.md`, `docs/research/context-and-portability.md`; proof:
`node scripts/validate-cairn.mjs`.

## Semantic Claims

- Unknown eval runner flags fail before any harness starts; code: `scripts/eval-autotrigger.mjs`, `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
- `--out` is accepted only for `.jsonl` files under `docs/evals/results`; code: `scripts/eval-autotrigger.mjs`, `scripts/validate-cairn.mjs`; proof: `node scripts/validate-cairn.mjs`.
- Hook docs describe `${PLUGIN_ROOT}` as Codex-native and `${CLAUDE_PLUGIN_ROOT}` as cross-harness compatibility; code: `plugins/cairn/hooks/README.md`, `docs/research/context-and-portability.md`; proof: `node scripts/validate-cairn.mjs`.
