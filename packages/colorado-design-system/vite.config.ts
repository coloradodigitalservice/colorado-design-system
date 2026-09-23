import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';
import { cp } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// USWDS's compiled CSS references self-hosted fonts by relative url(), not
// by JS import, so Vite's module graph never sees them. Copy them into
// dist/fonts (matching $theme-font-path in _uswds-theme.scss) after build.
function copyFontsPlugin(): Plugin {
  return {
    name: 'copy-fonts',
    async closeBundle() {
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
    copyFontsPlugin(),
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
