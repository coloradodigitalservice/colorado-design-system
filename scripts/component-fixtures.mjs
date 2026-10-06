import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

export const packageRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../packages/colorado-design-system',
);
const requiredStrings = ['name', 'displayName', 'description'];

export function generateExamples(metadata, fixture) {
  const fail = (message) => {
    throw new Error(`${metadata.name}: ${message}`);
  };
  for (const field of requiredStrings) {
    if (typeof metadata[field] !== 'string' || !metadata[field].trim())
      fail(`missing ${field}`);
  }
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(metadata.name))
    fail('invalid component name');
  for (const [field, values] of Object.entries({
    maturity: ['experimental', 'stable', 'deprecated'],
    type: ['static', 'interactive'],
    progressiveEnhancement: ['full', 'partial', 'none'],
    localization: ['text-content-only', 'layout-sensitive', 'not-applicable'],
  })) {
    if (!values.includes(metadata[field])) fail(`invalid ${field}`);
  }
  if (
    metadata.uswdsEquivalent !== null &&
    (typeof metadata.uswdsEquivalent !== 'string' ||
      !metadata.uswdsEquivalent.trim())
  )
    fail('invalid uswdsEquivalent');
  if (!['A', 'B', 'C'].includes(metadata.componentType))
    fail('invalid componentType');
  if (typeof metadata.divergenceApproved !== 'boolean')
    fail('invalid divergenceApproved');
  if (
    metadata.divergenceNotes !== null &&
    typeof metadata.divergenceNotes !== 'string'
  )
    fail('invalid divergenceNotes');
  if (metadata.componentType === 'B') {
    if (metadata.uswdsEquivalent !== null || metadata.uswdsVersion !== null)
      fail('authored component cannot name USWDS');
  } else if (
    !metadata.uswdsEquivalent ||
    !/^\d+\.\d+\.\d+$/.test(metadata.uswdsVersion ?? '')
  ) {
    fail('USWDS component needs equivalent and pinned version');
  }
  if (
    metadata.componentType === 'C' &&
    (!metadata.divergenceApproved || !metadata.divergenceNotes?.trim())
  )
    fail('divergence needs approval and notes');
  if (
    metadata.componentType !== 'C' &&
    (metadata.divergenceApproved || metadata.divergenceNotes !== null)
  )
    fail('non-divergent component cannot claim divergence');
  for (const role of ['responsible', 'accountable']) {
    if (
      typeof metadata.owners?.[role] !== 'string' ||
      !metadata.owners[role].trim()
    )
      fail(`missing owner ${role}`);
  }
  if (
    metadata.progressiveEnhancement === 'none' &&
    !metadata.progressiveEnhancementException?.trim()
  )
    fail('missing progressive enhancement exception');
  if (
    !Array.isArray(metadata.states) ||
    !metadata.states.length ||
    new Set(metadata.states).size !== metadata.states.length ||
    metadata.states.some((state) => !/^[a-z]+(?:-[a-z]+)*$/.test(state))
  )
    fail('invalid or duplicate states');
  if (
    !Array.isArray(metadata.examples) ||
    metadata.examples.length !== metadata.states.length ||
    new Set(metadata.examples.map((example) => example.state)).size !==
      metadata.states.length
  )
    fail('each supported state needs one example definition');
  const dom = new JSDOM(fixture);
  try {
    const document = dom.window.document;
    if (
      document.querySelector('script, style, iframe') ||
      /\{\{|<%/.test(fixture)
    )
      fail('fixture must be plain semantic HTML');
    const ids = [...document.querySelectorAll('[id]')].map(
      (element) => element.id,
    );
    if (new Set(ids).size !== ids.length) fail('duplicate fixture IDs');
    for (const element of document.querySelectorAll(
      '[aria-controls], [aria-labelledby], [aria-describedby]',
    )) {
      for (const attribute of [
        'aria-controls',
        'aria-labelledby',
        'aria-describedby',
      ]) {
        for (const id of (element.getAttribute(attribute) ?? '')
          .split(/\s+/)
          .filter(Boolean)) {
          if (!document.getElementById(id))
            fail(`unresolved ${attribute}: ${id}`);
        }
      }
    }
    for (const element of document.querySelectorAll('button, a[href]')) {
      if (!(element.getAttribute('aria-label') || element.textContent)?.trim())
        fail('empty interactive name');
    }
    const blocks = [...document.querySelectorAll('[data-cods-fixture-state]')];
    const blockStates = blocks.map((block) =>
      block.getAttribute('data-cods-fixture-state'),
    );
    if (!blocks.length || new Set(blockStates).size !== blocks.length)
      fail('missing or duplicate fixture blocks');
    for (const state of blockStates) {
      if (!metadata.states.includes(state))
        fail(`undeclared fixture block: ${state}`);
    }
    const examples = metadata.examples.map((example) => {
      if (!metadata.states.includes(example.state))
        fail(`undeclared state: ${example.state}`);
      if (example.state !== example.fixtureState && example.setup === 'none')
        fail(`aliased state needs runtime setup: ${example.state}`);
      if (
        ['expand', 'collapse'].includes(example.setup) &&
        metadata.type !== 'interactive'
      )
        fail('static component cannot use controller setup');
      const block = blocks.find(
        (block) =>
          block.getAttribute('data-cods-fixture-state') ===
          example.fixtureState,
      );
      if (!block) fail(`missing fixture state: ${example.fixtureState}`);
      if (!['none', 'focus', 'expand', 'collapse'].includes(example.setup))
        fail(`invalid setup: ${example.state}`);
      if (example.setup !== 'none' && !example.instructions?.trim())
        fail(`runtime state needs review instructions: ${example.state}`);
      if (!block.querySelector(`.cods-${metadata.name}`))
        fail(`missing component markup: ${example.state}`);
      const html = block.outerHTML;
      return {
        state: example.state,
        fixtureState: example.fixtureState,
        setup: example.setup,
        html,
        code: html,
        status: example.setup === 'none' ? 'valid' : 'review-required',
        instructions: example.instructions ?? '',
      };
    });
    return { name: metadata.name, examples };
  } finally {
    dom.window.close();
  }
}

export function loadComponents(root = packageRoot) {
  return readdirSync(join(root, 'src/components'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'shared')
    .map((entry) => {
      const name = entry.name;
      const directory = join(root, 'src/components', name);
      const fixture = readFileSync(
        join(directory, `${name}.fixture.html`),
        'utf8',
      );
      const metadataText = readFileSync(
        join(directory, `${name}.metadata.json`),
        'utf8',
      );
      const metadata = JSON.parse(metadataText);
      if (metadata.name !== name)
        throw new Error(`${name}: metadata name differs from directory`);
      const manifest = JSON.parse(
        readFileSync(join(root, 'package.json'), 'utf8'),
      );
      if (
        metadata.uswdsEquivalent &&
        metadata.uswdsVersion !== manifest.dependencies?.['@uswds/uswds']
      )
        throw new Error(`${name}: USWDS version differs from package pin`);
      const evidence = readFileSync(
        join(directory, 'accessibility', `${name}.evidence.md`),
        'utf8',
      );
      if (
        metadata.maturity === 'stable' &&
        /\[ \]|pending|not (?:yet )?verified/i.test(evidence)
      )
        throw new Error(`${name}: stable component has unfinished evidence`);
      return {
        name,
        fixture,
        metadataText,
        metadata,
        examples: generateExamples(metadata, fixture),
      };
    });
}

export function writeComponentAssets(root = packageRoot) {
  for (const component of loadComponents(root)) {
    for (const [directory, extension, content] of [
      ['fixtures', 'html', component.fixture],
      ['metadata', 'json', component.metadataText],
      ['examples', 'json', JSON.stringify(component.examples, null, 2) + '\n'],
    ]) {
      mkdirSync(join(root, 'dist', directory), { recursive: true });
      writeFileSync(
        join(root, 'dist', directory, `${component.name}.${extension}`),
        content,
      );
    }
  }
}

export function checkComponentAssets(root = packageRoot) {
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const component of loadComponents(root)) {
    for (const [directory, extension, content] of [
      ['fixtures', 'html', component.fixture],
      ['metadata', 'json', component.metadataText],
      ['examples', 'json', JSON.stringify(component.examples, null, 2) + '\n'],
    ]) {
      const subpath = `./${directory}/${component.name}.${extension}`;
      const target = `./dist/${directory}/${component.name}.${extension}`;
      const pattern = `./${directory}/*.${extension}`;
      const exported =
        manifest.exports[subpath]?.default ??
        manifest.exports[pattern]?.default?.replace('*', component.name);
      if (exported !== target)
        throw new Error(`${component.name}: missing export ${subpath}`);
      if (readFileSync(join(root, target), 'utf8') !== content)
        throw new Error(
          `${component.name}: stale ${directory} output; rebuild the package`,
        );
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  if (process.argv.includes('--output')) checkComponentAssets();
  else loadComponents();
  process.stdout.write(
    '✓ Component metadata, supported states, and fixtures verified\n',
  );
}
