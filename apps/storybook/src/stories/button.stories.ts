import type { Meta, StoryObj } from '@storybook/html-vite';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import examples from '@coloradodigitalservice/colorado-design-system/examples/button.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/button.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/button.html?raw';

function renderState(state: string) {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new Error(`Missing canonical Button state: ${state}`);
  return example.html.replaceAll('/icons/sprite.svg', spriteUrl);
}

export default {
  title: 'Components/Button',
  render: () => fixture.replaceAll('/icons/sprite.svg', spriteUrl),
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;
type Story = StoryObj;
export const AllStates: Story = {};
export const Default: Story = { render: () => renderState('default') };
export const Secondary: Story = { render: () => renderState('secondary') };
export const Danger: Story = { render: () => renderState('danger') };
export const Slim: Story = { render: () => renderState('slim') };
export const IconOnly: Story = { render: () => renderState('icon-only') };
export const IconOnlySecondary: Story = {
  render: () => renderState('icon-only-secondary'),
};
export const IconOnlySlim: Story = {
  render: () => renderState('icon-only-slim'),
};
export const IconOnlySecondarySlim: Story = {
  render: () => renderState('icon-only-secondary-slim'),
};
export const Link: Story = { render: () => renderState('link') };
export const PrimaryMediumIconStart: Story = {
  render: () => renderState('primary-medium-icon-start'),
};
export const PrimaryMediumIconEnd: Story = {
  render: () => renderState('primary-medium-icon-end'),
};
export const PrimaryMediumIconBoth: Story = {
  render: () => renderState('primary-medium-icon-both'),
};
export const PrimarySlimIconStart: Story = {
  render: () => renderState('primary-slim-icon-start'),
};
export const PrimarySlimIconEnd: Story = {
  render: () => renderState('primary-slim-icon-end'),
};
export const PrimarySlimIconBoth: Story = {
  render: () => renderState('primary-slim-icon-both'),
};
export const SecondaryMediumIconStart: Story = {
  render: () => renderState('secondary-medium-icon-start'),
};
export const SecondaryMediumIconEnd: Story = {
  render: () => renderState('secondary-medium-icon-end'),
};
export const SecondaryMediumIconBoth: Story = {
  render: () => renderState('secondary-medium-icon-both'),
};
export const SecondarySlimIconStart: Story = {
  render: () => renderState('secondary-slim-icon-start'),
};
export const SecondarySlimIconEnd: Story = {
  render: () => renderState('secondary-slim-icon-end'),
};
export const SecondarySlimIconBoth: Story = {
  render: () => renderState('secondary-slim-icon-both'),
};
export const DangerMediumIconStart: Story = {
  render: () => renderState('danger-medium-icon-start'),
};
export const DangerMediumIconEnd: Story = {
  render: () => renderState('danger-medium-icon-end'),
};
export const DangerMediumIconBoth: Story = {
  render: () => renderState('danger-medium-icon-both'),
};
export const DangerSlimIconStart: Story = {
  render: () => renderState('danger-slim-icon-start'),
};
export const DangerSlimIconEnd: Story = {
  render: () => renderState('danger-slim-icon-end'),
};
export const DangerSlimIconBoth: Story = {
  render: () => renderState('danger-slim-icon-both'),
};
export const Hover: Story = { render: () => renderState('hover') };
export const Active: Story = { render: () => renderState('active') };
export const FocusVisible: Story = {
  render: () => renderState('focus-visible'),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('button')?.focus();
  },
};
export const Disabled: Story = { render: () => renderState('disabled') };
export const LongContent: Story = { render: () => renderState('long-content') };
export const RightToLeft: Story = { render: () => renderState('rtl') };
