import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/checkbox.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/checkbox.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/checkbox.json';

const meta = {
  title: 'Components/Checkbox',
  render: () => fixture,
  play: ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '#checkbox-indeterminate',
    );
    if (input) input.indeterminate = true;
  },
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string): string {
  const example = examples.examples.find((example) => example.state === name);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${name}`);
  return example.html;
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const Checked: Story = { render: () => state('checked') };
export const Indeterminate: Story = { render: () => state('indeterminate') };
export const Disabled: Story = { render: () => state('disabled') };
export const DisabledChecked: Story = {
  render: () => state('disabled-checked'),
};
export const Error: Story = { render: () => state('error') };
export const Grouped: Story = { render: () => state('grouped') };
export const LongContent: Story = { render: () => state('long-content') };
export const Spanish: Story = { render: () => state('localization') };
export const RightToLeft: Story = { render: () => state('rtl') };
export const FocusVisible: Story = {
  render: () => state('focus-visible'),
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLInputElement>('input')?.focus();
  },
};
export const WithoutJavaScript: Story = { play: () => {} };

export const Card: Story = { render: () => state('card') };

export const CardChecked: Story = { render: () => state('card-checked') };

export const CardDisabled: Story = {
  render: () => state('card-disabled'),
};
