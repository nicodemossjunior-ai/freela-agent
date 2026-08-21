# Freela Agent

Agente local para ranquear oportunidades freelancer contra um perfil tecnico.

O MVP atual roda em modo mock da Upwork: carrega `data/profile.json`, normaliza vagas simuladas, calcula score, gera ranking e exporta relatorios.

## Requisitos

- Node.js 22+
- npm

## Instalar

```bash
npm install
```

## Rodar em desenvolvimento

```bash
npm run dev
```

Com parametros:

```bash
npm run dev -- --profile data/profile.json --limit 10 --min-score 50 --top 5
```

## Gerar build

```bash
npm run build
npm start
```

## Testes

```bash
npm test
```

## Saidas

O comando gera:

- `output/recommendations.md`
- `output/recommendations.json`
- `data/freela-agent.sqlite`

## Persistencia local

As execucoes salvam o historico em SQLite. Vagas repetidas sao reaproveitadas por `platform + externalId` ou por `url`, evitando duplicidade entre execucoes.

Use outro caminho de banco quando precisar isolar testes locais:

```bash
npm run dev -- --db data/dev.sqlite
```

Para resetar o banco local padrao:

```bash
npm run db:reset
```

## Perfil

Use `data/profile.example.json` como referencia. O arquivo real esperado por padrao e `data/profile.json`.

Campos obrigatorios:

- `name`
- `title`
- `technologies`
- `experienceYears`
- `englishLevel`
- `minimumHourlyRate`
- `preferredJobTypes`
- `avoid`

## Status do MVP seco

Implementado:

- Base Node.js + TypeScript
- Perfil local validado
- Mock Upwork
- Normalizacao e deduplicacao
- Score deterministico sem IA
- Ranking Top N
- Relatorios Markdown e JSON
- Persistencia local SQLite
- CLI local
- Testes unitarios principais

Ainda fora deste marco:

- Feedback persistente
- IA
- Coleta real da Upwork
