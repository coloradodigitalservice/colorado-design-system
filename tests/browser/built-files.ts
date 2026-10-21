import type { Page } from '@playwright/test';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { relative, resolve, isAbsolute, sep } from 'node:path';

// Browser routing checks compiled pages and assets without starting a server.
export async function routeBuiltFiles(page: Page, app: 'web' | 'storybook') {
  await page.route(
    `http://127.0.0.1:${app === 'web' ? 4321 : 6006}/**`,
    async (route) => {
      let file: string;
      try {
        const buildRoot = realpathSync(
          app === 'web' ? 'apps/web/dist' : 'apps/storybook/storybook-static',
        );
        const pathname = decodeURIComponent(
          new URL(route.request().url()).pathname,
        );
        file = realpathSync(
          resolve(
            buildRoot,
            `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`,
          ),
        );
        const withinRoot = relative(buildRoot, file);
        if (
          withinRoot === '..' ||
          withinRoot.startsWith(`..${sep}`) ||
          isAbsolute(withinRoot) ||
          !statSync(file).isFile()
        )
          throw new Error('Not a build file');
      } catch {
        await route.fulfill({ status: 404, body: '' });
        return;
      }
      const extension = file.split('.').pop();
      const contentType = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        svg: 'image/svg+xml',
        woff2: 'font/woff2',
        json: 'application/json',
      }[extension ?? ''];
      await route.fulfill({
        body: readFileSync(file),
        contentType: contentType ?? 'application/octet-stream',
      });
    },
  );
}
