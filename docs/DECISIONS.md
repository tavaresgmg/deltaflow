# Decisions

Append-only record of Cairn's build decisions: context, options, decision, and **named
tradeoff** (record the WHY, not just the what — BMAD `.decision-log.md` lineage). One canonical
file; each decision is a numbered section. Bodies are kept in pt-BR as internal rationale;
titles and framing are English.

Evidence base: `docs/RESEARCH.md`.

| # | Decision | Status |
| --- | --- | --- |
| 1 | Name "Cairn" | Accepted |
| 2 | Single portable source for Codex + Claude, validate Codex first | Accepted |
| 3 | Autonomy via SessionStart bootstrap + directive description | Accepted |
| 4 | Layered file-based memory, versioned in the repo (hybrid commit) | Accepted |
| 5 | Umbrella workspace model (folder → N repos) | Accepted |
| 6 | Brainstorm / web research / official docs as first-class stages | Accepted |
| 7 | Cairn Proofflow as the named methodology | Accepted |

Format per decision: **Contexto** (problem + evidence) → **Opções** (alternatives) →
**Decisão** (what we chose) → **Tradeoff** (what we accept losing) → **Fontes** (primary evidence).

---

## Decision 1 — Name "Cairn"

Status: Aceito (2026-06-01)

### Contexto

O nome inicial "Deltaflow" tinha dois problemas para um produto que será público:
"delta" prende a percepção a *delta specs* (apenas uma das técnicas), "...flow" é o
sufixo mais genérico do espaço, e `deltaflow.dev` já resolve para terceiro. Critérios
do dono: memorável, forte, escalável, sem colisão de marca no espaço dev/AI.

### Opções

- **Cairn** — pilhas de pedra que marcam trilha em terreno desconhecido. `cairn.dev` livre.
- **Bearing** — achar o rumo; npm livre; `bearing.dev` tomado.
- **Astrolabe** — navegação clássica; livre; 9 letras.
- **Sextant** — medir posição antes de seguir; `sextant.dev` tomado.
- Queimados por colisão de marca: Cadence (Temporal/Uber), Keel (keel.sh), Rudder (RudderStack), Sieve (Sieve AI), Gauge (ThoughtWorks), Fathom (Fathom AI).

### Decisão

**Cairn.** É a metáfora exata da tese do produto: marcadores mínimos que guiam sem peso
— artefato só onde precisa, navegar brownfield. Curto (5 letras), raro em dev/AI.

### Tradeoff

Pronúncia ("quern") pode confundir não-nativos. `npm`/GitHub single-word `cairn` estão
ocupados por projetos triviais — contornável com escopo (`@cairn/...`) e `tavaresgmg/cairn`.

### Fontes

Checagem de disponibilidade npm/GitHub/DNS (2026-06-01); repo público em github.com/tavaresgmg/cairn.

---

## Decision 2 — Single portable source (Codex + Claude), validate Codex first

Status: Aceito (2026-06-01)

### Contexto

O Cairn precisa rodar em OpenAI Codex E Claude Code. Agent Skills virou **open standard**
(agentskills.io, 18-dez-2025) adotado por Codex/Gemini/Copilot/Cursor: `SKILL.md` +
progressive disclosure é o substrato comum; a diferença entre harness é basicamente o
*manifest*. O dono já mantém uma fonte via symlink `~/.claude/CLAUDE.md → ~/.codex/AGENTS.md`.

### Opções

- Codex-first estrito, Claude só numa fase distante (roadmap original).
- Os dois em paralelo, prioridade igual (superfície/custo ~2x desde já).
- **Uma fonte portável + shims gerados no build, validar Codex primeiro.**

### Decisão

**Uma fonte portável.** Substrato comum idêntico (`skills/cairn/SKILL.md` + `references/`).
O build emite os shims por harness: `.codex-plugin/plugin.json` + `.claude-plugin/plugin.json`
de um `plugin.manifest.json` canônico; `CLAUDE.md` gerado com import `@AGENTS.md` (Claude não
lê AGENTS.md nativamente — issue #6235); hooks padronizados em `${CLAUDE_PLUGIN_ROOT}`.
Validar no Codex primeiro força a disciplina do caminho mais fraco (sem auto-trigger server-side).

### Tradeoff

Config (`settings.json` vs `config.toml`) não é portável — gerar por harness. Codex pode
omitir a skill do listing (cap ~2%/8000 chars) se o ambiente tiver muitas skills. Preferir
geração/import a symlink (Windows quebra symlink); nunca symlinkar `.claude/` inteiro.
Instalação pública não pode depender de nada em `~/.codex` ou `~/.claude` do autor.

### Fontes

agentskills.io/specification; code.claude.com/docs/en/{skills,plugins-reference,memory};
developers.openai.com/codex/{skills,plugins/build}; github.com/anthropics/claude-code/issues/6235.
Ver `docs/RESEARCH.md`.

---

## Decision 3 — Autonomy via SessionStart bootstrap + directive description

Status: Aceito (2026-06-01)

### Contexto

Requisito central: o Cairn deve disparar sozinho, sem invocação manual. Mas auto-trigger
por description é **model-invoked e probabilístico** nos dois harness, e sub-dispara
(failure mode dominante: o modelo acha que já sabe e executa manualmente, ignorando a
skill — issue #20986). No Codex não há detecção server-side e a lista de skills é capada.
Superpowers resolve isso com um hook SessionStart que injeta um bootstrap a cada sessão.

### Opções

- Confiar só na `description` nativa (sub-dispara, confirmado nos dois harness).
- Só `/comando` manual (contraria o requisito de autonomia).
- **Hook SessionStart (bootstrap) + description diretiva + gates duros via PreToolUse.**

### Decisão

Camada de **disparo determinístico**: um único script bash de hook SessionStart detecta o
harness (`${CLAUDE_PLUGIN_ROOT}` vs Codex) e injeta um bootstrap mínimo que ordena rotear
pelo Cairn antes de responder. Camada de **descoberta**: `description` reescrita —
`[domínio] + [diretiva ALWAYS] + [fronteira negativa]`, front-loaded e em 3ª pessoa.
Termos concretos podem ajudar descoberta probabilística de skill, mas não são gate nem
política runtime.
Camada de **enforcement**: o gate duro inicial é limite de mutação fora do repo via
PreToolUse hook (Claude) / command hook `exit 2` (Codex quando entrega live estiver
provada). Brainstorm e prova fresca antes de "done" seguem obrigatórios no workflow, mas
não são determinísticos até existirem sinais de Stop/UserPromptSubmit confiáveis.

### Tradeoff

O bootstrap injeta tokens em toda sessão (custo fixo, manter pequeno). Command hooks repo-local
no Codex podem não disparar em sessões interativas (#17532); a ordem SessionStart→
UserPromptSubmit é instável no 1º turno (#15266); colocação errada no `config.toml`
(top-level, não `[features]`) quebra silenciosamente. Bootstrap verboso/coercitivo (CAPS)
briga com a precedência do AGENTS.md do usuário. Mitigação: bootstrap curto, sob autoridade
explícita, `/comando` como fallback, e UserPromptSubmit orientado por estado/hash em vez de
prompt text. **Validar empiricamente no Codex antes de travar.**
Bug #22345: `disable-model-invocation` é ignorado para skills via plugin no Claude — não
confiar nesse campo para gate de side-effect.

### Addendum 2026-06-04 — cadência do `UserPromptSubmit`

`UserPromptSubmit` dispara a cada prompt do usuário nos harnesses, mas isso não significa
que o Cairn deve reinjetar contexto em todo turno. A política correta é: emitir a âncora
quando um active change aparece ou troca de slug; em seguida, se a âncora mudou, esperar um
gap curto de prompts antes de reemitir. O default local é 3 prompts (`CAIRN_ANCHOR_MIN_PROMPT_GAP`
pode ajustar). Prompt text continua fora da política: estado estrutural e hash vencem
palavra-chave. Tradeoff: uma mudança de estado pequena pode chegar um prompt depois; em troca,
evitamos duplicar contexto mutável a cada interação normal. `SessionStart` em `compact|resume`
continua sendo a via imediata para sobrevivência pós-compaction.

O que entra no contexto quando emite: somente o texto de `cairn-anchor.mjs`, com título
`## Cairn resume anchor`, slug ativo, contador de tarefas, até 5 tarefas abertas truncadas
a 140 caracteres, contador de tarefas omitidas quando houver, até 3 decisões recentes truncadas
e a instrução para reler `tasks.md`/`decision-log.md`. No estado local desta decisão, esse
payload mede 588 bytes / 80 palavras. Em rodadas sem active change, âncora igual, ou mudança
ainda dentro do gap, o hook injeta 0 bytes.

### Fontes

github.com/obra/superpowers (`hooks/session-start`); code.claude.com/docs/en/{hooks,skills};
developers.openai.com/codex/hooks; issues claude-code #20986, #22345; codex #15266, #17532.
Ver `docs/RESEARCH.md` (Auto-trigger).

---

## Decision 4 — Layered file-based memory, versioned in the repo

Status: Aceito (2026-06-01) · current rule = hybrid commit (2026-06-02)

### Contexto

O Cairn precisa de memória. As memórias nativas são inadequadas como estado canônico:
Claude auto-memory e Codex memory são **machine-local**, não compartilham entre máquinas
nem entre os dois harness; a do Codex é global/automática/SQLite/não-editável (mudou de
arquivos para SQLite em v0.135.0). Estado per-card/per-workspace controlável **tem** que
ser artefato versionado no repo.

### Opções

- Usar a memória nativa de cada harness como verdade (machine-local, não portável, não controlável).
- Memória semântica externa (vetorial) — overhead; stale pior que ausente.
- **Memória file-based em camadas, versionada no repo.**

### Decisão

Três camadas:
1. **Como trabalhar** — `AGENTS.md` portável (metodologia/regras), import para `CLAUDE.md`.
2. **Estado de trabalho** — estilo OpenSpec delta: `.cairn/changes/<id>/` com `brainstorm.md` +
   `research/<topic>.md` + `plan.md` + `tasks.md` (checkboxes `[ ]`/`[x]` marcados em tempo real
   para resume) + delta specs `ADDED/MODIFIED/REMOVED` para brownfield. Mais `.decision-log.md`
   append-only **durante** a conversa (padrão BMAD).
3. **Memória-como-claim** (opcional) — índice <200 linhas apontando para topic files,
   tratada como DICA com escopo+proveniência+confiança, **nunca verdade**, revalidada
   contra fonte ao vivo.

**Regra atual de commit (hybrid, supersede o "versionar `.cairn/changes/`" original):** `.cairn/`
é HYBRID. Commitar conhecimento durável (`specs/`, `codebase/` maps — documentação viva); manter
processo local/gitignored (`changes/`, `decision-log.md`). Findings duráveis sincronizam de um
change para `specs/`/`codebase/` no close, então sobrevivem; a pasta de planejamento não entra no
repo. Dono da regra operacional: `references/artifacts.md`. Este repo (fonte do plugin) mantém
todo o `.cairn/` local.

### Tradeoff

Memória stale é **pior que ausente** (MemGuard: >1/3 dos fatos errados em 3 meses) — a
camada 3 exige disciplina de poda/datação. O delta spec do OpenSpec **não se auto-atualiza**
durante a implementação (spec drift by-design, sem comando nativo de reconciliação em 2026):
o Cairn precisa de um passo EXPLÍCITO de reconciliação spec↔código, construído por nós. A
verdade canônica fica em código/specs versionados; a memória só APONTA. Com o hybrid, resume
cross-máquina/time de trabalho em progresso é perdido — aceitável, pois resume local via anchor +
`tasks.md` é preservado e o conhecimento durável ainda viaja.

### Addendum 2026-06-04 — OpenSpec `/opsx:sync`

OpenSpec `/opsx:sync` (default desde v1.4.0, 2026-06-01) reconcilia delta→spec no nível de
markdown, mas não verifica a implementação; o passo de reconciliação spec↔código continua a ser
construído por nós. Corrige o parêntese do Tradeoff acima ("sem comando nativo de reconciliação").

### Fontes

BMAD `.decision-log.md`; OpenSpec delta/archive; developers.openai.com/codex/memories;
code.claude.com/docs/en/memory; dev.to/ac12644 (MemGuard). Ver `docs/RESEARCH.md`.

---

## Decision 5 — Umbrella workspace model (folder → N repos)

Status: Aceito (2026-06-01) · current state under `.cairn/` (`.work/` legacy)

### Contexto

O dono trabalha em workspaces guarda-chuva: uma pasta (ex.: `~/Developer/erictech`) com
**N repositórios git independentes** dentro (ex.: `geogestion-android`, `geogestion-ios`).
**Nenhum** framework de referência orquestra a camada workspace→N repos: BMAD ativamente
RECUSA aninhamento (`ancestor_conflict_check`); Spec Kit isola por instância (`.specify`
prioriza sobre git toplevel); OpenSpec workspace só PLANEJA (sync cross-repo bloqueado);
worktrees de Superpowers/Claude são repo-scoped. É um gap a preencher — e o **diferencial**
do Cairn.

### Opções

- Tratar como monorepo (errado: são N repos independentes; o pai pode nem ser repo).
- Estado só por-repo (perde coordenação cross-repo).
- **Workspace guarda-chuva com owner explícito por nível.**

### Decisão

- **Pai** = `AGENTS.md` com escopo + safety cross-repo + mapa de repos (ativo/pausado/remote-only). NÃO é monorepo.
- **Repos filhos** = donos de git/code/tests/CI/deploy, cada um com seu `<repo>/AGENTS.md`.
- **Estado em duas camadas** sob o `.cairn/` do pai: `.cairn/state/HANDOFF.md`, `.cairn/docs/`,
  `.cairn/worktrees/<repo>/<task>`, `.cairn/tmp/`; estado Cairn no repo filho só quando não há
  workspace pai marcado. (`.work/` é o shape histórico legado.)
- **Boundary detection determinística antes de mutar**: `git rev-parse --show-toplevel` (repo dono do cwd) + `--git-common-dir != --git-dir` (já em worktree?).
- **Worktrees** sempre pertencem a um repo filho, ancorados em `.cairn/worktrees/<repo>/<task>`.
- Multi-repo real (1 tarefa, 2+ repos) = `.cairn/` do pai + PRs separados por repo.

Os dois harness sobem instruções do cwd até a raiz concatenando um `AGENTS.md`/`CLAUDE.md`
por diretório — isso suporta nativamente `AGENTS.md` no nível do workspace + override por repo.
Owner operacional: `references/workspace.md`.

### Tradeoff

Gap a construir e validar do zero. Boundary HARD (bloquear push no repo errado, escrita no
estado do nível errado) exige hooks/scripts, não prosa advisory. `AGENTS.md` do pai
<32KiB (Codex para de carregar silenciosamente). A negativa "nenhum framework faz multi-repo"
não foi exaustivamente verificada (risco aberto).

### Fontes

Layout local validado em `~/Developer/*`; BMAD `ancestor_conflict_check`; Spec Kit
`get_repo_root`; OpenSpec `foundation.ts`. Ver `docs/RESEARCH.md`.

---

## Decision 6 — Brainstorm / web research / official docs as first-class stages

Status: Aceito (2026-06-01) · research summaries under `.cairn/changes/<slug>/research/`

### Contexto

As três etapas que o dono mais valoriza — brainstorm, pesquisa web, leitura de doc oficial
— são exatamente o que os frameworks atuais tratam como afterthought (Superpowers tem
brainstorm forte mas é spec-first/greenfield; Spec Kit não tem nenhuma das três dedicadas).
Elevá-las é parte da tese do Cairn.

### Opções

- Manter como uma linha dentro de `discovery` (status quo do scaffold).
- Etapas obrigatórias sempre (vira cerimônia em card pequeno).
- **Etapas de 1ª classe, disparadas por gate/regra, com default-leve por intent.**

### Decisão

- **Brainstorm = hard-gate** (modelo Superpowers + OpenSpec `explore` como postura): design
  antes de código, uma pergunta por vez, 2-3 abordagens com trade-off nomeado, salva
  `brainstorm.md`, self-review. Escala com stakes (pode ser curto). No Claude, subagent
  isolado read-only para não poluir o contexto principal.
- **Pesquisa web = Phase 0** subagent isolado que devolve só resumo destilado e grava
  pesquisa em `.cairn/changes/<slug>/research/<topic>.md` quando a tarefa justifica artifact.
  Dispara quando há unknown técnico / versão de framework / escolha de lib / API externa.
  Escada de evidência: live > repo > doc oficial > web primária. NÃO disparar para lib trivial.
- **Doc oficial = regra always-on** no `AGENTS.md`: antes de codar contra lib/ferramenta
  NOVA, aterrar em doc oficial — e na **versão do lockfile**, não a mais nova. Context7 só
  como atalho oportunista (hospedado, sem cache), nunca única fonte.

Delegar à skill de domínio (`analyze` modo research) quando existir. Owner operacional:
`references/research.md`.

### Tradeoff

Empilhar brainstorm-gate + Phase 0 research + doc-grounding pode recriar a cerimônia que
queremos evitar em card pequeno. **O gate de "quando um card merece isso" precisa ser
default-leve, por intent** (estilo quick-dev do BMAD) — nenhum framework decide isso
automaticamente; é o ponto a afiar com dogfood e prova de harness.

### Fontes

Superpowers `skills/brainstorming`; BMAD discovery + Phase 0 research; práticas brownfield
(`docs/RESEARCH.md`, seção "3 etapas de primeira classe").

---

## Decision 7 — Cairn Proofflow as the named methodology

Status: Aceito (2026-06-04)

### Contexto

O Cairn já tinha metodologia real, mas espalhada: princípios em `docs/PRINCIPLES.md`,
arquitetura em `docs/ARCHITECTURE.md`, evolução em `docs/DEVELOPMENT.md`, runtime nas
referências da skill e enforcement nos scripts/hooks. Isso protegia a implementação, mas
não explicava bem a tese: qual dor resolve, como cria método, onde OpenSpec/BMAD/Spec Kit
entram, quando planeja, quando prova, e quais mecanismos realmente forçam comportamento.

### Opções

- Não nomear nada e manter só docs espalhados. Menos arquivo, mas método implícito.
- Criar uma pasta grande de metodologia. Mais completo, mas risco alto de drift e dono duplicado.
- **Criar um documento canônico de síntese, mantendo runtime e evidência nos donos existentes.**

### Decisão

Nome público: **Cairn Proofflow**.

Categoria de trabalho: **Evidence-Routed Development**.

Definição curta: rotear cada tarefa para o workflow mais leve que ainda protege correção,
fechar com prova fresca e reconciliar contexto antes de seguir.

`docs/METHODOLOGY.md` passa a ser o dono da narrativa: nome, tese, dores, ciclo
`orient -> route -> shape -> build -> prove -> reconcile -> learn`, tradução de fontes,
princípios como forças, artefatos por intenção, mecanismos force/check/guide, cenários,
failure tests e anti-padrões. Ele não vira dono de runtime nem do processo operacional de
evolução: referências da skill, `docs/DEVELOPMENT.md`, princípios, arquitetura, pesquisa e
scripts continuam donos do comportamento detalhado.

### Tradeoff

Uma metodologia nomeada pode virar branding theater. A mitigação é operacional: nenhuma regra
entra só porque soa elegante; precisa explicar falha real, melhorar workflow real, ou prevenir
classe repetível de dano com menos cerimônia que a alternativa. Novos hooks/scripts ficam
fora até existir sinal estrutural estável e falha estreita que prose/proof não protegem.

### Fontes

OpenSpec/OPSX workflows; Spec Kit; BMAD; Superpowers/GSD; DORA 2026 Gen AI report; METR 2026
uplift update e survey; SPACE/DevEx; Agile principles; Kanban Guide; XP/YAGNI; Toyota
Production System. Ver `docs/RESEARCH.md` e `docs/METHODOLOGY.md`.
