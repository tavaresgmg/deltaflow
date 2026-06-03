# Cairn

> Route any coding task — a card, a bug, a rough idea — to the lightest workflow that still protects correctness.

![Runs on](https://img.shields.io/badge/runs%20on-Codex%20%2B%20Claude%20Code-2b6cb0)
![License](https://img.shields.io/badge/license-MIT-2f855a)
![Status](https://img.shields.io/badge/status-experimental-dd6b20)

Cairn is a workflow router for AI coding agents. Instead of forcing every task through one
heavyweight process, it picks **one of five proportional modes** — from a one-line fix to a
tracked multi-repo change — and produces only the artifacts that mode justifies. It auto-activates
from a SessionStart bootstrap (no need to invoke it by name) and runs on **OpenAI Codex and Claude
Code from a single source**.

## What you get

- Auto-routing for coding tasks: bugs, cards, rough ideas, cleanup, research, and specs.
- Five proportional modes, so tiny tasks stay tiny and risky work gets gates.
- File-based memory for resumable work without turning every task into a framework ceremony.
- Repo/workspace boundary checks, coherence checks, budget checks, and artifact retention.
- One source that builds both Codex and Claude Code plugin shims.

## What Cairn is not

- Not a project-management system.
- Not a replacement for tests, review, or production safety.
- Not a magic autonomous coding framework.
- Not a broad CLI; deterministic scripts exist only where repeated toil proves the need.

## Why

Most agent workflow frameworks overfit one extreme:

- **Too little structure** — chat-only plans rot across sessions; reviewers can't see intent.
- **Too much structure** — every card becomes a mini product program drowning in artifacts.

Cairn's answer is **proportional depth**: tiny tasks stay tiny; research, specs, greenfield, and
high-risk work get only the structure their risk justifies. Brownfield is the default posture —
inspect the existing system before proposing architecture.

## The five modes

| Mode | Use when | Artifacts |
| --- | --- | --- |
| `direct` | small, clear, reversible change | none |
| `diagnose` | a concrete bug, flake, or slowness | repro notes + proof |
| `discovery` | an ambiguous idea, research, greenfield, or scaffold | brief or decision note |
| `delta-spec` | a medium brownfield behavior change | brief, delta, plan, proof |
| `tracked-change` | multi-phase, high-risk, cross-boundary, customer-visible | durable change folder |

The loop is the same every time: **Observe → Classify → Act → Verify → Close**. Proof scales with
risk, and artifacts are deleted, archived, or synced — never left as clutter.

## Principles

Ten principles drive every decision (full text in [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)):

1. Proportional depth
2. Brownfield first
3. Evidence first
4. Reuse before invent
5. One source → both harnesses
6. Honest determinism boundary
7. No stale artifacts
8. Token economy / concise comms
9. Compounding context
10. Adversarial by default

## One source, both harnesses

Cairn ships a single canonical manifest that generates the Codex and Claude Code plugins, so the
two never drift. It bundles a repo-boundary guard and an end-of-turn coherence hook. Claude
PreToolUse guard is live-proven; Codex Stop hook is live-proven; Codex write-guard parity remains
best-effort until upstream PreToolUse/plugin-hook behavior is fully reliable. Read-only helper
scripts report facts (boundary, context readiness, drift) while the prose decides. What's enforced
vs advisory is stated plainly, never overclaimed.

## Install

**Codex**

```bash
codex plugin marketplace add tavaresgmg/cairn
codex plugin add cairn@cairn
```

**Claude Code**

```bash
/plugin marketplace add tavaresgmg/cairn
/plugin install cairn@cairn
```

Full setup, memory-policy presets, and local development: [`docs/install.md`](docs/install.md).

## Status

**Experimental.** Structural validation passes locally. Live harness behavior and model-eval gaps
are tracked in the roadmap/eval docs. Claude PreToolUse guard is live-proven; Codex Stop hook is
live-proven; Codex write-guard parity remains best-effort pending upstream PreToolUse/plugin-hook
behavior.

- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Roadmap & live proof: [`docs/roadmap.md`](docs/roadmap.md)
- Activation evals: [`docs/evals/auto-trigger.md`](docs/evals/auto-trigger.md)
- Agent integration contract: [`docs/architecture/agent-integration-contract.md`](docs/architecture/agent-integration-contract.md)
- Principles: [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)

## License

MIT — see [`LICENSE`](LICENSE).
