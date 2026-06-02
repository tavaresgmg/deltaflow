# Pesquisa: Contexto, Tokens, Portabilidade e Auto-trigger

Data: 2026-06-01. Frente 2 (contexto, eficiência de tokens, packaging/portabilidade,
auto-trigger, princípios). Destilado verificado; idioma pt-BR (rationale interno).

## Estratégia de contexto

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

## Táticas de eficiência de tokens

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

## Packaging de skills

Open standard (agentskills.io, 18-dez-2025): `plugins/cairn/skills/cairn/SKILL.md` + `references/`.
Limites oficiais: corpo <500 linhas / <5000 tokens; metadata `name`+`description` ~100 tokens; references zero custo até lidas.

Frontmatter **portável = só `name` + `description`**:
- `name`: max 64 chars, `[a-z0-9-]`, não inicia/termina com hífen, sem `--`, DEVE bater com o diretório (`cairn` OK), e **proibido conter `claude`/`anthropic`**.
- `description`: max 1024 chars (authoring).
- `when_to_use`: extensão Claude Code (Codex ignora); conta junto com `description` no cap de **listing 1536 chars** do Claude. Usar para trigger phrases pt-BR+en, MAS duplicar as mesmas trigger words DENTRO da `description` (ambos harnesses leem `description`; só o Claude lê `when_to_use`).
- Campos Claude-only (`user-invocable`, `argument-hint`, `context`, `agent`) e Codex-only (`agents/openai.yaml`) ficam FORA do core portável.

`references/` por domínio mutuamente exclusivo, one-level-deep, TOC em >100 linhas.
`scripts/` determinísticos com "Run" vs "See ... for reference" explícito. Declarar
dependências. Validação CI: `skills-ref validate ./skill` (lib oficial). **NÃO** depender
de `validate_plugin.py` em `~/.codex/.../` para uso público (dev-only).

Higiene de conteúdo (Anthropic verbatim): terminologia consistente; sem info time-sensitive;
forward slashes; 1 default + escape hatch; scripts resolvem erros; sem voodoo constants.

## Blueprint de portabilidade

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

Check de paridade no validate script: os dois `plugin.json` batem em `name/version/description/skills`; `description` ≤1024 e trigger words nos primeiros ~250 chars; nenhum diretório dentro de `.codex-plugin/`//`.claude-plugin/`; symlinks resolvem. Documentar que portabilidade é por GERAÇÃO e que instalação pública NÃO depende de nada em `~/.codex` ou `~/.claude` do autor.

## Auto-trigger

Model-invoked e probabilístico em AMBOS: o modelo só vê `name`+`description` (+`when_to_use`
no Claude). O corpo NÃO participa da decisão — investir 100% na `description`.

**Failure mode dominante** (issue #20986 + doc oficial): não é "não acha a skill", é o
modelo achar que já sabe fazer e EXECUTAR MANUALMENTE ignorando a skill. A fronteira
negativa "Do not X directly" é estruturalmente importante, não cosmética.

Estrutura vencedora da `description`: `[domínio/identidade] + [diretiva imperativa ALWAYS]
+ [trigger phrases concretas que o usuário diz] + [fronteira negativa]`. Rascunho atual
(<1024 chars, front-loaded):

> Routes brownfield software work to the lightest safe workflow. ALWAYS invoke when the user asks to build, change, fix, refactor, plan, investigate, or implement in an existing repo, or starts from a card/issue/link/screenshot/bug/rough idea. Do not start coding, planning, or speccing brownfield work directly without routing through Cairn first. Skip for pure Q&A with no repo work, one-off shell commands, or tasks owned by a more specific active skill.

Regras: **front-load** (caso de uso + trigger words no início — sob pressão de budget a
description é truncada pelo fim); terceira pessoa; `when_to_use` com trigger phrases pt-BR+en
e keywords duplicadas na `description`; fronteira negativa contra colisão com `analyze`/`product`/`harness`.

Controle de invocação: para o router autônomo, NÃO setar `disable-model-invocation` nem
`allow_implicit_invocation=false` — usar default nos dois. **Bug #22345:**
`disable-model-invocation` é ignorado para skills shipped via PLUGIN no Claude. Logo, gate
de side-effect (deploy/commit) NÃO deve confiar nesse campo no plugin — usar PreToolUse hook
determinístico ou skill standalone.

Números de ativação (~100% diretivo vs ~50-87% passivo) são de blogs de campo, atribuição
confusa, NÃO oficiais — tratar como **direção forte, nunca SLA**. A direção (3ª pessoa +
keywords + diretiva + especificidade) é oficial.

Ativação ≠ step-following: mesmo disparando, o modelo pode pular Observe/Classify/Verify.
Usar linguagem forte ("MUST", checklist copiável) só nos passos de prova/verificação.

**Medir antes de declarar confiável:** ≥10 prompts pt-BR/en que DEVEM disparar + ≥5
near-miss que NÃO devem (Q&A puro, "qual escolher"→analyze, "vale a pena"→product),
inspecionando se a tool Skill foi chamada nos logs, em Opus e Sonnet.

## Princípios (com fonte)

1. **Menor conjunto de tokens de alto sinal** — Anthropic, *Effective context engineering* ("find the smallest possible set of high-signal tokens"). → always-on minúsculo; detalhe pesado em references on-demand.
2. **Progressive disclosure em 3 camadas** — Anthropic Agent Skills + agentskills.io. → SKILL.md router mínimo; one-level-deep; TOC em >100 linhas.
3. **Auto-trigger vive 100% na description** — Anthropic best-practices + Codex docs. → description diretiva, trigger words front-loaded, fronteira negativa.
4. **Verificação é a trava do "done"** — Huang et al. arXiv:2310.01798; Reflexion (Shinn arXiv:2303.11366). Self-correction de raciocínio sem feedback externo não melhora e às vezes piora. → todo workflow de mutação termina com check executável; proibir auto-revisão introspectiva como prova.
5. **AGENTS.md/CLAUDE.md são advisory, não enforcement** — Claude Code best-practices ("Unlike CLAUDE.md... hooks are deterministic"). → gate duro via hook/execpolicy, sem acoplar setup pessoal ao pacote público.
6. **Config inchada faz o modelo IGNORAR instruções reais** — Claude Code best-practices. Estudo de 138 repos: AGENTS.md escrito à mão melhora sucesso ~4% e reduz bugs 35-55%; gerado por LLM PIORA. → gatilho always-on minúsculo, escrito à mão.
7. **Plan-before-execute em complexo, não em trivial** — Anthropic ("if you could describe the diff in one sentence, skip the plan"); Plan-and-Solve (Wang arXiv:2305.04091). → mode classifica por tamanho/risco; `direct` pula o plano.
8. **Portabilidade diverge só em packaging** — agentskills.io + plugin docs. → uma fonte + shims gerados; o core SKILL.md é padrão aberto comum.
9. **Subagentes para isolar contexto, nunca para paralelizar coding** — Anthropic *Multi-agent research system* (~15x tokens; reviewer adversarial só flagra correção/requisitos). → já é diretriz; restringir reviewer.
10. **Memória entre sessões via note-taking externo estruturado** — Anthropic *Effective harnesses for long-running agents*. → artefatos `.cairn/changes/<slug>/*.md` que sobrevivem a compaction; protocolo read-state-first / write-progress-last.

## Riscos abertos

1. Codex pode OMITIR a skill inteira do listing (com warning) se o ambiente tiver muitas skills — risco real de nunca disparar. Mitigar com description curta/front-loaded. No Claude o NOME sempre sobrevive.
2. Bug #22345: `disable-model-invocation` ignorado para skills via plugin no Claude — gating de side-effect via frontmatter não funciona hoje. Mitigar com PreToolUse hook ou skill standalone.
3. Drift de versão Codex: GPT-5.3-Codex RE-HABILITOU preâmbulos. NÃO codificar "Codex proíbe plano upfront" como verdade fixa.
4. Over-trigger: `ALWAYS invoke` pode roubar gatilho de `analyze`/`product`/`harness`. Exige fronteira negativa específica + evals de near-miss.
5. Step-following é problema separado da ativação — não se resolve só com a description.
6. `[confirm]` — números não verificados em fonte primária: resumo de subagente ~1-2k tokens; structured outputs 100% vs <40%; janela Codex 192k. (15x multi-agente CONFIRMADO.)

## Fontes

anthropic.com/engineering/{effective-context-engineering-for-ai-agents, equipping-agents...agent-skills, advanced-tool-use, code-execution-with-mcp, multi-agent-research-system, effective-harnesses-for-long-running-agents}; platform.claude.com/docs/.../{best-practices, context-editing, prompt-caching, message-batches}; code.claude.com/docs/en/{skills, best-practices, memory, plugins-reference, sub-agents}; claude.com/blog/context-management; agentskills.io/specification; developers.openai.com/codex/{skills, plugins/build, hooks, guides/agents-md}; developers.openai.com/api/docs/guides/{prompt-caching, structured-outputs}; developers.openai.com/cookbook/.../codex_prompting_guide; trychroma.com/research/context-rot; arxiv.org/abs/{2310.01798, 2303.11366}; arxiv 2305.04091; github.com/anthropics/claude-code/issues/{22345, 6235, 20986}.
