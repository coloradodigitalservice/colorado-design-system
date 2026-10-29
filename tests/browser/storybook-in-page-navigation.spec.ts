import { test, expect, expectAccessible } from './fixtures.js';

const story =
  '/iframe.html?id=components-in-page-navigation--default&viewMode=story&globals=a11y.manual:!true';

test('links and current section work in the canonical story', async ({
  page,
}, testInfo) => {
  await page.goto(story);
  const root = page.locator('[data-cods-in-page-navigation]');
  const links = root.getByRole('link');
  await expect(links.first()).toHaveAttribute('aria-current', 'location');
  await page.locator('#storybook-root section').evaluateAll((sections) => {
    sections.forEach((section) => {
      (section as HTMLElement).style.minHeight = '100vh';
    });
  });
  await page.locator('#payment-amounts').evaluate((heading) => {
    window.scrollTo(
      0,
      window.scrollY + heading.getBoundingClientRect().top + 300,
    );
  });
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
  await page.locator('#required-documents').evaluate((section) => {
    (section as HTMLElement).style.minHeight = '0';
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await expect(links.nth(2)).toHaveAttribute('aria-current', 'location');
  await links.first().focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#who-can-apply$/);
  await expectAccessible(page, testInfo, '#storybook-root');
});

test('authored links work without enhancement', async ({ page }) => {
  await page.goto(
    '/iframe.html?id=components-in-page-navigation--without-java-script&viewMode=story&globals=a11y.manual:!true',
  );
  await page.getByRole('link', { name: 'Payment amounts' }).click();
  await expect(page).toHaveURL(/#payment-amounts$/);
  await expect(page.locator('#payment-amounts')).toBeVisible();
});

test('a jump into a gap after a section keeps that section current', async ({
  page,
}) => {
  await page.goto(story);
  const links = page
    .locator('[data-cods-in-page-navigation]')
    .getByRole('link');
  await page.locator('#storybook-root section').evaluateAll((sections) => {
    sections.forEach((section) => {
      (section as HTMLElement).style.minHeight = '100vh';
      (section as HTMLElement).style.marginBottom = '1000px';
    });
  });
  await expect(links.first()).toHaveAttribute('aria-current', 'location');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.locator('#who-can-apply').evaluate((section) => {
    window.scrollTo(
      0,
      window.scrollY + section.getBoundingClientRect().bottom + 300,
    );
  });
  await expect(links.first()).toHaveAttribute('aria-current', 'location');
  await page.locator('#payment-amounts').evaluate((section) => {
    window.scrollTo(
      0,
      window.scrollY + section.getBoundingClientRect().bottom + 300,
    );
  });
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
});
