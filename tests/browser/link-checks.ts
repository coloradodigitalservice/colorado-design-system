import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const focusShadow =
  'rgb(255, 255, 255) 0px 0px 0px 2px, rgb(23, 59, 179) 0px 0px 0px 4px';

export function linkChecks(url: string, scope: string) {
  test('native variants preserve names and Figma typography', async ({
    page,
  }, testInfo) => {
    await page.goto(url);
    const links = page.locator(`${scope} .cods-link[href]`);
    await expect(links).toHaveCount(17);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute('href', /.+/);
      await expect(link).toHaveCSS(
        'font-family',
        /^"?Open Sans"?, sans-serif$/,
      );
    }
    const inline = page.locator(
      `${scope} [data-cods-fixture-state="default"] a`,
    );
    await expect(inline).toHaveCSS('font-weight', '400');
    await expect(inline).toHaveCSS('text-decoration-line', 'underline');
    await expect(inline).toHaveCSS('text-decoration-thickness', '2px');
    await expect(inline).toHaveCSS('text-underline-offset', '2px');
    const standalone = page.locator(
      `${scope} [data-cods-fixture-state="standalone"] a`,
    );
    await expect(standalone).toHaveCSS('font-weight', '600');
    await expect(standalone).toHaveCSS('text-decoration-line', 'none');
    await expect(standalone).toHaveCSS('color', 'rgb(0, 25, 112)');
    for (const [state, size] of [
      ['inline-small', '14px'],
      ['inline-large', '22px'],
      ['standalone-small', '14px'],
    ] as const) {
      const link = page.locator(
        `${scope} [data-cods-fixture-state="${state}"] a`,
      );
      await expect(link).toHaveCSS('font-size', size);
      if (state === 'inline-small')
        await expect(link).toHaveCSS('text-decoration-thickness', '1px');
    }
    const external = page.locator(
      `${scope} [data-cods-fixture-state="external"] a`,
    );
    await expect(external).toHaveAccessibleName(
      'U.S. Web Design System (opens in a new tab)',
    );
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(
      external.locator('.cods-link__icon--external'),
    ).toHaveAttribute('aria-hidden', 'true');
    // Ignore the SVG's ink inset: compare its 16px slot with the text box.
    const suffixGap = await external.evaluate((el) => {
      const text = [...el.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )!;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, (text.textContent ?? '').trimEnd().length);
      return (
        el.querySelector('.cods-link__icon')!.getBoundingClientRect().left -
        range.getBoundingClientRect().right
      );
    });
    expect(suffixGap).toBeCloseTo(4, 1);
    for (const icon of await page.locator(`${scope} .cods-link__icon`).all()) {
      await expect(icon).toHaveCSS('width', '16px');
      await expect(icon).toHaveCSS('height', '16px');
      const id = await icon.evaluate((element) =>
        element.classList.contains('cods-link__icon--external')
          ? 'arrow-square-out'
          : element.classList.contains('cods-link__icon--globe')
            ? 'globe'
            : element.classList.contains('cods-link__icon--phone')
              ? 'phone'
              : element.classList.contains('cods-link__icon--download')
                ? 'download'
                : 'arrow-right',
      );
      const expected = readFileSync(
        `packages/colorado-design-system/dist/icons/${id}.svg`,
        'utf8',
      );
      const matches = await icon.evaluate(async (element, expected) => {
        const url = getComputedStyle(element).maskImage.match(
          /url\(["']?(.*?)["']?\)/,
        )?.[1];
        if (!url) return false;
        const response = await fetch(url);
        if (!response.ok) return false;
        const shape = (svg: string) => {
          const document = new DOMParser().parseFromString(
            svg,
            'image/svg+xml',
          );
          return (
            document.documentElement.getAttribute('viewBox') +
            [...document.querySelectorAll('path')]
              .map((path) => path.getAttribute('d'))
              .join('|')
          );
        };
        return shape(await response.text()) === shape(expected);
      }, expected);
      expect(matches, `${id} uses the shared icon`).toBe(true);
    }
    await expectAccessible(page, testInfo, scope);
  });

  test('disabled variants preserve names and decoration without navigation or a tab stop', async ({
    page,
  }, testInfo) => {
    await page.goto(url);
    const links = page.locator(
      `${scope} [data-cods-fixture-state="disabled"] a`,
    );
    await expect(links).toHaveCount(5);
    const originalURL = page.url();
    const variants = [
      ['16px', '400', 'underline', '2px'],
      ['16px', '600', 'none', '2px'],
      ['14px', '400', 'underline', '1px'],
      ['22px', '400', 'underline', '2px'],
      ['14px', '600', 'none', '2px'],
    ];
    for (const [index, link] of (await links.all()).entries()) {
      await expect(link).toHaveRole('link');
      await expect(link).toHaveAccessibleName('Installation guide');
      await expect(link).toHaveAttribute('aria-disabled', 'true');
      await expect(link).not.toHaveAttribute('href');
      await expect(link).not.toHaveAttribute('tabindex');
      const [size, weight, decoration, thickness] = variants[index]!;
      for (const action of [
        async () => {},
        async () => link.hover(),
        async () => page.mouse.down(),
      ]) {
        await action();
        await expect(link).toHaveCSS('color', 'rgb(86, 92, 101)');
        await expect(link).toHaveCSS('font-size', size!);
        await expect(link).toHaveCSS('font-weight', weight!);
        await expect(link).toHaveCSS('text-decoration-line', decoration!);
        if (decoration === 'underline')
          await expect(link).toHaveCSS('text-decoration-thickness', thickness!);
      }
      await page.mouse.up();
      await link.click({ force: true });
      await link.evaluate((element) => (element as HTMLElement).focus());
      await expect(link).not.toBeFocused();
      expect(page.url()).toBe(originalURL);
    }
    // The shared keyboard test also traverses every enabled link, skipping this
    // disabled block between the default and standalone fixture states.
    await expectAccessible(page, testInfo, scope);
    await page.emulateMedia({ forcedColors: 'active' });
    const gray = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.style.color = 'GrayText';
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    for (const link of await links.all())
      await expect(link).toHaveCSS('color', gray);
  });

  test('download resolves the actual named catalog and phone uses a fictional number', async ({
    page,
  }) => {
    await page.goto(url);
    const phone = page.locator(`${scope} [data-cods-fixture-state="phone"] a`);
    await expect(phone).toHaveAttribute('href', 'tel:+13035550123');
    await expect(phone).toHaveAccessibleName('Contact us');
    const link = page.locator(
      `${scope} [data-cods-fixture-state="download"] a`,
    );
    await expect(link).toHaveAccessibleName('Icon catalog (JSON, 47.3 KB)');
    const bytes = await link.evaluate(async (element) => {
      const response = await fetch((element as HTMLAnchorElement).href);
      if (!response.ok)
        throw new Error(`Download file returned ${response.status}`);
      return [...new Uint8Array(await response.arrayBuffer())];
    });
    const expected = readFileSync(
      'packages/colorado-design-system/dist/icons/catalog.json',
    );
    expect(Buffer.compare(Buffer.from(bytes), expected)).toBe(0);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      link.click(),
    ]);
    expect(download.suggestedFilename()).toBe('cods-icon-catalog.json');
    // Intercepted built files validate bytes and download intent, but Chromium
    // and WebKit cannot finish native downloads through route.fulfill(). The
    // normal preview suite also verifies the saved file end to end.
    if (process.env.CODS_BUILT_FILES !== '1')
      expect(
        Buffer.compare(readFileSync((await download.path())!), expected),
      ).toBe(0);
  });

  test('links inherit surrounding leading and wrapped hover underlines clear the next line', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(url);
    const leading = await page
      .locator(`${scope} .cods-link`)
      .evaluateAll((links) =>
        links.map((link) => {
          const parent = link.parentElement!;
          parent.style.lineHeight = '1.8';
          const style = getComputedStyle(link);
          return {
            actual: parseFloat(style.lineHeight),
            expected: parseFloat(style.fontSize) * 1.8,
          };
        }),
      );
    for (const { actual, expected } of leading)
      expect(actual).toBeCloseTo(expected, 1);
    // Return to the actual documentation/story leading for the regression.
    await page
      .locator(`${scope} .cods-link`)
      .evaluateAll((links) =>
        links.forEach((link) =>
          link.parentElement!.style.removeProperty('line-height'),
        ),
      );
    const long = page.locator(
      `${scope} [data-cods-fixture-state="long-content"] a`,
    );
    await long.hover();
    const lines = await long.evaluate((link) => {
      const text = [...link.childNodes].find(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
      )!;
      const range = document.createRange();
      range.selectNodeContents(text);
      const rects = [...range.getClientRects()];
      const style = getComputedStyle(link);
      const context = document.createElement('canvas').getContext('2d')!;
      context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const descent = context.measureText(
        text.textContent!,
      ).fontBoundingBoxDescent;
      return rects.slice(0, -1).map((rect, i) => ({
        underlineBottom:
          rect.bottom -
          descent +
          parseFloat(style.textUnderlineOffset) +
          parseFloat(style.textDecorationThickness),
        nextLineTop: rects[i + 1]!.top,
      }));
    });
    expect(lines.length).toBeGreaterThan(0);
    for (const line of lines)
      expect(line.underlineBottom).toBeLessThan(line.nextLineTop);
  });

  test('pointer states match the separate inline and standalone treatments', async ({
    page,
  }) => {
    await page.goto(url);
    for (const [state, defaultColor, hoverColor, offset] of [
      ['default', 'rgb(23, 59, 179)', 'rgb(0, 25, 112)', '2px'],
      ['standalone', 'rgb(0, 25, 112)', 'rgb(37, 81, 163)', '3px'],
      ['inline-small', 'rgb(23, 59, 179)', 'rgb(0, 25, 112)', '2px'],
      ['standalone-small', 'rgb(0, 25, 112)', 'rgb(37, 81, 163)', '3px'],
    ] as const) {
      const link = page.locator(
        `${scope} [data-cods-fixture-state="${state}"] a`,
      );
      await expect(link).toHaveCSS('color', defaultColor);
      await link.hover();
      await expect(link).toHaveCSS('color', hoverColor);
      await expect(link).toHaveCSS('text-decoration-line', 'underline');
      await expect(link).toHaveCSS(
        'text-decoration-thickness',
        state.includes('small') ? '3px' : '4px',
      );
      await expect(link).toHaveCSS('text-underline-offset', offset);
      // Release on the same link without navigation; moving away first can
      // leave WebKit's active pseudo-class latched after drag cancellation.
      await link.evaluate((el) =>
        el.addEventListener('click', (event) => event.preventDefault(), {
          once: true,
        }),
      );
      await page.mouse.down();
      await expect(link).toHaveCSS('color', 'rgb(0, 16, 73)');
      await expect(link).toHaveCSS(
        'text-decoration-line',
        state.startsWith('standalone') ? 'none' : 'underline',
      );
      if (!state.startsWith('standalone'))
        await expect(link).toHaveCSS(
          'text-decoration-thickness',
          state.includes('small') ? '1px' : '2px',
        );
      await page.mouse.up();
      await expect(link).toHaveCSS('color', hoverColor);
      await page.mouse.move(0, 0);
    }
  });

  test('keyboard traversal preserves the rounded white-gap and blue-band focus', async ({
    page,
    browserName,
  }) => {
    await page.goto(url);
    const tab =
      browserName === 'webkit' && process.platform === 'darwin'
        ? 'Alt+Tab'
        : 'Tab';
    const backTab =
      browserName === 'webkit' && process.platform === 'darwin'
        ? 'Alt+Shift+Tab'
        : 'Shift+Tab';
    const links = page.locator(`${scope} .cods-link[href]`);
    await page.keyboard.press(tab);
    await links.first().focus();
    for (let i = 0; i < (await links.count()); i++) {
      if (i) await page.keyboard.press(tab);
      await expect(links.nth(i)).toBeFocused();
      if (
        await links
          .nth(i)
          .evaluate((el) => el.classList.contains('cods-link--standalone'))
      )
        await expect(links.nth(i)).toHaveCSS('color', 'rgb(23, 59, 179)');
      await expect(links.nth(i)).toHaveCSS('box-shadow', focusShadow);
      await expect(links.nth(i)).toHaveCSS('border-radius', '2px');
      await expect(links.nth(i)).toHaveCSS('outline-width', '2px');
      await expect(links.nth(i)).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
    }
    await page.keyboard.press(tab);
    await expect(links.last()).not.toBeFocused();
    await links.nth(1).focus();
    await page.keyboard.press(backTab);
    await expect(links.first()).toBeFocused();
  });

  test('RTL follows resolved direction and mirrors only directional arrows', async ({
    page,
  }) => {
    await page.goto(url);
    const block = page.locator(`${scope} [data-cods-fixture-state="rtl"]`);
    await expect(block.locator('.cods-link__icon--arrow')).toHaveCSS(
      'transform',
      'matrix(-1, 0, 0, 1, 0, 0)',
    );
    await block.evaluate((el) => {
      const link = el.querySelector('a')!;
      const ltr = link.cloneNode(true) as HTMLAnchorElement;
      ltr.dir = 'ltr';
      ltr.setAttribute('data-cods-test-direction', 'ltr');
      el.querySelector('p')!.append(ltr);
      const auto = link.cloneNode(true) as HTMLAnchorElement;
      auto.dir = 'auto';
      auto.setAttribute('data-cods-test-direction', 'auto');
      const wrapper = document.createElement('p');
      wrapper.dir = 'ltr';
      wrapper.append(auto);
      el.append(wrapper);
      const prefix = document
        .querySelector('[data-cods-fixture-state="prefix-icon"] a')!
        .cloneNode(true) as HTMLAnchorElement;
      prefix.dir = 'rtl';
      prefix.setAttribute('data-cods-test-direction', 'prefix');
      el.append(prefix);
      const external = document
        .querySelector('[data-cods-fixture-state="external"] a')!
        .cloneNode(true) as HTMLAnchorElement;
      external.classList.add('cods-link--standalone');
      external.dir = 'rtl';
      external.setAttribute('data-cods-test-direction', 'external');
      el.append(external);
    });
    await expect(
      block.locator('[data-cods-test-direction="ltr"] .cods-link__icon--arrow'),
    ).toHaveCSS('transform', 'none');
    await expect(
      block.locator(
        '[data-cods-test-direction="auto"] .cods-link__icon--arrow',
      ),
    ).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)');
    await expect(
      block.locator(
        '[data-cods-test-direction="external"] .cods-link__icon--external',
      ),
    ).toHaveCSS('transform', 'none');
    await expect(
      block.locator(
        '[data-cods-test-direction="prefix"] .cods-link__icon--globe',
      ),
    ).toHaveCSS('transform', 'none');
    const inherited = block.locator('p[dir=rtl] a').first();
    await inherited.evaluate((el) => el.setAttribute('dir', 'rtl'));
    await expect(inherited.locator('.cods-link__icon--arrow')).toHaveCSS(
      'transform',
      'matrix(-1, 0, 0, 1, 0, 0)',
    );
  });

  test('320px reflow and forced colors preserve focus without shadows', async ({
    page,
    browserName,
  }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({
      reducedMotion: 'reduce',
      forcedColors: 'active',
    });
    await page.goto(url);
    expect(
      await page.evaluate(() => matchMedia('(forced-colors: active)').matches),
    ).toBe(true);
    for (const block of await page
      .locator(`${scope} [data-cods-fixture-state]`)
      .all()) {
      expect(
        await block.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await page.keyboard.press(
      browserName === 'webkit' && process.platform === 'darwin'
        ? 'Alt+Tab'
        : 'Tab',
    );
    const link = page.locator(`${scope} .cods-link`).first();
    await link.focus();
    await expect(link).toHaveCSS('outline-style', 'solid');
    await expect(link).toHaveCSS('outline-width', '2px');
    expect(
      await link.evaluate((el) => getComputedStyle(el).outlineColor),
    ).not.toBe('rgba(0, 0, 0, 0)');
    for (const icon of await page.locator(`${scope} .cods-link__icon`).all()) {
      expect(
        await icon.evaluate((el) => {
          const style = getComputedStyle(el);
          return (
            style.backgroundColor === style.color &&
            (!CSS.supports('forced-color-adjust', 'none') ||
              style.forcedColorAdjust === 'none')
          );
        }),
      ).toBe(true);
    }
    await expectAccessible(page, testInfo, scope);
  });
}
