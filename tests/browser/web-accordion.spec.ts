// Accordion documentation page. Component behavior across every fixture state
// is covered in storybook-accordion.spec.ts; this file covers the page's own
// composition and the page-load timing paths that only a real page exercises.
import { routeBuiltFiles } from './built-files.js';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const preview = (name: string) => `[data-cods-docs-preview-state="${name}"]`;
const defaultRoot = `${preview('default')} [data-cods-accordion]`;

test('accordion page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/accordion/');
  const main = page.locator('main');
  expect(await main.locator('h2').allTextContents()).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Writing for accordions',
    'Accessibility for accordions',
    'Variants and elements',
    'Initializing the controller',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);

  const figures = page.locator('[data-cods-docs-preview-state]');
  await expect(figures).toHaveCount(3);
  for (const state of ['default', 'borderless', 'white'])
    await expect(
      page.locator(`${preview(state)} [data-cods-accordion]`),
    ).toHaveAttribute('data-cods-accordion-enhanced', '');
  await expect(page.locator('[data-cods-docs-preview-code]')).toContainText(
    'cods-accordion--white',
  );

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText('experimental');
  await expect(status).toContainText('Manual accessibility review');
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Accordion' }),
  ).toBeVisible();
  await expect(
    status.getByRole('link', { name: 'Accessibility evidence' }),
  ).toHaveAttribute(
    'href',
    /\/accordion\/accessibility\/accordion\.evidence\.md$/,
  );
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('preview panels remain readable without CSS or JavaScript', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  if (process.env.CODS_BUILT_FILES === '1') await routeBuiltFiles(page, 'web');
  await page.goto('http://127.0.0.1:4321/accordion/');
  const panels = page.locator('[data-cods-accordion-panel]:visible');
  await expect(panels).toHaveCount(4);
  await expect(page.locator('[data-cods-accordion-enhanced]')).toHaveCount(0);
  await page.evaluate(() =>
    document
      .querySelectorAll('style,link[rel="stylesheet"]')
      .forEach((element) => element.remove()),
  );
  await expect(panels).toHaveCount(4);
  await testInfo.attach('accordion-unenhanced', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await context.close();
});

test('delayed enhancement preserves focus when initial state hides content', async ({
  page,
}) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route('**/*.js', async (route) => {
    await scriptsReady;
    await route.fallback();
  });
  try {
    await page.goto('/accordion/', { waitUntil: 'commit' });
    const root = page.locator(defaultRoot);
    const link = root.getByRole('link');
    await expect(link).toBeVisible();
    await expect(root).not.toHaveAttribute('data-cods-accordion-enhanced');
    await link.focus();
    await expect(link).toBeFocused();
    releaseScripts();
    await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
    await expect(link).toBeHidden();
    await expect(root.getByRole('button').nth(1)).toBeFocused();
  } finally {
    releaseScripts();
  }
});

test('keyboard, exclusive state, focus, and bubbling events', async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto('/accordion/');
  const root = page.locator(defaultRoot);
  const buttons = root.getByRole('button');
  await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
  await page.evaluate(() => {
    const events: unknown[] = [];
    document.body.addEventListener('cods-accordion:change', (event) =>
      events.push((event as CustomEvent).detail),
    );
    Object.assign(window, { accordionEvents: events });
  });
  await buttons.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(buttons.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(buttons.nth(1)).toBeFocused();
  await expect(root.getByRole('link')).toBeVisible();
  const tab =
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab';
  await page.keyboard.press(tab);
  await expect(root.getByRole('link')).toBeFocused();
  await page.keyboard.press(tab === 'Alt+Tab' ? 'Alt+Shift+Tab' : 'Shift+Tab');
  await page.keyboard.press('Space');
  await expect(buttons.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await expect(buttons.nth(1)).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(buttons.nth(1)).toBeFocused();
  expect(
    await page.evaluate(
      () =>
        (window as Window & { accordionEvents?: unknown[] }).accordionEvents,
    ),
  ).toEqual([
    { panelId: 'accordion-default-1', expanded: false },
    { panelId: 'accordion-default-2', expanded: true },
    { panelId: 'accordion-default-2', expanded: false },
  ]);
  await expectAccessible(page, testInfo);
});

test('focused trigger shows the Colorado focus ring', async ({
  page,
}, testInfo) => {
  await page.goto('/accordion/');
  const trigger = page.locator(defaultRoot).getByRole('button').first();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style', 'solid');
  await expect(trigger).toHaveCSS('outline-width', '2px');
  await expect(trigger).toHaveCSS(
    'box-shadow',
    'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px',
  );
  // Review artifacts for manual visual QA of both focused states.
  const example = page.locator(preview('default'));
  await testInfo.attach('accordion-expanded-focus', {
    body: await example.screenshot(),
    contentType: 'image/png',
  });
  await page.keyboard.press('Space');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await testInfo.attach('accordion-collapsed-focus', {
    body: await example.screenshot(),
    contentType: 'image/png',
  });
});

test('focused trigger uses the system highlight in forced colors', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/accordion/');
  const trigger = page.locator(defaultRoot).getByRole('button').first();
  await trigger.focus();
  await expect(trigger).toBeFocused();
  const [outline, highlight] = await Promise.all([
    trigger.evaluate((element) => getComputedStyle(element).outlineColor),
    page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.color = 'Highlight';
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    }),
  ]);
  expect(outline).toBe(highlight);
  await expect(trigger).toHaveCSS('outline-style', 'solid');
});

for (const scenario of [
  { name: 'direct collapse', panelId: 'accordion-default-2', expanded: false },
  {
    name: 'single-open sibling collapse',
    panelId: 'accordion-default-1',
    expanded: true,
  },
]) {
  test(`public setExpanded restores panel focus on ${scenario.name}`, async ({
    page,
  }) => {
    const controllerUrl = '/__accordion-controller.mjs';
    await page.route(`**${controllerUrl}`, (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: readFileSync(
          new URL(
            '../../packages/colorado-design-system/dist/colorado-design-system.mjs',
            import.meta.url,
          ),
          'utf8',
        ),
      }),
    );
    await page.goto('/accordion/');
    const root = page.locator(defaultRoot);
    await expect(root).toHaveAttribute('data-cods-accordion-enhanced', '');
    await page.evaluate(
      async ({ controllerUrl, defaultRoot }) => {
        const api = await import(controllerUrl);
        const original = document.querySelector<HTMLElement>(defaultRoot)!;
        // Reuse rendered canonical markup with a fresh root so the bundled
        // public API owns initialization without the docs script's listeners.
        const freshRoot = original.cloneNode(true) as HTMLElement;
        original.replaceWith(freshRoot);
        api.initAccordion(freshRoot);
        api.setAccordionExpanded(freshRoot, 'accordion-default-2', true);
      },
      { controllerUrl, defaultRoot },
    );
    const trigger = root.getByRole('button').nth(1);
    const link = root.getByRole('link');
    await link.focus();
    await expect(link).toBeFocused();
    const focusedDuringEvents = await page.evaluate(
      async ({ controllerUrl, defaultRoot, panelId, expanded }) => {
        const api = await import(controllerUrl);
        const root = document.querySelector<HTMLElement>(defaultRoot)!;
        const trigger = root.querySelector(
          '[aria-controls="accordion-default-2"]',
        );
        const observations: boolean[] = [];
        root.addEventListener('cods-accordion:change', () =>
          observations.push(document.activeElement === trigger),
        );
        api.setAccordionExpanded(root, panelId, expanded);
        return observations;
      },
      {
        controllerUrl,
        defaultRoot,
        panelId: scenario.panelId,
        expanded: scenario.expanded,
      },
    );
    await expect(link).toBeHidden();
    await expect(trigger).toBeFocused();
    expect(focusedDuringEvents).toEqual(
      scenario.expanded ? [true, true] : [true],
    );
  });
}
