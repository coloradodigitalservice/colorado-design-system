import {
  existsSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import { gzipSync } from 'node:zlib';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build } from 'vite';
import { generatedDir } from './icons.mjs';
import {
  collectIconReferences,
  collectStandaloneReferences,
  createStandaloneSvg,
  createSubsetSprite,
  readIconLibrary,
} from '../src/icons/selection.mjs';
import { codsIcons } from '../src/icons/vite.mjs';

const library = readIconLibrary(generatedDir);
const scratch = [];
function directory() {
  const root = mkdtempSync(join(tmpdir(), 'cods-icon-selection-'));
  scratch.push(root);
  return root;
}
afterEach(() => {
  for (const root of scratch.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it('validates CSS icon references and generates only their standalone artwork', () => {
  const css = `.one { mask: url("./icons/acorn.svg?v=1"); }
.two { background: url('./icons/check--ffffff.svg'); }`;
  expect([...collectStandaloneReferences(library, css, 'style.css')]).toEqual([
    'acorn.svg',
    'check--ffffff.svg',
  ]);
  expect(createStandaloneSvg(library, 'acorn')).toContain(
    'fill="currentColor"',
  );
  expect(createStandaloneSvg(library, 'check--ffffff')).toContain(
    'fill="#ffffff"',
  );
  expect(() =>
    collectStandaloneReferences(
      library,
      '.bad{mask:url(./icons/not-a-real-id.svg)}',
      'style.css',
    ),
  ).toThrow(/style\.css:1: unknown Phosphor Regular icon ID/);
});

it('keeps the documented ten-icon subset within the 4 KiB benchmark', () => {
  const ids = [
    'house',
    'magnifying-glass',
    'caret-down',
    'caret-up',
    'check',
    'minus',
    'info',
    'warning-circle',
    'arrow-right',
    'arrow-square-out',
  ];
  const sprite = createSubsetSprite(library, ids);
  expect(Buffer.byteLength(sprite)).toBeLessThanOrEqual(4096);
  expect(gzipSync(sprite).byteLength).toBeLessThanOrEqual(4096);
  expect([...sprite.matchAll(/<symbol /g)]).toHaveLength(10);
});

describe('source-driven icon selection', () => {
  it('finds literal fixture references and statically enumerable template choices', () => {
    const source = `import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
<use href="/icons/sprite.svg#house"></use>
const first = \`\${spriteUrl}#info\`;
const second = \`\${spriteUrl}#\${isUp ? 'caret-up' : 'caret-down'}\`;
const third = spriteUrl + '#arrow-right';`;
    expect(
      [...collectIconReferences(library, source, 'example.ts')].sort(),
    ).toEqual(['arrow-right', 'caret-down', 'caret-up', 'house', 'info']);
  });

  describe('standalone icon command', () => {
    function commandFixture() {
      const root = directory();
      const tools = join(root, 'tools');
      const input = join(root, 'app');
      mkdirSync(tools);
      mkdirSync(input);
      for (const name of ['cli.mjs', 'selection.mjs'])
        copyFileSync(
          resolve(import.meta.dirname, '../src/icons', name),
          join(tools, name),
        );
      for (const name of ['sprite.svg', 'catalog.json'])
        copyFileSync(resolve(generatedDir, name), join(tools, name));
      return {
        input,
        output: join(root, 'public/icons/sprite.svg'),
        run: (...args) =>
          spawnSync(process.execPath, [join(tools, 'cli.mjs'), ...args], {
            encoding: 'utf8',
          }),
      };
    }

    it('selects only IDs found in supplied source files and can validate without writing', () => {
      const { input, output, run } = commandFixture();
      writeFileSync(
        join(input, 'page.html'),
        '<use href="/icons/sprite.svg#house"></use>',
      );
      writeFileSync(
        join(input, 'component.js'),
        "const icon = '/icons/sprite.svg#info';",
      );
      const result = run('--input', input, '--output', output);
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toContain(
        'Selected 2 Phosphor Regular sprite IDs and 0 standalone CSS files from 2 source files',
      );
      expect(readFileSync(output, 'utf8')).toBe(
        createSubsetSprite(library, ['house', 'info']),
      );
      const validation = run('--input', input, '--validate');
      expect(validation.status, validation.stderr).toBe(0);
      expect(validation.stdout).toContain(
        'Validated 2 Phosphor Regular sprite IDs',
      );
    });

    it('discovers and generates CSS assets without an icon list', () => {
      const { input, output, run } = commandFixture();
      writeFileSync(
        join(input, 'page.html'),
        '<use href="/icons/sprite.svg#house"></use>',
      );
      writeFileSync(
        join(input, 'style.css'),
        `.first{mask:url('./icons/acorn.svg')} .second{background:url(./icons/check--ffffff.svg)}`,
      );
      const cssOutput = join(input, 'generated');
      const result = run(
        '--input',
        input,
        '--output',
        output,
        '--css-output',
        cssOutput,
      );
      expect(result.status, result.stderr).toBe(0);
      expect(readdirSync(cssOutput).sort()).toEqual([
        'PHOSPHOR-LICENSE',
        'acorn.svg',
        'check--ffffff.svg',
      ]);
      expect(
        readFileSync(join(cssOutput, 'PHOSPHOR-LICENSE'), 'utf8'),
      ).toContain('MIT License');
      expect(readFileSync(join(cssOutput, 'acorn.svg'), 'utf8')).toBe(
        createStandaloneSvg(library, 'acorn'),
      );
      expect(readFileSync(output, 'utf8')).toBe(
        createSubsetSprite(library, ['house']),
      );
    });

    it('fails on unrecognized IDs and requires an explicit full-sprite opt-in for dynamic IDs', () => {
      const { input, output, run } = commandFixture();
      const file = join(input, 'page.html');
      writeFileSync(file, '<use href="/icons/sprite.svg#not-a-real-id"></use>');
      const invalid = run('--input', input, '--output', output);
      expect(invalid.status).toBe(1);
      expect(invalid.stderr).toContain('unknown Phosphor Regular icon ID');
      expect(existsSync(output)).toBe(false);
      writeFileSync(file, '<use href="/icons/sprite.svg#${runtime}"></use>');
      expect(run('--input', input, '--output', output).stderr).toContain(
        'cannot be selected statically',
      );
      const full = run('--input', input, '--output', output, '--full');
      expect(full.status, full.stderr).toBe(0);
      expect(readFileSync(output, 'utf8')).toBe(library.sprite);
    });
  });

  it('fails with the source location for unknown, invalid, and unresolved IDs', () => {
    for (const reference of ['missing-icon', 'house_typo', '${unknown}', '']) {
      expect(() =>
        collectIconReferences(
          library,
          `first line\n<use href="/icons/sprite.svg#${reference}"></use>`,
          'example.html',
        ),
      ).toThrow(/example\.html:2:.*(?:unknown|dynamic|missing)/i);
    }
    const source = `import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
const href = spriteUrl + '#' + runtimeId;`;
    expect(() => collectIconReferences(library, source, 'dynamic.ts')).toThrow(
      /dynamic\.ts:2:.*(?:dynamic|concatenated)/i,
    );
    expect(() =>
      collectIconReferences(
        library,
        "const href = '/icons/sprite.svg#house' + suffix;",
        'dynamic.ts',
      ),
    ).toThrow(/concatenated Phosphor icon IDs/);
  });

  it('allows explicit full mode for dynamic IDs but still rejects invalid literals', () => {
    const dynamic = '<use href="/icons/sprite.svg#${runtimeId}"></use>';
    expect([
      ...collectIconReferences(library, dynamic, 'full.html', {
        allowDynamic: true,
      }),
    ]).toEqual([]);
    expect(() =>
      collectIconReferences(
        library,
        '<use href="/icons/sprite.svg#not-a-real-id"></use>',
        'full.html',
        { allowDynamic: true },
      ),
    ).toThrow(/unknown Phosphor Regular icon ID/);
  });

  it('emits deterministic subsets in canonical order and rejects unknown IDs', () => {
    const sprite = createSubsetSprite(library, ['info', 'house', 'house']);
    expect(sprite).toBe(createSubsetSprite(library, ['house', 'info']));
    expect(
      [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]),
    ).toEqual(['house', 'info']);
    expect(sprite).toContain('Copyright (c) 2023 Phosphor Icons');
    expect(sprite).toContain('Permission is hereby granted');
    expect(sprite).not.toContain('id="acorn"');
    expect(() => createSubsetSprite(library, ['not-a-real-id'])).toThrow(
      /Unknown/,
    );
  });
});

function fixture(base = '/') {
  const root = directory();
  writeFileSync(
    join(root, 'index.html'),
    '<!doctype html><svg><use href="/icons/sprite.svg#house"></use></svg><script type="module" src="/entry.js"></script>',
  );
  writeFileSync(
    join(root, 'entry.js'),
    `import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
document.body.insertAdjacentHTML('beforeend', \`<svg><use href="\${spriteUrl}#info"></use></svg>\`);`,
  );
  return {
    root,
    config: {
      configFile: false,
      root,
      base,
      logLevel: 'silent',
      plugins: [codsIcons({ sourceDir: generatedDir })],
    },
  };
}

describe('Vite icon integration', () => {
  it.each(['/', '/prefix/', './'])(
    'emits one hashed subset and resolves HTML and JS references with base %s',
    async (base) => {
      const { root, config } = fixture(base);
      await build(config);
      const assets = join(root, 'dist/assets');
      const sprites = readdirSync(assets).filter((name) =>
        name.endsWith('.svg'),
      );
      expect(sprites).toHaveLength(1);
      const sprite = readFileSync(join(assets, sprites[0]), 'utf8');
      expect(
        [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]),
      ).toEqual(['house', 'info']);
      expect(sprite.length).toBeLessThan(library.sprite.length / 100);
      const html = readFileSync(join(root, 'dist/index.html'), 'utf8');
      expect(html).toContain(
        `${base === './' ? './' : base}assets/${sprites[0]}#house`,
      );
      const script = readdirSync(assets).find((name) => name.endsWith('.js'));
      const js = readFileSync(join(assets, script), 'utf8');
      expect(js).toContain(sprites[0]);
      expect(js).not.toContain('__CODS_PHOSPHOR_SPRITE_URL__');
      if (base === './') expect(js).toContain('import.meta.url');
    },
  );

  it('fails builds on unknown and dynamically unresolved IDs', async () => {
    const { root, config } = fixture();
    writeFileSync(
      join(root, 'index.html'),
      '<use href="/icons/sprite.svg#bad-id"></use>',
    );
    await expect(build(config)).rejects.toThrow(
      /unknown Phosphor Regular icon ID/,
    );
    writeFileSync(
      join(root, 'index.html'),
      '<use href="/icons/sprite.svg#${runtime}"></use>',
    );
    await expect(build(config)).rejects.toThrow(
      /cannot be selected statically/,
    );
  });

  it('rejects canonical URLs embedded in application modules instead of emitting a broken URL', async () => {
    const { root, config } = fixture();
    writeFileSync(
      join(root, 'entry.js'),
      'document.body.innerHTML = \'<svg><use href="/icons/sprite.svg#info"></use></svg>\';',
    );
    await expect(build(config)).rejects.toThrow(
      /entry\.js:1: canonical CoDS sprite URLs in application modules are not rewritten/,
    );
  });

  it.each([
    'component.astro',
    'component.tsx',
    'component.vue',
    'component.svelte',
  ])('reports a source location for canonical URLs in %s', (id) => {
    const plugin = codsIcons({ sourceDir: generatedDir });
    expect(() =>
      plugin.transform('\n<use href="/icons/sprite.svg#house"></use>', id),
    ).toThrow(
      `${id}:2: canonical CoDS sprite URLs in application modules are not rewritten`,
    );
  });

  it('rejects canonical sprite URLs in stylesheets', () => {
    const plugin = codsIcons({ sourceDir: generatedDir });
    expect(() =>
      plugin.transform(
        '.icon { background: url("/icons/sprite.svg#house"); }',
        'component.css',
      ),
    ).toThrow(
      /component\.css:1: canonical CoDS sprite URLs in stylesheets are not rewritten/,
    );
  });

  it('emits the full sprite only when explicitly selected', async () => {
    const { root, config } = fixture();
    config.plugins = [codsIcons({ sourceDir: generatedDir, mode: 'full' })];
    writeFileSync(
      join(root, 'index.html'),
      '<svg><use href="/icons/sprite.svg#${runtime}"></use></svg>',
    );
    await build(config);
    const assets = join(root, 'dist/assets');
    const sprite = readdirSync(assets).find((name) => name.endsWith('.svg'));
    expect(existsSync(join(assets, sprite))).toBe(true);
    expect(readFileSync(join(assets, sprite), 'utf8')).toBe(library.sprite);
  });

  it('rewrites nested HTML entrypoints relative to their own output', async () => {
    const { root, config } = fixture('./');
    mkdirSync(join(root, 'nested'));
    writeFileSync(
      join(root, 'nested/index.html'),
      '<svg><use href="/icons/sprite.svg#house"></use></svg>',
    );
    config.build = {
      rolldownOptions: {
        input: { nested: resolve(root, 'nested/index.html') },
      },
    };
    await build(config);
    const html = readFileSync(join(root, 'dist/nested/index.html'), 'utf8');
    expect(html).toMatch(/href="\.\.\/assets\/cods-sprite-[^"]+\.svg#house"/);
  });

  it('recomputes the subset when watched source references change', async () => {
    const { root, config } = fixture();
    config.build = { watch: {} };
    const watcher = await build(config);
    if (Array.isArray(watcher) || !('on' in watcher))
      throw new Error('Expected a Vite watcher');
    let builds = 0;
    const failures = [];
    watcher.on('event', (event) => {
      if (event.code === 'BUNDLE_END') builds++;
      if (event.code === 'ERROR') failures.push(event.error);
    });
    const outputIds = () => {
      const html = readFileSync(join(root, 'dist/index.html'), 'utf8');
      const file = /assets\/(cods-sprite-[^"]+\.svg)#house/.exec(html)?.[1];
      if (!file) throw new Error('Missing built sprite URL');
      return [
        ...readFileSync(join(root, 'dist/assets', file), 'utf8').matchAll(
          /<symbol id="([^"]+)"/g,
        ),
      ].map((match) => match[1]);
    };
    try {
      await vi.waitFor(() => {
        expect(failures).toEqual([]);
        expect(builds).toBeGreaterThanOrEqual(1);
        expect(outputIds()).toEqual(['house', 'info']);
      });
      writeFileSync(
        join(root, 'entry.js'),
        `import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
document.body.insertAdjacentHTML('beforeend', \`<svg><use href="\${spriteUrl}#warning"></use></svg>\`);`,
      );
      await vi.waitFor(
        () => {
          expect(failures).toEqual([]);
          expect(builds).toBeGreaterThanOrEqual(2);
          expect(outputIds()).toEqual(['house', 'warning']);
        },
        { timeout: 10000 },
      );
    } finally {
      await watcher.close();
    }
  });
});
