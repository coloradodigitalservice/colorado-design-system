import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCatalog, packageRoot } from './validate.mjs';
import { checkContrast } from './contrast.mjs';
import { compareOutputs, generate } from './build.mjs';

try {
  const [command, ...extra] = process.argv.slice(2);
  if (extra.length || !['validate', 'build', 'check'].includes(command))
    throw new Error('Usage: node scripts/cli.mjs validate|build|check');
  const catalog = await loadCatalog();
  const pairs = await checkContrast(catalog);
  if (command === 'build')
    await generate(join(packageRoot, 'generated'), catalog);
  if (command === 'check') {
    const temporary = await mkdtemp(join(tmpdir(), 'cods-tokens-'));
    try {
      await generate(temporary, catalog);
      await compareOutputs(temporary, join(packageRoot, 'generated'));
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  }
  process.stdout.write(
    `Tokens ${command}: ${catalog.tokens.size} validated tokens, ${pairs.length} contrast pairs\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
