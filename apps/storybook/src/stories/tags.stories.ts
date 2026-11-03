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
export const Default: Story = {
  render: () => {
    const example = examples.examples.find((item) => item.state === 'default');
    if (!example) throw new Error('Missing canonical default state');
    return example.html;
  },
};
