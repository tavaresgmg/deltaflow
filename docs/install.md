# Install

Cairn ships one plugin from this repo, for both Codex and Claude Code, from one source.

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
calc.js" to **diagnose** mode without being named. Not yet verified on Codex: live
`PreToolUse` mutation-guard blocking; Codex CLI v0.136.0 `exec` file-change smoke did not
produce a captured `PreToolUse` event.

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

## Verify locally (no harness)

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```
