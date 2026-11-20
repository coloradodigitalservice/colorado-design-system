// Scroll-geometry regressions for the In-Page Navigation controller. Keyboard,
// hover, current-section, no-JS, and axe checks run on the docs page in
// web-in-page-navigation.spec.ts, in all three browsers.
import { test, expect } from './fixtures.js';

const story =
  '/iframe.html?id=components-in-page-navigation--default&viewMode=story&globals=a11y.manual:!true';

test('a short final section stays inactive until the page end', async ({
  page,
}) => {
  await page.goto(story);
  const links = page
    .locator('[data-cods-in-page-navigation]')
    .getByRole('link');
  await page.locator('#payment-amounts').evaluate((section) => {
    (section as HTMLElement).style.minHeight = '150vh';
  });
  await page.locator('#required-documents').evaluate((section) => {
    (section as HTMLElement).style.minHeight = '0';
    (section as HTMLElement).style.height = '80px';
    const spacer = document.createElement('div');
    spacer.style.height = '150vh';
    section.after(spacer);
    window.scrollTo(
      0,
      window.scrollY +
        section.getBoundingClientRect().top -
        window.innerHeight * 0.6,
    );
  });
  await expect(links.nth(1)).toHaveAttribute('aria-current', 'location');
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(links.nth(2)).toHaveAttribute('aria-current', 'location');
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
