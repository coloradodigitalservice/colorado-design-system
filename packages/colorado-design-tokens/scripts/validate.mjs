import { readFile, readdir } from 'node:fs/promises';
import { URL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
import Ajv from 'ajv';
import { parseTree } from 'jsonc-parser';

export const packageRoot = fileURLToPath(new URL('../', import.meta.url));
export const aliasPattern = /^\{([a-z0-9-]+\.[a-z0-9-]+)\}$/;
const schema = JSON.parse(
  await readFile(new URL('../profile.schema.json', import.meta.url), 'utf8'),
);
const validateProfile = new Ajv({ allErrors: true, strict: true }).compile(
  schema,
);

// JSON.parse silently discards repeated keys. Inspect the syntax tree first.
export function parseSource(text, file) {
  const errors = [];
  const tree = parseTree(text, errors, {
    disallowComments: true,
    allowTrailingComma: false,
  });
  if (!tree || errors.length) throw new Error(`${file}: invalid JSON`);
  function visit(node, path) {
    if (node.type === 'object') {
      const seen = new Set();
      for (const property of node.children ?? []) {
        const [key, value] = property.children;
        if (seen.has(key.value))
          throw new Error(`${file}: duplicate key ${path}${key.value}`);
        seen.add(key.value);
        visit(value, `${path}${key.value}.`);
      }
    } else {
      for (const child of node.children ?? []) visit(child, path);
    }
  }
  visit(tree, '');
  return JSON.parse(text);
}

export function validateDocuments(documents) {
  const tokens = new Map();
  const names = new Map();
  const merged = {};
  for (const { file, data } of documents) {
    if (!validateProfile(data)) {
      throw new Error(
        `${file}: invalid DTCG project profile\n${validateProfile.errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('\n')}`,
      );
    }
    for (const [group, entries] of Object.entries(data)) {
      merged[group] ??= {};
      for (const [key, token] of Object.entries(entries)) {
        const path = `${group}.${key}`;
        const name = `${group}-${key}`;
        if (tokens.has(path))
          throw new Error(`${file}: duplicate token path ${path}`);
        if (names.has(name))
          throw new Error(
            `${file}: generated-name collision ${name}: ${names.get(name)} and ${path}`,
          );
        names.set(name, path);
        tokens.set(path, { ...token, file, name });
        merged[group][key] = token;
      }
    }
  }
  if (!tokens.size) throw new Error('No tokens found');
  const resolved = new Map();
  function resolve(path, trail = []) {
    if (trail.includes(path))
      throw new Error(`Alias cycle: ${[...trail, path].join(' -> ')}`);
    if (resolved.has(path)) return resolved.get(path);
    const token = tokens.get(path);
    const target =
      typeof token.$value === 'string'
        ? token.$value.match(aliasPattern)?.[1]
        : undefined;
    let value = token.$value;
    if (target) {
      const referenced = tokens.get(target);
      if (!referenced)
        throw new Error(
          `${token.file}: ${path}: missing alias target ${target}`,
        );
      if (referenced.$type !== token.$type)
        throw new Error(
          `${token.file}: ${path}: incompatible alias type ${token.$type} -> ${referenced.$type} (${target})`,
        );
      value = resolve(target, [...trail, path]);
    }
    resolved.set(path, value);
    return value;
  }
  for (const path of tokens.keys()) resolve(path);
  return { tokens, resolved, merged };
}

export async function loadCatalog(directory = join(packageRoot, 'src')) {
  const files = (await readdir(directory))
    .filter((name) => name.endsWith('.tokens.json'))
    .sort();
  const documents = await Promise.all(
    files.map(async (file) => ({
      file,
      data: parseSource(await readFile(join(directory, file), 'utf8'), file),
    })),
  );
  return validateDocuments(documents);
}
