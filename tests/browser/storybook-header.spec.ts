import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { test, expect, expectAccessible } from './fixtures.js';

const storyUrl = (story: string) =>
  `/iframe.html?id=components-header--${story}&viewMode=story&globals=a11y.manual:!true`;
const fixture = readFileSync(
  'packages/colorado-design-system/src/components/header/header.fixture.html',
  'utf8',
);

async function openMobile(page: Page, story = 'default') {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto(storyUrl(story));
  const header = page.locator('[data-cods-header]');
  await expect(header).toHaveAttribute('data-cods-header-enhanced', '');
  return header;
}

test('package and Storybook preserve the canonical header fixture', async ({
  page,
}) => {
  expect(
    readFileSync(
      'packages/colorado-design-system/dist/fixtures/header.html',
      'utf8',
    ),
  ).toBe(fixture);
  await page.goto(storyUrl('without-java-script'));
  const equivalent = await page
    .locator('#storybook-root')
    .evaluate((element, html) => {
      const template = document.createElement('template');
      template.innerHTML = html;
      const strip = (node: ParentNode) => {
        const header = node.querySelector('.cods-header')!.cloneNode(true);
        (header as Element)
          .querySelectorAll('img, use')
          .forEach((asset) =>
            asset.removeAttribute(asset.matches('img') ? 'src' : 'href'),
          );
        return (header as Element).outerHTML;
      };
      return strip(element) === strip(template.content);
    }, fixture);
  expect(equivalent).toBe(true);
});

test('wide viewports show the logo above a horizontal navigation', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(storyUrl('default'));
  const header = page.getByRole('banner');
  await expect(header).toBeVisible();
  await expect(
    header.getByRole('link', { name: 'Colorado Design System home' }),
  ).toBeVisible();
  const nav = header.getByRole('navigation', { name: 'Primary' });
  await expect(nav).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeHidden();

  const links = await nav.getByRole('link').all();
  const boxes = await Promise.all(links.map((link) => link.boundingBox()));
  expect(new Set(boxes.map((box) => box!.y)).size).toBe(1);
  const logo = await header.locator('.cods-header__logo-image').boundingBox();
  expect(boxes[0]!.y).toBeGreaterThan(logo!.y + logo!.height);

  const current = nav.getByRole('link', { name: 'Services' });
  await expect(current).toHaveAttribute('aria-current', 'page');
  await expect(current).toHaveCSS('border-bottom-width', '4px');
  await expect(current).toHaveCSS('border-bottom-color', 'rgb(37, 81, 163)');
  await expect(nav).toHaveCSS('border-top-color', 'rgb(196, 197, 201)');
  for (const link of links)
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('the drawer opens, keeps focus inside, and closes on narrow screens', async ({
  page,
}, testInfo) => {
  const header = await openMobile(page);
  const menu = page.locator('.cods-header__menu-button');
  const close = page.getByRole('button', { name: 'Close menu' });
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.cods-header__nav')).toBeHidden();

  await header.evaluate((element) =>
    element.addEventListener(
      'cods-header:open',
      (event) => {
        (window as unknown as { opened: unknown }).opened = (
          event as CustomEvent
        ).detail;
      },
      { once: true },
    ),
  );
  await menu.focus();
  await page.keyboard.press('Enter');
  expect(
    await page.evaluate(
      () => (window as unknown as { opened: unknown }).opened,
    ),
  ).toEqual({ open: true });
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  // USWDS hides everything outside the open drawer; CoDS keeps Menu exposed
  // so screen readers can read its expanded state.
  await expect(menu).not.toHaveAttribute('aria-hidden');
  await expect(
    page.getByRole('button', { name: 'Menu', expanded: true }),
  ).toBeAttached();
  await expect(page.locator('.cods-header__logo')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(close).toBeFocused();
  await expect(close).toHaveCSS('outline-width', '4px');
  await expectAccessible(page, testInfo, '#storybook-root');

  for (const name of ['Services', 'Licenses and permits', 'News', 'About']) {
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name })).toBeFocused();
  }
  // The drawer covers the page, so focus wraps inside it (USWDS focus trap).
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(nav.getByRole('link', { name: 'About' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
});

test('the overlay closes the drawer and widening the window resets it', async ({
  page,
}) => {
  await openMobile(page);
  const menu = page.locator('.cods-header__menu-button');
  await menu.click();
  await page
    .locator('.cods-header__overlay')
    .click({ position: { x: 20, y: 400 } });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');

  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'News',
    }),
  ).toBeVisible();
});

test('without the controller every link stays in the page flow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.goto(storyUrl('without-java-script'));
  const header = page.locator('[data-cods-header]');
  await expect(header).not.toHaveAttribute('data-cods-header-enhanced', /.*/);
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const link of await nav.getByRole('link').all()) {
    await expect(link).toBeVisible();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  expect(
    await header.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('tablet widths show the horizontal navigation with the header shadow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 800, height: 800 });
  await page.goto(storyUrl('default'));
  const header = page.locator('[data-cods-header]');
  await expect(header).toHaveAttribute('data-cods-header-enhanced', '');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
  const links = await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link')
    .all();
  const boxes = await Promise.all(links.map((link) => link.boundingBox()));
  expect(new Set(boxes.map((box) => box!.y)).size).toBe(1);
  await expect(header).toHaveCSS(
    'box-shadow',
    'rgba(0, 0, 0, 0.12) 0px 4px 8px 0px',
  );
});

test('widening an open drawer keeps focus on the focused link', async ({
  page,
}) => {
  await openMobile(page);
  const menu = page.locator('.cods-header__menu-button');
  await menu.click();
  const news = page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'News' });
  await news.focus();
  await page.setViewportSize({ width: 800, height: 800 });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(news).toBeFocused();
});

test('the full header opens dropdowns and mega menus', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(storyUrl('full'));
  const header = page.locator('[data-cods-header]');
  await expect(header).toHaveAttribute('data-cods-header-enhanced', '');
  await expect(
    header.getByRole('search', { name: 'Site' }).getByRole('searchbox'),
  ).toBeVisible();
  await expect(header.getByRole('button', { name: 'Languages' })).toBeVisible();
  const nav = header.getByRole('navigation', { name: 'Primary' });
  const services = nav.getByRole('button', { name: 'Services' });
  const agencies = nav.getByRole('button', { name: 'Agencies' });
  await expect(services).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('link', { name: 'Taxes' })).toBeHidden();

  await services.click();
  await expect(services).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: 'Taxes' })).toBeVisible();
  await expectAccessible(page, testInfo, '#storybook-root');

  await agencies.click();
  await expect(services).toHaveAttribute('aria-expanded', 'false');
  const mega = page.locator('#cods-header-agencies');
  await expect(mega).toBeVisible();
  await expect(mega.getByRole('list', { name: 'Public safety' })).toBeVisible();
  const navBox = (await nav.boundingBox())!;
  const megaBox = (await mega.boundingBox())!;
  expect(megaBox.width).toBeCloseTo(navBox.width, 0);
  await expect(mega).toHaveCSS('background-color', 'rgb(0, 25, 112)');

  await mega.getByRole('link', { name: 'Revenue' }).focus();
  await page.keyboard.press('Escape');
  await expect(mega).toBeHidden();
  await expect(agencies).toBeFocused();
  // Examples don't navigate or search.
  const url = page.url();
  await services.click();
  await nav.getByRole('link', { name: 'Taxes' }).click();
  await header.getByRole('searchbox').fill('permits');
  await header.getByRole('searchbox').press('Enter');
  expect(page.url()).toBe(url);
  await header.getByRole('button', { name: 'Languages' }).click();
  await header.getByRole('link', { name: /Español/ }).click();
  expect(page.url()).toBe(url);
});

test('submenus open as accordions in the drawer', async ({
  page,
}, testInfo) => {
  await openMobile(page, 'full');
  await page.locator('.cods-header__menu-button').click();
  const nav = page.getByRole('navigation', { name: 'Primary' });
  const licenses = nav.getByRole('button', { name: 'Licenses and permits' });
  await licenses.click();
  await expect(licenses).toHaveAttribute('aria-expanded', 'true');
  const link = nav.getByRole('link', { name: 'Burn permits' });
  await expect(link).toBeVisible();
  const box = (await link.boundingBox())!;
  const navBox = (await nav.boundingBox())!;
  expect(box.x + box.width).toBeLessThanOrEqual(navBox.x + navBox.width);
  await expectAccessible(page, testInfo, '#storybook-root');

  await licenses.click();
  await expect(link).toBeHidden();
  await licenses.click();
  await link.focus();
  await page.keyboard.press('Escape');
  await expect(link).toBeHidden();
  await expect(licenses).toBeFocused();
  await expect(page.locator('.cods-header__menu-button')).toHaveAttribute(
    'aria-expanded',
    'true',
  );

  // With a collapsed submenu last, Tab must wrap, not reach the page.
  await page
    .locator('.cods-header__list > li:last-child')
    .evaluate((item) => item.remove());
  await nav.getByRole('button', { name: 'Agencies' }).focus();
  await page.keyboard.press('Tab');
  await expect(nav.getByRole('button', { name: 'Close menu' })).toBeFocused();
});

test('the drawer skips links excluded from the tab order', async ({ page }) => {
  await openMobile(page, 'full');
  await page.locator('.cods-header__menu-button').click();
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await nav.getByRole('link', { name: 'News' }).evaluate((link) => {
    link.setAttribute('tabindex', '-1');
  });
  const agencies = nav.getByRole('button', { name: 'Agencies' });
  const close = nav.getByRole('button', { name: 'Close menu' });
  await agencies.focus();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(agencies).toBeFocused();
});
