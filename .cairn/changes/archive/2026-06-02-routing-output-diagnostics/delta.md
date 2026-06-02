# Delta: routing-output-diagnostics

## Current Behavior

Recent evals prove Cairn often fires, but some cases have `modeDetected=null` even when
`outputShape=true`. The result is ambiguous: the skill engaged, but the harness cannot tell
whether the model honored the mode ladder.

## Proposed Behavior

- Require every Cairn-routed response to start with `Mode: <mode>`.
- Keep small-work output compact while making mode selection machine-readable.
- Add per-case diagnostics to new eval JSONL rows when fire/routing/status checks fail.
- Add summary IDs for fire misses, routing misses, diagnostic rows, and timeouts.

## Contracts And Boundaries

- Do not change trigger words or mode definitions.
- Do not reinterpret old results as passing; keep them as historical evidence.
- Keep diagnostic excerpts bounded to avoid huge JSONL files.

## Semantic Claims

- Cairn output requires a parseable `Mode:` line for any routed work; code: `plugins/cairn/skills/cairn/SKILL.md`; proof: `node scripts/validate-cairn.mjs`
- New eval rows include bounded diagnostics when a case misfires, misses route mode, times out, or errors; code: `scripts/eval-autotrigger.mjs`; proof: `node scripts/eval-autotrigger.mjs R5,N2 cairn-route-contract-codex-0.136-gpt-5.4-mini gpt-5.4-mini --jobs 2 --timeout-ms 120000`

## Out Of Scope

- Retuning the auto-trigger description.
- Full matrix reruns.
- New hooks or MCP servers.
