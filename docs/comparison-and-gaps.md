# Comparison & Gaps

Cairn (competitive snapshot as of Phase 9) vs BMAD, OpenSpec, Spec Kit, Superpowers, ECC/caveman. Anchored in
`docs/research/frameworks.md`. Principles: `docs/PRINCIPLES.md`. Goal: what's strong, what's
genuinely missing, what to build next — by activation, modes/workflows, artifacts,
deterministic automation, memory, research, token economy.

## What Cairn already has (with evidence)

| Capability | Where | State |
| --- | --- | --- |
| Auto-activation via SessionStart bootstrap | `hooks/session-start.sh` + `bootstrap.md` | validated on Codex (fires, routes) |
| Directive `description` + bilingual `when_to_use` | `skills/cairn/SKILL.md` | YAML-safe, guarded by validate |
| 5 modes (direct→tracked-change) | `references/modes.md` | routing measured by eval harness |
| Artifact templates | `references/artifacts.md` | brainstorm/brief/delta/plan/tasks/proof/decision-log |
| File-based memory + resume | `references/memory.md`, `.cairn/changes/<slug>/` | versioned, read-first/write-incremental |
| Scoped codebase maps | `references/artifacts.md`, `references/memory.md` | optional, area-based, P0 primitive |
| Living spec/archive lifecycle | `references/artifacts.md`, `references/gates.md`, `.cairn/specs/` | guidance, semantic claims, and archive flow implemented |
| Umbrella workspace + boundary guard | `scripts/cairn-boundary.mjs`, `cairn-guard.mjs` | deterministic, PreToolUse-enforced |
| Consistency check | `scripts/cairn-analyze.mjs` | severity-bearing artifact/lifecycle/semantic-claim drift |
| Next-step reporter | `scripts/cairn-next.mjs` | read-only change-folder state |
| Research stages | `cairn-version.mjs`, `agents/cairn-researcher.md`, `references/research.md` | lockfile grounding, isolated subagent |
| Reuse + anti-rationalization guardrails | `SKILL.md`, `framework-lessons.md`, `gates.md` | explicit advisory behavior, validator-guarded |
| Context budget guard | `cairn-budget.mjs`, `validate-cairn.mjs` | always-on bootstrap + progressive references budgeted |
| Eval scoreboard | `scripts/eval-scoreboard.mjs`, `validate-cairn.mjs` | read-only coverage/failure/slow-case/next-command surface |
| Dual-harness from one source | `build-manifests.mjs`, both marketplaces | install verified on Codex |

## By dimension

| Dimension | BMAD | OpenSpec | Spec Kit | Superpowers | **Cairn now** |
| --- | --- | --- | --- | --- | --- |
| Activation | description (native) | slash-first | none (manual) | **SessionStart hook** | hook + directive description ✓ |
| Modes | quick-vs-full by intent | propose/explore | 8-cmd chain | brainstorm→implement | 5 modes, intent-gated ✓ |
| Brownfield delta | addendum | **ADDED/MODIFIED/REMOVED** | greenfield-first | afterthought | delta.md (has the verbs) ~ |
| Living truth (spec) | prd.md | **specs/ vs changes/** | specs/<feat> | none | optional `.cairn/specs/` with claim-backed drift checks |
| Archive lifecycle | status frontmatter | **propose→apply→archive** | — | none | guidance + read-only retention helper ✓ |
| Consistency gate | — | — | **/analyze 6 passes** | — | structured artifact/lifecycle/semantic-claim analysis |
| Verification gate | checkpoint | deps done | checklist | **Iron Law** | advisory except boundary/analyze scripts |
| Codebase mapping | document-project | — | — | — | optional scoped codebase maps |
| Determinism | Python (hot path) | CLI state machine | scripts | one bash hook | scripts + hooks ✓ |
| Memory | .decision-log | filesystem-as-state | constitution | TodoWrite (ephemeral) | .cairn/ versioned ✓ |
| Multi-repo | refuses nesting | one-instance | `.specify` over git | — | **umbrella (unique)** ✓ |
| Concise output | — | — | — | — | caveman `full` Output Style, safety/public exempt ✓ (Phase 7) |

ECC/caveman (`affaan-m/ECC`, `JuliusBrussee/caveman`) is not a workflow framework — it is a
concise-output technique. Cairn borrows the `full` level as Principle 8 (Output Style in
`SKILL.md`), with hard exemptions for safety warnings, irreversible confirmations, public
artifacts, and any number/ID/date/path. It does not adopt the ambiguous `ultra` level.

## Gaps, prioritized

### P0 — high value, fills a real hole

1. **Broader eval matrix.** Realistic/broad routing is strong on Codex default, and Claude now
   has realistic no-fire proof plus a full realistic diagnostic run. Codex default and
   `gpt-5.4-mini` both pass the `p0-matrix`; the mini realistic run produced focused R9/R14
   debt that passed a route-contract retest, but the full mini realistic rerun remains pending.
   `eval-scoreboard.mjs` converts JSONL history into current gaps, historical failures,
   slow-case diagnostics, route-contract clears, and the next cheap command. Still missing:
   full passing realistic/full suites on >=2 models per harness and Claude second-model P0.
2. **Spec↔code semantic analysis v2.** `cairn-analyze.mjs` now checks claim-backed delta/spec
   drift and infers coverage from ordinary behavior prose with code/proof candidates, without
   trying to become a full NLP/spec engine.
3. **Archive/apply helper.** `cairn-retention.mjs` now reports completed active changes and
   archive/delete actions. A future helper may perform reviewed moves, but only if manual
   cleanup repeats enough to justify mutation.

### P1 — sharpens correctness & quality

4. **Brainstorm gate that bites for `tracked-change`** (from Superpowers/BMAD). Still advisory.
   A heuristic UserPromptSubmit/PreToolUse check: if mode is tracked-change and no
   `brainstorm.md` exists, warn (not hard-block — false positives). Honest middle ground.
5. **Run the full eval suite on Claude Code** too, and on >=2 models per harness. Claude
   default has no-fire proof and a diagnostic realistic run; second-model P0/realistic proof
   is still missing.

### P2 — automation polish

8. **`cairn-next.mjs`** — deterministic "what's the next step" over a change folder (like
   OpenSpec `status --json`): which artifact is missing, what's unchecked. Drives resume.
9. **Reviewed archive/apply helper** — optional mutation layer only if manual archive moves
   become repeated toil.

## Where Cairn already leads

- **Umbrella multi-repo** with a deterministic boundary guard — no surveyed framework does this.
- **One source → both harnesses**, generated and install-verified (Superpowers ships the hook
  idea; Cairn ships manifests + marketplaces for Codex *and* Claude, validated live).
- **Explicit default-light intent gate** (`research.md` table) — formalizes what BMAD's
  quick-dev only implies.
- **Honest determinism boundary** (`gates.md`) — says plainly what is enforced vs advisory,
  instead of claiming gates it can't keep.

## Sequencing

Validate first with the scoreboard, then implement P0 in order 1->2->3, each behind the same
default-light intent gate so small cards stay cheap. Fold P1 prose/heuristics alongside when
they are cheap. P2 only once the change-folder lifecycle has real usage. Re-run the eval suite
after any `description`/mode change to catch regressions.
