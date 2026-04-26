import { describe, expect, it } from 'vitest';

import { type CellKey, macroRegionFor, materializeCell, MIN_CELL_SIZE } from './cell.js';

const KEY: CellKey = {
  ageBand: '40-59',
  analyte: 'hba1c',
  region: 'Sudeste',
  sex: 'F',
  wave: '2014-2015',
};

describe('materializeCell', () => {
  it('returns undefined when observations < MIN_CELL_SIZE', () => {
    const obs = Array.from({ length: MIN_CELL_SIZE - 1 }, (_, i) => ({ value: i, weight: 1 }));
    expect(materializeCell(KEY, obs)).toBeUndefined();
  });

  it('materializes the standard percentile set when observations meet threshold', () => {
    const obs = Array.from({ length: 100 }, (_, i) => ({ value: i + 1, weight: 1 }));
    const cell = materializeCell(KEY, obs);
    expect(cell).toBeDefined();
    expect(cell!.cellSize).toBe(100);
    expect(cell!.percentiles[50]).toBe(50);
    expect(cell!.percentiles[90]).toBe(90);
    expect(cell!.percentiles[5]).toBe(5);
  });
});

describe('macroRegionFor', () => {
  it('maps UFs to the correct macro-region', () => {
    expect(macroRegionFor('SP')).toBe('Sudeste');
    expect(macroRegionFor('AM')).toBe('Norte');
    expect(macroRegionFor('RS')).toBe('Sul');
    expect(macroRegionFor('DF')).toBe('Centro-Oeste');
    expect(macroRegionFor('PE')).toBe('Nordeste');
  });
});
