import { test, expect } from './fixtures.js';

test('components directory lists foundations and components in order', async ({
  page,
}) => {
  await page.goto('/components/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Components' }),
  ).toBeVisible();
  const sections = page.getByRole('main').locator('section');
  await expect(sections).toHaveCount(2);
  await expect(sections.nth(0).locator('.usa-card')).toHaveCount(8);
  await expect(sections.nth(1).locator('.usa-card')).toHaveCount(27);
  await expect(sections.nth(0).locator('h3')).toHaveText([
    'Color',
    'Elevation',
    'Focus States',
    'Grids & Spacing',
    'Icons',
    'Logos',
    'Radius',
    'Typography',
  ]);
  await expect(sections.nth(1).locator('h3')).toHaveText([
    'Accordion',
    'Breadcrumbs',
    'Button',
    'Card',
    'Checkbox',
    'Combo Box',
    'Divider',
    'Footer',
    'Header',
    'Hero',
    'Icon List',
    'Input',
    'In-Page Alert',
    'In-Page Navigation',
    'Language Selector',
    'Link',
    'Maps',
    'Modal',
    'Process List',
    'Radio Buttons',
    'Select (Dropdown)',
    'Search',
    'Site Alert',
    'Tags',
    'Toasts',
    'Videos',
    'Tooltip',
  ]);
  await expect(page.getByRole('main').locator('.usa-card img')).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'Components' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(
    sections.nth(1).getByRole('link', { name: /Accordion/ }),
  ).toHaveAttribute('href', '/accordion/');
  await expect(sections.nth(1).getByRole('link', { name: /Maps/ })).toHaveCount(
    0,
  );
});
