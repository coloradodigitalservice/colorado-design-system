import type { Meta, StoryObj } from '@storybook/html-vite';
import '../../../../packages/colorado-design-system/src/components/toast/toast.scss';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import fixture from '../../../../packages/colorado-design-system/src/components/toast/toast.fixture.html?raw';
import {
  initAll,
  show,
  dismissAll,
} from '../../../../packages/colorado-design-system/src/components/toast/toast.js';

const states = fixture
  .replaceAll('/icons/sprite.svg', spriteUrl)
  .split(/(?=<div data-cods-fixture-state=)/)
  .filter(Boolean);
const state = (name: string) =>
  states.find((html) => html.includes(`data-cods-fixture-state="${name}"`)) ??
  '';

const meta = {
  // Storybook treats "/" as a hierarchy separator, so the visible name uses
  // U+2215 DIVISION SLASH and the stable id uses `toast-snackbar`.
  title: 'Components/Toast∕Snackbar',
  id: 'components-toast-snackbar',
  render: () => state('default'),
  play: ({ canvasElement }) => {
    initAll(canvasElement);
    canvasElement
      .querySelectorAll<HTMLButtonElement>('[data-cods-toast-demo]')
      .forEach((button) => {
        const example = button.closest('[data-cods-fixture-state]');
        const root = example?.querySelector<HTMLElement>('[data-cods-toast]');
        const status = example?.querySelector<HTMLElement>(
          '[data-cods-toast-demo-status]',
        );
        const contextAction = example?.querySelector<HTMLButtonElement>(
          '[data-cods-toast-context-action]',
        );
        if (!root || !status) return;
        const undo = () => {
          status.textContent = 'Contact information update undone.';
          dismissAll(root);
        };
        contextAction?.addEventListener('click', undo);
        button.addEventListener('click', () => {
          const message = button.dataset.codsToastMessage ?? '';
          const actionLabel = button.dataset.codsToastAction;
          const iconHref = button.dataset.codsToastIcon;
          status.textContent = message;
          show(root, {
            message,
            dismissLabel: 'Dismiss',
            returnFocus: button,
            ...(iconHref && { iconHref }),
            ...(actionLabel
              ? { action: { label: actionLabel, onActivate: undo } }
              : !button.hasAttribute('data-cods-toast-persistent') && {
                  duration: 10000,
                }),
          });
        });
      });
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};

/** Enable “Reduce motion” in your operating system or browser, then show a toast. */
export const ReducedMotion: Story = {
  render: () =>
    `<p>Enable reduced motion in your operating system or browser, then select Save changes. The toast should appear without animation.</p>${state('default')}`,
};

/** A message that remains until it is dismissed. */
export const Persistent: Story = {
  render: () =>
    state('default').replace(
      'data-cods-toast-demo',
      'data-cods-toast-demo data-cods-toast-persistent',
    ),
};

/** An action remains available in context as well as in the toast. */
export const Action: Story = { render: () => state('action') };

/** A decorative icon reinforces the message. */
export const Icon: Story = { render: () => state('icon') };
