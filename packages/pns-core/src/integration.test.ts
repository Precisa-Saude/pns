/**
 * Integration test contra a tabela real materializada de percentis
 * (gerada em `pns-archive/scripts/compute-percentiles.ts` a partir do
 * XLSX oficial Fiocruz/ICICT).
 *
 * Validações são frouxas porque precisam ser robustas a recompilações
 * marginais — o objetivo é detectar quebras estruturais (analito ou
 * região perdidos, distribuição absurdamente fora) e não congelar
 * percentis específicos. Para auditoria fina, ler `cells.json`.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createLookup } from './lookup.js';
import type { MaterializedCell } from './percentile/cell.js';

const TABLE_PATH = fileURLToPath(new URL('../tables/percentiles-2014-2015.json', import.meta.url));
const cells = JSON.parse(readFileSync(TABLE_PATH, 'utf-8')) as MaterializedCell[];
const percentileFor = createLookup(cells);

describe('@precisa-saude/pns — tabela 2014-2015 embarcada', () => {
  it('cobre as 288 combinações esperadas (6 analitos × (5 regiões + Brasil) × 4 faixas × 2 sexos)', () => {
    expect(cells).toHaveLength(288);
  });

  it('inclui as 48 células Brasil (6 analitos × 4 faixas × 2 sexos)', () => {
    const brasil = cells.filter((c) => c.key.region === 'Brasil');
    expect(brasil).toHaveLength(48);
  });

  it('todas as células atendem o threshold mínimo n ≥ 30', () => {
    const small = cells.filter((c) => c.cellSize < 30);
    expect(small).toEqual([]);
  });

  it('célula Brasil tem n maior que qualquer regional (pool de todas as observações)', () => {
    const analyte = 'hdl';
    const ageBand = '40-59';
    const sex = 'M';
    const brasil = cells.find(
      (c) =>
        c.key.analyte === analyte &&
        c.key.region === 'Brasil' &&
        c.key.ageBand === ageBand &&
        c.key.sex === sex,
    );
    const regionals = cells.filter(
      (c) =>
        c.key.analyte === analyte &&
        c.key.region !== 'Brasil' &&
        c.key.ageBand === ageBand &&
        c.key.sex === sex,
    );
    expect(brasil).toBeDefined();
    expect(regionals.length).toBeGreaterThan(0);
    for (const r of regionals) {
      expect(brasil!.cellSize).toBeGreaterThan(r.cellSize);
    }
  });

  it('HbA1c em mulheres 40–59 do Sudeste tem mediana plausível (5.0–5.7%)', () => {
    const cell = cells.find(
      (c) =>
        c.key.analyte === 'hba1c' &&
        c.key.region === 'Sudeste' &&
        c.key.ageBand === '40-59' &&
        c.key.sex === 'F',
    );
    expect(cell).toBeDefined();
    expect(cell!.percentiles[50]).toBeGreaterThan(5.0);
    expect(cell!.percentiles[50]).toBeLessThan(5.7);
  });

  it('HbA1c=6.0 em mulheres 40–59 do Sudeste cai em [p75, p95] — coerente com Iser 2021', () => {
    const result = percentileFor({
      analyte: 'hba1c',
      value: 6.0,
      region: 'Sudeste',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    expect(result).toBeDefined();
    expect(result!.percentile).toBeGreaterThanOrEqual(75);
    expect(result!.percentile).toBeLessThanOrEqual(95);
  });

  it('colesterol total mediano em mulheres 40–59 do Sudeste fica perto da faixa esperada (170–210 mg/dL)', () => {
    const cell = cells.find(
      (c) =>
        c.key.analyte === 'colesterol-total' &&
        c.key.region === 'Sudeste' &&
        c.key.ageBand === '40-59' &&
        c.key.sex === 'F',
    );
    expect(cell).toBeDefined();
    expect(cell!.percentiles[50]).toBeGreaterThan(170);
    expect(cell!.percentiles[50]).toBeLessThan(210);
  });

  it('hemoglobina mediana em homens 30–39 do Norte fica entre 13 e 17 g/dL (faixa fisiológica)', () => {
    const cell = cells.find(
      (c) =>
        c.key.analyte === 'hemoglobina' &&
        c.key.region === 'Norte' &&
        c.key.ageBand === '30-39' &&
        c.key.sex === 'M',
    );
    expect(cell).toBeDefined();
    expect(cell!.percentiles[50]).toBeGreaterThan(13);
    expect(cell!.percentiles[50]).toBeLessThan(17);
  });
});
