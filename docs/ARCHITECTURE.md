# Architecture

Cairn is a development workflow **router** — autonomous, memory- and workspace-aware —
that picks the lightest workflow that still protects correctness. It is brownfield-first
when a repo exists, not card-only (routing lives in `SKILL.md` + `references/modes.md`). It targets
OpenAI Codex and Claude Code from one portable source.

Decisions live in `docs/DECISIONS.md`; the evidence behind them is in `docs/RESEARCH.md`.

## Product shape

One primary skill, `cairn` (the router/loop). Starting with one skill avoids trigger
ambiguity and keeps evaluation simple; it can split once real usage proves stable
subflows. On Claude, the core delegates to existing domain skills (`analyze`, `product`,
etc.) when present; on Codex it must be self-contained.

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

Context budget is enforced by `plugins/cairn/scripts/cairn-budget.mjs` and
`node scripts/validate-cairn.mjs`: the always-on bootstrap, the selected `SKILL.md`, each
reference file, and aggregate reference/package surfaces have explicit word/character budgets.
This keeps the router small while still using progressive disclosure for deeper guidance.

## Core flow

```text
input -> observe -> classify -> choose evidence -> choose artifact -> act -> verify -> close/sync
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

## First-class stages (Decision 6)

Brainstorm, web research (Phase 0, isolated subagent), and official-docs grounding at the lockfile
version — lightweight by default, intent-gated so a small card stays cheap. Defined in
`references/research.md`; rationale in Decision 6.

## Memory (Decision 4)

Layered, file-based, versioned in the repo — not any harness's native memory as canonical state.
The `.cairn/` layout and resume protocol are owned by `references/memory.md`; templates by
`references/artifacts.md`. Spec↔code reconciliation runs through `cairn-analyze.mjs` verify/drift
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
controls. This contract separates proven guarantees from advisory behavior so docs, evals, and
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
| `UserPromptSubmit` anchor | Strong | `user-prompt-submit.sh` injects the anchor only when active-change state appears or changes; smoke-tested both branches. |
| `PreToolUse` mutation guard | Strong | `hooks/hooks.json` routes edit/write tools to `cairn-guard.mjs`. |
| `Stop` coherence hook | Strong | `cairn-coherence.mjs` nudges missing durable state for declared durable modes. |
| Project agent | Advisory | `agents/cairn-researcher.md` keeps external research isolated and read-only. |
| Structured automation | Advisory | `claude -p --output-format json` can capture cost, turns, duration, and errors for future probes. |

### Codex

| Surface | Status | Cairn use |
| --- | --- | --- |
| Plugin manifest | Strong | Generated from the same canonical manifest as Claude. |
| Skill loading | Proven | The `cairn` skill loads from `skills/` and can auto-route brownfield work. |
| `SessionStart` | Proven | `session-start.sh` emits the bootstrap as plain text when no Claude JSON contract is present. |
| `Stop` coherence hook | Proven | Used for end-of-turn missing-state nudges. |
| `UserPromptSubmit` anchor | Pending upstream | Mirrors the proven `SessionStart` plain-text path; state-change delivery not yet live-verified on Codex. |
| `PreToolUse` mutation guard | Pending upstream | Upstream fixed `apply_patch` emission (PR #18391) and docs now list it as a target, but runtime delivery via the installed plugin is not yet confirmed locally. |
| Write protection | Advisory | The prose contract still requires boundary checks before mutation; enforcement is best-effort. |

### Shared deterministic checks

`node plugins/cairn/scripts/cairn-doctor.mjs` is read-only and should answer:

- Are Codex and Claude CLIs visible on `PATH`?
- Do generated manifests match the canonical source?
- Are required hooks and helper scripts present?
- Which harness surfaces are strong, proven, advisory, or pending upstream?
- Is the current repo/workspace boundary detectable?

The doctor is not a benchmark and must not run model evals, mutate plugin installs, trust hooks, or
publish anything. If it cannot verify a live harness fact cheaply, it should say so instead of
promoting the claim.

---

## Appendix — worked example (brownfield eval-harness card)

Illustrative point-in-time walkthrough; version pins in commands are a snapshot, not current.

### Input

Card: "Cairn says it supports Claude Code and faster evals, but the eval harness is Codex-only
and slow. Add a cheap cross-harness smoke that proves one must-fire and one must-not case on
both Codex and Claude."

### Observe

Read first:

- a local `.cairn/codebase/<area>.md` map if one exists (this repo keeps an eval-harness map
  in its own gitignored `.cairn/`, since the plugin source treats `.cairn/` as local dev state).
- `scripts/eval-autotrigger.mjs` for runner shape and detection signals.
- `docs/evals/auto-trigger.md` for protocol and result log.
- `scripts/validate-cairn.mjs` for release-time checks.

A codebase map removes repeated rediscovery: it names temp fixture ownership, result-file
ownership, the reason for `R*` realistic cases, and why must-not cases must stay in fast subsets.

### Classify

Mode: `delta-spec`

Why: medium brownfield behavior change touching a script, validation, docs, and committed
evidence. It is not a simple direct edit because the claim crosses two harnesses.

### Act

Changes made in this example:

- Add `--harness codex|claude`, `--jobs`, `durationMs`, and `harnessVersion` to
  `scripts/eval-autotrigger.mjs`.
- Keep fixtures isolated per process/label/case so parallel cases cannot share state.
- Record fast Codex and Claude JSONL summaries under `docs/evals/results/`.
- Make `validate-cairn.mjs` fail if docs claim key eval proof but the JSONL summary is missing
  or mismatched.
- Update roadmap/install/eval docs to distinguish fast cross-harness proof from the still-open
  full matrix.

### Verify

```bash
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-default --jobs 2 --timeout-ms 120000
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000
node --check scripts/eval-autotrigger.mjs && node --check scripts/validate-cairn.mjs
node scripts/validate-cairn.mjs
node plugins/cairn/scripts/cairn-analyze.mjs .cairn/changes/<slug>   # if a change folder exists locally
git diff --check
```

Expected proof:

- Codex fast subset: 1/1 must-fire fired and routed, 0/1 must-not misfires.
- Claude fast subset: 1/1 must-fire fired and routed, 0/1 must-not misfires.
- `validate-cairn.mjs` passes and checks the JSONL summaries.

### Close

Keep the codebase map because it captures non-obvious ownership and proof boundaries. Keep
the JSONL results as durable evidence. Do not keep raw Claude/Codex transcript logs unless a
failure needs investigation.
