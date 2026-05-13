import {
  type AgeBand,
  type BrazilianUF,
  type MacroRegion,
  type PnsAnalyte,
  type PnsRegion,
  type PnsWave,
  type Sex,
  UF_TO_MACRO_REGION,
} from '../types.js';
import { weightedQuantile } from './horvitz-thompson.js';

/** Tamanho mínimo de célula para que percentis sejam considerados confiáveis. */
export const MIN_CELL_SIZE = 30;

/** Percentis pré-computados que materializamos para cada célula. */
export const MATERIALIZED_PERCENTILES = [5, 10, 25, 50, 75, 90, 95] as const;
export type MaterializedPercentile = (typeof MATERIALIZED_PERCENTILES)[number];

export interface Observation {
  value: number;
  weight: number;
}

export interface CellKey {
  ageBand: AgeBand;
  analyte: PnsAnalyte;
  /** Macro-região IBGE ou `'Brasil'` para o recorte nacional. */
  region: PnsRegion;
  sex: Sex;
  wave: PnsWave;
}

export interface MaterializedCell {
  cellSize: number;
  key: CellKey;
  percentiles: Readonly<Record<MaterializedPercentile, number>>;
}

/**
 * Materializa percentis fixos para uma célula. Retorna `undefined` quando o
 * tamanho da célula é menor que `MIN_CELL_SIZE` — o caller pode tentar
 * uma célula mais ampla ou desistir.
 *
 * **Nunca** materialize percentis em granularidade abaixo de macro-região
 * a partir da subamostra laboratorial publicada da PNS — a amostra
 * publicada não distribui UF/UPA, e tentar UF por linkage com a base
 * principal sem acordo de microdado restrito é o failure mode
 * "plausible-but-wrong" descrito em AGENTS.md.
 */
export function materializeCell(
  key: CellKey,
  observations: ReadonlyArray<Observation>,
): MaterializedCell | undefined {
  if (observations.length < MIN_CELL_SIZE) return undefined;
  const percentiles = Object.fromEntries(
    MATERIALIZED_PERCENTILES.map((p) => [p, weightedQuantile(observations, p / 100)]),
  ) as Record<MaterializedPercentile, number>;
  return { cellSize: observations.length, key, percentiles };
}

/** Helper: macro-região correspondente a uma UF (utilitário para consumidores). */
export function macroRegionFor(uf: BrazilianUF): MacroRegion {
  return UF_TO_MACRO_REGION[uf];
}
