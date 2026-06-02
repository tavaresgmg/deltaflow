# Proof

- Official Codex manual fetched 2026-06-02 with `openai-docs` helper:
  `/codex/hooks.md` says hooks are enabled by default, `hooks` is the canonical feature key,
  plugins can bundle lifecycle config through manifest or `hooks/hooks.json`, non-managed
  hooks require review/trust, `--dangerously-bypass-hook-trust` is for vetted automation,
  and `PreToolUse` matchers support `Bash`, `apply_patch`, and MCP tool names.
- `codex --version` — `codex-cli 0.136.0`.
- `codex plugin list -m cairn` — `cairn@cairn` installed, enabled from this repo.
- `codex exec --sandbox workspace-write --dangerously-bypass-hook-trust --json ...` in-repo
  `apply_patch` smoke — created `.tmp/cairn-codex-applypatch-smoke.txt`; this proves file
  changes can happen in the live harness, not guard delivery.
- `codex exec --sandbox workspace-write --dangerously-bypass-hook-trust --json ...` outside
  repo `apply_patch` smoke — no file created; stderr showed `patch rejected: writing outside
  of the project; rejected by user approval settings`, so this was sandbox/approval proof,
  not Cairn guard proof.
- `codex exec --dangerously-bypass-approvals-and-sandbox --dangerously-bypass-hook-trust
  --json ...` outside repo `apply_patch` smoke — created
  `/Users/tavares/Developer/cairn-codex-guard-should-block.txt`; file removed immediately.
  This proves Codex guard parity is still not established in this local `exec` path.
- Temporary project `.codex/hooks.json` observer with `PreToolUse` matcher `*` captured no
  stdin event while a Codex `file_change` completed. The observer was removed.

Lifecycle decision: archive. The durable behavior and remaining Codex live-hook gap are synced
into `docs/roadmap.md`, `docs/install.md`, `plugins/cairn/hooks/README.md`, and
`plugins/cairn/skills/cairn/references/gates.md`.
