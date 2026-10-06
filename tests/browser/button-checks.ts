import { test, expect, expectAccessible } from './fixtures.js';

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
    await expect(page.locator('[data-cods-button-fixture]')).toHaveCount(14);
    await expect(
      page
        .getByRole('button', { name: 'Add application', exact: true })
        .first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-cods-button-fixture="link"] a'),
    ).toHaveAttribute('href', '/getting-started/');
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
    const button = page.locator('[data-cods-button-fixture="danger"] button');
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
    await page.mouse.up();
    await page
      .locator('[data-cods-button-fixture="disabled"] button')
      .first()
      .hover({ force: true });
    await expect(
      page.locator('[data-cods-button-fixture="disabled"] button').first(),
    ).toBeDisabled();
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
        await button.evaluate((el) => el.scrollWidth <= el.clientWidth),
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
