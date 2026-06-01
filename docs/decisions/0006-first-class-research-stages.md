# 0006 — Brainstorm / pesquisa web / doc oficial como etapas de 1ª classe

Status: Aceito (2026-06-01)

## Contexto

As três etapas que o dono mais valoriza — brainstorm, pesquisa web, leitura de doc oficial
— são exatamente o que os frameworks atuais tratam como afterthought (Superpowers tem
brainstorm forte mas é spec-first/greenfield; Spec Kit não tem nenhuma das três dedicadas).
Elevá-las é parte da tese do Cairn.

## Opções

- Manter como uma linha dentro de `discovery` (status quo do scaffold).
- Etapas obrigatórias sempre (vira cerimônia em card pequeno).
- **Etapas de 1ª classe, disparadas por gate/regra, com default-leve por intent.**

## Decisão

- **Brainstorm = hard-gate** (modelo Superpowers + OpenSpec `explore` como postura): design
  antes de código, uma pergunta por vez, 2-3 abordagens com trade-off nomeado, salva
  `brainstorm.md`, self-review. Escala com stakes (pode ser curto). No Claude, subagent
  isolado read-only para não poluir o contexto principal.
- **Pesquisa web = Phase 0** subagent isolado que devolve só resumo destilado e GRAVA
  `.work/<id>/research/<topic>.md` versionado e reusável (reuso = memória). Dispara quando
  há unknown técnico / versão de framework / escolha de lib / API externa. Escada de
  evidência: live > repo > doc oficial > web primária. NÃO disparar para lib trivial.
- **Doc oficial = regra always-on** no `AGENTS.md`: antes de codar contra lib/ferramenta
  NOVA, aterrar em doc oficial — e na **versão do lockfile**, não a mais nova. Context7 só
  como atalho oportunista (hospedado, sem cache), nunca única fonte.

Delegar à skill de domínio (`analyze` modo research) quando existir.

## Tradeoff

Empilhar brainstorm-gate + Phase 0 research + doc-grounding pode recriar a cerimônia que
queremos evitar em card pequeno. **O gate de "quando um card merece isso" precisa ser
default-leve, por intent** (estilo quick-dev do BMAD) — nenhum framework decide isso
automaticamente; é o ponto a afiar e validar nos evals.

## Fontes

Superpowers `skills/brainstorming`; BMAD discovery + Phase 0 research; práticas brownfield
(`docs/research/frameworks.md`, seção "3 etapas de primeira classe").
