import type { Meta, StoryObj } from '@storybook/html-vite';
import '../../../../packages/colorado-design-system/src/components/toast/toast.scss';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import fixture from '../../../../packages/colorado-design-system/src/components/toast/toast.fixture.html?raw';
import {
  initAll,
  show,
  dismissAll,
} from '../../../../packages/colorado-design-system/src/components/toast/toast.js';

const meta = {
  title: 'Components/Toast',
  render: () => fixture,
  play: ({ canvasElement }) => {
    initAll(canvasElement);
    const button = canvasElement.querySelector<HTMLButtonElement>(
      '[data-cods-toast-demo]',
    );
    const root = canvasElement.querySelector<HTMLElement>('[data-cods-toast]');
    const status = canvasElement.querySelector<HTMLElement>(
      '[data-cods-toast-demo-status]',
    );
    const contextAction = canvasElement.querySelector<HTMLButtonElement>(
      '[data-cods-toast-context-action]',
    );
    const undo = () => {
      if (status) status.textContent = 'Changes undone.';
      if (root) dismissAll(root);
    };
    contextAction?.addEventListener('click', undo);
    button?.addEventListener('click', () => {
      if (!root || !status) return;
      status.textContent = 'Changes saved.';
      show(root, {
        message: 'Changes saved.',
        ...(!button.hasAttribute('data-cods-toast-persistent') && {
          duration: 10000,
        }),
        dismissLabel: 'Dismiss',
        returnFocus: button,
        ...(button.hasAttribute('data-cods-toast-icon') && {
          iconHref: `${spriteUrl}#check`,
        }),
        ...(contextAction && { action: { label: 'Undo', onActivate: undo } }),
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
    `<p>Enable reduced motion in your operating system or browser, then select Save changes. The toast should appear without animation.</p>${fixture}`,
};

/** A message that remains until it is dismissed. */
export const Persistent: Story = {
  render: () =>
    fixture.replace(
      'data-cods-toast-demo>',
      'data-cods-toast-demo data-cods-toast-persistent>',
    ),
};

/** An action remains available in context as well as in the toast. */
export const Action: Story = {
  render: () =>
    fixture.replace(
      '<p data-cods-toast-demo-status>',
      '<button type="button" data-cods-toast-context-action>Undo changes</button><p data-cods-toast-demo-status>',
    ),
};

/** A decorative icon reinforces the message. */
export const Icon: Story = {
  render: () =>
    fixture.replace(
      'data-cods-toast-demo>',
      'data-cods-toast-demo data-cods-toast-icon>',
    ),
};
