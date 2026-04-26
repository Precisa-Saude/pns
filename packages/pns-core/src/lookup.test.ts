import { describe, expect, it } from 'vitest';

import { createLookup } from './lookup.js';
import type { MaterializedCell } from './percentile/cell.js';

const SUDESTE_CELL: MaterializedCell = {
  cellSize: 800,
  key: {
    ageBand: '40-59',
    analyte: 'hba1c',
    region: 'Sudeste',
    sex: 'F',
    wave: '2014-2015',
  },
  percentiles: { 5: 4.8, 10: 5.0, 25: 5.2, 50: 5.5, 75: 5.8, 90: 6.2, 95: 6.5 },
};

describe('percentileFor', () => {
  const lookup = createLookup([SUDESTE_CELL]);

  it('returns the materialized percentile for a value at a known anchor', () => {
    const result = lookup({
      analyte: 'hba1c',
      value: 5.5,
      region: 'Sudeste',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    expect(result?.percentile).toBe(50);
  });

  it('interpolates between materialized anchors', () => {
    const result = lookup({
      analyte: 'hba1c',
      value: 6.0,
      region: 'Sudeste',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    expect(result?.percentile).toBeGreaterThan(75);
    expect(result?.percentile).toBeLessThan(90);
  });

  it('clamps to materialized extremes (no extrapolation into thin tails)', () => {
    const low = lookup({
      analyte: 'hba1c',
      value: 1.0,
      region: 'Sudeste',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    const high = lookup({
      analyte: 'hba1c',
      value: 99.0,
      region: 'Sudeste',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    expect(low?.percentile).toBe(5);
    expect(high?.percentile).toBe(95);
  });

  it('returns undefined when no matching cell exists', () => {
    const result = lookup({
      analyte: 'hba1c',
      value: 5.5,
      region: 'Norte',
      ageBand: '40-59',
      sex: 'F',
      wave: '2014-2015',
    });
    expect(result).toBeUndefined();
  });
});
