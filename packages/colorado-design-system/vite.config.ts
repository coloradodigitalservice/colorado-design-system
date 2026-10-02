import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';
import { cp } from 'fs/promises';

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
