# Install

Cairn ships one plugin from this repo, for both Codex and Claude Code, from one source.

## Version Check

Last checked: 2026-06-03.

- Local Codex: `codex-cli 0.136.0`; npm `@openai/codex` `latest=0.136.0`.
- Local Claude Code: `2.1.161`; npm `@anthropic-ai/claude-code` `latest=2.1.161`.

Use the `latest` channel for normal validation.

## Codex (validated on v0.136.0)

```bash
codex plugin marketplace add tavaresgmg/cairn   # owner/repo, HTTPS git URL, or a local path
codex plugin add cairn@cairn
codex plugin list -m cairn                       # expect: installed, enabled
```

Open `/hooks` in the Codex CLI/app, review the Cairn hooks, and trust them before relying on
hook behavior. Codex requires trust for non-managed command hooks; `--dangerously-bypass-hook-trust`
is only for vetted automation.

Local development (point at a clone):

```bash
codex plugin marketplace add /path/to/cairn
codex plugin add cairn@cairn
```

Refresh after pulling changes (re-snapshots the local marketplace and re-copies the cache):

```bash
codex plugin remove cairn
codex plugin marketplace remove cairn
codex plugin marketplace add . && codex plugin add cairn@cairn
```

Verified behavior on Codex: the `SessionStart` hook injects the routing bootstrap, the
`cairn` skill loads, and it auto-fires on brownfield work — e.g. it routed "there's a bug in
calc.js" to **diagnose** mode without being named.

Live `PreToolUse` mutation-guard blocking is **not yet provable on Codex**, and the cause is
upstream, not Cairn (verified 2026-06-02 against `openai/codex`):

- Plugin-bundled hooks load at runtime only behind the `plugin_hooks` feature flag (PR
  #19705/#19778). Without it the boundary guard does not enforce automatically. **Fallback:**
  register the guard manually in `~/.codex/hooks.json` until the flag is GA.
- File-write ops (`apply_patch`) may not fire `PreToolUse` at all (Issue #17794), so a
  write-block on Codex stays best-effort until that lands.

Check `plugin_hooks` status in `config.schema.json` on `openai/codex` main before relying on
plugin-delivered enforcement.

## Claude Code (validated on v2.1.159; local now v2.1.161)

```bash
/plugin marketplace add tavaresgmg/cairn
/plugin install cairn@cairn
```

Local development:

```bash
claude plugin marketplace add --scope local ./
claude plugin install --scope local cairn@cairn
claude plugin details cairn@cairn
```

Marketplace manifest is at `.claude-plugin/marketplace.json`; hooks use the documented
`SessionStart` / `PreToolUse` contracts. Verified locally: marketplace add/install, component
inventory (skill, agent, SessionStart, PreToolUse), SessionStart injection, PreToolUse allow
inside repo, PreToolUse block outside repo, and a fast auto-trigger eval through
`scripts/eval-autotrigger.mjs --harness claude`.

## Reducing routing noise (Claude Code, optional)

Cairn routes by auto-activation. Other installed skills with broad descriptions compete for
the same prompts and can misfire ahead of Cairn. Claude Code's `skillOverrides` setting
(`code.claude.com/docs/en/settings`) trims that noise without uninstalling anything:

```jsonc
// .claude/settings.json — hide or collapse competing skills, keep Cairn fully visible
{ "skillOverrides": { "some-broad-skill": "off", "another-skill": "name-only" } }
```

Values: `on` (default), `name-only` (collapse description), `user-invocable-only` (hidden from
the model, still in the `/` menu), `off`. Do **not** override `cairn` — its directive
`description` is what drives activation. No Codex equivalent exists yet.

## Memory policy: local, hybrid, or commit

Whether `.cairn/` is local or versioned is set by your project `.gitignore` — that **is** the
config, read deterministically. The boundary detector reports the effective `memoryPolicy`
(`local|hybrid|commit`) each session, so the agent respects your choice instead of guessing.
Pick one preset:

**Hybrid (default)** — durable knowledge committed, process local:

```gitignore
.cairn/changes/
.cairn/queue.md
.cairn/decision-log.md
.cairn/state/
.cairn/tmp/
.cairn/worktrees/
```

**Local (everything local)** — nothing under `.cairn/` is versioned:

```gitignore
.cairn/
```

**Commit (everything versioned)** — add nothing for `.cairn/`; let it all be committed.

Commit `.cairn/specs/`, `.cairn/codebase/`, and `.cairn/docs/` whenever possible — they are
living documentation. Process files staying local does not break same-machine resume.

Workspace state is owned by Cairn. `.work/` is legacy: Cairn can read it for migration, but new
handoff/docs/worktrees/tmp state belongs under `.cairn/`. This plugin's own repo uses `local`
because it is the plugin source, not a user project.

More generally: Claude Code reads your global `~/.claude/CLAUDE.md`, Codex reads your global
`AGENTS.md`. Cairn honors those above project files but below a same-turn chat instruction (full
order in `docs/PRINCIPLES.md`).

## Lifecycle cleanup

Process state is local by default, but completed change folders should not stay active forever:

```bash
node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes
```

Default is read-only. To archive one completed change after `proof.md` has an explicit
`Lifecycle decision: sync|delegate|archive|delete`, use:

```bash
node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes --apply --slug <slug>
```

Apply mode only cleans retention state. It does not perform semantic spec sync or broad workflow
automation; `delete` still requires explicit `--delete`.

## Verify locally (no harness)

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node plugins/cairn/scripts/cairn-doctor.mjs --json  # read-only local Codex/Claude integration health
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```

`cairn-doctor.mjs` does not install plugins, trust hooks, run model evals, or mutate state. It only
reports visible CLIs, manifest parity, declared hook surfaces, boundary detection, and which
Codex/Claude guarantees are strong, proven, advisory, or pending upstream. The contract behind
those labels is in `docs/ARCHITECTURE.md (Harness status)`.

## Release

Run before tagging a version. Publish patterns only after real brownfield usage validates
the core assumptions.

- [ ] `node scripts/build-manifests.mjs` — regenerate; commit any manifest/marketplace diff.
- [ ] `node scripts/validate-cairn.mjs` passes (files, parity, marketplace drift, YAML safety,
      gate/helper smoke).
- [ ] Confirm local harness versions against npm `latest`: `codex --version`,
      `claude --version`, `npm view @openai/codex version`,
      `npm view @anthropic-ai/claude-code version`.
- [ ] `node plugins/cairn/scripts/cairn-doctor.mjs --json` reports no broken manifest, hook,
      helper, or boundary surfaces; Codex write guard should remain `pending-upstream` until proven.
- [ ] `node plugins/cairn/scripts/cairn-analyze.mjs --all .cairn/changes` reports no HIGH
      findings for active release work.
- [ ] `node plugins/cairn/scripts/cairn-retention.mjs .cairn/changes` reports no unexpected
      actionable completed changes; use `--apply --slug <slug>` only after proof/lifecycle is set.
- [ ] Bump `version` in `plugins/cairn/plugin.manifest.json` and rebuild.
- [ ] Update `CHANGELOG.md` — add the new version section (Added/Changed/Fixed + known residuals),
      sourced from the GitHub release notes; keep numbers/dates/IDs verbatim.
- [ ] Install on Codex from the pushed repo: `SessionStart` hook fires, skill loads with no
      YAML errors, auto-fires on a brownfield prompt.
- [ ] Run `docs/evals/auto-trigger.md` on ≥2 models per harness; log fire-rate in that file.
- [ ] Install on Claude Code; confirm marketplace, hooks (SessionStart + PreToolUse), skill,
      and the `cairn-researcher` agent load.
- [ ] Confirm no personal paths or internal artifacts shipped (public-repo hygiene).
- [ ] Tag and push.
