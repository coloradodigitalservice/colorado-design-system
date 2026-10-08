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
  const collect = (name) => {
    const group = groups.find((candidate) => name.startsWith(`${candidate}-`));
    if (group) dependencies.add(`${group}.${name.slice(group.length + 1)}`);
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
    implementations.set(metadata.displayName, {
      directory: entry.name,
      tokens: extractTokenDependencies(
        (await readStyles(directory)).join('\n'),
        catalog,
      ),
    });
  }
  return implementations;
}

export function validateComponentInventory(
  inventory,
  catalog,
  implementations,
  evidence,
) {
  const names = new Set();
  for (const component of inventory.components) {
    if (names.has(component.name))
      throw new Error(`Duplicate inventory component: ${component.name}`);
    names.add(component.name);
    const bindings = Object.values(component.foundationBindings ?? {});
    const source = evidence?.components.find(
      (entry) => entry.name === component.name,
    );
    const incomplete =
      (component.name === 'Maps' &&
        component.designCoverage === 'reference-only') ||
      (component.name === 'Videos' &&
        component.designCoverage === 'design-incomplete');
    if (evidence && (!source || source.status !== component.designCoverage))
      throw new Error(
        `${component.name}: source coverage differs from measurement evidence`,
      );
    if (
      (!bindings.length && !incomplete) ||
      bindings.some((paths) => !Array.isArray(paths) || !paths.length)
    )
      throw new Error(
        `${component.name}: specify concrete foundation bindings`,
      );
    const foundationTokens = [
      ...new Set(
        bindings
          .flat()
          .filter(
            (path) =>
              !path.startsWith('color.') && !path.startsWith('component.'),
          ),
      ),
    ].sort();
    if (
      JSON.stringify(foundationTokens) !==
      JSON.stringify(component.foundationTokens)
    )
      throw new Error(
        `${component.name}: foundationTokens differ from foundation bindings`,
      );
    const documented = new Set(component.tokens);
    for (const path of [
      ...bindings.flat(),
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
    const measured = new Set();
    for (const measurement of component.foundationMeasurements ?? []) {
      const { binding, token, value, property } = measurement;
      if (!component.foundationBindings[binding]?.includes(token))
        throw new Error(
          `${component.name}: measured binding ${binding} is undocumented`,
        );
      if (JSON.stringify(catalog.resolved.get(token)) !== JSON.stringify(value))
        throw new Error(
          `${component.name}: measured value differs from ${token}`,
        );
      if (source) {
        const properties =
          source.measurements[measurement.measurement]?.properties;
        let observed = property
          .split('.')
          .reduce((result, key) => result?.[key], properties);
        if (property === 'fontName.style') {
          observed = {
            Regular: 400,
            Normal: 400,
            SemiBold: 600,
            Semibold: 600,
            Medium: 500,
            500: 500,
          }[observed];
        } else if (typeof value === 'object' && value.unit === 'px') {
          observed = {
            value:
              property === 'lineHeight'
                ? observed?.units === 'PIXELS'
                  ? observed.value
                  : undefined
                : observed,
            unit: 'px',
          };
        }
        if (JSON.stringify(observed) !== JSON.stringify(value))
          throw new Error(
            `${component.name}: binding ${binding} differs from source measurement`,
          );
      }
      measured.add(`${binding}|${token}`);
    }
    for (const [binding, paths] of Object.entries(
      component.foundationBindings ?? {},
    )) {
      if (paths.some((token) => !measured.has(`${binding}|${token}`)))
        throw new Error(
          `${component.name}: foundation binding ${binding} has no measurement`,
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
    JSON.parse(
      await readFile(
        join(packageRoot, 'references/figma-variants-observed-2026-10-08.json'),
        'utf8',
      ),
    ),
  );
}
