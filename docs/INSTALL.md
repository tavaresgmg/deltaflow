# Install

Cairn ships one plugin from this repo, for both Codex and Claude Code, from one source.

## Version Check

Last checked: 2026-06-04.

- Local Codex: `codex-cli 0.137.0`; npm `@openai/codex` `latest=0.137.0`.
- Local Claude Code: `2.1.162`; npm `@anthropic-ai/claude-code` `latest=2.1.162`.

Use the `latest` channel for normal validation.

## Codex (validated on v0.136.0; local v0.137.0)

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

## Claude Code (validated on v2.1.159; local v2.1.162)

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
`SessionStart` / `PreToolUse` contracts. Verify with `claude plugin list`,
`claude plugin details cairn@cairn`, and a focused local hook/plugin smoke when runtime behavior
changes.

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
config, read deterministically. Pick one preset:

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

Default is read-only:

```bash
node plugins/cairn/scripts/cairn-close.mjs .cairn/changes/<slug>
```

To archive a verified completed change after `proof.md` has an explicit
`Lifecycle decision: sync|delegate|archive|delete`, use:

```bash
node plugins/cairn/scripts/cairn-close.mjs .cairn/changes/<slug> --apply
```

Apply mode only archives or deletes the local change folder. It does not perform semantic spec sync
or broad workflow automation; `delete` still requires explicit `--delete`.

## Verify locally (no harness)

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```

Harness install status is checked directly with `codex plugin list -m cairn`, `claude plugin list`,
and `claude plugin details cairn@cairn`.

## Release

Run before tagging a version. Publish patterns only after real brownfield usage validates
the core assumptions.

- [ ] `node scripts/build-manifests.mjs` — regenerate; commit any manifest/marketplace diff.
- [ ] `node scripts/validate-cairn.mjs` passes (files, parity, marketplace drift, YAML safety,
      minimal workflow smoke).
- [ ] Confirm local harness versions against npm `latest`: `codex --version`,
      `claude --version`, `npm view @openai/codex version`,
      `npm view @anthropic-ai/claude-code version`.
- [ ] `node plugins/cairn/scripts/cairn-close.mjs .cairn/changes/<slug>` reports `verified`
      for any active release work before archive.
- [ ] Bump `version` in `plugins/cairn/plugin.manifest.json` and rebuild.
- [ ] Update `CHANGELOG.md` — add the new version section (Added/Changed/Fixed + known residuals),
      sourced from the GitHub release notes; keep numbers/dates/IDs verbatim.
- [ ] Install on Codex from the pushed repo: `SessionStart` hook fires, skill loads with no
      YAML errors, auto-fires on a brownfield prompt.
- [ ] Install on Claude Code; confirm marketplace, hooks (SessionStart + PreToolUse), and skill.
- [ ] Confirm no personal paths or internal artifacts shipped (public-repo hygiene).
- [ ] Tag and push.
