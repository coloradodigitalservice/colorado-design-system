// Footer documentation page, the component in its curated preview, and the
// documentation site's own Compact footer. Controller edge cases live in
// footer.test.ts; Storybook keeps only the surface-token check.
import { AxeBuilder } from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const footerFixture = readFileSync(
  'packages/colorado-design-system/src/components/footer/footer.fixture.html',
  'utf8',
);
const preview = (state: string) =>
  `[data-cods-docs-preview-state="${state}"] .cods-footer`;

test('footer page follows the component page outline', async ({
  page,
}, testInfo) => {
  await page.goto('/footer/');
  const main = page.locator('main');
  expect(
    await main
      .locator('.cods-docs-content > h2, .cods-docs-content > section > h2')
      .allTextContents(),
  ).toEqual([
    'Component preview',
    'Component code',
    'Component status',
    'Guidance',
    'Specifications',
  ]);
  const subheadings = await main.locator('h3').allTextContents();
  for (const heading of [
    'When to use',
    'Accessibility for footers',
    'Variants and elements',
    'Full footer groups',
    'Initializing the controller',
    'Variable settings',
    'Limitations',
  ])
    expect(subheadings).toContain(heading);
  await expect(page.locator('[data-cods-docs-preview-state]')).toHaveCount(2);

  const status = page.locator('[data-cods-docs-status]');
  await expect(status).toContainText(
    'Manual screen-reader, zoom, and forced-colors review is pending',
  );
  await expect(
    status.getByRole('link', { name: 'USWDS 3.14.0 Footer' }),
  ).toBeVisible();
  // The public page omits localization guidance and the examples catalogue.
  await expect(main).not.toContainText(/right-to-left|localization/i);
  await expect(page.locator('[data-cods-fixture-state]')).toHaveCount(0);

  // Both variants expose distinctly named navigation landmarks. (In the page
  // preview the footers sit inside <article>, so they are not contentinfo.)
  const full = page.locator(preview('full'));
  const compact = page.locator(preview('compact'));
  for (const name of [
    'Services and government',
    'Social media',
    'State policies',
  ])
    await expect(
      full.getByRole('navigation', { name, exact: true }),
    ).toBeVisible();
  for (const name of ['Quick links', 'Legal information'])
    await expect(
      compact.getByRole('navigation', { name, exact: true }),
    ).toBeVisible();
  const landmarks = await new AxeBuilder({ page })
    .include('[data-cods-docs-preview]')
    .include('.cods-docs-footer')
    .withRules(['landmark-unique'])
    .analyze();
  expect(landmarks.violations).toEqual([]);

  // Full enhances into disclosures at narrow widths; Compact stays static.
  await expect(page.locator(`${preview('full')} button`)).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  const services = full.getByRole('button', { name: 'Services' });
  await expect(services).toHaveAttribute('aria-expanded', 'false');
  await services.click();
  await expect(
    full.getByRole('link', { name: 'Benefits and assistance' }),
  ).toBeVisible();
  await expect(page.locator(`${preview('compact')} button`)).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expectAccessible(page, testInfo);
});

test('site footer uses the static Compact layout', async ({
  page,
}, testInfo) => {
  await page.goto('/');
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

  await expect(footer.getByRole('link', { name: 'Email us' })).toHaveAttribute(
    'href',
    'mailto:oit@state.co.us',
  );
  await expect(
    footer.getByRole('link', { name: 'GitHub', exact: true }),
  ).toHaveAttribute(
    'href',
    'https://github.com/coloradodigitalservice/colorado-design-system',
  );
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    "https://www.linkedin.com/company/state-of-colorado-governor's-office-of-information-technology/home/",
  );
  await expect(
    footer.getByRole('link', { name: 'CoDS Google Space' }),
  ).toHaveCount(0);
  await expect(
    footer.getByRole('navigation', { name: 'Site policies' }).getByRole('link'),
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
  await expectAccessible(page, testInfo);
});

test('header, content, and footer share a wider desktop container', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('/footer/');
  const containers = page.locator(
    '.cods-header__container, .cods-docs-grid, .cods-docs-footer .cods-docs-container',
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
    const footer = page.locator(preview('full'));
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
        if (previous) expect(box.top).toBeCloseTo(previous.bottom - 1, 2);
      }
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });
  const footer = page.locator(preview('full'));
  await expect(footer.locator('.cods-footer__primary-section')).toHaveCSS(
    'padding-top',
    '24px',
  );
  await expect(footer.locator('.cods-footer__group').first()).toHaveCSS(
    'border-top-width',
    '0px',
  );
});

for (const count of [1, 5]) {
  test(`Full footer supports ${count} navigation groups`, async ({
    page,
  }, testInfo) => {
    const controllerUrl = '/__footer-controller.mjs';
    await page.route(`**${controllerUrl}`, (route) =>
      route.fulfill({
        contentType: 'text/javascript',
        body: readFileSync(
          'packages/colorado-design-system/dist/colorado-design-system.mjs',
          'utf8',
        ),
      }),
    );
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const original = await page.evaluate(
      async ({ controllerUrl, fixture, count }) => {
        const template = document.createElement('template');
        const spriteUrl = document
          .querySelector('.cods-docs-footer svg use')
          ?.getAttribute('href')
          ?.split('#')[0];
        if (!spriteUrl) throw new Error('Missing built footer sprite URL');
        template.innerHTML = fixture.replaceAll('/icons/sprite.svg', spriteUrl);
        const example = template.content.querySelector<HTMLElement>(
          '[data-cods-footer-fixture="full"]',
        )!;
        document.body.append(example);
        const root = example.querySelector<HTMLElement>('[data-cods-footer]')!;
        const list = root.querySelector<HTMLElement>('.cods-footer__groups')!;
        const first = list.firstElementChild!;
        while (list.children.length > count) list.lastElementChild!.remove();
        while (list.children.length < count) {
          const group = first.cloneNode(true) as HTMLElement;
          const heading = group.querySelector<HTMLElement>(
            '.usa-footer__primary-link',
          )!;
          heading.setAttribute(
            'data-cods-footer-group',
            `additional-${list.children.length}`,
          );
          heading.textContent = `Additional group ${list.children.length + 1}`;
          list.append(group);
        }
        const originalMarkup = root.outerHTML;
        const events: unknown[] = [];
        root.addEventListener('cods-footer:change', (event) =>
          events.push((event as CustomEvent).detail),
        );
        Object.assign(window, { footerEvents: events });
        const api = await import(controllerUrl);
        api.initFooter(root);
        return originalMarkup;
      },
      { controllerUrl, fixture: footerFixture, count },
    );

    const root = page.locator('[data-cods-footer-fixture="full"] .cods-footer');
    const buttons = root.locator('button.cods-footer__heading');
    await expect(buttons).toHaveCount(count);
    await buttons.first().click();
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true');
    await buttons.last().click();
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'false');
    await expect(buttons.last()).toHaveAttribute(
      'aria-expanded',
      count === 1 ? 'false' : 'true',
    );
    expect(
      await page.evaluate(
        () => (window as Window & { footerEvents?: unknown[] }).footerEvents,
      ),
    ).toEqual(
      count === 1
        ? [
            { group: 'services', expanded: true },
            { group: 'services', expanded: false },
          ]
        : [
            { group: 'services', expanded: true },
            { group: 'services', expanded: false },
            { group: 'additional-4', expanded: true },
          ],
    );
    await expectAccessible(page, testInfo, '[data-cods-footer-fixture="full"]');

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(root.locator('h2.cods-footer__heading')).toHaveCount(count);
    if (count > 4) {
      const groups = root.locator('.cods-footer__group');
      const first = await groups.first().boundingBox();
      const last = await groups.last().boundingBox();
      expect(last!.y).toBeGreaterThan(first!.y);
    }
    await page.setViewportSize({ width: 375, height: 800 });
    await expect(buttons).toHaveCount(count);
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'false');
    await page.evaluate(
      async ({ controllerUrl }) => {
        const api = await import(controllerUrl);
        api.destroyFooter(
          document.querySelector<HTMLElement>(
            '[data-cods-footer-fixture="full"] [data-cods-footer]',
          )!,
        );
      },
      { controllerUrl },
    );
    expect(await root.evaluate((element) => element.outerHTML)).toBe(original);
  });
}

test('footer legal links stack below 640px and use rows from 640px', async ({
  page,
}) => {
  await page.goto('/footer/');
  for (const width of [320, 480, 639]) {
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
  await expect(
    page.locator('.cods-docs-footer .cods-footer__legal-list'),
  ).toHaveCSS('gap', '0px');
  for (const width of [640, 767, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const list of await page.locator('.cods-footer__legal-list').all()) {
      await expect(list).toHaveCSS('flex-direction', 'row');
      await expect(list).toHaveCSS('flex-wrap', 'wrap');
    }
    await expect(
      page.locator('.cods-docs-footer .cods-footer__legal-list'),
    ).toHaveCSS('gap', '16px');
  }
});

test('footer links use semibold text and the Figma link colors', async ({
  page,
}) => {
  await page.goto('/footer/');
  const scope = '[data-cods-docs-preview]';
  const navigationLinks = page.locator(
    `${scope} :is(.cods-footer__links, .cods-footer__return-to-top) a`,
  );
  const legalLinks = page.locator(`${scope} .cods-footer__legal-list a`);
  const styles = (elements: Element[]) => [
    ...new Set(
      elements.map((element) => {
        const style = getComputedStyle(element);
        return `${style.fontWeight} ${style.textDecorationLine} ${style.color}`;
      }),
    ),
  ];
  expect(await navigationLinks.evaluateAll(styles)).toEqual([
    '600 none rgb(0, 25, 112)',
  ]);
  expect(await legalLinks.evaluateAll(styles)).toEqual([
    '600 none rgb(27, 27, 27)',
  ]);
  for (const link of [navigationLinks.first(), legalLinks.first()]) {
    await link.hover();
    await expect(link).toHaveCSS('color', 'rgb(0, 16, 73)');
  }
});

test('surface overrides stay scoped and forced colors use system colors', async ({
  page,
}) => {
  await page.goto('/footer/');
  const full = page.locator(preview('full'));
  const compact = page.locator(preview('compact'));
  await full.evaluate((footer) => {
    footer.style.setProperty(
      '--cods-footer-primary-background',
      'rgb(255, 255, 255)',
    );
    footer.style.setProperty(
      '--cods-footer-secondary-background',
      'rgb(225, 230, 235)',
    );
  });
  await expect(full.locator('.cods-footer__primary-section')).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(full.locator('.cods-footer__secondary-section')).toHaveCSS(
    'background-color',
    'rgb(225, 230, 235)',
  );
  await expect(compact.locator('.cods-footer__primary-section')).toHaveCSS(
    'background-color',
    'rgb(251, 252, 253)',
  );

  await page.emulateMedia({ forcedColors: 'active' });
  const colors = await full.evaluate((footer) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Canvas';
    document.body.append(probe);
    const canvas = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return {
      canvas,
      primary: getComputedStyle(
        footer.querySelector('.cods-footer__primary-section')!,
      ).backgroundColor,
      secondary: getComputedStyle(
        footer.querySelector('.cods-footer__secondary-section')!,
      ).backgroundColor,
    };
  });
  expect(colors.primary).toBe(colors.canvas);
  expect(colors.secondary).toBe(colors.canvas);
  for (const section of [
    '.cods-footer__primary-section',
    '.cods-footer__secondary-section',
  ])
    await expect(full.locator(section)).toHaveCSS('border-top-width', '1px');
});

test('footer keyboard focus is visible and follows document order', async ({
  page,
  browserName,
}) => {
  await page.goto('/footer/');
  const full = page.locator(preview('full'));
  const returnToTop = full.getByRole('link', { name: 'Return to top' });
  await returnToTop.focus();
  await expect(returnToTop).toHaveCSS('outline-style', 'solid');
  await expect(returnToTop).toHaveCSS('outline-width', '4px');
  // macOS WebKit moves focus between links only with Option+Tab.
  await page.keyboard.press(
    browserName === 'webkit' && process.platform === 'darwin'
      ? 'Alt+Tab'
      : 'Tab',
  );
  await expect(
    full.getByRole('link', { name: 'Benefits and assistance' }),
  ).toBeFocused();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // axe needs JavaScript; the outline and site footer tests scan the page.
  test('footers reflow and keep visible, touch-sized links at 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({
      reducedMotion: 'reduce',
      forcedColors: 'active',
    });
    await page.goto('/footer/');
    // Both preview variants and the site footer; Full stays expanded.
    const footers = page.locator('.cods-footer');
    await expect(footers).toHaveCount(3);
    for (const footer of await footers.all()) {
      expect(
        await footer.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      for (const link of await footer.locator('a').all()) {
        await expect(link).toBeVisible();
        const box = await link.boundingBox();
        expect(box!.height).toBeGreaterThanOrEqual(48);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });

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
