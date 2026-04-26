/**
 * Emite `build/2014-2015/provenance.json` com:
 *   - SHA256 de cada arquivo bruto (vindo do manifest do fetcher)
 *   - SHA256 da tabela materializada
 *   - git SHA do commit corrente (best-effort)
 *   - versão de @precisa-saude/pns que gerou a tabela
 *   - timestamp ISO
 *
 * Provenance é o contrato com auditores e com tickets futuros que
 * precisam reproduzir a versão que rodou.
 */
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

async function sha256OfFile(path: string): Promise<string> {
  const buf = await readFile(path);
  return createHash('sha256').update(buf).digest('hex');
}

function gitSha(): string | null {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const here = dirname(fileURLToPath(import.meta.url));
  const buildDir = resolve(here, '..', 'build', '2014-2015');
  const manifestPath = resolve(buildDir, 'manifest.json');
  const cellsPath = resolve(buildDir, 'cells.json');

  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8')) as {
    files: ReadonlyArray<{ localName: string; sha256: string; bytes: number }>;
    fetchedAt: string;
  };

  let cellsSha: string | null = null;
  try {
    cellsSha = await sha256OfFile(cellsPath);
  } catch {
    cellsSha = null;
  }

  const pnsPkg = JSON.parse(
    await readFile(resolve(here, '..', '..', 'pns-core', 'package.json'), 'utf-8'),
  ) as { version: string };

  const out = {
    cellsSha256: cellsSha,
    emittedAt: new Date().toISOString(),
    fetchedAt: manifest.fetchedAt,
    gitSha: gitSha(),
    pnsCoreVersion: pnsPkg.version,
    rawFiles: manifest.files,
    wave: '2014-2015',
  };
  await writeFile(resolve(buildDir, 'provenance.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log(`[provenance] gravado em ${resolve(buildDir, 'provenance.json')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
