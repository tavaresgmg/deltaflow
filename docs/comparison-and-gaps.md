# Comparison & Gaps

Cairn (competitive snapshot through Phase 16) vs BMAD, OpenSpec, Spec Kit, Superpowers, ECC/caveman. Anchored in
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
| Umbrella workspace + boundary guard | `plugins/cairn/scripts/cairn-boundary.mjs`, `cairn-guard.mjs` | deterministic signal; Claude PreToolUse live-proven, Codex write guard best-effort |
| Consistency check | `plugins/cairn/scripts/cairn-analyze.mjs` | severity-bearing artifact/lifecycle/semantic-claim drift |
| Next-step reporter | `plugins/cairn/scripts/cairn-next.mjs` | read-only change-folder state |
| Coherence Stop hook | `plugins/cairn/scripts/cairn-coherence.mjs`, `plugins/cairn/hooks/hooks.json` | end-of-turn tracked/delta folder check, adoption-gated |
| Proportional review | `references/review.md` | self-review -> diff-vs-delta -> adversarial reviewer |
| Research stages | `plugins/cairn/scripts/cairn-version.mjs`, `agents/cairn-researcher.md`, `references/research.md` | lockfile grounding, isolated subagent |
| Reuse + anti-rationalization guardrails | `SKILL.md`, `framework-lessons.md`, `gates.md` | explicit advisory behavior, validator-guarded |
| Context budget guard | `plugins/cairn/scripts/cairn-budget.mjs`, `validate-cairn.mjs` | always-on bootstrap + progressive references budgeted |
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

1. **Broader eval matrix.** Realistic/broad routing is strong on Codex default. Codex
   `gpt-5.4-mini` focused diagnostics were cleared once, but the latest full realistic rerun
   fired 14/14 and routed 11/14 with R7/R13/R14 timeouts, so second-model realistic proof is
   still open. Focused retests cleared R13 and R7; R14 remains a route/latency variance.
   Claude active failures remain: `haiku` P0 misses R5/R11, and default realistic has timeouts
   plus an uncleared R3 route miss. The scoreboard owns the next command and active gaps.
2. **Result-history protection.** Real-model runs are expensive and JSONL summaries are proof.
   The eval runner now refuses to overwrite existing labels unless `--overwrite` is explicit.
3. **Domain lenses from evidence, not taxonomy.** `infra-lens` is seeded because Phase 16
   exposed a real ops/infra bias. Other lenses (database/ui/testing/product/analyze) should
   enter as fixtures or lazy references only after dogfood/evals prove current guidance is
   underspecified.

### P1 — sharpens correctness & quality

4. **Repeat variance-sensitive evals before prompt changes.** Small-model misses are not yet
   proven as capacity limits or promptable defects. Re-run before changing `description`,
   bootstrap, or mode text.
5. **Run the full eval suite on Claude Code** on current versions when cost is justified.
   Claude default has no-fire proof and a diagnostic realistic run; second-model P0/realistic
   proof is still missing.

### P2 — automation polish

8. **Reviewed archive/apply helper** — optional mutation layer only if manual archive moves
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

Validate first with the scoreboard. Do not tune routing prose from a single small-model miss.
Prefer a fresh real-model rerun, then add fixtures or a lazy lens reference only when the miss
repeats or a dogfood incident shows the current guidance is too vague. Re-run the eval suite
after any `description`/mode/Output-Style change.
