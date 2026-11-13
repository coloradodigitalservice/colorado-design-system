import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page, Route } from '@playwright/test';
import { routeBuiltFiles } from './built-files.js';

let directory: string;
beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'cods-built-files-'));
  vi.spyOn(process, 'cwd').mockReturnValue(directory);
  for (const root of ['apps/web/dist', 'apps/storybook/storybook-static']) {
    mkdirSync(join(directory, root), { recursive: true });
    writeFileSync(join(directory, root, 'index.html'), '<h1>Built page</h1>');
    symlinkSync(
      join(directory, 'package.json'),
      join(directory, root, 'linked.json'),
    );
  }
  writeFileSync(join(directory, 'package.json'), 'private source');
});
afterEach(() => {
  vi.restoreAllMocks();
  rmSync(directory, { recursive: true, force: true });
});

for (const app of ['web', 'storybook'] as const) {
  it(`${app} serves built files and rejects traversal, symlinks, and invalid paths`, async () => {
    let handler!: (route: Route) => Promise<void>;
    const page = {
      route: vi.fn(async (_pattern, callback) => {
        handler = callback;
      }),
    };
    await routeBuiltFiles(page as unknown as Page, app);
    const request = async (path: string) => {
      const fulfill = vi.fn();
      await handler({
        request: () => ({
          url: () => `http://127.0.0.1:${app === 'web' ? 4321 : 6006}${path}`,
        }),
        fulfill,
      } as unknown as Route);
      return fulfill.mock.calls[0]![0];
    };
    expect(await request('/')).toMatchObject({ contentType: 'text/html' });
    expect((await request('/')).body.toString()).toBe('<h1>Built page</h1>');
    for (const path of [
      '/..%2f..%2f..%2fpackage.json',
      '/linked.json',
      '/missing.js',
      '/%ZZ',
    ]) {
      expect(await request(path)).toEqual({ status: 404, body: '' });
    }
  });
}
