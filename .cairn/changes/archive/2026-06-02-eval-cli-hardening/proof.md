# Proof

- Official docs checked:
  - OpenAI Codex manual fetched 2026-06-02 with `openai-docs` helper; non-interactive
    mode documents JSONL automation and CLI flags.
  - Claude Code docs fetched 2026-06-02: `claude -p/--print` supports scripted usage with
    structured output, and plugin hooks load from `hooks/hooks.json`.
- `node --check scripts/eval-autotrigger.mjs` — passed.
- `node scripts/eval-autotrigger.mjs --help` — passed, prints `--out` usage.
- `node scripts/eval-autotrigger.mjs R5,N2 --harness codex` — failed before harness with
  `missing label`.
- `node scripts/eval-autotrigger.mjs R5,N2 --unknown` — failed before harness with
  `unknown option`.
- `node scripts/eval-autotrigger.mjs R5,N2 --out docs/evals/results/--out.jsonl` — failed
  before harness with `invalid --out filename`.
- `node scripts/eval-autotrigger.mjs R5,N2 --out /tmp/cairn-bad.jsonl` — failed before
  harness with `--out must stay under docs/evals/results`.
- `node scripts/eval-autotrigger.mjs N2 --out docs/evals/results/cairn-parser-smoke-codex-0.136-default.jsonl --jobs 1 --timeout-ms 120000`
  — passed: N2 stayed no-fire; temporary JSONL removed after proof.
- `node scripts/validate-cairn.mjs` — passed.
- Read-only subagent official-doc review confirmed Codex native plugin vars
  `${PLUGIN_ROOT}`/`${PLUGIN_DATA}` and compatibility vars `${CLAUDE_PLUGIN_ROOT}`/
  `${CLAUDE_PLUGIN_DATA}`; docs wording was updated without changing package behavior.

Lifecycle decision: archive. The durable parser behavior lives in `scripts/eval-autotrigger.mjs`,
`scripts/validate-cairn.mjs`, `docs/evals/auto-trigger.md`, and
`.cairn/codebase/eval-harness.md`.
