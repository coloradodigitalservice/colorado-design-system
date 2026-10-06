import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';
import { cp, mkdir, readdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// USWDS's compiled CSS references self-hosted fonts and icons by relative
// url(), not by JS import, so Vite's module graph never sees them. Copy them
// into dist/fonts and dist/img (matching $theme-font-path and
// $theme-image-path in _uswds-theme.scss) after build. The Material icon set
// (8 MB) and favicons are not referenced by any stylesheet, so they are left out.
function copyAssetsPlugin(): Plugin {
  return {
    name: 'copy-assets',
    async closeBundle() {
      const componentsDir = path.resolve(__dirname, 'src/components');
      const entries = await readdir(componentsDir, { withFileTypes: true });
      for (const entry of entries) {
        // shared/ holds support modules, not a component. Every component
        // must ship both contract assets; cp rejects a missing required file.
        if (!entry.isDirectory() || entry.name === 'shared') continue;
        for (const [suffix, directory, extension] of [
          ['fixture.html', 'fixtures', 'html'],
          ['metadata.json', 'metadata', 'json'],
        ]) {
          await mkdir(path.resolve(__dirname, 'dist', directory), {
            recursive: true,
          });
          await cp(
            path.join(componentsDir, entry.name, `${entry.name}.${suffix}`),
            path.resolve(
              __dirname,
              'dist',
              directory,
              `${entry.name}.${extension}`,
            ),
          );
        }
      }
      await cp(
        path.resolve(__dirname, 'src/assets/fonts'),
        path.resolve(__dirname, 'dist/fonts'),
        { recursive: true },
      );
      await cp(
        path.resolve(__dirname, 'node_modules/@uswds/uswds/dist/img'),
        path.resolve(__dirname, 'dist/img'),
        {
          recursive: true,
          filter: (source) => !/[\\/](material-icons|favicons)$/.test(source),
        },
      );
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
    copyAssetsPlugin(),
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
      external: ['@coloradodigitalservice/colorado-design-tokens'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    // Lightning CSS splits the leading `@layer` order statement and moves
    // parts of it after rules; esbuild keeps it intact at the top.
    cssMinify: 'esbuild',
  },
});
