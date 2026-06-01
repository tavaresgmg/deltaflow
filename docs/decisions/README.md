# Decisões de Arquitetura (ADRs)

Registro append-only das decisões de construção do Cairn: contexto, opções,
decisão e **tradeoff nomeado**. Inspirado no `.decision-log.md` do BMAD (registrar o
PORQUÊ, não só o quê). Idioma pt-BR (rationale). Uma decisão por arquivo, numerada.

| # | Decisão | Status |
| --- | --- | --- |
| [0001](0001-name-cairn.md) | Nome "Cairn" | Aceito |
| [0002](0002-portable-single-source.md) | Fonte única portável Codex + Claude, validar Codex primeiro | Aceito |
| [0003](0003-autonomy-via-sessionstart-hook.md) | Autonomia via hook SessionStart + description diretiva | Aceito |
| [0004](0004-file-based-layered-memory.md) | Memória file-based em camadas, versionada no repo | Aceito |
| [0005](0005-umbrella-workspace-model.md) | Modelo de workspace guarda-chuva (pasta → N repos → `.work/`) | Aceito |
| [0006](0006-first-class-research-stages.md) | Brainstorm / pesquisa web / doc oficial como etapas de 1ª classe | Aceito |

Base de evidência: `docs/research/frameworks.md` e `docs/research/context-and-portability.md`.

## Formato

```
# NNNN — Título
Status: Proposto | Aceito | Substituído por NNNN | Descontinuado (data)
## Contexto    — o problema e a evidência
## Opções      — alternativas consideradas
## Decisão     — o que escolhemos
## Tradeoff     — o que aceitamos perder / risco residual
## Fontes       — evidência primária
```
