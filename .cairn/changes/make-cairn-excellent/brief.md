# Brief: make-cairn-excellent

## Outcome

Cairn should become a low-token, high-discipline brownfield workflow layer:

- auto-routes work into the right level of ceremony;
- preserves only durable context;
- tells the agent the next safe step;
- detects stale or inconsistent artifacts;
- remains installable as a plugin without adding a CLI surface prematurely.

## Current Evidence

- `node scripts/validate-cairn.mjs` passes.
- Codex auto-trigger suite has one full Codex model run recorded.
- Roadmap still marks validation and lifecycle work as pending.
- P0 gaps are documented: codebase map, living spec/archive, stronger analyze.

## Recommendation

Implement P0 as small primitives:

1. Add `.cairn/codebase/` guidance and templates.
2. Add `.cairn/specs/` and archive lifecycle guidance.
3. Extend `cairn-analyze.mjs` into severity-bearing artifact analysis.
4. Add `cairn-next.mjs` to report the next step for a change folder.
5. Update docs/roadmap/gaps so current evidence and remaining proof are aligned.

## Accepted Downside

This does not yet prove superiority with a public benchmark. It creates the machinery and documentation needed to run that benchmark honestly.

## Proof Strategy

- `node scripts/validate-cairn.mjs`
- `node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/make-cairn-excellent`
- `node plugins/cairn/scripts/cairn-next.mjs .cairn/changes/make-cairn-excellent`
- focused fixture checks for `cairn-analyze.mjs`
