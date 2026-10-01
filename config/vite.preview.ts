import { defineConfig } from 'vite';

// Built Astro and Storybook pages must return 404 instead of an SPA fallback.
export default defineConfig({ appType: 'mpa' });
