import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/language-selector.html?raw';
import { initAllLanguageSelector } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Language Selector',
  render: () => fixture,
  play: ({ canvasElement }) => initAllLanguageSelector(canvasElement),
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
export const WithoutJavaScript: Story = { play: () => {} };
