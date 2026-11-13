import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/footer.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/footer.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/footer.html?raw';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import { initAllFooters } from '@coloradodigitalservice/colorado-design-system';

function renderMarkup(markup: string): string {
  return markup.replaceAll('/icons/sprite.svg', spriteUrl);
}

function renderState(state: string): string {
  const example = examples.examples.find((example) => example.state === state);
  if (!example) throw new Error(`Missing canonical footer state: ${state}`);
  return renderMarkup(example.html);
}

const meta = {
  title: 'Components/Footer',
  render: () => renderMarkup(fixture),
  parameters: {
    componentMetadata: metadata,
    controls: { disable: true },
    actions: { disable: true },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const AllStates: Story = {};
export const Full: Story = {
  render: () => renderState('full'),
  play: ({ canvasElement }) => initAllFooters(canvasElement),
};
export const Compact: Story = { render: () => renderState('compact') };
export const WithoutJavaScript: Story = { play: () => {} };
