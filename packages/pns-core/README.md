# @precisa-saude/pns

Percentis populacionais ponderados de biomarcadores a partir do microdado da subamostra laboratorial da **Pesquisa Nacional de Saúde (PNS/IBGE)**.

## Para que serve

Responder, em tempo de execução, perguntas como:

> "Para uma mulher de 45 anos no Sudeste, qual a posição percentil de uma HbA1c de 6,0%?"

A resposta é estimada a partir do microdado oficial — não a partir de faixas de referência clínica (estas estão em [`@precisa-saude/fhir`](https://github.com/Precisa-Saude/fhir-brasil)).

## Instalação

```bash
pnpm add @precisa-saude/pns
```

## Uso

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

Se não houver célula correspondente (combinação inválida ou onda futura sem cobertura), o lookup retorna `undefined` — **deixar `undefined` é melhor que mentir**.

## Caveats que você precisa entender antes de usar

- **Granularidade é macro-região (5 regiões IBGE), não UF.** A subamostra laboratorial publicada da PNS não distribui UF/UPA — `regiao` é a coluna geográfica mais fina disponível. `@precisa-saude/pns` exporta `macroRegionFor(uf)` para reduzir UF do usuário para a região correspondente.
- **Pesos amostrais são obrigatórios.** Os percentis usam o peso da subamostra laboratorial (Horvitz-Thompson). Não recalcular com peso uniforme.
- **Onda é vintage-específica.** Schema, lista de analitos e estrutura de pesos de cada onda da PNS são tratados independentemente, então o pacote está preparado para múltiplas ondas futuras. Hoje, no entanto, **apenas a onda 2013/2014–2015 tem subamostra laboratorial publicada**: a PNS 2019, embora exista e cubra outros temas (antropometria, percepção de saúde), não incluiu coleta de sangue/urina ([Fiocruz/ICICT](https://www.pns.icict.fiocruz.br/exames-laboratoriais/)). Não há onda mais recente para consultar.
- **Triglicerídeos e glicemia em jejum não estão na onda 2014–2015** — não foram coletados na subamostra. Para HbA1c, use `'hba1c'` (Z034 no dicionário Fiocruz).
- **Faixas de referência clínica não estão aqui.** Use `@precisa-saude/fhir` para "valor está dentro do normal?" e `@precisa-saude/pns` para "valor está em qual percentil populacional?". São perguntas distintas.

## Analitos cobertos (onda 2014–2015)

| analyte            | coluna PNS | unidade |
| ------------------ | ---------- | ------- |
| `hba1c`            | Z034       | %       |
| `colesterol-total` | Z031       | mg/dL   |
| `ldl`              | Z033       | mg/dL   |
| `hdl`              | Z032       | mg/dL   |
| `creatinina`       | Z025       | mg/dL   |
| `hemoglobina`      | Z007       | g/dL    |

Estratificação: 5 regiões × 4 faixas etárias (`18-29`, `30-39`, `40-59`, `60+`) × 2 sexos = **240 células**, todas com n ≥ 30 na onda 2014–2015.

## Citação

Ao usar dados desta biblioteca em publicações, cite:

> SZWARCWALD, C. L. et al. **Pesquisa Nacional de Saúde 2013/2014–2015 — Subamostra de Exames Laboratoriais**. Rio de Janeiro: IBGE, 2016. Disponível em: <https://www.pns.icict.fiocruz.br/>.

## Licença

Apache-2.0.
