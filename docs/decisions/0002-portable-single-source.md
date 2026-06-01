# 0002 — Fonte única portável Codex + Claude, validar Codex primeiro

Status: Aceito (2026-06-01)

## Contexto

O Cairn precisa rodar em OpenAI Codex E Claude Code. Agent Skills virou **open standard**
(agentskills.io, 18-dez-2025) adotado por Codex/Gemini/Copilot/Cursor: `SKILL.md` +
progressive disclosure é o substrato comum; a diferença entre harness é basicamente o
*manifest*. O dono já mantém uma fonte via symlink `~/.claude/CLAUDE.md → ~/.codex/AGENTS.md`.

## Opções

- Codex-first estrito, Claude só numa fase distante (roadmap original).
- Os dois em paralelo, prioridade igual (superfície/custo ~2x desde já).
- **Uma fonte portável + shims gerados no build, validar Codex primeiro.**

## Decisão

**Uma fonte portável.** Substrato comum idêntico (`skills/cairn/SKILL.md` + `references/`).
O build emite os shims por harness: `.codex-plugin/plugin.json` + `.claude-plugin/plugin.json`
de um `plugin.manifest.json` canônico; `CLAUDE.md` gerado com import `@AGENTS.md` (Claude não
lê AGENTS.md nativamente — issue #6235); hooks padronizados em `${CLAUDE_PLUGIN_ROOT}`.
Validar no Codex primeiro força a disciplina do caminho mais fraco (sem auto-trigger server-side).

## Tradeoff

Config (`settings.json` vs `config.toml`) não é portável — gerar por harness. Codex pode
omitir a skill do listing (cap ~2%/8000 chars) se o ambiente tiver muitas skills. Preferir
geração/import a symlink (Windows quebra symlink); nunca symlinkar `.claude/` inteiro.
Instalação pública não pode depender de nada em `~/.codex` ou `~/.claude` do autor.

## Fontes

agentskills.io/specification; code.claude.com/docs/en/{skills,plugins-reference,memory};
developers.openai.com/codex/{skills,plugins/build}; github.com/anthropics/claude-code/issues/6235.
Ver `docs/research/context-and-portability.md`.
