// @vitest-environment node
import {
  mkdirSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { build, createLogger, type InlineConfig } from 'vite';
import iconVariants from '../packages/colorado-design-system/build/uswds-icon-variants.json' with { type: 'json' };
import {
  cssAssetReferences,
  copiedAssets,
  replaceUswdsIconUrls,
  validateCssAssets,
} from '../packages/colorado-design-system/build/packaged-assets.js';

const scratch: string[] = [];
function directory() {
  const root = realpathSync(
    mkdtempSync(join(tmpdir(), 'cods-packaged-assets-')),
  );
  scratch.push(root);
  return root;
}
afterEach(() => {
  for (const root of scratch.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('written CSS asset validation', () => {
  it('parses real URLs, including escapes and suffixes, without matching comments or strings', () => {
    expect(
      cssAssetReferences(
        String.raw`/* url(missing.svg) */
          @font-face { src: URL("./fonts/Example\20 Font.woff2?v=1#font") }
          .icon { background: url('./img/icon%20name.svg#symbol') }
          .again { background: url(./img/icon%20name.svg) }
          .text { content: "url(missing.svg)" }
          .remote { background: url(https://example.com/image.png), url(//example.com/icon.svg) }
          .inline { background: url(data:image/svg+xml;base64,AAAA), url(#mask) }`,
        'css/styles.css',
      ),
    ).toEqual(['fonts/Example Font.woff2', 'img/icon name.svg']);
  });

  it('validates written CSS and names a missing asset', () => {
    const root = directory();
    mkdirSync(join(root, 'fonts'));
    writeFileSync(join(root, 'fonts/font.woff2'), 'font');
    const stylesheet = join(root, 'styles.css');
    writeFileSync(stylesheet, '@font-face{src:url(./fonts/font.woff2)}');
    expect(() => validateCssAssets(stylesheet)).not.toThrow();
    rmSync(join(root, 'fonts/font.woff2'));
    expect(() => validateCssAssets(stylesheet)).toThrow(
      'missing packaged asset: fonts/font.woff2',
    );
  });
  it('rejects root-relative and escaping URLs', () => {
    for (const url of ['/img/icon.svg', '../outside.svg']) {
      expect(() =>
        cssAssetReferences(`.icon{background:url(${url})}`, 'styles.css'),
      ).toThrow(/relative|escapes/);
    }
  });

  it('fails when a new USWDS icon has no approved Phosphor replacement', () => {
    expect(() =>
      replaceUswdsIconUrls(
        '.icon{background-image:url(./img/usa-icons/new_icon.svg)}',
      ),
    ).toThrow('No Phosphor replacement configured for USWDS icon');
  });

  it('preserves each color-sensitive USWDS asset as an explicit-color variant', () => {
    for (const [source, { id, color }] of Object.entries(iconVariants)) {
      expect(
        replaceUswdsIconUrls(
          `.icon{background:url("./img/${source}?v=1#icon")}`,
        ),
      ).toContain(`./icons/${id}--${color}.svg?v=1#icon`);
    }
  });
});

function fixture(
  css = '@font-face{font-family:Probe;src:url(./fonts/probe.woff2)}',
) {
  const root = directory();
  const fonts = join(root, 'source-fonts');
  const img = join(root, 'source-img');
  mkdirSync(fonts);
  mkdirSync(img);
  writeFileSync(join(fonts, 'probe.woff2'), 'original font bytes');
  for (const folder of [
    'favicons',
    'material-icons',
    'material-icons-deprecated',
    'usa-icons',
    'usa-icons-bg',
    'uswds-icons',
  ]) {
    mkdirSync(join(img, folder));
    writeFileSync(join(img, folder, 'icon.svg'), '<svg/>');
  }
  writeFileSync(join(img, 'usa-icons', 'search.svg'), '<svg/>');
  writeFileSync(join(img, 'usa-icons-bg', 'launch--white.svg'), '<svg/>');
  writeFileSync(join(img, 'file.svg'), '<svg/>');
  writeFileSync(join(img, 'file-pdf.svg'), '<svg/>');
  writeFileSync(join(img, 'circle-gray-20.svg'), '<svg/>');
  writeFileSync(join(img, 'hero.jpg'), 'image');
  writeFileSync(
    join(root, 'entry.js'),
    "import './style.css'; export const probe = true;",
  );
  writeFileSync(join(root, 'style.css'), css);
  const linkedFonts = join(root, 'linked-fonts');
  symlinkSync(fonts, linkedFonts, 'dir');
  const assets = copiedAssets({ fonts: linkedFonts, img });
  const warnings: string[] = [];
  const phosphorAssets = {
    name: 'fixture-phosphor-assets',
    writeBundle(options: { dir?: string }) {
      const icons = join(options.dir ?? 'dist', 'icons');
      mkdirSync(icons, { recursive: true });
      for (const id of [
        'magnifying-glass',
        'arrow-square-out--ffffff',
        'file-pdf--07648d',
        'caret-down',
        'caret-down--1b1b1b',
      ])
        writeFileSync(join(icons, `${id}.svg`), '<svg/>');
    },
  };
  const config: InlineConfig = {
    root,
    configFile: false,
    logLevel: 'silent',
    customLogger: {
      ...createLogger('silent'),
      warn: (message) => {
        warnings.push(message);
      },
      warnOnce: (message) => {
        warnings.push(message);
      },
    },
    plugins: [phosphorAssets, assets.plugin],
    build: {
      lib: {
        entry: join(root, 'entry.js'),
        formats: ['es'],
        fileName: 'fixture',
        cssFileName: 'fixture',
      },
      rolldownOptions: { external: assets.isExternal },
    },
  };
  return { root, fonts, img, assets, warnings, config };
}

describe('Vite packaged assets integration', () => {
  it('copies separate files unchanged, preserves CSS URLs, and externalizes only shipped assets', async () => {
    const { root, fonts, img, assets, warnings, config } = fixture();
    mkdirSync(join(fonts, 'favicons'));
    writeFileSync(join(fonts, 'favicons/unused.woff2'), 'favicons');
    await build(config);
    expect(warnings).toEqual([]);
    expect(readFileSync(join(root, 'dist/fonts/probe.woff2'), 'utf8')).toBe(
      'original font bytes',
    );
    const css = readFileSync(join(root, 'dist/fixture.css'), 'utf8');
    expect(cssAssetReferences(css, 'fixture.css')).toEqual([
      'fonts/probe.woff2',
    ]);
    expect(css).not.toContain('data:');
    expect(assets.isExternal('./fonts/probe.woff2')).toBe(true);
    expect(assets.isExternal('./fonts/typo.woff2')).toBe(false);
    expect(assets.isExternal('./fonts/favicons/unused.woff2')).toBe(false);
    expect(assets.isExternal('./img/usa-icons/search.svg')).toBe(true);
    expect(assets.isExternal('./img/material-icons/icon.svg')).toBe(false);
    expect(readFileSync(join(root, 'dist/img/hero.jpg'), 'utf8')).toBe('image');
    expect(
      readFileSync(join(root, 'dist/img/circle-gray-20.svg'), 'utf8'),
    ).toBe('<svg/>');
    for (const folder of [
      'favicons',
      'material-icons',
      'material-icons-deprecated',
      'usa-icons',
      'usa-icons-bg',
      'uswds-icons',
    ])
      expect(existsSync(join(root, 'dist/img', folder))).toBe(false);
    expect(existsSync(join(root, 'dist/img/file.svg'))).toBe(false);
    expect(readFileSync(join(img, 'file.svg'), 'utf8')).toBe('<svg/>');
    expect(assets.isExternal(join(root, 'entry.js'))).toBe(false);
  });

  it('rewrites packaged USWDS icon URLs to Phosphor assets without copying source icon files', async () => {
    const css = [
      '@font-face{font-family:Probe;src:url(./fonts/probe.woff2)}',
      '.search{background-image:url(./img/usa-icons/search.svg)}',
      '.external{background-image:url(./img/usa-icons-bg/launch--white.svg)}',
      '.file{background-image:url(./img/file-pdf.svg)}',
    ].join('');
    const { root, warnings, config } = fixture(css);
    await build(config);
    expect(warnings).toEqual([]);
    const output = readFileSync(join(root, 'dist/fixture.css'), 'utf8');
    expect(output).toContain('./icons/magnifying-glass.svg');
    expect(output).toContain('./icons/arrow-square-out--ffffff.svg');
    expect(output).toContain('./icons/file-pdf--07648d.svg');
    expect(output).not.toContain('./img/usa-icons');
    expect(output).not.toContain('./img/file-pdf.svg');
    expect(cssAssetReferences(output, 'fixture.css')).toEqual([
      'fonts/probe.woff2',
      'icons/arrow-square-out--ffffff.svg',
      'icons/file-pdf--07648d.svg',
      'icons/magnifying-glass.svg',
    ]);
  });

  it('preserves approved component mask URLs as shared generated assets', async () => {
    const { root, assets, warnings, config } = fixture(
      '.caret{mask:url(./icons/caret-down.svg) center/contain no-repeat}',
    );
    await build(config);
    expect(warnings).toEqual([]);
    const output = readFileSync(join(root, 'dist/fixture.css'), 'utf8');
    expect(output).toContain('./icons/caret-down.svg');
    expect(output).not.toContain('data:');
    expect(cssAssetReferences(output, 'fixture.css')).toEqual([
      'icons/caret-down.svg',
    ]);
    expect(assets.isExternal('./icons/caret-down.svg?v=1#icon')).toBe(true);
    expect(assets.isExternal('./icons/not-approved.svg')).toBe(false);
    expect(assets.isExternal('./icons/../fonts/probe.woff2')).toBe(false);
  });

  it('preserves the Select token-colored shared background image', async () => {
    const { root, assets, config } = fixture(
      '.select{background-image:url(./icons/caret-down--1b1b1b.svg)}',
    );
    await build(config);
    expect(readFileSync(join(root, 'dist/fixture.css'), 'utf8')).toContain(
      './icons/caret-down--1b1b1b.svg',
    );
    expect(assets.isExternal('./icons/caret-down--1b1b1b.svg')).toBe(true);
    expect(assets.isExternal('./icons/caret-down--000000.svg')).toBe(false);
  });

  it('rejects an approved icon reference when its generated file is missing', async () => {
    const { config } = fixture('.caret{mask:url(./icons/caret-up.svg)}');
    await expect(build(config)).rejects.toThrow(
      'missing packaged asset: icons/caret-up.svg',
    );
  });

  it('keeps the Vite warning for an undeclared URL and fails even when a stale output file exists', async () => {
    const { root, warnings, config } = fixture(
      '.icon{background:url(./fonts/typo.woff2)}',
    );
    mkdirSync(join(root, 'dist/fonts'), { recursive: true });
    writeFileSync(join(root, 'dist/fonts/typo.woff2'), 'stale');
    config.build!.emptyOutDir = false;
    await expect(build(config)).rejects.toThrow(
      'missing packaged asset: fonts/typo.woff2',
    );
    expect(
      warnings.some(
        (message) =>
          message.includes('./fonts/typo.woff2') &&
          message.includes("didn't resolve"),
      ),
    ).toBe(true);
  });

  it('refreshes assets on watch rebuilds and rejects a deleted source despite stale output', async () => {
    const { root, fonts, warnings, config } = fixture();
    config.build!.watch = {};
    const watcher = await build(config);
    if (Array.isArray(watcher) || !('on' in watcher))
      throw new Error('Expected a Vite watcher');
    const errors: Error[] = [];
    let builds = 0;
    let idle = false;
    watcher.on('event', (event) => {
      if (event.code === 'START') idle = false;
      if (event.code === 'END') idle = true;
      if (event.code === 'BUNDLE_END') builds++;
      if (event.code === 'ERROR') errors.push(event.error);
    });
    try {
      await vi.waitFor(
        () => {
          expect(builds).toBe(1);
          expect(idle).toBe(true);
        },
        { timeout: 10_000 },
      );
      expect(warnings).toEqual([]);
      writeFileSync(join(fonts, 'probe.woff2'), 'changed font bytes');
      await vi.waitFor(() => expect(builds).toBeGreaterThan(1), {
        timeout: 10_000,
      });
      expect(readFileSync(join(root, 'dist/fonts/probe.woff2'), 'utf8')).toBe(
        'changed font bytes',
      );
      rmSync(join(fonts, 'probe.woff2'));
      await vi.waitFor(() => expect(errors.length).toBeGreaterThan(0), {
        timeout: 10_000,
      });
      expect(errors[0]!.message).toContain(
        'missing packaged asset: fonts/probe.woff2',
      );
    } finally {
      await watcher.close();
    }
  }, 30_000);
});
