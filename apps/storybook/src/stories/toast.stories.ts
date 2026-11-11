import type { Meta, StoryObj } from '@storybook/html-vite';
import '../../../../packages/colorado-design-system/src/components/toast/toast.scss';
import fixture from '../../../../packages/colorado-design-system/src/components/toast/toast.fixture.html?raw';
import {
  initAll,
  show,
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
    button?.addEventListener('click', () => {
      if (!root || !status) return;
      status.textContent = 'Changes saved.';
      show(root, {
        message: 'Changes saved.',
        dismissLabel: 'Dismiss',
        returnFocus: button,
      });
    });
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
