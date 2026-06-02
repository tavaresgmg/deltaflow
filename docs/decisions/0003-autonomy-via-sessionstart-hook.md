# 0003 — Autonomia via hook SessionStart + description diretiva

Status: Aceito (2026-06-01)

## Contexto

Requisito central: o Cairn deve disparar sozinho, sem invocação manual. Mas auto-trigger
por description é **model-invoked e probabilístico** nos dois harness, e sub-dispara
(failure mode dominante: o modelo acha que já sabe e executa manualmente, ignorando a
skill — issue #20986). No Codex não há detecção server-side e a lista de skills é capada.
Superpowers resolve isso com um hook SessionStart que injeta um bootstrap a cada sessão.

## Opções

- Confiar só na `description` nativa (sub-dispara, confirmado nos dois harness).
- Só `/comando` manual (contraria o requisito de autonomia).
- **Hook SessionStart (bootstrap) + description diretiva + gates duros via PreToolUse.**

## Decisão

Camada de **disparo determinístico**: um único script bash de hook SessionStart detecta o
harness (`${CLAUDE_PLUGIN_ROOT}` vs Codex) e injeta um bootstrap enxuto que ordena rotear
pelo Cairn antes de responder. Camada de **descoberta**: `description` reescrita —
`[domínio] + [diretiva ALWAYS] + [trigger phrases reais] + [fronteira negativa]`,
front-loaded, 3ª pessoa, `when_to_use` pt-BR+en com keywords duplicadas na description.
Camada de **enforcement**: o gate duro inicial é limite de mutação fora do repo via
PreToolUse hook (Claude) / command hook `exit 2` (Codex quando entrega live estiver
provada). Brainstorm e prova fresca antes de "done" seguem obrigatórios no workflow, mas
não são determinísticos até existirem sinais de Stop/UserPromptSubmit confiáveis.

## Tradeoff

O bootstrap injeta tokens em toda sessão (custo fixo, manter <2k). Command hooks repo-local
no Codex podem não disparar em sessões interativas (#17532); a ordem SessionStart→
UserPromptSubmit é instável no 1º turno (#15266); colocação errada no `config.toml`
(top-level, não `[features]`) quebra silenciosamente. Bootstrap verboso/coercitivo (CAPS)
briga com a precedência do AGENTS.md do usuário. Mitigação: bootstrap curto, sob autoridade
explícita, `/comando` como fallback. **Validar empiricamente no Codex antes de travar.**
Bug #22345: `disable-model-invocation` é ignorado para skills via plugin no Claude — não
confiar nesse campo para gate de side-effect.

## Fontes

github.com/obra/superpowers (`hooks/session-start`); code.claude.com/docs/en/{hooks,skills};
developers.openai.com/codex/hooks; issues claude-code #20986, #22345; codex #15266, #17532.
Ver `docs/research/context-and-portability.md` (Auto-trigger).
