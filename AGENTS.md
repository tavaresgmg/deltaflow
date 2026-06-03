# AGENTS

- English for all docs and rationale. Intentional exceptions, both functional: the SKILL
  `description`/`when_to_use` bilingual block and the pt-BR eval fixtures — they drive and test
  routing. Decision and research rationale stay in pt-BR in `docs/DECISIONS.md` and
  `docs/RESEARCH.md` as internal evidence.
- Principles: `docs/PRINCIPLES.md`. Skills are the source of workflow behavior; docs explain
  decisions.
- Experimental workflow/tooling repo. Small, testable changes. No CLI/MCP/hooks/marketplace
  packaging unless the task proves the need.
- Keep artifacts minimal, brownfield-first. Do not copy BMAD/OpenSpec/Spec Kit/GSD/Superpowers
  wholesale.
- Test any workflow claim on a real or realistic brownfield card; record the result.
- For non-trivial Cairn product evolution, use `docs/DEVELOPMENT.md`: start with repo
  preflight, choose a rotating research aperture, translate sources into `borrow / adapt / avoid /
  defer`, then sync durable learnings to the right owner.
- Validate plugin changes: `node scripts/validate-cairn.mjs`.
