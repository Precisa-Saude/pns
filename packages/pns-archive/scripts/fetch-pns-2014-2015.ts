/**
 * Baixa o microdado da subamostra laboratorial da PNS 2014–2015.
 *
 * A subamostra laboratorial é distribuída em DOIS lugares (não há um
 * único mirror autoritativo):
 *
 *   1. **IBGE FTP** — microdado principal da PNS 2013 (1484 colunas, fixed-width)
 *      e o dicionário oficial. Necessário se quisermos linkar com UF/UPA
 *      no futuro (acordo de microdado restrito).
 *   2. **Fiocruz/ICICT HTTPS** — arquivo XLSX da subamostra laboratorial
 *      ("Exames"), com 8.953 indivíduos × 509 colunas, contendo os
 *      analitos `Z***` + peso amostral `peso_lab` + macro-região `regiao`.
 *      Esta é a única fonte pública dos exames laboratoriais.
 *
 * Saídas (relativas a `packages/pns-archive/`):
 *   build/2014-2015/raw/<arquivo>           # tal como veio
 *   build/2014-2015/raw/<arquivo>.sha256
 *   build/2014-2015/manifest.json
 *
 * Reexecução é idempotente: se o SHA256 baixado bater com o esperado,
 * apenas registra. Mismatch = falha alta — schema da onda mudou ou a
 * fonte foi atualizada e precisamos investigar antes de prosseguir.
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Client } from 'basic-ftp';

interface SourceFile {
  /** SHA256 esperado, capturado em download manual auditado. */
  expectedSha256: string;
  /** Nome local em `build/2014-2015/raw/`. */
  localName: string;
  /** Pequena nota explicando a função do arquivo. */
  purpose: string;
  /** Protocolo + URL completa do recurso remoto. */
  url: string;
}

/**
 * SHA256s capturados em 2026-04-26 a partir de download manual auditado.
 * Quando o IBGE/Fiocruz republicar uma versão, atualizar aqui em PR
 * separado e abrir uma issue documentando o que mudou no schema.
 */
const SOURCES: ReadonlyArray<SourceFile> = [
  {
    expectedSha256: 'd31544efdad138f3292ab86c9606cd722bf091781cc86ef371354ba63c9994bb',
    localName: 'PNS2013_Exames.zip',
    purpose:
      'Subamostra laboratorial PNS 2014–2015 (XLSX 8953×509) + dicionário XLSX. Fonte: Fiocruz/ICICT.',
    url: 'https://www.pns.icict.fiocruz.br/wp-content/uploads/2023/05/PNS2013_Exames.zip',
  },
  {
    expectedSha256: '623137c58238293f065a51dc96c490656ce8fcbcfaa777abacc5aa5b94cfb913',
    localName: 'PNS_2013.zip',
    purpose:
      'Microdado principal PNS 2013 (fixed-width, 1484 col). Não usado no MVP de percentis (Exames basta), mantido para futura linkagem UF.',
    url: 'ftp://ftp.ibge.gov.br/PNS/2013/Microdados/Dados/PNS_2013.zip',
  },
  {
    expectedSha256: 'df8c7df2223c3335076000016ef59e486d3a3a40914c5d3e6257a2b1d77b6624',
    localName: 'Dicionario_e_input_20200930.zip',
    purpose: 'Dicionário e input SAS do PNS 2013 main file. Útil quando entrarmos em linkagem.',
    url: 'ftp://ftp.ibge.gov.br/PNS/2013/Microdados/Documentacao/Dicionario_e_input_20200930.zip',
  },
];

async function sha256OfFile(path: string): Promise<string> {
  const buf = await readFile(path);
  return createHash('sha256').update(buf).digest('hex');
}

async function fileExistsWithSize(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isFile() && s.size > 0;
  } catch {
    return false;
  }
}

async function downloadHttps(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function downloadFtp(url: string, dest: string): Promise<void> {
  const u = new URL(url);
  const client = new Client();
  client.ftp.verbose = false;
  try {
    await client.access({ host: u.hostname, secure: false });
    await client.downloadTo(dest, u.pathname);
  } finally {
    client.close();
  }
}

async function ensureSource(
  source: SourceFile,
  outDir: string,
): Promise<{ bytes: number; cached: boolean; localName: string; sha256: string }> {
  const dest = resolve(outDir, source.localName);
  await mkdir(dirname(dest), { recursive: true });

  const cached = await fileExistsWithSize(dest);
  if (cached) {
    const sha = await sha256OfFile(dest);
    if (sha !== source.expectedSha256) {
      throw new Error(
        `SHA256 mismatch para arquivo cacheado ${source.localName}: esperado ${source.expectedSha256}, encontrado ${sha}. Apagar manualmente e re-baixar — não sobrescrever sem auditar.`,
      );
    }
  } else {
    console.log(`[fetch] baixando ${source.url}`);
    if (source.url.startsWith('ftp://')) {
      await downloadFtp(source.url, dest);
    } else {
      await downloadHttps(source.url, dest);
    }
    const sha = await sha256OfFile(dest);
    if (sha !== source.expectedSha256) {
      throw new Error(
        `SHA256 mismatch após download ${source.localName}: esperado ${source.expectedSha256}, recebido ${sha}. Fonte mudou — não prosseguir até auditar.`,
      );
    }
  }

  const buf = await readFile(dest);
  await writeFile(`${dest}.sha256`, `${source.expectedSha256}  ${source.localName}\n`);
  return {
    bytes: buf.byteLength,
    cached,
    localName: source.localName,
    sha256: source.expectedSha256,
  };
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, '..', 'build', '2014-2015', 'raw');
  await mkdir(outDir, { recursive: true });

  const results = [];
  for (const source of SOURCES) {
    results.push(await ensureSource(source, outDir));
  }

  const manifest = {
    fetchedAt: new Date().toISOString(),
    files: results.map((r, i) => ({ ...r, purpose: SOURCES[i]!.purpose, url: SOURCES[i]!.url })),
    wave: '2014-2015',
  };
  const manifestPath = resolve(outDir, '..', 'manifest.json');
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`[fetch] manifest gravado em ${manifestPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
