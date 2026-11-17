import type { Plugin } from 'vite';

export function codsIcons(options?: {
  mode?: 'subset' | 'full';
  sourceDir?: string;
}): Plugin;
