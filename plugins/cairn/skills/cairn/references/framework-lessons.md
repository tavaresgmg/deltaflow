# Framework Lessons

## Borrow / Avoid

- Borrow: BMAD discovery; OpenSpec deltas/archive; Spec Kit analyze; Superpowers proof/review;
  GSD deterministic state.
- Avoid: full PRDs/specs for ordinary work, mandatory TDD/subagents, duplicate board state,
  premature CLI/runtime, and more skills than routing can reliably select.

## Design Rules

Canonical principles: `docs/PRINCIPLES.md`. Shorthand: route first; smallest sufficient mode;
evidence over theory; research only when useful; proof near work; delete/archive/sync artifacts.
Reuse the existing owner before creating one. Improve judgment through dogfood before eval spend.

## Failure Controls

| Failure | Cairn control |
| --- | --- |
| Sycophancy | Treat user framing as hypothesis; verify evidence. |
| Lazy/fake done | Fresh proof before done. |
| Hallucinated certainty | Grade confirmed/deduced/hypothesized. |
| Spec theater | Smallest sufficient mode; no PRD for small work. |
| Context rot | Fix stale maps/specs/instructions. |
| Boundary damage | Boundary detector/guard before mutation. |

## Anti-Rationalization Red Flags

| Red flag | Cairn response |
| --- | --- |
| "This is simple, so no proof is needed." | Run the cheapest fresh proof that can catch the risk. |
| "A new helper is faster than understanding the existing one." | Search existing symbols and call paths first; reuse or explain why not. |
| "The docs are probably current." | Verify against code/runtime or mark the claim as unconfirmed. |
| "I will clean this later." | Delete, archive, or sync touched stale artifacts before close. |
| "The test is slow, so skip it." | Run a focused cheaper proof or state the residual risk explicitly. |
| "Planning slows us down." | Use `direct` for small reversible work; use discovery/spec when the wrong path is costly. |
| "More words make the answer safer." | Cut filler; keep numbers, IDs, safety, and inference steps. |
| "The map was stale but I worked around it." | Fix the misleading context — map, spec, `AGENTS.md` — not just the code (Principle 9). |
| "The prompt word looks like a trigger." | Prefer structural signals before text matching (Principle 10). |
| "I'm confident this is right." | Name the strongest counter-case and accepted downside first (Principle 11). |
| "The review says so, so it's settled." | Verify critiques against primary evidence before acting (Principle 11). A refutation is a hypothesis. |
| "The user proposed the cause or solution, so accept it." | Treat framing as a hypothesis; verify live/repo evidence, then state confirmed, deduced, or hypothesized. |
| "I'll write the change folder after the work." | Narrative-after-code. Scaffold `.cairn/changes/<slug>/` before acting; if already mutated, record post-hoc — never stage tradeoffs you never weighed. |
