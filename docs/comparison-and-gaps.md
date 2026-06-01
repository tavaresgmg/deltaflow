# Comparison & Gaps

Cairn (Phases 1-6, built) vs BMAD, OpenSpec, Spec Kit, Superpowers. Anchored in
`docs/research/frameworks.md`. Goal: what's strong, what's genuinely missing, what to build
next — by activation, modes/workflows, artifacts, deterministic automation, memory, research.

## What Cairn already has (with evidence)

| Capability | Where | State |
| --- | --- | --- |
| Auto-activation via SessionStart bootstrap | `hooks/session-start.sh` + `bootstrap.md` | validated on Codex (fires, routes) |
| Directive `description` + bilingual `when_to_use` | `skills/cairn/SKILL.md` | YAML-safe, guarded by validate |
| 5 modes (direct→tracked-change) | `references/modes.md` | routing measured by eval harness |
| Artifact templates | `references/artifacts.md` | brainstorm/brief/delta/plan/tasks/proof/decision-log |
| File-based memory + resume | `references/memory.md`, `.cairn/changes/<slug>/` | versioned, read-first/write-incremental |
| Umbrella workspace + boundary guard | `scripts/cairn-boundary.mjs`, `cairn-guard.mjs` | deterministic, PreToolUse-enforced |
| Consistency check | `scripts/cairn-analyze.mjs` | change-folder internal drift |
| Research stages | `cairn-version.mjs`, `agents/cairn-researcher.md`, `references/research.md` | lockfile grounding, isolated subagent |
| Dual-harness from one source | `build-manifests.mjs`, both marketplaces | install verified on Codex |

## By dimension

| Dimension | BMAD | OpenSpec | Spec Kit | Superpowers | **Cairn now** |
| --- | --- | --- | --- | --- | --- |
| Activation | description (native) | slash-first | none (manual) | **SessionStart hook** | hook + directive description ✓ |
| Modes | quick-vs-full by intent | propose/explore | 8-cmd chain | brainstorm→implement | 5 modes, intent-gated ✓ |
| Brownfield delta | addendum | **ADDED/MODIFIED/REMOVED** | greenfield-first | afterthought | delta.md (has the verbs) ~ |
| Living truth (spec) | prd.md | **specs/ vs changes/** | specs/<feat> | none | **gap — no living specs/** |
| Archive lifecycle | status frontmatter | **propose→apply→archive** | — | none | **gap — only mentioned** |
| Consistency gate | — | — | **/analyze 6 passes** | — | partial (folder only) |
| Verification gate | checkpoint | deps done | checklist | **Iron Law** | advisory only |
| Codebase mapping | document-project | — | — | — | **gap — Observe is ephemeral** |
| Determinism | Python (hot path) | CLI state machine | scripts | one bash hook | scripts + hooks ✓ |
| Memory | .decision-log | filesystem-as-state | constitution | TodoWrite (ephemeral) | .cairn/ versioned ✓ |
| Multi-repo | refuses nesting | one-instance | `.specify` over git | — | **umbrella (unique)** ✓ |

## Gaps, prioritized

### P0 — high value, fills a real hole

1. **Codebase map for brownfield** (from GSD `map-codebase` / BMAD `document-project`). Today
   `Observe` re-derives the repo every session and persists nothing. Add an on-demand,
   scoped `codebase-map` artifact (`.cairn/codebase/<area>.md`: entry points, owners, the
   non-obvious rules) — written once, reused, never mandatory. Highest brownfield leverage.
2. **Living spec + archive lifecycle** (from OpenSpec). `delta.md` is the *proposal*; there is
   no *current truth* after it lands. Add: on close, either sync the delta into a durable
   `.cairn/specs/<capability>.md` or archive to `.cairn/changes/archive/<date>-<slug>/`.
   Keep it optional/light — if the repo already uses OpenSpec, delegate to it.
3. **`/analyze` real consistency** (from Spec Kit). Extend `cairn-analyze.mjs` beyond the
   folder: cheap read-only passes for spec↔code drift (delta claims a behavior the code/tests
   don't show, or vice versa), with severity levels. Read-only, never auto-remediates.

### P1 — sharpens correctness & quality

4. **Brainstorm gate that bites for `tracked-change`** (from Superpowers/BMAD). Still advisory.
   A heuristic UserPromptSubmit/PreToolUse check: if mode is tracked-change and no
   `brainstorm.md` exists, warn (not hard-block — false positives). Honest middle ground.
5. **Anti-rationalization red-flags table** (from Superpowers). A short reference listing the
   "skip the gate" excuses and their rebuttals. Cheap, prose-only, high guardrail value.
6. **Forced-reuse rule** (brownfield practice). Explicit: "search for an existing function
   before creating one." One line in Required Behavior + a note in modes.
7. **Run the eval suite on Claude Code** too, and on ≥2 models per harness — close the
   activation-validation loop both ways.

### P2 — automation polish

8. **`cairn-next.mjs`** — deterministic "what's the next step" over a change folder (like
   OpenSpec `status --json`): which artifact is missing, what's unchecked. Drives resume.
9. **Archive/retention helper** — a read-only reporter for stale `.cairn/changes/` folders.

## Where Cairn already leads

- **Umbrella multi-repo** with a deterministic boundary guard — no surveyed framework does this.
- **One source → both harnesses**, generated and install-verified (Superpowers ships the hook
  idea; Cairn ships manifests + marketplaces for Codex *and* Claude, validated live).
- **Explicit default-light intent gate** (`research.md` table) — formalizes what BMAD's
  quick-dev only implies.
- **Honest determinism boundary** (`gates.md`) — says plainly what is enforced vs advisory,
  instead of claiming gates it can't keep.

## Sequencing

Validate first (eval suite + baseline running now), then implement P0 in order 1→2→3, each
behind the same default-light intent gate so small cards stay cheap. P1 items are mostly
cheap prose/heuristics — fold them in alongside. P2 only once the change-folder lifecycle has
real usage. Re-run the eval suite after any `description`/mode change to catch regressions.
