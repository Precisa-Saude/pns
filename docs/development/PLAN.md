# PRE-207 — Plano de implementação (subamostra laboratorial PNS 2014–2015)

## Objetivo

Fornecer percentis populacionais ponderados de biomarcadores via `@precisa-saude/pns`, alimentando a feature "dados em contexto populacional" (PRE-198).

## Status atual — MVP funcional

- ✅ Repo bootstrapado via `precisa new pns --profile oss-library`
- ✅ Pacotes `@precisa-saude/pns` (público) e `@precisa-saude/pns-archive` (interno)
- ✅ Algoritmo Horvitz-Thompson de quantile/percentil ponderado, com testes
- ✅ `materializeCell` com threshold n ≥ 30 (todas as 240 células do MVP atendem)
- ✅ API pública `createLookup` retornando `{percentile, cellSize}` com interpolação linear entre os 7 anchors materializados; clamp em p5/p95
- ✅ Pipeline de ingestão real implementado e validado:
  - `fetch:2014-2015` baixa de IBGE FTP (PNS_2013 main + dicionário) e Fiocruz HTTPS (Exames XLSX), com SHA256 pinned
  - `compute` parseia o XLSX 8.953×509, agrupa por `{analito, região, faixa, sexo}` e materializa 240 células
  - `provenance` emite checksums + git SHA + versão
- ✅ Tabela real `tables/percentiles-2014-2015.json` (76KB, 240 células) embarcada em `@precisa-saude/pns`
- ✅ Sanity tests contra a literatura: HbA1c 6,0% em mulheres 40–59 do Sudeste cai em [p75, p95] (Iser et al. 2021); colesterol e hemoglobina dentro de faixas fisiológicas
- ✅ Pre-push battery local: 19 testes, 92%+ coverage no pns-core, lint + typecheck limpos

## Decisões importantes que mudaram em relação ao plano original

1. **Granularidade nativa = macro-região, não UF.** A subamostra laboratorial publicada por Fiocruz não distribui UF (`regiao` é a coluna geográfica mais fina). Isto é consistente com a literatura (Iser 2021, Dos Anjos Ribeiro 2025) que opera em macro-região. Consumidores que têm UF do usuário usam `macroRegionFor(uf)`. Linkagem com PNS 2013 main file para chegar a UF requer acordo de microdado restrito — fora do escopo do MVP.

2. **PnsAnalyte sem triglicerídeos e glicemia em jejum.** Não foram coletados na subamostra laboratorial 2014–2015 (a coleta usou HbA1c + glicose estimada). Adicionar nas próximas ondas se aplicável.

3. **Pacote interno usa exceljs + node-stream-zip.** Lab data é XLSX (Fiocruz), não fixed-width. Parser fixed-width foi removido por enquanto; pode voltar quando entrarmos no PNS 2013 main file.

## Próximos passos (tickets de extensão)

1. **PNS 2019** — onda mais recente disponível. Lista de analitos diferente; precisa de novo subdir `src/waves/2019/`.
2. **PNS 2024** — quando o microdado for liberado (provavelmente 2026/2027).
3. **Linkagem com PNS 2013 main file** — para chegar a UF/capitais. Requer protocolo Fiocruz/IBGE para microdado restrito; fora do escopo OSS.
4. **SISVAN antropometria** — única fonte pública com microdado município-level (peso/altura/IMC/cintura). Ticket separado se priorizado (mencionado em PRE-207 como extensão futura).
5. **Publicação npm** — assim que o repo subir para `Precisa-Saude/pns` e CI verde, primeiro release `0.1.0`.

## Contexto

Linear: PRE-207 (filho de PRE-198). Detalhes de design (decisões já tomadas, riscos, alternativas descartadas) ficam no plano externo em `~/.claude/plans/lets-work-on-pre-207-structured-crane.md`.
