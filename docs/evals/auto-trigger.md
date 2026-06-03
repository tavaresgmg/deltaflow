# Auto-trigger evals

Cairn's autonomy thesis (ADR-0003) is that the skill fires *without being named*. That is
model-invoked and probabilistic, so it must be measured, not assumed. This file is the
fixture: prompts that MUST fire, prompts that MUST NOT, and how to score them.

Auto-trigger is reinforced in three layers (SessionStart bootstrap → directive
`description`/`when_to_use` → enforcement hooks). These cases measure the discovery layer
in isolation: **install the plugin, do NOT mention Cairn, send the prompt, inspect whether
the `cairn` skill was invoked.** The bootstrap is expected to lift fire-rate further; run
the suite both with and without it to quantify each layer.

## Harness

`scripts/eval-autotrigger.mjs` runs each prompt through Codex or Claude Code in a neutral
fixture repo and measures honest, defensible signals (stdout+stderr merged):

- `readCairn` — the agent actually read the Cairn SKILL.md/references (strongest "engaged" signal).
- `modeDetected` — the mode the agent **chose** (parsed from its classification prose, not the
  printed modes table), checked against the case's acceptable modes.
- `uniqueMode` — chose a Cairn-exclusive mode (`delta-spec`/`tracked-change`); disambiguates from
  the native `analyze` skill, which shares `diagnose`.
- `outputShape` — emitted the Cairn Done/Proof/Risk/Next or Bloqueado shape.
- `collidedAnalyze` — read a competing custom skill (env hygiene check).

`firedStrong = readCairn || modeDetected || outputShape`. Results land in
`docs/evals/results/<label>.jsonl`. For a clean signal, competing custom skills were archived
off the harnesses before the run.

Use `subset=realistic` for the routing-focused fixture. It writes cards, code, and tests into
the temp repo so prompts can point at real brownfield context:

```bash
node scripts/eval-autotrigger.mjs realistic cairn-realistic-<model> <model>
```

`subset=all` is the original classic trigger suite (`F*` + `N1-N6`), not every realistic
case. Use these named subsets for broader coverage:

```bash
node scripts/eval-autotrigger.mjs realistic cairn-realistic-<harness>-<model>
node scripts/eval-autotrigger.mjs realistic-nofire cairn-realistic-nofire-<harness>-<model>
node scripts/eval-autotrigger.mjs broad cairn-broad-<harness>-<model>
node scripts/eval-autotrigger.mjs p0-matrix cairn-p0-matrix-<harness>-<model>
node scripts/eval-autotrigger.mjs infra-lens cairn-infra-lens-<harness>-<model>
node scripts/eval-autotrigger.mjs skill-architecture cairn-skill-architecture-<harness>-<model>
node scripts/eval-autotrigger.mjs workflow-discipline cairn-workflow-discipline-<harness>-<model>
node scripts/eval-autotrigger.mjs evolution-discipline cairn-evolution-discipline-<harness>-<model>
```

`p0-matrix` is the cheap recurring regression matrix: `R5,R10,R11,N2,N7,N11`. It covers
diagnosis, cleanup, security-boundary simplification, shell-command near-miss, read-only
repo Q&A, and test-output near-miss without running the slower research/greenfield cases.

Eval result files are written atomically through a temp file and promoted only after the
summary row is written. Fixtures are isolated per process/label/case so subsets can run in
parallel without sharing `/tmp` state.

Cross-harness and fast subset examples:

```bash
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-codex-0.136-default --jobs 2 --timeout-ms 120000
node scripts/eval-autotrigger.mjs R5,N2 cairn-fast-claude-2.1.159-default --harness claude --jobs 2 --timeout-ms 120000
```

Fail-fast smoke runs should not enter the scoreboard. Use cheap models, low timeout, and
`--no-save` to print the summary and remove the temporary JSONL:

```bash
node scripts/eval-autotrigger.mjs skill-architecture tmp-skill-architecture-codex-mini gpt-5.4-mini --harness codex --jobs 3 --timeout-ms 45000 --no-save
node scripts/eval-autotrigger.mjs skill-architecture tmp-skill-architecture-claude-haiku haiku --harness claude --jobs 3 --timeout-ms 45000 --no-save
```

Treat these as local review signal only. Promote a result to `docs/evals/results/` only when the
timeout/model/harness are stable enough to compare across releases.

The runner is strict: unknown flags fail before any harness starts, labels cannot begin with
`-` or `.`, a label or `--out` is required, and `--out` must point under
`docs/evals/results/*.jsonl`. This prevents typos such as treating `--out` as the result
label. Equivalent explicit-output form:

```bash
node scripts/eval-autotrigger.mjs R5,N2 --out docs/evals/results/cairn-fast-codex-0.136-default.jsonl --jobs 2 --timeout-ms 120000
```

Result labels are immutable by default. The runner refuses to overwrite an existing JSONL file;
use a fresh label for reruns, or pass `--overwrite` only when deliberately replacing a known-bad
result. Use `--dry-run` to validate subset/output selection without starting a harness.
Codex runs default to `--sandbox read-only` for comparability; focused diagnostics may use
`--sandbox workspace-write` against the temporary fixture when read-only friction is the thing
being measured rather than the routing behavior.

New JSONL runs record `harness`, `harnessVersion`, `model`, `sandbox`, `durationMs`, status, trigger
signals, routing correctness, `totalDurationMs`, `maxDurationMs`, `slowCases`, `fireMissIds`,
`routingMissIds`, `diagnosticIds`, and `timeoutIds`. Mode parsing is intentionally performed
against `answerText` (the final answer text), while skill-read/collision signals use the full harness log;
this avoids counting examples from `SKILL.md` as the chosen mode. A row with a
fire/routing/status miss also records bounded `answerTail` and `logTail` diagnostics. Older
result files may predate those metadata fields; the summary row remains the durable validation
contract. The Claude harness loads the local plugin with `--plugin-dir plugins/cairn`, so it
can measure plugin behavior without relying on a manual local install in the temp fixture repo.

Use the scoreboard before choosing the next run:

```bash
node scripts/eval-scoreboard.mjs
node scripts/eval-scoreboard.mjs --json
```

The scoreboard reads the JSONL case rows plus summary rows, separates historical failures
from active failures, marks successful focused `route-contract` retests as diagnostics without
hiding the original run, recomputes timeout IDs for older summaries, validates the `p0-matrix`
case set (`R5,R10,R11,N2,N7,N11`), and emits the next cheap command to run.

## Protocol

1. Install the plugin on the target harness (Codex first, then Claude Code).
2. For each prompt, start a fresh session and send it verbatim. Do not say "Cairn",
   "skill", or "/cairn".
3. Record whether the `cairn` skill was actually invoked (Claude: Skill tool call in the
   transcript; Codex: skill activation in the run log).
4. Run on at least two models per harness (e.g. Opus + Sonnet) — fire-rate varies by model.
5. Score: must-fire pass = invoked; must-not-fire pass = not invoked. Report per model.

Exit criterion: ≥90% of must-fire prompts invoke the skill, and ≤1
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

## Realistic Must Fire

These cases run against a fixture repo with files, tests, cards, and modules.

| # | Lang | Prompt focus | Expected mode |
| --- | --- | --- | --- |
| R1 | en | card-driven CSV export | `delta-spec` or `direct` |
| R2 | pt-BR | tax/test bug | `diagnose` |
| R3 | en | auth refactor with security boundary | `delta-spec` or `tracked-change` |
| R4 | en | ORM migration planning | `discovery` or `tracked-change` |
| R5 | pt-BR | failing local test | `diagnose` or `direct` |
| R6 | en | greenfield webhook module | `direct`, `discovery`, or `delta-spec` |
| R7 | en | high-risk billing subsystem | `discovery`, `tracked-change`, or `delta-spec` |
| R8 | en | no-card CSV normalization | `direct` or `delta-spec` |
| R9 | en | repo-grounded test-runner research | `discovery` or `delta-spec` |
| R10 | en | duplicated CSV escaping cleanup | `direct` or `delta-spec` |
| R11 | en | auth simplification with security boundary | `delta-spec` or `tracked-change` |
| R12 | en | repo-pattern alignment for formatter | `direct` or `delta-spec` |
| R13 | en | greenfield background job runner | `discovery` or `delta-spec` |
| R14 | en | export error-handling alignment | `direct` or `delta-spec` |

## Realistic Must NOT Fire

These near-misses mention repo files, cards, research, tests, or cleanup words, but do not ask
for local development work.

| # | Lang | Prompt focus | Why not |
| --- | --- | --- | --- |
| N7 | en | explain `src/auth.js` only | read-only repo Q&A |
| N8 | en | read `package.json` test script | one-off file read |
| N9 | en | summarize a card only | card mention without implementation/planning |
| N10 | en | OAuth2 PKCE in general | conceptual research, no repo work |
| N11 | en | run tests and paste output | one-off shell command |
| N12 | en | cleanup strategy in general | conceptual cleanup, no local task |

## Infra Lens Seed

These cases seed the first domain lens because dogfooding exposed a real ops/infra bias:
deploy/teardown work can be classified as high-risk but executed like a direct shell task.
The scorer still measures routing signals, not proof content; prompts ask for rollback/proof
language so failed or suspicious answer tails can be reviewed before Cairn adds runtime behavior.

| # | Lang | Prompt focus | Expected mode |
| --- | --- | --- | --- |
| I1 | en | deploy failure + rollback planning, no deploy | `diagnose`, `tracked-change`, or `discovery` |
| I2 | en | Dockerfile/start-script mismatch fix | `diagnose`, `direct`, or `delta-spec` |
| I3 | en | Docker healthchecks in general | must not fire |

## Skill Architecture / Lens Seed

These cases test whether Cairn should stay a single router with lazy lenses or split into
additional skills. They intentionally mix domain-specific work with a direct architecture-audit
prompt and one conceptual near-miss. A split is only justified if these cases improve without
regressing existing suites.

| # | Lang | Prompt focus | Expected mode |
| --- | --- | --- | --- |
| L1 | en | invoice tenant-key database migration planning | `discovery`, `delta-spec`, or `tracked-change` |
| L2 | en | responsive table fix with visual proof | `diagnose`, `direct`, or `delta-spec` |
| L3 | en | flaky export tests and test strategy | `diagnose`, `discovery`, or `delta-spec` |
| L4 | en | product decision: admin audit dashboard | `discovery` |
| L5 | en | database indexes in general | must not fire |
| L6 | en | eval-backed router-skill split assessment | `discovery`, `tracked-change`, or `delta-spec` |

## Workflow Discipline

These cases test whether Cairn makes the user's desired workflow visible: specs, Git/worktree
preflight, brainstorm, research, tradeoffs, review/proof, and close sync. Some cases include
`expectText` checks in the runner, so route correctness alone is not enough.
Failures are summarized in `textMissIds`.

| # | Lang | Prompt focus | Expected mode |
| --- | --- | --- | --- |
| W1 | en | durable export behavior with existing spec and final sync | `delta-spec`, `tracked-change`, or `discovery` |
| W2 | en | auth cleanup preflight with git/worktree and tradeoff | `delta-spec`, `tracked-change`, or `discovery` |
| W3 | en | current-docs research plus local package state | `discovery` or `delta-spec` |
| W4 | en | brainstorm options plus adversarial/disproof path | `discovery`, `tracked-change`, or `delta-spec` |
| W5 | en | lightweight typo fix, proof without ceremony | `direct`, `diagnose`, or `delta-spec` |
| W6 | en | git worktree concept in general | must not fire |

## Evolution Discipline

These cases test Cairn's internal product-development loop: broad research aperture, source
ledger, state-of-practice awareness, non-agent software methodology, git/worktree preflight,
adversarial tradeoffs, and close sync. They exist to prevent Cairn from overfitting to the same
competitor set while still avoiding a new always-on skill.

| # | Lang | Prompt focus | Expected mode |
| --- | --- | --- | --- |
| E1 | en | broad Cairn evolution assessment with source ledger and `borrow/adapt/avoid/defer` | `discovery`, `tracked-change`, or `delta-spec` |
| E2 | en | Cairn development preflight plus human/software methodology lens | `discovery`, `tracked-change`, or `delta-spec` |
| E3 | en | keep up with agent research without skill bloat; sync owners | `discovery`, `tracked-change`, or `delta-spec` |
| E4 | en | current source categories for brainstorming/product/methodology gaps | `discovery` or `delta-spec` |
| E5 | en | Agile Manifesto principles in general | must not fire |

## Near-miss notes

Borderline by design — watch these when tuning the `description`:

- "Run the tests" (N5) vs "the tests are flaky, figure out why" (should fire → diagnose).
- "What does this function do?" (read-only Q&A, no change) vs "this function is wrong, fix
  it" (should fire).
- A prompt owned by a more specific active skill must defer to that skill, not Cairn.

## Retention

Result files are immutable proof, but not all are durable. What stays git-tracked:

- the latest passing run per (suite × harness × model);
- any run a doc/decision-log entry cites as failure evidence;
- the value-of-Cairn controls (`baseline-off`, `cairn-on-clean`).

Same-prompt `route-contract` retests and `-rerun-N` files document *variance*, not new
signal. Keep at most the final file of a flapping case (it carries the conclusion) and record
the verdict in the ledger below — do not let reruns grow into a pile of near-duplicate JSONL.

Archiving is **not** a bare `mv`: `eval-scoreboard.mjs` derives `cleared`/`timeout` state from
the rerun files, and `validate-cairn.mjs` pins baseline summaries (a past rerun overwrote better
proof — decision-log 2026-06-02). Moving a result means updating the scoreboard inputs and the
validate expectations in the *same* change, never a file move alone.

## Results log

Historical evidence ledger. For active failures and the next command, run
`node scripts/eval-scoreboard.mjs`.

Record runs here (date, harness, model, fire-rate, mis-fires, notes) as the suite is
executed.

- **2026-06-01 — Codex v0.135.0, gpt-5.5 — smoke.** A bug prompt auto-fired Cairn without
  naming it, selected **diagnose**, returned a repro + fix plan with no edits. Fixed first:
  unquoted `:` in `description` broke SKILL.md YAML and skipped it — now guarded by validate.

- **2026-06-01 — Codex v0.135.0, gpt-5.5 — full suite (18), competing skills archived.**
  `docs/evals/results/cairn-on-clean.jsonl`.
  - **Trigger: 12/12 must-fire fired (100%), 0/6 must-not misfired (0%).** Clean discrimination
    between brownfield work and Q&A/shell. Zero collision with a competing skill.
  - **Routing: 9/12 to the expected mode (75%).** The 3 misses (F3→direct, F8→discovery,
    F10→unparsed) are all "implement a card/feature" prompts where, in an **empty fixture**
    with no card and no relevant code, the agent correctly declines to force a `delta-spec`
    and degrades to an exploratory mode. So the fixture measures the **trigger** rigorously
    but **understates routing** — fair routing measurement needs fixtures that contain the
    real code/card. Not a Cairn defect; a harness limitation to fix (see gaps P1.7).
  - **Baseline (Cairn removed, `baseline-off.jsonl`): 0/4 must-fire showed any structure** —
    no mode, no routing, no output shape. Confirms Cairn's value is discipline/predictability,
    not raw capability.
  - At the time of this run, realistic-fixture routing, Claude Code, and ≥2 model coverage
    were still pending. Later runs below close the Codex realistic subset and a Claude fast subset.

- **2026-06-01 — Codex v0.136.0, default model — realistic routing subset (7).**
  `docs/evals/results/cairn-realistic-codex-0.136-default.jsonl`.
  - **Trigger: 7/7 must-fire fired (100%).**
  - **Routing: 7/7 expected mode (100%).** Covered card feature, tax bug, auth refactor,
    ORM migration planning, failing test diagnosis, simple greenfield-in-repo, and high-risk
    greenfield billing subsystem.
  - **Collision: 0 competing analyze collisions.**

- **2026-06-01 — Codex v0.136.0, default model — must-not-fire after scope expansion (6).**
  `docs/evals/results/cairn-nofire-after-scope-codex-0.136-default.jsonl`.
  - **Misfire: 0/6 (0%).** Scope expansion to no-card/greenfield/research/cleanup did not
    trigger on pure Q&A or one-off shell prompts in this subset.

- **2026-06-01 — Codex v0.136.0, default model — fast cross-harness subset (R5,N2).**
  `docs/evals/results/cairn-fast-codex-0.136-default.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 1/1 expected mode (100%).**
  - **Misfire: 0/1 must-not (0%).**
  - **Speed:** with `--jobs 2`, N2 completed in 16.3s and R5 in 41.3s.

- **2026-06-01 — Claude Code v2.1.159, default model — fast cross-harness subset (R5,N2).**
  `docs/evals/results/cairn-fast-claude-2.1.159-default.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 1/1 expected mode (100%).**
  - **Misfire: 0/1 must-not (0%).**
  - **Speed:** with `--jobs 2`, N2 completed in 5.5s and R5 in 31.8s.

- **2026-06-01 — Codex v0.136.0, default model — broad no-card/research/cleanup subset (13).**
  `docs/evals/results/cairn-broad-codex-0.136-default.jsonl`.
  - **Trigger: 7/7 must-fire fired (100%).**
  - **Routing: 7/7 expected mode (100%).** Covered no-card implementation, repo-grounded
    research, cleanup, simplification, repo-pattern alignment, greenfield job runner, and
    error-handling alignment.
  - **Misfire: 0/6 must-not (0%).** Covered read-only repo Q&A, one-off file read, card
    summary only, conceptual research, one-off test command, and conceptual cleanup.

- **2026-06-01 — Claude Code v2.1.159, default model — broad fast subset (R8,R9,N7,N9,N10).**
  `docs/evals/results/cairn-broad-fast-claude-2.1.159-default.jsonl`.
  - **Trigger: 2/2 must-fire fired (100%).**
  - **Routing: 2/2 expected mode (100%).**
  - **Misfire: 0/3 must-not (0%).**

- **2026-06-02 — Claude Code v2.1.159, default model — realistic must-not subset (6).**
  `docs/evals/results/cairn-realistic-nofire-claude-2.1.159-default.jsonl`.
  - **Misfire: 0/6 (0%).** Read-only repo Q&A, one-off file/test reads, card summary only,
    conceptual research, and conceptual cleanup did not trigger Cairn.

- **2026-06-02 — Claude Code v2.1.159, default model — realistic must-fire suite (14).**
  `docs/evals/results/cairn-realistic-claude-2.1.159-default.jsonl`.
  - **Trigger: 14/14 must-fire fired (100%).**
  - **Routing: 12/14 expected mode (86%).**
  - **Errors/timeouts: 3/14.** R3/R6/R7 hit the 180s timeout; R14 completed but did not emit
    a parseable mode. Treat this as diagnostic evidence, not a passing gate.

- **2026-06-02 — Codex v0.136.0, default model — P0 matrix (R5,R10,R11,N2,N7,N11).**
  `docs/evals/results/cairn-p0-matrix-codex-0.136-default.jsonl`.
  - **Trigger: 3/3 must-fire fired (100%).**
  - **Routing: 3/3 expected mode (100%).**
  - **Misfire: 0/3 must-not (0%).**
  - **Slowest:** R5 54.1s, R10 53.1s, R11 37.5s.

- **2026-06-02 — Claude Code v2.1.159, default model — P0 matrix (R5,R10,R11,N2,N7,N11).**
  `docs/evals/results/cairn-p0-matrix-claude-2.1.159-default.jsonl`.
  - **Trigger: 3/3 must-fire fired (100%).**
  - **Routing: 2/3 expected mode (67%).** R11 fired but did not emit a parseable mode.
  - **Misfire: 0/3 must-not (0%).**
  - **Slowest:** R11 148.2s and R10 132.7s. This confirms `p0-matrix` is useful but still
    near the default timeout on Claude for security-boundary simplification.

- **2026-06-02 — Claude Code v2.1.159, `haiku` — fast subset (R5,N2).**
  `docs/evals/results/cairn-fast-claude-2.1.159-haiku.jsonl`.
  - **Trigger: 1/1 must-fire fired and routed (100%).**
  - **Misfire: 0/1 must-not (0%).**

- **2026-06-02 — Claude Code v2.1.160, `haiku` — P0 matrix (R5,R10,R11,N2,N7,N11).**
  `docs/evals/results/cairn-p0-matrix-claude-2.1.160-haiku.jsonl`.
  - **Trigger/routing: active failure.** See `eval-scoreboard.mjs` for current percentages and
    next actions; this ledger preserves the result label without becoming the active-status owner.

- **2026-06-02 — Codex v0.136.0, `gpt-5.4-mini` — fast subset (R5,N2).**
  `docs/evals/results/cairn-fast-codex-0.136-gpt-5.4-mini.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 0/1 expected mode (0%).** R5 fired but did not emit a parseable mode.
  - **Misfire: 0/1 must-not (0%).** Treat as second-model activation proof plus a routing
    output gap for mini, not a passing route gate.

- **2026-06-02 — route-output contract retest — Codex `gpt-5.4-mini` (R5,N2).**
  `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 1/1 expected mode (100%).** R5 now emits `mode=diagnose`.
  - **Misfire: 0/1 must-not (0%).** No diagnostics emitted.

- **2026-06-02 — route-output contract retest — Claude Code v2.1.159 default (R11,N7).**
  `docs/evals/results/cairn-route-contract-claude-2.1.159-default.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 1/1 expected mode (100%).** R11 now emits `mode=delta-spec`.
  - **Misfire: 0/1 must-not (0%).** No diagnostics emitted.

- **2026-06-02 — route-output contract retest — Claude Code v2.1.159 default (R14,N8).**
  `docs/evals/results/cairn-route-contract-claude-r14-2.1.159-default.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).**
  - **Routing: 1/1 expected mode (100%).** R14 now emits `mode=direct`.
  - **Misfire: 0/1 must-not (0%).** No diagnostics emitted.

- **2026-06-02 — Codex v0.136.0, default model — context-budget SKILL compactness retest.**
  `docs/evals/results/cairn-p0-matrix-codex-0.136-context-budget.jsonl`.
  - **Trigger: 3/3 must-fire fired (100%).**
  - **Routing: 3/3 expected mode (100%).**
  - **Misfire: 0/3 must-not (0%).**
  - **Slowest:** R10 51.8s, R5 48.9s, R11 40.1s.

- **2026-06-02 — Codex v0.136.0, `gpt-5.4-mini` — P0 matrix (R5,R10,R11,N2,N7,N11).**
  `docs/evals/results/cairn-p0-matrix-codex-0.136-gpt-5.4-mini.jsonl`.
  - **Trigger: 3/3 must-fire fired (100%).**
  - **Routing: 3/3 expected mode (100%).**
  - **Misfire: 0/3 must-not (0%).**
  - **Slowest:** R10 68.5s, R11 62.2s, R5 37.4s. This closes the Codex second-model
    P0 matrix gap; the next Codex gap is realistic must-fire coverage on a second model.

- **2026-06-02 — Codex v0.136.0, `gpt-5.4-mini` — realistic must-fire diagnostic (14).**
  `docs/evals/results/cairn-realistic-codex-0.136-gpt-5.4-mini.jsonl`.
  - **Trigger: 13/14 must-fire fired (93%).**
  - **Routing: 12/14 expected mode (86%).** R9 did not fire; R14 fired but routed to
    `diagnose` instead of `direct`/`delta-spec`.
  - **Errors/timeouts: 0/14.** Treat this as diagnostic evidence, not a passing coverage gate.

- **2026-06-02 — route-output contract retest — Codex `gpt-5.4-mini` realistic gaps.**
  `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps.jsonl`.
  - **Trigger: 2/2 must-fire fired (100%).**
  - **Routing: 2/2 expected mode (100%).** R9 now emits `mode=discovery`; R14 now emits
    `mode=direct`.
  - **Misfire: 0/2 must-not (0%).** N10/N12 stayed out of Cairn. This clears the focused
    diagnostic debt but does not replace a future full realistic rerun.

- **2026-06-02 — Codex v0.136.0, `gpt-5.4-mini` — realistic must-fire rerun (14).**
  `docs/evals/results/cairn-realistic-codex-0.136-gpt-5.4-mini-rerun-1.jsonl`.
  - **Trigger: 14/14 must-fire fired (100%).**
  - **Routing: 11/14 expected mode (79%).** R7/R13/R14 timed out at 180s and emitted no
    parseable mode.
  - **Errors/timeouts: 3/14.** Treat this as stronger activation evidence but not a passing
    second-model realistic gate. The next useful proof is a focused R7/R13/R14 diagnostic rerun
    plus near-misses.

- **2026-06-02 — route-output contract retest — Codex `gpt-5.4-mini` realistic gaps rerun 1.**
  `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps-rerun-1.jsonl`.
  - **Trigger: 3/3 must-fire fired (100%).**
  - **Routing: 1/3 expected mode (33%).** R13 cleared as `discovery`; R7/R14 timed out at 180s.
  - **Misfire: 0/2 must-not (0%).** N10/N12 stayed out of Cairn.

- **2026-06-02 — route-output contract retest — Codex `gpt-5.4-mini` realistic gaps rerun 2, 240s timeout.**
  `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps-rerun-2.jsonl`.
  - **Trigger: 2/2 must-fire fired (100%).**
  - **Routing: 1/2 expected mode (50%).** R7 cleared as `discovery`; R14 completed but routed
    as `diagnose`, outside expected `direct`/`delta-spec`.
  - **Misfire: 0/2 must-not (0%).** N10/N12 stayed out of Cairn. Remaining Codex mini debt:
    R14 route/latency variance, not activation.

- **2026-06-02 — route-output contract retest — Codex `gpt-5.4-mini` realistic gaps rerun 3, 240s timeout.**
  `docs/evals/results/cairn-route-contract-codex-0.136-gpt-5.4-mini-realistic-gaps-rerun-3.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).** R14 read Cairn but timed out before final mode.
  - **Misfire: 0/2 must-not (0%).** N10/N12 stayed out of Cairn.
  - **Conclusion:** R14 is stable Codex-mini route/latency diagnostic debt, not a trigger gap.

- **2026-06-02 — infra-lens seed — Codex `gpt-5.4-mini`.**
  `docs/evals/results/cairn-infra-lens-codex-0.136-gpt-5.4-mini.jsonl`.
  - **Trigger: 2/2 must-fire fired (100%).** I1 routed as `diagnose`; I2 timed out.
  - **Misfire: 0/1 must-not (0%).** I3 stayed out of Cairn.
  - **Conclusion:** infra-lens activation works; the Docker fix case is latency/route-output debt.

- **2026-06-02 — infra-lens I2 sandbox diagnostic — Codex `gpt-5.4-mini`, workspace-write.**
  `docs/evals/results/cairn-infra-lens-codex-0.136-gpt-5.4-mini-workspace-write-smoke.jsonl`.
  - **Trigger: 1/1 must-fire fired (100%).** I2 still timed out at 150s.
  - **Conclusion:** I2 is not only read-only friction; the prompt/hook path is too slow for the small-model fast lane.
