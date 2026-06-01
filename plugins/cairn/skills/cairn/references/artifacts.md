# Artifact Policy

Cairn creates artifacts only when they reduce risk, preserve context across
sessions, or make review easier.

## No Artifact

Use for `direct` and most `diagnose` work.

## Codebase Map

Use on demand when `Observe` keeps rediscovering the same non-obvious brownfield
context. Never create it for obvious repos or small direct work.

Keep maps scoped by area, not by whole repo:

```md
# Codebase Map: <area>

## Purpose

## Entry Points

## Owners And Boundaries

## Non-Obvious Rules

## Proof Commands

## Last Verified
```

Store maps at `.cairn/codebase/<area>.md`. Treat them as hints: re-check drift-prone facts
before acting, and update the map only when it prevents future rediscovery.

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

## Semantic Claims

- <claim>; code: `<path>`; proof: `<command>`

## Out Of Scope
```

Use `Semantic Claims` only when drift would matter. Keep claims explicit and checkable:
one behavior claim, one code path, one proof command. `cairn-analyze.mjs` validates that
claims have `code:` references, `proof:` commands, and existing code paths.

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

## Lifecycle Decision

Lifecycle decision: <sync|delegate|archive|delete> — <target/reason>

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
- On close of `delta-spec` or `tracked-change`, make one explicit lifecycle decision:
  sync durable behavior into `.cairn/specs/<capability>.md`, delegate to the repo's existing
  spec system such as OpenSpec, archive the change folder, or delete transient planning.
- Archive retained completed changes under `.cairn/changes/archive/<YYYY-MM-DD>-<slug>/`.
- Delete transient plans after completion when code/tests/docs already carry the truth.
- Do not keep execution logs as durable docs.
- Prefer code, tests, and concise specs over narrative history.
