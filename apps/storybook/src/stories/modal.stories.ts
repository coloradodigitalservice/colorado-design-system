import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/modal.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/modal.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/modal.html?raw';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import { initAllModal } from '@coloradodigitalservice/colorado-design-system';

const withSprite = (html: string): string =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);

const meta = {
  title: 'Components/Modal',
  render: () => withSprite(fixture),
  // The story root is mounted by `play`; the controller resolves the dialog by
  // id and moves it to the document body, so it needs the root attached.
  play: ({ canvasElement }) => {
    initAllModal(canvasElement);
  },
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function state(name: string): string {
  const example = examples.examples.find((example) => example.state === name);
  if (!example) throw new Error(`Missing canonical state: ${name}`);
  return withSprite(example.html);
}

export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const ForcedAction: Story = { render: () => state('forced-action') };
export const Large: Story = { render: () => state('large') };
