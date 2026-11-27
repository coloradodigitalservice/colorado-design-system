import { test, expect, expectAccessible } from './fixtures.js';

test('About page assembles the planned content and principles', async ({
  page,
}, testInfo) => {
  await page.goto('/about/');
  const main = page.getByRole('main');
  const nav = page
    .getByRole('banner')
    .getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveText([
    'Design System Foundations',
    'Components',
    'About',
  ]);
  await expect(
    nav.getByRole('link', { name: 'Design System Foundations' }),
  ).toHaveAttribute('href', '/components/#foundations');
  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await expect(
    main.getByRole('heading', { name: 'About', level: 1 }),
  ).toBeVisible();
  await expect(main.getByRole('heading', { level: 2 })).toHaveText([
    'Who We Are',
    'Contact Us',
    'Contribute',
    'Policies & Attributions',
    'Design Principles',
  ]);
  await expect(main.locator('hr.cods-divider')).toHaveCount(4);
  await expect(main.getByRole('link', { name: 'Email us' })).toHaveAttribute(
    'href',
    'mailto:oit@state.co.us',
  );
  await expect(
    main.getByRole('link', { name: 'The USWDS team and community' }),
  ).toHaveAttribute('href', 'https://designsystem.digital.gov/');
  await expect(
    main.getByRole('link', { name: 'Our partners at SIPA' }),
  ).toHaveAttribute('href', 'https://sipa.colorado.gov/');
  const principles = main
    .locator('#principles')
    .locator('..')
    .locator(':scope > ul > li');
  await expect(principles).toHaveCount(4);
  for (const [index, name] of [
    'Accessible:',
    'Trustworthy:',
    'Empowering:',
    'Adaptable:',
  ].entries())
    await expect(principles.nth(index)).toContainText(name);
  await expect(
    page.getByRole('link', { name: /Return to top/ }),
  ).toHaveAttribute('href', '#top');
  await expectAccessible(page, testInfo, 'main');
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(320);
});
