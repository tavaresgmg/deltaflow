# Artifact Policy

Cairn creates artifacts only when they reduce risk, preserve context across
sessions, or make review easier.

## No Artifact

Use for `direct` and most `diagnose` work.

## Brainstorm

Use for `tracked-change` or whenever stakes justify design-before-code (ADR-0006).
Keep it short on small work; one question at a time; name the tradeoff.

```md
# Brainstorm: <slug>

## Problem / Intent

## Options (2-3, each with a named tradeoff)

## Chosen Direction

## Open Questions
```

## Brief

Use for discovery and ambiguous planning.

```md
# Brief: <slug>

## Outcome

## Current Evidence

## Options

## Recommendation

## Accepted Downside

## Proof Strategy

## Open Questions
```

## Delta

Use for medium brownfield behavior changes.

```md
# Delta: <slug>

## Current Behavior

## Proposed Behavior

## Affected Capabilities

## Contracts And Boundaries

## Out Of Scope
```

## Plan

```md
# Plan: <slug>

## Phases

## Files/Owners

## Proof

## Rollback
```

## Tasks

Live checklist for resume (see `memory.md`). One verifiable step per line; tick
incrementally; append the proof when a step is done.

```md
# Tasks: <slug>

- [ ] step
- [x] step — proof: <cmd/result>
```

## Proof

```md
# Proof: <slug>

## Commands

## Runtime Smoke

## Review Notes

## Residual Risk
```

## Decision log

Append-only, repo-level `.cairn/decision-log.md`, written during the work. One line per
load-bearing decision; never rewritten.

```text
2026-06-01 — chose X over Y because <evidence>; tradeoff: <named downside>
```

## Retention

- Keep completed specs only if they describe durable product/system behavior.
- Archive or delete transient plans after completion.
- Do not keep execution logs as durable docs.
- Prefer code, tests, and concise specs over narrative history.
