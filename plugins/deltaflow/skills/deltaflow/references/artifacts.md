# Artifact Policy

Deltaflow creates artifacts only when they reduce risk, preserve context across
sessions, or make review easier.

## No Artifact

Use for `direct` and most `diagnose` work.

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

## Proof

```md
# Proof: <slug>

## Commands

## Runtime Smoke

## Review Notes

## Residual Risk
```

## Retention

- Keep completed specs only if they describe durable product/system behavior.
- Archive or delete transient plans after completion.
- Do not keep execution logs as durable docs.
- Prefer code, tests, and concise specs over narrative history.
