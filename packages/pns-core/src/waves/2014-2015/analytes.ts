import type { MacroRegion, PnsAnalyte } from '../../types.js';

/**
 * Mapeamento dos analitos lógicos suportados pelo `@precisa-saude/pns` para
 * os códigos de coluna do dicionário oficial da subamostra laboratorial
 * PNS 2013/2014–2015 (Fiocruz/ICICT, dicionário versão 05-mai-2023).
 *
 * Códigos transcritos diretamente do XLSX
 * `dicionario_de_variaveis_exames_pns_2013_05052023.xlsx`. Verificar a
 * coluna "Categorias / Tipo / Descrição" do dicionário antes de mexer.
 */
export const ANALYTE_TO_COLUMN_2014_2015: Readonly<Record<PnsAnalyte, string>> = {
  'colesterol-total': 'Z031', // Colesterol Total (em mg/dL)
  creatinina: 'Z025', // Creatinina (em mg/dL)
  hba1c: 'Z034', // Hemoglobina Glicosilada (em %)
  hdl: 'Z032', // HDL Colesterol (em mg/dL)
  hemoglobina: 'Z007', // Hemoglobina (em g/dL)
  ldl: 'Z033', // LDL Colesterol (em mg/dL)
};

/**
 * Códigos das variáveis estruturais necessárias para estratificação e
 * cálculo dos quantis ponderados. Confirmar com o dicionário antes de
 * editar (não inferir nomes por similaridade).
 */
export interface StructuralColumns {
  readonly ageYears: string;
  readonly labSubsampleWeight: string;
  readonly region: string;
  readonly sex: string;
}

export const STRUCTURAL_COLUMNS_2014_2015: StructuralColumns = {
  ageYears: 'Z002', // Idade do respondente da subamostra laboratorial (anos completos)
  labSubsampleWeight: 'peso_lab', // peso amostral final da subamostra (já normalizado)
  region: 'regiao', // 1=Norte, 2=Nordeste, 3=Sudeste, 4=Sul, 5=Centro-Oeste (codificação IBGE)
  sex: 'Z001', // 1=Masculino, 2=Feminino
};

/**
 * Mapeamento do código numérico `regiao` da PNS 2014–2015 para o nome
 * de macro-região usado pela API pública. Confere com a tabela
 * IBGE — não reordenar.
 */
export const REGION_CODE_TO_MACRO_REGION_2014_2015: Readonly<Record<number, MacroRegion>> = {
  1: 'Norte',
  2: 'Nordeste',
  3: 'Sudeste',
  4: 'Sul',
  5: 'Centro-Oeste',
};

/** Códigos `Z001` para sexo, conforme dicionário Fiocruz. */
export const SEX_CODE_TO_SEX_2014_2015: Readonly<Record<number, 'M' | 'F'>> = {
  1: 'M',
  2: 'F',
};
