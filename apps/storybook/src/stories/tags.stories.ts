import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/tags.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/tags.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/tags.html?raw';

const meta = {
  title: 'Components/Tags',
  render: () => fixture,
  parameters: { componentMetadata: metadata },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
const state = (name: string) => {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new Error(`Missing canonical ${name} state`);
  return example.html;
};
export const Default: Story = { render: () => state('default') };
export const Blue: Story = { render: () => state('blue') };
export const Green: Story = { render: () => state('green') };
export const Red: Story = { render: () => state('red') };
export const Yellow: Story = { render: () => state('yellow') };
export const Plum: Story = { render: () => state('plum') };
export const Teal: Story = { render: () => state('teal') };
export const LongContent: Story = { render: () => state('long-content') };
export const InContext: Story = { render: () => state('in-context') };
