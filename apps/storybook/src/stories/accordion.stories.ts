import type { Meta, StoryObj } from '@storybook/html-vite';
import examples from '@coloradodigitalservice/colorado-design-system/examples/accordion.json';
import metadata from '@coloradodigitalservice/colorado-design-system/metadata/accordion.json';
import fixture from '@coloradodigitalservice/colorado-design-system/fixtures/accordion.html?raw';
import {
  initAllAccordions,
  setAccordionExpanded,
} from '@coloradodigitalservice/colorado-design-system';

const meta = {
  title: 'Components/Accordion',
  render: () => fixture,
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
  },
  parameters: { componentMetadata: metadata, controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function state(name: string): string {
  const example = examples.examples.find((example) => example.state === name);
  if (!example) throw new Error(`Missing canonical state: ${name}`);
  return example.html;
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
  render: () => state('focus-visible'),
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
    canvasElement
      .querySelector<HTMLButtonElement>('[data-cods-accordion-trigger]')!
      .focus();
  },
};
export const WithoutJavaScript: Story = { play: () => {} };

export const Expanded: Story = {
  render: () => state('expanded'),
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-cods-accordion]',
    )!;
    setAccordionExpanded(
      root,
      root
        .querySelector<HTMLButtonElement>('button')!
        .getAttribute('aria-controls')!,
      true,
    );
  },
};
export const Collapsed: Story = {
  render: () => state('collapsed'),
  play: ({ canvasElement }) => {
    initAllAccordions(canvasElement);
    const root = canvasElement.querySelector<HTMLElement>(
      '[data-cods-accordion]',
    )!;
    setAccordionExpanded(
      root,
      root
        .querySelector<HTMLButtonElement>('button')!
        .getAttribute('aria-controls')!,
      false,
    );
  },
};
