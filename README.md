# pns

Percentis populacionais ponderados de biomarcadores a partir do microdado da **Pesquisa Nacional de Saúde (PNS/IBGE)**, prontos para consumo em tempo de execução.

Faz parte do ecossistema [Precisa Saúde](https://github.com/Precisa-Saude). Para faixas de referência clínica use [`@precisa-saude/fhir`](https://github.com/Precisa-Saude/fhir-brasil); para dados administrativos do SUS, [`@precisa-saude/datasus`](https://github.com/Precisa-Saude/datasus-parquet).

## Para que serve

Responder, em tempo de execução, perguntas como:

> "Para uma mulher de 45 anos no Sudeste, qual a posição percentil de uma HbA1c de 6,0%?"

A resposta vem do microdado oficial da subamostra laboratorial PNS 2014–2015 — não de faixas de referência clínica.

## Pacotes neste repo

| Pacote                       | Publicado | Função                                                                                                                                      |
| ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@precisa-saude/pns`         | npm       | API pública. `createLookup` + tipos + tabela de percentis embarcada (`tables/percentiles-2014-2015.json`, 240 células).                     |
| `@precisa-saude/pns-archive` | privado   | CLI interno: baixa o microdado, parseia o XLSX e materializa a tabela. Roda quando uma onda nova entra ou quando os dados são republicados. |

## Início rápido

```bash
pnpm add @precisa-saude/pns
```

```ts
import { createLookup, macroRegionFor } from '@precisa-saude/pns';
import cells from '@precisa-saude/pns/tables/percentiles-2014-2015.json' assert { type: 'json' };

const percentileFor = createLookup(cells);

const result = percentileFor({
  analyte: 'hba1c',
  value: 6.0,
  region: macroRegionFor('SP'), // ou diretamente 'Sudeste'
  ageBand: '40-59',
  sex: 'F',
  wave: '2014-2015',
});
// → { percentile: 82.x, cellSize: 334 }
```

Quando a combinação solicitada não tem célula correspondente, o lookup retorna `undefined` — **deixar `undefined` é melhor que mentir**.

## Caveats que você precisa entender antes de usar

- **Granularidade é macro-região (5 regiões IBGE), não UF.** A subamostra laboratorial publicada da PNS não distribui UF/UPA — `regiao` é a coluna geográfica mais fina disponível. Use `macroRegionFor(uf)` para reduzir UF do usuário antes de consultar.
- **Pesos amostrais são obrigatórios.** Os percentis usam o peso da subamostra laboratorial via Horvitz-Thompson. Não recalcular sobre a tabela com peso uniforme.
- **Onda é vintage-específica.** Cada onda da PNS (2013, 2019, 2024) tem schema próprio: lista de analitos, códigos de coluna, estrutura de pesos. Tratar cada onda como artefato imutável.
- **Triglicerídeos e glicemia em jejum não estão na onda 2014–2015** — não foram coletados na subamostra laboratorial. Para diabetes, usar `'hba1c'`.
- **Faixas de referência clínica não estão aqui.** Use `@precisa-saude/fhir` para "valor está dentro do normal?" e `@precisa-saude/pns` para "valor está em qual percentil populacional?". São perguntas distintas.

## Cobertura da onda 2014–2015

| analito            | coluna PNS | unidade |
| ------------------ | ---------- | ------- |
| `hba1c`            | Z034       | %       |
| `colesterol-total` | Z031       | mg/dL   |
| `ldl`              | Z033       | mg/dL   |
| `hdl`              | Z032       | mg/dL   |
| `creatinina`       | Z025       | mg/dL   |
| `hemoglobina`      | Z007       | g/dL    |

Estratificação: 6 analitos × 5 macro-regiões × 4 faixas etárias (`18-29`, `30-39`, `40-59`, `60+`) × 2 sexos = **240 células**, todas com `n ≥ 30`.

## Pipeline de ingestão

`@precisa-saude/pns-archive` regenera a tabela embarcada:

```bash
pnpm --filter @precisa-saude/pns-archive run fetch:2014-2015   # IBGE FTP + Fiocruz HTTPS
pnpm --filter @precisa-saude/pns-archive run compute            # XLSX 8953×509 → cells.json
pnpm --filter @precisa-saude/pns-archive run provenance         # SHA256 + git SHA + versão
cp packages/pns-archive/build/2014-2015/cells.json packages/pns-core/tables/percentiles-2014-2015.json
```

SHA256s das fontes são pinned no fetcher; mismatch é falha hard, não silencia.

## Fontes

- IBGE — [Pesquisa Nacional de Saúde](https://www.ibge.gov.br/estatisticas/sociais/saude/9160-pesquisa-nacional-de-saude.html)
- Fiocruz/ICICT — [portal PNS / bases de dados](https://www.pns.icict.fiocruz.br/bases-de-dados/) (subamostra laboratorial)
- ISER, B. P. M. _et al._ "Prediabetes and intermediate hyperglycaemia prevalence in Brazilian adults." _Ciência & Saúde Coletiva_, 2021.

## Citação

Ao usar dados desta biblioteca em publicações:

> SZWARCWALD, C. L. _et al._ **Pesquisa Nacional de Saúde 2013/2014–2015 — Subamostra de Exames Laboratoriais**. Rio de Janeiro: IBGE, 2016. Disponível em: <https://www.pns.icict.fiocruz.br/>.

## Contribuindo

Veja [`CONTRIBUTING.md`](CONTRIBUTING.md), [`AGENTS.md`](AGENTS.md) (regras específicas deste repo) e [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Licença

[Apache-2.0](LICENSE).
