import type { Page } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Browser routing checks compiled pages and assets without starting a server.
export async function routeBuiltFiles(page: Page, app: 'web' | 'storybook') {
  await page.route(
    `http://127.0.0.1:${app === 'web' ? 4321 : 6006}/**`,
    async (route) => {
      const pathname = decodeURIComponent(
        new URL(route.request().url()).pathname,
      );
      const file = resolve(
        app === 'web' ? 'apps/web/dist' : 'apps/storybook/storybook-static',
        `.${pathname}${pathname.endsWith('/') ? 'index.html' : ''}`,
      );
      if (!existsSync(file)) {
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
