import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/generated/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/storybook-static/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly' },
    },
  },
  prettier,
];
