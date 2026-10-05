import type { Meta, StoryObj } from '@storybook/html-vite';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/accordion.html?raw';
import { initAllAccordions } from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Accordion',
  render: () => fixture,
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
  },
  parameters: { controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function state(name: string): string {
  const document = new DOMParser().parseFromString(fixture, 'text/html');
  return document.querySelector(`[data-cods-fixture-state="${name}"]`)!
    .outerHTML;
}

export const AllStates: Story = {};
export const Default: Story = { render: () => state('default') };
export const Bordered: Story = { render: () => state('bordered') };
export const Multiple: Story = { render: () => state('multiple') };
export const Disabled: Story = { render: () => state('disabled') };
export const LongContent: Story = { render: () => state('long-content') };
export const Spanish: Story = { render: () => state('localization') };
export const RightToLeft: Story = { render: () => state('rtl') };
export const FocusVisible: Story = {
  render: () => state('default'),
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('[data-cods-accordion-trigger]')!
      .focus();
  },
};
export const WithoutJavaScript: Story = { play: () => {} };
