# Cairn Principles

Canonical source of truth for *why* Cairn behaves as it does. Modes, artifacts, gates,
and references implement these; when they conflict, a principle wins and the reference is
wrong. README thesis, `SKILL.md`, `scope-and-workflows.md`, and `framework-lessons.md`
point here instead of restating.

## 1. Proportional depth

Structure matches risk. Tiny tasks stay tiny; research, SDD, greenfield, cleanup, and
high-risk implementation get only the structure their risk justifies. Lowest-ceremony mode
that still protects correctness wins.
*Enforced by:* mode ladder (`references/modes.md`), intent gate (`references/research.md`).

## 2. Brownfield first

Inspect the current system before proposing architecture. Reuse patterns, fit the owner
boundary. Existing-system evidence beats abstract planning.
*Enforced by:* boundary detector + PreToolUse guard (`cairn-boundary.mjs`, `cairn-guard.mjs`).

## 3. Evidence first

Material facts need a source. No invented IDs, dates, owners, card facts, API behavior, or
runtime status. Evidence ladder: live system > repo/code > official docs > primary web >
memory > inference. "Done"/"fixed"/"passes" require fresh proof named with command + result.
*Enforced by:* `cairn-analyze.mjs` claim-backed drift; proof artifacts near the work.

## 4. Reuse before invent

Search existing symbols, helpers, docs, specs, local patterns before adding a path. One
owner per concern. If you do not reuse the obvious owner, name why.
*Enforced by:* reuse + anti-rationalization red flags (`framework-lessons.md`).

## 5. One source -> both harnesses

Canonical metadata edits in one place generate Codex and Claude Code manifests. Portability
is a differentiator. Harness-exclusive capabilities are allowed when they degrade gracefully
on the other harness and the asymmetry is documented in the capability matrix.
*Enforced by:* `build-manifests.mjs`, `validate-cairn.mjs` parity checks.

## 6. Honest determinism boundary

Say plainly what is deterministically enforced (scripts, hooks) vs advisory (prose). Never
claim a gate Cairn cannot keep.
*Enforced by:* `references/gates.md`.

## 7. No stale artifacts

Artifacts are deleted, archived, or synced — never left as clutter. Living specs sync;
transient planning is archived or deleted at close.
*Enforced by:* retention helper (`cairn-retention.mjs`), archive lifecycle.

## 8. Token economy / concise comms

Few tokens when few do the trick. Remove what the model reconstructs for free (filler,
articles, hedging, intensifiers, restated context). Keep what is unpredictable and factual.
Two surfaces:

- **Tool surfaces** (bootstrap, SKILL, references): budgeted hard caps. Predictable prose is
  the enemy of a small system prompt.
- **Agent output** (subagent prompts/returns, decision-log, proof notes, technical replies to
  the dev): caveman `full` — fragments ok, active voice, present tense, one idea per line.

Never compress: security warnings, irreversible-action confirmations, public artifacts
(PRs/changelogs), and any number/ID/date/path. Concise is not ambiguous — every inference
step stays explicit.
*Enforced by:* `cairn-budget.mjs` (tool surfaces); Output Style in `SKILL.md` (agent output).

---

Borrowed lineage: BMAD (discovery/research), OpenSpec (delta specs, archive lifecycle),
Spec Kit (phase separation, consistency analysis), Superpowers/GSD (verification discipline,
durable state). Token economy adapts the "caveman" concise-output technique
(JuliusBrussee/caveman, wilpel/caveman-compression). See `framework-lessons.md`.
