# Install

Cairn ships one plugin from this repo, for both Codex and Claude Code, from one source.

## Version Check

Last checked: 2026-06-02.

- Local Codex: `codex-cli 0.136.0`; npm `@openai/codex` `latest=0.136.0`.
- Local Claude Code: `2.1.159`; npm `@anthropic-ai/claude-code` `latest=2.1.159`,
  `next=2.1.160`.

Use the `latest` channel for normal validation. Treat `next` as pre-release/forward-looking
unless a specific eval asks for it.

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

## Claude Code (validated on v2.1.159)

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
.cairn/decision-log.md
.work/
```

**Local (everything local)** — nothing under `.cairn/` is versioned:

```gitignore
.cairn/
.work/
```

**Commit (everything versioned)** — add nothing for `.cairn/`; let it all be committed.

Commit `.cairn/specs/` and `.cairn/codebase/` whenever possible — they are living documentation.
Process files (`changes/`, `decision-log.md`) staying local does not break same-machine resume
(the SessionStart anchor still works).

**Global default:** state your preference once in your global agent instructions
(`~/.claude/CLAUDE.md`, or your Codex global `AGENTS.md`), e.g. `Cairn memory: keep local`. Cairn
reads that and applies the matching preset when it first creates `.cairn/` state — or paste a
preset above yourself. This plugin's own repo uses `local` — it is the plugin source, not a user
project.

## Verify locally (no harness)

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```
