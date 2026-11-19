import { defineConfig } from 'astro/config';
import { codsIcons } from '@coloradodigitalservice/colorado-design-system/icons/vite';

const basePath = process.env.PUBLIC_BASE_PATH ?? '';

export default defineConfig({
  base: basePath || '/',
  output: 'static',
  markdown: { syntaxHighlight: false },
  vite: { plugins: [codsIcons()], server: { strictPort: true } },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
