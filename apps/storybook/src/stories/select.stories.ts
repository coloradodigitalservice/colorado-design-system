import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/select.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/select.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/select.html?raw';

function renderState(state: string): string {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${state}`);
  return example.html;
}

const meta = {
  title: 'Components/Select',
  render: () => fixture,
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Default: Story = { render: () => renderState('default') };
export const Success: Story = { render: () => renderState('success') };
export const Disabled: Story = { render: () => renderState('disabled') };
export const Error: Story = { render: () => renderState('error') };
export const Placeholder: Story = { render: () => renderState('placeholder') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const Spanish: Story = { render: () => renderState('localization') };
export const RightToLeft: Story = { render: () => renderState('rtl') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLSelectElement>('select')?.focus();
  },
};
