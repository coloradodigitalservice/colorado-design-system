import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: [
      'tests/**/*.test.ts',
      'packages/**/*.test.ts',
      'packages/**/*.test.mjs',
      'apps/**/*.test.ts',
    ],
  },
});
