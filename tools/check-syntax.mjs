/**
 * Extrai o(s) módulo(s) ES embutidos em index.html e valida a sintaxe com `node --check`.
 * É um portão barato (sem dependências) contra erros de edição no arquivo principal,
 * já que ele não passa por nenhum build.
 *
 * Uso: node tools/check-syntax.mjs
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const html = readFileSync('index.html', 'utf8');
const modulos = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map((m) => m[1]);

if (modulos.length === 0) {
  console.error('check-syntax: nenhum <script type="module"> encontrado em index.html');
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), 'sistemasolar3d-'));
try {
  modulos.forEach((codigo, i) => {
    const arquivo = join(dir, `modulo-${i}.mjs`);
    writeFileSync(arquivo, codigo);
    execFileSync(process.execPath, ['--check', arquivo], { stdio: 'inherit' });
  });
  console.log(`check-syntax: OK (${modulos.length} módulo(s) verificado(s))`);
} catch {
  console.error('\ncheck-syntax: FALHOU — há erro de sintaxe no módulo embutido em index.html.');
  process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
