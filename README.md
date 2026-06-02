# Cairn

Development workflow router for AI coding agents. Brownfield-first, but not card-only.

Cairn is an experimental plugin/skill set for turning rough ideas, no-card tasks, cards,
links, bug reports, research questions, greenfield-in-repo work, cleanup, implementation,
and SDD-style changes into the lightest safe workflow with proof. It avoids forcing a
heavyweight spec framework on every task. It runs on **both OpenAI Codex and Claude Code**
from one portable source, and auto-routes work via a SessionStart bootstrap so you don't
have to invoke it by name.

## Thesis

Most coding-agent workflow frameworks overfit one of two extremes:

- too little structure: chat-only plans rot across sessions and reviewers cannot see intent;
- too much structure: every card becomes a mini product program with excess artifacts.

Cairn's answer is proportional depth: tiny tasks stay tiny; research, SDD, greenfield, cleanup,
and high-risk implementation get only the structure their risk justifies.

Cairn keeps the useful parts:

- BMAD-style discovery, brainstorming, research, and PRD sharpening;
- OpenSpec-style brownfield deltas and living specs;
- Spec Kit-style phase separation and artifact consistency checks;
- Superpowers/GSD-style execution discipline, review, verification, and durable state.

Cairn is validated on Codex first, then Claude Code; both ship from the same source.

## Current MVP

```text
plugins/cairn/
  plugin.manifest.json        # canonical metadata — edit here, then rebuild
  .codex-plugin/plugin.json   # generated (Codex)
  .claude-plugin/plugin.json  # generated (Claude Code)
  hooks/                      # SessionStart bootstrap (autonomy layer 1)
  scripts/                    # deterministic read-only helpers used by the skill
  skills/cairn/SKILL.md
  skills/cairn/references/
scripts/
  build-manifests.mjs         # one source -> both manifests
  validate-cairn.mjs          # structural validation
docs/
  research/ architecture/ decisions/ evals/ roadmap.md
```

## Working Loop

1. Intake an idea, ticket, link, or card.
2. Detect complexity and risk.
3. Choose one mode:
   - direct patch
   - diagnose
   - discovery
   - delta spec
   - full tracked change
4. Create only the artifacts justified by the mode.
5. Implement with fresh proof.
6. Review and archive or clean up.

## Install

See `docs/install.md`. On Codex (validated):

```bash
codex plugin marketplace add tavaresgmg/cairn
codex plugin add cairn@cairn
```

## Local Validation

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```

## Status

Phases 0-6 are built and locally validated. Current local `latest` package versions:
Codex CLI `0.136.0` and Claude Code `2.1.159` (npm also advertises Claude Code
`next=2.1.160`). Codex has live install, SessionStart, auto-trigger proof, P0 matrix proof
on default + `gpt-5.4-mini`, and focused route-contract retests. Claude Code v2.1.159 has
live local marketplace/install, component inventory, SessionStart, PreToolUse allow/block,
realistic no-fire proof, and a diagnostic realistic run. P0 primitives are in place:
optional codebase maps, living specs/archive guidance, structured `cairn-analyze`,
semantic-claim drift checks, context budget guard, eval scoreboard, faster cross-harness
evals, and read-only `cairn-next`.

Remaining: full passing realistic suites on >=2 models per harness, Claude second-model P0
coverage, and live Codex PreToolUse proof beyond local smoke (`docs/evals/auto-trigger.md`,
`docs/roadmap.md`).
