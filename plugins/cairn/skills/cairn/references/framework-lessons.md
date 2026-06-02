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

1. Route first, then execute.
2. The smallest sufficient mode wins.
3. Existing system evidence beats abstract planning.
4. External truth is researched early when it can change the plan.
5. Proof lives near the work.
6. Artifacts are deleted, archived, or synced; never left as stale clutter.
7. Reuse the existing owner before creating a new one.

## Anti-Rationalization Red Flags

| Red flag | Cairn response |
| --- | --- |
| "This is simple, so no proof is needed." | Run the cheapest fresh proof that can catch the risk. |
| "A new helper is faster than understanding the existing one." | Search existing symbols and call paths first; reuse or explain why not. |
| "The docs are probably current." | Verify against code/runtime or mark the claim as unconfirmed. |
| "I will clean this later." | Delete, archive, or sync touched stale artifacts before close. |
| "The test is slow, so skip it." | Run a focused cheaper proof or state the residual risk explicitly. |
| "Planning slows us down." | Use `direct` for small reversible work; use discovery/spec when the wrong path is costly. |
