/**
 * Lê o XLSX da subamostra laboratorial PNS 2014–2015 (Fiocruz),
 * agrupa por {analito, macro-região, faixa-etária, sexo} e materializa
 * percentis ponderados (Horvitz-Thompson) para cada célula.
 *
 * Saída: `build/2014-2015/cells.json` — lista de `MaterializedCell`
 * pronta para ser embarcada em `@precisa-saude/pns`.
 *
 * Pré-requisito: rodar `pnpm run fetch:2014-2015` para baixar o ZIP.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGE_BANDS,
  type AgeBand,
  ANALYTE_TO_COLUMN_2014_2015,
  type MacroRegion,
  materializeCell,
  type MaterializedCell,
  type Observation,
  PNS_COUNTRY,
  type PnsAnalyte,
  REGION_CODE_TO_MACRO_REGION_2014_2015,
  type Sex,
  SEX_CODE_TO_SEX_2014_2015,
  STRUCTURAL_COLUMNS_2014_2015,
} from '@precisa-saude/pns';
import ExcelJS from 'exceljs';
import StreamZip from 'node-stream-zip';

const HERE = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = resolve(HERE, '..', 'build', '2014-2015', 'raw');
const OUT_DIR = resolve(HERE, '..', 'build', '2014-2015');
const EXAMES_ZIP = resolve(RAW_DIR, 'PNS2013_Exames.zip');
const EXAMES_XLSX_NAME = 'EXAMES-PNS-2013-FINAL_05052023.xlsx';

interface Row {
  age: number;
  region: MacroRegion;
  sex: Sex;
  values: Partial<Record<PnsAnalyte, number>>;
  weight: number;
}

function ageBandFor(age: number): AgeBand | undefined {
  if (age < 18) return undefined;
  if (age < 30) return '18-29';
  if (age < 40) return '30-39';
  if (age < 60) return '40-59';
  return '60+';
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const t = v.trim();
    if (t === '' || t === '.' || t === '-') return undefined;
    const n = Number.parseFloat(t.replace(',', '.'));
    return Number.isFinite(n) ? n : undefined;
  }
  if (v && typeof v === 'object' && 'result' in v) {
    return asNumber((v as { result: unknown }).result);
  }
  return undefined;
}

async function extractExamesXlsx(): Promise<Buffer> {
  const zip = new StreamZip.async({ file: EXAMES_ZIP });
  try {
    return await zip.entryData(EXAMES_XLSX_NAME);
  } finally {
    await zip.close();
  }
}

async function readRows(xlsxBuffer: Buffer): Promise<Row[]> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(xlsxBuffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('XLSX sem planilhas');

  const headerRow = ws.getRow(1);
  const headers: Record<string, number> = {};
  headerRow.eachCell((cell, col) => {
    const v = cell.value;
    if (typeof v === 'string') headers[v.trim()] = col;
  });

  const cols = STRUCTURAL_COLUMNS_2014_2015;
  const sexCol = headers[cols.sex];
  const ageCol = headers[cols.ageYears];
  const regionCol = headers[cols.region];
  const weightCol = headers[cols.labSubsampleWeight];
  if (!sexCol || !ageCol || !regionCol || !weightCol) {
    throw new Error(
      `Colunas estruturais faltando no XLSX: sex=${sexCol} age=${ageCol} region=${regionCol} weight=${weightCol}`,
    );
  }

  const out: Row[] = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const sexCode = asNumber(row.getCell(sexCol).value);
    const age = asNumber(row.getCell(ageCol).value);
    const regionCode = asNumber(row.getCell(regionCol).value);
    const weight = asNumber(row.getCell(weightCol).value);
    if (
      sexCode === undefined ||
      age === undefined ||
      regionCode === undefined ||
      weight === undefined ||
      weight <= 0
    ) {
      return;
    }
    const sex = SEX_CODE_TO_SEX_2014_2015[sexCode];
    const region = REGION_CODE_TO_MACRO_REGION_2014_2015[regionCode];
    if (!sex || !region) return;

    const values: Partial<Record<PnsAnalyte, number>> = {};
    for (const [analyte, code] of Object.entries(ANALYTE_TO_COLUMN_2014_2015) as Array<
      [PnsAnalyte, string]
    >) {
      const c = headers[code];
      if (!c) continue;
      const v = asNumber(row.getCell(c).value);
      if (v !== undefined) values[analyte] = v;
    }
    out.push({ age, region, sex, values, weight });
  });

  return out;
}

interface RegionStats {
  count: number;
  region: MacroRegion;
  totalWeight: number;
}

function summarizeRegions(rows: ReadonlyArray<Row>): RegionStats[] {
  const grouped = new Map<MacroRegion, Row[]>();
  for (const r of rows) {
    const arr = grouped.get(r.region);
    if (arr) arr.push(r);
    else grouped.set(r.region, [r]);
  }
  return [...grouped.entries()].map(([region, rs]) => ({
    count: rs.length,
    region,
    totalWeight: rs.reduce((s, r) => s + r.weight, 0),
  }));
}

async function main(): Promise<void> {
  console.log(`[compute] extraindo ${EXAMES_XLSX_NAME} de ${EXAMES_ZIP}`);
  const xlsxBuf = await extractExamesXlsx();
  console.log(`[compute] lendo ${xlsxBuf.byteLength} bytes (xlsx)`);
  const rows = await readRows(xlsxBuf);
  console.log(`[compute] ${rows.length} linhas válidas (idade ≥ 18 + sexo + região + peso > 0)`);

  for (const stats of summarizeRegions(rows)) {
    console.log(
      `  region=${stats.region.padEnd(13)} n=${String(stats.count).padStart(5)}  Σw=${stats.totalWeight.toExponential(3)}`,
    );
  }

  const cells: MaterializedCell[] = [];
  let suppressed = 0;
  let countrySuppressed = 0;
  for (const analyte of Object.keys(ANALYTE_TO_COLUMN_2014_2015) as PnsAnalyte[]) {
    for (const region of Object.values(REGION_CODE_TO_MACRO_REGION_2014_2015)) {
      for (const ageBand of AGE_BANDS) {
        for (const sex of ['M', 'F'] as const) {
          const obs: Observation[] = [];
          for (const row of rows) {
            if (row.region !== region || row.sex !== sex) continue;
            if (ageBandFor(row.age) !== ageBand) continue;
            const v = row.values[analyte];
            if (v === undefined) continue;
            obs.push({ value: v, weight: row.weight });
          }
          const cell = materializeCell({ ageBand, analyte, region, sex, wave: '2014-2015' }, obs);
          if (cell) cells.push(cell);
          else suppressed += 1;
        }
      }
    }
  }

  // Country-level cells: aggregate all observations across regions with the
  // PNS lab-subsample weight (`w_pes`). PNS is nationally representative —
  // pooling all observations and computing a single weighted percentile
  // produces the correct country-wide result. NOT a post-hoc average of
  // regional percentiles (that would be wrong).
  for (const analyte of Object.keys(ANALYTE_TO_COLUMN_2014_2015) as PnsAnalyte[]) {
    for (const ageBand of AGE_BANDS) {
      for (const sex of ['M', 'F'] as const) {
        const obs: Observation[] = [];
        for (const row of rows) {
          if (row.sex !== sex) continue;
          if (ageBandFor(row.age) !== ageBand) continue;
          const v = row.values[analyte];
          if (v === undefined) continue;
          obs.push({ value: v, weight: row.weight });
        }
        const cell = materializeCell(
          { ageBand, analyte, region: PNS_COUNTRY, sex, wave: '2014-2015' },
          obs,
        );
        if (cell) cells.push(cell);
        else countrySuppressed += 1;
      }
    }
  }

  console.log(
    `[compute] ${cells.length} células materializadas (regionais + Brasil), ` +
      `${suppressed} regionais suprimidas, ${countrySuppressed} Brasil suprimidas ` +
      `(n<${30} ou faltando)`,
  );

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, 'cells.json');
  await writeFile(outPath, `${JSON.stringify(cells, null, 2)}\n`);
  console.log(`[compute] cells.json gravado em ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
