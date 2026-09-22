import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      output: {
        globals: {
          '@coloradodigitalservice/colorado-design-tokens': 'ColoRadoTokens',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
