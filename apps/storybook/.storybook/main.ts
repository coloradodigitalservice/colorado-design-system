import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/html-vite';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, '../../..');

const config: StorybookConfig = {
  framework: '@storybook/html-vite',
  stories: ['../src/**/*.stories.@(js|ts)'],
  addons: ['@storybook/addon-a11y'],
  viteFinal: async (viteConfig) => {
    viteConfig.css = {
      ...viteConfig.css,
      preprocessorOptions: {
        scss: {
          // Sass module specifiers (`@use 'pkg'`) only resolve via explicit
          // load paths, so point at this workspace's installed dependencies.
          loadPaths: [path.resolve(dirname, '../node_modules')],
        },
      },
    };
    viteConfig.server = {
      ...viteConfig.server,
      fs: {
        ...viteConfig.server?.fs,
        // Story fixtures are imported directly from the governance samples
        // and canonical component directories, both outside this app's root.
        allow: [repoRoot],
      },
    };
    return viteConfig;
  },
};

export default config;
