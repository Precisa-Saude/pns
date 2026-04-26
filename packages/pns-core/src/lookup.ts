import {
  MATERIALIZED_PERCENTILES,
  type MaterializedCell,
  type MaterializedPercentile,
} from './percentile/cell.js';
import {
  type AgeBand,
  type MacroRegion,
  type PercentileLookupInput,
  type PercentileLookupResult,
  type PnsAnalyte,
  type PnsWave,
  type Sex,
} from './types.js';

function indexKey(parts: ReadonlyArray<string>): string {
  return parts.join('|');
}

/**
 * Interpola linearmente a posição percentil de `value` entre os percentis
 * pré-materializados (5/10/25/50/75/90/95). Para valores fora de [p5, p95]
 * devolvemos os limites — a cauda de uma distribuição amostral de ~9k
 * indivíduos é estimada com pouca confiança e exagerar a posição
 * (ex: "p99,8") seria plausible-but-wrong.
 */
function interpolatePercentile(
  percentiles: Readonly<Record<MaterializedPercentile, number>>,
  value: number,
): number {
  const ps = MATERIALIZED_PERCENTILES;
  const minP = ps[0]!;
  const maxP = ps[ps.length - 1]!;
  if (value <= percentiles[minP]) return minP;
  if (value >= percentiles[maxP]) return maxP;
  for (let i = 0; i < ps.length - 1; i++) {
    const lowP = ps[i]!;
    const highP = ps[i + 1]!;
    const lowV = percentiles[lowP];
    const highV = percentiles[highP];
    if (value >= lowV && value <= highV) {
      if (highV === lowV) return lowP;
      const fraction = (value - lowV) / (highV - lowV);
      return lowP + fraction * (highP - lowP);
    }
  }
  return maxP;
}

export function createLookup(cells: ReadonlyArray<MaterializedCell>) {
  const index = new Map<string, MaterializedCell>();
  for (const cell of cells) {
    const { ageBand, analyte, region, sex, wave } = cell.key;
    index.set(indexKey([analyte, wave, region, ageBand, sex]), cell);
  }

  return function percentileFor(input: PercentileLookupInput): PercentileLookupResult | undefined {
    const cell = index.get(
      indexKey([input.analyte, input.wave, input.region, input.ageBand, input.sex]),
    );
    if (!cell) return undefined;
    return {
      cellSize: cell.cellSize,
      percentile: interpolatePercentile(cell.percentiles, input.value),
    };
  };
}

export type {
  AgeBand,
  MacroRegion,
  PercentileLookupInput,
  PercentileLookupResult,
  PnsAnalyte,
  PnsWave,
  Sex,
};
