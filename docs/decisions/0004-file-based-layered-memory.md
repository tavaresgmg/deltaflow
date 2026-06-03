# 0004 — Memória file-based em camadas, versionada no repo

Status: Aceito (2026-06-01)

Current note: the original decision below says `.cairn/changes/` should be versioned. That
specific detail is superseded by the 2026-06-02 hybrid commit policy at the end of this ADR.
Keep the original text as historical rationale; use `references/artifacts.md` for the current
operational rule.

## Contexto

O Cairn precisa de memória. As memórias nativas são inadequadas como estado canônico:
Claude auto-memory e Codex memory são **machine-local**, não compartilham entre máquinas
nem entre os dois harness; a do Codex é global/automática/SQLite/não-editável (mudou de
arquivos para SQLite em v0.135.0). Estado per-card/per-workspace controlável **tem** que
ser artefato versionado no repo.

## Opções

- Usar a memória nativa de cada harness como verdade (machine-local, não portável, não controlável).
- Memória semântica externa (vetorial) — overhead; stale pior que ausente.
- **Memória file-based em camadas, versionada no repo.**

## Decisão

Três camadas:
1. **Como trabalhar** — `AGENTS.md` portável (metodologia/regras), import para `CLAUDE.md`.
2. **Estado de trabalho** (única compartilhável entre máquinas/harness/time) — versionada,
   estilo OpenSpec delta: `.cairn/changes/<id>/` com `brainstorm.md` + `research/<topic>.md`
   + `plan.md` + `tasks.md` (checkboxes `[ ]`/`[x]` marcados em tempo real para resume) +
   delta specs `ADDED/MODIFIED/REMOVED` para brownfield. Mais `.decision-log.md` append-only
   **durante** a conversa (padrão BMAD).
3. **Memória-como-claim** (opcional) — índice <200 linhas apontando para topic files,
   tratada como DICA com escopo+proveniência+confiança, **nunca verdade**, revalidada
   contra fonte ao vivo.

## Tradeoff

Memória stale é **pior que ausente** (MemGuard: >1/3 dos fatos errados em 3 meses) — a
camada 3 exige disciplina de poda/datação. O delta spec do OpenSpec **não se auto-atualiza**
durante a implementação (spec drift by-design, sem comando nativo de reconciliação em 2026):
o Cairn precisa de um passo EXPLÍCITO de reconciliação spec↔código, construído por nós. A
verdade canônica fica em código/specs/ADRs versionados; a memória só APONTA.

## Fontes

BMAD `.decision-log.md`; OpenSpec delta/archive; developers.openai.com/codex/memories;
code.claude.com/docs/en/memory; dev.to/ac12644 (MemGuard). Ver `docs/research/frameworks.md`.

## Update 2026-06-02 — hybrid commit policy

The "work state is the one shareable layer, so version it" stance is refined: `.cairn/` is now
HYBRID, superseding the original "version `.cairn/changes/`" rule above. Commit durable
knowledge (`specs/`, `codebase/` maps — living documentation); keep
process local/gitignored (`changes/`, `decision-log.md`). Durable findings sync from a change
into `specs/`/`codebase/` at close, so they survive; the planning folder itself does not enter
the repo. Trade-off: cross-machine/team resume of in-progress work is lost — acceptable, since
local same-machine resume via the anchor and `tasks.md` is unaffected and durable knowledge
still travels. Rule owner: `references/artifacts.md`. This repo (plugin source) keeps its whole
`.cairn/` local.
