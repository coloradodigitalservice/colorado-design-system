import { test, expect, expectAccessible } from './fixtures.js';

test('site footer uses Compact on overview and component pages', async ({
  page,
}, testInfo) => {
  for (const path of ['/', '/footer/']) {
    await page.goto(path);
    const footer = page.getByRole('contentinfo', {
      name: 'Colorado Design System',
      exact: true,
    });
    await expect(footer).toHaveClass(/cods-footer--compact/);
    await expect(
      footer.getByRole('navigation', { name: 'Contact Us', exact: true }),
    ).toBeVisible();
    await expect(
      footer.getByRole('navigation', { name: 'Site policies' }),
    ).toBeVisible();
    await expect(footer.locator('[data-cods-release]')).toBeVisible();
    await expect(footer).toContainText(/Development release \d/);
    await expect(footer).toContainText('Not a supported release.');
    await expect(footer.locator('button')).toHaveCount(0);

    await expect(
      footer.getByRole('link', { name: 'Email us' }),
    ).toHaveAttribute('href', 'mailto:oit@state.co.us');
    await expect(
      footer.getByRole('link', { name: 'GitHub', exact: true }),
    ).toHaveAttribute(
      'href',
      'https://github.com/coloradodigitalservice/colorado-design-system',
    );
    await expect(
      footer.getByRole('link', { name: 'LinkedIn' }),
    ).toHaveAttribute(
      'href',
      "https://www.linkedin.com/company/state-of-colorado-governor's-office-of-information-technology/home/",
    );
    await expect(
      footer.getByRole('link', { name: 'CoDS Google Space' }),
    ).toHaveCount(0);
    await expect(
      footer
        .getByRole('navigation', { name: 'Site policies' })
        .getByRole('link'),
    ).toHaveText([
      'Accessibility',
      'Financial Transparency',
      'Data Terms',
      'Privacy',
    ]);
    expect(
      await footer
        .locator('.cods-footer__legal-list a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual([
      'https://www.colorado.gov/accessibility-standards',
      'https://data.colorado.gov/stories/s/fjyf-bdat',
      'https://www.colorado.gov/general-notices',
      'https://www.colorado.gov/general-notices',
    ]);
    await expect(footer.locator('.cods-footer__copyright')).toContainText(
      'State of Colorado',
    );
    await footer.getByRole('link', { name: 'Return to top' }).click();
    await expect(page).toHaveURL(/#top$/);
    await expect(page.locator('#top')).toBeInViewport();
    await expectAccessible(page, testInfo);
  }
});

test('header, content, and footer share a wider desktop container', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/footer/');
  const containers = page.locator(
    '.cods-docs-header > .cods-docs-container, .cods-docs-grid, .cods-docs-footer .cods-docs-container',
  );
  await expect(containers).toHaveCount(5);
  for (const container of await containers.all()) {
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(1280);
    expect(box!.x).toBe(160);
  }
  const main = await page.locator('main').boundingBox();
  const content = await page.locator('.cods-docs-content').boundingBox();
  expect(content!.width).toBe(main!.width);
  expect(content!.width).toBeGreaterThan(900);
  const nav = await page
    .locator('.cods-docs-footer .cods-footer__nav')
    .boundingBox();
  expect(nav!.width).toBe(1216);
});

test('site footer follows the website mockup colors and compact typography', async ({
  page,
}) => {
  await page.goto('/');
  const footer = page.locator('.cods-docs-footer');
  await expect(footer.locator('.cods-footer__primary-section')).toHaveCSS(
    'background-color',
    'rgb(251, 252, 253)',
  );
  await expect(footer.locator('.cods-footer__secondary-section')).toHaveCSS(
    'background-color',
    'rgb(244, 245, 246)',
  );
  await expect(footer.getByRole('link', { name: 'Email us' })).toHaveCSS(
    'font-size',
    '14px',
  );
  await expect(footer.getByRole('heading', { name: 'Contact Us' })).toHaveCSS(
    'font-size',
    '18px',
  );
  const icon = footer.locator('.cods-icon');
  await expect(icon).toBeVisible();
  await expect(icon).toHaveCSS('width', '16px');
  await expect(icon).toHaveCSS('height', '16px');
  const sprite = await icon.locator('use').getAttribute('href');
  expect(sprite).toMatch(/#arrow-up$/);
});

test('mobile Full footer has flush, single-pixel blades and aligned panel links', async ({
  page,
}) => {
  for (const width of [320, 375, 479]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/footer/');
    const footer = page.locator(
      '[data-cods-footer-fixture="full"] .cods-footer',
    );
    const groups = footer.locator('.cods-footer__group');
    const services = footer.getByRole('button', {
      name: 'Services',
      exact: true,
    });
    await expect(services).toHaveAttribute('aria-expanded', 'false');
    const primary = await footer
      .locator('.cods-footer__primary-section')
      .boundingBox();
    const first = await groups.first().boundingBox();
    expect(first!.y).toBe(primary!.y);
    for (const group of await groups.all()) {
      await expect(group).toHaveCSS('border-top-width', '1px');
      await expect(group).toHaveCSS('border-bottom-width', '1px');
      await expect(group).toHaveCSS('border-top-color', 'rgb(196, 197, 201)');
    }

    for (const name of ['Services', 'Contact Us']) {
      const button = footer.getByRole('button', { name, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(button).toHaveCSS('gap', '16px');
      await expect(button).toHaveCSS('border-bottom-width', '1px');
      const positions = await button.evaluate((element) => {
        const text = [...element.childNodes].find(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        )!;
        const range = document.createRange();
        range.selectNodeContents(text);
        const style = getComputedStyle(element);
        const icon = getComputedStyle(element, '::before');
        return {
          text: range.getBoundingClientRect().x,
          iconEnd:
            element.getBoundingClientRect().x +
            parseFloat(style.paddingLeft) +
            parseFloat(icon.width),
          link: element
            .nextElementSibling!.querySelector('a')!
            .getBoundingClientRect().x,
        };
      });
      expect(positions.text - positions.iconEnd).toBe(16);
      expect(positions.link).toBe(positions.text);
      const boxes = await groups.evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { top: box.top, bottom: box.bottom };
        }),
      );
      for (const [index, box] of boxes.entries()) {
        const previous = boxes[index - 1];
        if (previous) expect(box.top).toBe(previous.bottom - 1);
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  const footer = page.locator('[data-cods-footer-fixture="full"] .cods-footer');
  await expect(footer.locator('.cods-footer__primary-section')).toHaveCSS(
    'padding-top',
    '24px',
  );
  await expect(footer.locator('.cods-footer__group').first()).toHaveCSS(
    'border-top-width',
    '0px',
  );
});

test('all footer legal links stack on mobile and return to rows on desktop', async ({
  page,
}) => {
  await page.goto('/footer/');
  for (const width of [320, 640, 767]) {
    await page.setViewportSize({ width, height: 800 });
    for (const list of await page.locator('.cods-footer__legal-list').all()) {
      await expect(list).toHaveCSS('flex-direction', 'column');
      await expect(list).toHaveCSS('flex-wrap', 'nowrap');
      const boxes = await list.locator('li').evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { x: box.x, top: box.top, bottom: box.bottom };
        }),
      );
      for (const [index, box] of boxes.entries()) {
        const previous = boxes[index - 1];
        if (previous) {
          expect(box.x).toBe(previous.x);
          expect(box.top).toBeGreaterThanOrEqual(previous.bottom);
        }
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  for (const list of await page.locator('.cods-footer__legal-list').all())
    await expect(list).toHaveCSS('flex-direction', 'row');
});

test('site footer reflows and keeps visible, touch-sized links at 320px', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/footer/');
  const footer = page.locator('.cods-docs-footer');
  for (const link of await footer.locator('a').all()) {
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(48);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo, '.cods-docs-footer');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('site footer works and exposes keyboard focus', async ({ page }) => {
    await page.goto('/');
    const returnToTop = page.locator('.cods-docs-footer').getByRole('link', {
      name: 'Return to top',
    });
    await returnToTop.focus();
    await expect(returnToTop).toHaveCSS('outline-style', 'solid');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#top$/);
    await expect(page.locator('#top')).toBeInViewport();
  });
});
