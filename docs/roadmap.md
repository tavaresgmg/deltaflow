# Roadmap

Forward-looking only. Shipped work → `CHANGELOG.md`; the *why* behind decisions → `docs/decisions/`;
canonical principles → `docs/PRINCIPLES.md`.

## Sequencing (next cycle)

Current focus: **core-first, eval-light**. Do not keep spending cycles on model suites while
the operating model, artifact ownership, and dogfood story can still improve without model
cost. Evals stay as evidence gates for routing/prose changes, not the center of day-to-day
project evolution.

Each behind the default-light intent gate:

1. **Core operating model** — make routing judgment, artifact lifecycle, workspace ownership,
   and token economy obvious in existing owners (`mvp-architecture.md`, `PRINCIPLES.md`,
   `framework-lessons.md`). No new ceremony surface unless an owner is missing.
2. **Dogfood one real multi-repo workspace task before more fixtures** — run the dogfood proof
   contract (`references/workspace.md`) on a task touching 2+ independent child repos. Patch only
   `workspace.md`/`modes.md` if this exposes friction; do not add a new template first.
3. **Domain lenses** — start with manual brownfield evidence. `infra-lens` is seeded,
   but do not edit `SKILL.md` until the vague guidance is confirmed outside eval churn.
4. **Protect eval history** — result labels are immutable by default; use `--overwrite` only for
   a known-bad file. Keep scoreboard as the owner of active eval gaps.
5. **Distribution** — still gated on publishable evidence and a clean core story; no
   launch while the methodology is hard to explain.

## Gap closure targets

Use these as the next methodology checks before adding scripts, templates, or a new framework
surface:

- **OpenSpec gap:** dogfood one real close that shows final sync among delta/spec, code, proof,
  and retention. `cairn-analyze.mjs` should be part of the close, but executable proof still
  owns "passes".
- **BMAD gap:** record one quick-vs-full story from real usage: why a task stayed `direct` or
  escalated to `delta-spec`/`tracked-change`, what evidence changed the mode, and what ceremony
  was avoided.
- **Spec Kit gap:** keep `cairn-analyze.mjs` described as consistency analysis only. It covers
  lifecycle/semantic/proof-reference drift; it does not run tests, inspect runtime, or validate
  product intent.
- **Workspace gap:** run the dogfood proof contract in `references/workspace.md` on a real
  multi-repo task before adding any multi-repo template.
- **Automation gap:** keep Node/MJS scripts split by role. Extract common helpers only when a
  script keeps growing because of repeated production logic, not for aesthetic symmetry.

## Distribution / public launch (deferred)

Deferred by user (2026-06-02): hold public promotion until there is real-model eval proof to show.
Current release state: **v0.1.4 is Latest** (2026-06-03); v0.1.0 and v0.1.1 stay pre-release
milestone markers. Per-version changes live in `CHANGELOG.md`.

Prerequisite chain: publish real-model eval → **announce**. The GitHub Release is already promoted
to Latest; the remaining gate is the public launch, still held for publishable eval numbers.

- [ ] Run + publish real-model eval (cost-gated) — fire-rate/routing on ≥2 models per harness.
- [ ] Draft launch posts (transparent "experimental, feedback welcome" tone). Author posts
  **manually** — no bot/automation posting (Reddit self-promo rules + one-shot first-impression
  risk; the value is replying to comments live).
- [ ] Channels by fit/risk: r/ClaudeAI + r/ChatGPTCoding (low risk, aligned audience), Show HN
  (one-shot, be transparent it's experimental), PRs to awesome-claude-code / awesome-codex lists
  (passive credibility, lowest risk), X / Dev.to (own pace). Defer r/programming and
  r/ExperiencedDevs until there is traction + published numbers.

Exit: launched with evidence (eval numbers) rather than claims; the first impression is spent well.

## Domain lenses (discovery backlog)

Working direction: keep only truly external specialty skills outside Cairn (for now `secrets`
and media transcription). Common development lenses should be folded into Cairn's proportional
workflow only when evals or real brownfield usage prove a routing/proof gap.

Candidate lenses to analyze and fold into references/evals:

- `infra`: runtime systems, Docker, deploy, CI/CD, logs, health, SSH, connectors. Seeded as
  `infra-lens` eval cases (`I1`-`I3`) because dogfooding exposed a real ops/infra bias.
- `database`: schema, migrations, ORM, queries, indexes, N+1. Likely needs explicit
  expand-contract and rollback proof guidance.
- `ui`: visual validation, screenshots, responsive/accessibility, design-system fit. Likely
  adds proof expectations for browser/device checks.
- `testing`: strategy, fixtures, mocks, integration/e2e, TDD when useful. Cairn already says
  tests are proportional; add sharper test-selection heuristics.
- `analyze`: zoom-out/diagnose/audit/decide/research modes. Map useful parts onto Cairn modes
  instead of preserving a parallel router.
- `product`: MVP, JTBD, prioritization, whether-to-build, user journey. Likely belongs in
  `discovery` before implementation.

Entry rule: add a lens only with a concrete fixture or dogfood incident showing current Cairn
guidance is underspecified. Prefer a short lazy reference or eval fixture over inflating
`SKILL.md`.
