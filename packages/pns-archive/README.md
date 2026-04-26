# pns-archive

Pacote interno (não publicado) do `pns`. Roda o pipeline de ingestão da Pesquisa Nacional de Saúde (PNS/IBGE) e materializa as tabelas de percentis ponderados que `@precisa-saude/pns` embarca.

## Por que separado de `@precisa-saude/pns`

O bundle público do `@precisa-saude/pns` precisa ser leve e sem dependências pesadas (sem `basic-ftp`, sem DuckDB). Toda a ingestão fica isolada aqui — só a tabela compilada (`tables/percentiles-2014-2015.parquet`) é copiada para `pns-core/tables/` antes de cada release.

## Pipeline (onda 2014–2015)

```
pnpm --filter @precisa-saude/pns-archive run fetch:2014-2015
pnpm --filter @precisa-saude/pns-archive run parse -- --input build/2014-2015/raw/EXAMES.txt > build/2014-2015/exames.ndjson
pnpm --filter @precisa-saude/pns-archive run compute
pnpm --filter @precisa-saude/pns-archive run provenance
```

## Status

- ✅ Estrutura do pipeline e contratos com `@precisa-saude/pns`
- ⏳ `REQUIRED_FILES` no fetcher precisa ser preenchido após inspeção manual do FTP IBGE em `ftp://ftp.ibge.gov.br/PNS/2013/Microdados/`
- ⏳ Schema `EXAMES_2014_2015` em `@precisa-saude/pns` precisa ser preenchido a partir do dicionário oficial — proibido inferir colunas (AGENTS.md § Data integrity)
- ⏳ `compute-percentiles.ts` é um stub; implementação real após schema pronto

Estes "todo"s ficam como tickets de follow-up de PRE-207. O design do pipeline é fechado neste PR; a transcrição do dicionário e a primeira materialização real ficam para o próximo PR.
