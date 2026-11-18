import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/modal.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/modal.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/modal.html?raw';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
import {
  destroyModal,
  initModal,
} from '@coloradodigitalservice/colorado-design-system';

const withSprite = (html: string): string =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);

/**
 * Roots enhanced by the current story. The controller moves each dialog into
 * a wrapper on `document.body`, outside the canvas Storybook replaces, so
 * switching stories would otherwise leave wrappers, duplicate ids and any open
 * dialog's page lock behind to hide the next story.
 */
const mounted = new Set<HTMLElement>();

function cleanUp(): void {
  mounted.forEach(destroyModal);
  mounted.clear();
}

const meta = {
  title: 'Components/Modal',
  render: () => withSprite(fixture),
  // Storybook runs the returned function before the next story renders.
  beforeEach: () => cleanUp,
  // The story root is mounted by `play`; the controller resolves the dialog by
  // id and moves it to the document body, so it needs the root attached.
  play: ({ canvasElement }) => {
    canvasElement
      .querySelectorAll<HTMLElement>('[data-cods-modal]')
      .forEach((root) => {
        initModal(root);
        mounted.add(root);
      });
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
