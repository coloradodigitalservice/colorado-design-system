import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/site-alert.html?raw';

const meta = {
  title: 'Components/Site Alert',
  render: () => fixture,
} satisfies Meta;

export default meta;
type Story = StoryObj;
export const AllStates: Story = {};

// Focus is a real keyboard state of the default fixture, never simulated by a class.
export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLAnchorElement>(
        '[data-cods-site-alert-fixture="focus-visible"] .cods-site-alert__link',
      )
      ?.focus();
  },
};
