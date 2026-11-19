import { icons as phosphorIcons } from '@phosphor-icons/core';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  chmod,
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  createStandaloneSvg,
  readIconLibrary,
} from '../src/icons/selection.mjs';
import iconVariants from './uswds-icon-variants.json' with { type: 'json' };
import componentVariants from './component-icon-variants.json' with { type: 'json' };

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const generatedDir = resolve(packageRoot, 'generated/icons');
const committedFiles = ['sprite.svg', 'catalog.json'];
const toolFiles = [
  'selection.mjs',
  'selection.d.ts',
  'vite.mjs',
  'vite.d.ts',
  'cli.mjs',
];
const phosphorRoot = resolve(
  dirname(fileURLToPath(import.meta.resolve('@phosphor-icons/core'))),
  '..',
);
const phosphorVersion = JSON.parse(
  readFileSync(resolve(phosphorRoot, 'package.json'), 'utf8'),
).version;
const pinnedVersion = JSON.parse(
  readFileSync(resolve(packageRoot, 'package.json'), 'utf8'),
).devDependencies['@phosphor-icons/core'];
const sha256 = (contents) =>
  createHash('sha256').update(contents).digest('hex');
const sourcePath = (id) => resolve(phosphorRoot, 'assets/regular', `${id}.svg`);
const iconId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function iconIds() {
  if (pinnedVersion !== phosphorVersion)
    throw new Error(
      `The installed Phosphor version ${phosphorVersion} does not match the exact pin ${pinnedVersion}`,
    );
  const ids = phosphorIcons.map(({ name }) => name).sort();
  if (
    !ids.length ||
    ids.some((id) => !iconId.test(id)) ||
    new Set(ids).size !== ids.length
  )
    throw new Error(
      'Phosphor Regular inventory contains invalid or duplicate IDs',
    );
  return ids;
}

export function validateComponentIconVariants(variants) {
  if (!variants || typeof variants !== 'object' || Array.isArray(variants))
    throw new Error('Component icon variants must be a JSON object');
  const tokens = JSON.parse(
    readFileSync(
      resolve(packageRoot, '../colorado-design-tokens/generated/tokens.json'),
      'utf8',
    ),
  );
  const available = new Set(iconIds());
  for (const [name, variant] of Object.entries(variants)) {
    if (!iconId.test(name) || !available.has(variant.id))
      throw new Error(
        `Component icon variant ${name} must use a Phosphor Regular icon ID`,
      );
    if (
      typeof variant.color !== 'string' ||
      !/^[a-f0-9]{6}$/.test(variant.color) ||
      tokens[variant.token] !== `#${variant.color}`
    )
      throw new Error(
        `Component icon variant ${name} foreground must match its source token`,
      );
    if (
      typeof variant.component !== 'string' ||
      !iconId.test(variant.component)
    )
      throw new Error(
        `Component icon variant ${name} must identify its component`,
      );
  }
  return Object.values(variants);
}

export function svgSymbol(name, source) {
  const match = /^<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/.exec(source.trim());
  if (!match) throw new Error(`Unexpected Phosphor SVG format for ${name}`);
  const parsedAttributes = [
    ...match[1].matchAll(/\s+([a-zA-Z_:][\w:.-]*)="([^"]*)"/g),
  ];
  const attributes = new Map(
    parsedAttributes.map(([, key, value]) => [key, value]),
  );
  const remaining = match[1]
    .replace(/\s+[a-zA-Z_:][\w:.-]*="[^"]*"/g, '')
    .trim();
  if (
    remaining ||
    parsedAttributes.length !== 3 ||
    attributes.size !== 3 ||
    attributes.get('xmlns') !== 'http://www.w3.org/2000/svg' ||
    attributes.get('fill') !== 'currentColor' ||
    !attributes.get('viewBox') ||
    /(?:\s(?:id|href|xlink:href)\s*=|<\s*(?:defs|style)\b|url\(\s*#)/i.test(
      match[2],
    )
  )
    throw new Error(
      `Unsupported Phosphor SVG attributes or references for ${name}`,
    );
  return `<symbol id="${name}" viewBox="${attributes.get('viewBox')}" fill="currentColor">${match[2]}</symbol>`;
}

async function iconOutputs() {
  const ids = iconIds();
  const symbols = [];
  for (const id of ids)
    symbols.push(svgSymbol(id, await readFile(sourcePath(id), 'utf8')));
  const license = (await readFile(resolve(phosphorRoot, 'LICENSE'), 'utf8'))
    .replaceAll('\r\n', '\n')
    .trimEnd();
  if (!license.startsWith('MIT License\n') || license.includes('--'))
    throw new Error('Phosphor license cannot be embedded as an SVG comment');
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg"><!--\n${license}\n-->${symbols.join('')}</svg>\n`;
  const catalog = {
    source: {
      package: '@phosphor-icons/core',
      version: phosphorVersion,
      license: 'MIT',
    },
    weight: 'regular',
    spriteSha256: sha256(sprite),
    icons: ids,
  };
  return new Map([
    ['sprite.svg', sprite],
    ['catalog.json', `${JSON.stringify(catalog)}\n`],
  ]);
}

export async function generateIcons(outputDir = generatedDir) {
  validateComponentIconVariants(componentVariants);
  await mkdir(outputDir, { recursive: true });
  for (const [name, contents] of await iconOutputs())
    await writeFile(resolve(outputDir, name), contents);
}

export async function checkIcons(outputDir = generatedDir) {
  validateComponentIconVariants(componentVariants);
  const problems = [];
  for (const [name, expected] of await iconOutputs()) {
    let actual;
    try {
      actual = await readFile(resolve(outputDir, name), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (actual === undefined) problems.push(`missing: ${name}`);
    else if (actual !== expected) problems.push(`out of date: ${name}`);
  }
  if (problems.length)
    throw new Error(
      `Generated icon output differs from pinned @phosphor-icons/core (${problems.join(', ')}). Run \`pnpm icons:build\` and commit the result.`,
    );
}

export async function writeDistIcons(
  distIconsDir,
  { sourceDir = generatedDir, files = [] } = {},
) {
  const library = readIconLibrary(sourceDir);
  const variants = new Map(
    [
      ...Object.values(iconVariants),
      ...validateComponentIconVariants(componentVariants),
    ].map(({ id, color }) => [`${id}--${color}`, { id, color }]),
  );
  const standalone = new Map();
  for (const file of new Set(files)) {
    const name = /^([a-z0-9-]+)\.svg$/.exec(file)?.[1];
    if (!name) throw new Error(`Invalid packaged icon filename: ${file}`);
    const variant = variants.get(name);
    const id = variant?.id ?? name;
    if (!library.symbols.has(id) || (name.includes('--') && !variant))
      throw new Error(`Unknown packaged Phosphor icon: ${file}`);
    standalone.set(file, createStandaloneSvg(library, name));
  }

  await rm(distIconsDir, { recursive: true, force: true });
  await mkdir(distIconsDir, { recursive: true });
  for (const [file, svg] of standalone)
    await writeFile(resolve(distIconsDir, file), svg);
  for (const name of committedFiles)
    await copyFile(resolve(sourceDir, name), resolve(distIconsDir, name));
  for (const name of toolFiles)
    await copyFile(
      resolve(packageRoot, 'src/icons', name),
      resolve(distIconsDir, name),
    );
  await chmod(resolve(distIconsDir, 'cli.mjs'), 0o755);
  await copyFile(
    resolve(phosphorRoot, 'LICENSE'),
    resolve(distIconsDir, 'LICENSE'),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    if (process.argv.includes('--check')) {
      await checkIcons();
      console.log('Phosphor Regular icon output matches the pinned source.');
    } else {
      await generateIcons();
      const { size } = await stat(resolve(generatedDir, 'sprite.svg'));
      console.log(
        `Generated ${iconIds().length} Phosphor Regular icons (${size} byte sprite).`,
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
