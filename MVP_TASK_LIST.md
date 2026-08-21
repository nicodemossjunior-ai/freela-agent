# Freela Agent - MVP Task List

Este documento sequencia a construcao do MVP a partir das especificacoes:

- `Freela_Agent_Sistem-Design.md`
- `Freela_Agent_Specification_Driven_Development.md`

## Objetivo do MVP

Construir um agente local que carregue um perfil tecnico, colete ou simule vagas da Upwork, normalize os dados, analise aderencia, gere score com justificativa e exporte as melhores oportunidades em Markdown e JSON.

## Decisoes iniciais

- Runtime: Node.js com TypeScript.
- Interface inicial: CLI local.
- Perfil: arquivo `data/profile.json`.
- Persistencia: SQLite, preparada para futura migracao para PostgreSQL.
- Saidas: `output/recommendations.md` e `output/recommendations.json`.
- Coleta inicial: mock/simulacao primeiro; integracao Upwork real ou semi-automatizada depois.
- IA: opcional no primeiro ciclo, com fallback de matching basico quando falhar.

## Fase 0 - Preparacao do projeto

- [x] Confirmar stack do MVP: Node.js + TypeScript + CLI.
- [x] Criar estrutura inicial de pastas:
  - `src/config`
  - `src/platforms/upwork`
  - `src/ai`
  - `src/scoring`
  - `src/storage`
  - `src/reports`
  - `data`
  - `output`
- [x] Criar `package.json` com scripts basicos:
  - `dev`
  - `build`
  - `start`
  - `test`
- [x] Configurar TypeScript.
- [ ] Configurar lint/format simples, se nao atrapalhar velocidade do MVP.
- [x] Criar `README.md` com objetivo, setup e comandos iniciais.
- [x] Preparar os documentos de especificacao e esta task list para versionamento.

Critério de pronto:

- O projeto compila um `src/main.ts` minimo.
- O comando principal roda localmente sem erro.

## Fase 1 - Perfil local e contratos de dominio

- [x] Criar `data/profile.example.json` com o perfil de referencia da especificacao.
- [x] Criar `data/profile.json` local para execucao inicial.
- [x] Implementar `src/config/loadProfile.ts`.
- [x] Validar campos obrigatorios do perfil:
  - `name`
  - `title`
  - `technologies`
  - `experienceYears`
  - `englishLevel`
  - `minimumHourlyRate`
  - `preferredJobTypes`
  - `avoid`
- [x] Exibir erro amigavel quando `profile.json` nao existir.
- [x] Listar campos faltantes quando o perfil estiver incompleto.
- [x] Criar contratos TypeScript:
  - `UserProfile`
  - `JobOpportunity`
  - `AiJobAnalysis`
  - `Recommendation`
  - `PlatformProvider`
- [x] Adicionar testes unitarios para carregamento e validacao do perfil.

Critério de pronto:

- O agente carrega o perfil antes de qualquer busca.
- Perfil invalido bloqueia a execucao com mensagem clara.

## Fase 2 - Mock Upwork e normalizacao

- [x] Criar fixtures/mocks de vagas Upwork com casos variados:
  - hourly
  - fixed price
  - budget ausente
  - senioridade ausente
  - skills explicitas
  - descricao com skills implicitas
  - vagas com red flags
- [x] Implementar `src/platforms/upwork/upwork.types.ts`.
- [x] Implementar `src/platforms/upwork/upwork.search.ts` em modo mock.
- [x] Implementar `src/platforms/upwork/upwork.parser.ts`.
- [x] Normalizar toda vaga para `JobOpportunity`.
- [x] Preencher campos ausentes com `unknown`, `null` ou array vazio.
- [x] Evitar duplicidade por `externalId` ou `url`.
- [x] Adicionar logs basicos de coleta:
  - quantidade buscada
  - quantidade normalizada
  - duplicidades ignoradas
  - falhas por vaga
- [x] Adicionar testes para parser e deduplicacao.

Critério de pronto:

- Uma execucao local consegue produzir uma lista normalizada de vagas mockadas da Upwork.
- Mudancas pequenas no formato do dado bruto nao quebram a aplicacao inteira.

## Fase 3 - Score inicial sem IA

- [x] Implementar `src/scoring/calculateScore.ts`.
- [x] Implementar componentes do score:
  - technology match: peso 40
  - seniority match: peso 20
  - budget match: peso 15
  - job type match: peso 15
  - quality signals: peso 10
  - red flag penalty
- [x] Implementar `src/scoring/explainScore.ts`.
- [x] Gerar justificativa textual para toda recomendacao.
- [x] Criar configuracao de score minimo.
- [x] Ocultar vagas abaixo do score minimo configurado.
- [x] Ordenar recomendacoes por score decrescente.
- [x] Adicionar testes unitarios para cenarios de score:
  - match forte
  - budget abaixo do minimo
  - tecnologia indesejada
  - senioridade baixa
  - vaga sem dados suficientes

Critério de pronto:

- Toda vaga recomendada tem score entre 0 e 100.
- Toda recomendacao tem justificativa textual.
- O ranking retorna Top N oportunidades ordenadas.

## Fase 4 - Relatorios Markdown e JSON

- [x] Implementar `src/reports/markdownReport.ts`.
- [x] Implementar `src/reports/jsonReport.ts`.
- [x] Criar diretorio `output` automaticamente quando nao existir.
- [x] Salvar Markdown em `output/recommendations.md`.
- [x] Salvar JSON em `output/recommendations.json`.
- [x] Incluir no Markdown:
  - titulo
  - score
  - plataforma
  - orcamento
  - link
  - resumo
  - motivos do match
  - pontos de atencao
- [x] Adicionar testes ou snapshot simples para o formato do relatorio.

Critério de pronto:

- Ao rodar o agente, o usuario consegue abrir os dois arquivos de saida e revisar as melhores oportunidades.

## Fase 5 - CLI local utilizavel

- [x] Implementar `src/main.ts` orquestrando o fluxo:
  - carregar perfil
  - buscar vagas
  - normalizar
  - calcular score
  - gerar ranking
  - exportar relatorios
- [x] Criar parametros de CLI:
  - `--profile`
  - `--limit`
  - `--min-score`
  - `--top`
  - `--mock`
- [x] Exibir resumo da execucao no terminal:
  - perfil carregado
  - vagas coletadas
  - vagas recomendadas
  - caminho dos relatorios
  - tempo total de execucao
- [x] Garantir tempo de execucao abaixo de 5 minutos no fluxo local.
- [x] Documentar exemplos de uso no `README.md`.

Critério de pronto:

- O MVP roda com um unico comando local.
- O usuario consegue revisar oportunidades em ate 5 minutos.

## Fase 6 - Persistencia local SQLite

- [x] Escolher biblioteca SQLite para Node.js.
- [x] Implementar `src/storage/db.ts`.
- [x] Criar schema inicial:
  - `profiles`
  - `jobs`
  - `recommendations`
  - `feedback`
- [x] Implementar `src/storage/repositories.ts`.
- [x] Salvar vagas normalizadas.
- [x] Salvar recomendacoes geradas.
- [x] Evitar duplicidade persistente por `platform + externalId` ou `url`.
- [x] Preparar nomes e tipos pensando em futura migracao para PostgreSQL.
- [x] Adicionar comando ou script simples para resetar banco local em desenvolvimento.

Critério de pronto:

- Execucoes repetidas reaproveitam historico local e nao duplicam vagas.

## Fase 7 - Feedback do usuario

- [ ] Definir status de feedback:
  - `interesting`
  - `ignored`
  - `applied`
- [ ] Permitir registrar feedback via CLI.
- [ ] Persistir feedback no SQLite.
- [ ] Exibir status de feedback nos relatorios quando existir.
- [ ] Usar feedback como sinal simples no score:
  - reduzir semelhantes a ignoradas
  - destacar semelhantes a interessantes/aplicadas

Critério de pronto:

- O usuario consegue marcar recomendacoes e esse historico afeta execucoes futuras de forma simples.

## Fase 8 - Enriquecimento com IA

- [ ] Criar `src/ai/prompts.ts` com o prompt base da especificacao.
- [ ] Criar `src/ai/analyzeJob.ts`.
- [ ] Definir provedor LLM configuravel por variavel de ambiente.
- [ ] Validar JSON retornado pela IA antes de usar.
- [ ] Retornar fallback seguro quando a IA falhar.
- [ ] Incorporar ao score:
  - `summary`
  - `requiredSkills`
  - `seniority`
  - `jobType`
  - `redFlags`
  - `positiveSignals`
- [ ] Registrar logs de falha da IA sem interromper a execucao.
- [ ] Adicionar testes com mock de resposta da IA.

Critério de pronto:

- O agente melhora resumo e justificativas com IA, mas continua funcionando sem IA.

## Fase 9 - Coleta Upwork real ou semi-automatizada

- [ ] Investigar forma menos agressiva e mais aceitavel de obter vagas da Upwork.
- [ ] Respeitar termos de uso e evitar scraping massivo.
- [ ] Implementar limite de vagas por execucao.
- [ ] Implementar tratamento de falhas de rede/parsing.
- [ ] Garantir que falha na Upwork nao derrube toda a aplicacao.
- [ ] Registrar logs basicos da coleta real.
- [ ] Manter modo mock para desenvolvimento e testes.

Critério de pronto:

- O agente consegue trazer oportunidades reais ou semi-automatizadas da Upwork com limite e tolerancia a falhas.

## Fase 10 - Documentacao e validacao do MVP

- [ ] Atualizar `README.md` com:
  - objetivo
  - requisitos
  - instalacao
  - configuracao do perfil
  - comandos
  - exemplos de saida
  - limites conhecidos
- [ ] Criar checklist de validacao manual.
- [ ] Rodar fluxo completo com perfil real.
- [ ] Medir:
  - quantidade de vagas coletadas
  - quantidade recomendada
  - tempo de execucao
  - qualidade percebida das recomendacoes
- [ ] Registrar aprendizados e ajustes para a proxima iteracao.

Critério de pronto:

- O MVP atende a definicao de pronto da especificacao:
  - roda localmente
  - carrega perfil
  - coleta ou simula vagas da Upwork
  - gera score e justificativa
  - exporta Markdown e JSON
  - permite revisar oportunidades em ate 5 minutos

## Ordem sugerida de execucao

1. Fase 0 - Preparacao do projeto
2. Fase 1 - Perfil local e contratos de dominio
3. Fase 2 - Mock Upwork e normalizacao
4. Fase 3 - Score inicial sem IA
5. Fase 4 - Relatorios Markdown e JSON
6. Fase 5 - CLI local utilizavel
7. Fase 6 - Persistencia local SQLite
8. Fase 7 - Feedback do usuario
9. Fase 8 - Enriquecimento com IA
10. Fase 9 - Coleta Upwork real ou semi-automatizada
11. Fase 10 - Documentacao e validacao do MVP

## Primeiro marco recomendavel

O primeiro marco deve entregar um "MVP seco":

- Perfil local validado.
- Vagas mockadas.
- Score deterministico.
- Ranking Top N.
- Relatorios Markdown e JSON.
- CLI com um comando.

Esse marco valida o fluxo de produto sem depender de Upwork real, IA ou banco. Depois disso, a integracao real e a IA entram com menos risco.
