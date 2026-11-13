import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/in-page-navigation.html?raw';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/in-page-navigation.json';
import { initAllInPageNavigation } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/In-Page Navigation',
  render: () => fixture,
  play: ({ canvasElement }) => initAllInPageNavigation(canvasElement),
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithoutJavaScript: Story = { play: () => {} };
