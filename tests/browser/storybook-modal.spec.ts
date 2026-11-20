import { readFileSync } from 'node:fs';
import { test, expect, expectAccessible } from './fixtures.js';

const fixture = readFileSync(
  'packages/colorado-design-system/src/components/modal/modal.fixture.html',
  'utf8',
);
const STORY =
  '/iframe.html?id=components-modal--all-states&viewMode=story&globals=a11y.manual:!true';

test('canonical modal fixture opens from the keyboard in Storybook', async ({
  page,
}, testInfo) => {
  await page.goto(STORY);
  const trigger = page
    .locator('#storybook-root')
    .getByRole('button', { name: 'Delete this record' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const wrapper = page.locator('#cods-modal-default');
  await expect(wrapper).toHaveClass(/is-visible/);
  // The controller relocates the dialog out of the story root, to the body.
  expect(
    await page.evaluate(
      () =>
        document.getElementById('cods-modal-default')!.parentElement ===
        document.body,
    ),
  ).toBe(true);
  await expect(
    wrapper.getByRole('heading', { name: 'Delete this record?' }),
  ).toBeVisible();
  await expectAccessible(page, testInfo, 'body');
  await page.keyboard.press('Escape');
  await expect(wrapper).not.toHaveClass(/is-visible/);
  await expect(trigger).toBeFocused();
});

test('every fixture state is enhanced and reachable', async ({ page }) => {
  await page.goto(STORY);
  for (const id of [
    'cods-modal-default',
    'cods-modal-forced',
    'cods-modal-large',
  ]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('role', 'dialog');
  }
  expect(await page.locator('.usa-modal-wrapper').count()).toBe(3);
  // The fixture is the single source for the story.
  for (const label of [
    'Delete this record',
    'Review session timeout',
    'Read the accessibility statement',
  ]) {
    expect(fixture).toContain(label);
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }
});

test('switching stories cleans up the previous story, even while open', async ({
  page,
}) => {
  await page.goto(STORY);
  await page
    .locator('#storybook-root')
    .getByRole('button', { name: 'Delete this record' })
    .click();
  await expect(page.locator('#cods-modal-default')).toHaveClass(/is-visible/);

  // Navigate the preview the way the manager does, without a page reload.
  await page.evaluate(() => {
    const channel = (
      window as unknown as {
        __STORYBOOK_ADDONS_CHANNEL__: {
          emit(event: string, payload: unknown): void;
        };
      }
    ).__STORYBOOK_ADDONS_CHANNEL__;
    channel.emit('setCurrentStory', {
      storyId: 'components-modal--forced-action',
      viewMode: 'story',
    });
  });
  const trigger = page
    .locator('#storybook-root')
    .getByRole('button', { name: 'Review session timeout' });
  await expect(trigger).toBeVisible();

  // Only the new story's dialog exists, nothing is left hidden or locked.
  await expect(page.locator('.usa-modal-wrapper')).toHaveCount(1);
  await expect(page.locator('#cods-modal-default')).toHaveCount(0);
  await expect(page.locator('[data-modal-hidden]')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveClass(/usa-js-modal--active/);

  // The new story works.
  await trigger.click();
  await expect(page.locator('#cods-modal-forced')).toHaveClass(/is-visible/);
});
