import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/button.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/button.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/button.html?raw';

function renderState(state: string) {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new Error(`Missing canonical Button state: ${state}`);
  return example.html;
}

export default {
  title: 'Components/Button',
  render: () => fixture,
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Default: Story = { render: () => renderState('default') };
export const Secondary: Story = { render: () => renderState('secondary') };
export const Outline: Story = { render: () => renderState('outline') };
export const Ghost: Story = { render: () => renderState('ghost') };
export const Danger: Story = { render: () => renderState('danger') };
export const Small: Story = { render: () => renderState('small') };
export const IconOnly: Story = { render: () => renderState('icon-only') };
export const Link: Story = { render: () => renderState('link') };
export const Hover: Story = { render: () => renderState('hover') };
export const Active: Story = { render: () => renderState('active') };
export const Disabled: Story = { render: () => renderState('disabled') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const RightToLeft: Story = { render: () => renderState('rtl') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.focus();
  },
};
