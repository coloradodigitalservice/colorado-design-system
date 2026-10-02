import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/site-alert.html?raw';

function renderState(state: string) {
  const template = document.createElement('template');
  template.innerHTML = fixture;
  const block = template.content.querySelector(
    `[data-cods-site-alert-fixture="${state}"]`,
  );
  if (!block) throw new Error(`Missing canonical Site Alert state: ${state}`);
  return block.outerHTML;
}

const meta = {
  title: 'Components/Site Alert',
  render: () => fixture,
  parameters: { controls: { disable: true }, actions: { disable: true } },
} satisfies Meta;

export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Informational: Story = {
  render: () => renderState('informational'),
};
export const Emergency: Story = { render: () => renderState('emergency') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const Spanish: Story = { render: () => renderState('localization') };
export const ArabicRtl: Story = { render: () => renderState('rtl') };

export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLAnchorElement>('.cods-site-alert__link')
      ?.focus();
  },
};
