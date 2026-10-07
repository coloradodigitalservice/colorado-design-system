// @vitest-environment node
import {
  mkdirSync,
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
import {
  cssAssetReferences,
  copiedAssets,
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
});

function fixture(
  css = '@font-face{font-family:Probe;src:url(./fonts/probe.woff2)}',
) {
  const root = directory();
  const fonts = join(root, 'source-fonts');
  mkdirSync(fonts);
  writeFileSync(join(fonts, 'probe.woff2'), 'original font bytes');
  writeFileSync(
    join(root, 'entry.js'),
    "import './style.css'; export const probe = true;",
  );
  writeFileSync(join(root, 'style.css'), css);
  const linkedFonts = join(root, 'linked-fonts');
  symlinkSync(fonts, linkedFonts, 'dir');
  const assets = copiedAssets({ fonts: linkedFonts });
  const warnings: string[] = [];
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
    plugins: [assets.plugin],
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
  return { root, fonts, assets, warnings, config };
}

describe('Vite packaged assets integration', () => {
  it('copies separate files unchanged, preserves CSS URLs, and externalizes only shipped assets', async () => {
    const { root, fonts, assets, warnings, config } = fixture();
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
    expect(assets.isExternal(join(root, 'entry.js'))).toBe(false);
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
