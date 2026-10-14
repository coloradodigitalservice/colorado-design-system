import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/link.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/link.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/link.html?raw';

function renderState(state: string): string {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new Error(`Missing canonical state: ${state}`);
  return example.html;
}
const meta = {
  title: 'Components/Link',
  render: () => fixture,
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Default: Story = { render: () => renderState('default') };
export const Standalone: Story = { render: () => renderState('standalone') };
export const MoreLink: Story = { render: () => renderState('more-link') };
export const External: Story = { render: () => renderState('external') };
export const Hover: Story = { render: () => renderState('hover') };
export const Active: Story = { render: () => renderState('active') };
export const Visited: Story = { render: () => renderState('visited') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLAnchorElement>('.cods-link')?.focus();
  },
};
export const LongContent: Story = { render: () => renderState('long-content') };
export const Spanish: Story = { render: () => renderState('localization') };
export const RightToLeft: Story = { render: () => renderState('rtl') };
export const InlineSmall: Story = { render: () => renderState('inline-small') };
export const InlineLarge: Story = { render: () => renderState('inline-large') };
export const StandaloneSmall: Story = {
  render: () => renderState('standalone-small'),
};
export const PrefixIcon: Story = { render: () => renderState('prefix-icon') };
