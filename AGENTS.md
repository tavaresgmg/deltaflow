# AGENTS

- English for all docs and rationale, including new ADRs. Intentional exceptions, both
  functional: the SKILL `description`/`when_to_use` bilingual block and the pt-BR eval
  fixtures — they drive and test routing. Existing pt-BR ADRs/research are historical
  records, left as-is.
- Principles: `docs/PRINCIPLES.md`. Skills are the source of workflow behavior; docs explain
  decisions.
- Experimental workflow/tooling repo. Small, testable changes. No CLI/MCP/hooks/marketplace
  packaging unless the task proves the need.
- Keep artifacts minimal, brownfield-first. Do not copy BMAD/OpenSpec/Spec Kit/GSD/Superpowers
  wholesale.
- Test any workflow claim on a real or realistic brownfield card; record the result.
- Validate plugin changes: `node scripts/validate-cairn.mjs`.
