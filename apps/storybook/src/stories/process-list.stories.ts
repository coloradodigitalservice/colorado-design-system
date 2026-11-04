import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/process-list.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/process-list.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/process-list.json';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const render = (html: string) =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);
const state = (name: string) => {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new Error(`Missing process list state: ${name}`);
  return render(example.html);
};
const meta = {
  title: 'Components/Process List',
  id: 'components-process-list',
  render: () => render(fixture),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const LongContent: Story = { render: () => state('long-content') };
export const RightToLeft: Story = { render: () => state('rtl') };
export const ThreeSteps: Story = { render: () => state('three-steps') };
export const FourSteps: Story = { render: () => state('four-steps') };
export const FiveSteps: Story = { render: () => state('five-steps') };
export const WithAlert: Story = { render: () => state('with-alert') };
