import './search.stories.css';
import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/search.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/search.json';
import examples from '@coloradodigitalservice/colorado-design-system/examples/search.json';
import spriteUrl from '@coloradodigitalservice/colorado-design-system/icons/sprite.svg?url';
const render = (html: string) =>
  html.replaceAll('/icons/sprite.svg', spriteUrl);
const meta = {
  title: 'Components/Search',
  render: () =>
    `<div class="cods-search-story-examples">${render(fixture)}</div>`,
  parameters: { componentMetadata: metadata },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const state = (name: string) =>
  render(examples.examples.find((item) => item.state === name)!.html);
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const Compact: Story = { render: () => state('compact') };
export const Slim: Story = { render: () => state('slim') };
