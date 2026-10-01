import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  markdown: { syntaxHighlight: false },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
