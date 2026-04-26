import { describe, expect, it } from 'vitest';

import { weightedPercentileRank, weightedQuantile } from './horvitz-thompson.js';

describe('weightedQuantile', () => {
  it('recovers the classical quantile when weights are uniform', () => {
    const obs = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => ({ value, weight: 1 }));
    expect(weightedQuantile(obs, 0.5)).toBe(50);
    expect(weightedQuantile(obs, 0.9)).toBe(90);
    expect(weightedQuantile(obs, 0.1)).toBe(10);
  });

  it('reweights toward heavily-weighted observations', () => {
    // Five values, but the 100 has 95% of the weight — median should pull to 100.
    const obs = [
      { value: 10, weight: 1 },
      { value: 20, weight: 1 },
      { value: 30, weight: 1 },
      { value: 40, weight: 2 },
      { value: 100, weight: 95 },
    ];
    expect(weightedQuantile(obs, 0.5)).toBe(100);
  });

  it('rejects out-of-range probabilities', () => {
    expect(() => weightedQuantile([{ value: 1, weight: 1 }], -0.1)).toThrow(RangeError);
    expect(() => weightedQuantile([{ value: 1, weight: 1 }], 1.5)).toThrow(RangeError);
  });

  it('rejects empty input', () => {
    expect(() => weightedQuantile([], 0.5)).toThrow(/empty/);
  });
});

describe('weightedPercentileRank', () => {
  it('returns 50 for the median in a uniform-weighted distribution', () => {
    const obs = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => ({ value, weight: 1 }));
    expect(weightedPercentileRank(obs, 50)).toBe(50);
    expect(weightedPercentileRank(obs, 100)).toBe(100);
    expect(weightedPercentileRank(obs, 10)).toBe(10);
  });

  it('weights observations correctly', () => {
    const obs = [
      { value: 10, weight: 9 },
      { value: 20, weight: 1 },
    ];
    // 90% of weight is at value=10; rank of 10 is 90%.
    expect(weightedPercentileRank(obs, 10)).toBe(90);
    expect(weightedPercentileRank(obs, 20)).toBe(100);
  });
});
