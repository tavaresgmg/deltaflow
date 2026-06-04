# Cairn Principles

Canonical source of truth for *why* Cairn behaves as it does. Modes, artifacts, gates,
and references implement these; when they conflict, a principle wins and the reference is
wrong. README thesis, `SKILL.md`, and `framework-lessons.md` point here instead of restating.

**Authority order** when sources conflict: same-turn chat > global user gates
(`~/.claude/CLAUDE.md` / Codex global `AGENTS.md`) > project `AGENTS.md`/`CLAUDE.md` > these
principles and skill references > recalled memory (a hint, revalidated) > inference.

**Reading the labels** (Principle 6): *Enforced by* = deterministic — a hook/script that blocks
(exit 2) or fails CI. *Checked by* = a read-only script that reports drift but does not block.
*Reinforced by* = advisory prose or red flags, no enforcement. Only the first is a gate.

## 1. Proportional depth

Structure matches risk. Tiny tasks stay tiny; research, SDD, greenfield, cleanup, and
high-risk implementation get only the structure their risk justifies. Lowest-ceremony mode
that still protects correctness wins.
*Reinforced by:* mode ladder (`references/modes.md`), intent gate (`references/research.md`).

## 2. Brownfield first

Inspect the current system before proposing architecture. Reuse patterns, fit the owner
boundary. Existing-system evidence beats abstract planning.
*Enforced by:* PreToolUse guard (`cairn-guard.mjs`, Claude — harness parity in `gates.md`);
*informed by* workspace resolver (`cairn-workspace.mjs`, used by hooks/scripts).

## 3. Evidence first

Material facts need a source. No invented IDs, dates, owners, card facts, API behavior, or
runtime status. Evidence ladder: live system > repo/code > official docs > primary web >
secondary web > memory > inference. "Done"/"fixed"/"passes" require fresh proof named with
command + result.
*Checked by:* `cairn-close.mjs` (claim structure + refs exist, **not** proof execution);
proof artifacts near the work.

## 4. Reuse before invent

Search existing symbols, helpers, docs, specs, local patterns before adding a path. One
owner per concern. If you do not reuse the obvious owner, name why.
*Reinforced by:* reuse + anti-rationalization red flags (`framework-lessons.md`).

## 5. One source -> both harnesses

Canonical metadata edits in one place generate Codex and Claude Code manifests. The same rule
covers instruction files: `CLAUDE.md` imports `AGENTS.md` rather than duplicating it. Portability
is a differentiator. Harness-exclusive capabilities are allowed when they degrade gracefully
on the other harness and the asymmetry is documented in the capability matrix.
*Enforced by:* `build-manifests.mjs`, `validate-cairn.mjs` parity checks.

## 6. Honest determinism boundary

Say plainly what is deterministically enforced (scripts, hooks) vs advisory (prose). Never
claim a gate Cairn cannot keep.
*Owned by:* `references/gates.md` (the deterministic-vs-advisory ledger itself).

## 7. No stale artifacts

Artifacts are deleted, archived, or synced — never left as clutter. Living specs sync;
transient planning is archived or deleted at close.
*Checked by:* `cairn-close.mjs` plus archive/delete lifecycle.

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
*Enforced by:* `validate-cairn.mjs` (tool-surface and package checks). This principle
owns the agent-output style; `SKILL.md` Output Style points here.

## 9. Compounding context

Failure, surprise, or a map that lied means context was missing — fix the context, not only
the code. Update the relevant `.cairn/codebase/<area>.md`, spec, `AGENTS.md`, or
`framework-lessons.md` so the next session does not relearn it. Blameless: ask what context
was missing, not whose prompt was wrong. The decision-log records *why* a choice was made;
this records *what the system now knows*.
*Reinforced by:* close-step hygiene (`references/memory.md`); red flag (`framework-lessons.md`).

## 10. Structured signals before text matching

Prompt text is weak evidence. Do not treat regexes, keywords, or phrasing as deterministic
truth, a gate, or "smart" runtime policy. Prefer structural signals first: hook event source,
active change state, artifact hash, owner boundary, executable status, and recorded proof.
Text can help skill discovery and focused smoke prompts, but any text-derived route remains advisory
and must stay cheap, explicit, and near-miss tested.
*Enforced by:* `user-prompt-submit.sh` + `cairn-anchor.mjs` ignoring prompt text for
anchor injection.

## 11. Adversarial by default

Load-bearing decisions earn their place by surviving the opposite case, not by sounding right.
Before committing a non-trivial choice — design, spec, principle, or a claim others act on —
state the strongest counter-argument and the named downside you accept; for high-risk or
cross-boundary work, get an independent adversarial check (writer ≠ reviewer). Then verify the
counter-argument itself against primary evidence: a critique can be as wrong as the claim it
attacks, so a refutation is a hypothesis, not a verdict. Proportional (Principle 1): a typo
needs none; a design or principle change needs the contrary case — and its evidence — on the
record. Confidence with no named downside, or a refutation accepted without checking its
evidence, is the red flag.
*Reinforced by:* brainstorm tradeoffs and decision-log downside (`artifacts.md`), review ladder
(`review.md`), anti-rationalization red flags (`framework-lessons.md`).

---

Borrowed lineage (where the shapes came from): BMAD (discovery/research), OpenSpec (delta
specs, archive lifecycle), Spec Kit (phase separation, consistency analysis), Superpowers/GSD
(verification discipline, durable state). Token economy adapts the "caveman" concise-output
technique (JuliusBrussee/caveman, wilpel/caveman-compression). See `framework-lessons.md` (runtime
shorthand) and `docs/RESEARCH.md` (full borrow/avoid evidence).

Theoretical lineage (why the shapes hold): proportional depth ≈ Cynefin's match-the-response-to-the-domain
(Snowden), not ceremony-scaling — diagnose analyzes a known cause, discovery probes ambiguity;
observe→classify→act→verify→close adapts OODA's orient-before-act and fast feedback (Boyd); hard gates + boundary guard ≈ Lean
jidoka/poka-yoke; smallest change ≈ XP YAGNI; decision-log ≈ ADRs (Nygard); concise comms +
context budget ≈ cognitive-load theory (Sweller); compounding context ≈ kaizen + blameless
postmortems; structured signals before text matching ≈ typed boundaries and observability over
stringly heuristics; single-threaded coding + adversarial review ≈ Theory of Constraints
(human review, not code generation, remains a load-bearing bottleneck in current AI delivery
evidence; see the refreshed DORA/METR ledger in `docs/RESEARCH.md`);
adversarial by default ≈ Popperian falsification + red-team review (a claim is only as strong
as the contrary case it survives, and the contrary case must itself be evidence-checked).
