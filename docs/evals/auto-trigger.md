# Auto-trigger evals

Cairn's autonomy thesis (ADR-0003) is that the skill fires *without being named*. That is
model-invoked and probabilistic, so it must be measured, not assumed. This file is the
fixture: prompts that MUST fire, prompts that MUST NOT, and how to score them.

Auto-trigger is reinforced in three layers (SessionStart bootstrap → directive
`description`/`when_to_use` → enforcement hooks). These cases measure the discovery layer
in isolation: **install the plugin, do NOT mention Cairn, send the prompt, inspect whether
the `cairn` skill was invoked.** The bootstrap is expected to lift fire-rate further; run
the suite both with and without it to quantify each layer.

## Protocol

1. Install the plugin on the target harness (Codex first, then Claude Code).
2. For each prompt, start a fresh session and send it verbatim. Do not say "Cairn",
   "skill", or "/cairn".
3. Record whether the `cairn` skill was actually invoked (Claude: Skill tool call in the
   transcript; Codex: skill activation in the run log).
4. Run on at least two models per harness (e.g. Opus + Sonnet) — fire-rate varies by model.
5. Score: must-fire pass = invoked; must-not-fire pass = not invoked. Report per model.

Exit criterion (roadmap Phase 1): ≥90% of must-fire prompts invoke the skill, and ≤1
must-not-fire prompt mis-fires, on each tested model.

## Must fire (≥10)

| # | Lang | Prompt |
| --- | --- | --- |
| F1 | en | Fix the login redirect bug in this repo. |
| F2 | en | Refactor the payments module to drop the legacy gateway. |
| F3 | en | Here's the Jira card — implement the CSV export feature. |
| F4 | en | This screenshot shows a broken table layout, can you sort it out? |
| F5 | en | Plan how we'd add multi-tenant support before we touch any code. |
| F6 | en | Investigate why the nightly job started timing out last week. |
| F7 | en | Write a spec for the new notifications service in this codebase. |
| F8 | pt-BR | Implementa esse card de exportação de relatório aqui no projeto. |
| F9 | pt-BR | Corrige o bug de cálculo de imposto nesse repositório. |
| F10 | pt-BR | Refatora esse módulo de autenticação que tá uma bagunça. |
| F11 | pt-BR | Investiga por que esse endpoint começou a dar 500 em produção. |
| F12 | pt-BR | Antes de codar, planeja como a gente migra pro novo ORM. |

## Must NOT fire (≥5)

| # | Lang | Prompt | Why not |
| --- | --- | --- | --- |
| N1 | en | What's the difference between a process and a thread? | pure Q&A, no repo |
| N2 | en | Run `git status` and show me the output. | one-off shell command |
| N3 | en | What does the SOLID acronym stand for? | conceptual, no repo work |
| N4 | pt-BR | Qual a capital da Austrália? | unrelated Q&A |
| N5 | pt-BR | Roda `npm test` e me mostra o resultado. | one-off shell command |
| N6 | en | Explain how OAuth2 authorization code flow works in general. | conceptual, no repo |

## Near-miss notes

Borderline by design — watch these when tuning the `description`:

- "Run the tests" (N5) vs "the tests are flaky, figure out why" (should fire → diagnose).
- "What does this function do?" (read-only Q&A, no change) vs "this function is wrong, fix
  it" (should fire).
- A prompt owned by a more specific active skill must defer to that skill, not Cairn.

## Results log

Record runs here (date, harness, model, fire-rate, mis-fires, notes) as the suite is
executed.

- **2026-06-01 — Codex v0.135.0, gpt-5.5** — smoke (not full suite). Plugin installed from
  local marketplace (`installed, enabled`). SessionStart hook injected the bootstrap. A
  brownfield prompt ("there's a bug in calc.js: soma() subtracts; investigate and give the
  fix plan") auto-fired Cairn without naming it — the model stated it would "use Cairn to
  route the investigation" and selected **diagnose** mode, returning a repro + fix plan with
  no edits. Caught and fixed first: the unquoted `:` in the `description` made the SKILL.md
  fail YAML parsing and be skipped — now guarded by `validate-cairn.mjs`. Full 12+6 suite on
  ≥2 models still pending.
