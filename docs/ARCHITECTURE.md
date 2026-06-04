# Architecture

Cairn implements **Cairn Proofflow**: Evidence-Routed Development for AI-assisted software work.
It routes by evidence, risk, and owner boundaries; then proves and reconciles before close. The
product is a development workflow **router** — autonomous, memory- and workspace-aware. It is brownfield-first when a repo exists,
not card-only (routing lives in `SKILL.md` + `references/modes.md`). It targets OpenAI Codex and
Claude Code from one portable source.

Method synthesis lives in `docs/METHODOLOGY.md`; decisions live in `docs/DECISIONS.md`; the
evidence behind them is in `docs/RESEARCH.md`.

## Product shape

One primary skill, `cairn` (the router/loop). Starting with one skill avoids trigger
ambiguity and keeps the runtime surface small; it can split only after real usage proves a
narrow subflow. The plugin no longer ships a separate research agent; isolated research remains a
method stage that can use the host harness when available.

## Portability: one source, generated shims (Decision 2)

Common substrate, identical across harnesses: `plugins/cairn/skills/cairn/SKILL.md` +
`references/`; portable frontmatter is **only** `name` + `description`. `build-manifests.mjs`
emits the per-harness shims (manifests, marketplace files, hook root var) from one canonical
`plugin.manifest.json` — never hand-edited parallel copies, since drift is failure mode #1.
`AGENTS.md` stays human/project guidance; Cairn's Claude Code behavior ships via the plugin
inventory and SessionStart bootstrap, not a generated root `CLAUDE.md`. Public install must not
depend on anything under the author's `~/.codex` or `~/.claude`. Rationale in Decision 2; shim
inventory in the runtime map below.

## Autonomy (Decision 3)

Auto-trigger by description is model-invoked and probabilistic, so it is reinforced in three
layers — **dispatch** (SessionStart bootstrap detects harness + injects routing), **discovery**
(directive front-loaded `description` + bilingual `when_to_use`), **enforcement** (PreToolUse guard
+ coherence Stop hook). Rationale in Decision 3; per-surface enforcement status (Claude vs Codex,
strong/proven/advisory/pending) is owned by the Harness status section below.

`node scripts/validate-cairn.mjs` caps the always-on bootstrap (`hooks/bootstrap.md`, ≤1400 bytes)
and checks package/manifest/hook shape. The deeper skill surfaces (`SKILL.md`, `references/`) are
kept small by progressive disclosure — lazy-loaded by mode/risk, a design discipline rather than a
validator byte cap. This keeps the router cheap while loading depth only when useful.

## Core flow

```text
input -> observe -> classify -> choose evidence -> choose artifact -> act -> verify -> close/sync
```

The core product is not a benchmark harness or a spec folder. It is the **routing judgment**:
what is the smallest workflow that can still catch the real risk? Dogfood, architecture review,
and residue cleanup improve it.

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
| Artifacts | one owner per fact; archive/sync/delete at close | plans, specs, notes, and roadmap all repeat the same stale claim |
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
```

| Surface | Owner | Drift check |
| --- | --- | --- |
| Canonical plugin metadata | `plugins/cairn/plugin.manifest.json` | `build-manifests.mjs`, `validate-cairn.mjs` |
| Harness shims | `.codex-plugin/`, `.claude-plugin/` | generated, never hand-edited |
| Routing prompt surface | `hooks/bootstrap.md`, `SKILL.md` | `validate-cairn.mjs` + manual harness proof when needed |
| Progressive guidance | `skills/cairn/references/*.md` | targeted reads |
| Deterministic signals | `plugins/cairn/scripts/*.mjs`, hooks | smoke tests in `validate-cairn.mjs` |
| Durable state | `.cairn/changes`, `.cairn/specs`, `.cairn/codebase` | `cairn-close.mjs` |

The five modes (size/risk-classified, lowest ceremony wins) are defined in `references/modes.md`.

## Minimum operational core

The runtime core is intentionally small:

| Surface | Purpose |
| --- | --- |
| `SKILL.md` | route software work to exactly one mode |
| `hooks/bootstrap.md` + `session-start.sh` | automatic Cairn entry point |
| `user-prompt-submit.sh` + `cairn-anchor.mjs` | paced active-change resume anchor |
| `hooks/hooks.json` | one plugin-bundled lifecycle registration file |
| `cairn-workspace.mjs` | repo/state owner facts used by hooks and scaffold |
| `cairn-guard.mjs` | mutation boundary guard where harness events fire |
| `cairn-coherence.mjs` | Stop-time durable-mode coherence nudge |
| `cairn-scaffold.mjs` | deterministic justified artifact creation |
| `cairn-close.mjs` | validate change/proof/context-learned and archive/delete closeout |

Everything else is support/dev evidence, not runtime core: manifest building and local structural
validation.

## First-class stages (Decision 6)

Brainstorm, web research (Phase 0, isolated subagent), and official-docs grounding at the lockfile
version — lightweight by default, intent-gated so a small card stays cheap. Defined in
`references/research.md`; rationale in Decision 6.

## Memory (Decision 4)

Layered, file-based, versioned in the repo — not any harness's native memory as canonical state.
The `.cairn/` layout and resume protocol are owned by `references/memory.md`; templates by
`references/artifacts.md`. Spec↔code reconciliation runs through `cairn-close.mjs` verify/drift
checks (names missing claims, refs, proof, and lifecycle decisions; does not run proof commands).

## Workspace model (Decision 5)

Umbrella workspace with an explicit owner per level (parent `AGENTS.md` + `.cairn/` = scope,
cross-repo safety, repo map, not a monorepo; child repos own git/code/tests). Boundary detection,
state ownership, the handoff-coordinates-but-never-replaces rule, and separate proof/PR per repo
are owned by `references/workspace.md`; rationale in Decision 5. `.work/` is legacy migration input.

## Why plugin, not CLI first

Skills are the authoring format and plugins the installable unit on both harnesses. A CLI
is justified only when deterministic state operations prove necessary — and per Decision 3,
the deterministic logic we do need (dispatch, gates) lives in hooks/scripts, not a CLI.

## Risk controls

- Do not trust memory for current external facts; revalidate against live source.
- Do not create full specs for small changes (intent-based mode gate, default-light).
- Do not invent card facts; mark `[confirm: ...]` when evidence is missing.
- Require fresh, executable proof before `done`.
- External mutations stay behind user approval; hard boundaries via hooks, not prose.

---

## Harness status (Codex vs Claude Code)

Cairn ships one source for Codex and Claude Code, but the harnesses do not expose identical
controls. This contract separates proven guarantees from advisory behavior so docs and
status copy do not overclaim.

### Status terms

- **Strong** — verified locally and backed by a deterministic script or documented hook contract.
- **Proven** — live-tested in the harness, but still dependent on harness behavior.
- **Advisory** — Cairn can instruct or report it, but cannot enforce it automatically.
- **Pending upstream** — blocked on harness/plugin behavior outside Cairn.

### Claude Code

| Surface | Status | Cairn use |
| --- | --- | --- |
| Plugin manifest | Strong | Generated from `plugins/cairn/plugin.manifest.json`. |
| Skill loading | Proven | The `cairn` skill routes brownfield work by activation text. |
| `SessionStart` | Strong | Injects `hooks/bootstrap.md`; resume/compact also append `cairn-anchor.mjs`. |
| `UserPromptSubmit` anchor | Strong | Injects only the resume-anchor text: active slug, task count, up to 5 truncated open tasks, up to 3 recent decisions, and a re-read reminder. No active change/unchanged/paced turns inject 0 bytes. |
| `PreToolUse` mutation guard | Strong | `hooks/hooks.json` routes edit/write tools to `cairn-guard.mjs`. |
| `Stop` coherence hook | Strong | `cairn-coherence.mjs` nudges missing durable state for declared durable modes. |
| Structured automation | Advisory | `claude -p --output-format json` can capture cost, turns, duration, and errors for future probes. |

### Codex

| Surface | Status | Cairn use |
| --- | --- | --- |
| Plugin manifest | Strong | Generated from the same canonical manifest as Claude. |
| Skill loading | Proven | The `cairn` skill loads from `skills/` and can auto-route brownfield work. |
| `SessionStart` | Proven | `session-start.sh` emits the bootstrap as plain text when no Claude JSON contract is present. |
| `Stop` coherence hook | Proven | Used for end-of-turn missing-state nudges. |
| `UserPromptSubmit` anchor | Pending upstream | Same resume-anchor payload as Claude; paced state-change delivery not yet live-verified on Codex. |
| `PreToolUse` mutation guard | Pending upstream | Upstream fixed `apply_patch` emission (PR #18391) and docs now list it as a target, but runtime delivery via the installed plugin is not yet confirmed locally. |
| Write protection | Advisory | The prose contract still requires boundary checks before mutation; enforcement is best-effort. |

### Shared deterministic checks

`node scripts/validate-cairn.mjs` checks package shape, manifest parity, hook registration, and the
minimal scaffold/close/anchor workflow. Harness status still needs direct CLI proof:
`codex plugin list -m cairn`, `claude plugin list`, and focused hook/plugin smokes when changing
runtime behavior.
