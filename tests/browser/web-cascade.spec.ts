import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures.js';

const dist = resolve('packages/colorado-design-system/dist');
const fixtureHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Cascade fixture</title>
    <link rel="stylesheet" href="/__cods_dist__/colorado-design-system.css" />
    <style>
      @layer cods.components {
        :where(.cods-cascade-probe) { background-color: rgb(1, 2, 3); }
      }
    </style>
  </head>
  <body>
    <button type="button" id="probe" class="usa-button cods-cascade-probe">Probe</button>
    <button type="button" id="plain" class="usa-button">Plain</button>
    <div id="token" style="background-color: var(--cods-color-bg-action-primary)"></div>
    <div id="surface" style="background-color: rgb(0, 25, 112)">
      <button type="button" id="inverse" class="usa-button usa-button--outline usa-button--inverse">Inverse</button>
      <button type="button" id="inverse-unstyled" class="usa-button usa-button--outline usa-button--inverse usa-button--unstyled">Unstyled</button>
    </div>
    <button type="button" id="outline-disabled" class="usa-button usa-button--outline" disabled>Disabled</button>
    <div id="alert-info" class="usa-alert usa-alert--info"><div class="usa-alert__body"><p class="usa-alert__text">Info <a class="usa-link" href="#">link</a></p></div></div>
    <div id="alert-warning" class="usa-alert usa-alert--warning"><div class="usa-alert__body"><p class="usa-alert__text">Warning</p></div></div>
    <div id="alert-error" class="usa-alert usa-alert--error"><div class="usa-alert__body"><p class="usa-alert__text">Urgent</p></div></div>
    <div id="alert-success" class="usa-alert usa-alert--success"><div class="usa-alert__body"><p class="usa-alert__text">Success</p></div></div>
  </body>
</html>`;

test.beforeEach(async ({ page }) => {
  await page.route('**/__cods_cascade_fixture__/', (route) =>
    route.fulfill({ contentType: 'text/html', body: fixtureHtml }),
  );
  await page.route('**/__cods_dist__/**', (route) => {
    const file = resolve(
      dist,
      decodeURIComponent(new URL(route.request().url()).pathname).replace(
        /^\/__cods_dist__\//,
        '',
      ),
    );
    if (!file.startsWith(dist + sep)) return route.fulfill({ status: 403 });
    return route.fulfill({ path: file });
  });
  const response = await page.goto('/__cods_cascade_fixture__/');
  expect(response?.ok()).toBe(true);
});

const background = (page: Page, id: string) =>
  page
    .locator(`#${id}`)
    .evaluate((element) => getComputedStyle(element).backgroundColor);

test('built stylesheet declares the layer order before any layered rule', () => {
  const css = readFileSync(`${dist}/colorado-design-system.css`, 'utf8');
  const withoutCharset = css.replace(/^@charset "[^"]+";/, '');
  expect(withoutCharset).toMatch(
    /^@layer uswds, ?cods\.reset, ?cods\.base, ?cods\.components, ?cods\.utilities;/,
  );
});

test('a low-specificity cods.components rule overrides USWDS', async ({
  page,
}) => {
  expect(await background(page, 'probe')).toBe('rgb(1, 2, 3)');
});

test('a consumer unlayered rule overrides cods.components', async ({
  page,
}) => {
  await page.addStyleTag({
    content: '.cods-cascade-probe { background-color: rgb(4, 5, 6); }',
  });
  expect(await background(page, 'probe')).toBe('rgb(4, 5, 6)');
});

test('color overrides still win over USWDS', async ({ page }) => {
  expect(await background(page, 'plain')).toBe(await background(page, 'token'));
});

const colors = (page: Page, id: string) =>
  page.locator(`#${id}`).evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      color: style.color,
      background: style.backgroundColor,
      shadow: style.boxShadow,
    };
  });

// Overrides share the uswds layer so higher-specificity USWDS variant and
// state rules still win; a higher layer would out-rank them.
test('inverse outline buttons keep USWDS inverse colors', async ({ page }) => {
  expect(await colors(page, 'inverse')).toEqual({
    color: 'rgb(223, 225, 226)',
    background: 'rgb(0, 25, 112)',
    shadow: 'rgb(223, 225, 226) 0px 0px 0px 2px inset',
  });
  await page.locator('#inverse').hover();
  expect((await colors(page, 'inverse')).color).toBe('rgb(240, 240, 240)');
});

test('inverse unstyled buttons stay unfilled and unbordered', async ({
  page,
}) => {
  expect(await colors(page, 'inverse-unstyled')).toEqual({
    color: 'rgb(223, 225, 226)',
    background: 'rgba(0, 0, 0, 0)',
    shadow: 'none',
  });
});

test('disabled outline buttons keep the USWDS gray border', async ({
  page,
}) => {
  expect((await colors(page, 'outline-disabled')).shadow).toBe(
    'rgb(201, 201, 201) 0px 0px 0px 2px inset',
  );
});

test('USWDS selectors are restyled only inside the uswds layer', async ({
  page,
}) => {
  // getComputedStyle hides :visited, so a visited-link check on rendered
  // styles is impossible. Assert the cause instead: a rule in a higher layer
  // would out-rank USWDS's higher-specificity :visited, inverse, and disabled
  // rules.
  const offenders = await page.evaluate(() => {
    const found: string[] = [];
    const walk = (rules: CSSRuleList, layer: string) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, rule.name);
        else if (rule instanceof CSSStyleRule) {
          if (layer !== 'uswds' && /\.usa-/.test(rule.selectorText))
            found.push(`${layer || 'unlayered'}: ${rule.selectorText}`);
        } else if ('cssRules' in rule) {
          walk(rule.cssRules as CSSRuleList, layer);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets))
      if (sheet.href?.endsWith('/colorado-design-system.css'))
        walk(sheet.cssRules, '');
    return found;
  });
  expect(offenders).toEqual([]);
});

const tokenColor = (page: Page, token: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('div');
    probe.style.color = `var(--cods-color-${name})`;
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, token);

for (const [variant, token] of [
  ['info', 'alert-info'],
  ['warning', 'alert-warning'],
  ['error', 'alert-urgent'],
] as const) {
  test(`usa-alert--${variant} uses the ${token} tokens`, async ({ page }) => {
    const alert = page.locator(`#alert-${variant}`);
    const [bg, border] = await Promise.all([
      tokenColor(page, `bg-${token}`),
      tokenColor(page, `border-${token}`),
    ]);
    await expect(alert).toHaveCSS('background-color', bg);
    await expect(alert.locator('.usa-alert__body')).toHaveCSS(
      'background-color',
      bg,
    );
    await expect(alert).toHaveCSS('border-left-color', border);
  });
}

test('usa-alert--success keeps the USWDS default tints', async ({ page }) => {
  const alert = page.locator('#alert-success');
  await expect(alert).toHaveCSS('background-color', 'rgb(236, 243, 236)');
  await expect(alert).toHaveCSS('border-left-color', 'rgb(0, 169, 28)');
});

test('alert variants keep their borders in forced-colors mode', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active' });
  for (const variant of ['info', 'warning', 'error', 'success']) {
    const alert = page.locator(`#alert-${variant}`);
    await expect(alert).toBeVisible();
    await expect(alert).toHaveCSS('border-left-style', 'solid');
    await expect(alert).not.toHaveCSS('border-left-width', '0px');
  }
});

test('compiled CSS ends the uswds layer with the visited-link token rule', async ({
  page,
}) => {
  // :visited is invisible to getComputedStyle, so read the rule itself.
  const rules = await page.evaluate(() => {
    const found: { layer: string; color: string }[] = [];
    const walk = (list: CSSRuleList, layer: string) => {
      for (const rule of Array.from(list)) {
        if (rule instanceof CSSLayerBlockRule) walk(rule.cssRules, rule.name);
        else if (rule instanceof CSSStyleRule) {
          if (
            rule.selectorText.includes('.usa-link:visited') &&
            rule.style.color
          )
            found.push({ layer, color: rule.style.color });
        } else if ('cssRules' in rule) {
          walk(rule.cssRules as CSSRuleList, layer);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets))
      if (sheet.href?.endsWith('/colorado-design-system.css'))
        walk(sheet.cssRules, '');
    return found;
  });
  expect(rules.at(-1)).toEqual({
    layer: 'uswds',
    color: 'var(--cods-color-text-action-link-visited)',
  });
});
