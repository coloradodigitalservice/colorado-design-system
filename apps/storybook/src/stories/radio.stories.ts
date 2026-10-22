import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/radio.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/radio.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/radio.json';

const meta = {
  title: 'Components/Radio Buttons',
  id: 'components-radio',
  render: () => fixture,
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
export const Selected: Story = { render: () => state('selected') };
export const Disabled: Story = { render: () => state('disabled') };
export const DisabledGroup: Story = { render: () => state('disabled-group') };
export const Error: Story = { render: () => state('error') };
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

export const Tile: Story = { render: () => state('tile') };
