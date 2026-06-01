# MVP Architecture

## Product Shape

Cairn starts as a Codex plugin containing one primary skill:

- `cairn`: automatic router and workflow controller.

The plugin can later split into multiple skills once real usage proves stable
subflows. Starting with one skill avoids trigger ambiguity and keeps the system
easy to evaluate.

## Runtime Surfaces

Current:

- Codex plugin manifest
- Codex Agent Skill
- Markdown references and templates
- Local validation script

Deferred:

- CLI
- MCP server
- hooks
- Claude Code plugin
- marketplace packaging
- UI/dashboard

## Why Plugin, Not CLI First

Codex docs make skills the authoring format for reusable workflows and plugins
the installable distribution unit. A plugin can later bundle skills, hooks, MCP,
assets, and metadata. A CLI is useful only when deterministic state operations
prove necessary.

## Core Flow

```text
input -> observe -> classify -> artifact policy -> execute -> prove -> close
```

Classification:

- `direct`: small, reversible, clear edit.
- `diagnose`: concrete broken behavior needing repro.
- `discovery`: ambiguous product/domain/architecture question.
- `delta-spec`: medium brownfield change needing durable intent.
- `tracked-change`: high-risk or multi-phase change needing explicit gates.

## Artifact Policy

No artifact by default. Create artifacts only when they reduce risk or preserve
state across sessions.

Suggested future workspace:

```text
.cairn/
  changes/<slug>/
    brief.md
    delta.md
    plan.md
    proof.md
  specs/<capability>.md
```

The MVP documents this shape but does not require repo mutation unless the task
mode needs it.

## Compatibility Plan

Codex first:

- `plugins/cairn/.codex-plugin/plugin.json`
- `skills/cairn/SKILL.md`

Claude later:

- generate `.claude/skills/cairn/SKILL.md` from the same source;
- add Claude plugin manifest only after the Codex skill proves useful;
- keep prompt content portable and avoid Codex-only tool names inside core logic.

## Risk Controls

- Do not trust memory for current external facts.
- Do not create full specs for small changes.
- Do not invent card facts; mark `[confirm: ...]` when evidence is missing.
- Require fresh proof before `done`.
- External mutations remain behind user approval.
