# Agent Integration Contract

Cairn ships one source for Codex and Claude Code, but the harnesses do not expose identical
controls. This contract separates proven guarantees from advisory behavior so docs, evals, and
status copy do not overclaim.

## Status terms

- **Strong** — verified locally and backed by a deterministic script or documented hook contract.
- **Proven** — live-tested in the harness, but still dependent on harness behavior.
- **Advisory** — Cairn can instruct or report it, but cannot enforce it automatically.
- **Pending upstream** — blocked on harness/plugin behavior outside Cairn.

## Claude Code

| Surface | Status | Cairn use |
| --- | --- | --- |
| Plugin manifest | Strong | Generated from `plugins/cairn/plugin.manifest.json`. |
| Skill loading | Proven | The `cairn` skill routes brownfield work by activation text. |
| `SessionStart` | Strong | Injects `hooks/bootstrap.md`; resume/compact also append `cairn-anchor.mjs`. |
| `UserPromptSubmit` anchor | Strong | `user-prompt-submit.sh` re-injects `cairn-anchor.mjs` per turn; smoke-tested both branches. |
| `PreToolUse` mutation guard | Strong | `hooks/hooks.json` routes edit/write tools to `cairn-guard.mjs`. |
| `Stop` coherence hook | Strong | `cairn-coherence.mjs` nudges missing durable state for declared durable modes. |
| Project agent | Advisory | `agents/cairn-researcher.md` keeps external research isolated and read-only. |
| Structured automation | Advisory | `claude -p --output-format json` can capture cost, turns, duration, and errors for future probes. |

## Codex

| Surface | Status | Cairn use |
| --- | --- | --- |
| Plugin manifest | Strong | Generated from the same canonical manifest as Claude. |
| Skill loading | Proven | The `cairn` skill loads from `skills/` and can auto-route brownfield work. |
| `SessionStart` | Proven | `session-start.sh` emits the bootstrap as plain text when no Claude JSON contract is present. |
| `Stop` coherence hook | Proven | Used for end-of-turn missing-state nudges. |
| `UserPromptSubmit` anchor | Pending upstream | Mirrors the proven `SessionStart` plain-text path; per-turn delivery not yet live-verified on Codex. |
| `PreToolUse` mutation guard | Pending upstream | Upstream fixed `apply_patch` emission (PR #18391) and docs now list it as a target, but runtime delivery via the installed plugin is not yet confirmed locally. |
| Write protection | Advisory | The prose contract still requires boundary checks before mutation; enforcement is best-effort. |

## Shared deterministic checks

`node plugins/cairn/scripts/cairn-doctor.mjs` is read-only and should answer:

- Are Codex and Claude CLIs visible on `PATH`?
- Do generated manifests match the canonical source?
- Are required hooks and helper scripts present?
- Which harness surfaces are strong, proven, advisory, or pending upstream?
- Is the current repo/workspace boundary detectable?

The doctor is not a benchmark and must not run model evals, mutate plugin installs, trust hooks, or
publish anything. If it cannot verify a live harness fact cheaply, it should say so instead of
promoting the claim.
