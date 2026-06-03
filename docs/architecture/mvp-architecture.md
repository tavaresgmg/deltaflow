# MVP Architecture

Cairn is a development workflow **router** — autonomous, memory- and workspace-aware —
that picks the lightest workflow that still protects correctness. It is brownfield-first
when a repo exists, not card-only (`scope-and-workflows.md` owns what routes where). It targets
OpenAI Codex and Claude Code from one portable source.

Decisions live in `docs/decisions/` (ADRs); the evidence behind them is in
`docs/research/{frameworks,context-and-portability}.md`.

## Product shape

One primary skill, `cairn` (the router/loop). Starting with one skill avoids trigger
ambiguity and keeps evaluation simple; it can split once real usage proves stable
subflows. On Claude, the core delegates to existing domain skills (`analyze`, `product`,
etc.) when present; on Codex it must be self-contained.

## Portability: one source, generated shims (ADR-0002)

Common substrate, identical across harnesses: `plugins/cairn/skills/cairn/SKILL.md` +
`references/`, with the manifest pointing `skills: "./skills/"`. Portable frontmatter is
**only** `name` + `description`.

The build emits the per-harness shims (never hand-edited parallel copies — drift is
failure mode #1):

- Manifests: `.codex-plugin/plugin.json` **and** `.claude-plugin/plugin.json`, both from one
  canonical `plugin.manifest.json`. Only the manifest goes inside those dirs.
- Marketplace: `.agents/plugins/marketplace.json` (Codex) and `.claude-plugin/marketplace.json` (Claude).
- Root instruction: `AGENTS.md` stays human/project guidance. Cairn's Claude Code behavior is
  delivered by the plugin inventory (skill, agent, hooks) and SessionStart bootstrap, not a
  generated root `CLAUDE.md`. Add a generated `CLAUDE.md` only if live usage proves Claude
  needs repo-root instructions outside the plugin path.
- Hooks standardize on `${CLAUDE_PLUGIN_ROOT}` as the cross-harness root var. Claude sets it
  natively; Codex has native `${PLUGIN_ROOT}` and also exposes `${CLAUDE_PLUGIN_ROOT}` for
  compatibility.

Public install must not depend on anything under the author's `~/.codex` or `~/.claude`.

## Autonomy (ADR-0003)

Auto-trigger by description is model-invoked and probabilistic, so it is reinforced in three
layers — **dispatch** (SessionStart bootstrap detects harness + injects routing), **discovery**
(directive front-loaded `description` + bilingual `when_to_use`), **enforcement** (PreToolUse guard
+ coherence Stop hook). Rationale in ADR-0003; per-surface enforcement status (Claude vs Codex,
strong/proven/advisory/pending) is owned by `agent-integration-contract.md`.

Context budget is enforced by `plugins/cairn/scripts/cairn-budget.mjs` and
`node scripts/validate-cairn.mjs`: the always-on bootstrap, the selected `SKILL.md`, each
reference file, and aggregate reference/package surfaces have explicit word/character budgets.
This keeps the router small while still using progressive disclosure for deeper guidance.

## Core flow

```text
input -> observe -> classify -> choose evidence -> choose artifact -> act -> close/sync
```

The core product is not the eval harness or a spec folder. It is the **routing judgment**:
what is the smallest workflow that can still catch the real risk? Evals measure that judgment,
but dogfood, architecture review, and residue cleanup improve it.

Every non-trivial routed task should be explainable as a compact route card. This is an
explanation contract, not a new durable artifact unless the selected mode already creates one:

| Question | Must be explicit |
| --- | --- |
| Mode | Why this is the lowest safe ceremony. |
| Owner | Which repo/doc/spec/code path owns the truth. |
| Evidence | What was observed before acting. |
| Artifact | What state is created, reused, archived, or avoided. |
| Proof | What fresh check closes the risk. |
| Residue | What stale plan/spec/change/result must be synced, archived, or deleted. |

If any row is unclear, improve the owning context before adding more framework vocabulary.
For `direct`, this may be one sentence; for `delta-spec`/`tracked-change`, the rows should be
visible in the existing plan/proof/change folder.

### Core maturity axes

| Axis | Healthy state | Failure smell |
| --- | --- | --- |
| Routing | lower ceremony by default, escalates only on risk | everything becomes `tracked-change` or everything becomes `direct` |
| Evidence | proof chosen before acting, proportional to risk | proof is bolted on after a confident answer |
| Artifacts | one owner per fact; archive/sync/delete at close | plans, specs, eval notes, and roadmap all repeat the same stale claim |
| Workspace | owner boundary is explicit before mutation | parent workspace silently edits child repo state |
| Token economy | always-on context is tiny; depth is lazy-loaded | `SKILL.md` grows to explain every edge case |
| Human use | user can predict why Cairn picked a path | framework vocabulary hides the actual decision |

## Runtime map

```text
plugin.manifest.json
  -> build-manifests.mjs
  -> .codex-plugin/ + .claude-plugin/ generated shims
  -> SessionStart bootstrap
  -> cairn SKILL.md router
  -> lazy references/ by mode or risk
  -> deterministic scripts/hooks report facts or block narrow cases
  -> .cairn/changes + specs + codebase maps persist state
  -> eval JSONL + scoreboard feed regression decisions
```

| Surface | Owner | Drift check |
| --- | --- | --- |
| Canonical plugin metadata | `plugins/cairn/plugin.manifest.json` | `build-manifests.mjs`, `validate-cairn.mjs` |
| Harness shims | `.codex-plugin/`, `.claude-plugin/` | generated, never hand-edited |
| Routing prompt surface | `hooks/bootstrap.md`, `SKILL.md` | activation evals + budget guard |
| Progressive guidance | `skills/cairn/references/*.md` | budget guard + targeted reads |
| Deterministic signals | `plugins/cairn/scripts/*.mjs`, hooks | smoke tests in `validate-cairn.mjs` |
| Durable state | `.cairn/changes`, `.cairn/specs`, `.cairn/codebase` | `cairn-analyze.mjs`, `cairn-retention.mjs` |
| Regression proof | `docs/evals/results/*.jsonl` | `eval-scoreboard.mjs` |

The five modes (size/risk-classified, lowest ceremony wins) are defined in `references/modes.md`.

## First-class stages (ADR-0006)

Brainstorm, web research (Phase 0, isolated subagent), and official-docs grounding at the lockfile
version — lightweight by default, intent-gated so a small card stays cheap. Defined in
`references/research.md`; rationale in ADR-0006.

## Memory (ADR-0004)

Layered, file-based, versioned in the repo — not any harness's native memory as canonical state.
The `.cairn/` layout and resume protocol are owned by `references/memory.md`; templates by
`references/artifacts.md`. Spec↔code reconciliation runs through `cairn-analyze.mjs` verify/drift
checks (names missing claims, refs, proof, and lifecycle decisions; does not run proof commands).

## Workspace model (ADR-0005)

Umbrella workspace with an explicit owner per level (parent `AGENTS.md` + `.cairn/` = scope,
cross-repo safety, repo map, not a monorepo; child repos own git/code/tests). Boundary detection,
state ownership, the handoff-coordinates-but-never-replaces rule, and separate proof/PR per repo
are owned by `references/workspace.md`; rationale in ADR-0005. `.work/` is legacy migration input.

## Why plugin, not CLI first

Skills are the authoring format and plugins the installable unit on both harnesses. A CLI
is justified only when deterministic state operations prove necessary — and per ADR-0003,
the deterministic logic we do need (dispatch, gates) lives in hooks/scripts, not a CLI.

## Risk controls

- Do not trust memory for current external facts; revalidate against live source.
- Do not create full specs for small changes (intent-based mode gate, default-light).
- Do not invent card facts; mark `[confirm: ...]` when evidence is missing.
- Require fresh, executable proof before `done`.
- External mutations stay behind user approval; hard boundaries via hooks, not prose.
