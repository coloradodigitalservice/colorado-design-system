import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import StyleDictionary from 'style-dictionary';
import { aliasPattern, loadCatalog } from './validate.mjs';

export const outputFiles = [
  'tokens.css',
  '_tokens.scss',
  'tokens.json',
  'tokens.d.ts',
];
export function formatValue(type, value) {
  if (type === 'color') {
    const channels = [
      ...value.components,
      ...(value.alpha === 1 ? [] : [value.alpha]),
    ];
    return `#${channels
      .map((c) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  }
  if (type === 'dimension') return `${value.value}${value.unit}`;
  if (type === 'fontFamily')
    return (Array.isArray(value) ? value : [value])
      .map((family) => JSON.stringify(family))
      .join(', ');
  return value;
}
const header =
  'Generated from reviewed DTCG sources. Do not edit; run pnpm tokens:build.';
StyleDictionary.registerTransform({
  name: 'cods/value',
  type: 'value',
  transform: (token) => formatValue(token.$type, token.$value),
});
for (const kind of ['css', 'sass', 'json', 'types']) {
  StyleDictionary.registerFormat({
    name: `cods/${kind}`,
    format: ({ dictionary }) => {
      const tokens = [...dictionary.allTokens].sort((a, b) =>
        a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
      );
      if (kind === 'css') {
        return `/* ${header} */\n:root {\n${tokens
          .map((t) => {
            const reference =
              typeof t.original.$value === 'string'
                ? t.original.$value.match(aliasPattern)?.[1]
                : undefined;
            return `  --cods-${t.name}: ${reference ? `var(--cods-${reference.replace('.', '-')})` : t.$value};`;
          })
          .join('\n')}\n}\n`;
      }
      if (kind === 'sass')
        return `// ${header}\n${tokens.map((t) => `$${t.name}: ${t.$value};`).join('\n')}\n`;
      if (kind === 'json')
        return `${JSON.stringify(Object.fromEntries(tokens.map((t) => [t.name, t.$value])), null, 2)}\n`;
      return `// ${header}\nexport interface TokenDictionary {\n${tokens.map((t) => `  readonly ${JSON.stringify(t.name)}: ${typeof t.$value === 'number' ? 'number' : 'string'};`).join('\n')}\n}\nexport type TokenName = keyof TokenDictionary;\ndeclare const tokens: TokenDictionary;\nexport default tokens;\n`;
    },
  });
}

export async function generate(outputDirectory, catalog) {
  catalog ??= await loadCatalog();
  const dictionary = new StyleDictionary({
    usesDtcg: true,
    tokens: catalog.merged,
    log: {
      verbosity: 'silent',
      warnings: 'error',
      errors: { brokenReferences: 'throw' },
    },
    platforms: {
      cods: {
        transforms: ['name/kebab', 'cods/value'],
        files: outputFiles.map((destination, index) => ({
          destination,
          format: `cods/${['css', 'sass', 'json', 'types'][index]}`,
        })),
      },
    },
  });
  const files = await dictionary.formatPlatform('cods');
  await mkdir(outputDirectory, { recursive: true });
  for (const file of files)
    await writeFile(join(outputDirectory, file.destination), file.output);
}

// Compare the whole file set, including unexpected files and nested directories.
export async function compareOutputs(expectedDirectory, actualDirectory) {
  const expected = (await readdir(expectedDirectory)).sort();
  let actual;
  try {
    actual = (await readdir(actualDirectory)).sort();
  } catch (error) {
    if (error.code === 'ENOENT')
      throw new Error('Generated directory is missing; run pnpm tokens:build', {
        cause: error,
      });
    throw error;
  }
  if (JSON.stringify(expected) !== JSON.stringify(actual))
    throw new Error(
      `Generated file set differs: expected ${expected.join(', ')}; found ${actual.join(', ')}. Run pnpm tokens:build and review deletions.`,
    );
  for (const name of expected) {
    if (
      !(await readFile(join(expectedDirectory, name))).equals(
        await readFile(join(actualDirectory, name)),
      )
    )
      throw new Error(`Generated-file drift: ${name}. Run pnpm tokens:build`);
  }
}
