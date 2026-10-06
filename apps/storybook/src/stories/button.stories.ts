import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/button.html?raw';

function renderState(state: string) {
  const template = document.createElement('template');
  template.innerHTML = fixture;
  const block = template.content.querySelector(
    `[data-cods-button-fixture="${state}"]`,
  );
  if (!block) throw new Error(`Missing canonical Button state: ${state}`);
  return block.outerHTML;
}

export default {
  title: 'Components/Button',
  render: () => fixture,
  parameters: { controls: { disable: true }, actions: { disable: true } },
} satisfies Meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Primary: Story = { render: () => renderState('default') };
export const Secondary: Story = { render: () => renderState('secondary') };
export const Outline: Story = { render: () => renderState('outline') };
export const Ghost: Story = { render: () => renderState('ghost') };
export const Danger: Story = { render: () => renderState('danger') };
export const Small: Story = { render: () => renderState('small') };
export const IconOnly: Story = { render: () => renderState('icon-only') };
export const NavigationLink: Story = { render: () => renderState('link') };
export const Hover: Story = { render: () => renderState('hover') };
export const Active: Story = { render: () => renderState('active') };
export const Disabled: Story = { render: () => renderState('disabled') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const ArabicRtl: Story = { render: () => renderState('rtl') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.focus();
  },
};
