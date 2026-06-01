# Install

Cairn ships one plugin from this repo, for both Codex and Claude Code, from one source.

## Codex (validated on v0.135.0)

```bash
codex plugin marketplace add tavaresgmg/cairn   # owner/repo, HTTPS git URL, or a local path
codex plugin add cairn@cairn
codex plugin list -m cairn                       # expect: installed, enabled
```

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

## Claude Code

```bash
/plugin marketplace add tavaresgmg/cairn
/plugin install cairn@cairn
```

Marketplace manifest is at `.claude-plugin/marketplace.json`; hooks use the documented
`SessionStart` / `PreToolUse` contracts. Run the eval suite (`docs/evals/auto-trigger.md`)
to measure fire-rate on your models.

## Verify locally (no harness)

```bash
node scripts/build-manifests.mjs   # regenerate manifests + marketplaces from the canonical source
node scripts/validate-cairn.mjs    # structural + YAML-safety + gate smoke tests
```
