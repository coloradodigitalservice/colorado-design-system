import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/input.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/input.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/input.json';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';

const meta = {
  title: 'Components/Input',
  id: 'components-input',
  render: () => fixture.replaceAll('/icons/sprite.svg', spriteUrl),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string) {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new globalThis.Error(`Missing input state: ${name}`);
  return example.html.replaceAll('/icons/sprite.svg', spriteUrl);
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const FocusVisible: Story = {
  render: () => state('focus-visible'),
  play: ({ canvasElement }) => {
    canvasElement.querySelector<HTMLInputElement>('input')?.focus();
  },
};
export const Disabled: Story = { render: () => state('disabled') };
export const Readonly: Story = { render: () => state('readonly') };
export const Error: Story = { render: () => state('error') };
export const Success: Story = { render: () => state('success') };
export const Email: Story = { render: () => state('email') };
export const Tel: Story = { render: () => state('tel') };
export const Number: Story = { render: () => state('number') };
export const Required: Story = { render: () => state('required') };
export const LongContent: Story = { render: () => state('long-content') };
export const RightToLeft: Story = { render: () => state('rtl') };
export const Icons: Story = { render: () => state('icons') };
export const Small: Story = { render: () => state('small') };
export const Large: Story = { render: () => state('large') };
export const LargeIcons: Story = { render: () => state('large-icons') };
export const Hover: Story = { render: () => state('hover') };
