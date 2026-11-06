import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/combo-box.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/combo-box.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/combo-box.html?raw';
import { initAllComboBox } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Combo Box',
  render: () => fixture,
  play: ({ canvasElement }) => initAllComboBox(canvasElement),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string): string {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${name}`);
  return example.html;
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const Disabled: Story = { render: () => state('disabled') };
export const Grouped: Story = { render: () => state('grouped') };
export const Error: Story = { render: () => state('error') };
export const WithoutJavaScript: Story = { play: () => {} };
