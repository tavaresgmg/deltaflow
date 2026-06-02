# Framework Lessons

## Borrow

- BMAD: brainstorming quality, research before PRD, complexity tracks, project context.
- OpenSpec: delta specs, propose/apply/archive, specs beside code, brownfield-first.
- Spec Kit: phase separation, consistency analysis, templates/presets later.
- Superpowers: verification before completion, code review discipline, skill-first authoring.
- GSD: durable state, discuss/plan/execute/verify/ship loop, deterministic scripts for state capture.

## Avoid

- Full PRD for ordinary card work.
- Full-system spec generation before incremental work.
- Mandatory TDD.
- Mandatory subagents.
- Duplicate board/task state.
- CLI/runtime before prompt-only workflow proves insufficient.
- More skills than the trigger system can reliably route.

## Design Rules

Canonical principles: `docs/PRINCIPLES.md`. Operating shorthand: route first then execute;
smallest sufficient mode wins; evidence beats abstract planning; research external truth early
when it changes the plan; proof lives near the work; artifacts deleted/archived/synced, never
stale. Reuse the existing owner before creating a new one.

## Anti-Rationalization Red Flags

| Red flag | Cairn response |
| --- | --- |
| "This is simple, so no proof is needed." | Run the cheapest fresh proof that can catch the risk. |
| "A new helper is faster than understanding the existing one." | Search existing symbols and call paths first; reuse or explain why not. |
| "The docs are probably current." | Verify against code/runtime or mark the claim as unconfirmed. |
| "I will clean this later." | Delete, archive, or sync touched stale artifacts before close. |
| "The test is slow, so skip it." | Run a focused cheaper proof or state the residual risk explicitly. |
| "Planning slows us down." | Use `direct` for small reversible work; use discovery/spec when the wrong path is costly. |
| "More words make the answer safer." | Cut filler, hedging, and restated context (Principle 8). Keep numbers, IDs, safety warnings, and every inference step intact. |
| "The map was stale but I worked around it." | Fix the context that misled you — map, spec, `AGENTS.md` — not just the code (Principle 9). Ask what context was missing, not whose prompt was wrong. |
| "I'm confident this is right." | Name the strongest counter-case and the downside you accept before committing (Principle 10). Confidence with no named downside is the tell. |
| "The review (or refutation) says so, so it's settled." | A critique can be as wrong as the claim — verify it against primary evidence before acting (Principle 10). A refutation is a hypothesis. |
