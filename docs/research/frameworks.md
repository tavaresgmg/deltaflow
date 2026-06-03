# Pesquisa: Frameworks e Harness

Data: 2026-06-01. Método: 2 workflows multi-agente (36 subagentes, ~2M tokens), com
verificação adversarial das alegações que sustentam decisões. Este documento é o
destilado da frente 1 (frameworks + harness + práticas). Idioma pt-BR por ser
rationale interno; ver `docs/decisions/` para as decisões derivadas.

Scope note (2026-06-03): this file is the agent-framework/harness lane only. Broader
software-methodology and state-of-practice tracking lives in `docs/research/evolution-radar.md`;
new Cairn methodology changes should start from `docs/development-workflow.md` and translate
sources into `borrow / adapt / avoid / defer` instead of re-running this same competitor set.

## 2026-06-03 current-source refresh: skill architecture

Question: is Cairn getting worse by concentrating too much behavior in one skill?

Finding: current evidence does not support a blind split. The installed plugin reports about
657 always-on tokens, while detailed references remain lazy-loaded. The stronger risk is not token
load; it is that one broad router can hide domain-specific gaps or selection failures. The right
next move is an eval-backed architecture audit, not a new skill tree by assumption.

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
  prompts in eval fixtures.
- Split only a narrow lens into a secondary skill if it beats the current baseline with no must-fire
  regression, no no-fire regression, and acceptable always-on/token cost.
- Use subagents for competitive research, adversarial review, long logs, and isolated domain
  inspection. Do not use subagents for normal routing or as a substitute for local proof.

## Matriz comparativa

| Sistema | Gatilho | Artefatos | Stop conditions | Autonomia | Memória |
| --- | --- | --- | --- | --- | --- |
| **BMAD v6.8.0** (Skills Architecture) | Description-matching nativo do harness (`Use when user says X`); removeram `disable-model-invocation` p/ habilitar auto-invoke. Sem motor próprio. | `prd.md`+`addendum.md`, `.decision-log.md`, `brainstorming-session-*.md`, `project-context.md`, `spec-{slug}.md` (900-1600 tok), `sprint-status.yaml` | Halt-at-checkpoint; multi-goal gate (split S/K); version-control sanity gate; resume gate; `required=true` no catálogo = hard gate | Delegada ao harness. Research como subagent dentro do Discovery por default. Sem hooks/cron. | 100% arquivos versionáveis: `.decision-log.md` (canônico, append **durante** a conversa), frontmatter `status`, `project-scan-report.json` |
| **OpenSpec** (1.3.x) | Slash `/opsx:*` primário; description-matching afirmado mas mecânica não documentada (elo fraco). Inteligência de próximo-passo na CLI (`status --json`). | `specs/<cap>/spec.md` (verdade), `changes/<id>/{proposal,design,tasks,delta-specs}`, `changes/archive/<data-id>/` | `propose` para quando deps `done`; `explore` NUNCA implementa; nunca auto-seleciona change ambíguo (pergunta) | Disparo (slash/description) + condução via CLI state machine (topological sort + existência de arquivo). Acopla a binário Node. | Estado = filesystem (existência de artefato). `specs/` = verdade viva via merge de delta. `archive` preserva o PORQUÊ. |
| **Spec Kit v0.9.0** | ZERO auto-trigger: tudo slash manual (`/speckit.*`). "hooks" só fazem o agente IMPRIMIR `EXECUTE_COMMAND` como texto. | `.specify/memory/constitution.md`, `specs/<NNN>/{spec,plan,research,data-model,tasks}.md`, `checklists/*.md` | `/analyze` read-only (CRITICAL antes de implement); `/implement` para em checklist incompleto; max 3 perguntas no `/specify` | Praticamente inexistente. handoffs = botões de sugestão; hooks = texto. | 100% arquivos: `constitution.md`, cadeia `specs/<feature>/` |
| **Superpowers v5.1.0** | **Hook SessionStart** injeta bootstrap `using-superpowers` integral a cada sessão (matcher `startup\|clear\|compact`). NÃO confia em description nativa. Encadeia via `REQUIRED SUB-SKILL`. | `docs/superpowers/specs/*-design.md`, `plans/*.md`, `TodoWrite` efêmero, reviews de subagente (não persistidos) | brainstorming HARD-GATE (design aprovado antes de código, em TODO projeto); verification-before-completion Iron Law; para em BLOCKED | Hook bash único detecta `CLAUDE_PLUGIN_ROOT`/`CURSOR`/`COPILOT` e emite o contexto certo. Subagentes via Task. **Sem o hook, skills são peso morto.** | Sem memória durável de 1ª classe. Estado = `TodoWrite` efêmero + 2 docs git. Subagentes NUNCA herdam contexto. |
| **GSD** (gsd-core/redux) | Comando explícito `/gsd-progress --next --auto` (auto-chaining) + hooks (SessionStart, PostToolUse) em `settings.json`. NÃO description-matching. | `PROJECT/REQUIREMENTS/ROADMAP/STATE/CONTEXT.md`, `.planning/phases/<N>/`, `.planning/codebase/` (7 docs brownfield) | para em plan failure; auto mode para em grey-area/blockers; gate UAT antes de done; `--force` bypassa (anti-padrão) | Auto-chaining + hooks. Helper determinístico `gsd-tools.cjs` injeta estado via `INIT=$(node ...)`. Portabilidade por **instalador** que converte frontmatter. | Markdown versionado git (`.planning/`). (gsd-pi usa SQLite, NÃO portável — não confundir.) |
| **Claude Code** (harness, ~2026) | Skills model-invoked: `description` (cap **1.536 chars** no listing) injetada todo turno como classificador; Claude carrega o corpo sozinho. Auto-trigger NÃO garantido (budget ~1% da janela). | `SKILL.md`, `CLAUDE.md`/`.claude/rules/*.md`, auto-memory `MEMORY.md`+topics, subagent `.md`, `settings.json`, plugin `.claude-plugin/` | `disable-model-invocation:true` (só `/comando`); **PreToolUse hook = único enforcement determinístico**; budget overflow dropa descriptions (parada acidental) | Skills auto-disparam por description + reforço por hooks (~28 eventos). Subagents auto-delegados. Sem cron nativo. SDK pré-1.0. | Dois sistemas: `CLAUDE.md` (humano, integral) + auto-memory (`MEMORY.md` ~200 linhas/25KB startup, por-repo git, machine-local). |
| **OpenAI Codex** (CLI v0.136.0) | Auto-trigger IMPLÍCITO por description (`allow_implicit_invocation:true` default). Skills em `.agents/skills` (NÃO `.claude/skills`). Lista capada ~2%/8000 chars. NÃO server-side. | `SKILL.md` em `.agents/skills/`, `agents/openai.yaml`, `AGENTS.md`, `config.toml`, `hooks.json`, memories SQLite | lista skills truncada ~8000 chars; config só se "trusted"; `AGENTS.md` para no git root; `project_doc_max_bytes` 32KiB | Description-matching implícito + hooks executados pelo HARNESS (`exit 2` bloqueia). Só **command hooks** funcionam hoje. Bug: SessionStart+UserPromptSubmit simultâneos no 1º turno (#15266). | Nativa: GLOBAL, automática, SQLite (mudou de arquivos em v0.135.0), não-editável. NÃO serve p/ estado per-card/per-workspace. |

## O que emprestar / evitar (por fonte)

**BMAD** — *Emprestar:* `.decision-log.md` append-only durante a conversa; track quick-vs-full por **intent** (quick-dev 900-1600 tok sem PRD); discovery low-ceremony ("length scales with stakes"); research como subagent dentro do Discovery; `document-project`+`generate-project-context` (regras não-óbvias) sob demanda escopado à área do card. *Evitar:* personas teatrais (Mary, Quinn) — emprestar separação como **fases**, não personagens; hierarquia `_bmad/` pesada; Python no caminho quente; step-files micro-fragmentados + "NEVER skip steps"; greeting ritual; `document-project` obrigatório antes de planejar todo card.

**OpenSpec** — *Emprestar:* delta spec `ADDED/MODIFIED/REMOVED/RENAMED` (cidadão de 1ª classe brownfield); two-folder `specs/` (verdade) vs `changes/` (proposta isolada); ciclo anti-drift `propose→apply→archive`; modo `explore` como **postura** (thinking-partner que NUNCA implementa). *Evitar:* slash-first como gatilho primário; acoplar a binário CLI Node externo; cerimônia de 4 artefatos para card pequeno; spec drift não-reconciliado (construir reconciliação própria).

**Spec Kit** — *Emprestar:* `/analyze` como gate de consistência **barato e read-only** (6 passes, severidade CRITICAL/HIGH/MEDIUM/LOW, não escreve, não remedia sem pedir); `constitution.md` como princípios fixos referenciados por todas as fases. *Evitar:* caminho "full" de 8 comandos manuais; ZERO auto-trigger real; brownfield greenfield-first (sem fase "entender o que existe"); um-repo-uma-instância (`.specify` prioriza sobre git toplevel = oposto do workspace umbrella).

**Superpowers** — *Emprestar:* **Hook SessionStart injetando bootstrap integral** (mecanismo REAL de auto-trigger, portável via 1 script bash que detecta o harness); regra do 1% + tabela de Red Flags anti-racionalização; encadeamento via `REQUIRED SUB-SKILL`; verification-before-completion (Iron Law, claim→prova); subagent-driven (fresco por task, nunca herda contexto); CSO (`description` = SÓ quando usar, nunca o workflow); "never fight the harness". *Evitar:* confiar em description-matching nativo sozinho; brownfield como afterthought; `TodoWrite` como memória durável; verbosidade coercitiva (CAPS) que briga com a precedência do usuário — emprestar mecanismo, não tom; TDD universal.

**GSD** — *Emprestar:* estado durável em arquivos versionados git (não DB); "deterministic logic belongs in code, not prompts" (helper injeta estado via `INIT=$(node ...)`); `map-codebase` brownfield ANTES de planejar; auto-chaining até gate; comunicação entre agents só via arquivos; instalador que converte frontmatter de fonte única. *Evitar:* explosão de ~67 comandos slash; acoplar ao Pi SDK (SQLite-as-truth, não portável); modo `--force` que bypassa gates como default.

**Práticas brownfield + memória + doc-grounding** — *Emprestar:* reuso forçado por regra ("busca função existente antes de criar"); leitura mecânica de dependências + micro-spec do ponto de modificação; **Phase 0 Research** (subagent isolado devolve resumo destilado, grava `.work/research/<lib>.md` reusável); aterrar na **versão do lockfile**, não a mais nova; memória-como-claim datada com proveniência; regra always-on no AGENTS.md p/ doc oficial antes de codar lib nova. *Evitar:* Specification Theater / AI-spec bloat; confiar no auto-compact (lossy — preferir snapshot intencional); Context7 como única fonte (hospedado, sem cache); `llms.txt` como canal garantido (não adotado por crawlers); "description trap" (description longa = agente pula o corpo).

## Desenho das 3 etapas de primeira classe

- **Brainstorm (hard-gate):** ao receber o card, entra em brainstorm ANTES de qualquer código — explora contexto, uma pergunta por vez, 2-3 abordagens com recomendação e trade-off nomeado, salva `brainstorm.md`, self-review, e só então avança. Design pode ser curto (escala com stakes). Disparado pelo bootstrap do hook, não manual. No Claude, rodar como subagent isolado (read-only) p/ não poluir o contexto principal.
- **Pesquisa web (Phase 0):** subagent em contexto isolado (WebFetch/WebSearch) devolve só resumo destilado e GRAVA `.work/<id>/research/<topic>.md` versionado e reusável. Dispara dentro do brainstorm quando há unknown técnico / versão de framework / escolha de lib / API externa. Escada de evidência: live > repo > doc oficial > web primária. Stop: confirmado por fonte primária E bate com o estado local. NÃO disparar para lib trivial.
- **Doc oficial (regra always-on):** "antes de codar contra lib/ferramenta/linguagem NOVA ou não-familiar, aterre em doc oficial." Context7 só como atalho oportunista, não única fonte. Duas faces brownfield: (a) doc da lib NOVA do card; (b) doc da lib JÁ usada **na versão do lockfile**, não a mais nova.

## Riscos abertos

1. Auto-trigger no Codex é o elo mais fraco e menos verificado: description-matching é probabilístico (não server-side) e command hooks repo-local podem não disparar em sessões interativas (#17532). Validar empiricamente (Codex primeiro) ANTES de travar o design — incluindo ordem instável SessionStart→UserPromptSubmit (#15266) e colocação correta de hooks no `config.toml` (top-level, não sob `[features]`).
2. Memória nativa do Codex virou SQLite (v0.135.0) — qualquer plano que assuma ler/symlinkar arquivos está errado. Reforça: NÃO usar memória nativa como estado canônico.
3. Spec drift do OpenSpec é by-design e NÃO tem comando nativo de reconciliação em 2026. O passo de reconciliação spec↔código precisa ser construído do zero.
4. "Nenhum framework orquestra multi-repo (1 tarefa, 2+ repos)" é negativa ampla não exaustivamente verificada. A camada workspace umbrella é gap a construir; boundary HARD exige hooks/scripts, não prosa advisory.
5. AGENTS.md/CLAUDE.md são advisory, não enforcement. Gates de correção que importam só são duros via PreToolUse hook (Claude) / command hook `exit 2` (Codex).
6. Risco de cerimônia: empilhar brainstorm-gate + Phase 0 research + doc-grounding + delta spec + reconciliação pode recriar a cerimônia que queremos evitar em card pequeno. O gate de "quando um card merece spec" precisa ser default-leve (track por intent).

## Fontes

BMAD: github.com/bmad-code-org/BMAD-METHOD (`tools/installer/ide/platform-codes.yaml`, `CHANGELOG.md`, `src/bmm-skills/...`); mintlify.com/bmad-code-org/.../scale-adaptive-planning.
OpenSpec: github.com/Fission-AI/OpenSpec (`/releases`, `CHANGELOG.md`, `docs/concepts.md`, `src/core/templates/workflows/{sync-specs,explore}.ts`, `src/core/workspace/foundation.ts`, `discussions/169`, `adapters/codex.ts`).
Spec Kit: github.com/github/spec-kit (`templates/commands/analyze.md`, `scripts/bash/common.sh`, `integrations/claude/__init__.py`).
Superpowers: github.com/obra/superpowers (`CLAUDE.md`, `hooks/session-start`, `skills/{using-superpowers,brainstorming,verification-before-completion}/SKILL.md`, `references/codex-tools.md`); blog.fsck.com/2025/10/09/superpowers/.
GSD: github.com/open-gsd/get-shit-done-redux (`commands/gsd/{progress,map-codebase,execute-phase}.md`); deepwiki.com/gsd-build/gsd-2.
Claude Code: code.claude.com/docs/en/{skills,memory,hooks,sub-agents,worktrees,agent-sdk/migration-guide}; codecentric.de/.../anatomy-of-claude-code-workflows; ianlpaterson.com/blog/claude-code-memory-architecture.
Codex: developers.openai.com/codex/{skills,guides/agents-md,memories,config-advanced,plugins/build,custom-prompts}; github.com/openai/codex.
Práticas: epam.com/.../using-spec-kit-for-brownfield-codebase; martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html; dev.to/ac12644/...memory-systems-fault; llmstxt.org; github.com/upstash/context7.
