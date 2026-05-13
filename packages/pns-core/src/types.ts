export const PNS_WAVES = ['2014-2015'] as const;
export type PnsWave = (typeof PNS_WAVES)[number];

export const MACRO_REGIONS = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'] as const;
export type MacroRegion = (typeof MACRO_REGIONS)[number];

/**
 * Sentinela usada como valor de `region` no lookup quando o consumidor quer
 * o percentil **nacional** (todas as macro-regiões agregadas com peso
 * amostral Horvitz-Thompson). PNS é uma pesquisa nacionalmente
 * representativa via `w_pes`, então este valor é metodologicamente válido —
 * não é uma média ponderada *post-hoc* dos percentis regionais (isso
 * estaria errado), e sim o percentil calculado sobre todas as observações
 * de uma vez. Materializado pelo pipeline `pns-archive` ao lado das
 * células regionais e embarcado na tabela de percentis.
 */
export const PNS_COUNTRY = 'Brasil' as const;
export type PnsCountry = typeof PNS_COUNTRY;

/** Valor aceito pelo lookup como recorte geográfico: macro-região ou Brasil. */
export type PnsRegion = MacroRegion | PnsCountry;

/**
 * UFs e o mapeamento UF → macro-região continuam exportados como utilitário
 * (consumidores frequentemente têm a UF do usuário e precisam reduzir
 * para macro-região antes de consultar percentis). A subamostra
 * laboratorial publicada da PNS, porém, **não distribui dados em
 * granularidade UF**: `regiao` é a coluna geográfica mais fina disponível.
 */
export const BRAZILIAN_UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
] as const;
export type BrazilianUF = (typeof BRAZILIAN_UFS)[number];

export const UF_TO_MACRO_REGION: Readonly<Record<BrazilianUF, MacroRegion>> = {
  AC: 'Norte',
  AL: 'Nordeste',
  AM: 'Norte',
  AP: 'Norte',
  BA: 'Nordeste',
  CE: 'Nordeste',
  DF: 'Centro-Oeste',
  ES: 'Sudeste',
  GO: 'Centro-Oeste',
  MA: 'Nordeste',
  MG: 'Sudeste',
  MS: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  PA: 'Norte',
  PB: 'Nordeste',
  PE: 'Nordeste',
  PI: 'Nordeste',
  PR: 'Sul',
  RJ: 'Sudeste',
  RN: 'Nordeste',
  RO: 'Norte',
  RR: 'Norte',
  RS: 'Sul',
  SC: 'Sul',
  SE: 'Nordeste',
  SP: 'Sudeste',
  TO: 'Norte',
};

export const AGE_BANDS = ['18-29', '30-39', '40-59', '60+'] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const SEXES = ['M', 'F'] as const;
export type Sex = (typeof SEXES)[number];

/**
 * Analitos suportados na onda 2014–2015. Lista derivada do dicionário
 * oficial da subamostra laboratorial (Fiocruz/ICICT, 05-mai-2023). Não
 * incluir analitos que não foram coletados nessa onda — triglicerídeos
 * e glicemia em jejum, por exemplo, ficam de fora; usar HbA1c (Z034).
 */
export type PnsAnalyte =
  | 'hba1c'
  | 'colesterol-total'
  | 'ldl'
  | 'hdl'
  | 'creatinina'
  | 'hemoglobina';

export interface PercentileLookupInput {
  ageBand: AgeBand;
  analyte: PnsAnalyte;
  /**
   * Macro-região (`Norte`, `Nordeste`, ...) ou `Brasil` para o recorte
   * nacional. Veja `PNS_COUNTRY`.
   */
  region: PnsRegion;
  sex: Sex;
  value: number;
  wave: PnsWave;
}

export interface PercentileLookupResult {
  cellSize: number;
  percentile: number;
}
