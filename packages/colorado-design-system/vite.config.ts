import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeComponentAssets } from '../../scripts/component-fixtures.mjs';
import { writeDistIcons } from './build/icons.mjs';
import {
  copiedAssets,
  cssAssetReferences,
  replaceUswdsIconUrls,
} from './build/packaged-assets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep non-icon USWDS asset URLs; packaged CSS icon references are remapped to Phosphor.
const packageAssets = copiedAssets({
  fonts: path.resolve(__dirname, 'src/assets/fonts'),
  img: path.resolve(__dirname, 'node_modules/@uswds/uswds/dist/img'),
});

function componentAssetsPlugin(): Plugin {
  return {
    name: 'component-assets',
    closeBundle() {
      writeComponentAssets();
    },
  };
}

function iconAssetsPlugin(): Plugin {
  return {
    name: 'write-phosphor-icons',
    async writeBundle(options, bundle) {
      const output = path.resolve(__dirname, options.dir ?? 'dist');
      const files = new Set<string>();
      for (const name of Object.keys(bundle)) {
        if (!name.endsWith('.css')) continue;
        const stylesheet = path.resolve(output, name);
        const css = replaceUswdsIconUrls(readFileSync(stylesheet, 'utf8'));
        for (const reference of cssAssetReferences(css, stylesheet)) {
          if (reference.startsWith(`icons${path.sep}`))
            files.add(reference.slice(`icons${path.sep}`.length));
        }
      }
      await writeDistIcons(path.resolve(output, 'icons'), { files });
    },
  };
}

function logoAssetsPlugin(): Plugin {
  return {
    name: 'copy-logo-assets',
    buildStart() {
      for (const name of ['cods-logo.svg', 'NOTICE.md']) {
        const source = path.resolve(__dirname, 'src/assets/logos', name);
        this.addWatchFile(source);
        this.emitFile({
          type: 'asset',
          fileName: `logos/${name}`,
          source: readFileSync(source),
        });
      }
    },
  };
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [
          path.resolve(__dirname, 'node_modules'),
          path.resolve(__dirname, 'node_modules/@uswds/uswds/packages'),
          path.resolve(__dirname, 'src/styles'),
        ],
      },
    },
  },
  plugins: [
    dts({
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
      compilerOptions: {
        skipLibCheck: true,
      },
    }),
    iconAssetsPlugin(),
    logoAssetsPlugin(),
    packageAssets.plugin,
    componentAssetsPlugin(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'ColoradoDesignSystem',
      formats: ['es'],
      fileName: (format) =>
        `colorado-design-system.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      // Mark external dependencies so they aren't bundled
      external: (id) =>
        id === '@coloradodigitalservice/colorado-design-tokens' ||
        packageAssets.isExternal(id),
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // Lightning CSS splits the leading `@layer` order statement and moves
    // parts of it after rules; esbuild keeps it intact at the top.
    cssMinify: 'esbuild',
  },
});
