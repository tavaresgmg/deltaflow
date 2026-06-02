# MVP Architecture

Cairn is a development workflow **router** — autonomous, memory- and workspace-aware —
that picks the lightest workflow that still protects correctness. It is brownfield-first
when a repo exists, but it is not card-only: no-card tasks, research, greenfield-in-repo,
cleanup, SDD-style deltas, and repo-pattern alignment all route through the same mode
ladder. It targets OpenAI Codex and Claude Code from one portable source.

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
- Hooks standardized on `${CLAUDE_PLUGIN_ROOT}` (the portable var; Codex exposes it too).

Public install must not depend on anything under the author's `~/.codex` or `~/.claude`.

## Autonomy (ADR-0003)

Auto-trigger by description is model-invoked and probabilistic in both harnesses, so it is
reinforced in three layers:

1. **Dispatch** — a single bash SessionStart hook detects the harness and injects a small
   bootstrap (<2k tokens) that tells the agent to route through Cairn before responding.
2. **Discovery** — a directive `description`: `[domain] + [ALWAYS directive] + [real trigger
   phrases] + [negative boundary]`, front-loaded, third person; `when_to_use` carries pt-BR+en
   trigger phrases with the same keywords duplicated in `description`.
3. **Enforcement** — mutation-boundary gates via PreToolUse hook (Claude) / command hook
   `exit 2` (Codex once live delivery is proven). Brainstorm and proof-before-done remain
   advisory unless promoted to a deterministic Stop/UserPromptSubmit heuristic. Prose in
   AGENTS.md is advisory.

## Core flow

```text
input -> observe -> classify -> artifact policy -> execute -> prove -> close
```

Modes (classified by size/risk, lowest ceremony wins):

- `direct`: small, reversible, clear edit.
- `diagnose`: concrete broken behavior needing repro.
- `discovery`: ambiguous product/domain/architecture question.
- `delta-spec`: medium brownfield change needing durable intent.
- `tracked-change`: high-risk or multi-phase change needing explicit gates.

## First-class stages (ADR-0006)

Brainstorm (hard-gate: design before code, scales with stakes), web research (Phase 0
subagent that returns a distilled summary and writes a reusable `research/<topic>.md`),
and official-docs grounding (always-on rule; ground on the **lockfile** version, not the
newest). Lightweight by default, gated by intent so a small card stays cheap.

## Memory (ADR-0004)

Layered, file-based, versioned in the repo — not any harness's native memory as canonical
state:

```text
AGENTS.md                      # human/project guidance; plugin bootstrap carries Cairn routing
.cairn/changes/<slug>/
  brainstorm.md
  research/<topic>.md
  delta.md                     # ADDED / MODIFIED / REMOVED (brownfield)
  plan.md
  tasks.md                     # [ ]/[x] checkboxes, updated live for resume
  proof.md
.cairn/codebase/<area>.md      # optional scoped map for non-obvious repo knowledge
.cairn/specs/<capability>.md   # optional living truth for durable behavior
.cairn/decision-log.md         # append-only, written DURING the work
```

A spec↔code reconciliation step is ours to build (OpenSpec-style drift is by-design and
has no native command in 2026).

## Workspace model (ADR-0005)

Umbrella workspace with explicit owner per level: parent `AGENTS.md` = scope + cross-repo
safety + repo map (not a monorepo); child repos own git/code/tests; state in two `.work/`
layers (parent `HANDOFF.md` + child `last-session`); deterministic boundary detection
(`git rev-parse --show-toplevel`) before any mutation; worktrees anchored per child repo.
Multi-repo task = parent `.work/` + separate PRs per repo.

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
