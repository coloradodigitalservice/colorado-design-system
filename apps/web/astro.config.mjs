import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: { syntaxHighlight: false },
  vite: { server: { strictPort: true } },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
