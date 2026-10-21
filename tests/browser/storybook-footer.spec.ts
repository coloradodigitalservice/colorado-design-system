import { AxeBuilder } from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-footer--all-states&viewMode=story&globals=a11y.manual:!true';
const fixture = readFileSync(
  'packages/colorado-design-system/src/components/footer/footer.fixture.html',
  'utf8',
);

test('package and Storybook preserve the canonical footer fixture', async ({
  page,
}, testInfo) => {
  expect(
    readFileSync(
      'packages/colorado-design-system/dist/fixtures/footer.html',
      'utf8',
    ),
  ).toBe(fixture);
  await page.goto(story);
  const root = page.locator('#storybook-root');
  await expect(root.locator('.cods-footer')).toHaveCount(2);
  const equivalent = await root.evaluate((element, html) => {
    const template = document.createElement('template');
    template.innerHTML = html.replaceAll(
      '/icons/sprite.svg',
      element
        .querySelector('.cods-footer__social-link svg use')
        ?.getAttribute('href')
        ?.split('#')[0] ?? '',
    );
    const normalize = (node: ParentNode) =>
      [...node.querySelectorAll('.cods-footer')].map(
        (footer) => footer.outerHTML,
      );
    return (
      JSON.stringify(normalize(element)) ===
      JSON.stringify(normalize(template.content))
    );
  }, fixture);
  expect(equivalent).toBe(true);
  await expect(
    root.getByRole('contentinfo', { name: 'Full site footer' }),
  ).toBeVisible();
  await expect(
    root.getByRole('contentinfo', { name: 'Compact site footer' }),
  ).toBeVisible();
  const full = root.locator('[data-cods-footer-fixture="full"]');
  const compact = root.locator('[data-cods-footer-fixture="compact"]');
  await expect(
    full.locator('.cods-footer__contact .cods-footer__social-link'),
  ).toHaveCount(5);
  await expect(compact.locator('.cods-footer__social')).toHaveCount(0);
  await expect(root.locator('.cods-footer__identity')).toHaveCount(0);
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('full and compact stories reuse the canonical variants', async ({
  page,
}) => {
  for (const [storyId, state] of [
    ['full', 'full'],
    ['compact', 'compact'],
  ] as const) {
    await page.goto(
      `/iframe.html?id=components-footer--${storyId}&viewMode=story&globals=a11y.manual:!true`,
    );
    await expect(
      page.locator(`[data-cods-footer-fixture="${state}"] .cods-footer`),
    ).toHaveCount(1);
  }
});

test('full disclosures open and close on narrow screens', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(
    '/iframe.html?id=components-footer--full&viewMode=story&globals=a11y.manual:!true',
  );
  const root = page.locator('[data-cods-footer]');
  const services = page.getByRole('button', { name: 'Services' });
  const contact = page.getByRole('button', { name: 'Contact Us' });
  await expect(services).toHaveAttribute('aria-expanded', 'false');
  await services.click();
  await expect(services).toHaveAttribute('aria-expanded', 'true');
  await expect(
    root.getByRole('link', { name: 'Benefits and assistance' }),
  ).toBeVisible();
  await contact.click();
  await expect(services).toHaveAttribute('aria-expanded', 'false');
  await expect(contact).toHaveAttribute('aria-expanded', 'true');
  await expect(root.getByRole('link', { name: 'Instagram' })).toBeVisible();
  await expectAccessible(page, testInfo, '#storybook-root');

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(root.getByRole('heading', { name: 'Services' })).toBeVisible();
  await expect(
    root.getByRole('link', { name: 'Benefits and assistance' }),
  ).toBeVisible();
});

test('footer primary section is lighter than the copyright section', async ({
  page,
}) => {
  await page.goto(story);
  const full = page.locator('[data-cods-footer-fixture="full"] .cods-footer');
  await expect(full.locator('.cods-footer__primary-section')).toHaveCSS(
    'background-color',
    'rgb(244, 245, 246)',
  );
  await expect(full.locator('.cods-footer__secondary-section')).toHaveCSS(
    'background-color',
    'rgb(235, 236, 237)',
  );
});

test('footer links use semibold text without default underlines', async ({
  page,
}) => {
  await page.goto(story);
  const links = page.locator(
    '.cods-footer__links a, .cods-footer__legal-list a, .cods-footer__return-to-top a',
  );
  await expect(links.first()).toHaveCSS('font-weight', '600');
  await expect(links.first()).toHaveCSS('text-decoration-line', 'none');
  for (const link of await links.all()) {
    await expect(link).toHaveCSS('font-weight', '600');
    await expect(link).toHaveCSS('text-decoration-line', 'none');
  }
});

test('footer links use semantic secondary-action text colors', async ({
  page,
}) => {
  await page.goto(story);
  const links = page.locator(
    '.cods-footer__links a, .cods-footer__legal-list a, .cods-footer__return-to-top a',
  );
  const colors = await links.evaluateAll((elements) => [
    ...new Set(elements.map((element) => getComputedStyle(element).color)),
  ]);
  expect(colors).toEqual(['rgb(0, 25, 112)']);

  const link = links.first();
  await link.hover();
  await expect(link).toHaveCSS('color', 'rgb(0, 16, 73)');
});

test('footer link groups reflow at 320px and keep touch-sized targets', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto(story);
  const root = page.locator('#storybook-root');
  for (const footer of await root.locator('.cods-footer').all()) {
    await expect(footer).toBeVisible();
    expect(
      await footer.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    const links = footer.locator('a');
    for (const link of await links.all()) {
      await expect(link).toBeVisible();
      expect(
        await link.evaluate(
          (element) => element.getBoundingClientRect().height,
        ),
      ).toBeGreaterThanOrEqual(48);
    }
  }
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('all footer landmark names are distinct', async ({ page }, testInfo) => {
  await page.goto(story);
  const results = await new AxeBuilder({ page })
    .include('#storybook-root')
    .withRules(['landmark-unique'])
    .analyze();
  await testInfo.attach('landmark-unique-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(results.violations).toEqual([]);
});

test('footer keyboard focus is visible and follows document order', async ({
  page,
}) => {
  await page.goto(story);
  await page.keyboard.press('Tab');
  const returnToTop = page
    .getByRole('link', {
      name: 'Return to top',
    })
    .first();
  await expect(returnToTop).toBeFocused();
  await expect(returnToTop).toHaveCSS('outline-style', 'solid');
  await expect(returnToTop).toHaveCSS('outline-width', '4px');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Benefits and assistance' }).first(),
  ).toBeFocused();
});
