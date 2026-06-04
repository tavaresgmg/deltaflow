# Roadmap

Forward-looking only. Shipped work → `CHANGELOG.md`; the *why* behind decisions → `docs/DECISIONS.md`;
canonical principles → `docs/PRINCIPLES.md`.

## Sequencing (next cycle)

Current focus: **minimal core, dogfood-first**. The eval suite has been removed from the active
repo surface; day-to-day evolution now comes from real brownfield use, local structural validation,
and focused harness smoke tests.

Each behind the default-light intent gate:

1. **Core operating model** — make routing judgment, artifact lifecycle, workspace ownership,
   and token economy obvious in existing owners (`ARCHITECTURE.md`, `PRINCIPLES.md`,
   `framework-lessons.md`). No new ceremony surface unless an owner is missing.
2. **Dogfood one real multi-repo workspace task before more fixtures** — run the dogfood proof
   contract (`references/workspace.md`) on a task touching 2+ independent child repos. Patch only
   `workspace.md`/`modes.md` if this exposes friction; do not add a new template first.
3. **Domain lenses** — start with manual brownfield evidence. Do not edit `SKILL.md` or add
   skills until repeated real usage shows current guidance is underspecified.
4. **Distribution** — still gated on publishable evidence and a clean core story; no
   launch while the methodology is hard to explain.
5. **Cairn evolution loop** — methodology changes must use `docs/DEVELOPMENT.md`:
   git/worktree preflight, rotating research aperture, `borrow / adapt / avoid / defer`, and
   close sync into roadmap/research/principles/references as appropriate.

## Gap closure targets

Use these as the next methodology checks before adding scripts, templates, or a new framework
surface:

- **OpenSpec gap:** dogfood one real close that shows final sync among delta/spec, code, proof,
  and archive/delete closeout. `cairn-close.mjs` should be part of the close, but executable proof still
  owns "passes".
- **BMAD gap:** record one quick-vs-full story from real usage: why a task stayed `direct` or
  escalated to `delta-spec`/`tracked-change`, what evidence changed the mode, and what ceremony
  was avoided.
- **Spec Kit gap:** keep `cairn-close.mjs` described as consistency analysis only. It covers
  lifecycle/semantic/proof-reference drift; it does not run tests, inspect runtime, or validate
  product intent.
- **Workspace gap:** run the dogfood proof contract in `references/workspace.md` on a real
  multi-repo task before adding any multi-repo template.
- **Automation gap:** keep Node/MJS scripts split by role. Extract common helpers only when a
  script keeps growing because of repeated production logic, not for aesthetic symmetry.
- **Skill architecture gap:** keep one router skill unless repeated real usage proves a narrow
  secondary skill improves a domain lens without increasing false positives or competing with the
  mode ladder.
- **Evolution gap:** keep the state-of-practice radar current across agent and non-agent lanes.
  Use `docs/RESEARCH.md` before changing methodology, principles, skill shape, or
  public claims; do not let BMAD/OpenSpec/Spec Kit/Superpowers become the whole evidence universe.

## Distribution / public launch (deferred)

Deferred by user (2026-06-02): hold public promotion until there is publishable evidence to show.
Released versions and dates live in `CHANGELOG.md` (sole history owner); v0.1.0 and v0.1.1 stay
pre-release milestone markers.

Prerequisite chain: real dogfood evidence + harness smoke proof -> **announce**. The GitHub Release
is already promoted to Latest; the remaining gate is the public launch.

- [ ] Publish dogfood evidence from real brownfield work and focused harness smokes.
- [ ] Draft launch posts (transparent "experimental, feedback welcome" tone). Author posts
  **manually** — no bot/automation posting (Reddit self-promo rules + one-shot first-impression
  risk; the value is replying to comments live).
- [ ] Channels by fit/risk: r/ClaudeAI + r/ChatGPTCoding (low risk, aligned audience), Show HN
  (one-shot, be transparent it's experimental), PRs to awesome-claude-code / awesome-codex lists
  (passive credibility, lowest risk), X / Dev.to (own pace). Defer r/programming and
  r/ExperiencedDevs until there is traction + published numbers.

Exit: launched with evidence rather than claims; the first impression is spent well.

## Domain lenses (discovery backlog)

Working direction: keep only truly external specialty skills outside Cairn (for now `secrets`
and media transcription). Common development lenses should be folded into Cairn's proportional
workflow only when real brownfield usage proves a routing/proof gap.

Candidate lenses to analyze and fold into references:

- `infra`: runtime systems, Docker, deploy, CI/CD, logs, health, SSH, connectors.
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

Entry rule: add a lens only with a concrete dogfood incident showing current Cairn guidance is
underspecified. Prefer a short lazy reference over inflating `SKILL.md`.

## Skill architecture audit

Default: keep `cairn` as the single router. Competitors prove different useful shapes, but not that
Cairn should split blindly: OpenSpec and Spec Kit center artifacts/workflows; BMAD and Superpowers
use specialized agents/skills; Codex and Claude both support subagents for isolated or noisy work.

Decision rule:

- First improve lazy references from real incidents.
- Split a secondary skill only for a narrow domain with repeated usage proof.
- Never split the five modes into separate skills; that would create competing routers.
- Use subagents for research/review/log-heavy work, not ordinary routing.
