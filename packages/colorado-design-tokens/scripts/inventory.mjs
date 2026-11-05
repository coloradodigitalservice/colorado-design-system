import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { packageRoot } from './validate.mjs';

// Match catalog namespaces, not component-owned properties such as
// --cods-accordion-background. Keep unknown names in known namespaces so the
// validation reports a missing token instead of silently skipping it.
export function extractTokenDependencies(styles, catalog) {
  const groups = [
    ...new Set([...catalog.tokens.keys()].map((path) => path.split('.')[0])),
  ].sort((a, b) => b.length - a.length);
  const source = styles.replace(
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\((?:\\.|[^)])*\)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,
    (match) => (match.startsWith('/*') || match.startsWith('//') ? ' ' : match),
  );
  const dependencies = new Set();
  const localProperties = new Set(
    [...source.matchAll(/--cods-([a-z0-9-]+)\s*:/g)].map((match) => match[1]),
  );
  const collect = (name) => {
    const group = groups.find((candidate) => name.startsWith(`${candidate}-`));
    if (!group) return;
    const path = `${group}.${name.slice(group.length + 1)}`;
    // A component property may share a catalog prefix, e.g. Link's RTL API.
    // Real catalog tokens still count even when declared as local overrides.
    if (!localProperties.has(name) || catalog.tokens.has(path))
      dependencies.add(path);
  };
  for (const match of source.matchAll(/--cods-([a-z0-9-]+)/g))
    collect(match[1]);
  for (const declaration of source.matchAll(
    /@use\s+['"]@coloradodigitalservice\/colorado-design-tokens['"](?:\s+as\s+([\w*-]+))?/g,
  )) {
    const namespace = declaration[1] ?? 'colorado-design-tokens';
    const pattern =
      namespace === '*'
        ? /\$([a-z0-9-]+)/g
        : new RegExp(
            `${namespace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.\\$([a-z0-9-]+)`,
            'g',
          );
    for (const match of source.matchAll(pattern)) collect(match[1]);
  }
  return [...dependencies].sort();
}

export async function loadImplementationDependencies(catalog) {
  const root = join(packageRoot, '../colorado-design-system/src/components');
  const implementations = new Map();
  async function readStyles(directory) {
    const sources = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) sources.push(...(await readStyles(path)));
      else if (entry.name.endsWith('.scss'))
        sources.push(await readFile(path, 'utf8'));
    }
    return sources;
  }
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(root, entry.name);
    const metadata = JSON.parse(
      await readFile(join(directory, `${entry.name}.metadata.json`), 'utf8'),
    );
    const implementation = {
      directory: entry.name,
      tokens: extractTokenDependencies(
        (await readStyles(directory)).join('\n'),
        catalog,
      ),
    };
    for (const name of metadata.inventoryNames ?? [metadata.displayName]) {
      if (implementations.has(name))
        throw new Error(`Duplicate implementation: ${name}`);
      implementations.set(name, implementation);
    }
  }
  return implementations;
}

export function validateComponentInventory(
  inventory,
  catalog,
  implementations,
) {
  const names = new Set();
  // Shared foundations are validated just like components, but do not expand
  // the approved 28-component delivery scope.
  for (const component of [
    ...inventory.components,
    ...(inventory.sharedFoundations ?? []),
  ]) {
    if (names.has(component.name))
      throw new Error(`Duplicate inventory component: ${component.name}`);
    names.add(component.name);
    const incomplete =
      (component.name === 'Maps' &&
        component.designCoverage === 'reference-only') ||
      (component.name === 'Videos' &&
        component.designCoverage === 'design-incomplete');
    if (!component.tokens.length && !incomplete)
      throw new Error(
        `${component.name}: specify token dependencies or an explicit design gap`,
      );
    const documented = new Set(component.tokens);
    for (const path of [
      ...component.tokens,
      ...component.componentTokens,
      ...component.implementationTokens,
    ]) {
      if (!catalog.tokens.has(path))
        throw new Error(`${component.name}: missing catalog token ${path}`);
      if (!documented.has(path) && !component.componentTokens.includes(path))
        throw new Error(
          `${component.name}: dependency ${path} is absent from tokens`,
        );
    }
    const implementation = implementations.get(component.name);
    if (implementation) {
      if (component.implementationDirectory !== implementation.directory)
        throw new Error(
          `${component.name}: implementation directory is absent or incorrect`,
        );
      for (const path of implementation.tokens) {
        if (
          !documented.has(path) ||
          !component.implementationTokens.includes(path)
        )
          throw new Error(
            `${component.name}: stylesheet dependency ${path} is undocumented`,
          );
      }
      for (const path of component.implementationTokens) {
        if (!implementation.tokens.includes(path))
          throw new Error(
            `${component.name}: stale stylesheet dependency ${path}`,
          );
      }
    } else if (
      component.implementationDirectory ||
      component.implementationTokens.length
    ) {
      throw new Error(
        `${component.name}: recorded implementation does not exist`,
      );
    }
  }
  for (const name of implementations.keys()) {
    if (!names.has(name))
      throw new Error(
        `${name}: implemented component is absent from inventory`,
      );
  }
}

export async function checkComponentInventory(catalog) {
  const inventory = JSON.parse(
    await readFile(
      join(packageRoot, 'references/component-token-inventory.json'),
      'utf8',
    ),
  );
  validateComponentInventory(
    inventory,
    catalog,
    await loadImplementationDependencies(catalog),
  );
}
