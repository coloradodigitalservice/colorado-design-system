import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/breadcrumbs.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/breadcrumbs.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/breadcrumbs.html?raw';

function renderState(state: string): string {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new Error(`Missing canonical state: ${state}`);
  return example.html;
}

const meta = {
  title: 'Components/Breadcrumbs',
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
export const LongContent: Story = { render: () => renderState('long-content') };
export const SingleLevel: Story = { render: () => renderState('single-level') };
export const Spanish: Story = { render: () => renderState('localization') };
export const RightToLeft: Story = { render: () => renderState('rtl') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLAnchorElement>('.cods-breadcrumbs__link')
      ?.focus();
  },
};

export const Inverse: Story = { render: () => renderState('inverse') };

export const Hover: Story = { render: () => renderState('hover') };
export const PreviousLevel: Story = {
  render: () => renderState('previous-level'),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
