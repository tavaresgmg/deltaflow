# Cairn

> Route any coding task — a card, a bug, a rough idea — to the lightest workflow that still protects correctness.

![Runs on](https://img.shields.io/badge/runs%20on-Codex%20%2B%20Claude%20Code-2b6cb0)
![License](https://img.shields.io/badge/license-MIT-2f855a)
![Status](https://img.shields.io/badge/status-experimental-dd6b20)

Cairn implements **Cairn Proofflow**: Evidence-Routed Development for AI-assisted software work.
It routes by evidence, risk, and owner boundaries instead of forcing every task through one
heavyweight process. It picks **one of five proportional modes** — from a one-line fix to a tracked
multi-repo change — and produces only the artifacts that mode justifies. It auto-activates from a
SessionStart bootstrap (no need to invoke it by name) and runs on **OpenAI Codex and Claude Code
from a single source**.

## What you get

- Auto-routing for coding tasks: bugs, cards, rough ideas, cleanup, research, and specs.
- Five proportional modes, so tiny tasks stay tiny and risky work gets gates.
- File-based memory for resumable work without turning every task into a framework ceremony.
- Repo/workspace boundary checks, coherence checks, deterministic scaffolding, and one closeout
  validator/archiver.
- One source that builds both Codex and Claude Code plugin shims.

## What Cairn is not

- Not a project-management system.
- Not a replacement for tests, review, or production safety.
- Not a magic autonomous coding framework.
- Not a broad CLI; deterministic scripts exist only where repeated toil proves the need.

## The five modes

| Mode | Use when | Artifacts |
| --- | --- | --- |
| `direct` | small, clear, reversible change | none |
| `diagnose` | a concrete bug, flake, or slowness | repro notes + proof |
| `discovery` | an ambiguous idea, research, greenfield, or scaffold | brief or decision note |
| `delta-spec` | a medium brownfield behavior change | brief, delta, plan, proof |
| `tracked-change` | multi-phase, high-risk, cross-boundary, customer-visible | durable change folder |

The loop is the same every time: **Observe → Classify → Act → Verify → Close**.

The full method is documented in [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md).

## Principles

Eleven principles drive every decision (full text in [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)):

1. Proportional depth
2. Brownfield first
3. Evidence first
4. Reuse before invent
5. One source → both harnesses
6. Honest determinism boundary
7. No stale artifacts
8. Token economy / concise comms
9. Compounding context
10. Structured signals before text matching
11. Adversarial by default

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

Full setup, memory-policy presets, and local development: [`docs/INSTALL.md`](docs/INSTALL.md).

## Status

**Experimental.** Structural validation passes locally. Claude PreToolUse guard and Codex Stop hook
are live-proven; Codex write-guard parity is pending upstream behavior. Full per-harness enforcement
status lives in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) (Harness status).

- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Roadmap & live proof: [`docs/ROADMAP.md`](docs/ROADMAP.md)
- Methodology: [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md)
- Architecture & harness status: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Principles: [`docs/PRINCIPLES.md`](docs/PRINCIPLES.md)

## License

MIT — see [`LICENSE`](LICENSE).
