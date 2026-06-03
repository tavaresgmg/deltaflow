# 0005 — Modelo de workspace guarda-chuva (pasta → N repos → `.work/`)

Status: Aceito (2026-06-01)

Current note: the umbrella model remains accepted, but `.work/` as the active workspace-state
folder is legacy. Current Cairn-owned workspace state lives under `.cairn/`; see
`plugins/cairn/skills/cairn/references/workspace.md`.

## Contexto

O dono trabalha em workspaces guarda-chuva: uma pasta (ex.: `~/Developer/erictech`) com
**N repositórios git independentes** dentro (ex.: `geogestion-android`, `geogestion-ios`),
e uma pasta `.work/` por nível. **Nenhum** framework de referência orquestra a camada
workspace→N repos: BMAD ativamente RECUSA aninhamento (`ancestor_conflict_check`); Spec Kit
isola por instância (`.specify` prioriza sobre git toplevel); OpenSpec workspace só PLANEJA
(sync cross-repo bloqueado); worktrees de Superpowers/Claude são repo-scoped. É um gap a
preencher — e o **diferencial** do Cairn.

## Opções

- Tratar como monorepo (errado: são N repos independentes; o pai pode nem ser repo).
- Estado só por-repo (perde coordenação cross-repo).
- **Workspace guarda-chuva com owner explícito por nível.**

## Decisão

- **Pai** = `AGENTS.md` com escopo + safety cross-repo + mapa de repos (ativo/pausado/remote-only). NÃO é monorepo.
- **Repos filhos** = donos de git/code/tests/CI/deploy, cada um com seu `<repo>/AGENTS.md`.
- **Estado em duas camadas `.work/`**: pai = `HANDOFF.md` narrativo (keyed por "último evento", prova fresca embutida) + `docs/` ADRs + `worktrees/<repo>-<task>`; filho = `.work/tmp/last-session` local.
- **Boundary detection determinística antes de mutar**: `git rev-parse --show-toplevel` (repo dono do cwd) + `--git-common-dir != --git-dir` (já em worktree?).
- **Worktrees** sempre pertencem a um repo filho, ancorados em `.work/worktrees/<repo>-<task>`.
- Multi-repo real (1 tarefa, 2+ repos) = `.work/` do pai + PRs separados por repo.

Os dois harness sobem instruções do cwd até a raiz concatenando um `AGENTS.md`/`CLAUDE.md`
por diretório — isso suporta nativamente `AGENTS.md` no nível do workspace + override por repo.

## Tradeoff

Gap a construir e validar do zero. Boundary HARD (bloquear push no repo errado, escrita no
`.work/` do nível errado) exige hooks/scripts, não prosa advisory. `AGENTS.md` do pai
<32KiB (Codex para de carregar silenciosamente). A negativa "nenhum framework faz multi-repo"
não foi exaustivamente verificada (risco aberto).

## Fontes

Layout local validado em `~/Developer/*`; BMAD `ancestor_conflict_check`; Spec Kit
`get_repo_root`; OpenSpec `foundation.ts`. Ver `docs/research/frameworks.md`.
