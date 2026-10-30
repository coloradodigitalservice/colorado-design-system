import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/hero.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/hero.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/hero.html?raw';

const renderState = (state: string) => {
  const example = examples.examples.find((item) => item.state === state);
  if (!example) throw new Error(`Missing canonical state: ${state}`);
  return example.html;
};
const meta = {
  title: 'Components/Hero',
  render: () => fixture,
  parameters: { componentMetadata: metadata },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Default: Story = { render: () => renderState('default') };
export const WithImage: Story = { render: () => renderState('with-image') };
export const TwoActions: Story = { render: () => renderState('two-actions') };
export const LongContent: Story = { render: () => renderState('long-content') };
