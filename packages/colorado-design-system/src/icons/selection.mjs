import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const iconId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const svgEnd = '</svg>\n';

export function readIconLibrary(
  directory = fileURLToPath(new URL('.', import.meta.url)),
) {
  const catalog = JSON.parse(
    readFileSync(resolve(directory, 'catalog.json'), 'utf8'),
  );
  const sprite = readFileSync(resolve(directory, 'sprite.svg'), 'utf8');
  if (
    catalog.source?.package !== '@phosphor-icons/core' ||
    catalog.source?.license !== 'MIT' ||
    typeof catalog.source?.version !== 'string' ||
    catalog.weight !== 'regular' ||
    !Array.isArray(catalog.icons) ||
    catalog.icons.length === 0 ||
    catalog.icons.some((id) => typeof id !== 'string' || !iconId.test(id)) ||
    new Set(catalog.icons).size !== catalog.icons.length
  )
    throw new Error('Invalid Phosphor Regular icon index');
  if (
    createHash('sha256').update(sprite).digest('hex') !== catalog.spriteSha256
  )
    throw new Error('Phosphor sprite does not match the icon index SHA-256');

  const header =
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"><!--\n(MIT License\n[\s\S]*?)\n-->/.exec(
      sprite,
    );
  if (!header || header[1].includes('--'))
    throw new Error('Phosphor sprite is missing its embedded MIT notice');
  const symbols = new Map();
  for (const match of sprite.matchAll(
    /<symbol id="([a-z0-9-]+)"[^>]*>[\s\S]*?<\/symbol>/g,
  )) {
    if (symbols.has(match[1]))
      throw new Error(`Duplicate Phosphor symbol: ${match[1]}`);
    symbols.set(match[1], match[0]);
  }
  if (
    JSON.stringify([...symbols.keys()]) !== JSON.stringify(catalog.icons) ||
    `${header[0]}${[...symbols.values()].join('')}${svgEnd}` !== sprite
  )
    throw new Error('Phosphor sprite symbols do not match the icon index');
  return {
    catalog,
    sprite,
    symbols,
    header: header[0],
    license: `${header[1]}\n`,
  };
}

function location(label, contents, offset) {
  return `${label}:${contents.slice(0, offset).split('\n').length}`;
}

function referenceValue(contents, start) {
  if (contents.startsWith('${', start)) {
    const end = contents.indexOf('}', start + 2);
    if (end === -1) return contents.slice(start);
    let value = contents.slice(start, end + 1);
    const suffix = /^[a-z0-9_$-]+/i.exec(contents.slice(end + 1));
    if (suffix) value += suffix[0];
    return value;
  }
  const value = /^[^\s"'`\\<>]*/.exec(contents.slice(start))[0];
  return value.replace(/&(?:quot|apos|#34|#39|#x22|#x27);.*$/i, '');
}

function validateSuffix(contents, start, value, where, allowDynamic) {
  if (!allowDynamic && /^['"`]\s*\+/.test(contents.slice(start + value.length)))
    throw new Error(
      `${where}: concatenated Phosphor icon IDs cannot be selected statically; use literal IDs or explicitly select full-sprite mode`,
    );
}

function addReference(library, ids, value, where, allowDynamic) {
  if (value.startsWith('${')) {
    const choices =
      /^\$\{\s*[^{}?:]+\?\s*(['"])([a-z0-9-]+)\1\s*:\s*(['"])([a-z0-9-]+)\3\s*\}$/.exec(
        value,
      );
    if (choices) {
      addReference(library, ids, choices[2], where, false);
      addReference(library, ids, choices[4], where, false);
      return;
    }
    if (allowDynamic) return;
    throw new Error(
      `${where}: dynamic Phosphor icon reference ${JSON.stringify(value)} cannot be selected statically; use literal IDs or explicitly select full-sprite mode`,
    );
  }
  if (!value) {
    if (allowDynamic) return;
    throw new Error(
      `${where}: missing or dynamic Phosphor icon ID; use a literal ID or explicitly select full-sprite mode`,
    );
  }
  if (!iconId.test(value) || !library.symbols.has(value))
    throw new Error(
      `${where}: unknown Phosphor Regular icon ID ${JSON.stringify(value)}`,
    );
  ids.add(value);
}

export function collectIconReferences(
  library,
  contents,
  label = 'input',
  { allowDynamic = false } = {},
) {
  const ids = new Set();
  const direct = /(?:^|\/|["'`(=\s])icons\/sprite\.svg#/g;
  for (const match of contents.matchAll(direct)) {
    const start = match.index + match[0].length;
    const value = referenceValue(contents, start);
    const where = location(label, contents, start - 'icons/sprite.svg#'.length);
    validateSuffix(contents, start, value, where, allowDynamic);
    addReference(library, ids, value, where, allowDynamic);
  }

  const imports =
    /import\s+([$\w]+)\s+from\s+['"]@coloradodigitalservice\/colorado-design-system\/icons\/sprite\.svg(?:\?url)?['"]/g;
  for (const match of contents.matchAll(imports)) {
    const binding = match[1].replace(/[$]/g, '\\$&');
    const references = new RegExp(
      `(?:\\$\\{\\s*${binding}\\s*\\}#|\\b${binding}\\s*\\+\\s*['"\`]#)`,
      'g',
    );
    for (const reference of contents.matchAll(references)) {
      const start = reference.index + reference[0].length;
      const value = referenceValue(contents, start);
      const where = location(label, contents, reference.index);
      validateSuffix(contents, start, value, where, allowDynamic);
      addReference(library, ids, value, where, allowDynamic);
    }
  }

  if (!allowDynamic && /icons\/sprite\.svg['"`]\s*\+\s*['"`]#/.test(contents))
    throw new Error(
      `${label}: concatenated Phosphor sprite references cannot be selected statically; use literal IDs or explicitly select full-sprite mode`,
    );
  return ids;
}

export function createSubsetSprite(library, ids) {
  const requested = new Set(ids);
  for (const id of requested)
    if (!library.symbols.has(id))
      throw new Error(`Unknown Phosphor Regular icon ID ${JSON.stringify(id)}`);
  return `${library.header}${library.catalog.icons
    .filter((id) => requested.has(id))
    .map((id) => library.symbols.get(id))
    .join('')}${svgEnd}`;
}

function standaloneSymbol(library, name, where = '') {
  const variant = /^([a-z0-9-]+)--([a-f0-9]{6})$/.exec(name);
  const id = variant?.[1] ?? name;
  const symbol = library.symbols.get(id);
  if (!symbol || (!variant && !iconId.test(name)))
    throw new Error(
      `${where ? `${where}: ` : ''}unknown Phosphor Regular icon ID ${JSON.stringify(name)}`,
    );
  return { id, symbol, color: variant?.[2] };
}

export function createStandaloneSvg(library, name) {
  const { id, symbol, color } = standaloneSymbol(library, name);
  let svg = symbol
    .replace(
      /^<symbol id="[^"]+"/,
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"',
    )
    .replace(/<\/symbol>$/, '</svg>\n');
  if (color) {
    if (!svg.includes('currentColor'))
      throw new Error(`Phosphor icon ${id} has no currentColor fill`);
    svg = svg.replaceAll('currentColor', `#${color}`);
  }
  return svg;
}

export function collectStandaloneReferences(
  library,
  contents,
  label = 'input',
) {
  const files = new Set();
  for (const match of contents.matchAll(
    /url\(\s*(["']?)([^"'()\s]+)\1\s*\)/gi,
  )) {
    const name = /(?:^|\/)icons\/([^/?#]+)\.svg(?:[?#].*)?$/.exec(
      match[2],
    )?.[1];
    if (!name || name === 'sprite') continue;
    standaloneSymbol(library, name, location(label, contents, match.index));
    files.add(`${name}.svg`);
  }
  return files;
}
