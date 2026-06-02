# Architecture Decision Records (ADRs)

Append-only record of Cairn's build decisions: context, options, decision, and **named
tradeoff**. Inspired by BMAD's `.decision-log.md` (record the WHY, not just the what). One
decision per file, numbered. New ADRs are written in English; records 0001-0006 below are
historical and stay in pt-BR.

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-name-cairn.md) | Name "Cairn" | Accepted |
| [0002](0002-portable-single-source.md) | Single portable source for Codex + Claude, validate Codex first | Accepted |
| [0003](0003-autonomy-via-sessionstart-hook.md) | Autonomy via SessionStart hook + directive description | Accepted |
| [0004](0004-file-based-layered-memory.md) | Layered file-based memory, versioned in the repo | Accepted |
| [0005](0005-umbrella-workspace-model.md) | Umbrella workspace model (folder → N repos → `.work/`) | Accepted |
| [0006](0006-first-class-research-stages.md) | Brainstorm / web research / official docs as first-class stages | Accepted |

Evidence base: `docs/research/frameworks.md` and `docs/research/context-and-portability.md`.

## Format

```
# NNNN — Title
Status: Proposed | Accepted | Superseded by NNNN | Deprecated (date)
## Context     — the problem and the evidence
## Options     — alternatives considered
## Decision    — what we chose
## Tradeoff    — what we accept losing / residual risk
## Sources     — primary evidence
```
