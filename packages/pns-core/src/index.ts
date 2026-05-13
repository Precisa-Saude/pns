export { createLookup } from './lookup.js';
export {
  type CellKey,
  macroRegionFor,
  materializeCell,
  MATERIALIZED_PERCENTILES,
  type MaterializedCell,
  type MaterializedPercentile,
  MIN_CELL_SIZE,
  type Observation,
} from './percentile/cell.js';
export { weightedPercentileRank, weightedQuantile } from './percentile/horvitz-thompson.js';
export type {
  AgeBand,
  BrazilianUF,
  MacroRegion,
  PercentileLookupInput,
  PercentileLookupResult,
  PnsAnalyte,
  PnsCountry,
  PnsRegion,
  PnsWave,
  Sex,
} from './types.js';
export {
  AGE_BANDS,
  BRAZILIAN_UFS,
  MACRO_REGIONS,
  PNS_COUNTRY,
  PNS_WAVES,
  SEXES,
  UF_TO_MACRO_REGION,
} from './types.js';
export {
  ANALYTE_TO_COLUMN_2014_2015,
  REGION_CODE_TO_MACRO_REGION_2014_2015,
  SEX_CODE_TO_SEX_2014_2015,
  STRUCTURAL_COLUMNS_2014_2015,
  type StructuralColumns,
} from './waves/2014-2015/analytes.js';
