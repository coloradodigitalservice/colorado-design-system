import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/tooltip.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/tooltip.html?raw';
import { initAllTooltip } from '@coloradodigitalservice/colorado-design-system';
const meta = {
  title: 'Components/Tooltip',
  render: () => fixture,
  play: ({ canvasElement }) => initAllTooltip(canvasElement),
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string): string {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new Error(`Missing canonical state: ${name}`);
  return example.html;
}
export const AllStates: Story = {};
export const Top: Story = { render: () => state('top') };
export const Bottom: Story = { render: () => state('bottom') };
export const Left: Story = { render: () => state('left') };
export const Right: Story = { render: () => state('right') };
