import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/language-selector.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/language-selector.html?raw';
import { initAllLanguageSelector } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Language Selector',
  render: () => fixture,
  play: ({ canvasElement }) => initAllLanguageSelector(canvasElement),
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
function state(name: string): string {
  const example = examples.examples.find((item) => item.state === name);
  if (!example) throw new globalThis.Error(`Missing canonical state: ${name}`);
  return example.html;
}
export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const MultipleLanguages: Story = {
  render: () => state('multiple-languages'),
};
export const WithoutJavaScript: Story = { play: () => {} };
