# Research

Internal evidence behind Cairn's decisions (see `docs/DECISIONS.md`). Mostly pt-BR rationale from
the 2026-06-01 passes; later refreshes and the radar are English. Three Parts:

- **Part 1 — Frameworks & harness**: BMAD / OpenSpec / Spec Kit / Superpowers / GSD + Codex / Claude.
- **Part 2 — Context, tokens, portability, auto-trigger**: context budget, skill packaging, description design.
- **Part 3 — Evolution radar**: living state-of-practice source ledger.

---

## Part 1 — Frameworks & harness lane

Data: 2026-06-01. Método: 2 workflows multi-agente (36 subagentes, ~2M tokens), com
verificação adversarial das alegações que sustentam decisões. Esta Parte é o destilado da
frente 1 (frameworks + harness + práticas) e cobre só a lane de agent-frameworks/harness; o
state-of-practice mais amplo está na Parte 3. Mudanças de metodologia começam por
`docs/DEVELOPMENT.md`, traduzindo fontes em `borrow / adapt / avoid / defer` em vez de re-rodar o
mesmo conjunto de competidores.

### 2026-06-03 current-source refresh: skill architecture

Question: is Cairn getting worse by concentrating too much behavior in one skill?

Finding: current evidence does not support a blind split. The installed plugin reports about
657 always-on tokens, while detailed references remain lazy-loaded. The stronger risk is not token
load; it is that one broad router can hide domain-specific gaps or selection failures. The right
next move is a dogfood-backed architecture audit, not a new skill tree by assumption.

Current external signals:

- **OpenSpec** shifted further toward artifact-guided workflow: `/opsx:propose`, `/opsx:apply`,
  `/opsx:archive`, explicit proposal/spec/design/tasks folders, and archive/sync. It now presents
  itself as brownfield-friendly, fluid rather than rigid, and latest GitHub release visible as
  `v1.4.1` on 2026-06-03. Source: https://github.com/Fission-AI/OpenSpec
- **BMAD** v6 positions itself as specialized agents + guided workflows + context management, with
  Quick Dev, adversarial review, project context, and ecosystem modules. Source:
  https://docs.bmad-method.org/
- **Spec Kit** is much more ecosystem-shaped than Cairn: Spec -> Plan -> Tasks -> Implement, 30
  integrations, 105 extensions, 22 presets, and organization-hosted extension catalogs. Source:
  https://github.github.com/spec-kit/
- **Superpowers** is the strongest contrary case to Cairn's one-router shape: it uses composable
  skills, design-before-code, worktrees, and subagent-driven development after approval. Source:
  https://github.com/obra/superpowers
- **Claude Code** subagents now make isolated work more attractive, but the docs still show tradeoffs:
  subagents get fresh context, selected preloaded skills, persistent transcripts, and separate
  compaction; they do not automatically solve shared-rule propagation. Source:
  https://code.claude.com/docs/en/sub-agents
- **Codex** guidance remains conservative: AGENTS.md first, reusable workflow as plugin/skill, MCP
  for external systems, subagents when ready to delegate noisy or specialized tasks. Source:
  https://developers.openai.com/codex/concepts/customization#next-step

Decision pressure:

- Keep one **router** skill by default. Splitting the mode ladder (`direct`, `diagnose`,
  `discovery`, `delta-spec`, `tracked-change`) would create competing routers and likely hurt
  selection.
- Add sharper **lens coverage** first: database, UI, testing, product, infra, and skill architecture
  prompts from real incidents.
- Split only a narrow lens into a secondary skill if it beats the current baseline with no must-fire
  regression, no no-fire regression, and acceptable always-on/token cost.
- Use subagents for competitive research, adversarial review, long logs, and isolated domain
  inspection. Do not use subagents for normal routing or as a substitute for local proof.

### Matriz comparativa

| Sistema | Gatilho | Artefatos | Stop conditions | Autonomia | Memória |
| --- | --- | --- | --- | --- | --- |
| **BMAD v6.8.0** (Skills Architecture) | Description-matching nativo do harness (`Use when user says X`); removeram `disable-model-invocation` p/ habilitar auto-invoke. Sem motor próprio. | `prd.md`+`addendum.md`, `.decision-log.md`, `brainstorming-session-*.md`, `project-context.md`, `spec-{slug}.md` (900-1600 tok), `sprint-status.yaml` | Halt-at-checkpoint; multi-goal gate (split S/K); version-control sanity gate; resume gate; `required=true` no catálogo = hard gate | Delegada ao harness. Research como subagent dentro do Discovery por default. Sem hooks/cron. | 100% arquivos versionáveis: `.decision-log.md` (canônico, append **durante** a conversa), frontmatter `status`, `project-scan-report.json` |
| **OpenSpec** (1.3.x) | Slash `/opsx:*` primário; description-matching afirmado mas mecânica não documentada (elo fraco). Inteligência de próximo-passo na CLI (`status --json`). | `specs/<cap>/spec.md` (verdade), `changes/<id>/{proposal,design,tasks,delta-specs}`, `changes/archive/<data-id>/` | `propose` para quando deps `done`; `explore` NUNCA implementa; nunca auto-seleciona change ambíguo (pergunta) | Disparo (slash/description) + condução via CLI state machine (topological sort + existência de arquivo). Acopla a binário Node. | Estado = filesystem (existência de artefato). `specs/` = verdade viva via merge de delta. `archive` preserva o PORQUÊ. |
| **Spec Kit v0.9.0** | ZERO auto-trigger: tudo slash manual (`/speckit.*`). "hooks" só fazem o agente IMPRIMIR `EXECUTE_COMMAND` como texto. | `.specify/memory/constitution.md`, `specs/<NNN>/{spec,plan,research,data-model,tasks}.md`, `checklists/*.md` | `/analyze` read-only (CRITICAL antes de implement); `/implement` para em checklist incompleto; max 3 perguntas no `/specify` | Praticamente inexistente. handoffs = botões de sugestão; hooks = texto. | 100% arquivos: `constitution.md`, cadeia `specs/<feature>/` |
| **Superpowers v5.1.0** | **Hook SessionStart** injeta bootstrap `using-superpowers` integral a cada sessão (matcher `startup\|clear\|compact`). NÃO confia em description nativa. Encadeia via `REQUIRED SUB-SKILL`. | `docs/superpowers/specs/*-design.md`, `plans/*.md`, `TodoWrite` efêmero, reviews de subagente (não persistidos) | brainstorming HARD-GATE (design aprovado antes de código, em TODO projeto); verification-before-completion Iron Law; para em BLOCKED | Hook bash único detecta `CLAUDE_PLUGIN_ROOT`/`CURSOR`/`COPILOT` e emite o contexto certo. Subagentes via Task. **Sem o hook, skills são peso morto.** | Sem memória durável de 1ª classe. Estado = `TodoWrite` efêmero + 2 docs git. Subagentes NUNCA herdam contexto. |
| **GSD** (gsd-core/redux) | Comando explícito `/gsd-progress --next --auto` (auto-chaining) + hooks (SessionStart, PostToolUse) em `settings.json`. NÃO description-matching. | `PROJECT/REQUIREMENTS/ROADMAP/STATE/CONTEXT.md`, `.planning/phases/<N>/`, `.planning/codebase/` (7 docs brownfield) | para em plan failure; auto mode para em grey-area/blockers; gate UAT antes de done; `--force` bypassa (anti-padrão) | Auto-chaining + hooks. Helper determinístico `gsd-tools.cjs` injeta estado via `INIT=$(node ...)`. Portabilidade por **instalador** que converte frontmatter. | Markdown versionado git (`.planning/`). (gsd-pi usa SQLite, NÃO portável — não confundir.) |
| **Claude Code** (harness, ~2026) | Skills model-invoked: `description` (cap **1.536 chars** no listing) injetada todo turno como classificador; Claude carrega o corpo sozinho. Auto-trigger NÃO garantido (budget ~1% da janela). | `SKILL.md`, `CLAUDE.md`/`.claude/rules/*.md`, auto-memory `MEMORY.md`+topics, subagent `.md`, `settings.json`, plugin `.claude-plugin/` | `disable-model-invocation:true` (só `/comando`); **PreToolUse hook = único enforcement determinístico**; budget overflow dropa descriptions (parada acidental) | Skills auto-disparam por description + reforço por hooks (~28 eventos). Subagents auto-delegados. Sem cron nativo. SDK pré-1.0. | Dois sistemas: `CLAUDE.md` (humano, integral) + auto-memory (`MEMORY.md` ~200 linhas/25KB startup, por-repo git, machine-local). |
| **OpenAI Codex** (CLI v0.136.0) | Auto-trigger IMPLÍCITO por description (`allow_implicit_invocation:true` default). Skills em `.agents/skills` (NÃO `.claude/skills`). Lista capada ~2%/8000 chars. NÃO server-side. | `SKILL.md` em `.agents/skills/`, `agents/openai.yaml`, `AGENTS.md`, `config.toml`, `hooks.json`, memories SQLite | lista skills truncada ~8000 chars; config só se "trusted"; `AGENTS.md` para no git root; `project_doc_max_bytes` 32KiB | Description-matching implícito + hooks executados pelo HARNESS (`exit 2` bloqueia). Só **command hooks** funcionam hoje. Bug: SessionStart+UserPromptSubmit simultâneos no 1º turno (#15266). | Nativa: GLOBAL, automática, SQLite (mudou de arquivos em v0.135.0), não-editável. NÃO serve p/ estado per-card/per-workspace. |

### O que emprestar / evitar (por fonte)

**BMAD** — *Emprestar:* `.decision-log.md` append-only durante a conversa; track quick-vs-full por **intent** (quick-dev 900-1600 tok sem PRD); discovery low-ceremony ("length scales with stakes"); research como subagent dentro do Discovery; `document-project`+`generate-project-context` (regras não-óbvias) sob demanda escopado à área do card. *Evitar:* personas teatrais (Mary, Quinn) — emprestar separação como **fases**, não personagens; hierarquia `_bmad/` pesada; Python no caminho quente; step-files micro-fragmentados + "NEVER skip steps"; greeting ritual; `document-project` obrigatório antes de planejar todo card.

**OpenSpec** — *Emprestar:* delta spec `ADDED/MODIFIED/REMOVED/RENAMED` (cidadão de 1ª classe brownfield); two-folder `specs/` (verdade) vs `changes/` (proposta isolada); ciclo anti-drift `propose→apply→archive`; modo `explore` como **postura** (thinking-partner que NUNCA implementa). *Evitar:* slash-first como gatilho primário; acoplar a binário CLI Node externo; cerimônia de 4 artefatos para card pequeno; spec drift não-reconciliado (construir reconciliação própria).

**Spec Kit** — *Emprestar:* `/analyze` como gate de consistência **barato e read-only** (6 passes, severidade CRITICAL/HIGH/MEDIUM/LOW, não escreve, não remedia sem pedir); `constitution.md` como princípios fixos referenciados por todas as fases. *Evitar:* caminho "full" de 8 comandos manuais; ZERO auto-trigger real; brownfield greenfield-first (sem fase "entender o que existe"); um-repo-uma-instância (`.specify` prioriza sobre git toplevel = oposto do workspace umbrella).

**Superpowers** — *Emprestar:* **Hook SessionStart injetando bootstrap integral** (mecanismo REAL de auto-trigger, portável via 1 script bash que detecta o harness); regra do 1% + tabela de Red Flags anti-racionalização; encadeamento via `REQUIRED SUB-SKILL`; verification-before-completion (Iron Law, claim→prova); subagent-driven (fresco por task, nunca herda contexto); CSO (`description` = SÓ quando usar, nunca o workflow); "never fight the harness". *Evitar:* confiar em description-matching nativo sozinho; brownfield como afterthought; `TodoWrite` como memória durável; verbosidade coercitiva (CAPS) que briga com a precedência do usuário — emprestar mecanismo, não tom; TDD universal.

**GSD** — *Emprestar:* estado durável em arquivos versionados git (não DB); "deterministic logic belongs in code, not prompts" (helper injeta estado via `INIT=$(node ...)`); `map-codebase` brownfield ANTES de planejar; auto-chaining até gate; comunicação entre agents só via arquivos; instalador que converte frontmatter de fonte única. *Evitar:* explosão de ~67 comandos slash; acoplar ao Pi SDK (SQLite-as-truth, não portável); modo `--force` que bypassa gates como default.

**Práticas brownfield + memória + doc-grounding** — *Emprestar:* reuso forçado por regra ("busca função existente antes de criar"); leitura mecânica de dependências + micro-spec do ponto de modificação; **Phase 0 Research** (subagent isolado devolve resumo destilado, grava `.cairn/research/<lib>.md` reusável); aterrar na **versão do lockfile**, não a mais nova; memória-como-claim datada com proveniência; regra always-on no AGENTS.md p/ doc oficial antes de codar lib nova. *Evitar:* Specification Theater / AI-spec bloat; confiar no auto-compact (lossy — preferir snapshot intencional); Context7 como única fonte (hospedado, sem cache); `llms.txt` como canal garantido (não adotado por crawlers); "description trap" (description longa = agente pula o corpo).

### Desenho das 3 etapas de primeira classe

A decisão e o desenho operacional (brainstorm hard-gate, Phase 0 research, doc-grounding na
versão do lockfile) vivem nos donos: Decision 6
(`docs/DECISIONS.md`) e
`plugins/cairn/skills/cairn/references/research.md`. Esta pesquisa sustenta apenas a evidência por
trás deles — ver "O que emprestar / evitar" (Superpowers, BMAD, práticas brownfield) acima.

### Riscos abertos

1. Auto-trigger no Codex é o elo mais fraco e menos verificado: description-matching é probabilístico (não server-side) e command hooks repo-local podem não disparar em sessões interativas (#17532). Validar empiricamente (Codex primeiro) ANTES de travar o design — incluindo ordem instável SessionStart→UserPromptSubmit (#15266) e colocação correta de hooks no `config.toml` (top-level, não sob `[features]`).
2. Memória nativa do Codex virou SQLite (v0.135.0) — qualquer plano que assuma ler/symlinkar arquivos está errado. Reforça: NÃO usar memória nativa como estado canônico.
3. Spec drift do OpenSpec é by-design e NÃO tem comando nativo de reconciliação em 2026. O passo de reconciliação spec↔código precisa ser construído do zero.
4. "Nenhum framework orquestra multi-repo (1 tarefa, 2+ repos)" é negativa ampla não exaustivamente verificada. A camada workspace umbrella é gap a construir; boundary HARD exige hooks/scripts, não prosa advisory.
5. AGENTS.md/CLAUDE.md são advisory, não enforcement. Gates de correção que importam só são duros via PreToolUse hook (Claude) / command hook `exit 2` (Codex).
6. Risco de cerimônia: empilhar brainstorm-gate + Phase 0 research + doc-grounding + delta spec + reconciliação pode recriar a cerimônia que queremos evitar em card pequeno. O gate de "quando um card merece spec" precisa ser default-leve (track por intent).

### Fontes

BMAD: github.com/bmad-code-org/BMAD-METHOD (`tools/installer/ide/platform-codes.yaml`, `CHANGELOG.md`, `src/bmm-skills/...`); mintlify.com/bmad-code-org/.../scale-adaptive-planning.
OpenSpec: github.com/Fission-AI/OpenSpec (`/releases`, `CHANGELOG.md`, `docs/concepts.md`, `src/core/templates/workflows/{sync-specs,explore}.ts`, `src/core/workspace/foundation.ts`, `discussions/169`, `adapters/codex.ts`).
Spec Kit: github.com/github/spec-kit (`templates/commands/analyze.md`, `scripts/bash/common.sh`, `integrations/claude/__init__.py`).
Superpowers: github.com/obra/superpowers (`CLAUDE.md`, `hooks/session-start`, `skills/{using-superpowers,brainstorming,verification-before-completion}/SKILL.md`, `references/codex-tools.md`); blog.fsck.com/2025/10/09/superpowers/.
GSD: github.com/open-gsd/get-shit-done-redux (`commands/gsd/{progress,map-codebase,execute-phase}.md`); deepwiki.com/gsd-build/gsd-2.
Claude Code: code.claude.com/docs/en/{skills,memory,hooks,sub-agents,worktrees,agent-sdk/migration-guide}; codecentric.de/.../anatomy-of-claude-code-workflows; ianlpaterson.com/blog/claude-code-memory-architecture.
Codex: developers.openai.com/codex/{skills,guides/agents-md,memories,config-advanced,plugins/build,custom-prompts}; github.com/openai/codex.
Práticas: epam.com/.../using-spec-kit-for-brownfield-codebase; martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html; dev.to/ac12644/...memory-systems-fault; llmstxt.org; github.com/upstash/context7.

---

## Part 2 — Context, tokens, portability, auto-trigger

Data: 2026-06-01. Frente 2 (contexto, eficiência de tokens, packaging/portabilidade,
auto-trigger, princípios). Destilado verificado; idioma pt-BR (rationale interno).

### Atualização oficial 2026-06-02

Rechecagem em docs oficiais Codex + Claude Code:

- Codex confirma que skills são o formato do workflow e plugins são a unidade instalável;
  a lista inicial de skills é limitada a ~2% do contexto ou 8.000 caracteres quando a janela
  é desconhecida. Implicação: `description` curta/front-loaded e `validate-cairn.mjs` continuam
  sendo P0, não polimento.
- Codex subagents são explícitos, paralelos e úteis para exploração/testes/logs/sumarização;
  docs avisam sobre custo maior e cuidado com workflows write-heavy. Implicação: manter
  subagentes como isolamento de pesquisa/review, não como paralelismo padrão de implementação.
- Codex hooks são oficiais e plugin-bundled hooks usam trust review; `PreToolUse` cobre
  Bash, `apply_patch`/Edit/Write e MCP por matcher, mas a prova local ainda manda. Implicação:
  continuar tratando Codex PreToolUse como documentado mas não publicado como gate provado até
  smoke local capturar o evento.
- Claude Code skills carregam o corpo só quando usadas e suportam `context: fork`; plugins
  namespacem skills. Implicação: não duplicar skill por harness, manter uma fonte e usar fork
  só para pesquisa/adversarial review quando vale o custo.
- Claude Code hooks seguem sendo o mecanismo determinístico para enforcement; skills e
  `CLAUDE.md` continuam sendo instrução, não trava.

Fontes oficiais: developers.openai.com/codex/{skills,hooks,subagents,plugins/build,changelog};
docs.anthropic.com/en/docs/claude-code/{skills,hooks-guide,sub-agents};
docs.anthropic.com/en/release-notes/claude-code.

### Estratégia de contexto

Contexto é recurso finito de alto sinal (Anthropic): performance degrada conforme a
janela enche e o modelo "esquece" instruções iniciais. **NÃO** ancorar isso em
"context rot arquitetural" nem no threshold "2500 tokens" — a Chroma diz explicitamente
que não explica o mecanismo, e os 2500 são só o ponto de recusa do Opus 4. O fato
empírico (degrada com tamanho; um único distractor já prejudica; prompt focado > prompt
completo) já justifica minimalismo.

Camadas do Cairn:
1. **Always-on** (custo em toda turn): `name`+`description` da skill + `AGENTS.md`/`CLAUDE.md`. Mínimo. Teste por linha: "remover isto faria errar?".
2. **On-trigger** (persiste pela sessão depois de carregado): corpo do `SKILL.md` (~90 linhas hoje, manter <500). Cada token compete pela sessão inteira.
3. **On-demand** (zero custo até ser lido): `references/*.md`. Ler só o reference do mode ativo, nunca todos.

Just-in-time retrieval codificado no passo **Observe**: `grep`/`glob`/`head` para mapear
repo brownfield em vez de carregar arquivos inteiros. Identificadores leves > pré-carregar.

Memória externa como note-taking portável: artefatos `.cairn/changes/<slug>/*.md`
(`plan.md`/`proof.md`) são o mecanismo de persistência entre sessões/compaction — NÃO
depender de `memory_20250818` ou `/compact` de um harness. Protocolo long-running: ao
iniciar, ler estado/progresso + `git log` antes de agir; ao encerrar, persistir progresso
e decisões. Pós-compaction, o Claude Code re-anexa só ~5.000 tokens de cada skill invocada
(budget combinado 25.000) — mais uma razão para corpo curto e estado em arquivo.

Atualização 2026-06-04 — `UserPromptSubmit` é um evento por prompt, não uma licença para
repetir contexto por prompt. Codex documenta que stdout do hook vira developer context;
Claude Code documenta que o evento sempre dispara e não aceita matcher. Tradução Cairn:
usar o evento como ponto de decisão barato, mas emitir só quando há active change novo/trocado
ou uma mudança de âncora já passou do gap mínimo. Isso alinha com contexto mínimo de alto sinal,
estado em arquivo e recuperação imediata via `SessionStart` em `compact|resume`.

### Táticas de eficiência de tokens

- Corpo do `SKILL.md` curto deliberadamente (<500 linhas; ~90 hoje está ótimo): em ambos harnesses o corpo acionado **persiste** na sessão — custo recorrente, não one-shot.
- Progressive disclosure one-level-deep: `SKILL.md → references/*.md` direto, NUNCA reference→reference (agente faz `head -100` e perde conteúdo).
- Table-of-contents no topo de qualquer reference >100 linhas (sobrevive a leitura parcial).
- Ler só o reference do mode ativo (os 5 modes já são progressive disclosure de processo).
- Just-in-time no Observe (`grep`/`glob`/`head`), identificadores leves.
- Scripts determinísticos > geração por token para parsing/validação/roteamento repetitivo: só o stdout consome tokens e o resultado é consistente entre harnesses. Marcar "Run script" (executar) vs "See script for reference" (ler).
- Prefixo de prompt estável p/ caching: parte estática (router, tabela de modes) primeiro e idêntica; estado variável por último. NÃO injetar timestamp/estado mutável cedo (quebra o cache). Caching é **opcional por harness** (Codex automático; Claude exige `cache_control` + estabilidade) — nunca acoplar o design base a isso.
- Subagentes SÓ para isolar contexto (research read-heavy, review adversarial fresco). NÃO paralelizar implementação de coding (Anthropic: multi-agente falha em coding/contexto compartilhado; ~15x tokens — ganho é saúde de contexto, não custo).
- Higiene operacional (advisory ao usuário): `/clear` entre tarefas não-relacionadas; após 2 correções falhas, sessão limpa + prompt melhor > sessão longa acumulada.
- NÃO tratar percentuais de benchmark da Anthropic (98.7% code-exec-MCP, etc.) como esperado para o workload do Cairn.

### Packaging de skills

Open standard (agentskills.io, 18-dez-2025): `plugins/cairn/skills/cairn/SKILL.md` + `references/`.
Limites oficiais: corpo <500 linhas / <5000 tokens; metadata `name`+`description` ~100 tokens; references zero custo até lidas.

Frontmatter **portável = só `name` + `description`**:
- `name`: max 64 chars, `[a-z0-9-]`, não inicia/termina com hífen, sem `--`, DEVE bater com o diretório (`cairn` OK), e **proibido conter `claude`/`anthropic`**.
- `description`: max 1024 chars (authoring).
- `when_to_use`: extensão Claude Code (Codex ignora); conta junto com `description` no cap de **listing 1536 chars** do Claude. Usar para exemplos pt-BR+en de descoberta probabilística. Runtime hooks não leem prompt text nem duplicam essa lógica.
- Campos Claude-only (`user-invocable`, `argument-hint`, `context`, `agent`) e Codex-only (`agents/openai.yaml`) ficam FORA do core portável.

`references/` por domínio mutuamente exclusivo, one-level-deep, TOC em >100 linhas.
`scripts/` determinísticos com "Run" vs "See ... for reference" explícito. Declarar
dependências. Validação CI: `skills-ref validate ./skill` (lib oficial). **NÃO** depender
de `validate_plugin.py` em `~/.codex/.../` para uso público (dev-only).

Higiene de conteúdo (Anthropic verbatim): terminologia consistente; sem info time-sensitive;
forward slashes; 1 default + escape hatch; scripts resolvem erros; sem voodoo constants.

### Blueprint de portabilidade

**UMA fonte de conteúdo + shims finos GERADOS no build por harness.** Nunca cópias
paralelas editadas à mão (slow drift = failure mode #1). Validar Codex primeiro.

Substrato comum (idêntico, zero diff): `skills/cairn/SKILL.md` + `references/`; manifest
aponta `skills: "./skills/"`. O core roda sem modificação nos dois.

Diferenças que o build precisa emitir:
1. **Manifesto:** `.codex-plugin/plugin.json` (existe) E `.claude-plugin/plugin.json` (FALTA — sem ele não instala no Claude). Schema quase idêntico. Gerar ambos de UM `plugin.manifest.json` canônico. REGRA: só o manifesto vai dentro de `.codex-plugin/`//`.claude-plugin/` — nunca commands/agents/skills/hooks ali.
2. **Marketplace/catálogo:** `.agents/plugins/marketplace.json` (Codex) E `.claude-plugin/marketplace.json` (Claude), ambos `source.path → ./plugins/cairn`.
3. **Skills standalone** (se ofertar sem plugin): Codex `.agents/skills/`; Claude `.claude/skills/`.
4. **Instrução raiz:** Codex lê `AGENTS.md` nativamente; Claude Code **NÃO** lê `AGENTS.md` (doc oficial; issue #6235) — gerar `CLAUDE.md` com import `@AGENTS.md` ou symlink. **Preferir geração/import a symlink** (Windows quebra symlink). NUNCA symlinkar `.claude/` inteiro. Manter enxuto (Codex trunca silenciosamente além de `project_doc_max_bytes` 32 KiB).
5. **Hook env var (correção crítica):** padronizar hooks em `${CLAUDE_PLUGIN_ROOT}` como
   variável cross-harness. Claude Code define essa var nativamente; Codex define
   `${PLUGIN_ROOT}`/`${PLUGIN_DATA}` como nomes nativos e também expõe
   `${CLAUDE_PLUGIN_ROOT}`/`${CLAUDE_PLUGIN_DATA}` por compatibilidade.
6. **Codex hooks:** flag canônica `[features] hooks=true` (`codex_hooks` é alias DEPRECATED). `PreToolUse` matcher filtra Bash, `apply_patch`, MCP tool names.

Check de paridade no validate script: os dois `plugin.json` batem em `name/version/description/skills`; `description` ≤1024 e comunica intenção/boundary cedo; nenhum diretório dentro de `.codex-plugin/`//`.claude-plugin/`; symlinks resolvem. Documentar que portabilidade é por GERAÇÃO e que instalação pública NÃO depende de nada em `~/.codex` ou `~/.claude` do autor.

### Auto-trigger

Model-invoked e probabilístico em AMBOS: o modelo só vê `name`+`description` (+`when_to_use`
no Claude). O corpo NÃO participa da decisão — investir 100% na `description`.

**Failure mode dominante** (issue #20986 + doc oficial): não é "não acha a skill", é o
modelo achar que já sabe fazer e EXECUTAR MANUALMENTE ignorando a skill. A fronteira
negativa "Do not X directly" é estruturalmente importante, não cosmética.

Estrutura vencedora da `description`: `[domínio/identidade] + [diretiva imperativa ALWAYS]
+ [fronteira negativa] + [exemplos mínimos de escopo]`. Rascunho atual (<1024 chars,
front-loaded):

> Routes brownfield software work to the lightest safe workflow. ALWAYS invoke when the user asks to build, change, fix, refactor, plan, investigate, or implement in an existing repo, or starts from a card/issue/link/screenshot/bug/rough idea. Do not start coding, planning, or speccing brownfield work directly without routing through Cairn first. Skip for pure Q&A with no repo work, one-off shell commands, or tasks owned by a more specific active skill.

Regras: **front-load** (caso de uso + fronteira negativa no início — sob pressão de budget a
description é truncada pelo fim); terceira pessoa; `when_to_use` pode listar exemplos pt-BR+en
para descoberta probabilística, mas runtime hooks não usam regex/keywords. Fronteira negativa
contra colisão com `analyze`/`product`/`harness`.

Controle de invocação: para o router autônomo, NÃO setar `disable-model-invocation` nem
`allow_implicit_invocation=false` — usar default nos dois. **Bug #22345:**
`disable-model-invocation` é ignorado para skills shipped via PLUGIN no Claude. Logo, gate
de side-effect (deploy/commit) NÃO deve confiar nesse campo no plugin — usar PreToolUse hook
determinístico ou skill standalone.

Números de ativação (~100% diretivo vs ~50-87% passivo) são de blogs de campo, atribuição
confusa, NÃO oficiais — tratar como **direção forte, nunca SLA**. A direção (3ª pessoa +
diretiva + especificidade) é oficial.

Ativação ≠ step-following: mesmo disparando, o modelo pode pular Observe/Classify/Verify.
Usar linguagem forte ("MUST", checklist copiável) só nos passos de prova/verificação.

**Medir antes de declarar confiável:** ≥10 prompts pt-BR/en que DEVEM disparar + ≥5
near-miss que NÃO devem (Q&A puro, "qual escolher"→analyze, "vale a pena"→product),
inspecionando se a tool Skill foi chamada nos logs, em Opus e Sonnet.

### Princípios (com fonte)

1. **Menor conjunto de tokens de alto sinal** — Anthropic, *Effective context engineering* ("find the smallest possible set of high-signal tokens"). → always-on minúsculo; detalhe pesado em references on-demand.
2. **Progressive disclosure em 3 camadas** — Anthropic Agent Skills + agentskills.io. → SKILL.md router mínimo; one-level-deep; TOC em >100 linhas.
3. **Auto-trigger de skill vive na description; runtime vive em sinais estruturais** — Anthropic best-practices + Codex docs. → description diretiva e fronteira negativa para descoberta; hooks não tratam palavra solta como verdade.
4. **Verificação é a trava do "done"** — Huang et al. arXiv:2310.01798; Reflexion (Shinn arXiv:2303.11366). Self-correction de raciocínio sem feedback externo não melhora e às vezes piora. → todo workflow de mutação termina com check executável; proibir auto-revisão introspectiva como prova.
5. **AGENTS.md/CLAUDE.md são advisory, não enforcement** — Claude Code best-practices ("Unlike CLAUDE.md... hooks are deterministic"). → gate duro via hook/execpolicy, sem acoplar setup pessoal ao pacote público.
6. **Config inchada faz o modelo IGNORAR instruções reais** — Claude Code best-practices. Estudo de 138 repos: AGENTS.md escrito à mão melhora sucesso ~4% e reduz bugs 35-55%; gerado por LLM PIORA. → gatilho always-on minúsculo, escrito à mão.
7. **Plan-before-execute em complexo, não em trivial** — Anthropic ("if you could describe the diff in one sentence, skip the plan"); Plan-and-Solve (Wang arXiv:2305.04091). → mode classifica por tamanho/risco; `direct` pula o plano.
8. **Portabilidade diverge só em packaging** — agentskills.io + plugin docs. → uma fonte + shims gerados; o core SKILL.md é padrão aberto comum.
9. **Subagentes para isolar contexto, nunca para paralelizar coding** — Anthropic *Multi-agent research system* (~15x tokens; reviewer adversarial só flagra correção/requisitos). → já é diretriz; restringir reviewer.
10. **Memória entre sessões via note-taking externo estruturado** — Anthropic *Effective harnesses for long-running agents*. → artefatos `.cairn/changes/<slug>/*.md` que sobrevivem a compaction; protocolo read-state-first / write-progress-last.

### Riscos abertos

1. Codex pode OMITIR a skill inteira do listing (com warning) se o ambiente tiver muitas skills — risco real de nunca disparar. Mitigar com description curta/front-loaded. No Claude o NOME sempre sobrevive.
2. Bug #22345: `disable-model-invocation` ignorado para skills via plugin no Claude — gating de side-effect via frontmatter não funciona hoje. Mitigar com PreToolUse hook ou skill standalone.
3. Drift de versão Codex: GPT-5.3-Codex RE-HABILITOU preâmbulos. NÃO codificar "Codex proíbe plano upfront" como verdade fixa.
4. Over-trigger: `ALWAYS invoke` pode roubar gatilho de `analyze`/`product`/`harness`. Exige fronteira negativa específica + dogfood de near-miss.
5. Step-following é problema separado da ativação — não se resolve só com a description.
6. `[confirm]` — números não verificados em fonte primária: resumo de subagente ~1-2k tokens; structured outputs 100% vs <40%; janela Codex 192k. (15x multi-agente CONFIRMADO.)

### Fontes

anthropic.com/engineering/{effective-context-engineering-for-ai-agents, equipping-agents...agent-skills, advanced-tool-use, code-execution-with-mcp, multi-agent-research-system, effective-harnesses-for-long-running-agents}; platform.claude.com/docs/.../{best-practices, context-editing, prompt-caching, message-batches}; code.claude.com/docs/en/{skills, best-practices, memory, plugins-reference, sub-agents}; claude.com/blog/context-management; agentskills.io/specification; developers.openai.com/codex/{skills, plugins/build, hooks, guides/agents-md}; developers.openai.com/api/docs/guides/{prompt-caching, structured-outputs}; developers.openai.com/cookbook/.../codex_prompting_guide; trychroma.com/research/context-rot; arxiv.org/abs/{2310.01798, 2303.11366}; arxiv 2305.04091; github.com/anthropics/claude-code/issues/{22345, 6235, 20986}.

---

## Part 3 — Evolution radar (state-of-practice source ledger)

Living source ledger for Cairn product evolution. Part 1 above is the agent-framework
comparison; this Part keeps the broader state of practice in view.

Update when a Cairn change relies on external methodology, current AI evidence, or a competitor
signal. Keep entries short and dated. Each review should produce `borrow / adapt / avoid / defer`,
not a new ceremony by default.

### Aperture Rule

For methodology changes, choose 2-4 lanes and include at least one non-agent lane. Rotate lanes
across changes unless fresh evidence makes the same lane load-bearing again.

### Source Ledger

| Lane | Source | Last review | Cairn use |
| --- | --- | --- | --- |
| AI delivery evidence | [DORA 2026 Gen AI report](https://dora.dev/ai/gen-ai-report/) | 2026-06-04 | Treat AI as an amplifier of system quality; pair usage with governance, feedback loops, proof, and stability signals before claiming speed. |
| AI productivity evidence | [METR 2026 uplift update](https://metr.org/blog/2026-02-24-uplift-update/) + [AI usage survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) | 2026-06-04 | Separate speed from value, treat early-2025 results as stale context, and triangulate dogfood, reviewer reports, and runtime proof. |
| DevEx measurement | [SPACE framework](https://queue.acm.org/detail.cfm?id=3454124) + [DevEx framework](https://queue.acm.org/detail.cfm?id=3595878) | 2026-06-04 | Avoid one-metric productivity theater; evaluate feedback loops, cognitive load, flow, performance, collaboration, and satisfaction only when useful. |
| Agile principles | [Agile Manifesto principles](https://agilemanifesto.org/principles) | 2026-06-03 | Keep working software/proof, simplicity, sustainable pace, and regular reflection as constraints. |
| Flow systems | [The Kanban Guide](https://kanbanguides.org/the-kanban-guide/) | 2026-06-03 | Use explicit workflow definitions and flow signals; do not create a heavyweight board inside Cairn. |
| Lean quality systems | [Toyota Production System](https://global.toyota/en/company/vision-and-philosophy/production-system/index.html) | 2026-06-04 | Borrow jidoka and kaizen as operational pressure: stop on abnormality, fix context after surprise, and improve the system, not the blame story. |
| Product shaping | [Shape Up](https://basecamp.com/shapeup) | 2026-06-04 | Borrow appetite, shaping, rabbit-hole risk, and no-infinite-backlog pressure; adapt to small tracked changes. |
| Product discovery | [Jobs To Be Done](https://www.christenseninstitute.org/theory/jobs-to-be-done/) + [Lean Startup](https://theleanstartup.com/principles) + [Double Diamond](https://www.designcouncil.org.uk/our-resources/the-double-diamond/) | 2026-06-04 | Use only when the problem/user progress is unclear; convert to testable learning, not imagined user motivation. |
| Situational awareness | [Wardley Mapping FAQ](https://www.wardleymaps.com/faqs/what-is-wardley-mapping) | 2026-06-03 | Use mapping as a discovery lens for landscape/user/dependency clarity, not as a required artifact. |
| Domain boundaries | [Bounded Context](https://martinfowler.com/bliki/BoundedContext.html) + [Team Topologies](https://teamtopologies.com/key-concepts) | 2026-06-04 | Reinforce owner boundaries, cognitive-load limits, and subagents as enabling/review roles rather than default swarms. |
| Delivery and test strategy | [DORA continuous delivery](https://dora.dev/capabilities/continuous-delivery/) + [test automation](https://dora.dev/capabilities/test-automation/) | 2026-06-04 | Match proof to deployability and claim scope; do not use narrow checks for release/runtime claims. |
| Security and threat modeling | [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) | 2026-06-04 | Apply to auth, data, MCP, multi-agent, customer-visible, and trust-boundary changes; keep it proportional. |
| Agent design | [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | 2026-06-03 | Prefer simple workflows before agent swarms; add orchestration only when proof shows the simpler loop fails. |
| Agent planning/proof | [OpenAI Cookbook: PLANS.md for multi-hour problem solving](https://developers.openai.com/cookbook/articles/codex_exec_plans) | 2026-06-03 | Use self-contained plans for long work; keep proof tied to actual task outcomes. |
| Framework competitors | Cairn framework comparison (Part 1 above) + [OpenSpec workflows](https://github.com/Fission-AI/OpenSpec/blob/main/docs/workflows.md) | 2026-06-04 | Treat BMAD/OpenSpec/Spec Kit/Superpowers as one lane, not the boundary of research; borrow action/state lifecycle without slash-first ceremony. |
| Method synthesis | [Cairn Proofflow](METHODOLOGY.md) + [deep dive](METHODOLOGY_DEEP_DIVE.md) | 2026-06-04 | Name the methodology, keep runtime mechanisms in existing owners, and enforce only structural facts. |

### Translation Template

Use this in the active change or decision log when a source matters:

| Source | Borrow | Adapt | Avoid | Defer |
| --- | --- | --- | --- | --- |
| `<source>` | `<what transfers cleanly>` | `<what needs Cairn constraints>` | `<what would add ceremony or false certainty>` | `<what needs real dogfood first>` |

### Open Watchlist

- Whether 2026 AI productivity studies reverse, narrow, or confirm the 2025 brownfield caution.
- Whether Codex/Claude add deterministic skill-routing or richer hook context that makes current
  Stop/PreToolUse compromises stale.
- Whether context-engineering evidence changes the current "lazy references over one huge skill"
  budget rule.
- Whether real multi-repo Cairn dogfood exposes coordination pressure that docs alone cannot catch.
