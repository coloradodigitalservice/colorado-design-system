import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/icon-list.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/icon-list.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/icon-list.json';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const render = (html: string) =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);
const meta = {
  title: 'Components/Icon List',
  id: 'components-icon-list',
  render: () => render(fixture),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string) {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new Error(`Missing icon list state: ${name}`);
  return render(example.html);
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const LongContent: Story = { render: () => state('long-content') };
export const RightToLeft: Story = { render: () => state('rtl') };
