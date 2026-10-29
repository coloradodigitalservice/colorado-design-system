import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/combo-box.html?raw';
import { initAllComboBox } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Combo Box',
  render: () => fixture,
  play: ({ canvasElement }) => initAllComboBox(canvasElement),
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
export const WithoutJavaScript: Story = { play: () => {} };
