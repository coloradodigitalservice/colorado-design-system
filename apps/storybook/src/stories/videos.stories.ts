import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/videos.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/videos.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/videos.html?raw';

const meta = {
  title: 'Components/Videos',
  render: () => fixture,
  parameters: { componentMetadata: metadata },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
const state = (name: string) => {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new Error(`Missing ${name} video`);
  return example.html;
};
export const Default: Story = { render: () => state('default') };
export const Embed: Story = { render: () => state('embed') };
export const FourThree: Story = { render: () => state('four-three') };
