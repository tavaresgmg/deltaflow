# AGENTS

- pt-BR by default for collaboration; English is acceptable in product/plugin docs.
- This repo is an experimental workflow/tooling repo. Prefer small, testable changes.
- Do not add a CLI, MCP server, hooks, or marketplace packaging unless the current task proves the need.
- Skills are the source of workflow behavior; docs explain decisions and rationale.
- Keep artifacts minimal and brownfield-first. Avoid copying BMAD, OpenSpec, Spec Kit, GSD, or Superpowers wholesale.
- Before saying a workflow is good, test it on a real or realistic brownfield card and record the result.
- Validation for plugin changes:
  - `python3 /Users/tavares/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py plugins/deltaflow`
  - `node scripts/validate-deltaflow.mjs`
