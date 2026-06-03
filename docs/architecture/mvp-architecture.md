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
- Hooks standardize on `${CLAUDE_PLUGIN_ROOT}` as the cross-harness root var. Claude sets it
  natively; Codex has native `${PLUGIN_ROOT}` and also exposes `${CLAUDE_PLUGIN_ROOT}` for
  compatibility.

Public install must not depend on anything under the author's `~/.codex` or `~/.claude`.

## Autonomy (ADR-0003)

Auto-trigger by description is model-invoked and probabilistic in both harnesses, so it is
reinforced in three layers:

1. **Dispatch** — a single bash SessionStart hook detects the harness and injects a small
   bootstrap that tells the agent to route through Cairn before responding.
2. **Discovery** — a directive `description`: `[domain] + [ALWAYS directive] + [real trigger
   phrases] + [negative boundary]`, front-loaded, third person; `when_to_use` carries pt-BR+en
   trigger phrases with the same keywords duplicated in `description`.
3. **Enforcement** — mutation-boundary gates via PreToolUse hook are live-proven on Claude;
   Codex write-guard parity remains best-effort until upstream hook behavior is reliable.
   The coherence Stop hook is live-proven on Codex and adoption-gated to repos that already
   use `.cairn/`. Brainstorm and proof-before-done remain advisory unless promoted to a
   deterministic, low-blast-radius signal. Prose in `AGENTS.md` is advisory.

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

Spec↔code reconciliation is handled by `cairn-analyze.mjs` verify/drift checks. It names
missing claims, refs, proof, and lifecycle decisions; it does not run proof commands.

## Workspace model (ADR-0005)

Umbrella workspace with explicit owner per level: parent `AGENTS.md` = scope + cross-repo
safety + repo map (not a monorepo); parent `.work/HANDOFF.md` coordinates cross-repo work;
child repos own git/code/tests and their own `.cairn/changes` state unless the boundary
detector reports workspace-scoped Cairn state. `HANDOFF.md` coordinates; it never replaces
Cairn state. Workspace-scoped state lives in the parent `.cairn/changes/<slug>/`; repo-scoped
state lives in each touched child repo. Run deterministic boundary detection before mutation;
multi-repo tasks still close with separate proof and PR/MR boundaries per repo.

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
