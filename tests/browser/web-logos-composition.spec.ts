import { test, expect, expectAccessible } from './fixtures.js';

test('Logos page presents usage guidance and approved asset destinations', async ({
  page,
}, testInfo) => {
  await page.goto('/logos/');
  const main = page.getByRole('main');
  await expect(
    main.getByRole('heading', { name: 'Logos', level: 1 }),
  ).toBeVisible();
  for (const heading of [
    'Ownership and asset inventory',
    'Use the asset',
    'State brand guidance',
    'Accessible use',
  ]) {
    await expect(
      main.getByRole('heading', { name: heading, level: 2 }),
    ).toBeVisible();
  }
  await expect(
    page
      .getByRole('navigation', { name: 'Documentation' })
      .getByRole('link', { name: 'Logos' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    main.getByRole('link', { name: 'Icon', exact: true }),
  ).toHaveAttribute('href', /\/icon\/$/);
  await expect(
    main.getByRole('link', { name: /branding guidance/ }),
  ).toHaveAttribute('href', 'https://dcs.colorado.gov/ids/state-branding');
  await expect(
    main.getByRole('link', { name: 'logo specifications' }),
  ).toHaveAttribute(
    'href',
    'https://dcs.colorado.gov/ids/state-branding-guidelines/the-elements',
  );
  await expect(
    main.getByRole('link', { name: 'Download the SVG' }),
  ).toHaveAttribute('download', 'cods-logo.svg');
  await expect(
    main.getByRole('link', { name: 'trademark notice' }),
  ).toHaveAttribute('download', 'NOTICE.md');
  await expectAccessible(page, testInfo, 'main');
});
