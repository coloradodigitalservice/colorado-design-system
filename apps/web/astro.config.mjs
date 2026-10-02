import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  vite: { server: { strictPort: true } },
  trailingSlash: 'always',
  build: { format: 'directory' },
});
