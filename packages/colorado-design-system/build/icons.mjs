import { icons as phosphorIcons } from '@phosphor-icons/core';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  copyFile,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import iconVariants from './uswds-icon-variants.json' with { type: 'json' };
import componentVariants from './component-icon-variants.json' with { type: 'json' };

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(packageRoot, 'src/icons/approved-icons.json');
// Committed, deterministic output; verified by `icons:check` like tokens.
export const generatedDir = resolve(packageRoot, 'generated/icons');
const committedFiles = ['sprite.svg', 'catalog.json'];
const phosphorRoot = resolve(
  dirname(fileURLToPath(import.meta.resolve('@phosphor-icons/core'))),
  '..',
);
const phosphorVersion = JSON.parse(
  readFileSync(resolve(phosphorRoot, 'package.json'), 'utf8'),
).version;
const sha256 = (contents) =>
  createHash('sha256').update(contents).digest('hex');
const sourcePath = (id) => resolve(phosphorRoot, 'assets/regular', `${id}.svg`);

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest))
    throw new Error('Approved icon manifest must be a JSON object');
  if (
    manifest.source?.package !== '@phosphor-icons/core' ||
    manifest.source.version !== phosphorVersion ||
    manifest.source.license !== 'MIT' ||
    manifest.weight !== 'regular'
  ) {
    throw new Error(
      `Icon manifest source metadata must match @phosphor-icons/core ${phosphorVersion} (MIT, Regular).`,
    );
  }
  if (!Array.isArray(manifest.icons))
    throw new Error('Approved icon manifest must contain an icons array');
  return manifest;
}

function loadManifest() {
  return validateManifest(JSON.parse(readFileSync(manifestPath, 'utf8')));
}

// Background-image SVGs cannot inherit a control's currentColor. Explicit
// component variants retain the reviewed foreground and its token provenance.
export function validateComponentIconVariants(variants) {
  if (!variants || typeof variants !== 'object' || Array.isArray(variants))
    throw new Error('Component icon variants must be a JSON object');
  const tokens = JSON.parse(
    readFileSync(
      resolve(packageRoot, '../colorado-design-tokens/generated/tokens.json'),
      'utf8',
    ),
  );
  const approved = new Set(loadManifest().icons);
  for (const [name, variant] of Object.entries(variants)) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || !approved.has(variant.id))
      throw new Error(
        `Component icon variant ${name} must use an approved icon ID`,
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
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(variant.component)
    )
      throw new Error(
        `Component icon variant ${name} must identify its component`,
      );
  }
  return Object.values(variants);
}

function iconEntries(manifest = loadManifest()) {
  const catalog = new Map(phosphorIcons.map((icon) => [icon.name, icon]));
  const seen = new Set();
  const entries = [];

  for (const name of manifest.icons) {
    if (typeof name !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))
      throw new Error(`Invalid Phosphor icon ID in manifest: ${name}`);
    if (seen.has(name)) continue;
    const icon = catalog.get(name);
    if (!icon) throw new Error(`Unknown Phosphor icon ID in manifest: ${name}`);
    seen.add(name);
    entries.push(icon);
  }
  if (entries.length === 0) throw new Error('Approved icon manifest is empty');
  return entries;
}

function svgSymbol(name, source) {
  const match = /^<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/.exec(source.trim());
  if (!match) throw new Error(`Unexpected Phosphor SVG format for ${name}`);
  const viewBox = /\bviewBox="([^"]+)"/.exec(match[1])?.[1];
  if (!viewBox) throw new Error(`Phosphor SVG has no viewBox: ${name}`);
  const fill = /\bfill="([^"]+)"/.exec(match[1])?.[1];
  return `<symbol id="${name}" viewBox="${viewBox}"${fill ? ` fill="${fill}"` : ''}>${match[2]}</symbol>`;
}

// Returns the committed outputs: the sprite, and a catalog whose per-icon
// hashes also verify the individual SVGs copied into dist.
async function iconOutputs() {
  const manifest = loadManifest();
  const symbols = [];
  const icons = [];
  for (const icon of iconEntries(manifest)) {
    const source = await readFile(sourcePath(icon.name), 'utf8');
    symbols.push(svgSymbol(icon.name, source));
    icons.push({
      id: icon.name,
      phosphorCategories: [...icon.categories],
      sha256: sha256(source),
    });
  }
  const catalog = {
    source: { ...manifest.source },
    weight: manifest.weight,
    categoryMetadata: {
      phosphorCategories: 'Phosphor taxonomy',
    },
    icons,
  };
  return new Map([
    [
      'sprite.svg',
      `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`,
    ],
    ['catalog.json', `${JSON.stringify(catalog, null, 2)}\n`],
  ]);
}

export async function generateIcons(outputDir = generatedDir) {
  validateComponentIconVariants(componentVariants);
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });
  for (const [name, contents] of await iconOutputs()) {
    await writeFile(resolve(outputDir, name), contents);
  }
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
      `Generated icon output differs from the approved manifest and pinned @phosphor-icons/core (${problems.join(', ')}). Run \`pnpm icons:build\` and commit the result.`,
    );
}

// Builds dist/icons from the committed output. Individual SVGs come from the
// pinned package and must match the committed hashes.
export async function writeDistIcons(distIconsDir, sourceDir = generatedDir) {
  const variants = [
    ...Object.values(iconVariants),
    ...validateComponentIconVariants(componentVariants),
  ];
  const catalog = JSON.parse(
    await readFile(resolve(sourceDir, 'catalog.json'), 'utf8'),
  );
  await rm(distIconsDir, { recursive: true, force: true });
  await mkdir(distIconsDir, { recursive: true });
  for (const { id, sha256: expected } of catalog.icons) {
    const source = await readFile(sourcePath(id), 'utf8');
    if (sha256(source) !== expected)
      throw new Error(
        `Phosphor icon ${id} does not match the committed hash. Run \`pnpm icons:build\` and commit the result.`,
      );
    const sized = source.replace(/^<svg\b/, '<svg width="24" height="24"');
    await writeFile(resolve(distIconsDir, `${id}.svg`), sized);
    for (const variant of variants) {
      if (variant.id !== id) continue;
      if (!/\bfill="currentColor"/.test(sized))
        throw new Error(`Phosphor icon ${id} has no currentColor fill`);
      await writeFile(
        resolve(distIconsDir, `${id}--${variant.color}.svg`),
        sized.replaceAll('currentColor', `#${variant.color}`),
      );
    }
  }
  for (const { id } of variants)
    if (!catalog.icons.some((icon) => icon.id === id))
      throw new Error(
        `USWDS icon replacement ${id} is not in the approved catalog`,
      );
  for (const name of committedFiles)
    await copyFile(resolve(sourceDir, name), resolve(distIconsDir, name));
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
      console.log('Phosphor icon output matches the approved manifest.');
    } else {
      await generateIcons();
      const { size } = await stat(resolve(generatedDir, 'sprite.svg'));
      console.log(
        `Generated ${iconEntries().length} approved Phosphor icons (${size} byte sprite).`,
      );
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
