# Especificação SDD -- Freela Agent

## 1. Visão Geral

**Objetivo:** Construir um agente de IA capaz de recomendar
oportunidades freelancer altamente aderentes ao perfil do usuário,
iniciando pela Upwork e evoluindo para um SaaS multiusuário.

## 2. Objetivos do MVP

-   Executar localmente.
-   Coletar vagas da Upwork.
-   Avaliar aderência com base no perfil técnico.
-   Gerar ranking das melhores oportunidades.
-   Permitir feedback do usuário.

## 3. Público-alvo inicial

Desenvolvedores de software experientes buscando contratos
internacionais.

## 4. Requisitos Funcionais (MVP)

### RF-01 -- Cadastro do Perfil

Permitir informar: - Tecnologias dominadas - Anos de experiência -
Idiomas - Valor mínimo por hora - Preferências (remoto, duração, fuso)

### RF-02 -- Coleta de vagas da Upwork

-   Buscar vagas periodicamente.
-   Extrair:
    -   título
    -   descrição
    -   orçamento
    -   nível de experiência
    -   tecnologias
    -   data da publicação
    -   link

### RF-03 -- Enriquecimento por IA

Utilizar LLM para: - Extrair tecnologias implícitas. - Classificar
complexidade. - Gerar resumo.

### RF-04 -- Matching

Calcular score considerando: - tecnologias - senioridade - idioma -
orçamento - histórico de preferências

### RF-05 -- Ranking

Exibir Top N oportunidades.

### RF-06 -- Feedback

Permitir marcar: - interessante - ignorar - aplicado

## 5. Requisitos Não Funcionais

-   Tempo máximo de processamento: 5 minutos.
-   Persistência local em SQLite.
-   Arquitetura preparada para migração para PostgreSQL.
-   Código modular.

## 6. Arquitetura do MVP

Perfil -\> Scraper Upwork -\> Banco Local -\> Motor IA -\> Ranking -\>
Interface

## 7. Estrutura sugerida

src/ - agents/ - scrapers/ - services/ - database/ - jobs/ - api/ - ui/

## 8. Modelo de Dados

### UserProfile

-   id
-   technologies
-   yearsExperience
-   englishLevel
-   minimumRate
-   preferences

### Job

-   id
-   platform
-   title
-   description
-   budget
-   technologies
-   url
-   postedAt

### Recommendation

-   userId
-   jobId
-   score
-   status

## 9. Fórmula inicial de score

Score Final = 40% tecnologias + 25% senioridade + 15% orçamento + 10%
idioma + 10% preferências

## 10. Roadmap pós-MVP

### Fase 2

-   Dashboard Web
-   Telegram
-   E-mail diário
-   PostgreSQL

### Fase 3

Plataformas: - Upwork - Freelancer.com - Toptal - Guru - Fiverr -
Wellfound - RemoteOK

### Fase 4

IA avançada: - Embeddings - Aprendizado por feedback - Reescrita
automática de propostas - Geração de cover letters

### Fase 5

SaaS - Autenticação - Multi-tenant - Assinaturas - Painel
administrativo - Analytics

## 11. Critérios de sucesso do MVP

-   80% das vagas recomendadas consideradas relevantes.
-   Redução de 70% do tempo gasto procurando vagas.
-   Pelo menos uma candidatura qualificada por dia.

## 12. Riscos

-   Mudanças na Upwork.
-   Restrições de scraping.
-   Custos de LLM.
-   Escalabilidade.

## 13. Métricas

-   Taxa de relevância.
-   Quantidade de candidaturas.
-   Tempo economizado.
-   Conversão em entrevistas.
