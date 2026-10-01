import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';
import { cp, mkdir } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// USWDS's compiled CSS references self-hosted fonts by relative url(), not
// by JS import, so Vite's module graph never sees them. Copy them into
// dist/fonts (matching $theme-font-path in _uswds-theme.scss) after build.
function copyAssetsPlugin(): Plugin {
  return {
    name: 'copy-assets',
    async closeBundle() {
      for (const [source, directory, filename] of [
        ['accordion.fixture.html', 'fixtures', 'accordion.html'],
        ['accordion.metadata.json', 'metadata', 'accordion.json'],
      ]) {
        await mkdir(path.resolve(__dirname, 'dist', directory), {
          recursive: true,
        });
        await cp(
          path.resolve(__dirname, 'src/components/accordion', source),
          path.resolve(__dirname, 'dist', directory, filename),
        );
      }
      await cp(
        path.resolve(__dirname, 'src/assets/fonts'),
        path.resolve(__dirname, 'dist/fonts'),
        { recursive: true },
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
  },
});
