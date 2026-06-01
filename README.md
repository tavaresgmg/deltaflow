# Cairn

Brownfield-first, autonomous workflow router for AI coding agents.

Cairn is an experimental plugin/skill set for turning rough ideas, cards, links, and
bug reports into grounded plans, delta specs, implementation, proof, and cleanup without
forcing a heavyweight spec framework on every task. It runs on **both OpenAI Codex and
Claude Code** from one portable source, and auto-routes work via a SessionStart bootstrap
so you don't have to invoke it by name.

## Thesis

Most coding-agent workflow frameworks overfit one of two extremes:

- too little structure: chat-only plans rot across sessions and reviewers cannot see intent;
- too much structure: every card becomes a mini product program with excess artifacts.

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

Phases 0-6 built and locally validated. On Codex (v0.135.0) the plugin installs, the
SessionStart hook injects the bootstrap, the skill loads, and Cairn auto-fires on a
brownfield prompt and routes to the right mode. Remaining: the full auto-trigger suite on
≥2 models per harness, and the same pass on Claude Code (`docs/evals/auto-trigger.md`,
`docs/roadmap.md`).
