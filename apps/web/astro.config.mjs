import { defineConfig } from 'astro/config';

const basePath = process.env.PUBLIC_BASE_PATH ?? '';

export default defineConfig({
  base: basePath || '/',
  output: 'static',
  markdown: { syntaxHighlight: false },
  vite: { server: { strictPort: true } },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
