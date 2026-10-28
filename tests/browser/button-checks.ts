import { test, expect, expectAccessible } from './fixtures.js';
import metadata from '../../packages/colorado-design-system/src/components/button/button.metadata.json' with { type: 'json' };

export function buttonChecks(url: string, story = false) {
  test.beforeEach(async ({ page }) => {
    await page.goto(url);
    await expect(
      page.locator('[data-cods-button-fixture="default"]'),
    ).toBeVisible();
  });

  test('all canonical states have accessible names and contrast', async ({
    page,
  }, testInfo) => {
    await expect(page.locator('[data-cods-button-fixture]')).toHaveCount(
      metadata.states.length,
    );
    await expect(
      page
        .getByRole('button', { name: 'Add application', exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-cods-button-fixture="link"] a'),
    ).toHaveAttribute('href', /(?:^|\/)getting-started\/$/);
    const href = await page
      .locator('[data-cods-button-fixture="link"] a')
      .getAttribute('href');
    expect(
      new URL(href!, 'https://example.test/colorado-design-system/button/')
        .pathname,
    ).toBe('/colorado-design-system/getting-started/');
    for (const icon of await page.locator('.cods-button__icon').all()) {
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon).toHaveAttribute('focusable', 'false');
      await expect(icon).toHaveCSS('width', '16px');
      await expect(icon).toHaveCSS('height', '16px');
      expect(
        await icon.evaluate((element) => {
          const svg = element as SVGSVGElement;
          const box = svg.getBBox();
          return (
            box.width > 0 &&
            box.height > 0 &&
            getComputedStyle(svg).fill === getComputedStyle(svg).color
          );
        }),
        'shared sprite artwork loads and inherits the button foreground',
      ).toBe(true);
      await expect(icon.locator('use')).toHaveAttribute(
        'href',
        /sprite[^/]*\.svg#(?:plus|export|arrow-right)$/,
      );
      expect(
        await icon.evaluate((element) => {
          return (
            getComputedStyle(element).color ===
            getComputedStyle(element.closest('.cods-button')!).color
          );
        }),
      ).toBe(true);
    }
    await expectAccessible(
      page,
      testInfo,
      story ? '#storybook-root' : undefined,
    );
  });

  test('native keyboard activation, visible focus, and disabled skipping', async ({
    page,
    browserName,
  }) => {
    const tab =
      browserName === 'webkit' && process.platform === 'darwin'
        ? 'Alt+Tab'
        : 'Tab';
    const root = page.locator('[data-cods-button-fixture="default"] button');
    await page.evaluate(() => {
      for (const button of document.querySelectorAll<HTMLButtonElement>(
        '.cods-button',
      )) {
        button.addEventListener('click', () => {
          button.dataset.codsTestActivations = String(
            Number(button.dataset.codsTestActivations ?? 0) + 1,
          );
        });
      }
    });
    await root.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(root).toHaveAttribute('data-cods-test-activations', '2');
    expect(await root.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe(
      '4px',
    );
    expect(
      await root.evaluate((el) => getComputedStyle(el).outlineOffset),
    ).toBe('2px');
    const secondary = page.locator(
      '[data-cods-button-fixture="secondary"] button',
    );
    for (let step = 0; step < 5; step++) {
      await page.keyboard.press(tab);
      if (await secondary.evaluate((el) => el === document.activeElement))
        break;
    }
    await expect(secondary).toBeFocused();
    const last = page
      .locator('[data-cods-button-fixture="focus-visible"] button')
      .last();
    await last.focus();
    const next = page
      .locator('[data-cods-button-fixture="long-content"] button')
      .first();
    for (let step = 0; step < 6; step++) {
      await page.keyboard.press(tab);
      expect(
        await page.evaluate(() =>
          document.activeElement?.matches('button:disabled'),
        ),
      ).toBe(false);
      if (await next.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(next).toBeFocused();
    for (const button of await page
      .locator('.cods-button:not(:disabled)')
      .all()) {
      await button.focus();
      expect(
        await button.evaluate((el) => getComputedStyle(el).outlineWidth),
      ).toBe('4px');
    }
    for (const disabled of await page.locator('.cods-button:disabled').all()) {
      await disabled.evaluate((el: HTMLButtonElement) => el.click());
      await expect(disabled).not.toHaveAttribute(
        'data-cods-test-activations',
        /./,
      );
      await expect(disabled).toBeDisabled();
    }
  });

  test('real hover and active states use the action palette', async ({
    page,
  }) => {
    for (const selector of [
      '[data-cods-button-fixture="danger"] button',
      '[data-cods-button-fixture="icon-only"] button',
      '[data-cods-button-fixture="icon-only-secondary"] button',
      '[data-cods-button-fixture="link"] a',
    ]) {
      const button = page.locator(selector);
      const before = await button.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      await button.hover();
      const hovered = await button.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(hovered).not.toBe(before);
      await page.mouse.down();
      const active = await button.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(active).not.toBe(hovered);
      // Move away before releasing so navigation links do not leave the fixture.
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
    await page
      .locator('[data-cods-button-fixture="disabled"] button')
      .first()
      .hover({ force: true });
    await expect(
      page.locator('[data-cods-button-fixture="disabled"] button').first(),
    ).toBeDisabled();
  });

  test('Medium and Slim dimensions preserve content and grow for wrapping', async ({
    page,
  }) => {
    for (const state of ['default', 'secondary', 'danger']) {
      const button = page.locator(
        `[data-cods-button-fixture="${state}"] button`,
      );
      await expect(button).toHaveCSS('height', '40px');
      await expect(button).toHaveCSS('line-height', '16px');
      await expect(button).toHaveCSS('padding-top', '12px');
      await expect(button).toHaveCSS('padding-inline-start', '16px');
    }
    for (const state of [
      'icon-only',
      'icon-only-secondary',
      'icon-only-slim',
      'icon-only-secondary-slim',
    ]) {
      const button = page.locator(
        `[data-cods-button-fixture="${state}"] button`,
      );
      await expect(button).toHaveCSS('width', '40px');
      await expect(button).toHaveCSS(
        'height',
        state.endsWith('slim') ? '32px' : '40px',
      );
    }
    const slim = page.locator('[data-cods-button-fixture="slim"] button');
    await expect(slim).toHaveCSS('height', '32px');
    await expect(slim).toHaveCSS('padding-top', '8px');
    await expect(slim).toHaveCSS('padding-bottom', '8px');
    await expect(slim).toHaveCSS('line-height', '16px');
    await expect(slim).toHaveCSS('padding-inline-start', '16px');
    await page.setViewportSize({ width: 320, height: 800 });
    for (const button of await page
      .locator('[data-cods-button-fixture="long-content"] .cods-button--slim')
      .all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThan(32);
      expect(
        await button.evaluate(
          (el) =>
            el.scrollWidth <= el.clientWidth &&
            el.scrollHeight <= el.clientHeight,
        ),
      ).toBe(true);
    }
    await page.emulateMedia({ forcedColors: 'active' });
    await expect(slim).toHaveCSS('height', '32px');
    for (const state of ['icon-only-slim', 'icon-only-secondary-slim']) {
      const button = page.locator(
        `[data-cods-button-fixture="${state}"] button`,
      );
      await expect(button).toHaveCSS('width', '40px');
      await expect(button).toHaveCSS('height', '32px');
    }
  });

  test('decorative label icons keep their names, logical order, and RTL mirroring', async ({
    page,
  }) => {
    for (const kind of ['primary', 'secondary', 'danger']) {
      for (const size of ['medium', 'slim']) {
        for (const placement of ['start', 'end', 'both']) {
          const button = page.locator(
            `[data-cods-button-fixture="${kind}-${size}-icon-${placement}"] button`,
          );
          await expect(button).toHaveAccessibleName(
            placement === 'end' ? 'Get started' : 'Upload',
          );
          await expect(button.locator('svg')).toHaveCount(
            placement === 'both' ? 2 : 1,
          );
          if (placement !== 'end') {
            await expect(button.locator('use').first()).toHaveAttribute(
              'href',
              /#export$/,
            );
          }
          await expect(button).toHaveCSS('gap', '8px');
          await expect(button).toHaveCSS(
            'height',
            size === 'slim' ? '32px' : '40px',
          );
        }
      }
    }
    const rtl = page.locator('[data-cods-button-fixture="rtl"] button');
    for (const button of await rtl.all()) {
      await expect(button).toHaveAccessibleName('حفظ الطلب والمتابعة');
      const geometry = await button.evaluate((el) => {
        const label = el.querySelector('span')!.getBoundingClientRect();
        return [...el.querySelectorAll('svg')].map((svg) => ({
          name: svg.querySelector('use')!.getAttribute('href')!.split('#')[1],
          x: svg.getBoundingClientRect().x,
          labelX: label.x,
          transform: getComputedStyle(svg).transform,
        }));
      });
      for (const icon of geometry) {
        if (icon.name === 'arrow-right') {
          expect(icon.x).toBeLessThan(icon.labelX);
          expect(icon.transform).toBe('matrix(-1, 0, 0, 1, 0, 0)');
        } else {
          expect(icon.x).toBeGreaterThan(icon.labelX);
          expect(icon.transform).toBe('none');
        }
      }
    }
  });

  test('320px reflow, RTL, reduced motion, and forced colors remain usable', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const icon = await page
      .locator('[data-cods-button-fixture="icon-only"] button')
      .boundingBox();
    expect(icon?.width).toBe(icon?.height);
    for (const button of await page.locator('.cods-button').all()) {
      expect(
        await button.evaluate(
          (el) =>
            el.scrollWidth <= el.clientWidth &&
            el.scrollHeight <= el.clientHeight,
        ),
      ).toBe(true);
      const box = await button.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(320);
      expect(
        await button.evaluate((el) => getComputedStyle(el).animationName),
      ).toBe('none');
    }
    expect(
      await page
        .locator('[data-cods-button-fixture="rtl"] button')
        .first()
        .evaluate((el) => getComputedStyle(el).direction),
    ).toBe('rtl');
    await expectAccessible(
      page,
      testInfo,
      story ? '#storybook-root' : undefined,
    );
    await page.emulateMedia({ forcedColors: 'active' });
    expect(
      await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
    ).toBe(true);
    await expect(
      page.locator('[data-cods-button-fixture="icon-only"] svg'),
    ).toBeVisible();
    for (const button of await page.locator('.cods-button').all()) {
      expect(
        await button.evaluate((el) => getComputedStyle(el).borderTopStyle),
      ).toBe('solid');
      await expect(button).toBeVisible();
    }
  });
}
