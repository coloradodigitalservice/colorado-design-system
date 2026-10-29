import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/card.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/card.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/card.json';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const render = (html: string) =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);
const meta = {
  title: 'Components/Card',
  render: () => render(fixture),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string): string {
  const example = examples.examples.find((entry) => entry.state === name);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${name}`);
  return render(example.html);
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const Icon: Story = { render: () => state('icon') };
export const WithMedia: Story = { render: () => state('with-media') };
export const InternalLinks: Story = { render: () => state('internal-links') };
export const LongContent: Story = { render: () => state('long-content') };
export const RightToLeft: Story = { render: () => state('rtl') };
export const Grid: Story = { render: () => state('grid') };
